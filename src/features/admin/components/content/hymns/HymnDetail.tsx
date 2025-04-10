import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHymnDetail } from '../../../hooks/useHymnManagement';
import HymnForm from './HymnForm';
import FileManager from './FileManager';
import HymnStats from './HymnStats';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../../core/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { HymnFormData } from '../../../types/hymns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../core/components/ui/tabs';

interface HymnDetailProps {
  id: string;
}

const HymnDetail: React.FC<HymnDetailProps> = ({ id }) => {
  const navigate = useNavigate();
  const {
    hymn,
    pdfFiles,
    audioFiles,
    videoLinks,
    presentationFiles,
    isLoading,
    updateHymn,
    deleteHymn,
    uploadPdf,
    uploadAudio,
    addVideo,
    uploadPresentation,
    deletePdf,
    deleteAudio,
    deleteVideo,
    deletePresentation,
    isUpdating,
    isDeleting,
    isUploadingPdf,
    isUploadingAudio,
    isAddingVideo,
    isUploadingPresentation,
    isDeletingPdf,
    isDeletingAudio,
    isDeletingVideo,
    isDeletingPresentation,
  } = useHymnDetail(id);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Handle navigation back to hymns list
  const handleCancel = () => {
    navigate('/admin/content/hymns');
  };
  
  // Handle form submission
  const handleSubmit = async (data: HymnFormData) => {
    try {
      await updateHymn(data);
      // Success is handled by the hook notifications
    } catch (error) {
      console.error('Failed to update hymn:', error);
    }
  };
  
  // Handle hymn deletion
  const handleDelete = async () => {
    try {
      await deleteHymn();
      navigate('/admin/content/hymns');
    } catch (error) {
      console.error('Failed to delete hymn:', error);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  
  // Handle case where hymn is not found
  if (!hymn) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Thánh ca không tồn tại</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Có thể thánh ca đã bị xóa hoặc bạn không có quyền truy cập.
        </p>
        <button 
          onClick={handleCancel}
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Quay lại danh sách thánh ca
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats overview - Add this section */}
      {hymn && (
        <HymnStats 
          hymn={hymn} 
          pdfCount={pdfFiles.length}
          audioCount={audioFiles.length}
          videoCount={videoLinks.length}
          presentationCount={presentationFiles.length}
        />
      )}
      
      {/* Tabs for different sections */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-6"
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <TabsList className="flex">
            <TabsTrigger value="basic" className="pb-3 pt-2">
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger value="files" className="pb-3 pt-2">
              Files & Media
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <HymnForm
            hymn={hymn}
            isSubmitting={isUpdating}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
          
          {/* Delete hymn button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-opacity-50 flex items-center"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Xóa thánh ca
            </button>
          </div>
        </TabsContent>
        
        {/* Files & Media Tab */}
        <TabsContent value="files" className="space-y-6">
          <FileManager
            hymnId={id}
            pdfFiles={pdfFiles}
            audioFiles={audioFiles}
            videoLinks={videoLinks}
            presentationFiles={presentationFiles}
            
            // Upload handlers
            onUploadPdf={(file, description) => uploadPdf({ file, description })}
            onUploadAudio={(file, description, pdfId) => uploadAudio({ file, description, pdfId })}
            onAddVideo={(videoUrl, source, description, pdfId) => 
              addVideo({ videoUrl, source, description, pdfId })
            }
            onUploadPresentation={(file, description, source) => 
              uploadPresentation({ file, description, source })
            }
            
            // Delete handlers
            onDeletePdf={(id, filePath) => deletePdf({ id, filePath })}
            onDeleteAudio={(id, filePath) => deleteAudio({ id, filePath })}
            onDeleteVideo={deleteVideo}
            onDeletePresentation={deletePresentation}
            
            // Loading states
            isUploadingPdf={isUploadingPdf}
            isUploadingAudio={isUploadingAudio}
            isAddingVideo={isAddingVideo}
            isUploadingPresentation={isUploadingPresentation}
          />
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thánh ca</AlertDialogTitle>
            <AlertDialogDescription>
              Thánh ca "{hymn.title}" sẽ bị xóa vĩnh viễn cùng với tất cả file liên quan và không thể khôi phục. 
              Bạn có chắc chắn muốn xóa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HymnDetail;
