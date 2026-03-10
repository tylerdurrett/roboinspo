'use client'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { sentimentToColor, getSentimentLabel } from '@/lib/reading-list/metrics'

interface SentimentIndicatorProps {
  sentimentArticle: number | null
  sentimentCommunity: number | null
}

export function SentimentIndicator({
  sentimentArticle,
  sentimentCommunity,
}: SentimentIndicatorProps) {
  if (sentimentArticle == null && sentimentCommunity == null) return null

  return (
    <span className="mx-1 inline-flex items-center gap-2">
      {sentimentArticle != null && (
        <SentimentDot
          score={sentimentArticle}
          label={`Article tone: ${getSentimentLabel(sentimentArticle)}`}
        />
      )}
      {sentimentCommunity != null && (
        <SentimentDot
          score={sentimentCommunity}
          label={`Community tone: ${getSentimentLabel(sentimentCommunity)}`}
        />
      )}
    </span>
  )
}

function SentimentDot({ score, label }: { score: number; label: string }) {
  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <span className="relative z-10 inline-flex h-2.5 w-2.5 cursor-default items-center justify-center">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: sentimentToColor(score) }}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
