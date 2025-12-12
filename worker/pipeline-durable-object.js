const STAGES = ['queued', 'building', 'testing', 'deploying', 'live']

export class PipelineDurableObject {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.sessions = new Set()
    this.currentPipeline = null
  }

  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/trigger' && request.method === 'POST') {
      const config = await request.json()
      await this.startPipeline(config)
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (url.pathname === '/api/stream') {
      return this.handleSSE(request)
    }

    return new Response('Not Found', { status: 404 })
  }

  async startPipeline(config) {
    const pipelineId = `pipeline-${Date.now()}`

    this.currentPipeline = {
      id: pipelineId,
      config,
      currentStage: 'queued',
      completedStages: [],
      startTime: Date.now(),
      progress: 0,
      activeNodes: ['edge', 'worker'],
      activeConnections: []
    }

    this.broadcast({
      type: 'pipeline-update',
      data: this.currentPipeline
    })

    this.emitLog('info', 'queued', `Pipeline ${pipelineId} queued`)

    await this.executePipeline()
  }

  async executePipeline() {
    for (let i = 0; i < STAGES.length; i++) {
      const stage = STAGES[i]
      this.currentPipeline.currentStage = stage
      this.currentPipeline.progress = 0

      this.updateActiveInfrastructure(stage)

      this.broadcast({
        type: 'pipeline-update',
        data: this.currentPipeline
      })

      this.emitLog('info', stage, `Starting ${stage} stage`)

      await this.simulateStage(stage)

      this.currentPipeline.completedStages.push(stage)
      this.currentPipeline.progress = 100

      this.broadcast({
        type: 'pipeline-update',
        data: this.currentPipeline
      })

      this.emitLog('success', stage, `Completed ${stage} stage`)

      await this.sleep(500)
    }

    this.currentPipeline.currentStage = 'completed'
    this.currentPipeline.duration = `${Math.round((Date.now() - this.currentPipeline.startTime) / 1000)}s`

    this.broadcast({
      type: 'pipeline-update',
      data: this.currentPipeline
    })

    this.emitLog('success', 'live', `Pipeline completed successfully in ${this.currentPipeline.duration}`)
  }

  async simulateStage(stage) {
    const duration = 2000 + Math.random() * 2000
    const steps = 10
    const stepDuration = duration / steps

    for (let i = 0; i <= steps; i++) {
      this.currentPipeline.progress = (i / steps) * 100

      this.broadcast({
        type: 'pipeline-update',
        data: this.currentPipeline
      })

      if (i === Math.floor(steps / 2)) {
        this.emitLog('info', stage, `${stage} at 50%...`)
      }

      await this.sleep(stepDuration)
    }
  }

  updateActiveInfrastructure(stage) {
    const infraMap = {
      'queued': {
        nodes: ['edge', 'worker', 'kv'],
        connections: ['edge-worker', 'worker-kv']
      },
      'building': {
        nodes: ['worker', 'durable', 'github'],
        connections: ['worker-durable', 'github-worker']
      },
      'testing': {
        nodes: ['worker', 'durable', 'd1'],
        connections: ['worker-durable', 'durable-d1']
      },
      'deploying': {
        nodes: ['worker', 'pages', 'edge'],
        connections: ['worker-pages', 'edge-pages']
      },
      'live': {
        nodes: ['edge', 'pages', 'worker'],
        connections: ['edge-pages', 'edge-worker']
      }
    }

    const config = infraMap[stage] || { nodes: [], connections: [] }
    this.currentPipeline.activeNodes = config.nodes
    this.currentPipeline.activeConnections = config.connections
  }

  emitLog(type, stage, message) {
    const log = {
      type,
      stage,
      message,
      timestamp: Date.now()
    }

    this.broadcast({
      type: 'log',
      data: log
    })
  }

  handleSSE(request) {
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()

    const session = {
      writer,
      send: async (event, data) => {
        try {
          await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch (e) {
          this.sessions.delete(session)
        }
      }
    }

    this.sessions.add(session)

    if (this.currentPipeline) {
      session.send('pipeline-update', this.currentPipeline)
    }

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  broadcast(message) {
    const deadSessions = []

    for (const session of this.sessions) {
      try {
        session.send(message.type, message.data)
      } catch (e) {
        deadSessions.push(session)
      }
    }

    for (const session of deadSessions) {
      this.sessions.delete(session)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
