import React, { type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UI ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Something went wrong in this section.</p>
          <p className="mt-1">Please try opening it again.</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
