
import React from "react";
import { TableContentBlock } from "@/types/enhanced-content";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Minus } from "lucide-react";

interface SimpleTableBlockProps {
  block: TableContentBlock;
  isEditing?: boolean;
  onChange?: (updatedBlock: TableContentBlock) => void;
  onDelete?: () => void;
}

export const SimpleTableBlock: React.FC<SimpleTableBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  const updateTitle = (title: string) => {
    if (onChange) {
      onChange({ ...block, title });
    }
  };

  const updateHeader = (index: number, value: string) => {
    if (onChange) {
      const updatedHeaders = [...block.headers];
      updatedHeaders[index] = value;
      onChange({ ...block, headers: updatedHeaders });
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (onChange) {
      const updatedRows = [...block.rows];
      updatedRows[rowIndex][colIndex] = value;
      onChange({ ...block, rows: updatedRows });
    }
  };

  const addColumn = () => {
    if (onChange) {
      const updatedHeaders = [...block.headers, ""];
      const updatedRows = block.rows.map(row => [...row, ""]);
      onChange({ ...block, headers: updatedHeaders, rows: updatedRows });
    }
  };

  const removeColumn = (index: number) => {
    if (onChange && block.headers.length > 1) {
      const updatedHeaders = block.headers.filter((_, i) => i !== index);
      const updatedRows = block.rows.map(row => row.filter((_, i) => i !== index));
      onChange({ ...block, headers: updatedHeaders, rows: updatedRows });
    }
  };

  const addRow = () => {
    if (onChange) {
      const newRow = new Array(block.headers.length).fill("");
      onChange({ ...block, rows: [...block.rows, newRow] });
    }
  };

  const removeRow = (index: number) => {
    if (onChange && block.rows.length > 1) {
      const updatedRows = block.rows.filter((_, i) => i !== index);
      onChange({ ...block, rows: updatedRows });
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <Input
              value={block.title || ""}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Table title..."
              className="bg-zinc-800 border-zinc-600 text-white"
            />
          ) : (
            <h4 className="text-lg font-semibold text-white">
              {block.title || "Table"}
            </h4>
          )}
          
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
        <div className="border border-zinc-700 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700">
                {block.headers.map((header, index) => (
                  <TableHead key={index} className="bg-zinc-800 text-zinc-200">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={header}
                          onChange={(e) => updateHeader(index, e.target.value)}
                          placeholder={`Column ${index + 1}`}
                          className="bg-zinc-700 border-zinc-600 text-white text-sm"
                        />
                        {block.headers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColumn(index)}
                            className="text-red-400 hover:text-red-300 p-1 h-6 w-6"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      header
                    )}
                  </TableHead>
                ))}
                {isEditing && (
                  <TableHead className="bg-zinc-800 w-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addColumn}
                      className="text-green-400 hover:text-green-300 p-1 h-6 w-6"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {block.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="border-zinc-700">
                  {row.map((cell, colIndex) => (
                    <TableCell key={colIndex} className="text-zinc-300">
                      {isEditing ? (
                        <Input
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          placeholder="..."
                          className="bg-zinc-800 border-zinc-600 text-white text-sm"
                        />
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                  {isEditing && (
                    <TableCell className="w-12">
                      {block.rows.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(rowIndex)}
                          className="text-red-400 hover:text-red-300 p-1 h-6 w-6"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {isEditing && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Row
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
