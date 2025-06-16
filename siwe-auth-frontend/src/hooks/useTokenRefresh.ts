import { useEffect, useState } from 'react';

const BACKEND_URL = 'http://localhost:3000';

export function useTokenRefresh() {
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return; // No need to set up refresh if not logged in

    // Function to refresh the token
    const refreshToken = async () => {
      try {
        console.log('Attempting to refresh token...');

        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Important for cookies
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Refresh failed with status ${response.status}: ${errorText}`
          );

          if (response.status === 401) {
            console.log(
              'Unauthorized: Refresh token may be expired or invalid'
            );
            setRefreshError('Session expired. Please sign in again.');
            localStorage.removeItem('accessToken');
          }
          return;
        }

        setRefreshError(null);
        const { accessToken } = await response.json();

        // Log token change for debugging
        console.log('Token refreshed:', accessToken.substring(0, 10) + '...');

        localStorage.setItem('accessToken', accessToken);
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh token:', error);
        setRefreshError('Network error during refresh');
      }
    };

    // Run once immediately to check if the token is still valid
    refreshToken();

    // Set up refresh interval (15 seconds for your 30-second token)
    const intervalId = setInterval(refreshToken, 15000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return { refreshError };
}
