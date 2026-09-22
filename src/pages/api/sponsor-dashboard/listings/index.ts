import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { GrantStatus, status } from '@/prisma/enums';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';

type BountyGrant = {
  type: 'bounty' | 'grant';
  id: string;
  title: string;
  slug: string;
  token: string | null;
  status: string;
  deadline: Date | null;
  isPublished: boolean;
  publishedAt: Date | null;
  rewards: any;
  rewardAmount: number | null;
  totalPaymentsMade: number;
  isWinnersAnnounced: boolean | null;
  maxRewardAsk: number | null;
  minRewardAsk: number | null;
  maxBonusSpots: number | null;
  compensationType: string | null;
  createdAt: Date;
  submissionCount: number;
  isFndnPaying: string;
  isPro: boolean;
};

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userSponsorId = req.userSponsorId;
  try {
    const data: BountyGrant[] = await prisma.$queryRawUnsafe(
      `
      WITH combined_data AS (
        SELECT 
          b.type::text as type,
          b.id,
          b.title,
          b.slug,
          b.token,
          b.status::text as status,
          b.deadline,
          b.isPublished as "isPublished",
          b.publishedAt as "publishedAt",
          b.rewards,
          b.rewardAmount as "rewardAmount",
          (SELECT COUNT(*) FROM Submission s WHERE s.listingId = b.id AND s.isPaid = true)::float as "totalPaymentsMade",
          b.maxBonusSpots as "maxBonusSpots",
          b.isWinnersAnnounced as "isWinnersAnnounced",
          b.maxRewardAsk as "maxRewardAsk",
          b.minRewardAsk as "minRewardAsk",
          b.compensationType::text as "compensationType",
          b.createdAt as "createdAt",
          b.isFndnPaying as "isFndnPaying",
          b.usdValue as "usdValue",
          b.isPro as "isPro",
          NULL::text as "airtableId",
          (SELECT COUNT(*) FROM Submission s WHERE s.listingId = b.id)::int as "submissionCount"
        FROM Bounties b
        WHERE b.isActive = true
        AND b.isArchived = false
        AND b.sponsorId = $1
        AND b.status::text <> $2

        UNION ALL

        SELECT 
          'grant' as type,
          g.id,
          g.title,
          g.slug,
          g.token,
          g.status::text as status,
          NULL as deadline,
          g.isPublished,
          NULL as "publishedAt",
          NULL as rewards,
          NULL as "rewardAmount",
          g.totalPaid::float as "totalPaymentsMade",
          NULL as "maxBonusSpots",
          NULL as "isWinnersAnnounced",
          g.maxReward as "maxRewardAsk",
          g.minReward as "minRewardAsk",
          NULL as "compensationType",
          g.createdAt,
          NULL as "isFndnPaying",
          NULL as "usdValue",
          false as "isPro",
          g.airtableId,
          (SELECT COUNT(*) FROM GrantApplication ga WHERE ga.grantId = g.id)::int as "submissionCount"
        FROM Grants g
        WHERE g.isActive = true
        AND g.isArchived = false
        AND g.sponsorId = $3
        AND g.status::text = $4
      )
      SELECT *
      FROM combined_data
      ORDER BY "createdAt" DESC
    `,
      userSponsorId,
      status.CLOSED,
      userSponsorId,
      GrantStatus.OPEN,
    );

    const serializedData = data.map((item) => ({
      ...item,
      submissionCount: Number(item.submissionCount),
      isFndnPaying: Boolean(Number(item.isFndnPaying)),
      isPro: Boolean(Number(item.isPro)),
    }));

    logger.info(
      `Successfully fetched bounties and grants for sponsor ${userSponsorId}`,
    );
    res.status(200).json(serializedData);
  } catch (err: any) {
    logger.error(
      `Error fetching bounties and grants for sponsor ${userSponsorId}: ${err.message}`,
    );
    res
      .status(400)
      .json({ err: 'Error occurred while fetching bounties and grants.' });
  }
}

export default withSponsorAuth(handler);
