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
    <>
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
    </>
  )
}

function SentimentDot({ score, label }: { score: number; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="relative z-10 inline-block h-2 w-2 rounded-full cursor-default"
          style={{ backgroundColor: sentimentToColor(score) }}
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
