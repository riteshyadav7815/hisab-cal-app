'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left mb-4 p-4 bg-red-900/30 rounded-lg">
              <summary className="text-red-300 cursor-pointer">Error Details</summary>
              <pre className="text-red-200 text-sm mt-2 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;