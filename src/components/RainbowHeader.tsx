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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
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
