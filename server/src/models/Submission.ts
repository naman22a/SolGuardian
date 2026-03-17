import { Schema, model, Document } from 'mongoose';

export interface ISubmission extends Document {
    contractName: string;
    code: string;
    pragma: string;
    fileName?: string;
    createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
    contractName: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    pragma: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const SubmissionModel = model<ISubmission>(
    'Submission',
    SubmissionSchema,
);
