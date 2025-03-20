/**
 * Utilities for discovering and documenting database schema
 * Primarily for development use to help understand the database structure
 */

import { supabase } from '../lib/supabase';

interface TableInfo {
  name: string;
  schema: string;
  columns: ColumnInfo[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  isPrimary: boolean;
}

interface ForeignKeyInfo {
  columnName: string;
  foreignTable: string;
  foreignColumn: string;
}

/**
 * Get information about database tables and their schemas
 * @param schemas Array of schema names to include (defaults to 'public')
 */
export async function discoverDatabaseSchema(schemas = ['public']): Promise<TableInfo[]> {
  try {
    // This function requires admin/service_role access to the database
    // Check if user has permission
    const { data: permissionCheck, error: permissionError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .in('schemaname', schemas)
      .limit(1);
      
    if (permissionError) {
      throw new Error(`Permission error: You need more privileges to access database schema information: ${permissionError.message}`);
    }
    
    // Get all tables in the specified schemas
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .in('schemaname', schemas);
      
    if (tablesError) throw new Error(`Error fetching tables: ${tablesError.message}`);
    if (!tables) throw new Error('No tables found');
    
    // For each table, get columns and constraints
    const schemaInfo: TableInfo[] = [];
    
    for (const table of tables) {
      const tableName = table.tablename;
      const schemaName = table.schemaname;
      
      // Get columns for this table
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', {
          table_name_param: tableName,
          schema_name_param: schemaName
        });
        
      if (columnsError) {
        console.error(`Error fetching columns for ${schemaName}.${tableName}:`, columnsError);
        continue;
      }
      
      // Get primary key for this table
      const { data: primaryKeys, error: pkError } = await supabase
        .rpc('get_primary_keys', {
          table_name_param: tableName,
          schema_name_param: schemaName
        });
        
      if (pkError) {
        console.error(`Error fetching primary keys for ${schemaName}.${tableName}:`, pkError);
      }
      
      // Get foreign keys for this table
      const { data: foreignKeys, error: fkError } = await supabase
        .rpc('get_foreign_keys', {
          table_name_param: tableName,
          schema_name_param: schemaName
        });
        
      if (fkError) {
        console.error(`Error fetching foreign keys for ${schemaName}.${tableName}:`, fkError);
      }
      
      const primaryKeyColumns = primaryKeys?.map((pk: any) => pk.column_name) || [];
      
      const tableInfo: TableInfo = {
        name: tableName,
        schema: schemaName,
        columns: columns?.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          isPrimary: primaryKeyColumns.includes(col.column_name)
        })) || [],
        primaryKey: primaryKeyColumns.length > 0 ? primaryKeyColumns : undefined,
        foreignKeys: foreignKeys?.map((fk: any) => ({
          columnName: fk.column_name,
          foreignTable: fk.foreign_table_name,
          foreignColumn: fk.foreign_column_name
        })) || undefined
      };
      
      schemaInfo.push(tableInfo);
    }
    
    return schemaInfo;
  } catch (error) {
    console.error('Error discovering database schema:', error);
    throw error;
  }
}

/**
 * Generate TypeScript interfaces from database schema
 * @param schema Database schema information
 * @returns String containing TypeScript interfaces
 */
export function generateTypeScriptInterfaces(schema: TableInfo[]): string {
  let output = '/**\n * Auto-generated TypeScript interfaces for database schema\n */\n\n';
  
  // Helper to convert SQL types to TypeScript types
  const sqlTypeToTsType = (sqlType: string): string => {
    const typeMap: Record<string, string> = {
      'integer': 'number',
      'bigint': 'number',
      'smallint': 'number',
      'decimal': 'number',
      'numeric': 'number',
      'real': 'number',
      'double precision': 'number',
      'serial': 'number',
      'bigserial': 'number',
      'boolean': 'boolean',
      'character varying': 'string',
      'varchar': 'string',
      'character': 'string',
      'char': 'string',
      'text': 'string',
      'uuid': 'string',
      'date': 'string', // Could be 'Date' if you use a Date type
      'time': 'string',
      'timestamp': 'string', // Could be 'Date' if you use a Date type
      'timestamptz': 'string', // Could be 'Date' if you use a Date type
      'json': 'any',
      'jsonb': 'any'
    };
    
    // Check for arrays
    if (sqlType.endsWith('[]')) {
      const baseType = sqlType.substring(0, sqlType.length - 2);
      return `${sqlTypeToTsType(baseType)}[]`;
    }
    
    return typeMap[sqlType.toLowerCase()] || 'any';
  };
  
  // Generate an interface for each table
  schema.forEach(table => {
    output += `interface ${pascalCase(table.name)} {\n`;
    
    table.columns.forEach(column => {
      const optional = column.nullable ? '?' : '';
      const tsType = sqlTypeToTsType(column.type);
      output += `  ${column.name}${optional}: ${tsType};\n`;
    });
    
    output += '}\n\n';
  });
  
  return output;
}

