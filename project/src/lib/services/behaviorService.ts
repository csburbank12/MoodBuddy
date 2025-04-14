import { supabase } from '../supabase';
import type { BehaviorForm, BehaviorRecord, BehaviorGoal } from '../db/types';

class BehaviorService {
  async createForm(data: Omit<BehaviorForm, 'id' | 'is_active'>) {
    const { data: form, error } = await supabase
      .from('behavior_forms')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return form;
  }

  async getForms() {
    const { data: forms, error } = await supabase
      .from('behavior_forms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return forms;
  }

  async createRecord(data: Omit<BehaviorRecord, 'id'>) {
    const { data: record, error } = await supabase
      .from('behavior_records')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  async getStudentRecords(studentId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('behavior_records')
      .select(`
        *,
        behavior_forms (
          title,
          categories,
          rating_scale
        )
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: records, error } = await query;
    if (error) throw error;
    return records;
  }

  async createGoal(data: Omit<BehaviorGoal, 'id' | 'status'>) {
    const { data: goal, error } = await supabase
      .from('behavior_goals')
      .insert({ ...data, status: 'active' })
      .select()
      .single();

    if (error) throw error;
    return goal;
  }

  async getStudentGoals(studentId: string) {
    const { data: goals, error } = await supabase
      .from('behavior_goals')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return goals;
  }

  async addComment(studentId: string, staffId: string, comment: string, context?: string) {
    const { data, error } = await supabase
      .from('behavior_comments')
      .insert({
        student_id: studentId,
        staff_id: staffId,
        comment,
        context
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStudentComments(studentId: string) {
    const { data: comments, error } = await supabase
      .from('behavior_comments')
      .select(`
        *,
        staff:staff_id (
          full_name
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return comments;
  }
}

export const behaviorService = new BehaviorService();