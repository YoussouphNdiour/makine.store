'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          margin: '2rem',
          padding: '1.5rem',
          borderRadius: '1rem',
          background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.3)',
          color: '#f87171',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>❌ Erreur dashboard</p>
          <pre style={{ whiteSpace: 'pre-wrap', opacity: 0.8 }}>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
