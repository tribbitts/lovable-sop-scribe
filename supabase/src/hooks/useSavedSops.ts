
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SavedSop, SopTag } from '@/types/organization';
import { SopDocument } from '@/types/sop';

export const useSavedSops = () => {
  const [savedSops, setSavedSops] = useState<SavedSop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSavedSops = useCallback(async () => {
    if (!user) {
      setSavedSops([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
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

      if (fetchError) {
        console.error('Error fetching saved SOPs:', fetchError);
        throw fetchError;
      }

      const processedData = data?.map(sop => ({
        ...sop,
        tags: sop.sop_tags?.map((st: any) => st.tags).filter(Boolean) || []
      })) || [];

      setSavedSops(processedData);
    } catch (error: any) {
      console.error('Error fetching saved SOPs:', error);
      setError(error.message || 'Failed to load saved SOPs');
      toast({
        title: "Error",
        description: "Failed to load saved SOPs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSop = async (
    sopDocument: SopDocument, 
    folderId?: string, 
    description?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save SOPs",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('sops')
        .insert({
          user_id: user.id,
          folder_id: folderId || null,
          title: sopDocument.title || 'Untitled SOP',
          description,
          content: sopDocument as any
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSavedSops();
      toast({
        title: "Success",
        description: "SOP saved successfully"
      });

      return data;
    } catch (error: any) {
      console.error('Error saving SOP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save SOP",
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
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update SOPs",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('sops')
        .update({
          folder_id: folderId || null,
          title: sopDocument.title || 'Untitled SOP',
          description,
          content: sopDocument as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id) // Additional security check
        .select()
        .single();

      if (error) throw error;

      await fetchSavedSops();
      toast({
        title: "Success",
        description: "SOP updated successfully"
      });

      return data;
    } catch (error: any) {
      console.error('Error updating SOP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update SOP",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteSop = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete SOPs",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('sops')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Additional security check

      if (error) throw error;

      setSavedSops(prev => prev.filter(sop => sop.id !== id));
      toast({
        title: "Success",
        description: "SOP deleted successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting SOP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete SOP",
        variant: "destructive"
      });
      return false;
    }
  };

  const addTagToSop = async (sopId: string, tagId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to manage tags",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Verify the SOP belongs to the user
      const { data: sopData, error: sopError } = await supabase
        .from('sops')
        .select('user_id')
        .eq('id', sopId)
        .eq('user_id', user.id)
        .single();

      if (sopError || !sopData) {
        throw new Error('SOP not found or access denied');
      }

      const { error } = await supabase
        .from('sop_tags')
        .insert({
          sop_id: sopId,
          tag_id: tagId
        });

      if (error) throw error;

      await fetchSavedSops();
      toast({
        title: "Success",
        description: "Tag added to SOP"
      });

      return true;
    } catch (error: any) {
      console.error('Error adding tag to SOP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add tag",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeTagFromSop = async (sopId: string, tagId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to manage tags",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Verify the SOP belongs to the user
      const { data: sopData, error: sopError } = await supabase
        .from('sops')
        .select('user_id')
        .eq('id', sopId)
        .eq('user_id', user.id)
        .single();

      if (sopError || !sopData) {
        throw new Error('SOP not found or access denied');
      }

      const { error } = await supabase
        .from('sop_tags')
        .delete()
        .eq('sop_id', sopId)
        .eq('tag_id', tagId);

      if (error) throw error;

      await fetchSavedSops();
      toast({
        title: "Success",
        description: "Tag removed from SOP"
      });

      return true;
    } catch (error: any) {
      console.error('Error removing tag from SOP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove tag",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSavedSops();
  }, [fetchSavedSops]);

  return {
    savedSops,
    loading,
    error,
    saveSop,
    updateSop,
    deleteSop,
    addTagToSop,
    removeTagFromSop,
    refetch: fetchSavedSops
  };
};
