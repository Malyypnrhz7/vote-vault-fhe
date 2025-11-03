# Vote Vault FHE - Confidential Voting Platform

## Project Overview

Vote Vault FHE is a secure confidential voting platform built with Fully Homomorphic Encryption (FHE). This platform enables private and secure voting where votes remain encrypted until the election period ends, ensuring voter privacy while maintaining transparency in the final results.

## Features

- **Confidential Voting**: Votes are encrypted using FHE technology
- **Privacy-Preserving**: Individual votes remain private during the voting period
- **Transparent Results**: Final results are publicly verifiable
- **DAO Integration**: Built for decentralized autonomous organization governance
- **Real-time Updates**: Live voting statistics and progress tracking

## Technologies Used

This project is built with:

- **Frontend**: Vite, TypeScript, React
- **UI Components**: shadcn-ui, Tailwind CSS
- **Blockchain**: Solidity, FHE (Fully Homomorphic Encryption)
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Malyypnrhz7/vote-vault-fhe.git
cd vote-vault-fhe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Demo Mode

When you first run the application, it will display demo proposals and allow you to:
- ✅ View sample voting proposals
- ✅ Cast demo votes (simulated)
- ✅ Test the voting interface
- ✅ Experience the election flow

**Note**: Demo mode shows simulated data. To use real blockchain voting:
1. Connect your MetaMask wallet
2. Deploy the smart contract to Sepolia testnet
3. Configure the contract address in environment variables

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn-ui components
│   ├── BallotBox.tsx   # Voting interface component
│   ├── Header.tsx      # Application header
│   ├── ProposalCard.tsx # Proposal display component
│   └── VotingInterface.tsx # Main voting interface
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
│   ├── Index.tsx       # Home page
│   ├── ProposalDetail.tsx # Proposal details page
│   └── NotFound.tsx    # 404 page
└── main.tsx           # Application entry point
```

## Smart Contract Integration

The platform integrates with FHE-enabled smart contracts for:
- Encrypted vote storage
- Privacy-preserving vote counting
- Transparent result verification
- DAO governance mechanisms

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables if needed
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your preferred hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.

## Deployed Contracts

- Network: Sepolia (chainId: 11155111)
- Contract: `VoteVaultFHE`
- Address: [`0x69f51be36dE88a00850827c622c15B03C2F67d79`](https://sepolia.etherscan.io/address/0x69f51be36dE88a00850827c622c15B03C2F67d79)
- Verifier Address: `0x0000000000000000000000000000000000000000`

Recommended dApp environment variables:

```
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://1rpc.io/sepolia
VITE_CONTRACT_ADDRESS=0x69f51be36dE88a00850827c622c15B03C2F67d79
VITE_VERIFIER_ADDRESS=0x0000000000000000000000000000000000000000
VITE_WALLET_CONNECT_PROJECT_ID=<your_walletconnect_project_id>
```

## System Architecture

High-level components and data flow:

```
Frontend (Vite + React + TypeScript)
  ├─ Wallet: RainbowKit + Wagmi (ethers v6 signer for writes, viem/http for reads)
  ├─ Relayer SDK Loader: loads Zama Relayer SDK via CDN and inits FHE instance
  ├─ Contract Module: dynamic encryption (createEncryptedInput → add32 → encrypt)
  ├─ UI:
  │   ├─ VotingInterface: lists proposals (read-only RPC), write ops only with signer
  │   ├─ ProposalCard: vote buttons; disables when hasVoted or proposal ended
  │   └─ BallotBox: shows "Encrypted" in live mode
  └─ Env: VITE_* (RPC URL, chainId, contract address, WalletConnect)

Smart Contract (Solidity, FHEVM)
  ├─ VoteVaultFHE.sol (extends SepoliaConfig)
  │   ├─ castVote(externalEuint32, proof) → homomorphic tally (for/against/total)
  │   ├─ getEncryptedTallies(proposalId) → (bytes32, bytes32, bytes32)
  │   ├─ getProposalInfo(proposalId) → metadata (counts are encrypted client-only)
  │   └─ ACL: FHE.allow for contract/sender/verifier on tallies
  └─ Build: Hardhat + @fhevm/hardhat-plugin (local mock tests)

Relayer (Browser)
  └─ CDN script load → initSDK → createInstance(SepoliaConfig) → encrypt inputs
```

Key behaviors:

- Encrypted counts: In live mode, UI shows `Encrypted` instead of a number. Cleartext tallies are not available until a decryption phase/strategy is implemented (oracle/user-decrypt).
- Vote direction privacy: In live mode, UI only shows "You voted on this proposal" (no FOR/AGAINST text) to preserve privacy.
- Double-vote prevention: UI disables buttons using on-chain `hasVoted` per account and guards writes with proposal `isActive`/`endTime` checks.

## How It Works (MVP Loop)

1) Create proposal: anyone can create proposals with a duration. The contract stores metadata and initializes encrypted counters to zero.
2) Cast vote (encrypted): frontend asks Relayer SDK to encrypt a 0/1 input (against/for) for this contract and the current user, then calls `castVote(handle, proof)`.
3) Homomorphic tally: contract updates `forVotes`, `againstVotes`, `totalVotes` in encrypted form and grants decryption rights to contract, voter, and verifier.
4) Finalize: after `endTime`, proposals become inactive. Results can be decrypted later via oracle/user-decrypt flow (endpoint to be integrated as needed).

## Run Locally

```
npm install
npm run dev
```

Set `.env.local` using the variables above. Live mode is enabled when `VITE_CONTRACT_ADDRESS` is a non-zero address.

## Tests

- Local FHE mock: `npm test` (Hardhat + @fhevm/hardhat-plugin)
- Sepolia integration: `npx hardhat test test/VoteVaultFHESepolia.mjs --network sepolia`

## Troubleshooting

- Vote reverts with "Proposal is not active": The proposal has ended on-chain. UI now guards writes, but if you still see active buttons, refresh or create a new proposal.
- Relayer SDK not initialized / encryption handle all zeros: Provide a valid Relayer setup in production; the app blocks sending mock-encrypted votes on testnet.
- RPC 408 on Vercel: set a stable `VITE_RPC_URL` (Infura/Alchemy or `https://1rpc.io/sepolia`).