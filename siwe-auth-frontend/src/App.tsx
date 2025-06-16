import './App.css';
import { ConnectWallet } from './components/ConnectWallet';
import { useTokenRefresh } from './hooks/useTokenRefresh';
import { TestAuth } from './components/TestAuth';

function App() {
  // Call the hook to set up automatic token refresh
  const { refreshError } = useTokenRefresh();

  return (
    <div className='App'>
      <h1>SIWE Auth Demo</h1>
      <ConnectWallet />

      {refreshError && (
        <div style={{ color: 'red', margin: '10px 0' }}>{refreshError}</div>
      )}

      <TestAuth />
    </div>
  );
}

export default App;
