# Quick Start Guide

Get the Interactive Pipeline Website running in **under 5 minutes**.

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- Cloudflare account (free tier works) ([Sign up](https://dash.cloudflare.com/sign-up))

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Cloudflare (One-time)

### Option A: Automated Setup (Recommended)

**Windows:**
```bash
scripts\setup.bat
```

**macOS/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option B: Manual Setup

```bash
# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create PIPELINE_KV
# Copy the ID and update wrangler.toml

# Create D1 database
npx wrangler d1 create pipeline_db
# Copy the database_id and update wrangler.toml

# Initialize database
npx wrangler d1 execute pipeline_db --file=worker/schema.sql
```

## 3. Update Configuration

Edit `wrangler.toml` with your IDs:

```toml
[[kv_namespaces]]
binding = "PIPELINE_KV"
id = "YOUR_KV_ID_HERE"  # <-- Update this

[[d1_databases]]
binding = "DB"
database_name = "pipeline_db"
database_id = "YOUR_DB_ID_HERE"  # <-- Update this
```

## 4. Run Development Servers

**Terminal 1 - Worker:**
```bash
npm run worker:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 5. Open in Browser

Navigate to: **http://localhost:3000**

## 6. Test It Out

1. Click **"Trigger Pipeline"** button
2. Watch the pipeline visualization animate through stages
3. See infrastructure components light up
4. View real-time logs streaming in
5. Edit configuration and save to trigger another pipeline

## Success! 🎉

You should see:
- Pipeline flowing through: QUEUED → BUILDING → TESTING → DEPLOYING → LIVE
- Infrastructure map highlighting active components
- Live logs appearing in real-time
- Configuration editor ready for changes

## Next Steps

- **Explore Features**: See [FEATURES.md](./FEATURES.md) for technical details
- **Deploy to Production**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Contribute**: Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Customize**: Modify colors, add stages, integrate real CI/CD

## Troubleshooting

### Port Already in Use

If port 3000 or 8787 is in use, update the ports:

**vite.config.js:**
```javascript
server: { port: 3001 }
```

**Worker:**
```bash
npx wrangler dev --port 8788
```

### KV/D1 Not Found

Make sure:
1. You've created the resources
2. IDs are correctly copied to `wrangler.toml`
3. You're logged into the correct Cloudflare account

### SSE Connection Fails

1. Ensure both worker and frontend are running
2. Check proxy config in `vite.config.js`
3. Verify worker is on port 8787

### No Logs Appearing

1. Check browser console for errors
2. Verify SSE connection is established (Network tab)
3. Make sure you've triggered a pipeline

## Common Commands

```bash
# Development
npm run dev              # Start frontend
npm run worker:dev       # Start worker

# Build
npm run build            # Build frontend

# Deploy
npm run worker:deploy    # Deploy worker
npm run deploy           # Deploy to Pages

# Utilities
npx wrangler tail        # View live worker logs
npx wrangler kv:key list --binding=PIPELINE_KV  # List KV keys
npx wrangler d1 execute pipeline_db --command="SELECT * FROM pipeline_runs"  # Query D1
```

## Project Structure

```
boisen-it/
├── src/              # React frontend
├── worker/           # Cloudflare Worker backend
├── public/           # Static assets
├── scripts/          # Setup automation
└── *.md              # Documentation
```

## Resources

- [Full Documentation](./README.md)
- [Detailed Setup Guide](./SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Feature Documentation](./FEATURES.md)

## Getting Help

- Check existing documentation first
- Search GitHub issues
- Open a new issue with details
- Include error messages and logs

---

**Ready to visualize your pipeline? Start building!** 🚀
