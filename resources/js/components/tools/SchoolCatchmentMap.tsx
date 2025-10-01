import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SaveResultsButton from '@/components/SaveResultsButton';

interface MapFormData {
    address: string;
    radiusKm: string;
    mapType: 'primary' | 'secondary' | 'amenities';
}

interface RadiusCircle {
    id: string;
    center: [number, number];
    radius: number;
    type: string;
    label: string;
    color: string;
    leafletCircle?: L.Circle;
}

export default function SchoolCatchmentMap() {
    const [formData, setFormData] = useState<MapFormData>({
        address: '',
        radiusKm: '1.5',
        mapType: 'primary'
    });
    
    const [circles, setCircles] = useState<RadiusCircle[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]); // London default
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
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

    // Real geocoding using Nominatim (OpenStreetMap's geocoding service)
    const searchAddress = async () => {
        if (!formData.address.trim()) {
            setError('Please enter an address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Use Nominatim geocoding API (free, no API key required)
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

    const addRadius = () => {
        if (!mapRef.current || !mapInitialized) {
            setError('Please search for an address first');
            return;
        }

        const radius = parseFloat(formData.radiusKm);
        if (isNaN(radius) || radius <= 0) {
            setError('Please enter a valid radius');
            return;
        }

        const colors = {
            primary: '#3B82F6',
            secondary: '#10B981',
            amenities: '#F59E0B'
        };

        const labels = {
            primary: 'Primary School Catchment',
            secondary: 'Secondary School Catchment',
            amenities: 'Amenities Range'
        };

        // Create Leaflet circle
        const leafletCircle = L.circle(mapCenter, {
            color: colors[formData.mapType],
            fillColor: colors[formData.mapType],
            fillOpacity: 0.2,
            radius: radius * 1000 // Convert km to meters
        }).addTo(mapRef.current);

        // Add popup to circle
        leafletCircle.bindPopup(`${labels[formData.mapType]}<br/>${radius}km radius`);

        const newCircle: RadiusCircle = {
            id: Date.now().toString(),
            center: mapCenter,
            radius: radius,
            type: formData.mapType,
            label: labels[formData.mapType],
            color: colors[formData.mapType],
            leafletCircle: leafletCircle
        };

        setCircles(prev => [...prev, newCircle]);
        setError('');
    };

    const removeCircle = (id: string) => {
        const circleToRemove = circles.find(circle => circle.id === id);
        if (circleToRemove && circleToRemove.leafletCircle && mapRef.current) {
            mapRef.current.removeLayer(circleToRemove.leafletCircle);
        }
        setCircles(prev => prev.filter(circle => circle.id !== id));
    };

    const clearAll = () => {
        // Remove all circles from map
        circles.forEach(circle => {
            if (circle.leafletCircle && mapRef.current) {
                mapRef.current.removeLayer(circle.leafletCircle);
            }
        });
        
        setCircles([]);
        setError('');
        setSaveMessage(null);
    };

    const handleSaveComplete = (success: boolean, message: string) => {
        setSaveMessage({
            type: success ? 'success' : 'error',
            text: message
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Get calculation results for saving
    const getCalculationResults = () => {
        return {
            searchedAddress: formData.address,
            mapCenter: mapCenter,
            circles: circles.map(circle => ({
                id: circle.id,
                center: circle.center,
                radius: circle.radius,
                type: circle.type,
                label: circle.label,
                color: circle.color
            })),
            totalCircles: circles.length,
            summary: {
                primarySchoolCircles: circles.filter(c => c.type === 'primary').length,
                secondarySchoolCircles: circles.filter(c => c.type === 'secondary').length,
                amenityCircles: circles.filter(c => c.type === 'amenities').length
            }
        };
    };

    // Get form data for saving
    const getFormData = () => {
        return {
            address: formData.address,
            radiusKm: formData.radiusKm,
            mapType: formData.mapType,
            mapCenter: mapCenter
        };
    };

    const handleInputChange = (field: keyof MapFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
            {/* Address Search Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Address Search</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Enter address or postcode (e.g., 'London', 'M1 1AA', 'Birmingham City Centre')"
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

            {/* Radius Controls */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Add Radius Circle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Radius (km)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="1.5"
                            value={formData.radiusKm}
                            onChange={(e) => handleInputChange('radiusKm', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 placeholder-gray-400 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Circle Type
                        </label>
                        <select
                            value={formData.mapType}
                            onChange={(e) => handleInputChange('mapType', e.target.value as 'primary' | 'secondary' | 'amenities')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 bg-white"
                        >
                            <option value="primary">Primary School</option>
                            <option value="secondary">Secondary School</option>
                            <option value="amenities">Amenities</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={addRadius}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                        >
                            Add Circle
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Display */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">🗺️ Interactive Catchment Map</h3>
                    <div className="flex items-center space-x-4">
                        <div className="text-xs text-gray-500">
                            Circles: {circles.length} | Zoom to explore
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
                    className="w-full h-96 rounded-lg border border-gray-300 relative overflow-hidden bg-gray-100"
                    style={{ minHeight: '400px' }}
                >
                    {!mapInitialized && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
                            <div className="text-center">
                                <div className="text-4xl mb-3">�️</div>
                                <p className="text-lg font-medium mb-2">Loading Interactive Map...</p>
                                <p className="text-sm text-gray-600">Powered by OpenStreetMap</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Circles List */}
            {circles.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Active Radius Circles</h3>
                    <div className="space-y-3">
                        {circles.map((circle) => (
                            <div 
                                key={circle.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{ 
                                            borderColor: circle.color,
                                            backgroundColor: `${circle.color}40`
                                        }}
                                    ></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{circle.label}</p>
                                        <p className="text-sm text-gray-600">{circle.radius}km radius</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeCircle(circle.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Information Panel */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 How to Use the Interactive Map</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Search:</strong> Enter any UK address, postcode, or location name</li>
                    <li>• <strong>Navigate:</strong> Zoom and pan the map to explore the area</li>
                    <li>• <strong>Add Circles:</strong> Set radius and type, then click "Add Circle"</li>
                    <li>• <strong>Multiple Areas:</strong> Compare different catchment zones on the same map</li>
                    <li>• <strong>Click Markers:</strong> Click on markers and circles for more information</li>
                    <li>• <strong>Real Data:</strong> Powered by OpenStreetMap with accurate UK locations</li>
                </ul>
            </div>

            {/* Sample Searches */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">🏡 Try These Sample Searches</h4>
                <div className="flex flex-wrap gap-2">
                    {[
                        'London, UK', 
                        'Manchester, UK', 
                        'Birmingham, UK', 
                        'Leeds, UK', 
                        'Glasgow, UK', 
                        'Liverpool, UK', 
                        'Bristol, UK', 
                        'Edinburgh, UK',
                        'SW1A 1AA', // Downing Street postcode
                        'M1 1AA'    // Manchester postcode
                    ].map((location) => (
                        <button
                            key={location}
                            onClick={() => {
                                setFormData(prev => ({ ...prev, address: location }));
                                handleInputChange('address', location);
                            }}
                            className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                        >
                            {location}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}