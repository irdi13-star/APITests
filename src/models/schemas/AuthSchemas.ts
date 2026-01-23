import { z } from 'zod';

export const AuthResponseSchema = z.object({
    token: z.string().optional(),
    reason: z.string().optional()
});