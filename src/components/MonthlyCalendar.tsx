import { Card } from "@/components/ui/card";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyCalendarProps {
  userId: string;
}

interface DayData {
  date: Date;
  hours: number;
  hasGroupDeadline?: boolean;
}

export const MonthlyCalendar = ({ userId }: MonthlyCalendarProps) => {
  const [currentMonth] = useState(new Date());
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [groupDeadlines, setGroupDeadlines] = useState<Date[]>([]);

  useEffect(() => {
    loadMonthData();
    loadGroupDeadlines();
  }, [userId]);

  const loadGroupDeadlines = async () => {
    const { data: groups } = await supabase
      .from("groups")
      .select("end_date")
      .or(`creator_id.eq.${userId},id.in.(select group_id from group_members where user_id='${userId}')`);

    if (groups) {
      const deadlines = groups.map(g => new Date(g.end_date));
      setGroupDeadlines(deadlines);
    }
  };

  const loadMonthData = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const daysWithData = await Promise.all(
      days.map(async (day) => {
        const startOfDay = new Date(day.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(day.setHours(23, 59, 59, 999)).toISOString();

        const { data } = await supabase
          .from("study_sessions")
          .select("duration_minutes")
          .eq("user_id", userId)
          .gte("start_time", startOfDay)
          .lte("start_time", endOfDay);

        const totalMinutes = data?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
        const hours = Number((totalMinutes / 60).toFixed(1));

        return { date: new Date(day), hours };
      })
    );

    setDaysData(daysWithData);
  };

  const getHeatColor = (hours: number) => {
    if (hours === 0) return "bg-muted/30";
    if (hours < 1) return "bg-primary/20";
    if (hours < 2) return "bg-primary/40";
    if (hours < 4) return "bg-primary/60";
    if (hours < 6) return "bg-primary/80";
    return "bg-primary";
  };

  const hasDeadline = (date: Date) => {
    return groupDeadlines.some(
      (deadline) => format(deadline, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/30" />
              <span>0h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>6h+</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {daysData.map((dayData, index) => {
            const isCurrentMonth = isSameMonth(dayData.date, currentMonth);
            const isCurrentDay = isToday(dayData.date);
            const deadline = hasDeadline(dayData.date);

            return (
              <div
                key={index}
                className={`
                  relative aspect-square rounded-lg transition-all
                  ${getHeatColor(dayData.hours)}
                  ${isCurrentMonth ? "opacity-100" : "opacity-30"}
                  ${isCurrentDay ? "ring-2 ring-primary ring-offset-2" : ""}
                  hover:scale-105 cursor-pointer
                  flex flex-col items-center justify-center
                  text-xs font-medium
                `}
              >
                <span className={dayData.hours > 0 ? "text-primary-foreground" : "text-foreground"}>
                  {format(dayData.date, "d")}
                </span>
                {dayData.hours > 0 && (
                  <span className="text-[10px] text-primary-foreground/80">
                    {dayData.hours}h
                  </span>
                )}
                {deadline && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {groupDeadlines.length > 0 && (
          <div className="pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-muted-foreground">
                Desafios de grupo próximos ao fim
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
