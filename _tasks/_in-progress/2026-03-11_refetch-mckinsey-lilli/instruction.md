For the item you were given:

## Step 1: Fetch the item

Fetch the item by `_id` using your Sanity skill. Fetch these fields in **two separate groups** — this is critical to avoid contaminating the summarization.

**Group A (for summarization — fetch first):**
- `_id`
- `title`
- `originalUrl`
- `discussionUrl`
- `detailedSummary` (the article summary — needed as context for discussion analysis)

**Group B (for activity assessment — fetch ONLY in Step 5, not before):**
- `savedAt`
- `hnCommentCount`
- `discussionLastFetchedAt`
- `discussionNeedsRefetch`
- `discussionRefetchCount`

Fetch Group A now. If `discussionUrl` is not defined or does not contain `news.ycombinator.com/item?id=`, skip this item — output `<output>{"skipped": true, "reason": "no HN discussion URL"}</output>` and emit your completion marker.

## Step 2: Scrape the HN discussion page

Use the Bash tool to scrape the discussion page with Firecrawl. The API key must be loaded from `.env.local` since subprocesses don't inherit it:

```bash
export FIRECRAWL_API_KEY=$(grep '^FIRECRAWL_API_KEY=' .env.local | cut -d'=' -f2 | tr -d "'" | tr -d '"') && firecrawl scrape "<discussionUrl>" --only-main-content
```

**Important:** The URL must be quoted (it contains `?` and `&` characters that the shell will misinterpret otherwise). The `--only-main-content` flag strips HN's navigation and footer, returning just the post title and comment tree as clean markdown. Do not use `-o` — let the output return inline so you can use it directly.

If the scrape fails or returns no meaningful content, skip to Step 4 with only HN API metrics.

## Step 3: Summarize the discussion and score metrics

**CRITICAL: Treat this as a fresh summarization.** You are summarizing this discussion as if reading it for the first time. Do NOT reference previous summaries, previous states, growth, changes, or any "before vs. after" framing. The reader will never see a previous version — they will only see YOUR summary. Write it as a standalone, definitive summary of the discussion as it exists right now.

Frame your analysis with two structured inputs:
- The **article summary** (`detailedSummary` from Step 1) — this provides essential context for understanding which discussion viewpoints agree or disagree with the article
- The **scraped discussion content** (from Step 2) — this is the primary input to analyze

If the scraped content is extremely long (>100,000 characters), focus on the most substantive comment threads rather than trying to process every comment.

### 3a: Discussion summarization

Read the scraped discussion content (ignoring any extraneous metadata or UI text) and produce these fields:

- **`discussionDetailedSummary`** — A full, detailed summary of the discussion. Include all key information, arguments, and notable exchanges.
- **`keyAgreeingViewpoints`** — Array of the key viewpoints and arguments made in agreement with the article.
- **`keyOpposingViewpoints`** — Array of the key viewpoints and arguments against the point of the article.
- **`sentiment`** — Overall, describe the overall sentiment of the discussion as it relates to the article at hand. Does Hacker News agree or disagree?
- **`discussionShortSummary`** — A brief, 3-sentence summary of the Hacker News discussion.
- **`discussionGist`** — A one-liner that captures the essence of the discussion in one sentence. Don't mention that it's a discussion, but rather focus it all on the key takeaway.
- **`discussionTitle`** — Your version of a descriptive title of the discussion based on the above. Try to communicate the gist in only a short headline. Don't mention that it's a discussion, but rather focus it all on the key takeaway.

### 3b: Community sentiment scoring

Act as a community sentiment analyst. Using both the article summary and the scraped discussion content, provide two integer scores:

**Community Sentiment (`sentimentCommunity`): -100 to 100**
The overall tone of the community's reaction.
- -100: Overwhelmingly hostile, dismissive, doom-saying
- 0: Mixed or neutral
- 100: Overwhelmingly enthusiastic, supportive, optimistic

**Controversy Score (`controversyScore`): 0 to 100**
How polarizing the discussion is.
- 0: Complete consensus (everyone agrees)
- 50: Notably divided opinions
- 100: Deeply divisive (strong opposing camps, heated arguments)

Consider the balance of agreeing vs. opposing viewpoints, the emotional intensity, and whether the discussion generated constructive debate or hostile conflict. Return integer values (whole numbers, no decimals).

## Step 4: Fetch HN metadata and assess activity

**Now** fetch the data needed for the activity assessment. This is intentionally separated from summarization so the growth numbers cannot influence the summary text.

### 4a: Fetch HN API metadata

Extract the HN item ID from the `discussionUrl` (the `id` query parameter).

Fetch the HN API: `https://hacker-news.firebaseio.com/v0/item/{id}.json`

From the response, record:
- `score` → `hnScore`
- `descendants` → `hnCommentCount`

If the HN API call fails, use the existing values from Sanity (or null if not available).

### 4b: Fetch Group B fields

Now fetch the item again with Group B fields: `savedAt`, `hnCommentCount`, `discussionNeedsRefetch`, `discussionRefetchCount`, `discussionLastFetchedAt`.

If `discussionNeedsRefetch` is explicitly `false`, the summarization you just did is still valuable — continue with the patch but set `discussionNeedsRefetch: false` in the payload.

Save the **previous** `hnCommentCount` value for the activity comparison. If the previous value was null, treat it as 0.

### 4c: Assess discussion activity

Determine whether this discussion should be refetched again. Consider:

1. **Comment growth**: Compare new `hnCommentCount` (from 4a) to the previous value (from 4b).
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

## Step 5: Validate and patch the Sanity document

First, build your patch payload as JSON with all updated fields. Set:
- `discussionLastFetchedAt` to the current ISO timestamp
- `discussionRefetchCount` to the previous value + 1 (null counts as 0)
- `discussionNeedsRefetch` based on your assessment in Step 5

If you skipped summarization in Step 3 (scrape failed), only include the metrics and tracking fields — do NOT overwrite existing discussion summaries with empty values. Skip validation in this case since the payload won't contain all fields.

### 5a: Validate the payload

Write your patch JSON to a temp file and validate it against the Zod schema:

```bash
cat > /tmp/patch-payload.json << 'PATCH_EOF'
{
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
}
PATCH_EOF
node .claude/skills/sanity-cms/scripts/validate-patch.js --schema refetch-discussion --file /tmp/patch-payload.json
```

If validation fails, read the error output carefully — it will tell you exactly which fields have wrong types or values. Fix the payload in `/tmp/patch-payload.json` and re-validate. You may retry up to **2 times**. Common issues: arrays passed as strings, scores outside their allowed range, non-ISO datetime formats.

If validation still fails after 2 retries, do NOT patch. Instead, skip to Step 6 and report the failure:

```
<output>{"error": true, "reason": "Validation failed after 2 retries", "validationErrors": [...]}</output>
```

Then emit `<promise>COMPLETE</promise>`.

### 5b: Patch the document

Once validation passes, apply the patch:

```bash
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "THE_DOCUMENT_ID" --file /tmp/patch-payload.json
```

## Step 6: Report results

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
