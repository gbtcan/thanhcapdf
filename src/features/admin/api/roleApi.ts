import { supabaseClient } from '../../../lib/supabase/client';
import { Role, RoleFormData, RoleFilterParams } from '../types/roles';
import { handleSupabaseError } from '../../../core/utils/error-handler';

/**
 * Lấy danh sách vai trò
 */
export async function fetchRoles(params: RoleFilterParams = {}): Promise<{ roles: Role[], total: number }> {
  try {
    const { search = '', page = 0, pageSize = 10 } = params;
    
    // Tính toán range cho pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // Query cơ bản
    let query = supabaseClient.from('roles').select('*', { count: 'exact' });
    
    // Thêm tìm kiếm nếu có
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    // Thực thi query với phân trang
    const { data, error, count } = await query
      .order('id', { ascending: true })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      roles: data as Role[],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Lấy thông tin chi tiết một vai trò
 */
export async function fetchRoleById(id: number): Promise<Role> {
  try {
    const { data, error } = await supabaseClient
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Vai trò không tồn tại');
    
    return data as Role;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Tạo vai trò mới
 */
export async function createRole(roleData: RoleFormData): Promise<Role> {
  try {
    const { data, error } = await supabaseClient
      .from('roles')
      .insert([roleData])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Không thể tạo vai trò');
    
    return data as Role;
  } catch (error) {
    console.error('Error creating role:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Cập nhật vai trò
 */
export async function updateRole(id: number, roleData: Partial<RoleFormData>): Promise<Role> {
  try {
    const { data, error } = await supabaseClient
      .from('roles')
      .update({
        ...roleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Không thể cập nhật vai trò');
    
    return data as Role;
  } catch (error) {
    console.error(`Error updating role with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Xóa vai trò
 */
export async function deleteRole(id: number): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting role with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Kiểm tra xem vai trò có đang được sử dụng không
 * Trả về số lượng người dùng đang có vai trò này
 */
export async function checkRoleUsage(id: number): Promise<number> {
  try {
    const { data, error, count } = await supabaseClient
      .from('users_profile')
      .select('*', { count: 'exact' })
      .eq('role_id', id);
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error(`Error checking usage for role with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}
