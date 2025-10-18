import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        user_id: user.id,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao iniciar sessão");
      return;
    }

    setSessionId(data.id);
    setIsRunning(true);
    toast.success("Sessão iniciada!");
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (!sessionId) return;

    const durationMinutes = Math.floor(seconds / 60);

    const { error } = await supabase
      .from("study_sessions")
      .update({
        end_time: new Date().toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq("id", sessionId);

    if (error) {
      toast.error("Erro ao salvar sessão");
      return;
    }

    // Update user total hours
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_hours")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            total_hours: (profile.total_hours || 0) + durationMinutes / 60,
          })
          .eq("id", user.id);
      }
    }

    toast.success(`Sessão finalizada! ${durationMinutes} minutos estudados`);
    setSeconds(0);
    setSessionId(null);
  };

  return (
    <Card className="p-8 shadow-card animate-scale-in">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-3 justify-center">
          {!isRunning && seconds === 0 && (
            <Button
              onClick={handleStart}
              size="lg"
              className="gradient-primary hover:opacity-90 transition-opacity"
            >
              <Play className="mr-2 h-5 w-5" />
              Iniciar
            </Button>
          )}

          {isRunning && (
            <Button
              onClick={handlePause}
              size="lg"
              variant="secondary"
            >
              <Pause className="mr-2 h-5 w-5" />
              Pausar
            </Button>
          )}

          {!isRunning && seconds > 0 && (
            <>
              <Button
                onClick={handleStart}
                size="lg"
                className="gradient-primary hover:opacity-90 transition-opacity"
              >
                <Play className="mr-2 h-5 w-5" />
                Retomar
              </Button>
              <Button onClick={handleStop} size="lg" variant="destructive">
                <Square className="mr-2 h-5 w-5" />
                Finalizar
              </Button>
            </>
          )}

          {isRunning && (
            <Button onClick={handleStop} size="lg" variant="destructive">
              <Square className="mr-2 h-5 w-5" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
