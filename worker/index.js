export { PipelineDurableObject } from './pipeline-durable-object.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)

    if (url.pathname === '/api/stream') {
      return handleSSE(request, env)
    }

    if (url.pathname === '/api/pipeline/trigger' && request.method === 'POST') {
      return handleTriggerPipeline(request, env)
    }

    if (url.pathname === '/api/config' && request.method === 'POST') {
      return handleConfigUpdate(request, env)
    }

    if (url.pathname === '/api/config' && request.method === 'GET') {
      return handleGetConfig(request, env)
    }

    return new Response('Not Found', { status: 404 })
  }
}

async function handleSSE(request, env) {
  const id = env.PIPELINE.idFromName('global-pipeline')
  const stub = env.PIPELINE.get(id)

  const response = await stub.fetch(request)
  return response
}

async function handleTriggerPipeline(request, env) {
  const id = env.PIPELINE.idFromName('global-pipeline')
  const stub = env.PIPELINE.get(id)

  const config = await env.PIPELINE_KV.get('config', 'json') || {}

  const triggerRequest = new Request('http://internal/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })

  await stub.fetch(triggerRequest)

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleConfigUpdate(request, env) {
  const config = await request.json()

  await env.PIPELINE_KV.put('config', JSON.stringify(config))

  const id = env.PIPELINE.idFromName('global-pipeline')
  const stub = env.PIPELINE.get(id)

  const triggerRequest = new Request('http://internal/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })

  await stub.fetch(triggerRequest)

  return new Response(JSON.stringify({ success: true, config }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleGetConfig(request, env) {
  const config = await env.PIPELINE_KV.get('config', 'json') || {
    title: 'Interactive Pipeline',
    description: 'Watch your changes flow through the stack'
  }

  return new Response(JSON.stringify(config), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
