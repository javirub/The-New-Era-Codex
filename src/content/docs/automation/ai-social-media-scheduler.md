---
title: "AI Social Media Scheduler: Auto-Posting & Content Calendar"
description: "Automate social media posting with AI-generated content and intelligent scheduling"
sidebar:
  badge:
    text: "Low"
    variant: note
version: "1.0"
---

# AI Social Media Scheduler

## Content Generation + Scheduling

```python
import openai
from datetime import datetime, timedelta
import tweepy
from apscheduler.schedulers.background import BackgroundScheduler

class SocialMediaScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.content_queue = []

    def generate_week_content(self, topic, posts_per_day=3):
        prompt = f"""
        Generate {posts_per_day * 7} social media posts about: {topic}

        Requirements:
        - Mix of tips, questions, and insights
        - Include relevant hashtags
        - Varied tone and format
        - 280 characters max each

        Return as JSON array with format:
        [{{"post": "content", "hashtags": ["tag1", "tag2"], "time": "morning/afternoon/evening"}}]
        """

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)

    def schedule_posts(self, posts):
        now = datetime.now()

        time_slots = {
            "morning": 9,
            "afternoon": 14,
            "evening": 19
        }

        for i, post_data in enumerate(posts):
            day_offset = i // 3
            time_slot = time_slots[post_data['time']]

            post_time = now + timedelta(days=day_offset, hours=time_slot - now.hour)

            self.scheduler.add_job(
                self.post_to_twitter,
                'date',
                run_date=post_time,
                args=[post_data['post']]
            )

    def post_to_twitter(self, content):
        # Twitter API v2
        client = tweepy.Client(
            bearer_token=os.getenv("TWITTER_BEARER_TOKEN"),
            consumer_key=os.getenv("TWITTER_API_KEY"),
            consumer_secret=os.getenv("TWITTER_API_SECRET"),
            access_token=os.getenv("TWITTER_ACCESS_TOKEN"),
            access_token_secret=os.getenv("TWITTER_ACCESS_SECRET")
        )

        client.create_tweet(text=content)
        print(f"Posted: {content}")
```

## Multi-Platform Publishing

```python
def post_to_all_platforms(content, image_path=None):
    platforms = {
        'twitter': post_to_twitter,
        'linkedin': post_to_linkedin,
        'facebook': post_to_facebook
    }

    results = {}

    for platform, post_func in platforms.items():
        try:
            result = post_func(content, image_path)
            results[platform] = {"status": "success", "url": result}
        except Exception as e:
            results[platform] = {"status": "error", "error": str(e)}

    return results

def post_to_linkedin(content, image_path=None):
    # LinkedIn API implementation
    headers = {
        'Authorization': f'Bearer {LINKEDIN_ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }

    post_data = {
        'author': f'urn:li:person:{LINKEDIN_PERSON_ID}',
        'lifecycleState': 'PUBLISHED',
        'specificContent': {
            'com.linkedin.ugc.ShareContent': {
                'shareCommentary': {'text': content},
                'shareMediaCategory': 'NONE'
            }
        },
        'visibility': {'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'}
    }

    response = requests.post(
        'https://api.linkedin.com/v2/ugcPosts',
        headers=headers,
        json=post_data
    )

    return response.json()
```

## Content Calendar Management

```python
class ContentCalendar:
    def __init__(self):
        self.calendar = []

    def generate_monthly_calendar(self, themes):
        """Generate a month's worth of content"""

        calendar_prompt = f"""
        Create a 30-day social media content calendar.

        Themes: {', '.join(themes)}

        For each day, provide:
        - Topic/angle
        - Post type (tip, question, story, insight)
        - Best posting time
        - Content pillar

        Return as structured JSON.
        """

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": calendar_prompt}],
            response_format={"type": "json_object"}
        )

        self.calendar = json.loads(response.choices[0].message.content)
        return self.calendar

    def create_post_from_calendar(self, day):
        """Generate actual post content from calendar entry"""

        entry = self.calendar[day]

        post_prompt = f"""
        Create a social media post based on:
        - Topic: {entry['topic']}
        - Type: {entry['type']}
        - Theme: {entry['pillar']}

        Requirements:
        - Engaging and actionable
        - Include relevant hashtags
        - 280 characters max
        """

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": post_prompt}]
        )

        return response.choices[0].message.content
```

## Smart Hashtag Generation

```python
def generate_hashtags(post_content, max_tags=5):
    """Generate relevant hashtags for a post"""

    hashtag_prompt = f"""
    Generate {max_tags} relevant hashtags for this post:

    "{post_content}"

    Requirements:
    - Mix of popular and niche tags
    - Relevant to content
    - Industry-appropriate

    Return only hashtags, one per line, with # symbol.
    """

    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": hashtag_prompt}]
    )

    hashtags = response.choices[0].message.content.strip().split('\n')
    return ' '.join(hashtags[:max_tags])
```

## Analytics-Driven Optimization

```python
def analyze_best_posting_times(analytics_data):
    """Analyze when your audience is most engaged"""

    analysis_prompt = f"""
    Analyze this social media performance data:

    {json.dumps(analytics_data, indent=2)}

    Determine:
    - Best days to post
    - Optimal times for each platform
    - Content types that perform best
    - Engagement patterns

    Provide actionable scheduling recommendations.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": analysis_prompt}]
    )

    return response.choices[0].message.content
```

## Make.com Automation Workflow

**Scenario**: Auto-post blog articles to social media

1. **RSS Trigger**: Watch for new blog posts
2. **OpenAI Module**: Generate social media variants
3. **Twitter Module**: Post to Twitter
4. **LinkedIn Module**: Post to LinkedIn
5. **Delay**: Wait 2 hours between platforms
6. **Google Sheets**: Log all posts

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
