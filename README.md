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