import { ConnectWallet } from './components/ConnectWallet';
import { TestAuth } from './components/TestAuth';
import { SecurityTest } from './components/SecurityTest';

import { useTokenRefresh } from './hooks/useTokenRefresh';

import './App.css';

function App() {
  const { refreshError } = useTokenRefresh();

  return (
    <div className='App'>
      <h1>SIWE Auth Demo</h1>
      <ConnectWallet />

      {refreshError && (
        <div style={{ color: 'red', margin: '10px 0' }}>{refreshError}</div>
      )}

      <TestAuth />

      <SecurityTest />
    </div>
  );
}

export default App;
