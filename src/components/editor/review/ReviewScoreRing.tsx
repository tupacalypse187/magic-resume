"use client";

import { cn } from "@/lib/utils";

interface ReviewScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function getScoreColor(score: number) {
  if (score >= 85) return { stroke: "#22c55e", text: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" };
  if (score >= 65) return { stroke: "#eab308", text: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20" };
  if (score >= 40) return { stroke: "#f97316", text: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" };
  return { stroke: "#ef4444", text: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" };
}

export function ReviewScoreRing({ score, size = 100, strokeWidth = 6 }: ReviewScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = getScoreColor(score);

  return (
    <div className={cn("relative inline-flex items-center justify-center rounded-full p-2", colors.bg)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", colors.text)}>{score}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}
