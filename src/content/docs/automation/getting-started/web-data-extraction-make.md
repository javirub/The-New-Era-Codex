---
title: "Web Data Extraction with Make.com and AI"
description: "Web scraping combined with GPT analysis, no-code solutions, and reusable templates"
sidebar:
  order: 30
  badge:
    text: "Intermediate"
    variant: note
version: "1.1"
---
## Overview

Extract and analyze web data using Make.com (formerly Integromat) combined with AI for intelligent data processing, transformation, and enrichment.

**What you'll build**: Automated web scraping scenario that extracts product data, analyzes it with AI, and stores structured results.

**Use cases**: Competitive analysis, price monitoring, content aggregation, lead generation.

**Time**: 35 minutes

## Prerequisites

- Make.com account (free tier available)
- OpenAI API key
- Target website to scrape (use ethically and legally)

## Setup Make.com

1. Sign up at [Make.com](https://www.make.com)
2. Create new scenario
3. Add OpenAI connection in settings

## Scenario 1: Product Price Monitor

### Components

**Goal**: Monitor competitor prices and analyze trends

**Flow**:
```
HTTP Request → HTML Parser → Iterator → OpenAI Analysis → Google Sheets
```

### Step-by-Step

**1. HTTP Module - Fetch Web Page**
```
URL: https://example.com/products
Method: GET
Headers:
  User-Agent: Mozilla/5.0...
```

**2. HTML Parser**
- Parse HTML content
- Extract elements by CSS selector
- Example: `.product-card`

**3. Iterator**
- Loop through each product

**4. OpenAI - Extract Structured Data**

Prompt:
```
Extract product information from this HTML:

{{html_content}}

Return JSON:
{
  "name": "product name",
  "price": numeric_value,
  "currency": "USD",
  "in_stock": boolean,
  "features": ["feature1", "feature2"]
}
```

**5. Google Sheets - Append Row**
- Spreadsheet: Price Monitor
- Sheet: Products
- Values: {{parsed_data}}

## Scenario 2: News Aggregator + Summarizer

### Flow

```
RSS Feed → OpenAI Summarize → Filter → Notion Database
```

### Implementation

**1. RSS Module**
- Feed URL: Tech news RSS
- Limit: 10 items

**2. OpenAI - Summarize**

Prompt:
```
Summarize this article in 2-3 sentences:

Title: {{title}}
Content: {{content}}

Focus on key points and implications.
```

**3. Filter**
- Only continue if summary mentions "AI" or "automation"

**4. Notion - Create Page**
- Database: News Tracker
- Properties:
  - Title: {{title}}
  - Summary: {{ai_summary}}
  - URL: {{link}}
  - Date: {{published}}

## Scenario 3: Lead Enrichment

### Flow

```
Webhook → Scrape LinkedIn → OpenAI Analyze → CRM Update
```

### Steps

**1. Webhook Trigger**
- Receives: `{"linkedin_url": "..."}`

**2. HTTP - Scrape Profile**
```
Note: Use LinkedIn API or authorized scraping service
Direct scraping may violate ToS
```

**3. OpenAI - Extract Key Info**

Prompt:
```
From this LinkedIn profile, extract:

Profile text: {{profile_html}}

Return JSON:
{
  "industry": "...",
  "company_size": "...",
  "seniority": "junior|mid|senior|executive",
  "interests": ["..."],
  "likely_pain_points": ["..."]
}
```

**4. HubSpot - Update Contact**
- Find contact by email
- Update custom fields with AI insights

## Advanced Patterns

### Pattern 1: Multi-Page Scraping

```
HTTP Get Page 1
  ↓
Extract Pagination Links
  ↓
Iterator (Each Page)
  ↓
HTTP Get Each Page
  ↓
Aggregate Results
```

### Pattern 2: Rate Limiting

Add **Sleep** module between requests:
- Delay: 2 seconds
- Prevents IP blocking

### Pattern 3: Data Validation

Use **Filter** modules:
```
Filter: Price > 0 AND Price < 10000
Filter: Name is not empty
```

### Pattern 4: Error Handling

Add **Error Handler** route:
- On HTTP error: Log to sheet
- On parse error: Send Slack alert
- Continue execution

## Best Practices

### 1. Respect robots.txt

Check website's robots.txt:
```
https://example.com/robots.txt
```

Only scrape allowed paths.

### 2. Use Delays

Add delays between requests:
- Minimum 1-2 seconds
- For large operations: 5+ seconds

### 3. Handle Dynamic Content

For JavaScript-rendered content:
- Use browser automation service (Browserless, Apify)
- Or APIs when available

### 4. Cache Results

Store scraped HTML:
- Reduces API calls
- Enables re-processing
- Debugging easier

## Cost Management

### Make.com Operations

Free tier: 1,000 operations/month
- 1 HTTP request = 1 operation
- 1 OpenAI call = 1 operation
- 1 Sheet update = 1 operation

### Example Scenario Cost

Monitor 50 products daily:
- HTTP requests: 50/day × 30 = 1,500 ops
- OpenAI analysis: 50/day × 30 = 1,500 ops
- Sheet updates: 50/day × 30 = 1,500 ops
- **Total**: 4,500 ops/month = $9/month

### Optimization Tips

1. **Batch processing**: Process multiple items per run
2. **Conditional execution**: Only run when needed
3. **Use webhooks**: Trigger-based vs scheduled

## Practical Templates

### Template 1: Job Board Scraper

```yaml
Trigger: Schedule (daily 9 AM)
1. HTTP - Get job listings page
2. HTML Parse - Extract job cards
3. Iterator - Loop jobs
4. OpenAI - Extract job details
5. Filter - Match criteria
6. Telegram - Send matching jobs
```

### Template 2: Social Media Monitor

```yaml
Trigger: Schedule (every hour)
1. Twitter API - Search mentions
2. OpenAI - Sentiment analysis
3. Router:
   - Positive → Thank user
   - Negative → Alert team
   - Neutral → Add to CRM
```

### Template 3: Price Drop Alert

```yaml
Trigger: Schedule (twice daily)
1. HTTP - Get product pages
2. Parse prices
3. Google Sheets - Get previous prices
4. Compare - If dropped > 10%
5. Email - Send alert
6. Update sheet with new price
```

## Troubleshooting

**Issue**: HTTP 403 Forbidden
- Add proper User-Agent header
- Respect rate limits
- Consider using proxy
- Check if scraping is allowed

**Issue**: Parse errors
- Inspect actual HTML structure
- Use browser devtools to find selectors
- Handle missing elements gracefully

**Issue**: Inconsistent data
- Add validation filters
- Use try-catch with error handlers
- Set default values for missing fields

**Issue**: Scenario timeouts
- Break into smaller scenarios
- Use data stores for intermediate results
- Optimize selectors

## Legal and Ethical Considerations

### Always:
- ✅ Check robots.txt
- ✅ Read Terms of Service
- ✅ Respect rate limits
- ✅ Identify your bot (User-Agent)
- ✅ Use official APIs when available

### Never:
- ❌ Scrape personal data without consent
- ❌ Overwhelm servers with requests
- ❌ Bypass authentication
- ❌ Ignore cease & desist notices

## Next Steps

**Enhance your scenarios**:
- Add data cleaning with OpenAI
- Implement change detection
- Create visual dashboards
- Set up monitoring and alerts

**Related guides**:
- [Your First AI Workflow with n8n](/automation/first-ai-workflow-n8n)
- [Email Automation with Zapier](/automation/email-automation-zapier)

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
