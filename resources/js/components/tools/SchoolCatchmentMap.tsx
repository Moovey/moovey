import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SaveResultsButton from '@/components/SaveResultsButton';
import { favoriteSchoolsService } from '@/services/favoriteSchoolsService';

// Enhanced data models with historical catchment support
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

interface MapFormData {
    address: string;
    radius: string; // numeric string input
    unit: 'km' | 'miles' | 'meters';
    schoolName: string;
    selectedYear: number;
    selectedSchoolId: string; // For linking zones to specific schools
    viewMode: 'all' | 'single-year' | 'average' | 'comparison'; // New comparison mode
    focusSchoolId: string; // For focusing on specific school's zones
    pinPlacementMode: 'off' | 'school' | 'location'; // Pin placement modes
    coordinateInput: { lat: string; lng: string }; // For precise coordinate entry
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
    schoolId: string; // Link to school ID for filtering
}

interface CatchmentOverlap {
    area: L.LatLng[];
    schools: string[];
    overlapLevel: number;
}

interface StreetInfo {
    name: string;
    coordinates: [number, number];
    inCatchment: string[]; // School IDs that cover this street
    distance: number; // Distance from nearest school
}

interface PinInfo {
    id: string;
    type: 'school' | 'location' | 'measurement';
    coordinates: [number, number];
    title: string;
    description?: string;
    schoolId?: string; // For school pins
    isDraggable: boolean;
    marker?: L.Marker;
}

