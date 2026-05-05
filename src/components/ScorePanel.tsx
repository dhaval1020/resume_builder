import { ScoreBreakdown } from "@/utils/scoreResume";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScorePanelProps {
  breakdown: ScoreBreakdown;
}

const ScorePanel = ({ breakdown }: ScorePanelProps) => {
  const { total, sections } = breakdown;
  const scoreColor = total >= 80 ? "text-score-high" : total >= 50 ? "text-score-medium" : "text-score-low";
  const progressColor = total >= 80 ? "[&>div]:bg-score-high" : total >= 50 ? "[&>div]:bg-score-medium" : "[&>div]:bg-score-low";
  const scoreLabel = total >= 80 ? "Strong" : total >= 50 ? "Needs Improvement" : "Weak";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">ATS Score</p>
            <div className={`text-5xl leading-none font-display font-black ${scoreColor}`}>{total}</div>
          </div>
          <span className={`text-sm font-semibold ${scoreColor}`}>{scoreLabel}</span>
        </div>
        <Progress value={total} className={`mt-3 h-2 ${progressColor}`} />
        <p className="mt-2 text-xs text-muted-foreground">Target: 80+ for stronger ATS compatibility</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const pct = (section.score / section.maxScore) * 100;
          const Icon = pct >= 80 ? CheckCircle2 : pct >= 50 ? AlertCircle : XCircle;
          const iconColor = pct >= 80 ? "text-score-high" : pct >= 50 ? "text-score-medium" : "text-score-low";
          const barColor = pct >= 80 ? "[&>div]:bg-score-high" : pct >= 50 ? "[&>div]:bg-score-medium" : "[&>div]:bg-score-low";

          return (
            <div key={section.name} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                  <span className="text-sm font-medium text-foreground">{section.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{section.score}/{section.maxScore}</span>
              </div>
              <Progress value={pct} className={`h-1.5 ${barColor}`} />
              {section.tips.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="text-muted-foreground/60">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScorePanel;
