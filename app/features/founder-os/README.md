# Founder OS

Founder OS is an internal product discovery module implemented within the Market Memory codebase.

Its purpose is to help identify recurring user problems, unmet needs, workflows, and product opportunities from public online discussions.

## Reddit API Usage

Founder OS may access publicly available Reddit posts and comments through the official Reddit Data API.

The module is designed to:

- retrieve only the minimum amount of data necessary for each product discovery task
- process Reddit content only during analysis
- generate anonymous summaries and high-level observations
- retain only derived insights, problem patterns, and summaries
- never store original Reddit posts or comments
- never store Reddit usernames or user profiles
- avoid inferring sensitive user characteristics
- respect deleted or removed Reddit content
- comply with Reddit API rate limits

Original Reddit content is used only as transient input during analysis and is discarded immediately after processing.

Only derived insights are stored in the internal Founder OS database.

Reddit data is never used to train machine learning or AI models.

## Scope

The Reddit integration is intended for low-volume internal product discovery only.

The module does not post, comment, vote, message users, moderate communities, or otherwise interact with Reddit users.

## Architecture

```text
Official Reddit Data API
        ↓
Temporary Analysis (Memory Only)
        ↓
Problem & Pattern Extraction
        ↓
Anonymous Derived Insights
        ↓
Founder OS Database (Insights Only)
```
