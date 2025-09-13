import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Users, 
  Calendar,
  DollarSign,
  Target,
  FileText
} from "lucide-react";
import { Header } from "@/components/Header";
import { toast } from "sonner";

// Extended proposal data with more details
const proposalDetails = {
  "1": {
    id: "1",
    title: "Treasury Allocation for Development Fund",
    description: "Allocate 500,000 tokens from treasury to support core development initiatives for Q2 2024",
    fullDescription: `This proposal aims to allocate 500,000 tokens from our treasury reserves to establish a dedicated development fund for Q2 2024. The fund will be used to accelerate core platform development, hire additional developers, and fund critical infrastructure improvements.

The allocation will be distributed as follows:
• 60% for core development team expansion
• 25% for infrastructure and security upgrades  
• 10% for third-party audits and testing
• 5% for emergency bug fixes and maintenance

This initiative is crucial for maintaining our competitive edge and ensuring the platform's long-term sustainability.`,
    timeRemaining: "2 days 14 hours",
    totalVotes: 1247,
    createdDate: "2024-01-15",
    proposer: "0x742d35Cc6432C56C2B2B7B8E4d1A2e34Fc5e0123",
    category: "Treasury",
    requiredQuorum: 1500,
    currentForVotes: 892,
    currentAgainstVotes: 355,
    timeline: [
      { date: "2024-01-15", event: "Proposal Created" },
      { date: "2024-01-16", event: "Community Discussion Period Started" },
      { date: "2024-01-20", event: "Voting Period Opened" },
      { date: "2024-01-25", event: "Voting Deadline" }
    ]
  },
  "2": {
    id: "2",
    title: "Implementation of New Governance Model",
    description: "Adopt quadratic voting mechanism to improve democratic participation and reduce whale influence",
    fullDescription: `This proposal introduces a quadratic voting mechanism to our governance system, designed to create a more democratic and equitable voting process. The new system will reduce the influence of large token holders while giving more voice to smaller participants.

Key features of the new system:
• Quadratic cost for additional votes (1 vote = 1 token, 2 votes = 4 tokens, etc.)
• Maximum vote limit per proposal to prevent extreme concentration
• Delegation system for users who prefer not to vote directly
• Reputation-based voting weight adjustments

This change will make our DAO more resilient to whale manipulation and encourage broader community participation in governance decisions.`,
    timeRemaining: "5 days 3 hours",
    totalVotes: 892,
    createdDate: "2024-01-12",
    proposer: "0x847c29Bb6543F78A2B2B7C9F5d1B3f45Gc6e0456",
    category: "Governance",
    requiredQuorum: 1000,
    currentForVotes: 623,
    currentAgainstVotes: 269,
    timeline: [
      { date: "2024-01-12", event: "Proposal Created" },
      { date: "2024-01-13", event: "Technical Review Completed" },
      { date: "2024-01-18", event: "Voting Period Opened" },
      { date: "2024-01-28", event: "Voting Deadline" }
    ]
  },
  "3": {
    id: "3",
    title: "Partnership with DeFi Protocol",
    description: "Strategic partnership to integrate yield farming capabilities into the platform ecosystem",
    fullDescription: `This proposal outlines a strategic partnership with a leading DeFi protocol to integrate yield farming capabilities directly into our platform. This integration will allow our users to earn additional rewards on their token holdings while participating in governance.

Partnership benefits:
• Native yield farming integration with competitive APY rates
• Reduced gas fees through optimized smart contract interactions  
• Automatic compounding of rewards for long-term holders
• Enhanced liquidity for our token through partner protocol's pools

The partnership includes a revenue-sharing agreement where 15% of farming fees will be distributed back to token holders, creating additional value for our community members.`,
    timeRemaining: "1 day 8 hours",
    totalVotes: 2156,
    createdDate: "2024-01-18",
    proposer: "0x923f18Cc7654D89B3C3C8F6e2d2A4f56Hd7e0789",
    category: "Partnership",
    requiredQuorum: 2000,
    currentForVotes: 1534,
    currentAgainstVotes: 622,
    timeline: [
      { date: "2024-01-18", event: "Proposal Created" },
      { date: "2024-01-19", event: "Due Diligence Completed" },
      { date: "2024-01-21", event: "Voting Period Opened" },
      { date: "2024-01-26", event: "Voting Deadline" }
    ]
  }
};

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<"for" | "against" | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const proposal = id ? proposalDetails[id as keyof typeof proposalDetails] : null;

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Proposal Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The proposal you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Proposals
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleVote = async (vote: "for" | "against") => {
    setIsVoting(true);
    
    toast("Encrypting your vote...", {
      description: "Your vote is being encrypted using FHE technology",
    });

    setTimeout(() => {
      setUserVote(vote);
      setHasVoted(true);
      toast.success("Vote cast successfully!", {
        description: "Your encrypted vote has been recorded securely",
      });
      setIsVoting(false);
    }, 1500);
  };

  const forPercentage = (proposal.currentForVotes / proposal.totalVotes) * 100;
  const againstPercentage = (proposal.currentAgainstVotes / proposal.totalVotes) * 100;
  const quorumPercentage = (proposal.totalVotes / proposal.requiredQuorum) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Proposals
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Proposal Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{proposal.category}</Badge>
                      <Badge variant={hasVoted ? "secondary" : "outline"}>
                        {hasVoted ? "Voted" : "Pending"}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {proposal.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{proposal.timeRemaining} remaining</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{proposal.totalVotes} votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {proposal.createdDate}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Full Description
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    {proposal.fullDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 text-foreground/90 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Voting Section */}
                {hasVoted ? (
                  <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg">
                    {userVote === "for" ? (
                      <ThumbsUp className="h-5 w-5 text-success" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-medium">
                      You voted {userVote?.toUpperCase()} this proposal
                    </span>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold mb-4">Cast Your Vote</h3>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleVote("for")}
                        disabled={isVoting}
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        size="lg"
                      >
                        <ThumbsUp className="h-5 w-5 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        onClick={() => handleVote("against")}
                        disabled={isVoting}
                        variant="destructive"
                        className="flex-1"
                        size="lg"
                      >
                        <ThumbsDown className="h-5 w-5 mr-2" />
                        Vote Against
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Proposal Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposal.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Voting Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-success">For: {proposal.currentForVotes}</span>
                    <span>{forPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={forPercentage} className="h-2 bg-muted">
                    <div 
                      className="h-full bg-success transition-all" 
                      style={{ width: `${forPercentage}%` }}
                    />
                  </Progress>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-destructive">Against: {proposal.currentAgainstVotes}</span>
                    <span>{againstPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={againstPercentage} className="h-2 bg-muted">
                    <div 
                      className="h-full bg-destructive transition-all" 
                      style={{ width: `${againstPercentage}%` }}
                    />
                  </Progress>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quorum Progress</span>
                    <span>{quorumPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={quorumPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {proposal.totalVotes} / {proposal.requiredQuorum} votes needed
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Proposal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposer:</span>
                  <span className="font-mono text-xs">
                    {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="outline" className="text-xs">
                    {proposal.category}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Votes:</span>
                  <span className="font-medium">{proposal.totalVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Required Quorum:</span>
                  <span className="font-medium">{proposal.requiredQuorum}</span>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                🔒 Privacy Guaranteed
              </h4>
              <p className="text-muted-foreground">
                All votes are encrypted using Fully Homomorphic Encryption (FHE). 
                Individual votes remain confidential until the election period ends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}