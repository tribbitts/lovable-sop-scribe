
import { useState, useEffect } from 'react';
import { checkIsAdmin } from '@/hooks/pdf-export/permissions';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to check if current user is an admin
 */
export const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        // Special case for our admin user
        if (user.email === 'Onoki82@gmail.com') {
          setIsAdmin(true);
          setChecking(false);
          return;
        }

        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, checking };
};
