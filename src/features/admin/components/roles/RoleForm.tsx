import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../../../core/components/ui/form';
import { Input } from '../../../../core/components/ui/input';
import { Button } from '../../../../core/components/ui/button';
import { Card, CardContent } from '../../../../core/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import PermissionsEditor from './PermissionsEditor';
import { RoleFormData, DEFAULT_PERMISSIONS } from '../../types/roles';

// Schema validation for the form
const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên vai trò phải có ít nhất 3 ký tự')
    .max(50, 'Tên vai trò không được quá 50 ký tự'),
  permissions: z.any()
});

interface RoleFormProps {
  initialData?: RoleFormData;
  isSubmitting: boolean;
  onSubmit: (data: RoleFormData) => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  isSubmitting,
  onSubmit
}) => {
  const isEditMode = !!initialData;
  
  // Initialize form with either initial data or default values
  const form = useForm<RoleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      permissions: DEFAULT_PERMISSIONS
    }
  });
  
  const handleSubmit = (data: RoleFormData) => {
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Thông tin cơ bản */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên vai trò</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên vai trò" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Phân quyền */}
        <FormField
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <PermissionsEditor
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        
        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            {isEditMode ? 'Cập nhật vai trò' : 'Tạo vai trò'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;
