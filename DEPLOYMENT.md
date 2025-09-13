# Vote Vault FHE - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Vote Vault FHE application to Vercel.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Vercel account
- GitHub repository
- MetaMask wallet
- Infura or Alchemy account for RPC endpoint

## Pre-Deployment Setup

### 1. Environment Configuration

1. Copy the environment example file:
```bash
cp env.example .env.local
```

2. Update the environment variables in `.env.local`:
```env
VITE_APP_NAME=Vote Vault FHE
VITE_APP_DESCRIPTION=Privacy-preserving voting platform with Fully Homomorphic Encryption
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_VERIFIER_ADDRESS=0x0000000000000000000000000000000000000000
```

### 2. Smart Contract Deployment

Before deploying the frontend, you need to deploy the smart contract:

1. Install Hardhat and dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @fhevm/solidity
```

2. Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. Deploy the contract:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

4. Update the contract address in your environment variables.

### 3. Build and Test Locally

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Test the build locally:
```bash
npm run preview
```

## Vercel Deployment

### Method 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project directory:
```bash
vercel
```

4. Follow the prompts to configure your project.

### Method 2: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)

2. Click "New Project"

3. Import your GitHub repository

4. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Add environment variables in the Vercel dashboard:
   - `VITE_APP_NAME`
   - `VITE_APP_DESCRIPTION`
   - `VITE_CHAIN_ID`
   - `VITE_RPC_URL`
   - `VITE_CONTRACT_ADDRESS`
   - `VITE_VERIFIER_ADDRESS`

6. Click "Deploy"

## Post-Deployment Configuration

### 1. Domain Configuration

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain if needed
4. Configure DNS settings as instructed

### 2. Environment Variables

Ensure all environment variables are properly set in the Vercel dashboard:
- Production environment variables
- Preview environment variables (for testing)

### 3. Build Configuration

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Rewrites for SPA routing
- Cache headers for assets

## Testing the Deployment

### 1. Basic Functionality

1. Visit your deployed URL
2. Connect MetaMask wallet
3. Verify wallet connection works
4. Check if proposals load correctly

### 2. Contract Integration

1. Ensure contract address is correct
2. Test voting functionality
3. Verify transaction confirmations
4. Check vote counting

### 3. FHE Features

1. Test encrypted vote casting
2. Verify vote privacy
3. Test result decryption
4. Check FHE network connectivity

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Contract Connection Issues**
   - Verify contract address
   - Check RPC URL configuration
   - Ensure correct network (Sepolia)

3. **Wallet Connection Problems**
   - Check MetaMask installation
   - Verify network configuration
   - Check for CORS issues

4. **FHE Integration Issues**
   - Verify FHE network connectivity
   - Check relayer configuration
   - Ensure proper encryption setup

### Debug Mode

Enable debug mode by setting:
```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive keys to repository
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **Contract Security**
   - Audit smart contracts before deployment
   - Use verified contract addresses
   - Implement proper access controls

3. **Frontend Security**
   - Validate all user inputs
   - Implement proper error handling
   - Use HTTPS in production

## Monitoring and Maintenance

### 1. Analytics

- Set up Vercel Analytics
- Monitor user interactions
- Track voting patterns

### 2. Performance

- Monitor build times
- Check bundle sizes
- Optimize loading performance

### 3. Updates

- Regular dependency updates
- Security patches
- Feature enhancements

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Test locally first
4. Contact support if needed

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [FHE Documentation](https://docs.zama.ai/fhevm)
- [Ethereum Sepolia Testnet](https://sepolia.dev/)



