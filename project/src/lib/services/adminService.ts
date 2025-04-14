import { supabase } from '../supabase';

class AdminService {
  async createSchool(name: string, code: string, domains: string[]) {
    const { data, error } = await supabase.rpc('create_school', {
      p_name: name,
      p_code: code,
      p_domains: domains
    });

    if (error) throw error;
    return data;
  }

  async getSchools() {
    const { data, error } = await supabase
      .from('schools')
      .select(`
        *,
        school_domains (
          domain,
          is_primary
        ),
        school_admins (
          user_id,
          role
        )
      `)
      .order('name');

    if (error) throw error;
    return data;
  }

  async manageAdmin(userId: string, schoolId: string, role: 'super_admin' | 'school_admin') {
    const { data, error } = await supabase.rpc('manage_school_admin', {
      p_user_id: userId,
      p_school_id: schoolId,
      p_role: role
    });

    if (error) throw error;
    return data;
  }

  async getSchoolStats(schoolId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        role,
        count(*)
      `)
      .eq('school_id', schoolId)
      .group_by('role');

    if (error) throw error;
    return data;
  }
}

export const adminService = new AdminService();