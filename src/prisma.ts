import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/prisma/client';

const omitConfig = {
  user: {
    kycCountry: true,
    kycAddress: true,
    kycDOB: true,
    kycIDNumber: true,
    kycIDType: true,
    kycName: true,
  },
};

// Neon Postgres (pooled connection string)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prismaClient = new PrismaClient({
  adapter,
  omit: omitConfig,
  transactionOptions: { maxWait: 5000, timeout: 15000 },
});

declare const globalThis: { prismaGlobal: typeof prismaClient } & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClient;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
