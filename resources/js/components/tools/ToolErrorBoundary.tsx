import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ToolErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Tool component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 mb-4 text-red-500">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-gray-600 mb-4">
                        We encountered an error while loading this tool. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#17B7C7] text-white rounded-lg hover:bg-[#149AA6] transition-colors"
                    >
                        Refresh Page
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <details className="mt-4 text-left">
                            <summary className="text-sm text-gray-500 cursor-pointer">
                                Error Details (Development)
                            </summary>
                            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
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