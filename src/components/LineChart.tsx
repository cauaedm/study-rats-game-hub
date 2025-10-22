import { Card } from "@/components/ui/card";
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LineChartProps {
  data: Array<{ day: string; hours: number }>;
  title?: string;
}

export const LineChart = ({ data, title = "Horas Semanais" }: LineChartProps) => {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RechartsLine data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="day" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </Card>
  );
};
