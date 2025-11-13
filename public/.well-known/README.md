# AI Plugin Configuration for CasinoAny

This directory contains configuration files for AI assistants (ChatGPT, Claude, Gemini, etc.) to understand and interact with CasinoAny.

## Files

### ai-plugin.json
ChatGPT/OpenAI plugin manifest file. Describes the plugin capabilities and API endpoints.

### openapi.yaml
OpenAPI 3.0 specification for the CasinoAny API. Defines all available endpoints for AI assistants.

## Available Endpoints

All endpoints are served via Supabase Edge Functions:

1. **GET /ai-site-info** - Get all betting sites
   - Returns comprehensive site information including bonuses, features, ratings

2. **POST /ai-site-info** - Search and filter sites
   - Search by query, rating, features
   - Supports sorting

3. **GET /ai-blog-info** - Get blog posts
   - Returns published articles with related sites
   - Filter by category

4. **GET /ai-reviews-info** - Get user reviews
   - Returns approved reviews with statistics
   - Filter by site and rating

## How to Use with AI Assistants

### ChatGPT
1. Go to ChatGPT Settings
2. Enable "Plugins" (ChatGPT Plus required)
3. Choose "Plugin store"
4. Click "Develop your own plugin"
5. Enter: `https://4e78fea3-70a4-4314-9f2b-f7f014635ad1.lovableproject.com`

### Custom GPT
1. Create a new GPT
2. In "Actions", import the OpenAPI spec from:
   `https://4e78fea3-70a4-4314-9f2b-f7f014635ad1.lovableproject.com/.well-known/openapi.yaml`

### Claude / Gemini
Share the API documentation URL with the AI:
- Plugin Info: `https://4e78fea3-70a4-4314-9f2b-f7f014635ad1.lovableproject.com/.well-known/ai-plugin.json`
- API Spec: `https://4e78fea3-70a4-4314-9f2b-f7f014635ad1.lovableproject.com/.well-known/openapi.yaml`

## Authentication

Currently, all endpoints are public and do not require authentication. This allows AI assistants to freely access the data.

## Rate Limiting

Edge Functions are rate-limited by Supabase. For production use, consider implementing caching or rate limiting on the client side.

## Updates

When making changes to the API:
1. Update openapi.yaml with new endpoints/parameters
2. Update ai-plugin.json if description changes
3. Test with ChatGPT plugin debugger

## Support

For issues or questions, contact: info@casinoany.com
