import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
    // Create a stable query client instance
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutes
                        gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
                        retry: (failureCount, error: any) => {
                            // Don't retry on 4xx errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false;
                            }
                            // Retry up to 3 times for other errors
                            return failureCount < 3;
                        },
                        refetchOnWindowFocus: false, // Disable automatic refetch on window focus
                    },
                    mutations: {
                        retry: (failureCount, error: any) => {
                            // Don't retry mutations on 4xx errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false;
                            }
                            // Retry up to 2 times for other errors
                            return failureCount < 2;
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Only show devtools in development */}
            {import.meta.env.DEV && (
                <ReactQueryDevtools 
                    initialIsOpen={false}
                    position="bottom"
                />
            )}
        </QueryClientProvider>
    );
}