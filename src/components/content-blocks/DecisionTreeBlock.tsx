import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DecisionTreeContentBlock, DecisionTreeNode } from "@/types/enhanced-content";
import { 
  Plus, 
  Trash2, 
  Edit, 
  ArrowRight, 
  GitBranch, 
  CheckCircle, 
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface DecisionTreeBlockProps {
  block: DecisionTreeContentBlock;
  isEditing?: boolean;
  onChange?: (block: DecisionTreeContentBlock) => void;
  onDelete?: () => void;
  availableSteps?: Array<{ id: string; title: string }>;
}

const DecisionTreeBlock: React.FC<DecisionTreeBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete,
  availableSteps = []
}) => {
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([block.rootNode.id]));
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const updateBlock = useCallback((updates: Partial<DecisionTreeContentBlock>) => {
    if (onChange) {
      onChange({ ...block, ...updates });
    }
  }, [block, onChange]);

  const updateNode = useCallback((nodeId: string, updates: Partial<DecisionTreeNode>) => {
    const updateNodeInTree = (node: DecisionTreeNode): DecisionTreeNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeInTree)
        };
      }
      return node;
    };

    const updatedRootNode = updateNodeInTree(block.rootNode);
    updateBlock({ rootNode: updatedRootNode });
  }, [block.rootNode, updateBlock]);

  const addChildNode = useCallback((parentId: string) => {
    const newNode: DecisionTreeNode = {
      id: uuidv4(),
      question: "New decision point",
      children: []
    };

    const addToParent = (node: DecisionTreeNode): DecisionTreeNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addToParent)
        };
      }
      return node;
    };

    const updatedRootNode = addToParent(block.rootNode);
    updateBlock({ rootNode: updatedRootNode });
    setExpandedNodes(prev => new Set([...prev, parentId]));
  }, [block.rootNode, updateBlock]);

  const deleteNode = useCallback((nodeId: string) => {
    const deleteFromTree = (node: DecisionTreeNode): DecisionTreeNode | null => {
      if (node.children) {
        const filteredChildren = node.children
          .map(child => deleteFromTree(child))
          .filter(child => child !== null) as DecisionTreeNode[];
        
        return { ...node, children: filteredChildren };
      }
      return node.id === nodeId ? null : node;
    };

    const updatedRootNode = deleteFromTree(block.rootNode);
    if (updatedRootNode) {
      updateBlock({ rootNode: updatedRootNode });
    }
  }, [block.rootNode, updateBlock]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (!isEditing) {
      // In view mode, navigate through the decision tree
      if (selectedPath.includes(nodeId)) {
        // Reset to this point
        const index = selectedPath.indexOf(nodeId);
        setSelectedPath(selectedPath.slice(0, index + 1));
      } else {
        // Add to path
        setSelectedPath(prev => [...prev, nodeId]);
      }
    }
  }, [isEditing, selectedPath]);

  const renderNodeEditor = (node: DecisionTreeNode) => {
    if (editingNode !== node.id) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2 p-3 bg-zinc-800 rounded-lg border border-zinc-600"
      >
        <div className="space-y-3">
          <div>
            <Label className="text-zinc-300 text-sm">Question/Decision Point</Label>
            <Textarea
              value={node.question}
              onChange={(e) => updateNode(node.id, { question: e.target.value })}
              className="bg-zinc-900 border-zinc-600 text-white mt-1"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-zinc-300 text-sm">Condition (optional)</Label>
            <Input
              value={node.condition || ""}
              onChange={(e) => updateNode(node.id, { condition: e.target.value })}
              placeholder="e.g., 'If user role is Admin'"
              className="bg-zinc-900 border-zinc-600 text-white mt-1"
            />
          </div>

          {availableSteps.length > 0 && (
            <div>
              <Label className="text-zinc-300 text-sm">Navigate to Step</Label>
              <Select 
                value={node.targetStepId || ""} 
                onValueChange={(value) => updateNode(node.id, { targetStepId: value || undefined })}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white mt-1">
                  <SelectValue placeholder="Select a step (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="" className="text-white">No navigation</SelectItem>
                  {availableSteps.map((step) => (
                    <SelectItem key={step.id} value={step.id} className="text-white">
                      {step.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Label className="text-zinc-300 text-sm">End Node</Label>
            <input
              type="checkbox"
              checked={node.isEndNode || false}
              onChange={(e) => updateNode(node.id, { isEndNode: e.target.checked })}
              className="rounded border-zinc-600"
            />
          </div>

          {node.isEndNode && (
            <div>
              <Label className="text-zinc-300 text-sm">End Message</Label>
              <Textarea
                value={node.endMessage || ""}
                onChange={(e) => updateNode(node.id, { endMessage: e.target.value })}
                placeholder="Message to show when reaching this endpoint"
                className="bg-zinc-900 border-zinc-600 text-white mt-1"
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => setEditingNode(null)}
              className="bg-green-600 hover:bg-green-700"
            >
              Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingNode(null)}
              className="border-zinc-600 text-zinc-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNode = (node: DecisionTreeNode, level: number = 0, parentPath: string[] = []) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isInSelectedPath = selectedPath.includes(node.id);
    const currentPath = [...parentPath, node.id];
    
    // In view mode, only show nodes in the selected path and their immediate children
    const shouldShowInViewMode = isEditing || 
      selectedPath.length === 0 || 
      isInSelectedPath || 
      selectedPath.includes(parentPath[parentPath.length - 1]);

    if (!shouldShowInViewMode) return null;

    return (
      <div key={node.id} className="relative">
        {/* Connection line from parent */}
        {level > 0 && (
          <div 
            className="absolute -top-6 left-6 w-px h-6 bg-zinc-600"
            style={{ 
              backgroundColor: block.style?.connectorColor || '#52525b'
            }}
          />
        )}
        
        <motion.div
          layout
          className={`mb-4 ${level > 0 ? 'ml-6' : ''}`}
        >
          <div 
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              isInSelectedPath 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-zinc-600 bg-zinc-800 hover:border-zinc-500'
            } ${
              node.isEndNode ? 'border-green-500' : ''
            }`}
            style={{
              borderColor: isInSelectedPath 
                ? '#3b82f6' 
                : (node.isEndNode ? '#22c55e' : (block.style?.nodeColor || '#52525b'))
            }}
            onClick={() => handleNodeClick(node.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {hasChildren && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNodeExpansion(node.id);
                      }}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )}
                  
                  {node.isEndNode ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-blue-400" />
                  )}
                  
                  <h4 className="text-white font-medium">{node.question}</h4>
                </div>
                
                {node.condition && (
                  <p className="text-zinc-400 text-sm mt-1 italic">
                    Condition: {node.condition}
                  </p>
                )}
                
                {node.targetStepId && (
                  <div className="flex items-center gap-2 mt-2 text-purple-400 text-sm">
                    <ArrowRight className="h-3 w-3" />
                    <span>Go to: {availableSteps.find(s => s.id === node.targetStepId)?.title || node.targetStepId}</span>
                  </div>
                )}
                
                {node.isEndNode && node.endMessage && (
                  <p className="text-green-300 text-sm mt-2 p-2 bg-green-900/20 rounded border border-green-600/30">
                    {node.endMessage}
                  </p>
                )}
              </div>
              
              {isEditing && (
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNode(node.id);
                    }}
                    className="text-zinc-400 hover:text-blue-400 transition-colors p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  {!node.isEndNode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addChildNode(node.id);
                      }}
                      className="text-zinc-400 hover:text-green-400 transition-colors p-1"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  
                  {level > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {renderNodeEditor(node)}
          
          {/* Render children */}
          <AnimatePresence>
            {isExpanded && hasChildren && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                {/* Horizontal line for multiple children */}
                {node.children!.length > 1 && (
                  <div 
                    className="absolute top-0 left-6 h-px bg-zinc-600"
                    style={{ 
                      width: `${(node.children!.length - 1) * 200}px`,
                      backgroundColor: block.style?.connectorColor || '#52525b'
                    }}
                  />
                )}
                
                <div className="flex flex-col gap-2 mt-4">
                  {node.children!.map((child, index) => (
                    <div key={child.id} className="relative">
                      {/* Branch connector */}
                      {index > 0 && (
                        <div 
                          className="absolute -top-6 left-6 w-px h-6 bg-zinc-600"
                          style={{ 
                            backgroundColor: block.style?.connectorColor || '#52525b'
                          }}
                        />
                      )}
                      {renderNode(child, level + 1, currentPath)}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
              <GitBranch className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">
                {isEditing ? (
                  <Input
                    value={block.title}
                    onChange={(e) => updateBlock({ title: e.target.value })}
                    className="bg-transparent border-none p-0 h-auto text-lg font-semibold text-white"
                    placeholder="Decision Tree Title"
                  />
                ) : (
                  block.title
                )}
              </CardTitle>
              {block.description && (
                <p className="text-zinc-400 text-sm mt-1">
                  {isEditing ? (
                    <Input
                      value={block.description}
                      onChange={(e) => updateBlock({ description: e.target.value })}
                      className="bg-transparent border-none p-0 h-auto text-sm text-zinc-400"
                      placeholder="Optional description"
                    />
                  ) : (
                    block.description
                  )}
                </p>
              )}
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
      
      <CardContent>
        {!isEditing && selectedPath.length > 0 && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <ArrowRight className="h-4 w-4" />
              <span>Decision Path: {selectedPath.length} step{selectedPath.length !== 1 ? 's' : ''} taken</span>
            </div>
            <Button
              size="sm"
              onClick={() => setSelectedPath([])}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reset Path
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          {renderNode(block.rootNode)}
        </div>
        
        {isEditing && (
          <div className="mt-6 pt-4 border-t border-zinc-700">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <GitBranch className="h-4 w-4" />
              <span>
                Click nodes to edit, use + to add branches, and × to delete.
                Mark endpoints as "End Node" to complete decision paths.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DecisionTreeBlock; 