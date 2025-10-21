import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [focusTime, setFocusTime] = useState(25); // minutos
  const [isCountdown, setIsCountdown] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
        if (isCountdown) {
          setRemainingSeconds((r) => {
            if (r <= 1) {
              handleStop();
              toast.success("Tempo de foco concluído! 🎉");
              return 0;
            }
            return r - 1;
          });
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isCountdown]);

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
    if (isCountdown && focusTime > 0) {
      setRemainingSeconds(focusTime * 60);
    }
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

  const progressPercentage = isCountdown && focusTime > 0
    ? ((focusTime * 60 - remainingSeconds) / (focusTime * 60)) * 100
    : 0;

  return (
    <Card className="p-8 shadow-card animate-scale-in">
      <div className="space-y-6">
        {/* Configuração de tempo de foco */}
        {!isRunning && seconds === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <Label htmlFor="focusTime" className="text-base font-semibold">
                Definir Tempo de Foco (minutos)
              </Label>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  id="focusTime"
                  type="number"
                  min="1"
                  max="180"
                  value={focusTime}
                  onChange={(e) => setFocusTime(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
              <Button
                variant={isCountdown ? "default" : "outline"}
                onClick={() => setIsCountdown(!isCountdown)}
                className={isCountdown ? "gradient-primary" : ""}
              >
                {isCountdown ? "Contagem Regressiva ON" : "Contagem Normal"}
              </Button>
            </div>
          </div>
        )}

        {/* Display do tempo */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="text-7xl font-bold tracking-tight gradient-primary bg-clip-text text-transparent">
              {isCountdown && isRunning ? formatTime(remainingSeconds) : formatTime(seconds)}
            </div>
            {isCountdown && isRunning && (
              <div className="text-sm text-muted-foreground mt-2">
                Tempo decorrido: {formatTime(seconds)}
              </div>
            )}
          </div>

          {/* Barra de progresso visual */}
          {isCountdown && isRunning && (
            <div className="space-y-2 animate-fade-in">
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% concluído
              </p>
            </div>
          )}

          {/* Botões de controle */}
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
      </div>
    </Card>
  );
};
