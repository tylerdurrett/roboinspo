'use client'

import {
  getSentimentLabel,
  getControversyLabel,
  sentimentToColor,
} from '@/lib/reading-list/metrics'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { ScaleIcon } from 'lucide-react'

interface ReadingListMetricsProps {
  sentimentArticle: number | null
  sentimentCommunity: number | null
  controversyScore: number | null
}

export function ReadingListMetrics({
  sentimentArticle,
  sentimentCommunity,
  controversyScore,
}: ReadingListMetricsProps) {
  const items: { icon: React.ReactNode; label: string; tooltip: string }[] = []

  if (sentimentArticle != null) {
    items.push({
      icon: <SentimentDot score={sentimentArticle} />,
      label: `Article: ${getSentimentLabel(sentimentArticle)}`,
      tooltip: `Tone of the article: ${sentimentArticle} (−100 to 100)`,
    })
  }
  if (sentimentCommunity != null) {
    items.push({
      icon: <SentimentDot score={sentimentCommunity} />,
      label: `Community: ${getSentimentLabel(sentimentCommunity)}`,
      tooltip: `Tone of community discussion: ${sentimentCommunity} (−100 to 100)`,
    })
  }
  if (controversyScore != null) {
    const label = getControversyLabel(controversyScore)
    if (label) {
      items.push({
        icon: <ScaleIcon className="h-3.5 w-3.5" />,
        label,
        tooltip: 'How divided the community response is (0–100)',
      })
    }
  }

  if (items.length === 0) return null

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-3 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-default items-center gap-1.5">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="hidden sm:inline mr-1.5 text-muted-foreground/60"
                >
                  |
                </span>
              )}
              {item.icon}
              <span>{item.label}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>{item.tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}


function SentimentDot({ score }: { score: number }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: sentimentToColor(score) }}
    />
  )
}
