import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Clock, Users, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ProposalCardProps {
  id: string;
  title: string;
  description: string;
  timeRemaining: string;
  totalVotes: number;
  onVote: (proposalId: string, vote: "for" | "against") => void;
  hasVoted: boolean;
  userVote?: "for" | "against";
}

export const ProposalCard = ({
  id,
  title,
  description,
  timeRemaining,
  totalVotes,
  onVote,
  hasVoted,
  userVote,
}: ProposalCardProps) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (vote: "for" | "against") => {
    setIsVoting(true);
    
    // Simulate encryption process
    toast("Encrypting your vote...", {
      description: "Your vote is being encrypted using FHE technology",
    });

    setTimeout(() => {
      onVote(id, vote);
      toast.success("Vote cast successfully!", {
        description: "Your encrypted vote has been recorded securely",
      });
      setIsVoting(false);
    }, 1500);
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg hover:text-primary transition-colors">
                <Link to={`/proposal/${id}`} className="flex items-center gap-2">
                  {title}
                  <ExternalLink className="h-4 w-4 opacity-50" />
                </Link>
              </CardTitle>
              <Badge variant={hasVoted ? "secondary" : "outline"}>
                {hasVoted ? "Voted" : "Pending"}
              </Badge>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{timeRemaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes</span>
          </div>
        </div>

        {hasVoted ? (
          <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
            {userVote === "for" ? (
              <ThumbsUp className="h-4 w-4 text-success" />
            ) : (
              <ThumbsDown className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">
              You voted {userVote === "for" ? "FOR" : "AGAINST"} this proposal
            </span>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => handleVote("for")}
              disabled={isVoting}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Vote For
            </Button>
            <Button
              onClick={() => handleVote("against")}
              disabled={isVoting}
              variant="destructive"
              className="flex-1"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Vote Against
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};