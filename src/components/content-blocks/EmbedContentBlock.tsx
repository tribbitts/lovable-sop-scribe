import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EmbedContentBlock } from "@/types/enhanced-content";
import { 
  Globe, 
  Trash2, 
  ExternalLink, 
  Play, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface EmbedContentBlockProps {
  block: EmbedContentBlock;
  isEditing?: boolean;
  onChange?: (block: EmbedContentBlock) => void;
  onDelete?: () => void;
}

const EmbedContentBlock: React.FC<EmbedContentBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateBlock = useCallback((updates: Partial<EmbedContentBlock>) => {
    if (onChange) {
      onChange({ ...block, ...updates });
    }
  }, [block, onChange]);

  // Detect embed type from URL
  const detectEmbedType = useCallback((url: string): EmbedContentBlock['embedType'] => {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    } else if (urlLower.includes('vimeo.com')) {
      return 'vimeo';
    } else if (urlLower.includes('docs.google.com/presentation')) {
      return 'google-slides';
    } else if (urlLower.includes('miro.com')) {
      return 'miro';
    } else if (urlLower.includes('loom.com')) {
      return 'loom';
    } else if (urlLower.includes('soundcloud.com')) {
      return 'soundcloud';
    }
    
    return 'generic';
  }, []);

  // Generate embed code from URL
  const generateEmbedCode = useCallback((url: string, embedType: EmbedContentBlock['embedType']) => {
    try {
      switch (embedType) {
        case 'youtube': {
          const videoId = extractYouTubeVideoId(url);
          if (!videoId) throw new Error('Invalid YouTube URL');
          
          return `<iframe src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                  </iframe>`;
        }
        
        case 'vimeo': {
          const videoId = extractVimeoVideoId(url);
          if (!videoId) throw new Error('Invalid Vimeo URL');
          
          return `<iframe src="https://player.vimeo.com/video/${videoId}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen>
                  </iframe>`;
        }
        
        case 'google-slides': {
          // Extract presentation ID and convert to embed URL
          const match = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
          if (!match) throw new Error('Invalid Google Slides URL');
          
          return `<iframe src="https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000"
                    frameborder="0"
                    allowfullscreen="true"
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true">
                  </iframe>`;
        }
        
        case 'loom': {
          const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
          if (!match) throw new Error('Invalid Loom URL');
          
          return `<iframe src="https://www.loom.com/embed/${match[1]}" 
                    frameborder="0" 
                    webkitallowfullscreen 
                    mozallowfullscreen 
                    allowfullscreen>
                  </iframe>`;
        }
        
        default:
          return '';
      }
    } catch (error) {
      console.error('Error generating embed code:', error);
      return '';
    }
  }, []);

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const extractVimeoVideoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    return match ? match[1] : null;
  };

  // Validate and process URL
  const handleUrlChange = useCallback(async (newUrl: string) => {
    setValidationError(null);
    updateBlock({ url: newUrl });
    
    if (!newUrl.trim()) {
      updateBlock({ embedCode: '', metadata: undefined });
      return;
    }
    
    try {
      // Validate URL format
      new URL(newUrl);
      
      const embedType = detectEmbedType(newUrl);
      updateBlock({ embedType });
      
      setIsLoading(true);
      
      // Generate embed code
      const embedCode = generateEmbedCode(newUrl, embedType);
      
      if (embedCode) {
        // Sanitize the embed code
        const sanitizedEmbedCode = sanitizeEmbedCode(embedCode);
        
        updateBlock({ embedCode: sanitizedEmbedCode });
        
        // Try to fetch metadata (simplified - in production you'd use oEmbed)
        if (embedType === 'youtube') {
          const videoId = extractYouTubeVideoId(newUrl);
          if (videoId) {
            updateBlock({
              metadata: {
                title: 'YouTube Video',
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              }
            });
          }
        }
      } else {
        setValidationError(`Embed type "${embedType}" is not yet supported for automatic embedding. You can use the generic option and paste embed code manually.`);
      }
      
    } catch (error) {
      setValidationError('Please enter a valid URL');
    } finally {
      setIsLoading(false);
    }
  }, [detectEmbedType, generateEmbedCode, updateBlock]);

  // Handle manual embed code input
  const handleEmbedCodeChange = useCallback((embedCode: string) => {
    if (embedCode.trim()) {
      // Sanitize the embed code
      const sanitizedEmbedCode = sanitizeEmbedCode(embedCode);
      
      updateBlock({ embedCode: sanitizedEmbedCode });
    } else {
      updateBlock({ embedCode: '' });
    }
  }, [updateBlock]);

  const getAspectRatioStyle = () => {
    const { aspectRatio, customWidth, customHeight } = block;
    
    if (aspectRatio === 'custom' && customWidth && customHeight) {
      return {
        width: `${customWidth}px`,
        height: `${customHeight}px`
      };
    }
    
    // Default responsive aspect ratios
    const ratios = {
      '16:9': '56.25%', // 9/16 * 100
      '4:3': '75%',     // 3/4 * 100
      '1:1': '100%'
    };
    
    const paddingBottom = ratios[aspectRatio || '16:9'];
    
    return {
      position: 'relative' as const,
      paddingBottom,
      height: 0,
      overflow: 'hidden'
    };
  };

  const renderEmbedPreview = () => {
    if (!block.embedCode) {
      return (
        <div className="h-48 bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <Globe className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Enter a URL to see embed preview</p>
          </div>
        </div>
      );
    }

    return (
      <div style={getAspectRatioStyle()} className="bg-zinc-800 rounded-lg overflow-hidden">
        <div 
          className={`${block.aspectRatio === 'custom' ? '' : 'absolute inset-0'} w-full h-full`}
          dangerouslySetInnerHTML={{ 
            __html: block.embedCode.replace(
              '<iframe',
              '<iframe class="w-full h-full"'
            )
          }}
        />
      </div>
    );
  };

  // Basic HTML sanitization for iframe embeds
  const sanitizeEmbedCode = (html: string): string => {
    // Only allow iframe tags with specific attributes
    const iframeRegex = /<iframe\s+([^>]*?)>/gi;
    const allowedAttributes = [
      'src', 'frameborder', 'allow', 'allowfullscreen', 
      'webkitallowfullscreen', 'mozallowfullscreen', 
      'width', 'height', 'style', 'class'
    ];
    
    return html.replace(iframeRegex, (match, attributes) => {
      // Extract and validate attributes
      const attrRegex = /(\w+)=["']([^"']*?)["']/g;
      const validAttrs: string[] = [];
      let attrMatch;
      
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        const [, name, value] = attrMatch;
        if (allowedAttributes.includes(name.toLowerCase())) {
          // Basic validation for src attribute
          if (name.toLowerCase() === 'src') {
            if (value.startsWith('https://') && 
                (value.includes('youtube.com') || 
                 value.includes('vimeo.com') || 
                 value.includes('docs.google.com') ||
                 value.includes('loom.com'))) {
              validAttrs.push(`${name}="${value}"`);
            }
          } else {
            validAttrs.push(`${name}="${value}"`);
          }
        }
      }
      
      return `<iframe ${validAttrs.join(' ')}>`;
    }).replace(/<\/iframe>/gi, '</iframe>').replace(/<[^>]*>/g, (tag) => {
      // Only allow iframe and closing iframe tags
      return tag.match(/^<\/?iframe/i) ? tag : '';
    });
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg">
              <Globe className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-white">
                {isEditing ? (
                  <Input
                    value={block.title || ""}
                    onChange={(e) => updateBlock({ title: e.target.value })}
                    className="bg-transparent border-none p-0 h-auto text-lg font-semibold text-white"
                    placeholder="Embed Title (optional)"
                  />
                ) : (
                  block.title || "Embedded Content"
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                  {block.embedType.toUpperCase()}
                </span>
                {block.metadata?.duration && (
                  <span className="text-xs text-zinc-400">
                    {block.metadata.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {isEditing && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* URL Input */}
            <div>
              <Label className="text-zinc-300 text-sm">Content URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={block.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or any embeddable URL"
                  className="bg-zinc-800 border-zinc-600 text-white flex-1"
                />
                {isLoading && (
                  <Button disabled size="sm" className="px-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                )}
              </div>
              {validationError && (
                <div className="flex items-center gap-2 mt-2 text-orange-400 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* Embed Type Selection */}
            <div>
              <Label className="text-zinc-300 text-sm">Embed Type</Label>
              <Select 
                value={block.embedType} 
                onValueChange={(value: EmbedContentBlock['embedType']) => 
                  updateBlock({ embedType: value })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="youtube" className="text-white">YouTube</SelectItem>
                  <SelectItem value="vimeo" className="text-white">Vimeo</SelectItem>
                  <SelectItem value="google-slides" className="text-white">Google Slides</SelectItem>
                  <SelectItem value="miro" className="text-white">Miro</SelectItem>
                  <SelectItem value="loom" className="text-white">Loom</SelectItem>
                  <SelectItem value="soundcloud" className="text-white">SoundCloud</SelectItem>
                  <SelectItem value="generic" className="text-white">Generic/Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Manual Embed Code for Generic */}
            {block.embedType === 'generic' && (
              <div>
                <Label className="text-zinc-300 text-sm">Embed Code</Label>
                <textarea
                  value={block.embedCode || ''}
                  onChange={(e) => handleEmbedCodeChange(e.target.value)}
                  placeholder="Paste embed code (iframe) here..."
                  className="w-full h-24 bg-zinc-800 border border-zinc-600 rounded-lg p-3 text-white placeholder-zinc-500 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 mt-1"
                />
                <div className="flex items-center gap-2 mt-2 text-zinc-400 text-xs">
                  <Shield className="h-3 w-3" />
                  <span>Embed code will be automatically sanitized for security</span>
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-zinc-400 hover:text-white"
            >
              Advanced Options {showAdvanced ? '▼' : '▶'}
            </Button>

            {showAdvanced && (
              <div className="space-y-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                {/* Aspect Ratio */}
                <div>
                  <Label className="text-zinc-300 text-sm">Aspect Ratio</Label>
                  <Select 
                    value={block.aspectRatio || '16:9'} 
                    onValueChange={(value: EmbedContentBlock['aspectRatio']) => 
                      updateBlock({ aspectRatio: value })
                    }
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="16:9" className="text-white">16:9 (Widescreen)</SelectItem>
                      <SelectItem value="4:3" className="text-white">4:3 (Standard)</SelectItem>
                      <SelectItem value="1:1" className="text-white">1:1 (Square)</SelectItem>
                      <SelectItem value="custom" className="text-white">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Dimensions */}
                {block.aspectRatio === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-zinc-300 text-sm">Width (px)</Label>
                      <Input
                        type="number"
                        value={block.customWidth || 560}
                        onChange={(e) => updateBlock({ customWidth: parseInt(e.target.value) || 560 })}
                        className="bg-zinc-900 border-zinc-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300 text-sm">Height (px)</Label>
                      <Input
                        type="number"
                        value={block.customHeight || 315}
                        onChange={(e) => updateBlock({ customHeight: parseInt(e.target.value) || 315 })}
                        className="bg-zinc-900 border-zinc-600 text-white mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Security Options */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.allowFullscreen !== false}
                      onChange={(e) => updateBlock({ allowFullscreen: e.target.checked })}
                      className="rounded border-zinc-600"
                    />
                    <Label className="text-zinc-300 text-sm">Allow Fullscreen</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.allowAutoplay || false}
                      onChange={(e) => updateBlock({ allowAutoplay: e.target.checked })}
                      className="rounded border-zinc-600"
                    />
                    <Label className="text-zinc-300 text-sm">Allow Autoplay</Label>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* View Mode */
          <div>
            {block.metadata?.description && (
              <p className="text-zinc-400 text-sm mb-4">{block.metadata.description}</p>
            )}
          </div>
        )}

        {/* Embed Preview/Display */}
        <div>
          {renderEmbedPreview()}
          
          {block.url && !isEditing && (
            <div className="flex items-center justify-between mt-2 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Embedded content loaded</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-zinc-400 hover:text-white"
              >
                <a href={block.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Original
                </a>
              </Button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="text-xs text-zinc-500 bg-zinc-800 p-3 rounded border border-zinc-700">
            <p className="mb-2 font-medium">Supported Services:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>YouTube, Vimeo (videos)</li>
              <li>Google Slides (presentations)</li>
              <li>Miro (whiteboards)</li>
              <li>Loom (screen recordings)</li>
              <li>SoundCloud (audio)</li>
              <li>Any service with iframe embed code</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmbedContentBlock; 