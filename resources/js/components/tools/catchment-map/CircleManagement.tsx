import { useState } from 'react';

interface RadiusCircle {
    id: string;
    center: [number, number];
    radius: number;
    unit: 'km' | 'miles' | 'meters';
    schoolName: string;
    year: number;
    color: string;
    olFeature?: any;
    isVisible: boolean;
    schoolId: string;
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

interface CircleManagementProps {
    circles: RadiusCircle[];
    favoriteSchools: School[];
    selectedYearFilter: number | 'all';
    setSelectedYearFilter: (year: number | 'all') => void;
    focusedSchoolId: string;
    onFocusOnSchool: (schoolId: string) => void;
    onToggleCircleVisibility: (circleId: string) => void;
    onRemoveCircle: (circleId: string) => void;
    onChangeCircleColor: (circleId: string, color: string) => void;
    onApplyPaletteToAll: (paletteType: 'schools' | 'years', paletteName: string) => void;
    selectedColorPalette: {type: 'schools' | 'years', name: string};
    colorPalettes: any;
    isFullscreen: boolean;
}

export default function CircleManagement({
    circles,
    favoriteSchools,
    selectedYearFilter,
    setSelectedYearFilter,
    focusedSchoolId,
    onFocusOnSchool,
    onToggleCircleVisibility,
    onRemoveCircle,
    onChangeCircleColor,
    onApplyPaletteToAll,
    selectedColorPalette,
    colorPalettes,
    isFullscreen
}: CircleManagementProps) {

    const [colorControlsOpen, setColorControlsOpen] = useState(false);
    const [showCircleList, setShowCircleList] = useState(false);

    const getUniqueYears = () => {
        const years = [...new Set(circles.map(c => c.year).filter(y => y > 0))];
        return years.sort((a, b) => b - a);
    };

    const getCirclesBySchool = () => {
        const schoolGroups: {[schoolId: string]: RadiusCircle[]} = {};
        circles.forEach(circle => {
            if (!schoolGroups[circle.schoolId]) {
                schoolGroups[circle.schoolId] = [];
            }
            schoolGroups[circle.schoolId].push(circle);
        });
        return schoolGroups;
    };

    return (
        <div className="space-y-4">
            {/* View Mode Controls */}
            <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>
                    👁️ View Controls
                </h3>
                <div className="space-y-3">
                    {/* Year Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
                        <select
                            value={selectedYearFilter}
                            onChange={(e) => setSelectedYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 bg-white text-sm"
                        >
                            <option value="all">All Years</option>
                            {getUniqueYears().map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    {/* School Focus */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Focus on School</label>
                        <select
                            value={focusedSchoolId}
                            onChange={(e) => onFocusOnSchool(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 bg-white text-sm"
                        >
                            <option value="">Show All Schools</option>
                            {favoriteSchools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                        </select>
                    </div>


                </div>
            </div>

            {/* Color Palette Controls */}
            <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                <button
                    onClick={() => setColorControlsOpen(!colorControlsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 text-sm transition-colors"
                >
                    <span>🎨 Color Palette Controls</span>
                    <span className={`transform transition-transform ${colorControlsOpen ? 'rotate-180' : ''}`}>⌄</span>
                </button>

                {colorControlsOpen && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Color by Schools</label>
                            <div className="grid grid-cols-2 gap-1">
                                {Object.keys(colorPalettes.schools).map(paletteName => (
                                    <button
                                        key={paletteName}
                                        onClick={() => onApplyPaletteToAll('schools', paletteName)}
                                        className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                                            selectedColorPalette.type === 'schools' && selectedColorPalette.name === paletteName
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {paletteName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Color by Years</label>
                            <div className="grid grid-cols-2 gap-1">
                                {Object.keys(colorPalettes.years).map(paletteName => (
                                    <button
                                        key={paletteName}
                                        onClick={() => onApplyPaletteToAll('years', paletteName)}
                                        className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                                            selectedColorPalette.type === 'years' && selectedColorPalette.name === paletteName
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {paletteName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Circle List */}
            {circles.length > 0 && (
                <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                    <button
                        onClick={() => setShowCircleList(!showCircleList)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-blue-700 text-sm transition-colors"
                    >
                        <span>📊 Catchment Circles ({circles.length})</span>
                        <span className={`transform transition-transform ${showCircleList ? 'rotate-180' : ''}`}>⌄</span>
                    </button>

                    {showCircleList && (
                        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                            {Object.entries(getCirclesBySchool()).map(([schoolId, schoolCircles]) => {
                                const school = favoriteSchools.find(s => s.id === schoolId);
                                return (
                                    <div key={schoolId} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 bg-gray-100 font-medium text-sm text-gray-800">
                                            🏫 {school?.name || 'Unknown School'}
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {schoolCircles.map(circle => (
                                                <div key={circle.id} className="p-3 bg-white">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded border border-gray-300"
                                                                style={{ backgroundColor: circle.color }}
                                                            ></div>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {circle.radius} {circle.unit} ({circle.year})
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => onToggleCircleVisibility(circle.id)}
                                                                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                                                                    circle.isVisible
                                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {circle.isVisible ? '👁️' : '🙈'}
                                                            </button>
                                                            <input
                                                                type="color"
                                                                value={circle.color}
                                                                onChange={(e) => onChangeCircleColor(circle.id, e.target.value)}
                                                                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                                                            />
                                                            <button
                                                                onClick={() => onRemoveCircle(circle.id)}
                                                                className="px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded font-medium"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Statistics */}
            {circles.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">📊 Statistics</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                        <div>Total Circles: {circles.length}</div>
                        <div>Visible: {circles.filter(c => c.isVisible).length}</div>
                        <div>Schools: {favoriteSchools.length}</div>
                        <div>Years: {getUniqueYears().length}</div>
                    </div>
                </div>
            )}
        </div>
    );
}