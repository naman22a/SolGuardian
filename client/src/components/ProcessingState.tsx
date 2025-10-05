import { Loader2, Shield, Search, FileCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

export const ProcessingState = () => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { icon: FileCode, label: 'Parsing Solidity code...', duration: 2000 },
        {
            icon: Search,
            label: 'Analyzing for vulnerabilities...',
            duration: 3000
        },
        { icon: Shield, label: 'Generating security report...', duration: 2000 }
    ];

    useEffect(() => {
        let progressTimer: NodeJS.Timeout;
        let stepTimer: NodeJS.Timeout;

        const startProgress = () => {
            progressTimer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(progressTimer);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 70);
        };

        const startStepCycle = () => {
            let totalTime = 0;
            steps.forEach((step, index) => {
                setTimeout(() => {
                    setCurrentStep(index);
                }, totalTime);
                totalTime += step.duration;
            });
        };

        startProgress();
        startStepCycle();

        return () => {
            clearInterval(progressTimer);
            // @ts-ignore
            clearTimeout(stepTimer);
        };
    }, []);

    const CurrentIcon = steps[currentStep]?.icon || FileCode;

    return (
        <Card className="bg-gradient-to-br from-card to-secondary border border-border">
            <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        <div className="p-4 bg-green-500/10 rounded-full animate-pulse">
                            <CurrentIcon className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-full">
                            <Loader2 className="w-4 h-4 text-green-500-foreground animate-spin" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                            Auditing Your Contract
                        </h3>
                        <p className="text-muted-foreground">
                            {steps[currentStep]?.label || 'Processing...'}
                        </p>
                    </div>

                    <div className="w-full max-w-sm space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            {progress}% complete
                        </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            return (
                                <div
                                    key={index}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                                        index === currentStep
                                            ? 'bg-green-500/10 text-green-500'
                                            : index < currentStep
                                            ? 'bg-success/10 text-success'
                                            : 'bg-muted/50 text-muted-foreground'
                                    }`}
                                >
                                    <StepIcon className="w-4 h-4" />
                                    <span className="text-xs font-medium hidden sm:inline">
                                        Step {index + 1}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
