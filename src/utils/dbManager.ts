/**
 * Database schema management utilities
 * These functions provide a way to explore the database schema
 * and are useful for debugging and development.
 */
import { supabase } from '../lib/supabase';

/**
 * Get all tables in the public schema
 */
export async function getPublicTables() {
  try {
    // Don't use pg_catalog directly, use supabase's introspection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
      
    if (error) {
      console.error('Error getting tables:', error);
      return [];
    }
    
    return data.map((t: any) => t.table_name);
  } catch (err) {
    console.error('Error getting schema tables:', err);
    return [];
  }
}

/**
 * Get columns for a specific table
 */
export async function getTableColumns(tableName: string) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');
      
    if (error) {
      console.error(`Error getting columns for ${tableName}:`, error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error(`Error getting columns for table ${tableName}:`, err);
    return [];
  }
}

/**
 * Get foreign key relationships for a table using RPC
 */
export async function getTableRelationships(tableName: string) {
  try {
    // Using a custom RPC function that must be defined in your Supabase project
    const { data, error } = await supabase.rpc('get_table_relations', { 
      table_name_param: tableName 
    });
    
    if (error) {
      console.error(`Error getting relationships for ${tableName}:`, error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error(`Error getting relationships for table ${tableName}:`, err);
    return [];
  }
}

/**
 * Validate database schema against expected structure
 * This can help catch issues early when the database schema changes
 */
export async function validateDatabaseSchema() {
  const expectedTables = [
    'hymns_new',  // Not 'hymns'
    'authors', 
    'themes',
    'hymn_authors',
    'hymn_themes',
    'tags',
    'hymn_tags',
    'hymn_pdf_files',
    'hymn_audio_files',
    'hymn_video_links',
    'profiles',    // Not 'users'
    'posts',
    'comments',
    'likes',
    'hymn_views'
  ];
  
  try {
    const tables = await getPublicTables();
    
    const missingTables = expectedTables.filter(
      tableName => !tables.includes(tableName)
    );
    
    if (missingTables.length > 0) {
      console.warn('Missing expected tables:', missingTables);
      return {
        valid: false,
        missingTables
      };
    }
    
    return { valid: true };
  } catch (err) {
    console.error('Error validating schema:', err);
    return {
      valid: false,
      error: err
    };
  }
}
