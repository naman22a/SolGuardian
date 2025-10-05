'use client';
import axios from 'axios';
import { useEffect } from 'react';
import { Lock, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';
import { AuditResponse } from '@/interfaces';
import { AuditResults } from '@/components/AuditResults';
import { ProcessingState } from '@/components/ProcessingState';
import FileUpload from '@/components/FileUpload';

function Home() {
    const {
        data,
        setData,
        appState,
        file,
        setFile,
        setAppState,
        setOriginalCode,
        originalCode
    } = useStore();

    useEffect(() => {
        const socket = getSocket();
        socket.on('audit:done', (data: any) => {
            setData(data.report);
            setAppState('results');
        });

        return () => {
            socket.off('audit:done');
        };
    }, []);

    const handleFileSelect = (file: File) => {
        setFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setOriginalCode(content);
        };

        reader.readAsText(file);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setOriginalCode('');
    };

    const handleStartAudit = async () => {
        setAppState('processing');

        await new Promise((resolve) => setTimeout(resolve, 7000));

        const socket = getSocket();
        if (!socket.id) {
            toast.error('Socket not connected yet. Please wait a moment.', {
                style: { backgroundColor: 'red', color: 'white' }
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file!);
            formData.append('socketId', socket.id!);

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/audit`,
                formData
            );

            if (res.status === 200) {
                const data = res.data as AuditResponse;
                console.log(data.jobId);
            } else {
                toast.error('Something went wrong', {
                    style: { backgroundColor: 'red', color: 'white' }
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong', {
                style: { backgroundColor: 'red', color: 'white' }
            });
        }
    };

    const handleReAnalyze = async (code: string) => {
        setOriginalCode(code);
        setAppState('processing');

        await new Promise((resolve) => setTimeout(resolve, 7000));

        const socket = getSocket();
        if (!socket.id) {
            toast.error('Socket not connected yet. Please wait a moment.', {
                style: { backgroundColor: 'red', color: 'white' }
            });
            return;
        }

        try {
            const formData = new FormData();
            const blob = new Blob([code], { type: 'text/plain' });
            const file = new File([blob], 'code.sol', { type: 'text/plain' });

            formData.append('file', file!);
            formData.append('socketId', socket.id!);

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/audit`,
                formData
            );

            if (res.status === 200) {
                const data = res.data as AuditResponse;
                console.log(data.jobId);
            } else {
                toast.error('Something went wrong', {
                    style: { backgroundColor: 'red', color: 'white' }
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong', {
                style: { backgroundColor: 'red', color: 'white' }
            });
        }
    };

    return (
        <main className="flex flex-col items-center justify-center pt-20">
            {appState === 'upload' && (
                <>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-500/70 bg-clip-text text-transparent mb-5">
                        Secure Your Smart Contracts
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Advanced AI-powered security analysis to identify
                        vulnerabilities in your Solidity code
                    </p>

                    <div className="my-8"></div>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-card to-secondary border border-border">
                            <CardContent className="p-6 text-center">
                                <div className="p-3 bg-green-500/10 rounded-full mx-auto mb-4 w-fit">
                                    <Zap className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Lightning Fast
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Get comprehensive audit results in seconds,
                                    not days
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-card to-secondary border border-border">
                            <CardContent className="p-6 text-center">
                                <div className="p-3 bg-green-500/10 rounded-full mx-auto mb-4 w-fit">
                                    <Shield className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Advanced Detection
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    AI-powered analysis covering 100+
                                    vulnerability patterns
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-card to-secondary border border-border">
                            <CardContent className="p-6 text-center">
                                <div className="p-3 bg-green-500/10 rounded-full mx-auto mb-4 w-fit">
                                    <Lock className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Secure & Private
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Your code is processed securely and never
                                    stored
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6 min-w-2xl">
                        <FileUpload
                            onFileSelect={handleFileSelect}
                            selectedFile={file}
                            handleRemoveFile={handleRemoveFile}
                        />

                        {file && (
                            <div className="text-center">
                                <Button
                                    onClick={handleStartAudit}
                                    className="bg-gradient-to-r from-green-500 to-green-500/80 hover:from-green-500/90 hover:to-green-500/70 text-green-500-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Shield className="w-5 h-5 mr-2" />
                                    Start Security Audit
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {appState === 'processing' && (
                <div className="max-w-2xl mx-auto">
                    <ProcessingState />
                </div>
            )}

            {appState === 'results' && (
                <div className="max-w-4xl mx-auto mb-10">
                    <AuditResults
                        result={data!}
                        originalCode={originalCode}
                        onReAnalyze={handleReAnalyze}
                    />
                </div>
            )}
        </main>
    );
}

export default Home;
