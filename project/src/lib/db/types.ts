export interface BehaviorForm {
  id: string;
  title: string;
  description?: string;
  categories: string[];
  rating_scale: {
    min: number;
    max: number;
  };
  is_active: boolean;
  created_at: string;
}

export interface BehaviorRecord {
  id: string;
  form_id: string;
  student_id: string;
  date: string;
  ratings: Record<string, number>;
  notes?: string;
  created_at: string;
}

export interface BehaviorGoal {
  id: string;
  student_id: string;
  title: string;
  description: string;
  target_date?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export interface BehaviorComment {
  id: string;
  student_id: string;
  staff_id: string;
  comment: string;
  context?: string;
  created_at: string;
}