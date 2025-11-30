interface QuickActionsProps {
    listedCount: number;
}

export default function QuickActions({ listedCount }: QuickActionsProps) {
    return (
        <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">⚡</span>
                <span>Quick Actions</span>
            </h3>
            <div className="space-y-2">
                <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    <strong>{listedCount}</strong> items currently listed in marketplace
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 text-xs sm:text-sm">💡 Pro Tips</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Research prices online for accurate estimates</li>
                        <li>• Take photos to help with selling decisions</li>
                        <li>• Consider donation for tax benefits</li>
                        <li>• List valuable items early for best results</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
