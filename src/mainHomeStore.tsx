import React from 'react'
import ReactDOM from 'react-dom/client'
import HomeStore from './HomeStore.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomeStore />
  </React.StrictMode>,
)
