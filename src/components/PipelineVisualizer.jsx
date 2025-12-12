import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './PipelineVisualizer.css'

const STAGES = [
  { id: 'queued', label: 'QUEUED', color: '#6b7280' },
  { id: 'building', label: 'BUILDING', color: '#3b82f6' },
  { id: 'testing', label: 'TESTING', color: '#8b5cf6' },
  { id: 'deploying', label: 'DEPLOYING', color: '#f59e0b' },
  { id: 'live', label: 'LIVE', color: '#10b981' }
]

function PipelineVisualizer({ data }) {
  const svgRef = useRef()

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    svg.selectAll('*').remove()

    const g = svg.append('g')
      .attr('transform', `translate(50, ${height / 2})`)

    const stageWidth = (width - 100) / STAGES.length
    const nodeRadius = 30

    STAGES.forEach((stage, i) => {
      const x = i * stageWidth
      const isActive = data?.currentStage === stage.id
      const isPast = data?.completedStages?.includes(stage.id)

      if (i < STAGES.length - 1) {
        g.append('line')
          .attr('x1', x + nodeRadius)
          .attr('y1', 0)
          .attr('x2', x + stageWidth - nodeRadius)
          .attr('y2', 0)
          .attr('stroke', isPast ? stage.color : '#3a3a4a')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', isPast ? '0' : '5,5')
      }

      const node = g.append('g')
        .attr('transform', `translate(${x}, 0)`)

      node.append('circle')
        .attr('r', nodeRadius)
        .attr('fill', isActive ? stage.color : (isPast ? stage.color : 'var(--bg-tertiary)'))
        .attr('stroke', stage.color)
        .attr('stroke-width', isActive ? 4 : 2)
        .attr('class', isActive ? 'pulse' : '')

      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(stage.label.slice(0, 1))

      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', nodeRadius + 25)
        .attr('fill', isActive ? stage.color : 'var(--text-secondary)')
        .attr('font-size', '14px')
        .text(stage.label)

      if (isActive && data?.progress) {
        node.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', nodeRadius + 45)
          .attr('fill', 'var(--text-secondary)')
          .attr('font-size', '12px')
          .text(`${Math.round(data.progress)}%`)
      }
    })

  }, [data])

  return (
    <div className="pipeline-visualizer">
      <svg ref={svgRef} width="100%" height="200"></svg>
      {data && (
        <div className="pipeline-info">
          <div className="info-item">
            <span className="label">Pipeline ID:</span>
            <span className="value">{data.id || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="label">Started:</span>
            <span className="value">{data.startTime ? new Date(data.startTime).toLocaleTimeString() : 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="label">Duration:</span>
            <span className="value">{data.duration || '0s'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PipelineVisualizer
