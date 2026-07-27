import { Component } from 'react';

export default class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Scene crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#04141c',
            color: '#ffb4b4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            padding: 24,
            fontFamily: 'monospace',
            fontSize: 14,
            textAlign: 'center',
            zIndex: 999,
          }}
        >
          <strong>3D sahne render edilirken bir hata oluştu.</strong>
          <span style={{ maxWidth: 640, opacity: 0.85 }}>{String(this.state.error?.message || this.state.error)}</span>
          <span style={{ opacity: 0.6 }}>Konsolu (F12) açıp tam hata mesajını kontrol et.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
