
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Tag, Plus, Save, FolderOpen, Hash, Trash2, Edit } from 'lucide-react';
import { useSopContext } from '@/context/SopContext';
import { useAuth } from '@/context/AuthContext';

export const OrganizationPanel = () => {
  const {
    folders,
    tags,
    savedSops,
    organizationLoading,
    createFolder,
    createTag,
    saveSopToDatabase,
    loadSopFromDatabase,
    deleteSopFromDatabase,
    deleteFolder,
    deleteTag,
    sopDocument
  } = useSopContext();
  
  const { user } = useAuth();
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [sopDescription, setSopDescription] = useState('');

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to use the organization system.</p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName, newFolderDescription);
      setNewFolderName('');
      setNewFolderDescription('');
    }
  };

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      await createTag(newTagName);
      setNewTagName('');
    }
  };

  const handleSaveSop = async () => {
    if (sopDocument.title || sopDocument.steps.length > 0) {
      await saveSopToDatabase(selectedFolderId || undefined, sopDescription);
      setSopDescription('');
      setSelectedFolderId('');
    }
  };

  const handleLoadSop = (savedSop: any) => {
    loadSopFromDatabase(savedSop);
  };

  if (organizationLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Loading organization data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save Current SOP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Current SOP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="folder-select">Folder (Optional)</Label>
            <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sop-description">Description (Optional)</Label>
            <Textarea
              id="sop-description"
              placeholder="Describe this SOP..."
              value={sopDescription}
              onChange={(e) => setSopDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveSop} className="w-full">
            Save SOP
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="sops" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sops">SOPs</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="sops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved SOPs ({savedSops.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {savedSops.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No saved SOPs yet. Save your current SOP to get started!
                </p>
              ) : (
                <div className="space-y-2">
                  {savedSops.map((sop) => (
                    <div
                      key={sop.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{sop.title}</h4>
                        {sop.description && (
                          <p className="text-sm text-muted-foreground">{sop.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {sop.folder && (
                            <Badge variant="secondary" className="text-xs">
                              <FolderOpen className="h-3 w-3 mr-1" />
                              {sop.folder.name}
                            </Badge>
                          )}
                          {sop.tags?.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated: {new Date(sop.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadSop(sop)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSopFromDatabase(sop.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Folders ({folders.length})
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input
                          id="folder-name"
                          placeholder="Enter folder name"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="folder-description">Description (Optional)</Label>
                        <Textarea
                          id="folder-description"
                          placeholder="Describe this folder..."
                          value={newFolderDescription}
                          onChange={(e) => setNewFolderDescription(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreateFolder} className="w-full">
                        Create Folder
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {folders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No folders yet. Create one to organize your SOPs!
                </p>
              ) : (
                <div className="space-y-2">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: folder.color }}
                          />
                          {folder.name}
                        </h4>
                        {folder.description && (
                          <p className="text-sm text-muted-foreground">{folder.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFolder(folder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Tags ({tags.length})
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Tag</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tag-name">Tag Name</Label>
                        <Input
                          id="tag-name"
                          placeholder="Enter tag name"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreateTag} className="w-full">
                        Create Tag
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No tags yet. Create some to label your SOPs!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                      >
                        <Hash className="h-3 w-3" />
                        {tag.name}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => deleteTag(tag.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