/**
 * Convert a string to PascalCase
 * @param input Input string
 * @returns String in PascalCase
 */
function pascalCase(input: string): string {
  return input
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Save schema information to a file or localStorage for development purposes
 * @param schema Schema information
 */
export function saveSchemaInfo(schema: TableInfo[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('db_schema_cache', JSON.stringify(schema));
      console.log('Schema information saved to localStorage');
    } catch (e) {
      console.error('Error saving schema to localStorage:', e);
    }
  }
}

/**
 * Load cached schema information from localStorage
 * @returns Cached schema or null if not available
 */
export function loadCachedSchema(): TableInfo[] | null {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('db_schema_cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Error loading cached schema:', e);
    }
  }
  return null;
}

import { supabase } from '../lib/supabase';

/**
 * Logs the database schema to the console for development purposes
 * This function helps developers understand the database structure
 */
export async function logDatabaseSchema() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Database schema discovery should not be used in production');
      return;
    }

    console.log('Discovering database schema...');
    
    // Get all tables using PostgreSQL's information schema
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tableError) {
      console.error('Error fetching tables:', tableError);
      return;
    }
    
    // Check if we have tables
    if (!tables || tables.length === 0) {
      console.log('No tables found in the public schema');
      return;
    }
    
    // Log each table and its columns
    for (const table of tables) {
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', table.table_name)
        .eq('table_schema', 'public');
      
      if (columnError) {
        console.error(`Error fetching columns for table ${table.table_name}:`, columnError);
        continue;
      }
      
      console.group(`Table: ${table.table_name}`);
      
      if (columns && columns.length > 0) {
        columns.forEach(column => {
          console.log(`${column.column_name} (${column.data_type})${column.is_nullable === 'YES' ? ' NULL' : ' NOT NULL'}`);
        });
      } else {
        console.log('No columns found');
      }
      
      console.groupEnd();
    }
    
    console.log('Database schema discovery complete');
  } catch (error) {
    console.error('Error during schema discovery:', error);
  }
}

// Export a default object with functions
export default {
  logDatabaseSchema
};

import { supabase } from '../lib/supabase';

/**
 * Get all tables in the public schema
 */
export async function getPublicTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
      
    if (error) throw error;
    
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
      
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error(`Error getting columns for table ${tableName}:`, err);
    return [];
  }
}

/**
 * Get foreign key relationships for a table
 */
export async function getTableRelationships(tableName: string) {
  try {
    const { data, error } = await supabase.rpc('get_table_relationships', { 
      table_name_param: tableName 
    });
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error(`Error getting relationships for table ${tableName}:`, err);
    return [];
  }
}

/**
 * Check if a table exists in the database
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('information_schema.tables')
      .select('*', { count: 'exact', head: true })
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) throw error;
    
    return count ? count > 0 : false;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    return false;
  }
}

/**
 * Get database schema summary
 */
export async function getDatabaseSchemaSummary() {
  try {
    const tables = await getPublicTables();
    const schemaSummary = [];
    
    for (const table of tables) {
      const columns = await getTableColumns(table);
      schemaSummary.push({
        tableName: table,
        columns: columns.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        }))
      });
    }
    
    return schemaSummary;
  } catch (err) {
    console.error('Error getting database schema summary:', err);
    return [];
  }
}