export default function SchoolCatchmentMap({ 
    isFullScreenMode = false, 
    initialData = null 
}: { 
    isFullScreenMode?: boolean; 
    initialData?: any; 
} = {}) {
    const [formData, setFormData] = useState<MapFormData>({
        address: '',
        radius: '1.5',
        unit: 'km',
        schoolName: '',
        selectedYear: new Date().getFullYear(),
        selectedSchoolId: '',
        viewMode: 'single-year',
        focusSchoolId: '',
        pinPlacementMode: 'off',
        coordinateInput: { lat: '', lng: '' }
    });
    
    const [schools, setSchools] = useState<School[]>([]);
    const [circles, setCircles] = useState<RadiusCircle[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]); // London default
    const [customPin, setCustomPin] = useState<[number, number] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isResizingMap, setIsResizingMap] = useState(false);
    const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>(new Date().getFullYear());
    const [showAverageZones, setShowAverageZones] = useState(false);
    const [favoriteSchools, setFavoriteSchools] = useState<School[]>([]); // Separate state for favorites
    const [comparisonMode, setComparisonMode] = useState(false);
    const [focusedSchoolId, setFocusedSchoolId] = useState<string>('');
    const [showOverlapAreas, setShowOverlapAreas] = useState(false);
    const [streetLayerVisible, setStreetLayerVisible] = useState(true);
    const [placedPins, setPlacedPins] = useState<PinInfo[]>([]);
    const [selectedPinForSchool, setSelectedPinForSchool] = useState<string>(''); // Pin ID to assign to school
    const [showCoordinateInput, setShowCoordinateInput] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    
    // localStorage keys for persistence (catchment zones now saved to database with favorite schools)
    const STORAGE_KEYS = {
        placedPins: 'schoolCatchment_placedPins',
        formData: 'schoolCatchment_formData'
    };

    // Load data from localStorage and database on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load favorite schools from database
                setIsLoadingFavorites(true);
                const favoriteSchoolsFromDB = await favoriteSchoolsService.getFavoriteSchools();
                
                // Load other data from localStorage (but not circles - they come from database)
                const savedPlacedPins = localStorage.getItem(STORAGE_KEYS.placedPins);
                const savedFormData = localStorage.getItem(STORAGE_KEYS.formData);
                
                let restoredItems = [];
                
                // Restore favorite schools from database and create circles from their catchment zones
                if (favoriteSchoolsFromDB.length > 0) {
                    setFavoriteSchools(favoriteSchoolsFromDB);
                    restoredItems.push(`${favoriteSchoolsFromDB.length} favorite school${favoriteSchoolsFromDB.length > 1 ? 's' : ''}`);
                    
                    // Create circles from catchment zones stored in database
                    const catchmentCircles: any[] = [];
                    favoriteSchoolsFromDB.forEach(school => {
                        if (school.catchmentZones && Array.isArray(school.catchmentZones)) {
                            school.catchmentZones.forEach(zone => {
                                // Debug: Check what data we're getting from the database
                                console.log('Zone from DB:', zone);
                                
                                // Validate that all required properties exist
                                if (zone.id && zone.radius && zone.unit && zone.year && zone.color) {
                                    const circle = {
                                        id: zone.id,
                                        center: school.coordinates,
                                        radius: typeof zone.radius === 'string' ? parseFloat(zone.radius) : zone.radius,
                                        unit: zone.unit,
                                        schoolName: school.name,
                                        year: zone.year,
                                        color: zone.color,
                                        isVisible: zone.isVisible !== false, // Default to true if not specified
                                        schoolId: school.id
                                        // leafletCircle will be created later when map is initialized
                                    };
                                    console.log('Circle created:', circle);
                                    catchmentCircles.push(circle);
                                } else {
                                    console.log('Zone missing required properties:', zone);
                                }
                            });
                        }
                    });
                    
                    if (catchmentCircles.length > 0) {
                        setCircles(catchmentCircles);
                        restoredItems.push(`${catchmentCircles.length} catchment zone${catchmentCircles.length > 1 ? 's' : ''}`);
                    }
                }
                
                if (savedPlacedPins) {
                    const pins = JSON.parse(savedPlacedPins);
                    if (Array.isArray(pins) && pins.length > 0) {
                        setPlacedPins(pins);
                        restoredItems.push(`${pins.length} pin${pins.length > 1 ? 's' : ''}`);
                    }
                }
                
                if (savedFormData) {
                    const formDataFromStorage = JSON.parse(savedFormData);
                    if (formDataFromStorage && typeof formDataFromStorage === 'object') {
                        setFormData(prev => ({ ...prev, ...formDataFromStorage }));
                    }
                }
                
                // Show restoration message if any data was restored
                if (restoredItems.length > 0) {
                    setSaveMessage({
                        type: 'success',
                        text: `✨ Restored your previous session: ${restoredItems.join(', ')}`
                    });
                    
                    // Auto-clear message after 5 seconds
                    setTimeout(() => setSaveMessage(null), 5000);
                }
                
                // Clean up old localStorage key for circles (now saved to database)
                localStorage.removeItem('schoolCatchment_circles');
            } catch (error) {
                console.warn('Error loading data:', error);
                // Clear corrupted localStorage data
                Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
                // Also clear old circles key
                localStorage.removeItem('schoolCatchment_circles');
                
                setSaveMessage({
                    type: 'error',
                    text: 'Failed to load some saved data. Please try refreshing the page.'
                });
                setTimeout(() => setSaveMessage(null), 5000);
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        loadData();
    }, []);

    // Note: Favorite schools are now saved to database automatically when added/removed
    // No need for a separate useEffect to save them to localStorage

    // Note: Circles (catchment zones) are now saved to database with favorite schools
    // No need for a separate useEffect to save them to localStorage

    // Save placed pins to localStorage whenever they change
    useEffect(() => {
        if (placedPins.length > 0) {
            localStorage.setItem(STORAGE_KEYS.placedPins, JSON.stringify(placedPins));
        } else {
            localStorage.removeItem(STORAGE_KEYS.placedPins);
        }
    }, [placedPins]);

    // Save important form data to localStorage
    useEffect(() => {
        const formDataToSave = {
            address: formData.address,
            unit: formData.unit,
            selectedYear: formData.selectedYear,
            viewMode: formData.viewMode
        };
        
        if (formDataToSave.address || formDataToSave.unit !== 'km') {
            localStorage.setItem(STORAGE_KEYS.formData, JSON.stringify(formDataToSave));
        }
    }, [formData.address, formData.unit, formData.selectedYear, formData.viewMode]);
    const markerRef = useRef<L.Marker | null>(null);
    const customPinRef = useRef<L.Marker | null>(null);
    const schoolMarkersRef = useRef<L.Marker[]>([]);
    const placedPinsRef = useRef<L.Marker[]>([]);
    const measurementMarkersRef = useRef<L.Marker[]>([]);
    const measurementLineRef = useRef<L.Polyline | null>(null);
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
        
        // Add base tile layer (OpenStreetMap)
        const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Add detailed street layer (optional overlay)
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap France',
            maxZoom: 20,
            opacity: 0.7
        });

        // Layer control for switching between views
        const baseMaps = {
            "Standard": baseLayer,
            "Detailed Streets": streetLayer
        };

        L.control.layers(baseMaps).addTo(map);

        // Add click handler for placing custom pins and checking catchment
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            const clickedPoint: [number, number] = [lat, lng];
            
            // Handle pin placement modes
            if (formData.pinPlacementMode === 'school') {
                const title = formData.schoolName || 'New School Location';
                placePinAtCoordinates(clickedPoint, 'school', title);
                togglePinPlacementMode('off');
                return;
            } else if (formData.pinPlacementMode === 'location') {
                placePinAtCoordinates(clickedPoint, 'location', 'Custom Location');
                togglePinPlacementMode('off');
                return;
            } else if (measurementMode) {
                // Handle measurement mode
                setMeasurementPoints(prev => {
                    const newPoints = [...prev, clickedPoint];
                    if (newPoints.length === 2) {
                        // Calculate distance between two points
                        const distance = calculateDistance(newPoints[0], newPoints[1]);
                        const convertedDistance = convertRadius(distance / 1000, 'km', formData.unit);
                        const displayDistance = formData.unit === 'meters' ? 
                            convertedDistance.toFixed(0) : 
                            convertedDistance.toFixed(3);
                        
                        // Place measurement markers
                        placePinAtCoordinates(newPoints[0], 'measurement', `Point A`);
                        placePinAtCoordinates(newPoints[1], 'measurement', `Point B - Distance: ${displayDistance} ${formData.unit}`);
                        
                        // Draw line between points
                        if (measurementLineRef.current && mapRef.current) {
                            mapRef.current.removeLayer(measurementLineRef.current);
                        }
                        measurementLineRef.current = L.polyline(newPoints, { 
                            color: '#FF6B35', 
                            weight: 3, 
                            dashArray: '5, 10' 
                        }).addTo(map);
                        
                        setMeasurementMode(false);
                        return [];
                    }
                    return newPoints;
                });
                return;
            }
            
            // Default behavior: check catchment coverage
            const schoolsInRange = checkPointInCatchment(clickedPoint);
            
            // Create popup content
            let popupContent = `<strong>📍 Location Analysis</strong><br/>`;
            popupContent += `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}<br/>`;
            
            if (schoolsInRange.length > 0) {
                popupContent += `<br/><strong>✅ Within catchment of:</strong><br/>`;
                schoolsInRange.forEach(schoolId => {
                    const school = favoriteSchools.find(s => s.id === schoolId);
                    if (school) {
                        const distance = calculateDistance(clickedPoint, school.coordinates);
                        const convertedDistance = convertRadius(distance / 1000, 'km', formData.unit);
                        const displayDistance = formData.unit === 'meters' ? 
                            convertedDistance.toFixed(0) : 
                            convertedDistance.toFixed(2);
                        popupContent += `• ${school.name} (${displayDistance} ${formData.unit} away)<br/>`;
                    }
                });
            } else {
                popupContent += `<br/>❌ Not within any favorite school catchments`;
            }
            
            // Show popup
            L.popup()
                .setLatLng([lat, lng])
                .setContent(popupContent)
                .openOn(map);
            
            // Only set custom pin if not in placement mode
            if (formData.pinPlacementMode === 'off') {
                setCustomPin(clickedPoint);
            }
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

    // Recreate Leaflet circles for restored circles that don't have leafletCircle
    useEffect(() => {
        if (!mapRef.current || !mapInitialized) return;

        setCircles(prevCircles => {
            return prevCircles.map(circle => {
                // If circle doesn't have a leafletCircle (restored from localStorage), create it
                if (!circle.leafletCircle) {
                    console.log('Creating leaflet circle for:', circle);
                    
                    const leafletCircle = L.circle(circle.center, {
                        color: circle.color,
                        fillColor: circle.color,
                        fillOpacity: circle.isVisible ? 0.2 : 0,
                        opacity: circle.isVisible ? 1 : 0,
                        radius: convertToMeters(circle.radius, circle.unit)
                    });

                    console.log('Leaflet circle radius in meters:', convertToMeters(circle.radius, circle.unit));

                    if (circle.isVisible) {
                        leafletCircle.addTo(mapRef.current!);
                    }

                    leafletCircle.bindPopup(`${circle.schoolName}<br/>${circle.radius} ${circle.unit} catchment zone (${circle.year})`);

                    return {
                        ...circle,
                        leafletCircle: leafletCircle
                    };
                }
                return circle;
            });
        });
    }, [mapInitialized]); // Only run when map is initialized

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

    // Handle school markers on map
    useEffect(() => {
        if (!mapRef.current || !mapInitialized) return;

        // Remove existing school markers
        schoolMarkersRef.current.forEach(marker => {
            mapRef.current?.removeLayer(marker);
        });
        schoolMarkersRef.current = [];

        // Create school icon
        const schoolIcon = L.icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Add markers for each favorite school
        favoriteSchools.forEach(school => {
            const marker = L.marker(school.coordinates, { icon: schoolIcon })
                .addTo(mapRef.current!)
                .bindPopup(`
                    <strong>🏫 ${school.name}</strong><br/>
                    📍 ${school.address}<br/>
                    📊 ${school.catchmentZones.length} historical zones
                    ${school.averageCatchment ? `<br/>📏 Avg: ${school.averageCatchment.radius} ${school.averageCatchment.unit}` : ''}
                `);
            
            schoolMarkersRef.current.push(marker);
        });

        // Auto-center map if we have schools
        if (favoriteSchools.length > 0) {
            setTimeout(() => centerMapOnSchools(), 100);
        }
    }, [favoriteSchools, mapInitialized]);

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
            
            setMapCenter(coordinates);
        } catch (err) {
            console.error('Geocoding error:', err);
            setError('Failed to find address. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Add school to favorites list
    const addSchool = async () => {
        if (!formData.schoolName.trim()) {
            setError('Please enter a school name');
            return;
        }

        if (favoriteSchools.length >= 6) {
            setError('Maximum of 6 favorite schools allowed');
            return;
        }

        const newSchool: School = {
            id: Date.now().toString(),
            name: formData.schoolName,
            address: formData.address,
            coordinates: customPin || mapCenter,
            catchmentZones: [],
            isActive: true,
            isFavorite: true
        };

        // Save to database and update local state
        const saveResult = await favoriteSchoolsService.addFavoriteSchool(newSchool);
        if (saveResult.success) {
            setFavoriteSchools(prev => [...prev, newSchool]);
            setSchools(prev => [...prev, newSchool]); // Also add to general schools list
            setFormData(prev => ({ ...prev, schoolName: '', selectedSchoolId: newSchool.id }));
            setError('');
            
            setSaveMessage({
                type: 'success',
                text: saveResult.message || 'School added to favorites!'
            });
            setTimeout(() => setSaveMessage(null), 3000);
        } else {
            setError(saveResult.message || 'Failed to add school to favorites');
        }
    };

    // Calculate average catchment for a school based on historical data
    const calculateAverageCatchment = (school: School): number => {
        if (school.catchmentZones.length === 0) return 0;
        
        // Convert all radii to same unit (km) for averaging
        const radiiInKm = school.catchmentZones.map(zone => {
            switch (zone.unit) {
                case 'km': return zone.radius;
                case 'miles': return zone.radius * 1.60934;
                case 'meters': return zone.radius / 1000;
                default: return zone.radius;
            }
        });
        
        return radiiInKm.reduce((sum, radius) => sum + radius, 0) / radiiInKm.length;
    };

    // Center map on favorite schools when they exist
    const centerMapOnSchools = () => {
        if (favoriteSchools.length === 0 || !mapRef.current) return;
        
        if (favoriteSchools.length === 1) {
            // Center on single school
            const school = favoriteSchools[0];
            mapRef.current.setView(school.coordinates, 13);
        } else {
            // Center on bounds of all schools
            const coordinates = favoriteSchools.map(s => s.coordinates);
            const latLngs = coordinates.map(coord => L.latLng(coord[0], coord[1]));
            const bounds = L.latLngBounds(latLngs);
            mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
    };

    // Add historical catchment data for favorite schools
    const addHistoricalCatchmentData = (schoolId: string) => {
        const school = favoriteSchools.find(s => s.id === schoolId);
        if (!school) return;

        // Generate sample historical data for demonstration
        const currentYear = new Date().getFullYear();
        const historicalData: CatchmentZone[] = [];
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            // Simulate slight variations in catchment areas over years
            const baseRadius = 1.2;
            const variation = (Math.random() - 0.5) * 0.4; // ±0.2 km variation
            const radius = Math.max(0.5, baseRadius + variation);
            
            historicalData.push({
                id: `${schoolId}-${year}`,
                year: year,
                radius: parseFloat(radius.toFixed(1)),
                unit: 'km',
                color: colors[i % colors.length],
                isVisible: true
            });
        }

        // Update the school with historical data
        setFavoriteSchools(prev => prev.map(s => 
            s.id === schoolId 
                ? { ...s, catchmentZones: historicalData }
                : s
        ));

        // Also calculate and set average catchment
        const averageRadius = calculateAverageCatchment({...school, catchmentZones: historicalData});
        setFavoriteSchools(prev => prev.map(s => 
            s.id === schoolId 
                ? { 
                    ...s, 
                    averageCatchment: {
                        radius: parseFloat(averageRadius.toFixed(1)),
                        unit: 'km',
                        color: '#6B7280',
                        isVisible: false
                    }
                }
                : s
        ));
    };

    // Add catchment zone for a school
    const addCatchmentZone = async () => {
        if (!mapRef.current || !mapInitialized) {
            setError('Please search for an address first');
            return;
        }

        // Check if a school is selected
        const selectedSchool = favoriteSchools.find(s => s.id === formData.selectedSchoolId);
        if (!selectedSchool) {
            setError('Please select a favorite school first');
            return;
        }

        const radius = parseFloat(formData.radius);
        if (isNaN(radius) || radius <= 0) {
            setError('Please enter a valid radius');
            return;
        }

        // Use school's coordinates for catchment zone center
        const centerCoords = selectedSchool.coordinates;
        
        // Get color using the new color system
        const zoneColor = getColorForSchoolYear(selectedSchool.id, formData.selectedYear);

        // Create new catchment zone
        const newZone: CatchmentZone = {
            id: `${selectedSchool.id}-${formData.selectedYear}`,
            year: formData.selectedYear,
            radius: radius,
            unit: formData.unit,
            color: zoneColor,
            isVisible: true
        };

        // Update the school's catchment zones
        const updatedZones = [...selectedSchool.catchmentZones.filter(z => z.year !== formData.selectedYear), newZone];
        const updatedSchool = { ...selectedSchool, catchmentZones: updatedZones };
        
        // Recalculate average if we have data
        if (updatedZones.length > 0) {
            const averageRadius = calculateAverageCatchment(updatedSchool);
            updatedSchool.averageCatchment = {
                radius: parseFloat(averageRadius.toFixed(1)),
                unit: 'km',
                color: '#6B7280',
                isVisible: showAverageZones
            };
        }

        // Save updated school to database
        try {
            const saveResult = await favoriteSchoolsService.updateFavoriteSchool(updatedSchool);
            if (!saveResult.success) {
                setError(saveResult.message || 'Failed to save catchment zone to database');
                return;
            }
        } catch (error) {
            console.error('Error saving catchment zone:', error);
            setError('Failed to save catchment zone to database');
            return;
        }

        // Update local state only after successful database save
        setFavoriteSchools(prev => prev.map(school => 
            school.id === selectedSchool.id ? updatedSchool : school
        ));

        // Create Leaflet circle and add to map
        const leafletCircle = L.circle(centerCoords, {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: 0.2,
            radius: convertToMeters(radius, formData.unit)
        }).addTo(mapRef.current);

        leafletCircle.bindPopup(`${selectedSchool.name}<br/>${radius} ${formData.unit} catchment zone (${formData.selectedYear})`);

        // Create RadiusCircle for display management
        const newCircle: RadiusCircle = {
            id: newZone.id,
            center: centerCoords,
            radius: radius,
            unit: formData.unit,
            schoolName: selectedSchool.name,
            year: formData.selectedYear,
            color: zoneColor,
            leafletCircle: leafletCircle,
            isVisible: true,
            schoolId: selectedSchool.id
        };

        setCircles(prev => [...prev.filter(c => c.id !== newZone.id), newCircle]);
        setError('');
        
        // Show success message
        setSaveMessage({
            type: 'success',
            text: 'Catchment zone saved to database!'
        });
        setTimeout(() => setSaveMessage(null), 3000);
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

    const removeCircle = async (id: string) => {
        const circleToRemove = circles.find(circle => circle.id === id);
        if (!circleToRemove) return;

        // Find the school that owns this catchment zone
        const school = favoriteSchools.find(s => s.id === circleToRemove.schoolId);
        if (school) {
            // Remove the catchment zone from the school's data
            const updatedZones = school.catchmentZones.filter(z => z.id !== id);
            const updatedSchool = { ...school, catchmentZones: updatedZones };
            
            // Recalculate average if we still have data
            if (updatedZones.length > 0) {
                const averageRadius = calculateAverageCatchment(updatedSchool);
                updatedSchool.averageCatchment = {
                    radius: parseFloat(averageRadius.toFixed(1)),
                    unit: 'km',
                    color: '#6B7280',
                    isVisible: showAverageZones
                };
            } else {
                // No more catchment zones, remove average
                updatedSchool.averageCatchment = undefined;
            }

            // Save updated school to database
            try {
                const saveResult = await favoriteSchoolsService.updateFavoriteSchool(updatedSchool);
                if (saveResult.success) {
                    // Update local state only after successful database save
                    setFavoriteSchools(prev => prev.map(s => 
                        s.id === school.id ? updatedSchool : s
                    ));
                    
                    setSaveMessage({
                        type: 'success',
                        text: 'Catchment zone removed from database!'
                    });
                    setTimeout(() => setSaveMessage(null), 3000);
                } else {
                    console.error('Failed to remove catchment zone from database:', saveResult.message);
                    setSaveMessage({
                        type: 'error',
                        text: 'Failed to remove catchment zone from database'
                    });
                    setTimeout(() => setSaveMessage(null), 3000);
                    return; // Don't remove from map if database save failed
                }
            } catch (error) {
                console.error('Error removing catchment zone from database:', error);
                setSaveMessage({
                    type: 'error',
                    text: 'Failed to remove catchment zone from database'
                });
                setTimeout(() => setSaveMessage(null), 3000);
                return; // Don't remove from map if database save failed
            }
        }

        // Remove from map and local circles state
        if (circleToRemove.leafletCircle && mapRef.current) {
            mapRef.current.removeLayer(circleToRemove.leafletCircle);
        }
        setCircles(prev => prev.filter(circle => circle.id !== id));
    };

    const removeSchool = async (id: string) => {
        // Remove all circles for this school
        const schoolCircles = circles.filter(circle => {
            const school = favoriteSchools.find(s => s.id === id);
            return school && circle.schoolName === school.name;
        });
        
        schoolCircles.forEach(circle => {
            if (circle.leafletCircle && mapRef.current) {
                mapRef.current.removeLayer(circle.leafletCircle);
            }
        });

        // Remove from database
        const removeResult = await favoriteSchoolsService.removeFavoriteSchool(id);
        if (removeResult.success) {
            setCircles(prev => prev.filter(circle => !schoolCircles.includes(circle)));
            setFavoriteSchools(prev => prev.filter(school => school.id !== id));
            setSchools(prev => prev.filter(school => school.id !== id));
            
            setSaveMessage({
                type: 'success',
                text: removeResult.message || 'School removed from favorites!'
            });
            setTimeout(() => setSaveMessage(null), 3000);
        } else {
            setSaveMessage({
                type: 'error',
                text: removeResult.message || 'Failed to remove school from favorites'
            });
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    // Toggle average catchment zones visibility
    const toggleAverageZones = () => {
        setShowAverageZones(prev => {
            const newState = !prev;
            
            // Update all schools' average catchment visibility
            setFavoriteSchools(schools => schools.map(school => ({
                ...school,
                averageCatchment: school.averageCatchment ? {
                    ...school.averageCatchment,
                    isVisible: newState
                } : undefined
            })));

            // Add or remove average circles from map
            favoriteSchools.forEach(school => {
                if (school.averageCatchment && mapRef.current) {
                    const averageCircleId = `avg-${school.id}`;
                    
                    // Remove existing average circle
                    const existingCircle = circles.find(c => c.id === averageCircleId);
                    if (existingCircle && existingCircle.leafletCircle) {
                        mapRef.current.removeLayer(existingCircle.leafletCircle);
                        setCircles(prev => prev.filter(c => c.id !== averageCircleId));
                    }

                    // Add new average circle if showing
                    if (newState && school.averageCatchment.radius > 0) {
                        const leafletCircle = L.circle(school.coordinates, {
                            color: school.averageCatchment.color,
                            fillColor: school.averageCatchment.color,
                            fillOpacity: 0.1,
                            weight: 3,
                            dashArray: '10, 10',
                            radius: convertToMeters(school.averageCatchment.radius, school.averageCatchment.unit)
                        }).addTo(mapRef.current);

                        leafletCircle.bindPopup(`${school.name}<br/>Average: ${school.averageCatchment.radius} ${school.averageCatchment.unit} (5-year avg)`);

                        const avgCircle: RadiusCircle = {
                            id: averageCircleId,
                            center: school.coordinates,
                            radius: school.averageCatchment.radius,
                            unit: school.averageCatchment.unit,
                            schoolName: school.name,
                            year: 0, // Use 0 to indicate average
                            color: school.averageCatchment.color,
                            leafletCircle: leafletCircle,
                            isVisible: true,
                            schoolId: school.id
                        };

                        setCircles(prev => [...prev, avgCircle]);
                    }
                }
            });

            return newState;
        });
    };

    // Focus on specific school's catchment zones
    const focusOnSchool = (schoolId: string) => {
        setFocusedSchoolId(schoolId);
        setFormData(prev => ({ ...prev, focusSchoolId: schoolId }));
        
        circles.forEach(circle => {
            if (circle.leafletCircle && mapRef.current) {
                if (schoolId === '' || circle.schoolId === schoolId) {
                    // Show this circle
                    if (!circle.isVisible) {
                        mapRef.current.addLayer(circle.leafletCircle);
                        circle.leafletCircle.setStyle({ opacity: 1, fillOpacity: 0.2 });
                    } else {
                        circle.leafletCircle.setStyle({ opacity: 1, fillOpacity: 0.2 });
                    }
                } else {
                    // Dim or hide other circles
                    circle.leafletCircle.setStyle({ opacity: 0.3, fillOpacity: 0.05 });
                }
            }
        });

        // Update circle visibility state
        setCircles(prev => prev.map(circle => ({
            ...circle,
            isVisible: schoolId === '' || circle.schoolId === schoolId
        })));

        // Center map on focused school
        if (schoolId) {
            const school = favoriteSchools.find(s => s.id === schoolId);
            if (school && mapRef.current) {
                mapRef.current.setView(school.coordinates, 14);
            }
        }
    };

    // Toggle comparison mode
    const toggleComparisonMode = () => {
        setComparisonMode(prev => {
            const newMode = !prev;
            setFormData(prevForm => ({ 
                ...prevForm, 
                viewMode: newMode ? 'comparison' : 'all' 
            }));
            
            if (!newMode) {
                // Exit comparison mode - show all zones normally
                focusOnSchool('');
            }
            
            return newMode;
        });
    };

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
        const R = 6371000; // Earth's radius in meters
        const φ1 = coord1[0] * Math.PI / 180;
        const φ2 = coord2[0] * Math.PI / 180;
        const Δφ = (coord2[0] - coord1[0]) * Math.PI / 180;
        const Δλ = (coord2[1] - coord1[1]) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    // Check if a point is within any catchment area
    const checkPointInCatchment = (point: [number, number]): string[] => {
        const schoolsInRange: string[] = [];
        
        favoriteSchools.forEach(school => {
            school.catchmentZones.forEach(zone => {
                const distance = calculateDistance(point, school.coordinates);
                const zoneRadiusInMeters = convertToMeters(zone.radius, zone.unit);
                
                if (distance <= zoneRadiusInMeters) {
                    if (!schoolsInRange.includes(school.id)) {
                        schoolsInRange.push(school.id);
                    }
                }
            });
        });
        
        return schoolsInRange;
    };

    // Get color for a specific school and year combination
    const getColorForSchoolYear = (schoolId: string, year: number): string => {
        // Check for custom color first
        const customKey = `${schoolId}-${year}`;
        if (customColors[customKey]) {
            return customColors[customKey];
        }

        // Check for school-specific color scheme
        if (schoolColorSchemes[schoolId]) {
            const yearIndex = Math.abs(year - 2020) % schoolColorSchemes[schoolId].length;
            return schoolColorSchemes[schoolId][yearIndex];
        }

        // Use palette-based coloring with type safety
        let palette: string[] = [];
        
        if (selectedColorPalette.type === 'schools') {
            const schoolPalettes = colorPalettes.schools;
            palette = schoolPalettes[selectedColorPalette.name as keyof typeof schoolPalettes] || [];
        } else {
            const yearPalettes = colorPalettes.years;
            palette = yearPalettes[selectedColorPalette.name as keyof typeof yearPalettes] || [];
        }
        
        if (selectedColorPalette.type === 'schools') {
            // Color by school
            const schoolIndex = favoriteSchools.findIndex(s => s.id === schoolId);
            return palette[schoolIndex % palette.length] || '#3B82F6';
        } else {
            // Color by year
            const yearIndex = Math.abs(year - 2020) % palette.length;
            return palette[yearIndex] || '#3B82F6';
        }
    };

    // Apply color scheme to school
    const applyColorSchemeToSchool = (schoolId: string, colors: string[]) => {
        setSchoolColorSchemes(prev => ({
            ...prev,
            [schoolId]: colors
        }));

        // Update existing circles for this school
        const school = favoriteSchools.find(s => s.id === schoolId);
        if (school) {
            school.catchmentZones.forEach((zone, index) => {
                const newColor = colors[index % colors.length];
                const circle = circles.find(c => c.id === zone.id);
                if (circle && circle.leafletCircle) {
                    circle.leafletCircle.setStyle({
                        color: newColor,
                        fillColor: newColor
                    });
                }
            });

            setCircles(prev => prev.map(circle => {
                if (circle.schoolId === schoolId) {
                    const zoneIndex = school.catchmentZones.findIndex(z => z.id === circle.id);
                    if (zoneIndex !== -1) {
                        return {
                            ...circle,
                            color: colors[zoneIndex % colors.length]
                        };
                    }
                }
                return circle;
            }));
        }
    };

    // Apply palette to all schools or years
    const applyPaletteToAll = (paletteType: 'schools' | 'years', paletteName: string) => {
        setSelectedColorPalette({ type: paletteType, name: paletteName });
        let palette: string[] = [];
        
        if (paletteType === 'schools') {
            const schoolPalettes = colorPalettes.schools;
            palette = schoolPalettes[paletteName as keyof typeof schoolPalettes] || [];
        } else {
            const yearPalettes = colorPalettes.years;
            palette = yearPalettes[paletteName as keyof typeof yearPalettes] || [];
        }

        circles.forEach(circle => {
            let newColor: string;
            
            if (paletteType === 'schools') {
                const schoolIndex = favoriteSchools.findIndex(s => s.id === circle.schoolId);
                newColor = palette[schoolIndex % palette.length] || '#3B82F6';
            } else {
                const yearIndex = Math.abs(circle.year - 2020) % palette.length;
                newColor = palette[yearIndex] || '#3B82F6';
            }

            if (circle.leafletCircle) {
                circle.leafletCircle.setStyle({
                    color: newColor,
                    fillColor: newColor
                });
            }
        });

        setCircles(prev => prev.map(circle => {
            let newColor: string;
            
            if (paletteType === 'schools') {
                const schoolIndex = favoriteSchools.findIndex(s => s.id === circle.schoolId);
                newColor = palette[schoolIndex % palette.length] || '#3B82F6';
            } else {
                const yearIndex = Math.abs(circle.year - 2020) % palette.length;
                newColor = palette[yearIndex] || '#3B82F6';
            }

            return { ...circle, color: newColor };
        }));
    };

    // Set custom color for specific circle
    const setCustomColor = (circleId: string, color: string) => {
        const circle = circles.find(c => c.id === circleId);
        if (circle) {
            const customKey = `${circle.schoolId}-${circle.year}`;
            setCustomColors(prev => ({
                ...prev,
                [customKey]: color
            }));

            if (circle.leafletCircle) {
                circle.leafletCircle.setStyle({
                    color: color,
                    fillColor: color
                });
            }

            setCircles(prev => prev.map(c => 
                c.id === circleId ? { ...c, color: color } : c
            ));
        }
    };

    // Get current palette colors with type safety
    const getCurrentPaletteColors = (): string[] => {
        if (selectedColorPalette.type === 'schools') {
            const schoolPalettes = colorPalettes.schools;
            return schoolPalettes[selectedColorPalette.name as keyof typeof schoolPalettes] || [];
        } else {
            const yearPalettes = colorPalettes.years;
            return yearPalettes[selectedColorPalette.name as keyof typeof yearPalettes] || [];
        }
    };

    // Reset all colors to default palette
    const resetAllColors = () => {
        setCustomColors({});
        setSchoolColorSchemes({});
        applyPaletteToAll('schools', 'vibrant');
    };

    // Pin placement functions
    const createPinIcon = (type: 'school' | 'location' | 'measurement') => {
        const iconConfigs = {
            school: {
                url: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                color: 'Blue School Pin'
            },
            location: {
                url: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                color: 'Red Location Pin'
            },
            measurement: {
                url: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
                color: 'Yellow Measurement Pin'
            }
        };

        const config = iconConfigs[type];
        return L.icon({
            iconUrl: config.url,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    };

    // Place a pin at specific coordinates
    const placePinAtCoordinates = (coordinates: [number, number], type: 'school' | 'location' | 'measurement', title: string, schoolId?: string) => {
        if (!mapRef.current) return null;

        const pinId = `${type}-${Date.now()}`;
        const icon = createPinIcon(type);
        
        const marker = L.marker(coordinates, { 
            icon: icon, 
            draggable: true 
        }).addTo(mapRef.current);

        // Create popup content based on type
        let popupContent = `<strong>📍 ${title}</strong><br/>`;
        popupContent += `Coordinates: ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}<br/>`;
        
        if (type === 'school') {
            popupContent += `🏫 School Pin - Drag to adjust exact location<br/>`;
            popupContent += `<small>Every meter matters for catchment calculations!</small>`;
        } else if (type === 'location') {
            popupContent += `📍 Custom Location Pin<br/>`;
            popupContent += `<small>Click to check catchment coverage</small>`;
        } else {
            popupContent += `📏 Measurement Point<br/>`;
            popupContent += `<small>Used for distance calculations</small>`;
        }

        marker.bindPopup(popupContent);

        // Handle pin dragging
        marker.on('dragend', (e) => {
            const newPos = e.target.getLatLng();
            const newCoords: [number, number] = [newPos.lat, newPos.lng];
            
            // Update pin info
            setPlacedPins(prev => prev.map(pin => 
                pin.id === pinId 
                    ? { ...pin, coordinates: newCoords }
                    : pin
            ));

            // If this is a school pin, update the school's coordinates
            if (type === 'school' && schoolId) {
                setFavoriteSchools(prev => prev.map(school =>
                    school.id === schoolId
                        ? { ...school, coordinates: newCoords }
                        : school
                ));

                // Update all catchment circles for this school
                const school = favoriteSchools.find(s => s.id === schoolId);
                if (school) {
                    school.catchmentZones.forEach(zone => {
                        const circle = circles.find(c => c.id === zone.id);
                        if (circle && circle.leafletCircle) {
                            circle.leafletCircle.setLatLng(newCoords);
                        }
                    });

                    setCircles(prev => prev.map(circle =>
                        circle.schoolId === schoolId
                            ? { ...circle, center: newCoords }
                            : circle
                    ));
                }
            }

            // Update popup with new coordinates
            const newPopupContent = popupContent.replace(
                /Coordinates: [\d.-]+, [\d.-]+/,
                `Coordinates: ${newCoords[0].toFixed(6)}, ${newCoords[1].toFixed(6)}`
            );
            marker.setPopupContent(newPopupContent);
        });

        // Store pin info
        const pinInfo: PinInfo = {
            id: pinId,
            type: type,
            coordinates: coordinates,
            title: title,
            schoolId: schoolId,
            isDraggable: true,
            marker: marker
        };

        setPlacedPins(prev => [...prev, pinInfo]);
        placedPinsRef.current.push(marker);

        return pinInfo;
    };

    // Toggle pin placement mode
    const togglePinPlacementMode = (mode: 'off' | 'school' | 'location') => {
        setFormData(prev => ({ ...prev, pinPlacementMode: mode }));
        setMeasurementMode(false);

        // Update map cursor and click behavior
        if (mapRef.current) {
            if (mode !== 'off') {
                mapRef.current.getContainer().style.cursor = 'crosshair';
            } else {
                mapRef.current.getContainer().style.cursor = '';
            }
        }
    };

    // Place pin from coordinate input
    const placePinFromCoordinates = () => {
        const lat = parseFloat(formData.coordinateInput.lat);
        const lng = parseFloat(formData.coordinateInput.lng);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Please enter valid coordinates');
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setError('Coordinates must be within valid ranges (lat: -90 to 90, lng: -180 to 180)');
            return;
        }

        const coordinates: [number, number] = [lat, lng];
        const title = formData.pinPlacementMode === 'school' ? 'Precise School Location' : 'Custom Location';
        
        placePinAtCoordinates(coordinates, formData.pinPlacementMode as 'school' | 'location', title);
        
        // Clear coordinate input
        setFormData(prev => ({ 
            ...prev, 
            coordinateInput: { lat: '', lng: '' },
            pinPlacementMode: 'off'
        }));
        setShowCoordinateInput(false);
        setError('');

        // Center map on new pin
        if (mapRef.current) {
            mapRef.current.setView(coordinates, 16);
        }
    };

    // Remove specific pin
    const removePin = (pinId: string) => {
        const pin = placedPins.find(p => p.id === pinId);
        if (pin && pin.marker && mapRef.current) {
            mapRef.current.removeLayer(pin.marker);
        }

        setPlacedPins(prev => prev.filter(p => p.id !== pinId));
        placedPinsRef.current = placedPinsRef.current.filter(marker => 
            marker !== pin?.marker
        );
    };

    // Assign pin to school
    const assignPinToSchool = (pinId: string, schoolId: string) => {
        const pin = placedPins.find(p => p.id === pinId);
        const school = favoriteSchools.find(s => s.id === schoolId);
        
        if (pin && school) {
            // Update school coordinates
            setFavoriteSchools(prev => prev.map(s =>
                s.id === schoolId
                    ? { ...s, coordinates: pin.coordinates }
                    : s
            ));

            // Update pin info
            setPlacedPins(prev => prev.map(p =>
                p.id === pinId
                    ? { ...p, schoolId: schoolId, title: `${school.name} - Precise Location` }
                    : p
            ));

            // Update existing catchment circles for this school
            circles.forEach(circle => {
                if (circle.schoolId === schoolId && circle.leafletCircle) {
                    circle.leafletCircle.setLatLng(pin.coordinates);
                }
            });

            setCircles(prev => prev.map(circle =>
                circle.schoolId === schoolId
                    ? { ...circle, center: pin.coordinates }
                    : circle
            ));
        }
    };

    // Filter zones by year
    const filterZonesByYear = (year: number | 'all') => {
        setSelectedYearFilter(year);
        
        circles.forEach(circle => {
            if (circle.leafletCircle && mapRef.current) {
                if (year === 'all' || circle.year === year || circle.year === 0) {
                    // Show this circle (year 0 = average)
                    if (!circle.isVisible) {
                        mapRef.current.addLayer(circle.leafletCircle);
                    }
                } else {
                    // Hide this circle
                    if (circle.isVisible) {
                        mapRef.current.removeLayer(circle.leafletCircle);
                    }
                }
            }
        });

        // Update visibility state
        setCircles(prev => prev.map(circle => ({
            ...circle,
            isVisible: year === 'all' || circle.year === year || circle.year === 0
        })));
    };

    const clearAll = async () => {
        if (!confirm('Are you sure you want to clear all data? This will remove all favorite schools from your account permanently.')) {
            return;
        }
        
        // Remove all circles from map
        circles.forEach(circle => {
            if (circle.leafletCircle && mapRef.current) {
                mapRef.current.removeLayer(circle.leafletCircle);
            }
        });

        // Remove all school markers
        schoolMarkersRef.current.forEach(marker => {
            if (mapRef.current) {
                mapRef.current.removeLayer(marker);
            }
        });
        schoolMarkersRef.current = [];
        
        // Clear localStorage data
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        
        // Clear favorite schools from database
        const clearPromises = favoriteSchools.map(school => 
            favoriteSchoolsService.removeFavoriteSchool(school.id)
        );
        
        try {
            await Promise.all(clearPromises);
        } catch (error) {
            console.error('Error clearing favorite schools from database:', error);
        }
        
        setCircles([]);
        setSchools([]);
        setFavoriteSchools([]);
        setShowAverageZones(false);
        setSelectedYearFilter(new Date().getFullYear());
        setComparisonMode(false);
        setFocusedSchoolId('');
        setCustomColors({});
        setSchoolColorSchemes({});
        setSelectedColorPalette({ type: 'schools', name: 'vibrant' });
        setError('');
        setSaveMessage(null);
        setCustomPin(null);
        setPlacedPins([]); // Clear placed pins
        
        // Remove custom pin from map
        if (customPinRef.current && mapRef.current) {
            mapRef.current.removeLayer(customPinRef.current);
        }
    };

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        setIsResizingMap(true);
        setIsFullscreen(!isFullscreen);
        
        // Force immediate map resize for better responsiveness
        if (mapRef.current) {
            // Use requestAnimationFrame to ensure DOM updates are complete
            requestAnimationFrame(() => {
                setTimeout(() => {
                    mapRef.current?.invalidateSize();
                    setIsResizingMap(false);
                }, 150); // Slightly longer delay for smooth transition
            });
        } else {
            // If no map, just clear the loading state
            setTimeout(() => setIsResizingMap(false), 150);
        }
    };

    // Handle map resize when fullscreen mode changes
    useEffect(() => {
        if (mapRef.current) {
            setIsResizingMap(true);
            // Use a small delay to ensure the DOM has updated before resizing
            const timeoutId = setTimeout(() => {
                mapRef.current?.invalidateSize();
                // Force a redraw to ensure proper rendering
                mapRef.current?.whenReady(() => {
                    mapRef.current?.invalidateSize();
                    setIsResizingMap(false);
                });
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
                setIsResizingMap(false);
            };
        }
    }, [isFullscreen]);

    // Handle ESC key to exit fullscreen and F11 for toggle
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            } else if (event.key === 'F11') {
                event.preventDefault(); // Prevent browser fullscreen
                setIsFullscreen(!isFullscreen);
            }
        };

        if (isFullscreen) {
            document.addEventListener('keydown', handleKeyPress);
            // Prevent body scrolling when in fullscreen
            document.body.style.overflow = 'hidden';
        } else {
            document.addEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'unset';
        };
    }, [isFullscreen]);

    const handleSaveComplete = (success: boolean, message: string) => {
        setSaveMessage({
            type: success ? 'success' : 'error',
            text: message
        });
        
        // Auto-clear message after 5 seconds for better UX
        setTimeout(() => setSaveMessage(null), 5000);
        
        // Log for debugging
        if (success) {
        } else {
            console.error('Failed to save school catchment data:', message);
        }
    };

    // Get calculation results for saving
    // Debug function to check save data
    const debugSaveData = () => {
        const results = getCalculationResults();
        const formData = getFormData();
        
        // Show alert with basic info
        alert(`Save Data Debug:
- Can Save: ${canSaveData()}
- Favorite Schools: ${favoriteSchools.length}
- School Names: ${favoriteSchools.map(s => s.name).join(', ')}
- Catchment Circles: ${circles.length}
- Placed Pins: ${placedPins.length}
- Has Address: ${Boolean(formData.address?.trim())}

Check console for full details.`);
    };

    // Validate if we have sufficient data to save
    const canSaveData = () => {
        // Allow saving if we have either favorite schools OR catchment circles
        // This allows users to save just their favorite schools without needing to generate catchment zones
        return favoriteSchools.length > 0 || circles.length > 0;
    };

    const getCalculationResults = () => {
        // Ensure we have valid data to save
        const timestamp = new Date().toISOString();
        
        return {
            // Basic search and location data
            searchedAddress: formData.address || '',
            mapCenter: mapCenter || [51.5074, -0.1278], // Default to London if undefined
            
            // School data
            schools: schools || [],
            favoriteSchools: favoriteSchools.map(school => ({
                id: school.id,
                name: school.name,
                address: school.address,
                coordinates: school.coordinates,
                catchmentZones: school.catchmentZones || [],
                averageCatchment: school.averageCatchment || null,
                isActive: school.isActive,
                isFavorite: school.isFavorite
            })),
            
            // Catchment circles data
            circles: circles.map(circle => ({
                id: circle.id,
                center: circle.center,
                radius: circle.radius,
                unit: circle.unit,
                schoolName: circle.schoolName,
                year: circle.year,
                color: circle.color,
                isVisible: circle.isVisible,
                schoolId: circle.schoolId || null
            })),
            
            // Pin data
            customPin: customPin || null,
            placedPins: placedPins.map(pin => ({
                id: pin.id,
                type: pin.type,
                title: pin.title,
                coordinates: pin.coordinates
            })),
            
            // Analysis settings
            viewSettings: {
                selectedYearFilter: selectedYearFilter,
                showAverageZones: showAverageZones,
                viewMode: formData.viewMode,
                focusSchoolId: formData.focusSchoolId,
                pinPlacementMode: formData.pinPlacementMode,
                unit: formData.unit,
                selectedYear: formData.selectedYear,
                selectedSchoolId: formData.selectedSchoolId
            },
            
            // Summary statistics
            statistics: {
                totalCircles: circles.length,
                totalSchools: schools.length,
                totalFavoriteSchools: favoriteSchools.length,
                totalPins: placedPins.length,
                visibleCircles: circles.filter(c => c.isVisible).length,
                schoolsWithCatchmentData: favoriteSchools.filter(s => s.catchmentZones && s.catchmentZones.length > 0).length,
                averageRadius: circles.length > 0 ? 
                    circles.reduce((sum, c) => sum + c.radius, 0) / circles.length : 0
            },
            
            // Metadata
            metadata: {
                calculatedAt: timestamp,
                toolVersion: '1.0.0',
                mapBounds: mapRef.current ? mapRef.current.getBounds() : null,
                zoom: mapRef.current ? mapRef.current.getZoom() : 13
            }
        };
    };

    const getFormData = () => {
        return {
            // Core form data
            ...formData,
            
            // Additional context
            mapCenter: mapCenter,
            customPin: customPin,
            
            // Current state information
            currentState: {
                isFullscreen: isFullscreen,
                measurementMode: measurementMode,
                measurementPoints: measurementPoints,
                placedPinsCount: placedPins.length,
                favoriteSchoolsCount: favoriteSchools.length,
                circlesCount: circles.length,
                
                // Current filters and display settings
                selectedYearFilter: selectedYearFilter,
                showAverageZones: showAverageZones,
                
                // Map state
                mapInitialized: mapInitialized,
                zoom: mapRef.current ? mapRef.current.getZoom() : null,
                bounds: mapRef.current ? mapRef.current.getBounds() : null
            },
            
            // Validation info
            validation: {
                hasSchools: favoriteSchools.length > 0,
                hasCatchmentData: circles.length > 0,
                hasValidRadius: formData.radius && !isNaN(parseFloat(formData.radius)),
                hasAddress: Boolean(formData.address?.trim()),
                hasSchoolName: Boolean(formData.schoolName?.trim()),
                isDataComplete: favoriteSchools.length > 0 && circles.length > 0
            }
        };
    };

    // Convert radius value between different units
    const convertRadius = (value: number, fromUnit: 'km' | 'miles' | 'meters', toUnit: 'km' | 'miles' | 'meters'): number => {
        if (fromUnit === toUnit) return value;
        
        // First convert to meters as base unit
        let meters: number;
        switch (fromUnit) {
            case 'km': meters = value * 1000; break;
            case 'miles': meters = value * 1609.34; break;
            case 'meters': meters = value; break;
        }
        
        // Then convert from meters to target unit
        switch (toUnit) {
            case 'km': return meters / 1000;
            case 'miles': return meters / 1609.34;
            case 'meters': return meters;
        }
    };

    const handleInputChange = (field: keyof MapFormData, value: string | number) => {
        setFormData(prev => {
            // Handle unit conversion when unit changes
            if (field === 'unit' && typeof value === 'string') {
                const oldUnit = prev.unit;
                const newUnit = value as 'km' | 'miles' | 'meters';
                const currentRadius = parseFloat(prev.radius);
                
                if (!isNaN(currentRadius) && currentRadius > 0) {
                    const convertedRadius = convertRadius(currentRadius, oldUnit, newUnit);
                    return {
                        ...prev,
                        unit: newUnit,
                        radius: convertedRadius.toFixed(3) // Keep 3 decimal places
                    };
                }
                return {
                    ...prev,
                    unit: newUnit
                };
            }
            
            return {
                ...prev,
                [field]: value
            };
        });
        setError('');
    };

    const availableColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

    // Enhanced color palettes for different purposes
    const colorPalettes = {
        schools: {
            vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F06292'],
            professional: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#3498DB', '#E74C3C'],
            pastels: ['#FFB3BA', '#BFFCC6', '#B3E5FC', '#E1BEE7', '#FFF9C4', '#FFCC99', '#D4E6F1', '#F8BBD9'],
            earth: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460', '#D2691E', '#BC8F8F', '#F5DEB3']
        },
        years: {
            gradient: ['#FF416C', '#FF4B2B', '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#36D1DC', '#5B86E5'],
            cool: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
            warm: ['#fa709a', '#fee140', '#f093fb', '#f5576c', '#ffecd2', '#fcb69f', '#ff9a9e', '#fecfef'],
            monochrome: ['#2D3748', '#4A5568', '#718096', '#A0AEC0', '#CBD5E0', '#E2E8F0', '#F7FAFC', '#FFFFFF']
        }
    };

    const [selectedColorPalette, setSelectedColorPalette] = useState<{type: 'schools' | 'years', name: string}>({
        type: 'schools',
        name: 'vibrant'
    });
    const [customColors, setCustomColors] = useState<{[key: string]: string}>({});
    const [schoolColorSchemes, setSchoolColorSchemes] = useState<{[schoolId: string]: string[]}>({});

    return (
        <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'p-4 sm:p-6 md:p-8'
        }`}>
            {/* Header with Enhanced Fullscreen Toggle */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">🏫 Favorite Schools Catchment Analysis</h2>
                    {isFullscreen && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            <span className="text-lg">🖥️</span>
                            <span>Full Screen Mode</span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3">
                    {isFullscreen && (
                        <div className="text-sm text-gray-600 hidden sm:block">
                            Press <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs font-mono">ESC</kbd> to exit or <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs font-mono">F11</kbd> to toggle
                        </div>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen (ESC or F11)' : 'Enter Fullscreen for Better View (F11)'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm font-medium ${
                            isFullscreen 
                                ? 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                        }`}
                   >
                        <span className="text-lg">{isFullscreen ? '❌' : '�️'}</span>
                        <span className="text-sm font-semibold tracking-wide">
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                        </span>
                    </button>
                </div>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏫 Favorite Schools Management</h3>
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
                                disabled={favoriteSchools.length >= 6}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Add to Favorites ({favoriteSchools.length}/6)
                            </button>
                            
                            {favoriteSchools.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold text-gray-900">Quick Actions</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            onClick={() => favoriteSchools.forEach(school => addHistoricalCatchmentData(school.id))}
                                            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                                        >
                                            Generate 5-Year Historical Data for All Schools
                                        </button>
                                        <button
                                            onClick={toggleAverageZones}
                                            className={`text-xs px-3 py-1 rounded transition-colors ${
                                                showAverageZones 
                                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {showAverageZones ? 'Hide' : 'Show'} Average Catchment Zones
                                        </button>
                                        <button
                                            onClick={centerMapOnSchools}
                                            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                                        >
                                            📍 Center Map on Schools
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Catchment Zone Controls */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Add Historical Catchment Zone</h3>
                        
                        {favoriteSchools.length === 0 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                <p className="text-sm text-yellow-800">
                                    Please add favorite schools first to create catchment zones.
                                </p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Favorite School
                                </label>
                                <select
                                    value={formData.selectedSchoolId}
                                    onChange={(e) => handleInputChange('selectedSchoolId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 bg-white"
                                    disabled={favoriteSchools.length === 0}
                                >
                                    <option value="">Choose a school...</option>
                                    {favoriteSchools.map(school => (
                                        <option key={school.id} value={school.id}>
                                            {school.name} ({school.catchmentZones.length} zones)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catchment Radius
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="1.5"
                                        value={formData.radius}
                                        onChange={(e) => handleInputChange('radius', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 placeholder-gray-400 bg-white"
                                    />
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => handleInputChange('unit', e.target.value as 'km' | 'miles' | 'meters')}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 bg-white"
                                    >
                                        <option value="km">🌍 Kilometers</option>
                                        <option value="miles">🇺🇸 Miles</option>
                                        <option value="meters">📏 Meters</option>
                                    </select>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {formData.unit === 'km' && 'Perfect for most UK catchment areas (e.g., 1.5 km)'}
                                    {formData.unit === 'miles' && 'Common in the US and some UK areas (e.g., 1 mile)'}
                                    {formData.unit === 'meters' && 'Precise measurements for exact distances (e.g., 1500 m)'}
                                </p>
                                {formData.radius && !isNaN(parseFloat(formData.radius)) && parseFloat(formData.radius) > 0 && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded-md border">
                                        <p className="text-xs font-medium text-gray-700 mb-1">🔄 Equivalent values:</p>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            {formData.unit !== 'km' && (
                                                <div>📏 {convertRadius(parseFloat(formData.radius), formData.unit, 'km').toFixed(3)} km</div>
                                            )}
                                            {formData.unit !== 'miles' && (
                                                <div>🇺🇸 {convertRadius(parseFloat(formData.radius), formData.unit, 'miles').toFixed(3)} miles</div>
                                            )}
                                            {formData.unit !== 'meters' && (
                                                <div>📐 {convertRadius(parseFloat(formData.radius), formData.unit, 'meters').toFixed(0)} meters</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Quick Preset Buttons */}
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-700 mb-2">⚡ Quick presets:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {formData.unit === 'km' && (
                                            <>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '0.5' }))} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">0.5 km</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '1.0' }))} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">1.0 km</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '1.5' }))} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">1.5 km</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '2.0' }))} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">2.0 km</button>
                                            </>
                                        )}
                                        {formData.unit === 'miles' && (
                                            <>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '0.3' }))} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">0.3 mi</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '0.6' }))} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">0.6 mi</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '1.0' }))} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">1.0 mi</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '1.2' }))} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">1.2 mi</button>
                                            </>
                                        )}
                                        {formData.unit === 'meters' && (
                                            <>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '500' }))} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">500 m</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '1000' }))} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">1000 m</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '1500' }))} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">1500 m</button>
                                                <button onClick={() => setFormData(prev => ({ ...prev, radius: '2000' }))} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">2000 m</button>
                                            </>
                                        )}
                                    </div>
                                </div>
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
                                    disabled={!formData.selectedSchoolId}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Add Zone
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Historical View Controls */}
                    {favoriteSchools.some(s => s.catchmentZones.length > 0) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Historical View Controls</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Year
                                    </label>
                                    <select
                                        value={selectedYearFilter}
                                        onChange={(e) => filterZonesByYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 bg-white"
                                    >
                                        <option value="all">Show All Years</option>
                                        {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => filterZonesByYear('all')}
                                        className={`text-xs px-3 py-2 rounded transition-colors ${
                                            selectedYearFilter === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        View All Years
                                    </button>
                                    <button
                                        onClick={toggleAverageZones}
                                        className={`text-xs px-3 py-2 rounded transition-colors ${
                                            showAverageZones 
                                                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {showAverageZones ? 'Hide' : 'Show'} Averages
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive School Comparison */}
                    {favoriteSchools.length > 1 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Interactive School Comparison</h3>
                            
                            {/* Comparison Mode Toggle */}
                            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">Comparison Mode</h4>
                                        <p className="text-xs text-gray-600">Focus on specific schools and compare their catchments</p>
                                    </div>
                                    <button
                                        onClick={toggleComparisonMode}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                            comparisonMode 
                                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {comparisonMode ? 'Exit Comparison' : 'Start Comparison'}
                                    </button>
                                </div>
                            </div>

                            {/* School Focus Selector */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Focus on School (others will be dimmed)
                                    </label>
                                    <select
                                        value={focusedSchoolId}
                                        onChange={(e) => focusOnSchool(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm text-gray-900 bg-white"
                                    >
                                        <option value="">Show All Schools Equally</option>
                                        {favoriteSchools.map(school => (
                                            <option key={school.id} value={school.id}>
                                                🎯 Focus on {school.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quick Focus Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    {favoriteSchools.slice(0, 4).map(school => (
                                        <button
                                            key={school.id}
                                            onClick={() => focusOnSchool(school.id)}
                                            className={`text-xs px-3 py-2 rounded transition-colors ${
                                                focusedSchoolId === school.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                            }`}
                                        >
                                            🎯 {school.name.substring(0, 20)}{school.name.length > 20 ? '...' : ''}
                                        </button>
                                    ))}
                                </div>

                                {/* Reset Button */}
                                <button
                                    onClick={() => focusOnSchool('')}
                                    className="w-full text-xs bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition-colors"
                                >
                                    🔄 Show All Schools Equally
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Favorite Schools List */}
                    {isLoadingFavorites ? (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Loading Favorite Schools...</h3>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                <div className="text-2xl mb-2">📚</div>
                                <p className="text-blue-700">Loading your saved schools from database...</p>
                            </div>
                        </div>
                    ) : favoriteSchools.length > 0 ? (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Favorite Schools ({favoriteSchools.length}/6)</h3>
                            <div className="space-y-3">
                                {favoriteSchools.map((school) => (
                                    <div 
                                        key={school.id}
                                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{school.name}</p>
                                                <p className="text-sm text-gray-600">{school.address}</p>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <span className="inline-block bg-blue-100 px-2 py-1 rounded mr-2">
                                                        {school.catchmentZones.length} historical zones
                                                    </span>
                                                    {school.averageCatchment && (
                                                        <span className="inline-block bg-yellow-100 px-2 py-1 rounded">
                                                            Avg: {school.averageCatchment.radius} {school.averageCatchment.unit}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-3">
                                                <button
                                                    onClick={() => addHistoricalCatchmentData(school.id)}
                                                    className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                                >
                                                    Add Historical Data
                                                </button>
                                                <button
                                                    onClick={() => removeSchool(school.id)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Historical Zones Summary */}
                                        {school.catchmentZones.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                <h5 className="text-xs font-semibold text-gray-700 mb-2">Historical Catchment Zones:</h5>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {school.catchmentZones.map((zone) => (
                                                        <div 
                                                            key={zone.id}
                                                            className="text-xs p-1 rounded text-center text-white font-medium"
                                                            style={{ backgroundColor: zone.color }}
                                                        >
                                                            {zone.year}
                                                            <br />
                                                            {zone.radius}{zone.unit === 'km' ? 'k' : zone.unit === 'miles' ? 'm' : zone.unit}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Map Display */}
                <div className={`${isFullscreen ? 'flex-1' : 'w-full'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">🗺️ Interactive Catchment Map</h3>
                        <div className="flex items-center space-x-4">
                            <div className="text-xs text-gray-500">
                                Zones: {circles.length} | Favorites: {favoriteSchools.length}/6 
                                {selectedYearFilter !== 'all' && ` | Year: ${selectedYearFilter}`}
                                {showAverageZones && ' | Averages: ON'}
                                {comparisonMode && ' | Comparison Mode'}
                                {focusedSchoolId && ` | Focused: ${favoriteSchools.find(s => s.id === focusedSchoolId)?.name}`}
                            </div>
                            {(circles.length > 0 || favoriteSchools.length > 0) && (
                                <div className="flex items-center gap-2">
                                    {canSaveData() ? (
                                        <SaveResultsButton
                                            toolType="school-catchment"
                                            results={getCalculationResults()}
                                            formData={getFormData()}
                                            onSaveComplete={handleSaveComplete}
                                            className="text-xs px-3 py-1"
                                        />
                                    ) : (
                                        <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded border" title="Add favorite schools or generate catchment zones to enable saving">
                                            💾 Save (Add schools or zones first)
                                        </div>
                                    )}
                                    
                                    {/* Debug button - useful for troubleshooting */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            onClick={debugSaveData}
                                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded border border-yellow-300 hover:bg-yellow-200"
                                            title="Debug save data (development only)"
                                        >
                                            🐛 Debug
                                        </button>
                                    )}
                                    
                                    {(circles.length > 0 || favoriteSchools.length > 0) && (
                                        <button
                                            onClick={clearAll}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
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
                        
                        {isResizingMap && mapInitialized && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
                                <div className="text-center text-white">
                                    <div className="text-4xl mb-3">🔄</div>
                                    <p className="text-lg font-medium mb-2">Optimizing Map View...</p>
                                    <p className="text-sm opacity-80">Adjusting for {isFullscreen ? 'fullscreen' : 'normal'} mode</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Interactive Map Legend */}
                    {favoriteSchools.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">🗺️ Map Legend & Color Guide</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-2">Map Symbols:</h5>
                                    <div className="space-y-1 text-gray-700">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-700">🏫 Favorite School Locations</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-gray-700">📍 Your Custom Location Pins</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
                                            <span className="text-gray-700">⭕ Historical Catchment Zones</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 border-2 border-gray-400 rounded-full border-dashed"></div>
                                            <span className="text-gray-700">📊 5-Year Average Zones</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-2">Color Coding:</h5>
                                    <div className="space-y-1 text-gray-700">
                                        <div>• <strong className="text-gray-800">By School:</strong> Each school gets a unique color</div>
                                        <div>• <strong className="text-gray-800">By Year:</strong> Each year gets a distinct color</div>
                                        <div>• <strong className="text-gray-800">Custom:</strong> Click color squares to customize</div>
                                        <div>• <strong className="text-gray-800">Themes:</strong> Professional, vibrant, pastel options</div>
                                        <div className="mt-2">
                                            <strong className="text-gray-800">Current Scheme:</strong> 
                                            <span className="ml-1 px-2 py-1 bg-gray-200 rounded text-xs text-gray-800">
                                                {selectedColorPalette.type === 'schools' ? '🏫 By School' : '📅 By Year'} - 
                                                {selectedColorPalette.name.charAt(0).toUpperCase() + selectedColorPalette.name.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Schools Color Preview */}
                            {favoriteSchools.length > 0 && (
                                <div className="mt-3 p-2 bg-white rounded border">
                                    <h6 className="text-xs font-semibold text-gray-800 mb-2">Active School Colors:</h6>
                                    <div className="grid grid-cols-2 gap-2">
                                        {favoriteSchools.map(school => (
                                            <div key={school.id} className="flex items-center space-x-2">
                                                <div 
                                                    className="w-3 h-3 rounded border border-gray-300"
                                                    style={{ 
                                                        backgroundColor: getColorForSchoolYear(school.id, new Date().getFullYear())
                                                    }}
                                                ></div>
                                                <span className="text-xs text-gray-700 truncate">
                                                    {school.name.substring(0, 15)}{school.name.length > 15 ? '...' : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {comparisonMode && (
                                <div className="mt-3 p-2 bg-purple-100 rounded border border-purple-200">
                                    <p className="text-xs text-purple-800">
                                        <strong>🔍 Comparison Mode Active:</strong> Use the controls above to focus on specific schools. 
                                        Click anywhere on the map to see which school catchments cover that location.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Active Circles List - Only show if not fullscreen or as overlay */}
            {circles.length > 0 && !isFullscreen && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Active Catchment Zones</h3>
                    
                    {/* Filter Summary */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Showing: {selectedYearFilter === 'all' ? 'All Years' : `Year ${selectedYearFilter}`}
                                {showAverageZones && ' + Averages'}
                            </span>
                            <span className="text-gray-600">
                                {circles.filter(c => c.isVisible).length} visible / {circles.length} total zones
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {circles
                            .sort((a, b) => {
                                // Sort by school name first, then by year
                                if (a.schoolName !== b.schoolName) {
                                    return a.schoolName.localeCompare(b.schoolName);
                                }
                                return b.year - a.year; // Most recent first
                            })
                            .map((circle) => (
                            <div 
                                key={circle.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    circle.isVisible 
                                        ? 'bg-gray-50 border-gray-200' 
                                        : 'bg-gray-100 border-gray-300 opacity-60'
                                }`}
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
                                            onChange={(e) => setCustomColor(circle.id, e.target.value)}
                                            className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                                        >
                                            <optgroup label="Current Palette">
                                                {getCurrentPaletteColors().map((color: string) => (
                                                    <option key={color} value={color} style={{ backgroundColor: color }}>
                                                        {color}
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="All Colors">
                                                {availableColors.map(color => (
                                                    <option key={color} value={color} style={{ backgroundColor: color }}>
                                                        {color}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{circle.schoolName}</p>
                                        <p className="text-sm text-gray-600">
                                            {circle.radius} {circle.unit} - 
                                            {circle.year === 0 ? ' 5-Year Average' : ` ${circle.year}`}
                                            {circle.year === 0 && <span className="ml-1 text-yellow-600">📊</span>}
                                        </p>
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
                                    {circle.year !== 0 && ( // Don't allow removing average circles directly
                                        <button
                                            onClick={() => removeCircle(circle.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isFullscreen && (
                <>
                    {/* Sample Searches */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">� Try These School Areas</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'Primrose Hill, London', 
                                'Didsbury, Manchester', 
                                'Edgbaston, Birmingham', 
                                'Roundhay, Leeds', 
                                'SW3 2ER', // Chelsea area
                                'M20 2PN'  // Didsbury area
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
                        <div className="mt-3 pt-3 border-t border-gray-300">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2">📖 Quick Tutorial:</h5>
                            <ol className="text-xs text-gray-600 space-y-1">
                                <li>1. Search for an area or school location</li>
                                <li>2. Add schools to your favorites list (max 6)</li>
                                <li>3. Generate historical catchment data for each school</li>
                                <li>4. View average catchment areas and compare schools</li>
                                <li>5. Filter by specific years or view all together</li>
                            </ol>
                        </div>
                    </div>
                </>
            )}

            {/* Fullscreen Mode Tips Overlay */}
            {isFullscreen && (
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-4 py-3 rounded-lg text-sm max-w-md z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💡</span>
                        <span className="font-medium">Fullscreen Mode Tips:</span>
                    </div>
                    <ul className="text-xs space-y-1 text-gray-200">
                        <li>• Use mouse wheel to zoom in/out for detailed catchment analysis</li>
                        <li>• Drag to pan around and explore different areas</li>
                        <li>• Click on schools to see detailed catchment information</li>
                        <li>• Click anywhere on map to check catchment coverage</li>
                        <li>• Use the controls panel to manage your favorite schools</li>
                        <li>• Press <span className="bg-gray-600 px-1 rounded font-mono">ESC</span> to exit or <span className="bg-gray-600 px-1 rounded font-mono">F11</span> to toggle fullscreen</li>
                    </ul>
                </div>
            )}
        </div>
    );
}