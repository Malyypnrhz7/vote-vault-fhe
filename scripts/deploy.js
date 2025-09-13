// Deployment script for VoteVaultFHE contract
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying VoteVaultFHE contract...");

  // Get the contract factory
  const VoteVaultFHE = await ethers.getContractFactory("VoteVaultFHE");

  // Deploy the contract
  // Note: You'll need to provide a verifier address
  const verifierAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual verifier address
  
  const voteVault = await VoteVaultFHE.deploy(verifierAddress);

  await voteVault.waitForDeployment();

  const contractAddress = await voteVault.getAddress();
  
  console.log("VoteVaultFHE deployed to:", contractAddress);
  console.log("Verifier address:", verifierAddress);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    verifierAddress,
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: await voteVault.runner.getAddress()
  };
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Instructions for updating frontend
  console.log("\nNext steps:");
  console.log("1. Update VITE_CONTRACT_ADDRESS in your .env file with:", contractAddress);
  console.log("2. Update VITE_VERIFIER_ADDRESS in your .env file with:", verifierAddress);
  console.log("3. Redeploy your frontend application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



