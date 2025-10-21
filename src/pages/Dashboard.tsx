import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Timer } from "@/components/Timer";
import { StatsCard } from "@/components/StatsCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { Button } from "@/components/ui/button";
import { Clock, Flame, LogOut, Users, Settings, Home } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; hours: number }>>([]);

  useEffect(() => {
    loadProfile();
    loadWeeklyData();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
  };

  const loadWeeklyData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const now = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];

      const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();

      const { data } = await supabase
        .from("study_sessions")
        .select("duration_minutes")
        .eq("user_id", user.id)
        .gte("start_time", startOfDay)
        .lte("start_time", endOfDay);

      const totalMinutes = data?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
      weekData.push({ day: dayName, hours: Number((totalMinutes / 60).toFixed(1)) });
    }

    setWeeklyData(weekData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado");
    navigate("/auth");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Olá, {profile.name}!</h1>
            <p className="text-muted-foreground">Continue estudando e alcance seus objetivos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <StatsCard
            title="Total de Horas"
            value={profile.total_hours?.toFixed(1) || "0.0"}
            icon={Clock}
          />
          <StatsCard
            title="Streak Atual"
            value={profile.streak || 0}
            icon={Flame}
            gradient
          />
          <Button
            className="h-full gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => navigate("/groups")}
          >
            <Users className="mr-2 h-5 w-5" />
            Ver Grupos
          </Button>
        </div>

        {/* Timer */}
        <Timer />

        {/* Weekly Chart */}
        <div className="animate-fade-in">
          <WeeklyChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}
