import { supabase } from './supabase';

/**
 * Adapter để làm việc với database schema linh hoạt
 * Tự động xác định và sử dụng bảng/cột đúng
 */
class DatabaseAdapter {
  private tableExistenceCache = new Map<string, boolean>();
  private columnExistenceCache = new Map<string, boolean>();
  
  /**
   * Kiểm tra xem bảng có tồn tại không
   */
  async tableExists(tableName: string): Promise<boolean> {
    // Kiểm tra cache
    if (this.tableExistenceCache.has(tableName)) {
      return this.tableExistenceCache.get(tableName)!;
    }
    
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
        
      const exists = !error;
      this.tableExistenceCache.set(tableName, exists);
      return exists;
    } catch (error) {
      console.error(`Error checking table existence for ${tableName}:`, error);
      this.tableExistenceCache.set(tableName, false);
      return false;
    }
  }
  
  /**
   * Kiểm tra xem cột có tồn tại không
   */
  async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const cacheKey = `${tableName}.${columnName}`;
    
    // Kiểm tra cache
    if (this.columnExistenceCache.has(cacheKey)) {
      return this.columnExistenceCache.get(cacheKey)!;
    }
    
    try {
      const { error } = await supabase
        .from(tableName)
        .select(columnName)
        .limit(1);
        
      const exists = !error || !error.message.includes(columnName);
      this.columnExistenceCache.set(cacheKey, exists);
      return exists;
    } catch (error) {
      console.error(`Error checking column existence for ${tableName}.${columnName}:`, error);
      this.columnExistenceCache.set(cacheKey, false);
      return false;
    }
  }
  
  /**
   * Lấy bảng người dùng sẵn có
   */
  async getUserTable(): Promise<'users' | 'custom_users' | 'profiles'> {
    if (await this.tableExists('profiles')) return 'profiles';
    if (await this.tableExists('users')) return 'users';
    return 'custom_users';
  }
  
  /**
   * Lấy thông tin người dùng từ bảng phù hợp
   */
  async getUserById(userId: string) {
    const userTable = await this.getUserTable();
    
    const { data, error } = await supabase
      .from(userTable)
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error(`Error fetching user from ${userTable}:`, error);
      return null;
    }
    
    return data;
  }
  
  /**
   * Cập nhật view_count cho hymns_new theo cách an toàn
   */
  async incrementHymnView(hymnId: string, userId?: string | null): Promise<void> {
    try {
      // Kiểm tra xem hàm RPC có tồn tại không
      const hasRpc = await this.checkFunctionExists('increment_hymn_view');
      
      if (hasRpc) {
        // Sử dụng RPC nếu có
        await supabase.rpc('increment_hymn_view', {
          hymn_id: hymnId,
          user_id: userId
        });
        return;
      }
      
      // Kiểm tra xem bảng hymn_views có tồn tại không
      const hasViewsTable = await this.tableExists('hymn_views');
      
      if (hasViewsTable) {
        // Ghi nhật ký lượt xem
        await supabase
          .from('hymn_views')
          .insert({
            hymn_id: hymnId,
            user_id: userId,
            viewed_at: new Date().toISOString()
          });
      }
      
      // Kiểm tra cột view_count
      const hasViewCount = await this.columnExists('hymns_new', 'view_count');
      
      if (hasViewCount) {
        // Cập nhật trực tiếp nếu cột tồn tại
        await supabase
          .from('hymns_new')
          .update({ view_count: supabase.rpc('get_view_count', { hymn_id: hymnId }) + 1 })
          .eq('id', hymnId);
      }
    } catch (error) {
      console.error('Failed to increment hymn view:', error);
    }
  }
  
  /**
   * Kiểm tra xem hàm có tồn tại không
   */
  private async checkFunctionExists(functionName: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('check_health');
      // Nếu hàm check_health tồn tại, giả sử các hàm khác cũng có
      return !error;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Làm sạch cache khi database thay đổi
   */
  clearCache(): void {
    this.tableExistenceCache.clear();
    this.columnExistenceCache.clear();
  }

  /**
   * Select data from a table with error handling
   * @param tableName The table to query
   * @param columns The columns to select
   * @param filters The filter conditions
   * @param options Additional options like order, pagination
   */
  static async select(
    tableName: string,
    columns: string = '*',
    filters?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: { column: string; ascending?: boolean };
      single?: boolean;
    }
  ) {
    try {
      let query = supabase.from(tableName).select(columns);
      
      // Apply filters
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && 'operator' in value) {
              // Handle complex filters like {operator: 'gt', value: 100}
              const op = value.operator;
              const val = value.value;
              if (op === 'gt') query = query.gt(key, val);
              else if (op === 'lt') query = query.lt(key, val);
              else if (op === 'gte') query = query.gte(key, val);
              else if (op === 'lte') query = query.lte(key, val);
              else if (op === 'like') query = query.like(key, val);
              else if (op === 'ilike') query = query.ilike(key, val);
            } else {
              query = query.eq(key, value);
            }
          }
        }
      }
      
      // Apply options
      if (options) {
        if (options.limit) query = query.limit(options.limit);
        if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        if (options.orderBy) {
          query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
        }
        if (options.single) query = query.single();
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error selecting from ${tableName}:`, error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error in select operation on ${tableName}:`, error);
      return { data: null, error };
    }
  }
  
  /**
   * Insert data into a table
   */
  static async insert(tableName: string, data: any, options?: { returning?: string }) {
    try {
      let query = supabase.from(tableName).insert(data);
      
      if (options?.returning) {
        query = query.select(options.returning);
      }
      
      const result = await query;
      
      if (result.error) {
        console.error(`Error inserting into ${tableName}:`, result.error);
        throw result.error;
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      console.error(`Error in insert operation on ${tableName}:`, error);
      return { data: null, error };
    }
  }
  
  /**
   * Update data in a table
   */
  static async update(
    tableName: string,
    data: any,
    filters: Record<string, any>,
    options?: { returning?: string }
  ) {
    try {
      let query = supabase.from(tableName).update(data);
      
      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      }
      
      if (options?.returning) {
        query = query.select(options.returning);
      }
      
      const { data: resultData, error } = await query;
      
      if (error) {
        console.error(`Error updating ${tableName}:`, error);
        throw error;
      }
      
      return { data: resultData, error: null };
    } catch (error) {
      console.error(`Error in update operation on ${tableName}:`, error);
      return { data: null, error };
    }
  }
  
  /**
   * Delete data from a table
   */
  static async delete(tableName: string, filters: Record<string, any>) {
    try {
      let query = supabase.from(tableName).delete();
      
      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error in delete operation on ${tableName}:`, error);
      return { data: null, error };
    }
  }
}

/**
 * Database adapter to abstract Supabase database operations
 * This provides a layer of abstraction over Supabase client
 */

import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface QueryResult<T> {
  data: T[];
  count: number | null;
  error: PostgrestError | null;
}

/**
 * Database adapter class
 */
export class DatabaseAdapter {
  /**
   * Fetch all records from a table
   */
  static async fetchAll<T>(
    table: string,
    columns: string = '*',
    options?: QueryOptions
  ): Promise<QueryResult<T>> {
    try {
      let query = supabase.from(table).select(columns, { count: 'exact' });
      
      // Apply sorting
      if (options?.sortBy) {
        query = query.order(options.sortBy, { 
          ascending: options.sortDirection !== 'desc' 
        });
      }
      
      // Apply pagination
      if (options?.page !== undefined && options.pageSize) {
        const start = options.page * options.pageSize;
        const end = start + options.pageSize - 1;
        query = query.range(start, end);
      }
      
      const { data, count, error } = await query;
      
      return {
        data: (data || []) as T[],
        count,
        error
      };
    } catch (error) {
      console.error(`Error fetching records from ${table}:`, error);
      return {
        data: [],
        count: null,
        error: error as PostgrestError
      };
    }
  }
  
  /**
   * Fetch a record by ID
   */
  static async fetchById<T>(
    table: string,
    id: string,
    columns: string = '*'
  ): Promise<{ data: T | null; error: PostgrestError | null }> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq('id', id)
        .single();
      
      return {
        data: data as T,
        error
      };
    } catch (error) {
      console.error(`Error fetching record from ${table}:`, error);
      return {
        data: null,
        error: error as PostgrestError
      };
    }
  }
  
  /**
   * Insert a new record
   */
  static async insert<T>(
    table: string,
    data: Record<string, any>
  ): Promise<{ data: T | null; error: PostgrestError | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      return {
        data: result as T,
        error
      };
    } catch (error) {
      console.error(`Error inserting record into ${table}:`, error);
      return {
        data: null,
        error: error as PostgrestError
      };
    }
  }
  
  /**
   * Update a record
   */
  static async update<T>(
    table: string,
    id: string,
    data: Record<string, any>
  ): Promise<{ data: T | null; error: PostgrestError | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      return {
        data: result as T,
        error
      };
    } catch (error) {
      console.error(`Error updating record in ${table}:`, error);
      return {
        data: null,
        error: error as PostgrestError
      };
    }
  }
  
  /**
   * Delete a record
   */
  static async delete(
    table: string,
    id: string
  ): Promise<{ error: PostgrestError | null }> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (error) {
      console.error(`Error deleting record from ${table}:`, error);
      return {
        error: error as PostgrestError
      };
    }
  }
  
  /**
   * Count records
   */
  static async count(
    table: string,
    column: string = 'id',
    filter?: Record<string, any>
  ): Promise<{ count: number | null; error: PostgrestError | null }> {
    try {
      let query = supabase.from(table).select(column, { count: 'exact', head: true });
      
      // Apply filter
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { count, error } = await query;
      
      return { count, error };
    } catch (error) {
      console.error(`Error counting records in ${table}:`, error);
      return {
        count: null,
        error: error as PostgrestError
      };
    }
  }
}

export const dbAdapter = new DatabaseAdapter();
export default dbAdapter;
