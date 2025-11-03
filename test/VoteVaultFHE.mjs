import { expect } from "chai";
import pkg from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
const { ethers, fhevm } = pkg;

describe("VoteVaultFHE (local FHE mock)", function () {
  before(function () {
    if (!fhevm.isMock) {
      console.warn("This test suite runs only on local FHEVM mock (hardhat network)");
      this.skip();
    }
  });

  it("create proposal and tally encrypted votes", async function () {
    const [deployer, alice, bob] = await ethers.getSigners();

    const VoteVault = await ethers.getContractFactory("VoteVaultFHE");
    const contract = await VoteVault.deploy(await deployer.getAddress());
    const contractAddress = await contract.getAddress();

    // Create proposal
    const txCreate = await contract.createProposal("Test", "Test desc", 7 * 24 * 60 * 60);
    await txCreate.wait();

    // Encrypt YES (1) vote by Alice
    const encYes = await fhevm
      .createEncryptedInput(contractAddress, await alice.getAddress())
      .add32(1)
      .encrypt();
    await (await contract.connect(alice).castVote(0, encYes.handles[0], encYes.inputProof)).wait();

    // Encrypt NO (0) vote by Bob
    const encNo = await fhevm
      .createEncryptedInput(contractAddress, await bob.getAddress())
      .add32(0)
      .encrypt();
    await (await contract.connect(bob).castVote(0, encNo.handles[0], encNo.inputProof)).wait();

    // Read encrypted tallies and decrypt as the last voter (has decrypt rights)
    const [forEnc, againstEnc, totalEnc] = await contract.getEncryptedTallies(0);
    const forClear = await fhevm.userDecryptEuint(FhevmType.euint32, forEnc, contractAddress, bob);
    const againstClear = await fhevm.userDecryptEuint(FhevmType.euint32, againstEnc, contractAddress, bob);
    const totalClear = await fhevm.userDecryptEuint(FhevmType.euint32, totalEnc, contractAddress, bob);

    expect(forClear).to.equal(1);
    expect(againstClear).to.equal(1);
    expect(totalClear).to.equal(2);
  });
});


