import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LineChart } from "@/components/LineChart";
import { ArrowLeft, Camera, Clock, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dailyGoal, setDailyGoal] = useState(2);
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; hours: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    if (data) {
      setProfile(data);
      setName(data.name || "");
      setBio(data.bio || "");
      setDailyGoal(data.daily_goal_hours || 2);
      setWeeklyGoal(data.weekly_goal_hours || 10);
    }
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

  const handleSave = async () => {
    if (!profile) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        bio,
        daily_goal_hours: dailyGoal,
        weekly_goal_hours: weeklyGoal,
      })
      .eq("id", profile.id);

    setIsLoading(false);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
      loadProfile();
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // In a real app, you would upload to Supabase Storage here
    toast.info("Upload de avatar ainda não implementado");
  };

  if (!profile) return null;

  const weeklyHoursCompleted = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const weeklyProgress = Math.min((weeklyHoursCompleted / weeklyGoal) * 100, 100);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4 animate-fade-in">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações e metas</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-card animate-scale-in">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4 text-primary-foreground" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>

                <div className="text-center w-full">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 text-center"
                  />
                </div>

                <div className="w-full">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="p-6 shadow-card space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Horas</span>
                  <span className="font-bold text-lg">{profile.total_hours?.toFixed(1) || "0.0"}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Streak</span>
                  <span className="font-bold text-lg gradient-accent bg-clip-text text-transparent">
                    {profile.streak || 0} dias
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Goals & Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-card animate-scale-in">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-accent" />
                Minhas Metas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="daily-goal">Meta Diária (horas)</Label>
                  <Input
                    id="daily-goal"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weekly-goal">Meta Semanal (horas)</Label>
                  <Input
                    id="weekly-goal"
                    type="number"
                    min="1"
                    step="1"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso Semanal</span>
                  <span className="text-sm text-muted-foreground">
                    {weeklyHoursCompleted.toFixed(1)} / {weeklyGoal}h
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full gradient-accent transition-all duration-500"
                    style={{ width: `${weeklyProgress}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Weekly Chart */}
            <div className="animate-fade-in">
              <LineChart data={weeklyData} title="Horas de Estudo (Últimos 7 dias)" />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
