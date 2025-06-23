import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../helpers/constants';

interface ProfileData {
  id?: string;
  address: string;
  name?: string;
  isRegistered: boolean;
}

export function ProfileInfo() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No access token found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (response.status === 401) {
        setError('Unauthorized');
        localStorage.removeItem('accessToken');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const data = await response.json();
      setProfileData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to fetch profile data');
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          margin: '20px 0',
          border: '1px solid #f44336',
          borderRadius: '4px',
        }}
      >
        <h3>Profile Error</h3>
        <p style={{ color: '#f44336' }}>{error}</p>
        <button onClick={fetchProfileData}>Retry</button>
      </div>
    );
  }

  if (!profileData) {
    return <p>No profile data available</p>;
  }

  return (
    <div
      style={{
        padding: '20px',
        margin: '20px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      <h3>User Profile</h3>
      <div style={{ marginTop: '10px' }}>
        <p>
          <strong>Address:</strong> {profileData.address}
        </p>
        {profileData.name && (
          <p>
            <strong>Name:</strong> {profileData.name}
          </p>
        )}
        <p>
          <strong>Registration Status:</strong>{' '}
          {profileData.isRegistered
            ? 'Registered User'
            : 'Not Fully Registered'}
        </p>
        {profileData.id && (
          <p>
            <strong>User ID:</strong> {profileData.id}
          </p>
        )}
      </div>
      <button onClick={fetchProfileData} style={{ marginTop: '10px' }}>
        Refresh Profile
      </button>
    </div>
  );
}
