import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import HymnDetail from '../../components/content/hymns/HymnDetail';
import { Alert, AlertDescription, AlertTitle } from '../../../../core/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const HymnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Check if ID exists
  if (!id) {
    return (
      <AdminLayout>
        <div className="container px-4 py-8 mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Không tìm thấy ID thánh ca
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <HymnDetail id={id} />
      </div>
    </AdminLayout>
  );
};

export default HymnDetailPage;
