import { useState, useEffect } from "react";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ProposalCard } from "./ProposalCard";
import { BallotBox } from "./BallotBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useContract } from "@/hooks/useContract";

interface Proposal {
  id: string;
  title: string;
  description: string;
  timeRemaining: string;
  totalVotes: number;
}

interface Vote {
  proposalId: string;
  vote: "for" | "against";
}

const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Treasury Allocation for Development Fund",
    description: "Allocate 500,000 tokens from treasury to support core development initiatives for Q2 2024",
    timeRemaining: "2 days 14 hours",
    totalVotes: 1247,
  },
  {
    id: "2", 
    title: "Implementation of New Governance Model",
    description: "Adopt quadratic voting mechanism to improve democratic participation and reduce whale influence",
    timeRemaining: "5 days 3 hours",
    totalVotes: 892,
  },
  {
    id: "3",
    title: "Partnership with DeFi Protocol",
    description: "Strategic partnership to integrate yield farming capabilities into the platform ecosystem",
    timeRemaining: "1 day 8 hours",
    totalVotes: 2156,
  },
];

export const VotingInterface = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [electionEnded, setElectionEnded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { 
    proposals, 
    userVotes, 
    isConnected, 
    castVote, 
    endProposal, 
    isLoading, 
    error,
    initializeContract,
  } = useContract();
  const { openConnectModal } = useConnectModal();

  // Load proposals (read-only) on first render even without wallet
  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  const handleVote = async (proposalId: string, vote: "for" | "against") => {
    // In demo mode (no contract data), simulate voting
    if (proposals.length === 0) {
      setVotes((prev) => [
        ...prev.filter((v) => v.proposalId !== proposalId),
        { proposalId, vote },
      ]);
      toast.success("Demo vote recorded! Deploy contract for real voting.", {
        description: "This is a demo vote. Connect wallet and deploy contract for actual blockchain voting.",
      });
      return;
    }

    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    try {
      await castVote(proposalId, vote);
      setVotes((prev) => [
        ...prev.filter((v) => v.proposalId !== proposalId),
        { proposalId, vote },
      ]);
      toast.success("Vote cast successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cast vote");
    }
  };

  const handleEndElection = async () => {
    // In demo mode (no contract data), simulate ending election
    if (proposals.length === 0) {
      setElectionEnded(true);
      toast.success("Demo election ended!", {
        description: "This is a demo. Deploy contract for real election management.",
      });
      
      setTimeout(() => {
        setShowResults(true);
        toast.success("Demo results revealed!", {
          description: "This is a demo. Deploy contract for real FHE vote decryption.",
        });
      }, 2000);
      return;
    }

    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    try {
      // End all active proposals
      for (const proposal of proposals) {
        if (proposal.isActive && !proposal.isEnded) {
          await endProposal(proposal.id);
        }
      }
      
      setElectionEnded(true);
      toast.success("Election period ended!", {
        description: "All votes are now being decrypted and tallied",
      });
      
      setTimeout(() => {
        setShowResults(true);
        toast.success("Results revealed!", {
          description: "Encrypted votes have been decrypted and results are now available",
        });
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to end election");
    }
  };

  const getVoteForProposal = (proposalId: string) => {
    return votes.find((v) => v.proposalId === proposalId);
  };

  const calculateTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      return "Ended";
    }
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const contractAddr = (import.meta as any).env?.VITE_CONTRACT_ADDRESS as string | undefined;
  const isLiveMode = !!contractAddr && contractAddr !== '0x0000000000000000000000000000000000000000';

  const yourVotesCount = Object.values(userVotes || {}).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Active Proposals</h2>
                <p className="text-muted-foreground">
                  Cast your encrypted votes on current governance proposals
                </p>
              </div>
              <div className="flex gap-2">
                {!electionEnded && (
                  <Button onClick={handleEndElection} variant="outline">
                    End Election
                  </Button>
                )}
                {electionEnded && (
                  <Button
                    onClick={() => setShowResults(!showResults)}
                    variant={showResults ? "secondary" : "default"}
                  >
                    {showResults ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showResults ? "Hide Results" : "Show Results"}
                  </Button>
                )}
              </div>
            </div>

            {showResults && (
              <div className="bg-accent/20 border border-accent rounded-lg p-4">
                <h3 className="font-semibold text-accent-foreground mb-2">Election Results</h3>
                <p className="text-sm text-muted-foreground">
                  Results have been decrypted and are now publicly available
                </p>
              </div>
            )}

            <div className="space-y-4">
              {isLiveMode ? (
                proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    id={proposal.id}
                    title={proposal.title}
                    description={proposal.description}
                    timeRemaining={calculateTimeRemaining(proposal.endTime)}
                    totalVotes={proposal.totalVotes}
                    showEncryptedCount
                    onVote={handleVote}
                    hasVoted={userVotes[proposal.id] || !!getVoteForProposal(proposal.id)}
                    userVote={getVoteForProposal(proposal.id)?.vote}
                  />
                ))
              ) : (
                <>
                  {/* Demo proposals when no contract data is available */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-sm text-yellow-800 font-medium">Demo Mode</p>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Showing demo proposals. Connect wallet and deploy contract to see real data.
                    </p>
                  </div>
                  
                  {mockProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      id={proposal.id}
                      title={proposal.title}
                      description={proposal.description}
                      timeRemaining={proposal.timeRemaining}
                      totalVotes={proposal.totalVotes}
                      onVote={handleVote}
                      hasVoted={!!getVoteForProposal(proposal.id)}
                      userVote={getVoteForProposal(proposal.id)?.vote}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <BallotBox
              isActive={isLiveMode}
              voteCount={yourVotesCount}
              showEncryptedCount={isLiveMode}
              onVoteCast={() => {}}
            />

            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">Election Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Your votes:</span>
                  <Badge variant="secondary">{yourVotesCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mode:</span>
                  <Badge variant={isLiveMode ? "default" : "outline"}>
                    {isLiveMode ? "Live" : "Demo"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={electionEnded ? "destructive" : "default"}>
                    {electionEnded ? "Ended" : "Active"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Results:</span>
                  <Badge variant={showResults ? "default" : "outline"}>
                    {showResults ? "Revealed" : "Encrypted"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2">🔒 Privacy Guaranteed</h4>
              <p className="text-muted-foreground">
                {proposals.length === 0 ? (
                  <>
                    In live mode, all votes are encrypted using Fully Homomorphic Encryption (FHE). 
                    Results remain confidential until the election period ends.
                    <br />
                    <span className="text-yellow-600 font-medium">Demo mode: Simulated voting for testing purposes.</span>
                  </>
                ) : (
                  <>
                    All votes are encrypted using Fully Homomorphic Encryption (FHE). 
                    Results remain confidential until the election period ends.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};