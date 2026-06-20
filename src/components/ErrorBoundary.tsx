import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-editorial-bg text-editorial-text flex flex-col items-center justify-center p-8 font-sans">
          <div className="w-full max-w-xl border border-editorial-text/15 bg-editorial-surface p-10 shadow-[8px_8px_0_0_#141414]">
            <h1 className="text-3xl font-serif mb-4 text-red-800">Something went wrong.</h1>
            <div className="bg-red-50 text-red-900 border border-red-200 p-4 mb-6 font-mono text-sm overflow-auto max-h-64 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-editorial-primary uppercase tracking-widest text-sm py-4 w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
