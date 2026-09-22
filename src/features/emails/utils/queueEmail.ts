import { Queue } from 'bullmq';
import Redis from 'ioredis';

import logger from '@/lib/logger';

type EmailType =
  | 'addPayment'
  | 'announceWinners'
  | 'application'
  | 'commentSponsor'
  | 'commentActivity'
  | 'createListing'
  | 'createHackathon'
  | 'deadlineExtended'
  | 'submissionRejected'
  | 'submissionLike'
  | 'applicationLike'
  | 'powLike'
  | 'submissionSponsor'
  | 'submissionTalent'
  | 'grantApproved'
  | 'grantCompleted'
  | 'grantRejected'
  | 'trancheApproved'
  | 'trancheRejected'
  | 'grantPaymentReceived'
  | 'STWinners'
  | 'nonSTWinners'
  | 'commentReply'
  | 'commentTag'
  | 'scoutInvite'
  | 'spamCredit'
  | 'telegramNewListing';

interface EmailNotificationParams {
  type: EmailType;
  id: string;
  userId?: string;
  otherInfo?: any;
  triggeredBy: any;
  delay?: number;
}

// Queues need a Redis worker; without REDIS_URL jobs are logged and dropped.
let logicQueue: Queue | null = null;
function getQueue() {
  if (!process.env.REDIS_URL) return null;
  logicQueue ??= new Queue('logicQueue', {
    connection: new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }),
  });
  return logicQueue;
}

export async function queueEmail({
  type,
  id,
  userId, // pass userId of the person you are sending the email to
  otherInfo,
  triggeredBy,
  delay,
}: EmailNotificationParams): Promise<void> {
  logger.info(
    `Queueing email notification: type=${type}, userId=${userId}, id=${id}, triggeredBy=${triggeredBy}`,
  );

  try {
    const queue = getQueue();
    if (!queue) {
      logger.warn(`Queue disabled, skipping job type=${type}`);
      return;
    }
    const job = await queue.add(
      'processLogic',
      {
        type,
        id,
        userId,
        otherInfo,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        priority: 1,
        removeOnComplete: true,
        removeOnFail: 500,
        delay,
      },
    );

    logger.info(
      `Email notification queued successfully: jobId=${job.id}, type=${type}, userId=${userId}`,
    );

    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error({
      message: `Failed to queue email notification: type=${type}, userId=${userId}, id=${id}`,
      error: errorMessage,
      stack: errorStack,
      metadata: { type, id, userId },
    });

    throw new Error(`Failed to queue email notification: ${errorMessage}`);
  }
}
