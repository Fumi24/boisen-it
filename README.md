# Interactive Pipeline Website

A real-time web platform that visualizes its own infrastructure and CI/CD workflow. Users can make edits and watch changes flow through the full stack: Edge → CI/CD → Deployment → Runtime → Monitoring.

## Architecture

### Frontend
- **Framework**: React + Vite
- **Visualization**: D3.js for dynamic pipeline and infrastructure diagrams
- **Hosting**: Cloudflare Pages

### Backend
- **Platform**: Cloudflare Workers (serverless)
- **State Management**: Durable Objects (pipeline state machines)
- **Data Storage**: KV (config) + D1 (history/logs)
- **Event Streaming**: Server-Sent Events (SSE)

### Pipeline Stages
1. **QUEUED** - Pipeline request received
2. **BUILDING** - Simulated build process
3. **TESTING** - Simulated test execution
4. **DEPLOYING** - Simulated deployment
5. **LIVE** - Successfully deployed

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account
- Wrangler CLI installed globally: `npm install -g wrangler`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Create KV Namespace**
   ```bash
   wrangler kv:namespace create PIPELINE_KV
   ```
   Copy the ID and update `wrangler.toml`

4. **Create D1 Database**
   ```bash
   wrangler d1 create pipeline_db
   ```
   Copy the database ID and update `wrangler.toml`

5. **Initialize Database Schema**
   ```bash
   wrangler d1 execute pipeline_db --file=worker/schema.sql
   ```

### Development

1. **Start Cloudflare Worker (in one terminal)**
   ```bash
   npm run worker:dev
   ```

2. **Start Vite Dev Server (in another terminal)**
   ```bash
   npm run dev
   ```

3. **Open browser**
   Navigate to `http://localhost:3000`

### Deployment

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Deploy Worker**
   ```bash
   npm run worker:deploy
   ```

3. **Deploy to Cloudflare Pages**
   ```bash
   npm run deploy
   ```

   Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

## Features

- **Real-time Pipeline Visualization**: Watch each stage progress with animated SVG diagrams
- **Infrastructure Map**: See which Cloudflare services are active during each pipeline stage
- **Live Logs**: Stream logs in real-time with color-coded message types
- **Interactive Editor**: Edit configuration and trigger new pipeline runs
- **Server-Sent Events**: Efficient one-way streaming from server to client
- **Durable Objects**: Persistent WebSocket-like state for pipeline execution
- **Edge Computing**: Fully serverless architecture on Cloudflare's global network

## Project Structure

```
boisen-it/
├── src/                      # Frontend React application
│   ├── components/           # React components
│   │   ├── PipelineVisualizer.jsx
│   │   ├── InfrastructureMap.jsx
│   │   ├── Editor.jsx
│   │   └── LogViewer.jsx
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── worker/                   # Cloudflare Worker backend
│   ├── index.js              # Worker entry point
│   ├── pipeline-durable-object.js  # Pipeline state machine
│   └── schema.sql            # D1 database schema
├── wrangler.toml             # Cloudflare configuration
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies and scripts
```

## Configuration

Edit `wrangler.toml` to configure:
- KV namespace binding
- D1 database binding
- Durable Object bindings
- Environment variables


## Future Enhancements

- [ ] GitHub Actions integration for real CI/CD
- [ ] Webhook support for external triggers
- [ ] Historical pipeline analytics
- [ ] Multi-user sessions with isolated pipelines
- [ ] Advanced edge logic simulation (WAF, rate limiting)
- [ ] Performance metrics and monitoring
- [ ] Custom pipeline stage configuration

## License

MIT License - feel free to use this project for learning and experimentation.
