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
import { RichTextEditor } from '../../../../../core/components/ui/rich-text-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../core/components/ui/tabs';
import { Loader2, Save, Eye, ArrowLeft } from 'lucide-react';
import { Post } from '../../../types/content';
import { useAuth } from '../../../../../contexts/AuthContext';
import { hasPermission } from '../../../../../lib/permissions';
import { PermissionGuard } from '../../../../../core/components/PermissionGuard';

// Schema validation for the form
const postFormSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(200, 'Tiêu đề không được quá 200 ký tự'),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  status: z.enum(['draft', 'published', 'archived'])
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostFormProps {
  post?: Post;
  isSubmitting: boolean;
  onSubmit: (data: PostFormValues) => void;
  onCancel: () => void;
}

const PostForm: React.FC<PostFormProps> = ({
  post,
  isSubmitting,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const isEditMode = !!post;
  
  // Check if user can publish content
  const canPublish = hasPermission(user, 'content.publish');
  
  // Initialize form with either post data or default values
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: post ? {
      title: post.title,
      content: post.content,
      status: (post.status as 'draft' | 'published' | 'archived') || 'draft'
    } : {
      title: '',
      content: '',
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
              {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditMode && (
              <a 
                href={`/posts/${post.id}`} 
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
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Nội dung</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>
          
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nhập tiêu đề bài viết" 
                      {...field} 
                      className="text-lg font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Viết nội dung bài viết ở đây..."
                      className="min-h-[400px]"
                    />
                  </FormControl>
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
                    Bài viết chỉ được hiển thị công khai khi ở trạng thái "Đã đăng".
                    {!canPublish && ' Bạn cần quyền Xuất bản để đăng bài.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Additional settings could be added here, like categories */}
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default PostForm;
