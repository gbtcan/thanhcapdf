import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateHymn } from '../../../hooks/useHymnManagement';
import HymnForm from './HymnForm';
import { HymnFormData } from '../../../types/hymns';

const CreateHymn: React.FC = () => {
  const navigate = useNavigate();
  const { createHymn, isCreating } = useCreateHymn();
  
  // Handle form submission
  const handleSubmit = async (data: HymnFormData) => {
    try {
      const newHymn = await createHymn(data);
      // Redirect to the newly created hymn detail page
      navigate(`/admin/content/hymns/${newHymn.id}`);
    } catch (error) {
      console.error('Failed to create hymn:', error);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/admin/content/hymns');
  };
  
  return (
    <div className="space-y-4">
      <HymnForm
        isSubmitting={isCreating}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateHymn;
