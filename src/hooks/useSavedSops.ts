
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SavedSop, SopTag } from '@/types/organization';
import { SopDocument } from '@/types/sop';

export const useSavedSops = () => {
  const [savedSops, setSavedSops] = useState<SavedSop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSavedSops = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sops')
        .select(`
          *,
          folder:folders(*),
          sop_tags(
            tag_id,
            tags(*)
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedData = data?.map(sop => ({
        ...sop,
        tags: sop.sop_tags?.map((st: any) => st.tags).filter(Boolean) || []
      })) || [];

      setSavedSops(processedData);
    } catch (error) {
      console.error('Error fetching saved SOPs:', error);
      toast({
        title: "Error",
        description: "Failed to load saved SOPs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSop = async (
    sopDocument: SopDocument, 
    folderId?: string, 
    description?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('sops')
        .insert({
          user_id: user.id,
          folder_id: folderId || null,
          title: sopDocument.title || 'Untitled SOP',
          description,
          content: sopDocument as any // Cast to any to satisfy Json type
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSavedSops(); // Refresh the list
      toast({
        title: "Success",
        description: "SOP saved successfully"
      });

      return data;
    } catch (error) {
      console.error('Error saving SOP:', error);
      toast({
        title: "Error",
        description: "Failed to save SOP",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateSop = async (
    id: string, 
    sopDocument: SopDocument, 
    folderId?: string, 
    description?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('sops')
        .update({
          folder_id: folderId || null,
          title: sopDocument.title || 'Untitled SOP',
          description,
          content: sopDocument as any, // Cast to any to satisfy Json type
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchSavedSops(); // Refresh the list
      toast({
        title: "Success",
        description: "SOP updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating SOP:', error);
      toast({
        title: "Error",
        description: "Failed to update SOP",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteSop = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sops')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedSops(prev => prev.filter(sop => sop.id !== id));
      toast({
        title: "Success",
        description: "SOP deleted successfully"
      });

      return true;
    } catch (error) {
      console.error('Error deleting SOP:', error);
      toast({
        title: "Error",
        description: "Failed to delete SOP",
        variant: "destructive"
      });
      return false;
    }
  };

  const addTagToSop = async (sopId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('sop_tags')
        .insert({
          sop_id: sopId,
          tag_id: tagId
        });

      if (error) throw error;

      await fetchSavedSops(); // Refresh to get updated tags
      toast({
        title: "Success",
        description: "Tag added to SOP"
      });

      return true;
    } catch (error) {
      console.error('Error adding tag to SOP:', error);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeTagFromSop = async (sopId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('sop_tags')
        .delete()
        .eq('sop_id', sopId)
        .eq('tag_id', tagId);

      if (error) throw error;

      await fetchSavedSops(); // Refresh to get updated tags
      toast({
        title: "Success",
        description: "Tag removed from SOP"
      });

      return true;
    } catch (error) {
      console.error('Error removing tag from SOP:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSavedSops();
  }, [user]);

  return {
    savedSops,
    loading,
    saveSop,
    updateSop,
    deleteSop,
    addTagToSop,
    removeTagFromSop,
    refetch: fetchSavedSops
  };
};
