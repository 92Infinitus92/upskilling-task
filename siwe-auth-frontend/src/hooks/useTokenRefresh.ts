import { useEffect, useState } from 'react';

import { BACKEND_URL } from '../helpers/constants';

export function useTokenRefresh() {
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const refreshToken = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Refresh failed with status ${response.status}: ${errorText}`
          );

          if (response.status === 401) {
            setRefreshError('Session expired. Please sign in again.');
            localStorage.removeItem('accessToken');
          }
          return;
        }

        setRefreshError(null);
        const { accessToken } = await response.json();
        localStorage.setItem('accessToken', accessToken);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        setRefreshError('Network error during refresh');
      }
    };

    refreshToken();

    const intervalId = setInterval(refreshToken, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return { refreshError };
}
