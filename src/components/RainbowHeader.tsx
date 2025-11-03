import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import { useEffect } from 'react';

export const RainbowHeader = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { initializeContract, isConnected: contractConnected, disconnect: disconnectContract } = useContract();

  // Initialize contract when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initializeContract();
    } else if (!isConnected) {
      disconnectContract();
    }
  }, [isConnected, address, initializeContract, disconnectContract]);

  const handleDisconnect = () => {
    disconnectContract();
    disconnect();
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="Vote Vault FHE" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Vote Vault FHE
                </h1>
                <p className="text-sm text-blue-200">
                  Privacy-First Voting Platform
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status and Wallet Button */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${contractConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-blue-200">
                {contractConnected ? 'Contract Connected' : 'Demo Mode'}
              </span>
            </div>

            {/* RainbowKit Connect Button */}
            <ConnectButton 
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 max-w-3xl">
          <p className="text-lg text-blue-100 leading-relaxed">
            Experience the future of voting with <span className="font-semibold text-blue-300">Fully Homomorphic Encryption (FHE)</span>. 
            Cast your votes with complete privacy while maintaining transparency and verifiability.
          </p>
          <div className="mt-4 flex items-center space-x-6 text-sm text-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Privacy Guaranteed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Transparent Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Decentralized</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
