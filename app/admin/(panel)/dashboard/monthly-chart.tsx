import type { MonthlyPoint } from "@/app/lib/stats";

const SERIES = [
  { key: "visitors", label: "Visitors", color: "#8b8cf8" },
  { key: "properties", label: "Properties posted", color: "#f0b429" },
  { key: "leads", label: "Leads received", color: "#ec4899" },
] as const;

type Pt = { x: number; y: number };

function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const W = 960;
const H = 300;
const PAD = { top: 20, right: 16, bottom: 34, left: 44 };
const TICKS = 4;

export default function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((d) => SERIES.map((s) => d[s.key])),
  );
  const step = Math.ceil(maxValue / TICKS / 10) * 10 || 5;
  const yMax = step * TICKS;

  const xStep = (W - PAD.left - PAD.right) / (data.length - 1 || 1);
  const x = (i: number) => PAD.left + i * xStep;
  const y = (v: number) =>
    PAD.top + (1 - v / yMax) * (H - PAD.top - PAD.bottom);

  return (
    <div className="rounded-2xl bg-[#111a2e] p-5 shadow-lg sm:p-7">
      <h2 className="text-xl font-semibold text-white">Overview</h2>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="min-w-[640px] w-full"
          role="img"
          aria-label="Monthly visitors, properties posted and leads received"
        >
          {Array.from({ length: TICKS + 1 }, (_, i) => {
            const gy = y(step * i);
            return (
              <g key={i}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={gy}
                  y2={gy}
                  stroke="#33415f"
                  strokeDasharray="3 4"
                />
                <text
                  x={PAD.left - 10}
                  y={gy + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#7c89ab"
                >
                  {step * i}
                </text>
              </g>
            );
          })}

          {data.map((d, i) => (
            <g key={d.label}>
              <line
                x1={x(i)}
                x2={x(i)}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="#33415f"
                strokeDasharray="3 4"
              />
              <text
                x={x(i)}
                y={H - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#7c89ab"
              >
                {d.label}
              </text>
            </g>
          ))}

          {SERIES.map((s) => {
            const pts = data.map((d, i) => ({ x: x(i), y: y(d[s.key]) }));
            return (
              <g key={s.key}>
                <path
                  d={smoothPath(pts)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {pts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#111a2e"
                    stroke={s.color}
                    strokeWidth="2.5"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300"
          >
            <span
              className="h-0.5 w-5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
