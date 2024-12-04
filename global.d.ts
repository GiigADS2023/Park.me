import { PrismaClient } from '@prisma/client';

declare global {
  // Add 'prisma' property to the global object (typeof globalThis)
  var prisma: PrismaClient | undefined;
}

// This line ensures that the file is treated as a module and the augmentations are applied.
export { };

