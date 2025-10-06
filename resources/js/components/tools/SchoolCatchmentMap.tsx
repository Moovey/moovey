import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SaveResultsButton from '@/components/SaveResultsButton';

// Enhanced data models matching current usage below
interface School {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
    catchmentZones: CatchmentZone[];
    isActive: boolean;
}

interface CatchmentZone {
    year: number;
    radius: number;
    color: string;
    isVisible: boolean;
}

interface MapFormData {
    address: string;
    radius: string; // numeric string input
    unit: 'km' | 'miles' | 'meters';
    schoolName: string;
    selectedYear: number;
}

interface RadiusCircle {
    id: string;
    center: [number, number];
    radius: number;
    unit: 'km' | 'miles' | 'meters';
    schoolName: string;
    year: number;
    color: string;
    leafletCircle?: L.Circle;
    isVisible: boolean;
}

export default function SchoolCatchmentMap() {
    const [formData, setFormData] = useState<MapFormData>({
        address: '',
        radius: '1.5',
        unit: 'km',
        schoolName: '',
        selectedYear: new Date().getFullYear()
    });
    
    const [schools, setSchools] = useState<School[]>([]);
    const [circles, setCircles] = useState<RadiusCircle[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]); // London default
    const [customPin, setCustomPin] = useState<[number, number] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const customPinRef = useRef<L.Marker | null>(null);
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Fix Leaflet default markers
    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView(mapCenter, 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add click handler for placing custom pins
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setCustomPin([lat, lng]);
        });

        mapRef.current = map;
        setMapInitialized(true);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update map center when coordinates change
    useEffect(() => {
        if (mapRef.current && mapInitialized) {
            mapRef.current.setView(mapCenter, 13);
            
            // Remove existing marker
            if (markerRef.current) {
                mapRef.current.removeLayer(markerRef.current);
            }
            
            // Add new marker
            markerRef.current = L.marker(mapCenter)
                .addTo(mapRef.current)
                .bindPopup(formData.address || 'Selected Location')
                .openPopup();
        }
    }, [mapCenter, mapInitialized, formData.address]);

    // Handle custom pin updates
    useEffect(() => {
        if (mapRef.current && mapInitialized && customPin) {
            // Remove existing custom pin
            if (customPinRef.current) {
                mapRef.current.removeLayer(customPinRef.current);
            }
            
            // Create red pin icon for custom locations
            const redIcon = L.icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            
            // Add custom pin (draggable)
            customPinRef.current = L.marker(customPin, { 
                icon: redIcon, 
                draggable: true 
            })
                .addTo(mapRef.current)
                .bindPopup('Custom Location Pin<br/>Drag to adjust position')
                .on('dragend', (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setCustomPin([position.lat, position.lng]);
                });
        }
    }, [customPin, mapInitialized]);

    // Convert radius to meters based on the selected unit
    const convertToMeters = (radius: number, unit: 'km' | 'miles' | 'meters'): number => {
        switch (unit) {
            case 'km':
                return radius * 1000;
            case 'miles':
                return radius * 1609.34;
            case 'meters':
                return radius;
            default:
                return radius * 1000;
        }
    };

    // Real geocoding using Nominatim
    const searchAddress = async () => {
        if (!formData.address.trim()) {
            setError('Please enter an address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1&countrycodes=gb`
            );
            
            if (!response.ok) {
                throw new Error('Geocoding failed');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                setError('Address not found. Please try a different search term.');
                return;
            }
            
            const result = data[0];
            const coordinates: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
            
            console.log('Found coordinates:', coordinates, 'for address:', formData.address);
            setMapCenter(coordinates);
        } catch (err) {
            console.error('Geocoding error:', err);
            setError('Failed to find address. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Add school to favorites list
    const addSchool = () => {
        if (!formData.schoolName.trim()) {
            setError('Please enter a school name');
            return;
        }

        if (schools.length >= 6) {
            setError('Maximum of 6 schools allowed');
            return;
        }

        const newSchool: School = {
            id: Date.now().toString(),
            name: formData.schoolName,
            address: formData.address,
            coordinates: customPin || mapCenter,
            catchmentZones: [],
            isActive: true
        };

        setSchools(prev => [...prev, newSchool]);
        setFormData(prev => ({ ...prev, schoolName: '' }));
        setError('');
    };

    // Add catchment zone for a school
    const addCatchmentZone = () => {
        if (!mapRef.current || !mapInitialized) {
            setError('Please search for an address first');
            return;
        }

        if (!formData.schoolName.trim()) {
            setError('Please enter a school name');
            return;
        }

        const radius = parseFloat(formData.radius);
        if (isNaN(radius) || radius <= 0) {
            setError('Please enter a valid radius');
            return;
        }

        // Use custom pin location if available, otherwise use map center
        const centerCoords = customPin || mapCenter;
        
        // Generate random color for the circle
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Create Leaflet circle
        const leafletCircle = L.circle(centerCoords, {
            color: randomColor,
            fillColor: randomColor,
            fillOpacity: 0.2,
            radius: convertToMeters(radius, formData.unit)
        }).addTo(mapRef.current);

        // Add popup to circle
        leafletCircle.bindPopup(`${formData.schoolName}<br/>${radius} ${formData.unit} catchment zone (${formData.selectedYear})`);

        const newCircle: RadiusCircle = {
            id: Date.now().toString(),
            center: centerCoords,
            radius: radius,
            unit: formData.unit,
            schoolName: formData.schoolName,
            year: formData.selectedYear,
            color: randomColor,
            leafletCircle: leafletCircle,
            isVisible: true
        };

        setCircles(prev => [...prev, newCircle]);
        setError('');
    };

    // Toggle circle visibility
    const toggleCircleVisibility = (id: string) => {
        setCircles(prev => prev.map(circle => {
            if (circle.id === id) {
                const updatedCircle = { ...circle, isVisible: !circle.isVisible };
                if (circle.leafletCircle && mapRef.current) {
                    if (updatedCircle.isVisible) {
                        mapRef.current.addLayer(circle.leafletCircle);
                    } else {
                        mapRef.current.removeLayer(circle.leafletCircle);
                    }
                }
                return updatedCircle;
            }
            return circle;
        }));
    };

    // Change circle color
    const changeCircleColor = (id: string, newColor: string) => {
        setCircles(prev => prev.map(circle => {
            if (circle.id === id) {
                const updatedCircle = { ...circle, color: newColor };
                if (circle.leafletCircle) {
                    circle.leafletCircle.setStyle({
                        color: newColor,
                        fillColor: newColor
                    });
                }
                return updatedCircle;
            }
            return circle;
        }));
    };

    const removeCircle = (id: string) => {
        const circleToRemove = circles.find(circle => circle.id === id);
        if (circleToRemove && circleToRemove.leafletCircle && mapRef.current) {
            mapRef.current.removeLayer(circleToRemove.leafletCircle);
        }
        setCircles(prev => prev.filter(circle => circle.id !== id));
    };

    const removeSchool = (id: string) => {
        // Remove all circles for this school
        const schoolCircles = circles.filter(circle => {
            const school = schools.find(s => s.id === id);
            return school && circle.schoolName === school.name;
        });
        
        schoolCircles.forEach(circle => {
            if (circle.leafletCircle && mapRef.current) {
                mapRef.current.removeLayer(circle.leafletCircle);
            }
        });

        setCircles(prev => prev.filter(circle => !schoolCircles.includes(circle)));
        setSchools(prev => prev.filter(school => school.id !== id));
    };

    const clearAll = () => {
        // Remove all circles from map
        circles.forEach(circle => {
            if (circle.leafletCircle && mapRef.current) {
                mapRef.current.removeLayer(circle.leafletCircle);
            }
        });
        
        setCircles([]);
        setSchools([]);
        setError('');
        setSaveMessage(null);
        setCustomPin(null);
        
        // Remove custom pin from map
        if (customPinRef.current && mapRef.current) {
            mapRef.current.removeLayer(customPinRef.current);
        }
    };

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleSaveComplete = (success: boolean, message: string) => {
        setSaveMessage({
            type: success ? 'success' : 'error',
            text: message
        });
        
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Get calculation results for saving
    const getCalculationResults = () => {
        return {
            searchedAddress: formData.address,
            mapCenter: mapCenter,
            schools: schools,
            circles: circles.map(circle => ({
                id: circle.id,
                center: circle.center,
                radius: circle.radius,
                unit: circle.unit,
                schoolName: circle.schoolName,
                year: circle.year,
                color: circle.color,
                isVisible: circle.isVisible
            })),
            customPin: customPin,
            totalCircles: circles.length,
            totalSchools: schools.length
        };
    };

    const getFormData = () => {
        return {
            ...formData,
            mapCenter: mapCenter,
            customPin: customPin
        };
    };

    const handleInputChange = (field: keyof MapFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const availableColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

    return (
        <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'p-4 sm:p-6 md:p-8'
        }`}>
            {/* Header with Fullscreen Toggle */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🏫 Advanced School Catchment Map</h2>
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-sm
                               bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900
                               dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
               >
                    <span className="text-xl opacity-80">{isFullscreen ? '🗗' : '🗖'}</span>
                    <span className="text-sm font-semibold tracking-wide">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>
            </div>

            <div className={`${isFullscreen ? 'h-[calc(100vh-120px)] flex' : 'space-y-6'}`}>
                {/* Controls Panel */}
                <div className={`${isFullscreen ? 'w-80 pr-6 overflow-y-auto' : 'w-full'}`}>
                    {/* Address Search Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Address Search</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Enter address or postcode (e.g., 'London', 'M1 1AA')"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                            />
                            <button
                                onClick={searchAddress}
                                disabled={isLoading}
                                className="bg-[#17B7C7] text-white px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>

                    {/* School Management */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏫 School Management</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter school name (e.g., 'St. Mary's Primary School')"
                                    value={formData.schoolName}
                                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 placeholder-gray-400 bg-white"
                                />
                            </div>
                            <button
                                onClick={addSchool}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                            >
                                Add to Favorites ({schools.length}/6)
                            </button>
                        </div>
                    </div>

                    {/* Catchment Zone Controls */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Add Catchment Zone</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Radius
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="1.5"
                                    value={formData.radius}
                                    onChange={(e) => handleInputChange('radius', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 placeholder-gray-400 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit
                                </label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange('unit', e.target.value as 'km' | 'miles' | 'meters')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 bg-white"
                                >
                                    <option value="km">Kilometers</option>
                                    <option value="miles">Miles</option>
                                    <option value="meters">Meters</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <select
                                    value={formData.selectedYear}
                                    onChange={(e) => handleInputChange('selectedYear', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 bg-white"
                                >
                                    {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={addCatchmentZone}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                                >
                                    Add Zone
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Favorite Schools List */}
                    {schools.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Favorite Schools</h3>
                            <div className="space-y-2">
                                {schools.map((school) => (
                                    <div 
                                        key={school.id}
                                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{school.name}</p>
                                            <p className="text-sm text-gray-600">{school.address}</p>
                                        </div>
                                        <button
                                            onClick={() => removeSchool(school.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Display */}
                <div className={`${isFullscreen ? 'flex-1' : 'w-full'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">🗺️ Interactive Catchment Map</h3>
                        <div className="flex items-center space-x-4">
                            <div className="text-xs text-gray-500">
                                Zones: {circles.length} | Schools: {schools.length}
                            </div>
                            {circles.length > 0 && (
                                <>
                                    <SaveResultsButton
                                        toolType="school-catchment"
                                        results={getCalculationResults()}
                                        formData={getFormData()}
                                        onSaveComplete={handleSaveComplete}
                                        className="text-xs px-3 py-1"
                                    />
                                    <button
                                        onClick={clearAll}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Clear All
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Save Message */}
                    {saveMessage && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                            saveMessage.type === 'success' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                            {saveMessage.text}
                        </div>
                    )}
                    
                    <div 
                        ref={mapContainerRef}
                        className={`w-full rounded-lg border border-gray-300 relative overflow-hidden bg-gray-100 ${
                            isFullscreen ? 'h-full' : 'h-96'
                        }`}
                        style={{ minHeight: isFullscreen ? '100%' : '400px' }}
                    >
                        {!mapInitialized && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">🗺️</div>
                                    <p className="text-lg font-medium mb-2">Loading Interactive Map...</p>
                                    <p className="text-sm text-gray-600">Click anywhere to place custom pins</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Circles List - Only show if not fullscreen or as overlay */}
            {circles.length > 0 && !isFullscreen && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Active Catchment Zones</h3>
                    <div className="space-y-3">
                        {circles.map((circle) => (
                            <div 
                                key={circle.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <div 
                                            className="w-4 h-4 rounded-full border-2 cursor-pointer"
                                            style={{ 
                                                borderColor: circle.color,
                                                backgroundColor: circle.isVisible ? `${circle.color}40` : 'transparent'
                                            }}
                                            onClick={() => toggleCircleVisibility(circle.id)}
                                        ></div>
                                        <select
                                            value={circle.color}
                                            onChange={(e) => changeCircleColor(circle.id, e.target.value)}
                                            className="text-xs border border-gray-300 rounded px-1 py-0.5"
                                        >
                                            {availableColors.map(color => (
                                                <option key={color} value={color} style={{ backgroundColor: color }}>
                                                    {color}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{circle.schoolName}</p>
                                        <p className="text-sm text-gray-600">{circle.radius} {circle.unit} - {circle.year}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => toggleCircleVisibility(circle.id)}
                                        className={`text-xs px-2 py-1 rounded ${
                                            circle.isVisible 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {circle.isVisible ? 'Hide' : 'Show'}
                                    </button>
                                    <button
                                        onClick={() => removeCircle(circle.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isFullscreen && (
                <>
                    {/* Information Panel */}
                    <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Advanced Features</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• <strong>Multiple Schools:</strong> Add up to 6 favorite schools and compare catchments</li>
                            <li>• <strong>Custom Pins:</strong> Click anywhere on the map to place precise location pins</li>
                            <li>• <strong>Yearly Zones:</strong> Track catchment changes over the last 5 years</li>
                            <li>• <strong>Flexible Units:</strong> Switch between kilometers, miles, or meters</li>
                            <li>• <strong>Color Coding:</strong> Customize colors for each catchment zone</li>
                            <li>• <strong>Fullscreen Mode:</strong> Expand the map for detailed analysis</li>
                        </ul>
                    </div>

                    {/* Sample Searches */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">🏡 Try These Sample Locations</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'London, UK', 
                                'Manchester, UK', 
                                'Birmingham, UK', 
                                'Leeds, UK', 
                                'SW1A 1AA',
                                'M1 1AA'
                            ].map((location) => (
                                <button
                                    key={location}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, address: location }));
                                    }}
                                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                                >
                                    {location}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}