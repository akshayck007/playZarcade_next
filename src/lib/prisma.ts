import { PrismaClient } from '@prisma/client';

export const getPrisma = () => {
  return new PrismaClient();
};
