
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface SavedSop {
  id: string;
  user_id: string;
  folder_id?: string;
  title: string;
  description?: string;
  content: any;
  created_at: string;
  updated_at: string;
  folder?: Folder;
  tags?: Tag[];
}

export interface SopTag {
  id: string;
  sop_id: string;
  tag_id: string;
  created_at: string;
}
