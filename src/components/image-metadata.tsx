import { useState } from 'react';
import { useImageMetadata } from '@/hooks/use-image-metadata';
import { NormalizedImageMetadata } from '@/types/docker-metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Loader2,
    RefreshCw,
    Package,
    HardDrive,
    Calendar,
    Terminal,
    Tag,
    Layers,
    Settings,
    User,
    FolderOpen,
    Network,
    History,
    ChevronDown,
    ChevronRight,
    Info,
    Database
} from 'lucide-react';
import { TruncatedTextTooltip } from './ui/tooltip';

interface ImageMetadataProps {
    repository: string;
    tag: string;
}

export function ImageMetadata({ repository, tag }: ImageMetadataProps) {
    const [selectedPlatformIndex, setSelectedPlatformIndex] = useState<number | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        layers: false,
        history: false,
        config: false,
        advanced: false
    });

    const { data, loading, error, refetch } = useImageMetadata({
        repository,
        tag,
        enabled: Boolean(repository && tag)
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleString();
    };

    if (!repository || !tag) {
        return (
            <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Image Metadata</h3>
                <p className="text-muted-foreground">Select a repository and tag to view metadata</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-card border rounded-lg">
                <div className="border-b p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Image Metadata
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {repository}:{tag}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refetch}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <div className="p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Fetching metadata...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-destructive bg-destructive/10 p-4 rounded-md">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {data && data.length > 0 && (
                        <div className="space-y-4">
                            {/* Platform selector for multi-arch images */}
                            {data.length > 1 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium">Platforms:</span>
                                    <Button
                                        variant={selectedPlatformIndex === null ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedPlatformIndex(null)}
                                    >
                                        All ({data.length})
                                    </Button>
                                    {data.map((metadata, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedPlatformIndex === index ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPlatformIndex(index)}
                                        >
                                            {metadata.platform.os}/{metadata.platform.architecture}
                                            {metadata.platform.variant && `/${metadata.platform.variant}`}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Display metadata */}
                            <div className="space-y-4">
                                {(selectedPlatformIndex !== null ? [data[selectedPlatformIndex]] : data).map((metadata, index) => (
                                    <MetadataCard
                                        key={selectedPlatformIndex !== null ? selectedPlatformIndex : index}
                                        metadata={metadata}
                                        formatBytes={formatBytes}
                                        formatDate={formatDate}
                                        showPlatform={data.length > 1 && selectedPlatformIndex === null}
                                        expandedSections={expandedSections}
                                        toggleSection={toggleSection}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface MetadataCardProps {
    metadata: NormalizedImageMetadata;
    formatBytes: (bytes: number) => string;
    formatDate: (date?: string) => string;
    showPlatform?: boolean;
    expandedSections: Record<string, boolean>;
    toggleSection: (section: string) => void;
}

function MetadataCard({ metadata, formatBytes, formatDate, showPlatform = false, expandedSections, toggleSection }: MetadataCardProps) {
    const ExpandableSection = ({
        title,
        icon: Icon,
        sectionKey,
        children,
        count
    }: {
        title: string;
        icon: any;
        sectionKey: string;
        children: React.ReactNode;
        count?: number;
    }) => (
        <div className="space-y-2">
            <button
                onClick={() => toggleSection(sectionKey)}
                className="flex items-center gap-2 w-full text-left hover:text-primary transition-colors"
            >
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{title}</span>
                {count !== undefined && (
                    <Badge variant="outline" className="text-xs">
                        {count}
                    </Badge>
                )}
                {expandedSections[sectionKey] ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                )}
            </button>
            {expandedSections[sectionKey] && (
                <div className="ml-6 space-y-2">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-card border rounded-lg border-l-4 border-l-primary">
            <div className="p-6 space-y-6">
                {/* Header with Platform Badge */}
                {showPlatform && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                            {metadata.platform.os}/{metadata.platform.architecture}
                            {metadata.platform.variant && `/${metadata.platform.variant}`}
                        </Badge>
                    </div>
                )}

                {/* Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">Overview</h4>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <span><strong>Digest:</strong> <TruncatedTextTooltip text={metadata.digest} truncatedLength={16} /></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                <span><strong>Size:</strong> {formatBytes(metadata.size)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span><strong>Type:</strong> {metadata.mediaType.split('.').pop()}</span>
                            </div>
                            {metadata.config.created && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span><strong>Created:</strong> {formatDate(metadata.config.created)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Config Blob Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">Config Blob</h4>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <span><strong>Digest:</strong> <TruncatedTextTooltip text={metadata.config.digest} truncatedLength={16} /></span>
                            </div>
                            {metadata.config.size && (
                                <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                                    <span><strong>Size:</strong> {formatBytes(metadata.config.size)}</span>
                                </div>
                            )}
                            {metadata.config.mediaType && (
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span><strong>Type:</strong> {metadata.config.mediaType.split('.').pop()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Platform Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">Platform</h4>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div><strong>OS:</strong> {metadata.platform.os}</div>
                            <div><strong>Architecture:</strong> {metadata.platform.architecture}</div>
                            {metadata.platform.variant && (
                                <div><strong>Variant:</strong> {metadata.platform.variant}</div>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Expandable Sections */}
                <div className="space-y-4">
                    {/* Runtime Configuration */}
                    <ExpandableSection
                        title="Runtime Configuration"
                        icon={Terminal}
                        sectionKey="config"
                    >
                        <div className="space-y-3">
                            {metadata.config.entrypoint && metadata.config.entrypoint.length > 0 && (
                                <div>
                                    <strong className="text-sm">Entrypoint:</strong>
                                    <code className="text-xs bg-muted p-2 rounded block mt-1">
                                        {metadata.config.entrypoint.join(' ')}
                                    </code>
                                </div>
                            )}

                            {metadata.config.cmd && metadata.config.cmd.length > 0 && (
                                <div>
                                    <strong className="text-sm">Command:</strong>
                                    <code className="text-xs bg-muted p-2 rounded block mt-1">
                                        {metadata.config.cmd.join(' ')}
                                    </code>
                                </div>
                            )}

                            {metadata.config.workingDir && (
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm"><strong>Working Directory:</strong> {metadata.config.workingDir}</span>
                                </div>
                            )}

                            {metadata.config.user && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm"><strong>User:</strong> {metadata.config.user}</span>
                                </div>
                            )}

                            {metadata.config.exposedPorts && Object.keys(metadata.config.exposedPorts).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Network className="h-4 w-4 text-muted-foreground" />
                                        <strong className="text-sm">Exposed Ports:</strong>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.keys(metadata.config.exposedPorts).map(port => (
                                            <Badge key={port} variant="outline" className="text-xs">
                                                {port}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {metadata.config.volumes && Object.keys(metadata.config.volumes).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                                        <strong className="text-sm">Volumes:</strong>
                                    </div>
                                    <div className="space-y-1">
                                        {Object.keys(metadata.config.volumes).map(volume => (
                                            <code key={volume} className="text-xs bg-muted p-1 rounded block">
                                                {volume}
                                            </code>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ExpandableSection>

                    {/* Environment Variables */}
                    {metadata.config.env && metadata.config.env.length > 0 && (
                        <ExpandableSection
                            title="Environment Variables"
                            icon={Settings}
                            sectionKey="env"
                            count={metadata.config.env.length}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {metadata.config.env.map((env: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs justify-start">
                                        {env}
                                    </Badge>
                                ))}
                            </div>
                        </ExpandableSection>
                    )}

                    {/* Labels */}
                    {metadata.config.labels && Object.keys(metadata.config.labels).length > 0 && (
                        <ExpandableSection
                            title="Labels"
                            icon={Tag}
                            sectionKey="labels"
                            count={Object.keys(metadata.config.labels).length}
                        >
                            <div className="space-y-2">
                                {Object.entries(metadata.config.labels).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-2 text-xs">
                                        <Badge variant="outline" className="shrink-0">{key}</Badge>
                                        <span className="text-muted-foreground break-all">{value as string}</span>
                                    </div>
                                ))}
                            </div>
                        </ExpandableSection>
                    )}

                    {/* Build History */}
                    {metadata.history && metadata.history.length > 0 && (
                        <ExpandableSection
                            title="Build History"
                            icon={History}
                            sectionKey="history"
                            count={metadata.history.length}
                        >
                            <div className="space-y-2">
                                {metadata.history.map((entry, index: number) => (
                                    <div key={index} className="bg-muted p-3 rounded text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Layer {index + 1}</span>
                                            {entry.created && (
                                                <span className="text-muted-foreground">{formatDate(entry.created)}</span>
                                            )}
                                        </div>
                                        {entry.created_by && (
                                            <div>
                                                <strong>Command:</strong>
                                                <code className="text-xs bg-background p-1 rounded block mt-1 break-all">
                                                    {entry.created_by}
                                                </code>
                                            </div>
                                        )}
                                        {entry.empty_layer && (
                                            <Badge variant="outline" className="text-xs">
                                                Empty Layer
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ExpandableSection>
                    )}

                    {/* Layers */}
                    <ExpandableSection
                        title="Image Layers"
                        icon={Layers}
                        sectionKey="layers"
                        count={metadata.layers.length}
                    >
                        <div className="space-y-2">
                            {metadata.layers.map((layer, index: number) => (
                                <div key={index} className="bg-muted p-3 rounded text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                        <code className="font-mono">{layer.digest.substring(0, 20)}...</code>
                                        <span className="font-medium">{formatBytes(layer.size)}</span>
                                    </div>
                                    <div className="text-muted-foreground">
                                        <strong>Type:</strong> {layer.mediaType.split('.').pop()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ExpandableSection>
                </div>
            </div>
        </div>
    );
}
