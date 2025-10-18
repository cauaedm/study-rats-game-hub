import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: boolean;
}

export const StatsCard = ({ title, value, icon: Icon, gradient }: StatsCardProps) => {
  return (
    <Card className="p-6 shadow-soft hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-bold ${gradient ? 'gradient-accent bg-clip-text text-transparent' : ''}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${gradient ? 'gradient-accent' : 'bg-secondary'}`}>
          <Icon className={`h-6 w-6 ${gradient ? 'text-white' : 'text-primary'}`} />
        </div>
      </div>
    </Card>
  );
};
