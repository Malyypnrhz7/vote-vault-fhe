import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { 
  createContractInstance, 
  createReadOnlyContract,
  CONTRACT_FUNCTIONS, 
  handleContractError,
  CONTRACT_ERRORS 
} from '@/lib/contract';

interface Proposal {
  id: string;
  title: string;
  description: string;
  forVotes: number;
  againstVotes: number;
  totalVotes: number;
  isActive: boolean;
  isEnded: boolean;
  proposer: string;
  startTime: number;
  endTime: number;
  creationTime: number;
}

interface ContractState {
  contract: any;
  provider: BrowserProvider | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  proposals: Proposal[];
  userVotes: Record<string, boolean>;
}

export const useContract = () => {
  const [state, setState] = useState<ContractState>({
    contract: null,
    provider: null,
    isConnected: false,
    isLoading: false,
    error: null,
    proposals: [],
    userVotes: {}
  });

  // Initialize contract connection
  const initializeContract = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Create provider from injected wallet if available
      let provider: BrowserProvider | null = null;
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        provider = new BrowserProvider((window as any).ethereum);
      }

      // Check if contract address is configured (Vite env)
      const contractAddr = (import.meta as any).env?.VITE_CONTRACT_ADDRESS as string | undefined;
      if (!contractAddr || contractAddr === '0x0000000000000000000000000000000000000000') {
        console.warn('Contract address not configured, running in demo mode');
        setState(prev => ({
          ...prev,
          provider,
          isConnected: true,
          isLoading: false,
          proposals: [] // Empty proposals will trigger demo mode
        }));
        return;
      }
      
      // Build a contract instance that can read without wallet, and write when wallet exists
      let contract: any = createReadOnlyContract();
      if (provider) {
        try {
          contract = await createContractInstance(provider);
        } catch (e) {
          console.warn('Falling back to read-only provider for listing proposals:', e);
        }
      }
      const proposalCount = Number(await CONTRACT_FUNCTIONS.getProposalCount(contract));
      
      // Load existing proposals
      const proposals: Proposal[] = [];
      for (let i = 0; i < proposalCount; i++) {
        try {
          const proposalInfo = await CONTRACT_FUNCTIONS.getProposalInfo(contract, i);
          proposals.push({
            id: i.toString(),
            title: proposalInfo.title,
            description: proposalInfo.description,
            forVotes: Number(proposalInfo.forVotes ?? 0),
            againstVotes: Number(proposalInfo.againstVotes ?? 0),
            totalVotes: Number(proposalInfo.totalVotes ?? 0),
            isActive: proposalInfo.isActive,
            isEnded: proposalInfo.isEnded,
            proposer: proposalInfo.proposer,
            startTime: Number(proposalInfo.startTime ?? 0),
            endTime: Number(proposalInfo.endTime ?? 0),
            creationTime: Number(proposalInfo.creationTime ?? 0)
          });
        } catch (error) {
          console.warn(`Failed to load proposal ${i}:`, error);
        }
      }
      
      setState(prev => ({
        ...prev,
        contract,
        provider,
        isConnected: true,
        isLoading: false,
        proposals
      }));
    } catch (error) {
      console.warn('Contract initialization failed, running in demo mode:', error);
      setState(prev => ({
        ...prev,
        provider: null,
        isConnected: true,
        isLoading: false,
        proposals: [] // Empty proposals will trigger demo mode
      }));
    }
  }, []);

  // Create a new proposal
  const createProposal = useCallback(async (
    title: string,
    description: string,
    durationDays: number
  ) => {
    if (!state.contract) {
      throw new Error('Contract not connected');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const receipt = await CONTRACT_FUNCTIONS.createProposal(
        state.contract,
        title,
        description,
        durationDays
      );
      
      // Reload proposals after creation
      await loadProposals();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return receipt;
    } catch (error) {
      const errorMessage = handleContractError(error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, [state.contract]);

  // Cast a vote
  const castVote = useCallback(async (
    proposalId: string,
    voteChoice: 'for' | 'against'
  ) => {
    if (!state.contract) {
      throw new Error('Contract not connected');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Ensure we have a signer-backed contract for writes
      let contractForWrite: any = state.contract;
      const hasSigner = !!(state.contract?.runner && (state.contract.runner as any).getAddress);
      if (!hasSigner && typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new (await import('ethers')).BrowserProvider((window as any).ethereum);
        contractForWrite = await (await import('@/lib/contract')).createContractInstance(provider);
      }

      const receipt = await CONTRACT_FUNCTIONS.castVote(
        contractForWrite,
        parseInt(proposalId),
        voteChoice
      );
      
      // Update user votes
      setState(prev => ({
        ...prev,
        isLoading: false,
        userVotes: {
          ...prev.userVotes,
          [proposalId]: true
        }
      }));
      
      return receipt;
    } catch (error) {
      const errorMessage = handleContractError(error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, [state.contract]);

  // End a proposal
  const endProposal = useCallback(async (proposalId: string) => {
    if (!state.contract) {
      throw new Error('Contract not connected');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Ensure signer-backed contract for writes
      let contractForWrite: any = state.contract;
      const hasSigner = !!(state.contract?.runner && (state.contract.runner as any).getAddress);
      if (!hasSigner && typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new (await import('ethers')).BrowserProvider((window as any).ethereum);
        contractForWrite = await (await import('@/lib/contract')).createContractInstance(provider);
      }

      const receipt = await CONTRACT_FUNCTIONS.endProposal(
        contractForWrite,
        parseInt(proposalId)
      );
      
      // Reload proposals after ending
      await loadProposals();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return receipt;
    } catch (error) {
      const errorMessage = handleContractError(error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, [state.contract]);

  // Check if user has voted on a proposal
  const checkUserVote = useCallback(async (proposalId: string, userAddress: string) => {
    if (!state.contract) {
      return false;
    }

    try {
      return await CONTRACT_FUNCTIONS.hasVoted(
        state.contract,
        userAddress,
        parseInt(proposalId)
      );
    } catch (error) {
      console.warn('Failed to check user vote:', error);
      return false;
    }
  }, [state.contract]);

  // Load all proposals
  const loadProposals = useCallback(async () => {
    if (!state.contract) {
      return;
    }

    try {
      const proposalCount = Number(await CONTRACT_FUNCTIONS.getProposalCount(state.contract));
      const proposals: Proposal[] = [];
      
      for (let i = 0; i < proposalCount; i++) {
        try {
          const proposalInfo = await CONTRACT_FUNCTIONS.getProposalInfo(state.contract, i);
          proposals.push({
            id: i.toString(),
            title: proposalInfo.title,
            description: proposalInfo.description,
            forVotes: Number(proposalInfo.forVotes ?? 0),
            againstVotes: Number(proposalInfo.againstVotes ?? 0),
            totalVotes: Number(proposalInfo.totalVotes ?? 0),
            isActive: proposalInfo.isActive,
            isEnded: proposalInfo.isEnded,
            proposer: proposalInfo.proposer,
            startTime: Number(proposalInfo.startTime ?? 0),
            endTime: Number(proposalInfo.endTime ?? 0),
            creationTime: Number(proposalInfo.creationTime ?? 0)
          });
        } catch (error) {
          console.warn(`Failed to load proposal ${i}:`, error);
        }
      }
      
      setState(prev => ({ ...prev, proposals }));
    } catch (error) {
      console.warn('Failed to load proposals:', error);
    }
  }, [state.contract]);

  // Check if voting is active for a proposal
  const isVotingActive = useCallback(async (proposalId: string) => {
    if (!state.contract) {
      return false;
    }

    try {
      return await CONTRACT_FUNCTIONS.isVotingActive(
        state.contract,
        parseInt(proposalId)
      );
    } catch (error) {
      console.warn('Failed to check voting status:', error);
      return false;
    }
  }, [state.contract]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Disconnect contract
  const disconnect = useCallback(() => {
    setState({
      contract: null,
      provider: null,
      isConnected: false,
      isLoading: false,
      error: null,
      proposals: [],
      userVotes: {}
    });
  }, []);

  return {
    ...state,
    initializeContract,
    createProposal,
    castVote,
    endProposal,
    checkUserVote,
    loadProposals,
    isVotingActive,
    clearError,
    disconnect
  };
};



