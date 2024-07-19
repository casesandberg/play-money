import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));