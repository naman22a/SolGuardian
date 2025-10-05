import { z } from 'zod';

const schema = z.object({
    name: z.string(),
    pragma: z.string(),
    categories: z.array(
        z.object({
            type: z.string(),
            lines: z.array(z.number()),
            confidence: z.number().min(0).max(1),
            explanation: z.string()
        })
    )
});

export type SchemaType = z.infer<typeof schema>;

export type AuditResponse = {
    cached: boolean;
    jobId: number;
};
