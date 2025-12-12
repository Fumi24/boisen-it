# Deployment Guide

This guide walks through deploying the Interactive Pipeline Website to Cloudflare.

## Prerequisites

- Cloudflare account (free tier works fine)
- GitHub account (for automatic deployments)
- Wrangler CLI: `npm install -g wrangler`

## Option 1: Automated Deployment via GitHub (Recommended)

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Interactive Pipeline Website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

### 3. Add Environment Variables

In Cloudflare Pages settings, add these bindings:

**KV Namespace Bindings:**
- Variable name: `PIPELINE_KV`
- KV namespace: Select your created namespace

**D1 Database Bindings:**
- Variable name: `DB`
- D1 database: Select your created database

**Durable Object Bindings:**
- Variable name: `PIPELINE`
- Durable Object: `PipelineDurableObject`
- Script: Select your deployed worker

### 4. Deploy Worker First

Before Pages can use Durable Objects, deploy the worker:

```bash
npm run worker:deploy
```

### 5. Trigger Pages Deployment

Push to GitHub or manually trigger deployment from Cloudflare dashboard.

## Option 2: Manual Deployment

### 1. Deploy Worker

```bash
# Deploy to production
npx wrangler deploy
```

### 2. Build Frontend

```bash
npm run build
```

### 3. Deploy to Pages

```bash
npx wrangler pages deploy dist --project-name=interactive-pipeline
```

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to your Pages project → **Custom domains**
2. Add your domain
3. Update DNS records as instructed

### 2. Configure Worker Routes

For the worker to handle API requests from your Pages deployment:

1. Go to **Workers & Pages** → **Your Worker**
2. Add route: `your-domain.com/api/*`

### 3. Update CORS Headers

If deploying to a custom domain, update CORS headers in `worker/index.js`:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  // ... rest of headers
}
```

## Environment-Specific Configuration

### Production Wrangler Config

Update `wrangler.toml` with production IDs:

```toml
[env.production]
name = "interactive-pipeline-prod"

[[env.production.kv_namespaces]]
binding = "PIPELINE_KV"
id = "YOUR_PRODUCTION_KV_ID"

[[env.production.d1_databases]]
binding = "DB"
database_name = "pipeline_db_prod"
database_id = "YOUR_PRODUCTION_DB_ID"
```

Deploy to production environment:

```bash
npx wrangler deploy --env production
```

## Monitoring & Analytics

### Enable Analytics

1. Go to **Workers & Pages** → **Your Worker** → **Metrics**
2. View request metrics, error rates, and performance

### Logs

View real-time logs:

```bash
npx wrangler tail
```

Or in Cloudflare dashboard: **Workers & Pages** → **Your Worker** → **Logs**

## Performance Optimization

### 1. Edge Caching

Add cache headers in `worker/index.js` for static config:

```javascript
return new Response(JSON.stringify(config), {
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60'  // Cache for 60 seconds
  }
})
```

### 2. Minification

Vite automatically minifies in production builds.

### 3. Tree Shaking

Ensure proper imports to leverage tree shaking:

```javascript
import { select } from 'd3-selection'  // Good
import * as d3 from 'd3'  // Avoid if possible
```

## Scaling Considerations

The platform automatically scales with Cloudflare, but consider:

1. **Durable Objects**: Each pipeline creates a new Durable Object instance
2. **KV Limits**: Free tier: 100,000 reads/day, 1,000 writes/day
3. **Worker Invocations**: Free tier: 100,000 requests/day
4. **Pages Functions**: Unlimited requests on all plans

For high traffic (>100K requests/day), upgrade to Workers Paid plan ($5/month).

## Troubleshooting Deployment

### Issue: "Bindings not found"

Make sure KV, D1, and Durable Object bindings are configured in both:
- `wrangler.toml`
- Cloudflare Pages dashboard settings

### Issue: "Module not found" in worker

Ensure `main` field in `wrangler.toml` points to correct file:
```toml
main = "worker/index.js"
```

### Issue: SSE not working in production

Check CORS headers and ensure API routes are properly configured.

### Issue: 404 on API endpoints

Add proper routing in Cloudflare Pages settings or use `_routes.json`:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/api/*"]
}
```

Place this file in the `dist` folder to route `/api/*` to your Worker.

## Rollback Strategy

If something goes wrong:

```bash
# List deployments
npx wrangler deployments list

# Rollback worker to previous version
npx wrangler rollback
```

For Pages, use the Cloudflare dashboard to rollback to a previous deployment.

## Cost Estimation

For ~3,000 daily visitors:

- **Workers**: Free tier (100K requests/day)
- **Pages**: Free tier (Unlimited)
- **KV**: Free tier (100K reads/day, 1,000 writes/day)
- **D1**: Free tier (5M reads/month, 100K writes/month)
- **Durable Objects**: $0.15/million requests + $0.02/GB-month storage

**Estimated monthly cost**: $0-5 depending on usage patterns.

For Hacker News front-page traffic spikes, temporarily upgrade to Workers Paid ($5/month) for the month.
