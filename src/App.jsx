import { useState, useEffect } from 'react'
import PipelineVisualizer from './components/PipelineVisualizer'
import Editor from './components/Editor'
import LogViewer from './components/LogViewer'
import InfrastructureMap from './components/InfrastructureMap'
import './App.css'

function App() {
  const [pipelineData, setPipelineData] = useState(null)
  const [logs, setLogs] = useState([])
  const [config, setConfig] = useState({
    title: 'Interactive Pipeline',
    description: 'Watch your changes flow through the stack'
  })

  useEffect(() => {
    const eventSource = new EventSource('/api/stream')

    eventSource.addEventListener('pipeline-update', (e) => {
      const data = JSON.parse(e.data)
      setPipelineData(data)
    })

    eventSource.addEventListener('log', (e) => {
      const log = JSON.parse(e.data)
      setLogs(prev => [...prev, log].slice(-100))
    })

    eventSource.onerror = (err) => {
      console.error('SSE error:', err)
      eventSource.close()
    }

    return () => eventSource.close()
  }, [])

  const handleConfigChange = async (newConfig) => {
    setConfig(newConfig)

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })

      if (!response.ok) {
        console.error('Failed to update config')
      }
    } catch (error) {
      console.error('Error updating config:', error)
    }
  }

  const triggerPipeline = async () => {
    try {
      await fetch('/api/pipeline/trigger', { method: 'POST' })
    } catch (error) {
      console.error('Error triggering pipeline:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{config.title}</h1>
        <p>{config.description}</p>
        <button onClick={triggerPipeline} className="trigger-btn">
          Trigger Pipeline
        </button>
      </header>

      <div className="app-grid">
        <section className="section infrastructure-section">
          <h2>Infrastructure Map</h2>
          <InfrastructureMap pipelineData={pipelineData} />
        </section>

        <section className="section pipeline-section">
          <h2>Pipeline Flow</h2>
          <PipelineVisualizer data={pipelineData} />
        </section>

        <section className="section editor-section">
          <h2>Configuration Editor</h2>
          <Editor config={config} onChange={handleConfigChange} />
        </section>

        <section className="section logs-section">
          <h2>Live Logs</h2>
          <LogViewer logs={logs} />
        </section>
      </div>
    </div>
  )
}

export default App
