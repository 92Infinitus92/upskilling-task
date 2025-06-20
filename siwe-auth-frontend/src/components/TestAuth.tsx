import { useState } from 'react';

import { BACKEND_URL } from '../helpers/constants';

export function TestAuth() {
  const [authStatus, setAuthStatus] = useState<string>('');
  const [lastRequestTime, setLastRequestTime] = useState<string>('');

  const testAuthRequest = async () => {
    try {
      setLastRequestTime(new Date().toLocaleTimeString());

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setAuthStatus('No token available - please log in first');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/test-auth`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setAuthStatus(' Auth Success: ' + (await response.text()));
      } else {
        setAuthStatus(' Auth Failed: ' + response.status);
      }
    } catch (error) {
      setAuthStatus(' Error: ' + String(error));
    }
  };

  return (
    <div
      style={{ padding: '20px', margin: '20px 0', border: '1px solid #ccc' }}
    >
      <h3>Authentication Test</h3>
      <div>
        <button onClick={testAuthRequest}>Test Auth Request</button>
        <span style={{ marginLeft: '10px' }}>
          Last Request: {lastRequestTime}
        </span>
      </div>
      <div>Status: {authStatus}</div>
    </div>
  );
}
