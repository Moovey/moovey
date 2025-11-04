import { useState } from 'react';

interface MapControlsProps {
    address: string;
    setAddress: (address: string) => void;
    onAddressSearch: () => void;
    isLoading: boolean;
    pinPlacementMode: 'off' | 'school' | 'location';
    onTogglePinPlacement: (mode: 'off' | 'school' | 'location') => void;
    measurementMode: boolean;
    setMeasurementMode: (mode: boolean) => void;
    showCoordinateInput: boolean;
    setShowCoordinateInput: (show: boolean) => void;
    coordinateInput: { lat: string; lng: string };
    setCoordinateInput: (coords: { lat: string; lng: string }) => void;
    onPlacePinFromCoordinates: () => void;
    onClearAll: () => void;
    canSaveData: () => boolean;
    placedPins: PinInfo[];
    onRemovePin: (pinId: string) => void;
    favoriteSchools: School[];
    onAssignPinToSchool: (pinId: string, schoolId: string) => void;
    error: string;
    isFullscreen: boolean;
}

interface PinInfo {
    id: string;
    type: 'school' | 'location' | 'measurement';
    coordinates: [number, number];
    title: string;
    description?: string;
    schoolId?: string;
    isDraggable: boolean;
    feature?: any;
}

interface School {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
    catchmentZones: any[];
    isActive: boolean;
    isFavorite: boolean;
}

export default function MapControls({
    address,
    setAddress,
    onAddressSearch,
    isLoading,
    pinPlacementMode,
    onTogglePinPlacement,
    measurementMode,
    setMeasurementMode,
    showCoordinateInput,
    setShowCoordinateInput,
    coordinateInput,
    setCoordinateInput,
    onPlacePinFromCoordinates,
    onClearAll,
    canSaveData,
    placedPins,
    onRemovePin,
    favoriteSchools,
    onAssignPinToSchool,
    error,
    isFullscreen
}: MapControlsProps) {

    return (
        <div className="space-y-4">
            {/* General Address Search */}
            <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>
                    🔍 Search Location
                </h3>
                <div className="flex flex-col gap-2 sm:gap-3">
                    <input
                        type="text"
                        placeholder="Search any address or postcode to navigate map"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onAddressSearch()}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                    />
                    <button
                        onClick={onAddressSearch}
                        disabled={isLoading || !address.trim()}
                        className={`bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                    >
                        {isLoading ? 'Searching...' : 'Navigate to Location'}
                    </button>
                </div>
            </div>

            {/* Pin Placement Tools */}
            <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>
                    📍 Pin Placement Tools
                </h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onTogglePinPlacement(pinPlacementMode === 'location' ? 'off' : 'location')}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                                pinPlacementMode === 'location'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                        >
                            📍 {pinPlacementMode === 'location' ? 'Cancel' : 'Place Pin'}
                        </button>
                        <button
                            onClick={() => setMeasurementMode(!measurementMode)}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                                measurementMode
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            }`}
                        >
                            📏 {measurementMode ? 'Cancel' : 'Measure Distance'}
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCoordinateInput(!showCoordinateInput)}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
                    >
                        🎯 {showCoordinateInput ? 'Hide' : 'Enter'} Precise Coordinates
                    </button>

                    {showCoordinateInput && (
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        placeholder="51.507400"
                                        value={coordinateInput.lat}
                                        onChange={(e) => setCoordinateInput({...coordinateInput, lat: e.target.value})}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        placeholder="-0.127800"
                                        value={coordinateInput.lng}
                                        onChange={(e) => setCoordinateInput({...coordinateInput, lng: e.target.value})}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={onPlacePinFromCoordinates}
                                disabled={!coordinateInput.lat || !coordinateInput.lng}
                                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Place Pin at Coordinates
                            </button>
                        </div>
                    )}

                    {(pinPlacementMode !== 'off' || measurementMode) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                            <div className="text-blue-800 font-medium mb-1">
                                {pinPlacementMode === 'location' && '📍 Click on the map to place a location pin'}
                                {pinPlacementMode === 'school' && '🏫 Click on the map to place a school pin'}
                                {measurementMode && '📏 Click two points on the map to measure distance'}
                            </div>
                            <div className="text-blue-600 text-xs">
                                Press ESC or click the cancel button to exit this mode
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Placed Pins Management */}
            {placedPins.length > 0 && (
                <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                    <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>
                        📍 Placed Pins ({placedPins.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {placedPins.map(pin => (
                            <div key={pin.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">{pin.title}</div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {pin.coordinates[0].toFixed(6)}, {pin.coordinates[1].toFixed(6)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {pin.type === 'location' && favoriteSchools.length > 0 && (
                                        <select
                                            onChange={(e) => e.target.value && onAssignPinToSchool(pin.id, e.target.value)}
                                            className="px-2 py-1 text-xs border border-gray-300 rounded"
                                        >
                                            <option value="">Assign to School</option>
                                            {favoriteSchools.map(school => (
                                                <option key={school.id} value={school.id}>{school.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <button
                                        onClick={() => onRemovePin(pin.id)}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Clear All Data */}
            <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>
                    🗑️ Data Management
                </h3>
                <button
                    onClick={onClearAll}
                    disabled={!canSaveData()}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Clear All Data
                </button>
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}