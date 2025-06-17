import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';

import { WagmiProvider } from 'wagmi';
import { config } from './config';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
