import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Timer } from "@/components/Timer";
import { StatsCard } from "@/components/StatsCard";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { Clock, Flame } from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import { MobileNav } from "@/components/MobileNav";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
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

  if (!profile) return null;

  return (
    <>
      <MobileNav />
      <div className="min-h-screen pt-14 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <header className="flex items-center gap-3 animate-fade-in">
            <img src={logo} alt="Study Rats" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold">Olá, {profile.name}!</h1>
              <p className="text-sm text-muted-foreground">Vamos estudar hoje?</p>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <StatsCard
              title="Total de Horas"
              value={profile.total_hours?.toFixed(1) || "0.0"}
              icon={Clock}
            />
            <StatsCard
              title="Streak"
              value={profile.streak || 0}
              icon={Flame}
              gradient
            />
          </div>

          {/* Timer */}
          <Timer />

          {/* Monthly Calendar */}
          <div className="animate-fade-in">
            <MonthlyCalendar userId={profile.id} />
          </div>
        </div>
      </div>
    </>
  );
}
