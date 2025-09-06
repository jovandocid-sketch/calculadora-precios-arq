import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/App.jsx'

createRoot(document.getElementById('root') || (()=>{
  const r=document.createElement('div'); r.id='root'; document.body.appendChild(r); return r;
})())
  .render(<App />)
