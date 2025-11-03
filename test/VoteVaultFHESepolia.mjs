import pkg from "hardhat";
const { ethers, fhevm } = pkg;

describe("VoteVaultFHE (Sepolia integration)", function () {
  before(function () {
    if (fhevm.isMock) {
      console.warn("Skipping Sepolia test on local FHEVM mock");
      this.skip();
    }
  });

  it("prints network and exits (placeholder)", async function () {
    const network = await ethers.provider.getNetwork();
    console.log("Running on chainId:", network.chainId.toString());
  });
});


