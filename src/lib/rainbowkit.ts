import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Vote Vault FHE',
  projectId: process.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [sepolia],
  ssr: false,
});
