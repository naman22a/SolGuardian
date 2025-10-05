'use client';
import React from 'react';
import { Shield } from 'lucide-react';
import { useStore } from '@/store';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';

const Header: React.FC = () => {
    const { appState, setFile, setAppState, setOriginalCode } = useStore();
    const handleNewAudit = () => {
        setAppState('upload');
        setFile(null);
        setOriginalCode('');
    };

    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">SolGuardian</h1>
                            <p className="text-xs text-muted-foreground">
                                Smart Contract Security Auditor
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <ModeToggle />
                        {appState === 'results' && (
                            <Button onClick={handleNewAudit} variant="outline">
                                New Audit
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
