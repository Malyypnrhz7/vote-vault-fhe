import { Vote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import { useContract } from "@/hooks/useContract";

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Wait for MetaMask to be injected
const waitForMetaMask = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.ethereum) {
      resolve(window.ethereum);
      return;
    }

    const checkMetaMask = () => {
      if (window.ethereum) {
        resolve(window.ethereum);
      } else {
        setTimeout(checkMetaMask, 100);
      }
    };

    // Wait up to 3 seconds for MetaMask to inject
    setTimeout(() => {
      reject(new Error('MetaMask not found'));
    }, 3000);

    checkMetaMask();
  });
};

export const Header = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [metaMaskAvailable, setMetaMaskAvailable] = useState(false);
  const [networkName, setNetworkName] = useState<string>("");
  const { initializeContract, isConnected, disconnect: disconnectContract } = useContract();

  // Check MetaMask availability on component mount
  useEffect(() => {
    const checkMetaMask = async () => {
      try {
        const ethereum = await waitForMetaMask();
        setMetaMaskAvailable(ethereum.isMetaMask);
        
        // Get current network
        if (ethereum.isMetaMask) {
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          const networkNames: { [key: string]: string } = {
            '0x1': 'Ethereum Mainnet',
            '0xaa36a7': 'Sepolia Testnet',
            '0x5': 'Goerli Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Polygon Mumbai'
          };
          setNetworkName(networkNames[chainId] || `Network ${chainId}`);
        }
      } catch (error) {
        setMetaMaskAvailable(false);
      }
    };
    
    checkMetaMask();

    // Listen for network changes
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const networkNames: { [key: string]: string } = {
          '0x1': 'Ethereum Mainnet',
          '0xaa36a7': 'Sepolia Testnet',
          '0x5': 'Goerli Testnet',
          '0x89': 'Polygon Mainnet',
          '0x13881': 'Polygon Mumbai'
        };
        setNetworkName(networkNames[chainId] || `Network ${chainId}`);
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Wait for MetaMask to be injected
      const ethereum = await waitForMetaMask();
      
      // Check if MetaMask is available
      if (!ethereum.isMetaMask) {
        alert("Please install MetaMask browser extension. You can download it from https://metamask.io/");
        return;
      }

      // Check and switch to Sepolia network if needed
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      const sepoliaChainId = '0xaa36a7'; // 11155111 in hex
      
      if (chainId !== sepoliaChainId) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: sepoliaChainId,
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://1rpc.io/sepolia'],
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                }],
              });
            } catch (addError) {
              console.error('Failed to add Sepolia network:', addError);
              alert('Please manually add Sepolia test network to your MetaMask');
              return;
            }
          } else {
            console.error('Failed to switch to Sepolia network:', switchError);
            alert('Please switch to Sepolia test network in your MetaMask');
            return;
          }
        }
      }

      // Create provider
      const provider = new BrowserProvider(ethereum);
      
      // Try to get accounts first using native ethereum.request
      let accounts;
      try {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      } catch (requestError: any) {
        console.error("Request accounts error:", requestError);
        
        if (requestError.code === 4001) {
          alert("Please unlock your MetaMask wallet and try again.");
          return;
        } else if (requestError.code === -32002) {
          alert("A connection request is already pending. Please check your MetaMask.");
          return;
        } else if (requestError.message?.includes("User rejected")) {
          alert("Connection rejected. Please try again and approve the connection in MetaMask.");
          return;
        } else {
          // Try alternative method with provider
          try {
            accounts = await provider.send("eth_requestAccounts", []);
          } catch (altError: any) {
            console.error("Alternative request error:", altError);
            throw requestError;
          }
        }
      }

      if (!accounts || accounts.length === 0) {
        alert("No accounts found. Please make sure your MetaMask wallet is unlocked and has accounts.");
        return;
      }

      setWalletAddress(accounts[0]);
      
      // Initialize contract connection
      await initializeContract(provider);
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      
      // Provide more specific error messages
      if (error.message === 'MetaMask not found') {
        alert("MetaMask not detected. Please make sure MetaMask is installed and refresh the page.");
      } else if (error.code === 4001) {
        alert("Connection rejected. Please try again and approve the connection in MetaMask.");
      } else if (error.code === -32002) {
        alert("A connection request is already pending. Please check your MetaMask.");
      } else if (error.message?.includes("User rejected")) {
        alert("Connection rejected. Please try again and approve the connection in MetaMask.");
      } else {
        alert(`Failed to connect wallet: ${error.message || "Unknown error"}. Please make sure MetaMask is installed and unlocked.`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    disconnectContract();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Vote Vault FHE</h1>
              <p className="text-primary-foreground/80 text-sm">
                Confidential DAO Voting Platform
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                {networkName && (
                  <div className="bg-primary-foreground/10 px-2 py-1 rounded text-xs text-primary-foreground/80">
                    {networkName}
                  </div>
                )}
                <div className="bg-primary-foreground/10 px-3 py-2 rounded-md border border-primary-foreground/20">
                  <span className="text-sm font-medium text-primary-foreground">
                    {formatAddress(walletAddress)}
                  </span>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={disconnectWallet}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  variant="secondary"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
                {!metaMaskAvailable && (
                  <div className="text-xs text-primary-foreground/60">
                    {window.ethereum ? "MetaMask Loading..." : "Install MetaMask"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};