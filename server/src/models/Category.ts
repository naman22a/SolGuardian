import { Schema } from 'mongoose';

export interface ICategory {
    type: string;
    lines: number[];
    confidence: number;
    explanation: string;
}

export const CategorySchema = new Schema<ICategory>(
    {
        type: {
            type: String,
            required: true,
        },
        lines: {
            type: [Number],
            required: true,
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
        },
        explanation: {
            type: String,
            required: true,
        },
    },
    { _id: false },
);
