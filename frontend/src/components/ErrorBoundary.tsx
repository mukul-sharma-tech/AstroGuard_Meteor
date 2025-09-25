import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900 text-white rounded-lg">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">There was an error loading the application.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
          >
            Try again
          </button>
          {this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 text-xs bg-red-800 p-2 rounded overflow-auto">
                {this.state.error.message}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
