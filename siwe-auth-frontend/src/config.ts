import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  // Connectors will be added later when we implement the actual wallet connection logic.
  // For now, this basic config allows Wagmi to read data if a wallet is already connected.
});
