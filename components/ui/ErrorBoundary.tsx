'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showStack: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showStack: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);

        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    toggleStack = () => {
        this.setState(prev => ({ showStack: !prev.showStack }));
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">
                                Đã xảy ra lỗi
                            </h2>
                            <p className="text-white/80 text-sm">
                                Chúng tôi đang cố gắng khắc phục sự cố này
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Error message */}
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                                <p className="text-red-800 text-sm font-medium">
                                    {this.state.error?.message || 'Đã có lỗi không mong muốn xảy ra'}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={this.handleRetry}
                                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                >
                                    <RefreshCw size={18} />
                                    Thử lại
                                </button>

                                <Link
                                    href="/"
                                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-colors"
                                >
                                    <Home size={18} />
                                    Về trang chủ
                                </Link>

                                <Link
                                    href="/contact"
                                    className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-orange-600 font-medium py-2 transition-colors text-sm"
                                >
                                    <MessageCircle size={16} />
                                    Liên hệ hỗ trợ
                                </Link>
                            </div>

                            {/* Technical details (dev only) */}
                            {this.props.showDetails && this.state.errorInfo && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <button
                                        onClick={this.toggleStack}
                                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform ${this.state.showStack ? 'rotate-180' : ''}`}
                                        />
                                        Chi tiết kỹ thuật
                                    </button>

                                    {this.state.showStack && (
                                        <pre className="mt-3 p-3 bg-slate-900 text-slate-300 text-xs rounded-lg overflow-x-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ============================================
// SECTION ERROR BOUNDARY (Smaller, inline)
// ============================================

interface SectionErrorProps {
    title?: string;
    onRetry?: () => void;
}

export const SectionError: React.FC<SectionErrorProps> = ({
    title = 'Không thể tải nội dung',
    onRetry
}) => {
    return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-red-800 mb-2">{title}</h3>
            <p className="text-red-600 text-sm mb-4">
                Đã có lỗi xảy ra. Vui lòng thử lại sau.
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    <RefreshCw size={14} />
                    Thử lại
                </button>
            )}
        </div>
    );
};

// ============================================
// NETWORK ERROR COMPONENT
// ============================================

interface NetworkErrorProps {
    onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => {
    return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                {/* Offline Icon */}
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-10 h-10 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
                        />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Mất kết nối mạng
                </h3>
                <p className="text-slate-500 mb-6">
                    Vui lòng kiểm tra kết nối internet và thử lại
                </p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        <RefreshCw size={18} />
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action
}) => {
    return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                {icon && (
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        {icon}
                    </div>
                )}

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {title}
                </h3>

                {description && (
                    <p className="text-slate-500 mb-6">
                        {description}
                    </p>
                )}

                {action && (
                    <button
                        onClick={action.onClick}
                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================================
// LOADING ERROR HOOK
// ============================================

interface UseAsyncState<T> {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
    retry: () => void;
}

export function useAsync<T>(
    asyncFn: () => Promise<T>,
    dependencies: any[] = []
): UseAsyncState<T> {
    const [state, setState] = React.useState<{
        data: T | null;
        error: Error | null;
        isLoading: boolean;
    }>({
        data: null,
        error: null,
        isLoading: true,
    });

    const execute = React.useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const result = await asyncFn();
            setState({ data: result, error: null, isLoading: false });
        } catch (err) {
            setState({ data: null, error: err as Error, isLoading: false });
        }
    }, dependencies);

    React.useEffect(() => {
        execute();
    }, [execute]);

    return {
        ...state,
        retry: execute,
    };
}

// ============================================
// EXPORTS
// ============================================

export default ErrorBoundary;
