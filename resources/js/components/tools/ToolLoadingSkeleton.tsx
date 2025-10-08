interface ToolLoadingSkeletonProps {
    toolName?: string;
}

export default function ToolLoadingSkeleton({ toolName }: ToolLoadingSkeletonProps) {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Tool header skeleton */}
            <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Form fields skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Button skeleton */}
            <div className="h-12 bg-gray-200 rounded w-48"></div>

            {/* Results area skeleton */}
            <div className="space-y-4 mt-8">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Loading message */}
            {toolName && (
                <div className="text-center text-gray-500 mt-6">
                    <div className="inline-flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#17B7C7]"></div>
                        <span>Loading {toolName}...</span>
                    </div>
                </div>
            )}
        </div>
    );
}