import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CodeContentBlock } from "@/types/enhanced-content";
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Trash2, 
  Eye,
  Settings,
  FileText
} from "lucide-react";

interface CodeContentBlockProps {
  block: CodeContentBlock;
  isEditing?: boolean;
  onChange?: (block: CodeContentBlock) => void;
  onDelete?: () => void;
}

const CodeContentBlock: React.FC<CodeContentBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateBlock = useCallback((updates: Partial<CodeContentBlock>) => {
    if (onChange) {
      onChange({ ...block, ...updates });
    }
  }, [block, onChange]);

  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'docker', label: 'Dockerfile' },
    { value: 'plaintext', label: 'Plain Text' }
  ];

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = block.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [block.code]);

  // Basic syntax highlighting using regex patterns
  const getHighlightedCode = () => {
    const { code, language } = block;
    
    if (!code) return '';
    
    // Apply basic syntax highlighting based on language
    let highlightedCode = code;
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        highlightedCode = code
          .replace(/(\/\/.*$)/gm, '<span class="text-green-400">$1</span>')
          .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-green-400">$1</span>')
          .replace(/\b(function|const|let|var|if|else|for|while|return|class|extends|import|export|async|await|try|catch|finally)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
          .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
          .replace(/"([^"\\]|\\.)*"/g, '<span class="text-green-300">$&</span>')
          .replace(/'([^'\\]|\\.)*'/g, '<span class="text-green-300">$&</span>')
          .replace(/`([^`\\]|\\.)*`/g, '<span class="text-green-300">$&</span>')
          .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-yellow-400">$1</span>');
        break;
        
      case 'python':
        highlightedCode = code
          .replace(/(#.*$)/gm, '<span class="text-green-400">$1</span>')
          .replace(/\b(def|class|if|elif|else|for|while|in|import|from|as|return|try|except|finally|with|lambda|yield|global|nonlocal)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
          .replace(/\b(True|False|None)\b/g, '<span class="text-orange-400">$1</span>')
          .replace(/"([^"\\]|\\.)*"/g, '<span class="text-green-300">$&</span>')
          .replace(/'([^'\\]|\\.)*'/g, '<span class="text-green-300">$&</span>')
          .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-yellow-400">$1</span>');
        break;
        
      case 'html':
        highlightedCode = code
          .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-green-400">$1</span>')
          .replace(/(&lt;\/?[a-zA-Z][^&gt;]*&gt;)/g, '<span class="text-blue-400">$1</span>')
          .replace(/\s([a-zA-Z-]+)=/g, ' <span class="text-yellow-400">$1</span>=')
          .replace(/"([^"]*?)"/g, '<span class="text-green-300">"$1"</span>');
        break;
        
      case 'css':
      case 'scss':
        highlightedCode = code
          .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-green-400">$1</span>')
          .replace(/([.#][a-zA-Z][a-zA-Z0-9_-]*)/g, '<span class="text-blue-400">$1</span>')
          .replace(/\b([a-zA-Z-]+)(?=\s*:)/g, '<span class="text-yellow-400">$1</span>')
          .replace(/"([^"]*?)"/g, '<span class="text-green-300">"$1"</span>')
          .replace(/'([^']*?)'/g, '<span class="text-green-300">\'$1\'</span>');
        break;
        
      case 'json':
        highlightedCode = code
          .replace(/"([^"\\]|\\.)*"(?=\s*:)/g, '<span class="text-blue-400">$&</span>')
          .replace(/"([^"\\]|\\.)*"(?!\s*:)/g, '<span class="text-green-300">$&</span>')
          .replace(/\b(true|false|null)\b/g, '<span class="text-orange-400">$1</span>')
          .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-yellow-400">$1</span>');
        break;
        
      case 'sql':
        highlightedCode = code
          .replace(/(--.*$)/gm, '<span class="text-green-400">$1</span>')
          .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INDEX|TABLE|DATABASE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|ORDER|BY|HAVING|DISTINCT|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|COUNT|SUM|AVG|MAX|MIN)\b/gi, '<span class="text-purple-400 font-semibold">$1</span>')
          .replace(/'([^'\\]|\\.)*'/g, '<span class="text-green-300">$&</span>')
          .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-yellow-400">$1</span>');
        break;
        
      default:
        // No highlighting for unknown languages
        break;
    }
    
    return highlightedCode;
  };

  const renderCodeBlock = () => {
    const { theme = 'dark', showLineNumbers = true, wrap = false } = block;
    const lines = block.code.split('\n');
    const highlightedCode = getHighlightedCode();
    const highlightedLines = highlightedCode.split('\n');

    return (
      <div className={`relative rounded-lg overflow-hidden ${
        theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-zinc-900 text-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${
          theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-zinc-800 border-zinc-700'
        }`}>
          <div className="flex items-center gap-2">
            {block.fileName && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-mono text-zinc-400">{block.fileName}</span>
              </div>
            )}
            {block.showLanguage !== false && (
              <span className={`text-xs px-2 py-1 rounded ${
                theme === 'light' ? 'bg-gray-200 text-gray-700' : 'bg-zinc-700 text-zinc-300'
              }`}>
                {supportedLanguages.find(lang => lang.value === block.language)?.label || block.language}
              </span>
            )}
          </div>
          
          {block.allowCopy !== false && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyCode}
              className={`h-7 px-2 ${
                theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-zinc-700'
              }`}
            >
              {copied ? (
                <CheckCircle className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="ml-1 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          )}
        </div>
        
        {/* Code Content */}
        <div className={`overflow-auto ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}>
          <div className="flex">
            {/* Line Numbers */}
            {showLineNumbers && (
              <div className={`select-none px-3 py-4 text-right border-r ${
                theme === 'light' ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
              }`}>
                {lines.map((_, index) => (
                  <div key={index} className="text-xs leading-6 font-mono">
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
            
            {/* Code Lines */}
            <div className="flex-1 px-4 py-4">
              {highlightedLines.map((line, index) => (
                <div 
                  key={index}
                  className={`text-sm leading-6 font-mono ${
                    block.highlightLines?.includes(index + 1) 
                      ? (theme === 'light' ? 'bg-yellow-100' : 'bg-yellow-900/20') 
                      : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <Code className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white">
                {isEditing ? (
                  <Input
                    value={block.title || ""}
                    onChange={(e) => updateBlock({ title: e.target.value })}
                    className="bg-transparent border-none p-0 h-auto text-lg font-semibold text-white"
                    placeholder="Code Block Title (optional)"
                  />
                ) : (
                  block.title || "Code Snippet"
                )}
              </CardTitle>
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
            {/* Language Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-sm">Programming Language</Label>
                <Select 
                  value={block.language} 
                  onValueChange={(value) => updateBlock({ language: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600 max-h-60">
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="text-white">
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-zinc-300 text-sm">File Name (optional)</Label>
                <Input
                  value={block.fileName || ""}
                  onChange={(e) => updateBlock({ fileName: e.target.value })}
                  placeholder="example.js"
                  className="bg-zinc-800 border-zinc-600 text-white mt-1"
                />
              </div>
            </div>

            {/* Code Editor */}
            <div>
              <Label className="text-zinc-300 text-sm">Code</Label>
              <Textarea
                value={block.code}
                onChange={(e) => updateBlock({ code: e.target.value })}
                placeholder="Enter your code here..."
                className="bg-zinc-800 border-zinc-600 text-white font-mono text-sm mt-1 min-h-48"
                spellCheck={false}
              />
            </div>

            {/* Advanced Options */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-zinc-400 hover:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Advanced Options {showAdvanced ? '▼' : '▶'}
            </Button>

            {showAdvanced && (
              <div className="space-y-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300 text-sm">Theme</Label>
                    <Select 
                      value={block.theme || 'dark'} 
                      onValueChange={(value: 'dark' | 'light' | 'auto') => 
                        updateBlock({ theme: value })
                      }
                    >
                      <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-600">
                        <SelectItem value="dark" className="text-white">Dark</SelectItem>
                        <SelectItem value="light" className="text-white">Light</SelectItem>
                        <SelectItem value="auto" className="text-white">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-zinc-300 text-sm">Highlight Lines</Label>
                    <Input
                      value={block.highlightLines?.join(', ') || ""}
                      onChange={(e) => {
                        const lines = e.target.value
                          .split(',')
                          .map(n => parseInt(n.trim()))
                          .filter(n => !isNaN(n));
                        updateBlock({ highlightLines: lines.length > 0 ? lines : undefined });
                      }}
                      placeholder="1, 3, 5-7"
                      className="bg-zinc-900 border-zinc-600 text-white mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.showLineNumbers !== false}
                      onChange={(e) => updateBlock({ showLineNumbers: e.target.checked })}
                      className="rounded border-zinc-600"
                    />
                    <Label className="text-zinc-300 text-sm">Show Line Numbers</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.showLanguage !== false}
                      onChange={(e) => updateBlock({ showLanguage: e.target.checked })}
                      className="rounded border-zinc-600"
                    />
                    <Label className="text-zinc-300 text-sm">Show Language Label</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.allowCopy !== false}
                      onChange={(e) => updateBlock({ allowCopy: e.target.checked })}
                      className="rounded border-zinc-600"
                    />
                    <Label className="text-zinc-300 text-sm">Allow Copy to Clipboard</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.wrap || false}
                      onChange={(e) => updateBlock({ wrap: e.target.checked })}
                      className="rounded border-zinc-600"
                    />
                    <Label className="text-zinc-300 text-sm">Wrap Long Lines</Label>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {block.title && (
              <p className="text-zinc-400 text-sm">{block.title}</p>
            )}
          </div>
        )}

        {/* Code Display */}
        {block.code && renderCodeBlock()}
      </CardContent>
    </Card>
  );
};

export default CodeContentBlock; 