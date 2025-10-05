import {
    AlertTriangle,
    Shield,
    Info,
    FileText,
    Play,
    Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface AuditCategory {
    type: string;
    lines: number[];
    confidence: number;
    explanation: string;
}

interface AuditResult {
    name: string;
    pragma: string;
    categories: AuditCategory[];
}

interface AuditResultsProps {
    result: AuditResult;
    originalCode?: string;
    onReAnalyze?: (code: string) => void;
}

const getSeverityInfo = (confidence: number) => {
    if (confidence >= 0.9) {
        return {
            level: 'High',
            color: 'destructive',
            icon: AlertTriangle,
            bgClass: 'bg-destructive/10 border-destructive/20'
        };
    } else if (confidence >= 0.7) {
        return {
            level: 'Medium',
            color: 'warning',
            icon: AlertTriangle,
            bgClass: 'bg-warning/10 border-warning/20'
        };
    } else {
        return {
            level: 'Low',
            color: 'info',
            icon: Info,
            bgClass: 'bg-info/10 border-info/20'
        };
    }
};

const formatVulnerabilityType = (type: string) => {
    return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const AuditResults = ({
    result,
    originalCode = '',
    onReAnalyze
}: AuditResultsProps) => {
    const vulnerabilityCount = result.categories.length;
    const highSeverityCount = result.categories.filter(
        (cat) => cat.confidence >= 0.9
    ).length;
    const [editedCode, setEditedCode] = useState(originalCode);
    const [isEditing, setIsEditing] = useState(false);

    const handleReAnalyze = () => {
        if (onReAnalyze && editedCode.trim()) {
            onReAnalyze(editedCode);
        }
    };

    return (
        <div className="space-y-6">
            {/* Code Editor Section */}
            <Card className="bg-gradient-to-br from-card to-secondary border border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Edit className="w-5 h-5 text-green-500" />
                            </div>
                            Solidity Code Editor
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-xs"
                            >
                                {isEditing ? 'Save' : 'Edit'}
                            </Button>
                            {onReAnalyze && (
                                <Button
                                    onClick={handleReAnalyze}
                                    disabled={!editedCode.trim()}
                                    className="text-xs"
                                    size="sm"
                                >
                                    <Play className="w-4 h-4 mr-1" />
                                    Re-Analyze
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={editedCode}
                        onChange={(e) => setEditedCode(e.target.value)}
                        placeholder="Paste your Solidity code here..."
                        className="min-h-[300px] font-mono text-sm bg-background/50"
                        readOnly={!isEditing}
                    />
                </CardContent>
            </Card>
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-card to-secondary border border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Shield className="w-5 h-5 text-green-500" />
                        </div>
                        Audit Results
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-background/50 rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                                {vulnerabilityCount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Issues Found
                            </div>
                        </div>
                        <div className="text-center p-4 bg-background/50 rounded-lg">
                            <div className="text-2xl font-bold text-destructive">
                                {highSeverityCount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                High Severity
                            </div>
                        </div>
                        <div className="text-center p-4 bg-background/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">
                                ✓
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Scan Complete
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                                {result.name}
                            </span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                            {result.pragma}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Vulnerabilities */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                    Detected Vulnerabilities
                </h3>
                {result.categories.map((category, index) => {
                    const severity = getSeverityInfo(category.confidence);
                    const IconComponent = severity.icon;

                    return (
                        <Card
                            key={index}
                            className={`${severity.bgClass} border`}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <IconComponent
                                            className={`w-5 h-5 text-${severity.color}`}
                                        />
                                        <span className="text-base">
                                            {formatVulnerabilityType(
                                                category.type
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                severity.color === 'destructive'
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                            className="text-xs"
                                        >
                                            {severity.level} Risk
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-mono"
                                        >
                                            {Math.round(
                                                category.confidence * 100
                                            )}
                                            % confidence
                                        </Badge>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-foreground/90 mb-3 leading-relaxed">
                                    {category.explanation}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        Affected lines:
                                    </span>
                                    {category.lines.map((line, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="outline"
                                            className="text-xs font-mono"
                                        >
                                            {line}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
