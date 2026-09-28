import { Component } from 'react'

/**
 * Keeps one broken subtree from blanking the whole app. Before this existed, a single
 * render error (for example malformed stored content) unmounted the entire React tree and
 * left a white page with no way back - and in the admin it also hid unsaved edits.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
    this.reset = this.reset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[personal-explorer] render failed:', error, info?.componentStack)
  }

  reset() {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.renderFallback) return this.props.renderFallback(error, this.reset)

    return (
      <div role="alert" style={{ display: 'grid', gap: '.75rem', placeContent: 'center', minHeight: '100dvh', padding: '2rem', textAlign: 'center', background: '#f5f2e9', color: '#18181b', fontFamily: 'system-ui, sans-serif' }}>
        <strong style={{ fontSize: '1.15rem' }}>{this.props.title || '界面遇到问题'}</strong>
        <p style={{ maxWidth: '36rem', color: '#52525b' }}>{error.message || '渲染时发生未知错误。'}</p>
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center' }}>
          <button type="button" onClick={this.reset} style={{ padding: '.6rem 1rem', borderRadius: '.6rem', border: '1px solid #18181b', background: '#fff', cursor: 'pointer' }}>重试</button>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '.6rem 1rem', borderRadius: '.6rem', border: 0, background: '#18181b', color: '#fff', cursor: 'pointer' }}>重新载入</button>
        </div>
      </div>
    )
  }
}
