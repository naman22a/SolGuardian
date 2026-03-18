import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';
import { getCodeHash } from './utils';
import { Queue } from 'bullmq';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { redis, sub } from './redis';
import mongoose from 'mongoose';
import { SubmissionModel } from './models/Submission';
import { ScanResultModel } from './models/ScanResult';

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

console.log('Uploads directory ready:', uploadDir);

mongoose.connect(process.env.MONGO_URI as string).then(() => {
    console.log('MongoDB connected');
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
});
const port = process.env.PORT ?? 5000;
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });
const auditQueue = new Queue('audit', {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
    },
});

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.post(
    '/audit',
    upload.single('file'),
    async (req: Request, res: Response) => {
        const { socketId } = req.body;

        if (!req.file) {
            res.status(400).json({ message: 'no file uploaded' });
            return;
        }

        const fileName = req.file.filename;
        const filePath = req.file.path;

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (!fileContent.trim()) {
            res.status(400).json({ message: 'file is empty' });
            return;
        }

        const submission = await SubmissionModel.create({
            contractName: req.file.originalname,
            code: fileContent,
            pragma: 'unknown',
        });

        const hash = getCodeHash(fileContent);
        const cached = await redis.get(`audit:${hash}`);
        if (cached) {
            io.to(socketId).emit('audit:done', {
                cached: true,
                report: JSON.parse(cached),
            });
            res.json({ cached: true, jobId: null });
            return;
        }

        const job = await auditQueue.add('audit-solidity', {
            submissionId: submission._id,
            fileName,
            filePath,
            fileContent,
            hash,
            socketId,
        });

        res.json({ cached: false, jobId: job.id });
    },
);

app.get('/submissions', async (_req: Request, res: Response) => {
    const submissions = await SubmissionModel.find().lean();
    res.status(200).json(submissions);
});

app.get('/results', async (_req: Request, res: Response) => {
    const results = await ScanResultModel.find().lean();
    res.status(200).json(results);
});

sub.psubscribe('audit:done:*', (err, _count) => {
    if (err) throw err;
});

sub.on('pmessage', (_pattern, channel, message) => {
    const [, , socketId] = channel.split(':');
    const data = JSON.parse(message);
    console.log(`📤 Emitting to ${socketId}:`, data);
    io.to(socketId!).emit('audit:done', data);
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
});

httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
