import { Schema, model, Document, Types } from 'mongoose';
import { AnalysisResultSchema, IAnalysisResult } from './AnalysisResult';

export interface IScanResult extends Document {
    submissionId: Types.ObjectId;
    analyzer: string;
    analysisResult: IAnalysisResult;
    createdAt: Date;
}

const ScanResultSchema = new Schema<IScanResult>({
    submissionId: {
        type: Schema.Types.ObjectId,
        ref: 'Submission',
        required: true,
    },
    analyzer: {
        type: String,
        required: true,
    },
    analysisResult: {
        type: AnalysisResultSchema,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const ScanResultModel = model<IScanResult>(
    'ScanResult',
    ScanResultSchema,
);
