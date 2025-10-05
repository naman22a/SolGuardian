import 'dotenv/config';
import { Worker } from 'bullmq';
import { analyzeFile, SchemaType } from './utils';
import { redis } from './redis';

new Worker(
    'audit',
    async (job) => {
        const { fileName, filePath, fileContent, hash, socketId } = job.data;

        console.log(`Analyzing file: ${fileName}`);
        console.log(`File size: ${fileContent.length} characters`);
        let auditReport: SchemaType;

        try {
            const cachedResult = await redis.get(`audit:${hash}`);
            if (cachedResult) {
                auditReport = JSON.parse(cachedResult);
            } else {
                auditReport = await analyzeFile(
                    filePath,
                    fileName,
                    fileContent,
                );
                // auditReport = {
                //     name: 'FibonacciBalance',
                //     pragma: '^0.4.22',
                //     categories: [
                //         {
                //             type: 'access_control',
                //             lines: [31, 38],
                //             confidence: 0.95,
                //             explanation:
                //                 "The contract has a vulnerability in the 'withdraw' function that allows an attacker to call the 'setFibonacci' function with any value for 'n', potentially leading to a denial of service attack."
                //         }
                //     ]
                // };
            }
        } catch (error) {
            console.error(error);
            return;
        }
        console.log('\nAnalysis result:');
        console.log(JSON.stringify(auditReport, null, 2));
        console.log('\nCategories found:', auditReport.categories.length);
        auditReport.categories.forEach((cat, index) => {
            console.log(
                `Category ${index + 1}: ${cat.type} (${
                    cat.lines.length
                } lines, confidence: ${(cat.confidence * 100).toFixed(1)}%)`,
            );
        });

        await redis.set(
            `audit:${hash}`,
            JSON.stringify(auditReport),
            'EX',
            60 * 60 * 24, // 24 hrs
        );

        if (socketId) {
            await redis.publish(
                `audit:done:${socketId}`,
                JSON.stringify({ cached: false, report: auditReport }),
            );
        }

        return auditReport;
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT, 10),
        },
    },
);
