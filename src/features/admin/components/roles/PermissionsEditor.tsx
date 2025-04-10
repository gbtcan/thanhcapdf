import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../../core/components/ui/card';
import { Switch } from '../../../../core/components/ui/switch';
import { Label } from '../../../../core/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../../../core/components/ui/accordion';
import { 
  RolePermissions, 
  PERMISSION_GROUPS, 
  PERMISSION_LABELS 
} from '../../types/roles';
import { 
  ShieldCheck, 
  User, 
  FileText, 
  Users, 
  MessagesSquare, 
  Settings 
} from 'lucide-react';

interface PermissionsEditorProps {
  value: RolePermissions;
  onChange: (value: RolePermissions) => void;
}

const PermissionsEditor: React.FC<PermissionsEditorProps> = ({
  value,
  onChange
}) => {
  // Group icons mapping
  const groupIcons: Record<string, React.ReactNode> = {
    content: <FileText className="h-5 w-5" />,
    users: <Users className="h-5 w-5" />,
    community: <MessagesSquare className="h-5 w-5" />,
    system: <Settings className="h-5 w-5" />
  };
  
  // Helper để toggle trạng thái một permission
  const togglePermission = (path: string[], checked: boolean) => {
    const newValue = JSON.parse(JSON.stringify(value));
    let current = newValue;
    
    // Duyệt qua các phần tử trong path trừ phần tử cuối cùng
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Cập nhật giá trị permission
    current[path[path.length - 1]] = checked;
    
    onChange(newValue);
  };
  
  // Helper để kiểm tra trạng thái permission
  const getPermissionValue = (path: string[]): boolean => {
    let current = value;
    
    for (let key of path) {
      if (current[key] === undefined) return false;
      current = current[key];
    }
    
    return !!current;
  };
  
  // Render permission groups
  const renderPermissionGroups = () => {
    return PERMISSION_GROUPS.map(group => (
      <AccordionItem key={group.id} value={group.id}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 text-left">
            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md">
              {groupIcons[group.id] || <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-medium">{group.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Quản lý quyền truy cập cho {group.label.toLowerCase()}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/* Nếu có subgroups, render từng subgroup */}
          {group.subgroups ? (
            <div className="space-y-6 pl-4 mt-4">
              {group.subgroups.map(subgroup => (
                <div key={subgroup.id} className="space-y-3">
                  <h4 className="font-medium text-sm">{subgroup.label}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subgroup.permissions.map(permission => (
                      <div 
                        key={`${group.id}-${subgroup.id}-${permission}`} 
                        className="flex items-center justify-between space-x-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md"
                      >
                        <Label className="cursor-pointer">
                          {PERMISSION_LABELS[permission] || permission}
                        </Label>
                        <Switch
                          checked={getPermissionValue([group.id, subgroup.id, permission])}
                          onCheckedChange={(checked) => togglePermission([group.id, subgroup.id, permission], checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Nếu không có subgroups, render permissions trực tiếp */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 mt-4">
              {group.permissions?.map(permission => (
                <div 
                  key={`${group.id}-${permission}`} 
                  className="flex items-center justify-between space-x-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md"
                >
                  <Label className="cursor-pointer">
                    {PERMISSION_LABELS[permission] || permission}
                  </Label>
                  <Switch
                    checked={getPermissionValue([group.id, permission])}
                    onCheckedChange={(checked) => togglePermission([group.id, permission], checked)}
                  />
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    ));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Phân quyền
        </CardTitle>
        <CardDescription>
          Cấu hình quyền truy cập cho vai trò này
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion 
          type="multiple" 
          defaultValue={PERMISSION_GROUPS.map(g => g.id)}
          className="space-y-2"
        >
          {renderPermissionGroups()}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PermissionsEditor;
