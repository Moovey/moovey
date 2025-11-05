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