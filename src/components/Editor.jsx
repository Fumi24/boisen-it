import { useState, useEffect } from 'react'
import './Editor.css'

function Editor({ config, onChange }) {
  const [localConfig, setLocalConfig] = useState(config)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleChange = (field, value) => {
    const updated = { ...localConfig, [field]: value }
    setLocalConfig(updated)
  }

  const handleSave = () => {
    onChange(localConfig)
  }

  return (
    <div className="editor">
      <div className="editor-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={localConfig.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter title..."
        />
      </div>

      <div className="editor-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={localConfig.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description..."
          rows={4}
        />
      </div>

      <button onClick={handleSave} className="save-btn">
        Save Changes & Trigger Pipeline
      </button>

      <div className="editor-info">
        <p>Edit the configuration above and click save to trigger a new pipeline run.</p>
        <p>Watch your changes flow through the entire infrastructure in real-time!</p>
      </div>
    </div>
  )
}

export default Editor
