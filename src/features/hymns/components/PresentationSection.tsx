import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '../../../core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../core/components/ui/tabs';
import { Button } from '../../../core/components/ui/button';
import { HymnPresentationFile } from '../types';
import { Presentation, Download, ExternalLink } from 'lucide-react';

interface PresentationSectionProps {
  presentationFiles: HymnPresentationFile[];
}

const PresentationSection: React.FC<PresentationSectionProps> = ({ presentationFiles }) => {
  const [selectedPresentationId, setSelectedPresentationId] = useState<string>(
    presentationFiles[0]?.id || ''
  );
  
  const selectedPresentation = presentationFiles.find(
    presentation => presentation.id === selectedPresentationId
  ) || presentationFiles[0];
  
  if (presentationFiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Presentation className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500">Không có tệp trình chiếu nào cho thánh ca này.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Function to determine how to display the presentation
  const canEmbed = (url: string): boolean => {
    return url.includes('docs.google.com') || 
           url.includes('office.com') || 
           url.includes('canva.com');
  };
  
  return (
    <div className="space-y-4">
      {/* Presentation selector */}
      {presentationFiles.length > 1 && (
        <Tabs 
          value={selectedPresentationId} 
          onValueChange={setSelectedPresentationId}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Chọn trình chiếu:</h3>
            <TabsList>
              {presentationFiles.map((presentation, index) => (
                <TabsTrigger key={presentation.id} value={presentation.id}>
                  {presentation.description || `Trình chiếu ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}
      
      {/* Presentation display */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedPresentation.description || `Trình chiếu - ${selectedPresentation.file_name}`}
          </CardTitle>
          <CardDescription>
            {selectedPresentation.source && `Nguồn: ${selectedPresentation.source}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {canEmbed(selectedPresentation.presentation_url) ? (
            <iframe
              src={selectedPresentation.presentation_url}
              className="w-full h-[500px]"
              title={selectedPresentation.description || 'Trình chiếu thánh ca'}
              allow="fullscreen"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Presentation className="h-16 w-16 text-primary mb-4" />
              <p className="text-lg font-medium mb-2">
                Không thể nhúng trình chiếu
              </p>
              <p className="text-gray-500 mb-4">
                Bấm nút bên dưới để tải xuống hoặc xem trực tiếp tệp trình chiếu này.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center p-4 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            {selectedPresentation.uploader && 
              `Đăng bởi: ${selectedPresentation.uploader.name}`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={selectedPresentation.presentation_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Mở trong tab mới
              </a>
            </Button>
            <Button variant="default" size="sm" asChild>
              <a href={selectedPresentation.presentation_url} download>
                <Download className="h-4 w-4 mr-1" />
                Tải xuống
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PresentationSection;
