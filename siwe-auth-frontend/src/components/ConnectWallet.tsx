import { useEffect, useState } from 'react';

import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useChainId,
} from 'wagmi';

import { BACKEND_URL } from '../helpers/constants';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleConnect = async () => {
    setError(null);

    const metamaskConnector = connectors.find(
      (c) => c.id === 'io.metamask' || c.id === 'injected'
    );

    if (metamaskConnector) {
      try {
        await connect({ connector: metamaskConnector });
      } catch (error) {
        console.error('Connection failed', error);
        setError(
          'Failed to connect wallet. Is MetaMask installed and unlocked?'
        );
      }
    } else {
      setError('MetaMask connector not found. Please install MetaMask.');
    }
  };

  const handleSignIn = async () => {
    if (!address || !chainId) {
      setError('Wallet not connected or chain ID unavailable.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const messageResponse = await fetch(`${BACKEND_URL}/auth/siwe-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          chainId,
          domain: window.location.host,
          uri: window.location.origin,
        }),
      });

      const { message } = await messageResponse.json();

      const signature = await signMessageAsync({ message });

      const siweResponse = await fetch(`${BACKEND_URL}/auth/siwe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message, signature }),
      });

      if (!siweResponse.ok) {
        throw new Error('Failed to sign in with Ethereum');
      }

      const { accessToken } = await siweResponse.json();

      localStorage.setItem('accessToken', accessToken);

      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Login error', error);
      setError('Failed to sign in with Ethereum');
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      disconnect();
      setError(null);
    }
  };

  if (!isConnected) {
    return (
      <div>
        <button
          onClick={handleConnect}
          disabled={isLoading || connectors.length === 0}
        >
          {connectors.length === 0
            ? 'Loading connectors...'
            : 'Connect MetaMask'}
        </button>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p>Connected: {address}</p>
        <p>Chain ID: {chainId}</p>
        <button onClick={handleSignIn} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign-In With Ethereum'}
        </button>
        <button onClick={handleSignOut} style={{ marginLeft: '10px' }}>
          Disconnect Wallet
        </button>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    );
  }

  return (
    <div>
      <p>Authenticated as: {address}</p>
      <button onClick={handleSignOut} disabled={isLoading}>
        Sign Out
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
