import { useMemo, useState, type MouseEvent } from "react";
import type { Ticket } from "./ticketingApi";
import "./TicketVolumeChart.css";

const SVG_WIDTH = 640;
const SVG_HEIGHT = 220;
const MARGIN = { top: 16, right: 12, bottom: 26, left: 30 };
const PLOT_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const Y_TICKS = 5;
const Y_MIN_MAX = 10;

type Range = "lastWeek" | "lastMonth" | "currentWeek";

interface DayBucket {
  date: Date;
  shortLabel: string;
  fullLabel: string;
  count: number;
}

interface ChartPoint extends DayBucket {
  x: number;
  y: number;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function niceMax(value: number): number {
  return Math.max(Y_MIN_MAX, Math.ceil(value / Y_MIN_MAX) * Y_MIN_MAX);
}

function pluralizeTicket(count: number): string {
  return `${count} ticket${count === 1 ? "" : "s"}`;
}

function getMondayOfWeek(weeksAgo: number): Date {
  const today = startOfDay(new Date());
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(monday.getDate() + mondayOffset - weeksAgo * 7);
  return monday;
}

function getWeekdays(weeksAgo: number): Date[] {
  const monday = getMondayOfWeek(weeksAgo);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getCalendarMonthDays(monthsAgo: number): Date[] {
  const today = startOfDay(new Date());
  const year = today.getFullYear();
  const month = today.getMonth() - monthsAgo;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
}

function buildDayCounts(tickets: Ticket[], dates: Date[]): DayBucket[] {
  const days: DayBucket[] = dates.map((date) => ({
    date,
    shortLabel: String(date.getDate()),
    fullLabel: date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    count: 0,
  }));
  const indexByKey = new Map(days.map((d, i) => [d.date.toDateString(), i]));
  for (const t of tickets) {
    const idx = indexByKey.get(startOfDay(new Date(t.dateSubmitted)).toDateString());
    if (idx !== undefined) days[idx].count += 1;
  }
  return days;
}

interface TicketVolumeChartProps {
  tickets: Ticket[];
}

export function TicketVolumeChart({ tickets }: TicketVolumeChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [range, setRange] = useState<Range>("currentWeek");

  const dates = useMemo(() => {
    switch (range) {
      case "lastWeek":
        return getWeekdays(1);
      case "lastMonth":
        return getCalendarMonthDays(1);
      case "currentWeek":
        return getWeekdays(0);
    }
  }, [range]);
  const monthLabel = useMemo(
    () => (dates[0] ? dates[0].toLocaleDateString(undefined, { month: "long", year: "numeric" }) : ""),
    [dates],
  );
  const days = useMemo(() => buildDayCounts(tickets, dates), [tickets, dates]);
  const yMax = useMemo(() => niceMax(Math.max(...days.map((d) => d.count))), [days]);

  const points: ChartPoint[] = useMemo(
    () =>
      days.map((d, i) => ({
        ...d,
        x: MARGIN.left + (days.length === 1 ? PLOT_WIDTH / 2 : (i / (days.length - 1)) * PLOT_WIDTH),
        y: MARGIN.top + PLOT_HEIGHT - (d.count / yMax) * PLOT_HEIGHT,
      })),
    [days, yMax],
  );

  const baselineY = MARGIN.top + PLOT_HEIGHT;
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const yTickValues = Array.from({ length: Y_TICKS + 1 }, (_, i) => Math.round((yMax / Y_TICKS) * i));
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));
  const totalCount = days.reduce((sum, d) => sum + d.count, 0);
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xInSvg = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - xInSvg);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <div className="ov-chart-block">
      <div className="ov-range-toggle" role="group" aria-label="Date range">
        <button
          type="button"
          className={`ov-range-btn ${range === "lastWeek" ? "ov-range-btn-active" : ""}`}
          onClick={() => setRange("lastWeek")}
        >
          Last Week
        </button>
        <button
          type="button"
          className={`ov-range-btn ${range === "lastMonth" ? "ov-range-btn-active" : ""}`}
          onClick={() => setRange("lastMonth")}
        >
          Last Month
        </button>
        <button
          type="button"
          className={`ov-range-btn ${range === "currentWeek" ? "ov-range-btn-active" : ""}`}
          onClick={() => setRange("currentWeek")}
        >
          Current Week
        </button>
      </div>

      <div className="ov-chart-wrap">
        <svg
          className="ov-chart-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
          role="img"
          aria-label={`Ticket volume for ${range === "lastMonth" ? monthLabel : range === "lastWeek" ? "last week, Monday through Friday" : "the current week, Monday through Friday"}, ${pluralizeTicket(totalCount)} total`}
        >
          {yTickValues.map((v) => {
            const y = MARGIN.top + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT;
            return (
              <g key={v}>
                <line className="ov-chart-gridline" x1={MARGIN.left} x2={SVG_WIDTH - MARGIN.right} y1={y} y2={y} />
                <text className="ov-chart-axis-label" x={MARGIN.left - 8} y={y} textAnchor="end" dominantBaseline="middle">
                  {v}
                </text>
              </g>
            );
          })}

          {points.map((p, i) =>
            i % labelEvery === 0 || i === points.length - 1 ? (
              <text key={p.date.toDateString()} className="ov-chart-axis-label" x={p.x} y={SVG_HEIGHT - 8} textAnchor="middle">
                {p.shortLabel}
              </text>
            ) : null,
          )}

          <path className="ov-chart-line" d={linePath} />

          {hovered && (
            <>
              <line className="ov-chart-crosshair" x1={hovered.x} x2={hovered.x} y1={MARGIN.top} y2={baselineY} />
              <circle className="ov-chart-dot" cx={hovered.x} cy={hovered.y} r={4} />
            </>
          )}
        </svg>

        {hovered && (
          <div
            className="ov-chart-tooltip"
            style={{ left: `${(hovered.x / SVG_WIDTH) * 100}%`, top: `${(hovered.y / SVG_HEIGHT) * 100}%` }}
          >
            <span className="ov-chart-tooltip-value">{pluralizeTicket(hovered.count)}</span>
            <span className="ov-chart-tooltip-label">{hovered.fullLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
