For the item you were given:

## Step 1: Fetch the item

Fetch the item with all its fields by `_id` using your Sanity skill. You need these fields:

- `_id`
- `title`
- `originalUrl`
- `discussionUrl`
- `savedAt`
- `discussionDetailedSummary`
- `discussionShortSummary`
- `discussionGist`
- `discussionTitle`
- `keyAgreeingViewpoints`
- `keyOpposingViewpoints`
- `sentiment`
- `hnScore`
- `hnCommentCount`
- `sentimentCommunity`
- `controversyScore`
- `discussionLastFetchedAt`
- `discussionNeedsRefetch`
- `discussionRefetchCount`

If `discussionNeedsRefetch` is explicitly `false`, skip this item — output `<output>{"skipped": true, "reason": "discussion marked as complete"}</output>` and emit your completion marker.

If `discussionUrl` is not defined or does not contain `news.ycombinator.com/item?id=`, skip this item — output `<output>{"skipped": true, "reason": "no HN discussion URL"}</output>` and emit your completion marker.

## Step 2: Fetch updated HN metadata

Extract the HN item ID from the `discussionUrl` (the `id` query parameter).

Fetch the HN API: `https://hacker-news.firebaseio.com/v0/item/{id}.json`

From the response, record:
- `score` → `hnScore`
- `descendants` → `hnCommentCount`

Save the **previous** `hnCommentCount` value (from Step 1) for the activity assessment in Step 5. If the previous value was null, treat it as 0.

If the HN API call fails, skip this item — output `<output>{"skipped": true, "reason": "HN API fetch failed"}</output>` and emit your completion marker.

## Step 3: Scrape the HN discussion page

Use `WebFetch` to fetch the full HN discussion page at the `discussionUrl`. This gives you the current state of the conversation including all comments.

If the scrape fails or returns no meaningful content, still proceed with the HN metadata from Step 2 — just skip the re-summarization in Step 4 and go straight to Step 5 with only the updated metrics.

## Step 4: Re-summarize the discussion

Based on the scraped discussion content, produce updated versions of all discussion summary fields:

- **`discussionDetailedSummary`** — A full, detailed summary of the discussion. Include all key information, arguments, and notable exchanges.
- **`discussionShortSummary`** — A brief, 3-sentence summary of the discussion.
- **`discussionGist`** — A one-liner that captures the essence of the discussion.
- **`discussionTitle`** — A descriptive headline for the discussion that communicates the gist.
- **`keyAgreeingViewpoints`** — Array of 3-5 key viewpoints and arguments made in agreement with the article.
- **`keyOpposingViewpoints`** — Array of 3-5 key viewpoints and arguments against the article's point.
- **`sentiment`** — Overall description of the community sentiment as it relates to the article. Does HN agree or disagree?

Also re-score community metrics:

- **`sentimentCommunity`** — Community reaction on a scale from -100 (hostile/dismissive) to 100 (enthusiastic/supportive). Integer.
- **`controversyScore`** — How polarizing the discussion is: 0 (consensus) to 100 (deeply divisive). Integer.

## Step 5: Assess discussion activity

Determine whether this discussion should be refetched again. Consider:

1. **Comment growth**: Compare new `hnCommentCount` to the previous value from Step 1.
2. **Post age**: How old is the post? (`savedAt` vs current time)
3. **Refetch count**: How many times has this already been refetched? (`discussionRefetchCount`, null = 0)

### Decision logic:

**If `discussionRefetchCount` is 0 or null (first refetch):**
- Be lenient. Flag as still active (`discussionNeedsRefetch: true`) if:
  - Comment count grew by 20%+ since initial fetch, OR
  - Post is less than 3 days old and has significant engagement (50+ comments)
- Otherwise set `discussionNeedsRefetch: false`

**If `discussionRefetchCount` is 1 (second refetch):**
- Be strict. Only flag as still active if:
  - Comment count grew by 50%+ since last fetch, AND
  - Post is less than 5 days old
- Otherwise set `discussionNeedsRefetch: false`

**If `discussionRefetchCount` >= 2 (third+ refetch):**
- Almost always set `discussionNeedsRefetch: false`. Only keep active for truly exceptional, viral discussions (100%+ comment growth AND post is trending).

Record your decision and reasoning.

## Step 6: Patch the Sanity document

Use your Sanity skill to patch the document by `_id`. Set all updated fields in a single patch:

```bash
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "THE_DOCUMENT_ID" --set '{
  "discussionDetailedSummary": "...",
  "discussionShortSummary": "...",
  "discussionGist": "...",
  "discussionTitle": "...",
  "keyAgreeingViewpoints": ["...", "..."],
  "keyOpposingViewpoints": ["...", "..."],
  "sentiment": "...",
  "sentimentCommunity": -15,
  "controversyScore": 65,
  "hnScore": 342,
  "hnCommentCount": 287,
  "discussionLastFetchedAt": "2026-03-10T12:00:00.000Z",
  "discussionRefetchCount": 1,
  "discussionNeedsRefetch": false
}'
```

Set `discussionLastFetchedAt` to the current ISO timestamp.
Set `discussionRefetchCount` to the previous value + 1 (null counts as 0).
Set `discussionNeedsRefetch` based on your assessment in Step 5.

If you skipped re-summarization in Step 4 (scrape failed), only patch the metrics and tracking fields — do NOT overwrite existing discussion summaries with empty values.

## Step 7: Report results

When you have successfully patched the document, report your results and emit your stop code.

Include an output tag with a summary:

```
<output>{
  "hnScore": 342,
  "hnCommentCount": 287,
  "previousHnCommentCount": 187,
  "commentGrowth": "53%",
  "sentimentCommunity": -15,
  "controversyScore": 65,
  "discussionRefetchCount": 1,
  "discussionNeedsRefetch": false,
  "reason": "Comment growth 53% but post is 4 days old, discussion settling"
}</output>
```

Then emit `<promise>COMPLETE</promise>`.
