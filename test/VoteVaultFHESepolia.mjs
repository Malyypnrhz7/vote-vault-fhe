import pkg from "hardhat";
const { ethers, fhevm } = pkg;

// Frontend-like sample data (meaningful proposals)
const SAMPLE_PROPOSALS = [
  {
    title: "Treasury Allocation for Development Fund",
    description:
      "Allocate 500,000 tokens from treasury to support core development initiatives for Q2 2024",
    // 2 days 14 hours => 2*24*3600 + 14*3600
    durationSec: 2 * 24 * 60 * 60 + 14 * 60 * 60,
    sampleVotesLabel: "1247 votes",
    tryVote: "for",
  },
  {
    title: "Implementation of New Governance Model",
    description:
      "Adopt quadratic voting mechanism to improve democratic participation and reduce whale influence",
    // 5 days 3 hours
    durationSec: 5 * 24 * 60 * 60 + 3 * 60 * 60,
    sampleVotesLabel: "892 votes",
    tryVote: "against",
  },
  {
    title: "Partnership with DeFi Protocol",
    description:
      "Strategic partnership to integrate yield farming capabilities into the platform ecosystem",
    // 1 day 8 hours
    durationSec: 1 * 24 * 60 * 60 + 8 * 60 * 60,
    sampleVotesLabel: "2156 votes",
    tryVote: null, // only read/close flow
  },
];

describe("VoteVaultFHE (Sepolia integration)", function () {
  before(function () {
    if (fhevm.isMock) {
      console.warn("Skipping Sepolia test on local FHEVM mock");
      this.skip();
    }
  });

  it("create proposals with meaningful data, try encrypted votes, end, read tallies", async function () {
    this.timeout(180000);
    this.slow(60000);
    const network = await ethers.provider.getNetwork();
    console.log("Running on chainId:", network.chainId.toString());

    const signer = (await ethers.getSigners())[0];
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x69f51be36dE88a00850827c622c15B03C2F67d79";

    const VoteVault = await ethers.getContractFactory("VoteVaultFHE");
    const contract = VoteVault.attach(CONTRACT_ADDRESS).connect(signer);

    for (const [idx, p] of SAMPLE_PROPOSALS.entries()) {
      console.log(`\n[Create] ${p.title} — Pending — ${p.sampleVotesLabel}`);
      console.log(p.description);

      // 1) Create proposal (frontend create flow)
      const txCreate = await contract.createProposal(p.title, p.description, p.durationSec);
      await txCreate.wait();
      const count = await contract.getProposalCount();
      const proposalId = Number(count) - 1;
      console.log("Created proposalId:", proposalId, "durationSec:", p.durationSec);

      // 2) Try encrypted vote (frontend cast flow) — optional per proposal config
      if (p.tryVote) {
        try {
          const sdk = await import("@zama-fhe/relayer-sdk");
          const bit = p.tryVote === "for" ? 1 : 0;
          const enc = await sdk
            .createEncryptedInput(CONTRACT_ADDRESS, await signer.getAddress())
            .add32(bit)
            .encrypt();
          await (await contract.castVote(proposalId, enc.handles[0], enc.inputProof)).wait();
          console.log(`Encrypted vote '${p.tryVote}' cast on Sepolia for proposal ${proposalId}`);
        } catch (e) {
          console.warn(`Relayer encryption not available, skipping vote for proposal ${proposalId}:`, e.message || e);
        }
      }

      // 3) End proposal (frontend finalize flow)
      const txEnd = await contract.endProposal(proposalId);
      await txEnd.wait();
      console.log("Proposal ended:", proposalId);

      // 4) Read encrypted tallies (frontend view/decrypt flow)
      const [forEnc, againstEnc, totalEnc] = await contract.getEncryptedTallies(proposalId);
      console.log("Encrypted tallies:", { forEnc, againstEnc, totalEnc });

      // 5) Sanity: read proposal info
      const info = await contract.getProposalInfo(proposalId);
      console.log("Proposal info:", { title: info[0], isActive: info[5], isEnded: info[6] });
    }
  });
});


