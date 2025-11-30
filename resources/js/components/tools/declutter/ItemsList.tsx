import { DeclutterItem } from './types';
import ItemCard from './ItemCard';

interface ItemsListProps {
    filteredItems: DeclutterItem[];
    totalItems: number;
    onEdit: (item: DeclutterItem) => void;
    onDelete: (id: number) => void;
    onListForSale: (item: DeclutterItem) => void;
    onUnlistFromSale: (item: DeclutterItem) => void;
}

export default function ItemsList({
    filteredItems,
    totalItems,
    onEdit,
    onDelete,
    onListForSale,
    onUnlistFromSale
}: ItemsListProps) {
    return (
        <div className="lg:w-1/2 bg-gray-50">
            <div className="p-4 sm:p-6 h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Items List ({filteredItems.length})</h3>
                    {filteredItems.length > 0 && (
                        <div className="text-xs sm:text-sm text-gray-600">
                            Showing {filteredItems.length} of {totalItems} items
                        </div>
                    )}
                </div>

                {/* Items Display */}
                <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                                {totalItems === 0 ? 'No items yet' : 'No items match your filters'}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm px-4">
                                {totalItems === 0 
                                    ? 'Start by adding items you want to declutter'
                                    : 'Try adjusting your search or filter criteria'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onListForSale={onListForSale}
                                onUnlistFromSale={onUnlistFromSale}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
