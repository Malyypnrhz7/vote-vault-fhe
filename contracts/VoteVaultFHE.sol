// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract VoteVaultFHE is SepoliaConfig {
    using FHE for *;
    
    struct Proposal {
        euint32 proposalId;
        string title;
        string description;
        euint32 forVotes;
        euint32 againstVotes;
        euint32 totalVotes;
        bool isActive;
        bool isEnded;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 creationTime;
    }
    
    struct Vote {
        euint32 voteId;
        euint32 proposalId;
        euint32 voteChoice; // 0 = against, 1 = for
        address voter;
        uint256 timestamp;
        bool isRevealed;
    }
    
    struct Voter {
        euint32 reputation;
        bool hasVoted;
        uint256 lastVoteTime;
        address voterAddress;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote) public votes;
    mapping(address => Voter) public voters;
    mapping(address => mapping(uint256 => bool)) public hasVotedOnProposal;
    
    uint256 public proposalCounter;
    uint256 public voteCounter;
    
    address public owner;
    address public verifier;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant REVEAL_PERIOD = 1 days;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed voteId, uint256 indexed proposalId, address indexed voter);
    event ProposalEnded(uint256 indexed proposalId, bool isEnded);
    event VoteRevealed(uint256 indexed voteId, uint256 indexed proposalId, address indexed voter);
    event ResultsDecrypted(uint256 indexed proposalId, uint32 forVotes, uint32 againstVotes);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can call this function");
        _;
    }
    
    modifier proposalExists(uint256 _proposalId) {
        require(proposals[_proposalId].proposer != address(0), "Proposal does not exist");
        _;
    }
    
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _duration
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Proposal title cannot be empty");
        require(bytes(_description).length > 0, "Proposal description cannot be empty");
        require(_duration > 0, "Duration must be positive");
        require(_duration <= 30 days, "Duration cannot exceed 30 days");
        
        uint256 proposalId = proposalCounter++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;
        
        proposals[proposalId] = Proposal({
            proposalId: FHE.asEuint32(0), // Will be set properly later
            title: _title,
            description: _description,
            forVotes: FHE.asEuint32(0),
            againstVotes: FHE.asEuint32(0),
            totalVotes: FHE.asEuint32(0),
            isActive: true,
            isEnded: false,
            proposer: msg.sender,
            startTime: startTime,
            endTime: endTime,
            creationTime: block.timestamp
        });
        
        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }
    
    function castVote(
        uint256 _proposalId,
        externalEuint32 voteChoice,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(proposals[_proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[_proposalId].isActive, "Proposal is not active");
        require(block.timestamp <= proposals[_proposalId].endTime, "Voting period has ended");
        require(!hasVotedOnProposal[msg.sender][_proposalId], "Already voted on this proposal");
        
        // Convert to internal encrypted value (expected 0 or 1)
        euint32 encryptedChoice = FHE.fromExternal(voteChoice, inputProof);
        
        uint256 voteId = voteCounter++;
        
        votes[voteId] = Vote({
            voteId: FHE.asEuint32(0), // Will be set properly later
            proposalId: FHE.asEuint32(0), // Will be set properly later
            voteChoice: encryptedChoice,
            voter: msg.sender,
            timestamp: block.timestamp,
            isRevealed: false
        });
        
        // Homomorphic tally update based on encrypted vote choice (0 = against, 1 = for)
        euint32 one = FHE.asEuint32(1);
        euint32 forInc = encryptedChoice;
        euint32 againstInc = FHE.sub(one, encryptedChoice);

        proposals[_proposalId].forVotes = FHE.add(proposals[_proposalId].forVotes, forInc);
        proposals[_proposalId].againstVotes = FHE.add(proposals[_proposalId].againstVotes, againstInc);
        proposals[_proposalId].totalVotes = FHE.add(proposals[_proposalId].totalVotes, one);

        // Grant decryption rights to contract, the caller and the verifier for the tallies
        FHE.allowThis(proposals[_proposalId].forVotes);
        FHE.allowThis(proposals[_proposalId].againstVotes);
        FHE.allowThis(proposals[_proposalId].totalVotes);

        FHE.allow(proposals[_proposalId].forVotes, msg.sender);
        FHE.allow(proposals[_proposalId].againstVotes, msg.sender);
        FHE.allow(proposals[_proposalId].totalVotes, msg.sender);

        if (verifier != address(0)) {
            FHE.allow(proposals[_proposalId].forVotes, verifier);
            FHE.allow(proposals[_proposalId].againstVotes, verifier);
            FHE.allow(proposals[_proposalId].totalVotes, verifier);
        }
        
        // Mark voter as having voted on this proposal
        hasVotedOnProposal[msg.sender][_proposalId] = true;
        
        // Update voter record
        voters[msg.sender] = Voter({
            reputation: FHE.asEuint32(0), // Will be set by verifier
            hasVoted: true,
            lastVoteTime: block.timestamp,
            voterAddress: msg.sender
        });
        
        emit VoteCast(voteId, _proposalId, msg.sender);
        return voteId;
    }
    
    function endProposal(uint256 _proposalId) public {
        require(proposals[_proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[_proposalId].isActive, "Proposal is already ended");
        require(
            block.timestamp > proposals[_proposalId].endTime || msg.sender == owner,
            "Cannot end proposal before voting period ends"
        );
        
        proposals[_proposalId].isActive = false;
        proposals[_proposalId].isEnded = true;
        
        emit ProposalEnded(_proposalId, true);
    }
    
    function revealVote(
        uint256 _voteId,
        uint8 _voteChoice,
        bytes calldata _proof
    ) public {
        require(votes[_voteId].voter != address(0), "Vote does not exist");
        require(votes[_voteId].voter == msg.sender, "Only voter can reveal their vote");
        require(!votes[_voteId].isRevealed, "Vote already revealed");
        
        // Verify the revealed vote matches the encrypted vote
        // This would involve FHE verification in a real implementation
        votes[_voteId].isRevealed = true;
        
        // Update proposal vote counts based on revealed vote
        uint256 proposalId = 0; // This would be decrypted from the encrypted proposalId
        if (_voteChoice == 1) {
            proposals[proposalId].forVotes = FHE.add(proposals[proposalId].forVotes, FHE.asEuint32(1));
        } else {
            proposals[proposalId].againstVotes = FHE.add(proposals[proposalId].againstVotes, FHE.asEuint32(1));
        }
        
        emit VoteRevealed(_voteId, proposalId, msg.sender);
    }
    
    function decryptResults(uint256 _proposalId) public onlyVerifier {
        require(proposals[_proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[_proposalId].isEnded, "Proposal must be ended first");
        require(block.timestamp > proposals[_proposalId].endTime + REVEAL_PERIOD, "Reveal period not ended");
        
        // In a real implementation, this would decrypt the FHE values
        // For now, we'll emit the event with placeholder values
        emit ResultsDecrypted(_proposalId, 0, 0); // Values would be decrypted from FHE
    }
    
    function updateVoterReputation(address _voter, euint32 _reputation) public onlyVerifier {
        require(_voter != address(0), "Invalid voter address");
        
        voters[_voter].reputation = _reputation;
    }
    
    function getProposalInfo(uint256 _proposalId) public view returns (
        string memory title,
        string memory description,
        uint8 forVotes,
        uint8 againstVotes,
        uint8 totalVotes,
        bool isActive,
        bool isEnded,
        address proposer,
        uint256 startTime,
        uint256 endTime,
        uint256 creationTime
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            0,
            0,
            0,
            proposal.isActive,
            proposal.isEnded,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.creationTime
        );
    }

    /// @notice Returns encrypted tallies for a proposal (for off-chain decryption)
    /// @dev Consumers should use user decryption to read values when permitted
    function getEncryptedTallies(uint256 _proposalId)
        external
        view
        returns (euint32 forVotes, euint32 againstVotes, euint32 totalVotes)
    {
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.forVotes, proposal.againstVotes, proposal.totalVotes);
    }
    
    function getVoteInfo(uint256 _voteId) public view returns (
        uint8 voteChoice,
        address voter,
        uint256 timestamp,
        bool isRevealed
    ) {
        Vote storage vote = votes[_voteId];
        return (
            0, // FHE.decrypt(vote.voteChoice) - will be decrypted off-chain
            vote.voter,
            vote.timestamp,
            vote.isRevealed
        );
    }
    
    function getVoterInfo(address _voter) public view returns (
        uint8 reputation,
        bool hasVoted,
        uint256 lastVoteTime
    ) {
        Voter storage voter = voters[_voter];
        return (
            0, // FHE.decrypt(voter.reputation) - will be decrypted off-chain
            voter.hasVoted,
            voter.lastVoteTime
        );
    }
    
    function hasVoted(address _voter, uint256 _proposalId) public view returns (bool) {
        return hasVotedOnProposal[_voter][_proposalId];
    }
    
    function getProposalCount() public view returns (uint256) {
        return proposalCounter;
    }
    
    function getVoteCount() public view returns (uint256) {
        return voteCounter;
    }
    
    function isVotingActive(uint256 _proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        return proposal.isActive && block.timestamp <= proposal.endTime;
    }
    
    function canRevealVotes(uint256 _proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        return proposal.isEnded && block.timestamp > proposal.endTime + REVEAL_PERIOD;
    }
}



