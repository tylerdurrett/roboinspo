import { readingTime } from 'reading-time-estimator'

const WORDS_PER_MINUTE = 240

export function estimateReadingTime(text: string) {
  return readingTime(text, WORDS_PER_MINUTE)
}
