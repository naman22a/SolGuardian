'use client';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';

interface Props {
    selectedFile: File | null;
    onFileSelect: (file: File) => void;
    handleRemoveFile: () => void;
}

const FileUpload: React.FC<Props> = ({
    handleRemoveFile,
    onFileSelect,
    selectedFile
}) => {
    const { appState } = useStore();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        onFileSelect(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.sol']
        },
        multiple: false,
        disabled: appState === 'processing'
    });

    if (appState === 'processing') {
        return <p>Loading...</p>;
    }

    if (selectedFile) {
        return (
            <Card className="p-6 bg-gradient-to-br from-card to-secondary border border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <FileText className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="font-mono text-sm font-medium">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    {appState === 'upload' && (
                        <Button
                            onClick={handleRemoveFile}
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card
                {...getRootProps()}
                className={`
        p-8 border-2 border-dashed cursor-pointer transition-all duration-300
        ${
            isDragActive
                ? 'border-green-500 bg-green-500/5 shadow-[0_0_20px_hsl(var(--green-500)/0.2)]'
                : 'border-border hover:border-green-500/50 hover:bg-card/50'
        }
      `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-4 bg-green-500/10 rounded-full">
                        <Upload className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">
                            {isDragActive
                                ? 'Drop your Solidity file here'
                                : 'Upload Solidity Contract'}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Drag and drop your .sol file or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Supports .sol files up to 10MB
                        </p>
                    </div>
                </div>
            </Card>
        </>
    );
};

export default FileUpload;
