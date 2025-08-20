import { useState } from 'react';
import { useImageMetadata } from '@/hooks/use-image-metadata';
import { NormalizedImageMetadata } from '@/types/docker-metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Package, HardDrive, Calendar, Terminal, Tag } from 'lucide-react';

interface ImageMetadataProps {
  repository: string;
  tag: string;
}

export function ImageMetadata({ repository, tag }: ImageMetadataProps) {
  const [selectedPlatformIndex, setSelectedPlatformIndex] = useState<number | null>(null);
  
  const { data, loading, error, refetch } = useImageMetadata({
    repository,
    tag,
    enabled: Boolean(repository && tag)
  });

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
}

function MetadataCard({ metadata, formatBytes, formatDate, showPlatform = false }: MetadataCardProps) {
  return (
    <div className="bg-card border rounded-lg border-l-4 border-l-primary">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Basic Information</h4>
            
            {showPlatform && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {metadata.platform.os}/{metadata.platform.architecture}
                  {metadata.platform.variant && `/${metadata.platform.variant}`}
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Digest:</strong> {metadata.digest.substring(0, 20)}...
                </span>
              </div>

              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Size:</strong> {formatBytes(metadata.size)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Media Type:</strong> {metadata.mediaType}
                </span>
              </div>

              {metadata.config.created && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Created:</strong> {formatDate(metadata.config.created)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Config Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Configuration</h4>
            
            {metadata.config.env && metadata.config.env.length > 0 && (
              <div>
                <strong className="text-sm">Environment Variables:</strong>
                <div className="mt-1 space-y-1">
                  {metadata.config.env.slice(0, 5).map((env: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {env}
                    </Badge>
                  ))}
                  {metadata.config.env.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{metadata.config.env.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {metadata.config.cmd && metadata.config.cmd.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <strong className="text-sm">Command:</strong>
                </div>
                <code className="text-xs bg-muted p-2 rounded block">
                  {metadata.config.cmd.join(' ')}
                </code>
              </div>
            )}

            {metadata.config.labels && Object.keys(metadata.config.labels).length > 0 && (
              <div>
                <strong className="text-sm">Labels:</strong>
                <div className="mt-1 space-y-1">
                  {Object.entries(metadata.config.labels).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <Badge variant="outline">{key}</Badge>
                      <span className="ml-1 text-muted-foreground">{value as string}</span>
                    </div>
                  ))}
                  {Object.keys(metadata.config.labels).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{Object.keys(metadata.config.labels).length - 3} more labels
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layers */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold text-lg mb-2">Layers ({metadata.layers.length})</h4>
          <div className="space-y-1">
            {metadata.layers.slice(0, 5).map((layer, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                <code className="text-xs">{layer.digest.substring(0, 20)}...</code>
                <span>{formatBytes(layer.size)}</span>
              </div>
            ))}
            {metadata.layers.length > 5 && (
              <div className="text-sm text-muted-foreground text-center py-2">
                ... and {metadata.layers.length - 5} more layers
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
