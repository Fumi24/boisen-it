# Quick Setup Guide

Follow these steps to get the Interactive Pipeline Website running locally.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup Cloudflare Resources

### A. Login to Cloudflare
```bash
npx wrangler login
```

### B. Create KV Namespace
```bash
npx wrangler kv:namespace create PIPELINE_KV
```

You'll see output like:
```
{ binding = "PIPELINE_KV", id = "xxxxxxxxxxxxxx" }
```

Copy the `id` value and update it in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "PIPELINE_KV"
id = "YOUR_KV_NAMESPACE_ID_HERE"  # <-- Update this
```

### C. Create D1 Database
```bash
npx wrangler d1 create pipeline_db
```

You'll see output like:
```
database_id = "xxxxxxxxxxxxxx"
```

Copy the `database_id` and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "pipeline_db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- Update this
```

### D. Initialize Database Schema
```bash
npx wrangler d1 execute pipeline_db --file=worker/schema.sql
```

## Step 3: Run Development Servers

### Terminal 1 - Start Cloudflare Worker
```bash
npm run worker:dev
```

This will start the worker on `http://localhost:8787`

### Terminal 2 - Start Vite Dev Server
```bash
npm run dev
```

This will start the frontend on `http://localhost:3000`

## Step 4: Open in Browser

Navigate to `http://localhost:3000` and you should see the Interactive Pipeline Website!

Click "Trigger Pipeline" to see the visualization in action.

## Troubleshooting

### Issue: "KV namespace not found"
- Make sure you've created the KV namespace and updated the ID in `wrangler.toml`
- Run `npx wrangler kv:namespace list` to see your namespaces

### Issue: "D1 database not found"
- Make sure you've created the database and updated the ID in `wrangler.toml`
- Run `npx wrangler d1 list` to see your databases

### Issue: "Module not found" errors
- Make sure you've run `npm install`
- Delete `node_modules` and run `npm install` again

### Issue: SSE connection fails
- Make sure both the worker and Vite dev server are running
- Check that the proxy configuration in `vite.config.js` points to the correct worker URL

## Next Steps

Once everything is running locally:

1. **Edit Configuration**: Use the Editor component to change the title/description
2. **Trigger Pipeline**: Click the "Trigger Pipeline" button
3. **Watch Visualization**: See the pipeline flow through all stages
4. **View Logs**: Check the Live Logs panel for real-time updates

## Deployment to Production

See the main [README.md](./README.md) for deployment instructions.
