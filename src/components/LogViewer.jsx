import { useEffect, useRef } from 'react'
import './LogViewer.css'

const LOG_TYPES = {
  info: { icon: 'ℹ️', color: 'var(--accent-blue)' },
  success: { icon: '✓', color: 'var(--accent-green)' },
  warning: { icon: '⚠', color: 'var(--accent-yellow)' },
  error: { icon: '✗', color: 'var(--accent-red)' }
}

function LogViewer({ logs }) {
  const logsEndRef = useRef(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="log-viewer">
      <div className="log-container">
        {logs.length === 0 ? (
          <div className="log-empty">
            <p>No logs yet. Trigger a pipeline to see logs appear here.</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const logType = LOG_TYPES[log.type] || LOG_TYPES.info
            return (
              <div key={index} className={`log-entry log-${log.type}`}>
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className="log-icon"
                  style={{ color: logType.color }}
                >
                  {logType.icon}
                </span>
                <span className="log-stage">[{log.stage}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            )
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}

export default LogViewer
