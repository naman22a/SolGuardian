import { Schema } from 'mongoose';
import { ICategory, CategorySchema } from './Category';

export interface IAnalysisResult {
    name: string;
    pragma: string;
    categories: ICategory[];
}

export const AnalysisResultSchema = new Schema<IAnalysisResult>(
    {
        name: {
            type: String,
            required: true,
        },
        pragma: {
            type: String,
            required: true,
        },
        categories: {
            type: [CategorySchema],
            required: true,
        },
    },
    { _id: false },
);
