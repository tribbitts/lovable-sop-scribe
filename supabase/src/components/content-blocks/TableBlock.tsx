
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Trash2 } from "lucide-react";
import { TableContentBlock } from "@/types/enhanced-content";

interface TableBlockProps {
  block: TableContentBlock;
  isEditing?: boolean;
  onChange?: (block: TableContentBlock) => void;
  onDelete?: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  const addColumn = () => {
    if (!onChange) return;
    
    onChange({
      ...block,
      headers: [...block.headers, `Column ${block.headers.length + 1}`],
      rows: block.rows.map(row => [...row, ""])
    });
  };

  const addRow = () => {
    if (!onChange) return;
    
    onChange({
      ...block,
      rows: [...block.rows, new Array(block.headers.length).fill("")]
    });
  };

  const updateHeader = (index: number, value: string) => {
    if (!onChange) return;
    
    const newHeaders = [...block.headers];
    newHeaders[index] = value;
    onChange({ ...block, headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (!onChange) return;
    
    const newRows = [...block.rows];
    newRows[rowIndex][colIndex] = value;
    onChange({ ...block, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if (!onChange || block.headers.length <= 1) return;
    
    onChange({
      ...block,
      headers: block.headers.filter((_, i) => i !== index),
      rows: block.rows.map(row => row.filter((_, i) => i !== index))
    });
  };

  const removeRow = (index: number) => {
    if (!onChange) return;
    
    onChange({
      ...block,
      rows: block.rows.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {isEditing ? (
              <Input
                value={block.title || ""}
                onChange={(e) => onChange?.({ ...block, title: e.target.value })}
                placeholder="Table title..."
                className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
              />
            ) : (
              block.title || "Table"
            )}
          </CardTitle>
          {isEditing && onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700">
            <thead>
              <tr>
                {block.headers.map((header, index) => (
                  <th key={index} className="border border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-100 dark:bg-zinc-800">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={header}
                          onChange={(e) => updateHeader(index, e.target.value)}
                          className="text-sm font-medium"
                        />
                        {block.headers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColumn(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium">{header}</span>
                    )}
                  </th>
                ))}
                {isEditing && (
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2">
                    <Button variant="ghost" size="sm" onClick={addColumn}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border border-zinc-300 dark:border-zinc-700 p-2">
                      {isEditing ? (
                        <Input
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <span>{cell}</span>
                      )}
                    </td>
                  ))}
                  {isEditing && (
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {isEditing && (
          <div className="mt-3 flex gap-2">
            <Button onClick={addRow} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
