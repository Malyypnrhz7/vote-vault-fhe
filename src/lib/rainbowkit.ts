import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Vote Vault FHE',
  projectId: (import.meta as any).env?.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http((import.meta as any).env?.VITE_RPC_URL || 'https://1rpc.io/sepolia'),
  },
  ssr: false,
});
