import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Crown } from "lucide-react";

interface RankingMember {
  user_id: string;
  name: string;
  value: number;
  position: number;
}

interface GroupRankingProps {
  members: RankingMember[];
  metric: string;
}

export function GroupRanking({ members, metric }: GroupRankingProps) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-muted-foreground font-semibold">{position}º</span>;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-700/50";
      default:
        return "bg-card border-border";
    }
  };

  const maxValue = members[0]?.value || 1;
  const metricLabel = metric === "total_hours" ? "horas" : metric === "streak" ? "dias" : "pontos";

  return (
    <div className="space-y-3">
      {members.map((member, index) => (
        <div
          key={member.user_id}
          className={`p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${getPositionBg(
            member.position
          )} animate-fade-in`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 flex items-center justify-center">
              {getPositionIcon(member.position)}
            </div>

            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="gradient-primary text-white font-bold">
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold truncate">{member.name}</p>
                <p className="text-sm font-bold text-primary">
                  {member.value.toFixed(metric === "total_hours" ? 1 : 0)} {metricLabel}
                </p>
              </div>
              <Progress
                value={(member.value / maxValue) * 100}
                className="h-2"
              />
            </div>

            {member.position <= 3 && (
              <Trophy
                className={`h-5 w-5 ${
                  member.position === 1
                    ? "text-yellow-500"
                    : member.position === 2
                    ? "text-gray-400"
                    : "text-amber-700"
                }`}
              />
            )}
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum membro ainda</p>
        </div>
      )}
    </div>
  );
}
