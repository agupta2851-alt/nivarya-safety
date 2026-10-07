import React from 'react';

/**
 * Nivarya ErrorBoundary Component
 * 
 * Prevents blank-screen crashes by gracefully catching uncaught runtime exceptions
 * in the React component tree and offering state recovery options.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Nivarya Runtime Initialization / Render Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      // Clear app state keys that could be corrupted
      const keysToRemove = [
        'nivarya_auth_session',
        'nivarya_profile',
        'nivarya_location_state',
        'nivarya_contacts',
        'nivarya_active_journey',
        'nivarya_safety_mode',
        'nivarya_lang'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    window.location.href = '/';
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'Application Initialization Recovery' } = this.props;

      return (
        <div 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B1120',
            color: '#F1F5F9',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            padding: '24px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{
              maxWidth: '620px',
              width: '100%',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '20px',
              padding: '32px 24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.15)',
              textAlign: 'center'
            }}
          >
            {/* Warning Shield Icon */}
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '28px'
              }}
            >
              🛡️
            </div>

            <h1 
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0 0 10px 0',
                letterSpacing: '-0.02em'
              }}
            >
              {fallbackTitle}
            </h1>

            <p 
              style={{
                fontSize: '0.92rem',
                color: '#94A3B8',
                lineHeight: 1.6,
                margin: '0 0 24px 0'
              }}
            >
              A runtime component initialization error occurred. Nivarya prevented a complete blank screen crash. You can reload the application or reset local state.
            </p>

            {/* Error Message Snippet */}
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                color: '#F87171',
                overflowX: 'auto'
              }}
            >
              <strong>Error:</strong> {this.state.error?.message || 'Unknown runtime error'}
            </div>

            {/* Diagnostic Details Toggle */}
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366F1',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {this.state.showDetails ? '▲ Hide Technical Details' : '▼ View Technical Details'}
              </button>

              {this.state.showDetails && (
                <pre 
                  style={{
                    background: '#050811',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '10px',
                    fontSize: '0.75rem',
                    color: '#CBD5E1',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error?.stack || 'No stack trace available'}
                  {this.state.errorInfo?.componentStack || ''}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div 
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: '#6366F1',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 22px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                }}
              >
                🔄 Reload App
              </button>

              <button
                type="button"
                onClick={this.handleResetState}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#F87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🧹 Reset Cache & Clean State
              </button>

              <button
                type="button"
                onClick={this.handleDismiss}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#94A3B8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
