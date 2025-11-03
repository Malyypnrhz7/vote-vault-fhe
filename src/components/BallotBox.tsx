import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BallotBoxProps {
  isActive: boolean;
  voteCount: number;
  onVoteCast: () => void;
  showEncryptedCount?: boolean;
}

export const BallotBox = ({ isActive, voteCount, onVoteCast, showEncryptedCount = false }: BallotBoxProps) => {
  const [animatingVote, setAnimatingVote] = useState(false);

  const handleVoteCast = () => {
    setAnimatingVote(true);
    onVoteCast();
    setTimeout(() => setAnimatingVote(false), 600);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative w-32 h-40 bg-gradient-to-b from-primary to-primary/90 rounded-lg border-4 border-primary/20 shadow-xl transition-all duration-300",
          isActive && "shadow-2xl scale-105",
          animatingVote && "animate-vote-confirm"
        )}
      >
        {/* Ballot slot */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-primary-foreground/20 rounded" />
        
        {/* Lock icon */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <Lock className="h-6 w-6 text-primary-foreground" />
        </div>

        {/* Vote counter display */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary-foreground/10 px-3 py-1 rounded text-primary-foreground text-sm font-mono">
          {showEncryptedCount ? 'Encrypted' : `${voteCount} votes`}
        </div>

        {/* Animated ballot */}
        {animatingVote && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-card rounded animate-ballot-drop">
            <Check className="h-4 w-4 text-success mx-auto mt-2" />
          </div>
        )}
      </div>

      <div className="text-center">
        <h3 className="font-semibold text-foreground">Encrypted Ballot Box</h3>
        <p className="text-sm text-muted-foreground">
          Votes are encrypted and secured until election ends
        </p>
      </div>
    </div>
  );
};