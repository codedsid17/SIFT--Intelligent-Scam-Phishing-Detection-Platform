import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RiskLevel } from '../engine/types';

export function getRiskAppearance(level: RiskLevel) {
  switch (level) {
    case 'High Risk':
      return {
        textClass: 'text-rose-400',
        strokeColor: '#F43F5E',
        trackColor: 'rgba(244, 63, 94, 0.14)',
        surfaceClass: 'bg-rose-500/10 border-rose-500/30',
        barClass: 'bg-rose-500',
        Icon: ShieldAlert,
      };
    case 'Suspicious':
      return {
        textClass: 'text-amber-400',
        strokeColor: '#F59E0B',
        trackColor: 'rgba(245, 158, 11, 0.14)',
        surfaceClass: 'bg-amber-500/10 border-amber-500/30',
        barClass: 'bg-amber-500',
        Icon: AlertTriangle,
      };
    case 'Low Risk':
    default:
      return {
        textClass: 'text-emerald-400',
        strokeColor: '#10B981',
        trackColor: 'rgba(16, 185, 129, 0.14)',
        surfaceClass: 'bg-emerald-500/10 border-emerald-500/30',
        barClass: 'bg-emerald-500',
        Icon: CheckCircle2,
      };
  }
}

interface RiskStatusInlineProps {
  level: RiskLevel;
  score?: number;
}

export function RiskStatusInline({ level, score }: RiskStatusInlineProps) {
  const { textClass, Icon } = getRiskAppearance(level);
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap ${textClass}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{level}</span>
      {typeof score === 'number' && (
        <span className="font-mono text-xs tabular-nums text-slate-400">
          ({score}/100)
        </span>
      )}
    </span>
  );
}

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  size?: number;
}

export function RiskGauge({ score, level, size = 168 }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { strokeColor, trackColor, textClass, Icon } = getRiskAppearance(level);

  useEffect(() => {
    setAnimatedScore(0);
    const frame = requestAnimationFrame(() => {
      setAnimatedScore(score);
    });
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={`Risk score ${score} out of 100, classified as ${level}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 650ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-4xl font-bold tracking-tight tabular-nums text-slate-50">
            {score}
          </span>
          <span className="text-xs font-medium text-slate-400">out of 100</span>
        </div>
      </div>

      <div className={`mt-3 inline-flex items-center gap-2 text-sm font-semibold ${textClass}`}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{level}</span>
      </div>
    </div>
  );
}
