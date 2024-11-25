import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
  }
}

export { };
