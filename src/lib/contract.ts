// Contract configuration and integration for VoteVaultFHE
import { BrowserProvider, Contract, parseEther } from 'ethers';

// Contract ABI - This would be generated from the compiled contract
export const VOTE_VAULT_ABI = [
  // Events
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title)",
  "event VoteCast(uint256 indexed voteId, uint256 indexed proposalId, address indexed voter)",
  "event ProposalEnded(uint256 indexed proposalId, bool isEnded)",
  "event VoteRevealed(uint256 indexed voteId, uint256 indexed proposalId, address indexed voter)",
  "event ResultsDecrypted(uint256 indexed proposalId, uint32 forVotes, uint32 againstVotes)",
  
  // Functions
  "function createProposal(string memory _title, string memory _description, uint256 _duration) external returns (uint256)",
  "function castVote(uint256 _proposalId, bytes calldata voteChoice, bytes calldata inputProof) external returns (uint256)",
  "function endProposal(uint256 _proposalId) external",
  "function revealVote(uint256 _voteId, uint8 _voteChoice, bytes calldata _proof) external",
  "function decryptResults(uint256 _proposalId) external",
  "function updateVoterReputation(address _voter, bytes calldata _reputation) external",
  "function getProposalInfo(uint256 _proposalId) external view returns (string memory, string memory, uint8, uint8, uint8, bool, bool, address, uint256, uint256, uint256)",
  "function getVoteInfo(uint256 _voteId) external view returns (uint8, address, uint256, bool)",
  "function getVoterInfo(address _voter) external view returns (uint8, bool, uint256)",
  "function hasVoted(address _voter, uint256 _proposalId) external view returns (bool)",
  "function getProposalCount() external view returns (uint256)",
  "function getVoteCount() external view returns (uint256)",
  "function isVotingActive(uint256 _proposalId) external view returns (bool)",
  "function canRevealVotes(uint256 _proposalId) external view returns (bool)"
];

// Contract configuration
export const CONTRACT_CONFIG = {
  // Sepolia testnet configuration for FHE
  chainId: 11155111, // Sepolia
  rpcUrl: 'https://1rpc.io/sepolia', // Public RPC endpoint
  contractAddress: '0x0000000000000000000000000000000000000000', // Replace with deployed contract address
  verifierAddress: '0x0000000000000000000000000000000000000000', // Replace with verifier address
};

// Contract instance creation
export const createContractInstance = async (provider: BrowserProvider) => {
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_CONFIG.contractAddress, VOTE_VAULT_ABI, signer);
};

// FHE utility functions
export const FHE_UTILS = {
  // Convert vote choice to encrypted format
  encryptVoteChoice: (choice: 'for' | 'against'): number => {
    return choice === 'for' ? 1 : 0;
  },
  
  // Create mock proof for development
  createMockProof: (): string => {
    return '0x' + '0'.repeat(64); // Mock proof for development
  },
  
  // Format proposal duration
  formatDuration: (days: number): number => {
    return days * 24 * 60 * 60; // Convert days to seconds
  }
};

// Contract interaction functions
export const CONTRACT_FUNCTIONS = {
  // Create a new proposal
  createProposal: async (
    contract: Contract,
    title: string,
    description: string,
    durationDays: number
  ) => {
    const duration = FHE_UTILS.formatDuration(durationDays);
    const tx = await contract.createProposal(title, description, duration);
    const receipt = await tx.wait();
    return receipt;
  },
  
  // Cast a vote
  castVote: async (
    contract: Contract,
    proposalId: number,
    voteChoice: 'for' | 'against'
  ) => {
    const encryptedChoice = FHE_UTILS.encryptVoteChoice(voteChoice);
    const proof = FHE_UTILS.createMockProof();
    const tx = await contract.castVote(proposalId, encryptedChoice, proof);
    const receipt = await tx.wait();
    return receipt;
  },
  
  // End a proposal
  endProposal: async (contract: Contract, proposalId: number) => {
    const tx = await contract.endProposal(proposalId);
    const receipt = await tx.wait();
    return receipt;
  },
  
  // Get proposal information
  getProposalInfo: async (contract: Contract, proposalId: number) => {
    const info = await contract.getProposalInfo(proposalId);
    return {
      title: info[0],
      description: info[1],
      forVotes: info[2],
      againstVotes: info[3],
      totalVotes: info[4],
      isActive: info[5],
      isEnded: info[6],
      proposer: info[7],
      startTime: info[8],
      endTime: info[9],
      creationTime: info[10]
    };
  },
  
  // Check if user has voted
  hasVoted: async (contract: Contract, voterAddress: string, proposalId: number) => {
    return await contract.hasVoted(voterAddress, proposalId);
  },
  
  // Get proposal count
  getProposalCount: async (contract: Contract) => {
    return await contract.getProposalCount();
  },
  
  // Check if voting is active
  isVotingActive: async (contract: Contract, proposalId: number) => {
    return await contract.isVotingActive(proposalId);
  }
};

// Error handling
export const CONTRACT_ERRORS = {
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  USER_REJECTED: 'User rejected the transaction',
  CONTRACT_ERROR: 'Contract execution failed',
  NETWORK_ERROR: 'Network connection error',
  INVALID_ADDRESS: 'Invalid contract address',
  PROPOSAL_NOT_FOUND: 'Proposal not found',
  VOTING_ENDED: 'Voting period has ended',
  ALREADY_VOTED: 'Already voted on this proposal'
};

// Helper function to handle contract errors
export const handleContractError = (error: any): string => {
  if (error.code === 4001) {
    return CONTRACT_ERRORS.USER_REJECTED;
  } else if (error.code === -32603) {
    return CONTRACT_ERRORS.CONTRACT_ERROR;
  } else if (error.message?.includes('insufficient funds')) {
    return CONTRACT_ERRORS.INSUFFICIENT_FUNDS;
  } else if (error.message?.includes('network')) {
    return CONTRACT_ERRORS.NETWORK_ERROR;
  } else {
    return error.message || CONTRACT_ERRORS.CONTRACT_ERROR;
  }
};



