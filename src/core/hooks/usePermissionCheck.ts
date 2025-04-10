import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, Permission } from '../../lib/permissions';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

/**
 * Hook to check permissions and handle unauthorized actions
 */
export function usePermissionCheck() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  /**
   * Check if user can perform an action and handle if they can't
   */
  const checkPermission = (permission: Permission): boolean => {
    const can = hasPermission(user, permission);
    
    if (!can) {
      addNotification({
        type: 'error',
        title: 'Không có quyền',
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    
    return can;
  };
  
  /**
   * Secure function execution with permission check
   */
  const withPermission = <T extends (...args: any[]) => any>(
    permission: Permission,
    fn: T,
    fallback?: () => void
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      if (checkPermission(permission)) {
        return fn(...args);
      }
      
      if (fallback) {
        fallback();
      }
      
      return undefined as unknown as ReturnType<T>;
    };
  };
  
  /**
   * Redirect to access denied page
   */
  const redirectToAccessDenied = () => {
    navigate('/access-denied');
  };
  
  return {
    checkPermission,
    withPermission,
    redirectToAccessDenied
  };
}
