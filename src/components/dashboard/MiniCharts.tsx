import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';

const occData = Array.from({ length: 12 }, (_, i) => ({
  h: `${7 + i}h`,
  val: Math.floor(40 + Math.random() * 55),
}));

const delayData = Array.from({ length: 12 }, (_, i) => ({
  h: `${7 + i}h`,
  val: Math.floor(Math.random() * 30),
}));

const turnoverData = Array.from({ length: 12 }, (_, i) => ({
  h: `${7 + i}h`,
  val: +(1.5 + Math.random() * 2).toFixed(1),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.[0]) {
    return (
      <div className="glass rounded-md px-3 py-1.5 text-xs border border-border">
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-mono font-bold text-foreground">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

function MiniBarChart({ data, color }: { data: typeof occData; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} barSize={8}>
        <XAxis dataKey="h" tick={{ fontSize: 9, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="val" fill={color} radius={[3, 3, 0, 0]} opacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MiniAreaChart({ data, color }: { data: typeof occData; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data}>
        <XAxis dataKey="h" tick={{ fontSize: 9, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function MiniCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass rounded-xl p-4 border border-border">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ocupação por Hora</h4>
        <MiniBarChart data={occData} color="hsl(174, 72%, 46%)" />
      </div>
      <div className="glass rounded-xl p-4 border border-border">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Atrasos (min)</h4>
        <MiniAreaChart data={delayData} color="hsl(38, 92%, 55%)" />
      </div>
      <div className="glass rounded-xl p-4 border border-border">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Giro de Sala</h4>
        <MiniBarChart data={turnoverData} color="hsl(210, 80%, 58%)" />
      </div>
    </div>
  );
}
