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
  FormMessage,
  FormDescription 
} from '../../../../../core/components/ui/form';
import { Input } from '../../../../../core/components/ui/input';
import { Button } from '../../../../../core/components/ui/button';
import { Textarea } from '../../../../../core/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../core/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../core/components/ui/tabs';
import { Loader2, Save, Eye, ArrowLeft } from 'lucide-react';
import { Hymn } from '../../../types/hymns';
import { useAuth } from '../../../../../contexts/AuthContext';
import { hasPermission } from '../../../../../lib/permissions';
import { PermissionGuard } from '../../../../../core/components/PermissionGuard';

// Schema validation for the form
const hymnFormSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(200, 'Tiêu đề không được quá 200 ký tự'),
  lyrics: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

type HymnFormValues = z.infer<typeof hymnFormSchema>;

interface HymnFormProps {
  hymn?: Hymn;
  isSubmitting: boolean;
  onSubmit: (data: HymnFormValues) => void;
  onCancel: () => void;
}

const HymnForm: React.FC<HymnFormProps> = ({
  hymn,
  isSubmitting,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const isEditMode = !!hymn;
  
  // Check if user can publish content
  const canPublish = hasPermission(user, 'content.publish');
  
  // Initialize form with either hymn data or default values
  const form = useForm<HymnFormValues>({
    resolver: zodResolver(hymnFormSchema),
    defaultValues: hymn ? {
      title: hymn.title,
      lyrics: hymn.lyrics || '',
      status: (hymn.status as 'draft' | 'published' | 'archived') || 'draft'
    } : {
      title: '',
      lyrics: '',
      status: 'draft'
    }
  });
  
  // Determine if form has been modified
  const isDirty = form.formState.isDirty;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onCancel} type="button">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
            <h1 className="text-xl font-bold">
              {isEditMode ? 'Chỉnh sửa thánh ca' : 'Thêm thánh ca mới'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditMode && hymn && (
              <a 
                href={`/hymns/${hymn.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" type="button">
                  <Eye className="h-4 w-4 mr-2" />
                  Xem
                </Button>
              </a>
            )}
            
            <Button 
              type="submit" 
              disabled={isSubmitting || (!isDirty && isEditMode)}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Cập nhật' : 'Lưu'}
            </Button>
          </div>
        </div>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="lyrics">Lời thánh ca</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>
          
          {/* Basic info tab */}
          <TabsContent value="basic" className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nhập tên thánh ca" 
                      {...field} 
                      className="text-lg font-medium"
                    />
                  </FormControl>
                  <FormDescription>
                    Tiêu đề của thánh ca sẽ được hiển thị ở trang chủ và các kết quả tìm kiếm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Lyrics tab */}
          <TabsContent value="lyrics">
            <FormField
              control={form.control}
              name="lyrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lời thánh ca</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập lời thánh ca ở đây..."
                      className="min-h-[500px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Điền vào lời thánh ca nếu có, có thể sử dụng ký tự xuống dòng để ngăn cách các câu
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      
                      {/* Only show published option if user can publish */}
                      <PermissionGuard permission="content.publish">
                        <SelectItem value="published">Đã đăng</SelectItem>
                      </PermissionGuard>
                      
                      {/* Only admins can archive */}
                      <PermissionGuard permission="content.delete">
                        <SelectItem value="archived">Đã lưu trữ</SelectItem>
                      </PermissionGuard>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Thánh ca chỉ được hiển thị công khai khi ở trạng thái "Đã đăng".
                    {!canPublish && ' Bạn cần quyền Xuất bản để đăng thánh ca.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default HymnForm;
