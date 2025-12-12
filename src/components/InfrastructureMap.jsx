import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './InfrastructureMap.css'

const INFRASTRUCTURE_NODES = [
  { id: 'edge', label: 'Cloudflare Edge', type: 'edge', x: 0.5, y: 0.1 },
  { id: 'pages', label: 'Pages (Frontend)', type: 'frontend', x: 0.2, y: 0.35 },
  { id: 'worker', label: 'Worker (API)', type: 'backend', x: 0.5, y: 0.35 },
  { id: 'durable', label: 'Durable Objects', type: 'state', x: 0.8, y: 0.35 },
  { id: 'kv', label: 'KV Store', type: 'storage', x: 0.3, y: 0.65 },
  { id: 'd1', label: 'D1 Database', type: 'storage', x: 0.7, y: 0.65 },
  { id: 'github', label: 'GitHub', type: 'external', x: 0.5, y: 0.9 }
]

const CONNECTIONS = [
  { from: 'edge', to: 'pages' },
  { from: 'edge', to: 'worker' },
  { from: 'worker', to: 'durable' },
  { from: 'worker', to: 'kv' },
  { from: 'worker', to: 'd1' },
  { from: 'durable', to: 'd1' },
  { from: 'github', to: 'worker' }
]

const TYPE_COLORS = {
  edge: '#f59e0b',
  frontend: '#3b82f6',
  backend: '#8b5cf6',
  state: '#10b981',
  storage: '#06b6d4',
  external: '#6b7280'
}

function InfrastructureMap({ pipelineData }) {
  const svgRef = useRef()

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    svg.selectAll('*').remove()

    const nodes = INFRASTRUCTURE_NODES.map(n => ({
      ...n,
      x: n.x * width,
      y: n.y * height
    }))

    const g = svg.append('g')

    CONNECTIONS.forEach(conn => {
      const source = nodes.find(n => n.id === conn.from)
      const target = nodes.find(n => n.id === conn.to)

      const isActive = pipelineData?.activeConnections?.includes(`${conn.from}-${conn.to}`)

      g.append('line')
        .attr('x1', source.x)
        .attr('y1', source.y)
        .attr('x2', target.x)
        .attr('y2', target.y)
        .attr('stroke', isActive ? TYPE_COLORS[source.type] : '#3a3a4a')
        .attr('stroke-width', isActive ? 3 : 2)
        .attr('stroke-dasharray', isActive ? '0' : '5,5')
        .attr('opacity', isActive ? 1 : 0.4)
    })

    nodes.forEach(node => {
      const isActive = pipelineData?.activeNodes?.includes(node.id)

      const nodeGroup = g.append('g')
        .attr('transform', `translate(${node.x}, ${node.y})`)

      nodeGroup.append('rect')
        .attr('x', -60)
        .attr('y', -30)
        .attr('width', 120)
        .attr('height', 60)
        .attr('rx', 8)
        .attr('fill', isActive ? TYPE_COLORS[node.type] : 'var(--bg-secondary)')
        .attr('stroke', TYPE_COLORS[node.type])
        .attr('stroke-width', 2)
        .attr('class', isActive ? 'active-node' : '')

      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(node.label)
    })

  }, [pipelineData])

  return (
    <div className="infrastructure-map">
      <svg ref={svgRef} width="100%" height="400"></svg>
    </div>
  )
}

export default InfrastructureMap
