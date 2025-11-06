import { useState } from 'react';
import { favoriteSchoolsService } from '@/services/favoriteSchoolsService';

interface School {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
    catchmentZones: CatchmentZone[];
    isActive: boolean;
    isFavorite: boolean;
    averageCatchment?: {
        radius: number;
        unit: 'km' | 'miles' | 'meters';
        color: string;
        isVisible: boolean;
    };
}

interface CatchmentZone {
    year: number;
    radius: number;
    unit: 'km' | 'miles' | 'meters';
    color: string;
    isVisible: boolean;
    id: string;
}

interface SchoolManagementProps {
    favoriteSchools: School[];
    setFavoriteSchools: (updater: (prev: School[]) => School[]) => void;
    schoolName: string;
    setSchoolName: (name: string) => void;
    address: string;
    setAddress: (address: string) => void;
    customPin: [number, number] | null;
    mapCenter: [number, number];
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string;
    setError: (error: string) => void;
    onSaveMessage: (message: {type: 'success' | 'error', text: string}) => void;
    onAddressSearch: () => void;
    pinPlacementMode: 'off' | 'school' | 'location';
    onTogglePinPlacement: (mode: 'off' | 'school' | 'location') => void;
    isFullscreen: boolean;
}

export default function SchoolManagement({
    favoriteSchools,
    setFavoriteSchools,
    schoolName,
    setSchoolName,
    address,
    setAddress,
    customPin,
    mapCenter,
    isLoading,
    setIsLoading,
    error,
    setError,
    onSaveMessage,
    onAddressSearch,
    pinPlacementMode,
    onTogglePinPlacement,
    isFullscreen
}: SchoolManagementProps) {
    
    const addSchool = async () => {
        if (!schoolName.trim()) {
            setError('Please enter a school name');
            return;
        }

        if (favoriteSchools.length >= 6) {
            setError('Maximum of 6 favorite schools allowed');
            return;
        }

        const newSchool: School = {
            id: Date.now().toString(),
            name: schoolName,
            address: address,
            coordinates: customPin || mapCenter,
            catchmentZones: [],
            isActive: true,
            isFavorite: true
        };

        const saveResult = await favoriteSchoolsService.addFavoriteSchool(newSchool);
        if (saveResult.success) {
            setFavoriteSchools(prev => [...prev, newSchool]);
            setSchoolName('');
            setError('');
            
            onSaveMessage({
                type: 'success',
                text: saveResult.message || 'School added to favorites!'
            });
        } else {
            setError(saveResult.message || 'Failed to add school to favorites');
        }
    };

    const removeSchool = async (id: string) => {
        const removeResult = await favoriteSchoolsService.removeFavoriteSchool(id);
        if (removeResult.success) {
            setFavoriteSchools(prev => prev.filter(school => school.id !== id));
            
            onSaveMessage({
                type: 'success',
                text: removeResult.message || 'School removed from favorites!'
            });
        } else {
            onSaveMessage({
                type: 'error',
                text: removeResult.message || 'Failed to remove school from favorites'
            });
        }
    };

    return (
        <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
            <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>
                🏫 Add Favourite School
            </h3>
            <div className="space-y-3 sm:space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter school name"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white text-sm"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Location
                    </label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Enter address, postcode, or coordinates (e.g., '51.4994, -0.1244')"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onAddressSearch()}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>OR</span>
                            <button
                                onClick={() => onTogglePinPlacement(pinPlacementMode === 'school' ? 'off' : 'school')}
                                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                                    pinPlacementMode === 'school'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                📍 {pinPlacementMode === 'school' ? 'Cancel Pin Mode' : 'Drag Pin on Map'}
                            </button>
                        </div>
                        {customPin && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                                <span className="text-blue-800 font-medium">📍 Pin Location:</span>
                                <span className="text-blue-600 font-mono ml-2">
                                    {customPin[0].toFixed(6)}, {customPin[1].toFixed(6)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={onAddressSearch}
                            disabled={isLoading || !address.trim()}
                            className={`flex-1 bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                        >
                            {isLoading ? 'Searching...' : 'Search Address'}
                        </button>
                    </div>
                </div>
                
                <button
                    onClick={addSchool}
                    disabled={!schoolName.trim() || favoriteSchools.length >= 6 || (!address.trim() && !customPin)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Add to Favorites ({favoriteSchools.length}/6)
                </button>
                
                {/* Favorite Schools List */}
                {favoriteSchools.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Favorite Schools:</h4>
                        <div className="space-y-2">
                            {favoriteSchools.map(school => {
                                const years = Array.from(new Set((school.catchmentZones || []).map(z => z.year)))
                                    .filter(y => typeof y === 'number' && !isNaN(y))
                                    .sort((a, b) => b - a);
                                return (
                                    <div key={school.id} className="p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm text-gray-900">{school.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{school.address}</div>
                                            </div>
                                            <button
                                                onClick={() => removeSchool(school.id)}
                                                className="px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        {years.length > 0 && (
                                            <div className="mt-2 flex flex-wrap items-center gap-1">
                                                <span className="text-[11px] text-gray-600 mr-1">Years:</span>
                                                {years.map((y) => (
                                                    <span
                                                        key={y}
                                                        className="px-2 py-0.5 text-[11px] rounded-full bg-white border border-gray-200 text-gray-800"
                                                        title={`Catchment circles for ${y}`}
                                                    >
                                                        {y}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
            </div>
        </div>
    );
}