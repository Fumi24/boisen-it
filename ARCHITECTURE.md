# Architecture Documentation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User's Browser                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     React Application                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  Pipeline   │  │Infrastructure│  │    Log      │          │  │
│  │  │ Visualizer  │  │     Map      │  │   Viewer    │          │  │
│  │  │   (D3.js)   │  │   (D3.js)    │  │   (SSE)     │          │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │  │
│  │                                                                │  │
│  │  ┌─────────────┐                                              │  │
│  │  │   Editor    │                                              │  │
│  │  │ (Config UI) │                                              │  │
│  │  └─────────────┘                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         │                      ▲                    │
│                         │ POST                 │ SSE                │
│                         │ /api/*               │ /api/stream        │
└─────────────────────────┼──────────────────────┼────────────────────┘
                          │                      │
                          ▼                      │
        ┌─────────────────────────────────────────────────┐
        │         Cloudflare Edge Network                 │
        │  ┌───────────────────────────────────────────┐ │
        │  │         Cloudflare Pages (Frontend)       │ │
        │  │  - Serves React SPA                       │ │
        │  │  - Global CDN caching                     │ │
        │  │  - Static asset optimization              │ │
        │  └───────────────────────────────────────────┘ │
        │  ┌───────────────────────────────────────────┐ │
        │  │      Cloudflare Worker (API/Backend)      │ │
        │  │  ┌─────────────────────────────────────┐ │ │
        │  │  │       HTTP Request Router            │ │ │
        │  │  │  - /api/stream → SSE Handler         │ │ │
        │  │  │  - /api/pipeline/trigger → Trigger   │ │ │
        │  │  │  - /api/config → Config Handler      │ │ │
        │  │  └─────────────────────────────────────┘ │ │
        │  └───────────────────────────────────────────┘ │
        └─────────────────────────────────────────────────┘
                          │                      ▲
                          │                      │
                          ▼                      │
        ┌─────────────────────────────────────────────────┐
        │            Durable Object Instance              │
        │  ┌───────────────────────────────────────────┐ │
        │  │        Pipeline State Machine             │ │
        │  │                                            │ │
        │  │  State: currentStage, completedStages     │ │
        │  │  Methods:                                  │ │
        │  │   - startPipeline()                       │ │
        │  │   - executePipeline()                     │ │
        │  │   - simulateStage()                       │ │
        │  │   - broadcast()                           │ │
        │  │                                            │ │
        │  │  SSE Sessions: Set<WritableStream>        │ │
        │  └───────────────────────────────────────────┘ │
        └─────────────────────────────────────────────────┘
                          │                      ▲
                          ▼                      │
        ┌─────────────────────────────────────────────────┐
        │              Cloudflare Storage                  │
        │  ┌─────────────────┐  ┌─────────────────┐      │
        │  │   KV Storage    │  │  D1 Database    │      │
        │  │                 │  │                 │      │
        │  │  - config       │  │  - pipeline_runs│      │
        │  │  - user_prefs   │  │  - pipeline_logs│      │
        │  └─────────────────┘  └─────────────────┘      │
        └─────────────────────────────────────────────────┘
```

## Data Flow

### 1. Pipeline Trigger Flow

```
User clicks "Trigger Pipeline"
    │
    ├─> Frontend: POST /api/pipeline/trigger
    │
    ├─> Worker: Route to handleTriggerPipeline()
    │
    ├─> Fetch config from KV
    │
    ├─> Get Durable Object stub
    │
    ├─> Forward request to Durable Object
    │
    └─> Durable Object: startPipeline()
            │
            ├─> Create pipeline state
            ├─> Broadcast initial state
            ├─> Start stage execution loop
            │       │
            │       ├─> For each stage:
            │       │   ├─> Update currentStage
            │       │   ├─> Broadcast update
            │       │   ├─> Emit log
            │       │   ├─> Simulate work (progress updates)
            │       │   ├─> Complete stage
            │       │   └─> Broadcast completion
            │       │
            │       └─> Mark pipeline complete
            │
            └─> Final broadcast with duration
```

### 2. SSE Connection Flow

```
Frontend: new EventSource('/api/stream')
    │
    ├─> Worker: Route to handleSSE()
    │
    ├─> Get Durable Object stub
    │
    ├─> Forward to Durable Object
    │
    └─> Durable Object: handleSSE()
            │
            ├─> Create TransformStream
            ├─> Store session in Set
            ├─> Send current state (if exists)
            └─> Return ReadableStream
                    │
                    └─> Kept open for continuous streaming
                            │
                            ├─> On pipeline update: broadcast()
                            ├─> On log event: broadcast()
                            └─> On error: remove session
```

### 3. Config Update Flow

```
User saves config in Editor
    │
    ├─> Frontend: onChange() → POST /api/config
    │
    ├─> Worker: handleConfigUpdate()
    │
    ├─> Save to KV: PIPELINE_KV.put('config', ...)
    │
    ├─> Trigger new pipeline
    │
    └─> Return success
```

## Component Architecture

### Frontend Component Hierarchy

```
App (Root)
├── Header
│   ├── Title (from config)
│   ├── Description (from config)
│   └── Trigger Button
│
├── Infrastructure Section
│   └── InfrastructureMap (D3.js)
│       ├── SVG Canvas
│       ├── Infrastructure Nodes
│       │   ├── Edge
│       │   ├── Pages
│       │   ├── Worker
│       │   ├── Durable Objects
│       │   ├── KV
│       │   ├── D1
│       │   └── GitHub
│       └── Connections
│
├── Pipeline Section
│   └── PipelineVisualizer (D3.js)
│       ├── SVG Canvas
│       ├── Stage Nodes
│       │   ├── Queued
│       │   ├── Building
│       │   ├── Testing
│       │   ├── Deploying
│       │   └── Live
│       ├── Progress Indicators
│       └── Pipeline Info Panel
│
├── Editor Section
│   └── Editor
│       ├── Title Input
│       ├── Description Textarea
│       ├── Save Button
│       └── Info Panel
│
└── Logs Section
    └── LogViewer
        ├── Log Container
        └── Log Entries
            ├── Timestamp
            ├── Icon
            ├── Stage
            └── Message
```

### State Management

```
App Component State
├── pipelineData (from SSE)
│   ├── id
│   ├── currentStage
│   ├── completedStages
│   ├── progress
│   ├── startTime
│   ├── duration
│   ├── activeNodes
│   └── activeConnections
│
├── logs (from SSE)
│   └── Array<LogEntry>
│       ├── type
│       ├── stage
│       ├── message
│       └── timestamp
│
└── config (from KV)
    ├── title
    └── description
```

## Network Communication

### API Endpoints

```
GET  /api/config           → Fetch current config from KV
POST /api/config           → Save config to KV, trigger pipeline
POST /api/pipeline/trigger → Manually trigger pipeline
GET  /api/stream           → SSE endpoint for real-time updates
```

### SSE Event Types

```
event: pipeline-update
data: {
  id: "pipeline-123",
  currentStage: "building",
  completedStages: ["queued"],
  progress: 45,
  activeNodes: ["worker", "durable", "github"],
  activeConnections: ["worker-durable", "github-worker"]
}

event: log
data: {
  type: "info",
  stage: "building",
  message: "Compiling source code...",
  timestamp: 1702345678901
}
```

## Storage Schema

### KV Store

```
Key: "config"
Value: {
  title: string,
  description: string
}
```

### D1 Database

```sql
-- Pipeline Runs
pipeline_runs
├── id (TEXT PRIMARY KEY)
├── config (TEXT)
├── start_time (INTEGER)
├── end_time (INTEGER)
├── duration (INTEGER)
├── status (TEXT)
├── stages_completed (TEXT)
└── created_at (INTEGER)

-- Pipeline Logs
pipeline_logs
├── id (INTEGER PRIMARY KEY)
├── pipeline_id (TEXT FK)
├── stage (TEXT)
├── type (TEXT)
├── message (TEXT)
└── timestamp (INTEGER)
```

## Deployment Architecture

### Development Environment

```
Developer Machine
├── Terminal 1: Wrangler Dev (localhost:8787)
│   └── Worker + Durable Objects
│
├── Terminal 2: Vite Dev Server (localhost:3000)
│   ├── React HMR
│   └── Proxy /api/* to :8787
│
└── Browser (localhost:3000)
```

### Production Environment

```
Cloudflare Global Network
├── Edge Locations (275+)
│   ├── Pages: Static assets
│   └── Workers: API endpoints
│
├── Durable Objects (Regional)
│   └── Pipeline execution
│
└── Storage
    ├── KV: Globally replicated
    └── D1: Regional with replication
```

## Scaling Architecture

### Horizontal Scaling

```
Traffic Increase
    │
    ├─> More edge locations serve traffic
    │   └─> Automatic with Cloudflare
    │
    ├─> More Durable Object instances
    │   └─> One per pipeline (isolated)
    │
    └─> KV auto-replication
        └─> Read from nearest location
```

### Vertical Scaling (Per Pipeline)

```
Each Pipeline = One Durable Object Instance
    │
    ├─> Handles multiple SSE connections
    ├─> Manages its own state
    ├─> Broadcasts to all sessions
    └─> Isolated from other pipelines
```

## Security Architecture

```
Security Layers
├── Edge (Cloudflare)
│   ├── DDoS protection
│   ├── WAF (optional)
│   └── Bot management
│
├── Worker
│   ├── CORS headers
│   ├── Input validation
│   └── Rate limiting (future)
│
├── Durable Objects
│   ├── State isolation
│   └── Session management
│
└── Storage
    ├── KV: Namespace isolation
    └── D1: Parameterized queries
```

## Monitoring Architecture

```
Observability Stack
├── Cloudflare Dashboard
│   ├── Worker Metrics
│   │   ├── Request volume
│   │   ├── Error rate
│   │   ├── CPU time
│   │   └── Latency (p50, p95, p99)
│   │
│   ├── Durable Objects Metrics
│   │   ├── Active objects
│   │   ├── Request count
│   │   └── Storage usage
│   │
│   └── Pages Analytics
│       ├── Page views
│       ├── Bandwidth
│       └── Geographic distribution
│
└── Real-time Logs
    ├── wrangler tail (CLI)
    └── Dashboard logs viewer
```

---

This architecture provides:
- **Scalability**: Handles traffic spikes automatically
- **Performance**: <50ms latency globally
- **Reliability**: Built-in redundancy and failover
- **Cost-efficiency**: Pay only for what you use
- **Developer experience**: Simple deployment, great DX
