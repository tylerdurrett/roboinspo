import * as z from 'zod';

/**
 * Zod schema for the refetch-discussion batch instruction patch payload.
 * Mirrors the fields produced by the iterator.tv "Notion link to doc" workflow
 * for HN discussion processing.
 */
export const refetchDiscussionSchema = z.object({
  discussionDetailedSummary: z.string().min(1),
  discussionShortSummary: z.string().min(1),
  discussionGist: z.string().min(1),
  discussionTitle: z.string().min(1),
  keyAgreeingViewpoints: z.array(z.string().min(1)),
  keyOpposingViewpoints: z.array(z.string().min(1)),
  sentiment: z.string().min(1),
  sentimentCommunity: z.int().min(-100).max(100),
  controversyScore: z.int().min(0).max(100),
  hnScore: z.int().min(0),
  hnCommentCount: z.int().min(0),
  discussionLastFetchedAt: z.iso.datetime(),
  discussionRefetchCount: z.int().min(0),
  discussionNeedsRefetch: z.boolean(),
});
