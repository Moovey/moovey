import { useState } from 'react';

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

interface CatchmentZoneControlsProps {
    favoriteSchools: School[];
    selectedSchoolId: string;
    setSelectedSchoolId: (id: string) => void;
    radius: string;
    setRadius: (radius: string) => void;
    unit: 'km' | 'miles' | 'meters';
    setUnit: (unit: 'km' | 'miles' | 'meters') => void;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    onAddCatchmentZone: () => void;
    error: string;
    isFullscreen: boolean;
}

export default function CatchmentZoneControls({
    favoriteSchools,
    selectedSchoolId,
    setSelectedSchoolId,
    radius,
    setRadius,
    unit,
    setUnit,
    selectedYear,
    setSelectedYear,
    onAddCatchmentZone,
    error,
    isFullscreen
}: CatchmentZoneControlsProps) {

    const convertRadius = (value: number, fromUnit: 'km' | 'miles' | 'meters', toUnit: 'km' | 'miles' | 'meters'): number => {
        if (fromUnit === toUnit) return value;
        
        let meters: number;
        switch (fromUnit) {
            case 'km': meters = value * 1000; break;
            case 'miles': meters = value * 1609.34; break;
            case 'meters': meters = value; break;
        }
        
        switch (toUnit) {
            case 'km': return meters / 1000;
            case 'miles': return meters / 1609.34;
            case 'meters': return meters;
        }
    };

    const handleUnitChange = (newUnit: 'km' | 'miles' | 'meters') => {
        const currentRadius = parseFloat(radius);
        
        if (!isNaN(currentRadius) && currentRadius > 0) {
            const convertedRadius = convertRadius(currentRadius, unit, newUnit);
            setRadius(convertedRadius.toFixed(3));
        }
        setUnit(newUnit);
    };

    return (
        <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
            <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>
                📐 Catchment Zone Analysis
            </h3>
            <div className="space-y-3 sm:space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select School
                    </label>
                    <select
                        value={selectedSchoolId}
                        onChange={(e) => setSelectedSchoolId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 bg-white text-sm"
                    >
                        <option value="">Select a favorite school</option>
                        {favoriteSchools.map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Radius
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="1.5"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit
                        </label>
                        <select
                            value={unit}
                            onChange={(e) => handleUnitChange(e.target.value as 'km' | 'miles' | 'meters')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 bg-white text-sm"
                        >
                            <option value="km">Kilometers</option>
                            <option value="miles">Miles</option>
                            <option value="meters">Meters</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                    </label>
                    <input
                        type="number"
                        min="2020"
                        max="2030"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 bg-white text-sm"
                    />
                </div>

                <button
                    onClick={onAddCatchmentZone}
                    disabled={!selectedSchoolId || !radius || parseFloat(radius) <= 0}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Add Catchment Zone
                </button>

                {/* Quick Radius Presets */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {unit === 'km' && (
                            <>
                                <button
                                    onClick={() => setRadius('0.5')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    0.5km
                                </button>
                                <button
                                    onClick={() => setRadius('1.0')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    1.0km
                                </button>
                                <button
                                    onClick={() => setRadius('1.5')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    1.5km
                                </button>
                            </>
                        )}
                        {unit === 'miles' && (
                            <>
                                <button
                                    onClick={() => setRadius('0.3')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    0.3mi
                                </button>
                                <button
                                    onClick={() => setRadius('0.6')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    0.6mi
                                </button>
                                <button
                                    onClick={() => setRadius('1.0')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    1.0mi
                                </button>
                            </>
                        )}
                        {unit === 'meters' && (
                            <>
                                <button
                                    onClick={() => setRadius('500')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    500m
                                </button>
                                <button
                                    onClick={() => setRadius('1000')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    1000m
                                </button>
                                <button
                                    onClick={() => setRadius('1500')}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                >
                                    1500m
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
            </div>
        </div>
    );
}