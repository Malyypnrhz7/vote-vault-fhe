import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Clock, Users, ExternalLink, Lock } from "lucide-react";
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
  showEncryptedCount?: boolean;
  isActive?: boolean;
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
  showEncryptedCount = false,
  isActive = true,
}: ProposalCardProps) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (vote: "for" | "against") => {
    try {
    setIsVoting(true);
    toast("Encrypting your vote...", {
      description: "Your vote is being encrypted using FHE technology",
    });
      await onVote(id, vote);
    } catch (_e) {
      // VotingInterface will handle error toasts; keep quiet here
    } finally {
      setIsVoting(false);
    }
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
              <Badge variant={hasVoted ? "secondary" : (isActive ? "outline" : "destructive")}>
                {hasVoted ? "Voted" : isActive ? "Pending" : "Ended"}
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
            <span>{showEncryptedCount ? 'Encrypted' : `${totalVotes} votes`}</span>
          </div>
        </div>

        {hasVoted ? (
          showEncryptedCount ? (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">You voted on this proposal</span>
            </div>
          ) : (
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
          )
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => handleVote("for")}
              disabled={isVoting || !isActive}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Vote For
            </Button>
            <Button
              onClick={() => handleVote("against")}
              disabled={isVoting || !isActive}
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