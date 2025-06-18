import { useState } from 'react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import { BACKEND_URL } from '../helpers/constants';

export function SecurityTest() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testStandardLogin = async () => {
    if (!address) return setResult('No wallet connected');
    setLoading(true);
    setResult('Testing standard login...');

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

      if (!messageResponse.ok) {
        throw new Error('Failed to fetch message');
      }

      const { message } = await messageResponse.json();
      setResult((prev) => prev + '\n\nBackend-generated message:\n' + message);

      const signature = await signMessageAsync({ message });

      const response = await fetch(`${BACKEND_URL}/auth/siwe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          signature,
        }),
      });

      const data = await response.json();
      setResult(
        (prev) => prev + '\n\nLogin result:\n' + JSON.stringify(data, null, 2)
      );

      if (response.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
    } catch (error) {
      console.error(error);
      setResult(
        (prev) =>
          prev +
          '\n\nError: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const testExploitedLogin = async () => {
    if (!address) return setResult('No wallet connected');
    setLoading(true);
    setResult('Testing exploited login (message tampering)...');

    try {
      // Get a proper message from the backend
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

      if (!messageResponse.ok) {
        throw new Error('Failed to fetch message');
      }

      const { message } = await messageResponse.json();
      setResult((prev) => prev + '\n\nOriginal message:\n' + message);

      const tamperedMessage = message
        .replace(window.location.host, 'malicious-site.com')
        .replace(
          'Sign in with Ethereum to the app.',
          'I authorize the transfer of all my tokens'
        );

      setResult((prev) => prev + '\n\nTampered message:\n' + tamperedMessage);

      const signature = await signMessageAsync({ message: tamperedMessage });

      const response = await fetch(`${BACKEND_URL}/auth/siwe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: tamperedMessage,
          signature,
        }),
      });

      const data = await response.json();
      setResult(
        (prev) =>
          prev + '\n\nExploit attempt result:\n' + JSON.stringify(data, null, 2)
      );

      if (!response.ok) {
        setResult(
          (prev) =>
            prev +
            '\n\n✅ SECURITY CHECK PASSED: Backend correctly rejected the tampered message'
        );
      } else {
        setResult(
          (prev) =>
            prev +
            '\n\n❌ SECURITY VULNERABILITY: Backend accepted a tampered message!'
        );
      }
    } catch (error) {
      console.error(error);
      setResult(
        (prev) =>
          prev +
          '\n\nError: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        margin: '20px 0',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h2>SIWE Security Test</h2>
      <p>This component tests the security of the SIWE authentication:</p>
      <ul>
        <li>
          <strong>Standard Login</strong>: Uses the proper secure flow
        </li>
        <li>
          <strong>Exploit Attempt</strong>: Tries to tamper with the message
        </li>
      </ul>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={testStandardLogin} disabled={loading || !address}>
          Test Standard Login
        </button>

        <button onClick={testExploitedLogin} disabled={loading || !address}>
          Test Exploit Attempt
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
          marginTop: '10px',
          fontFamily: 'monospace',
          maxHeight: '400px',
          overflowY: 'auto',
          color: 'black',
        }}
      >
        {result || 'Click a button to test...'}
      </div>
    </div>
  );
}
