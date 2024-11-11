export interface Task {
  id: string;
  title: string;
  description: string;
  group: string;
  date: string;
  completed: boolean;
  completed_at?: string | null;
  featured: boolean;
  created_at: string;
  user_id: string;
  order?: number;
}