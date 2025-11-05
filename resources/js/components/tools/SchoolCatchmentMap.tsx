import { useState, useEffect, useRef } from 'react';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import LineString from 'ol/geom/LineString';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { getDistance } from 'ol/sphere';
import { toast, ToastContainer } from 'react-toastify';
import SaveResultsButton from '@/components/SaveResultsButton';
import { favoriteSchoolsService } from '@/services/favoriteSchoolsService';

// Import modular components
import SchoolManagement from './catchment-map/SchoolManagement';
import CatchmentZoneControls from './catchment-map/CatchmentZoneControls';
import MapControls from './catchment-map/MapControls';
import CircleManagement from './catchment-map/CircleManagement';
import MapContainer, { MapContainerRef } from './catchment-map/MapContainer';

import 'ol/ol.css';
import 'react-toastify/dist/ReactToastify.css';

// Enhanced data models
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

interface RadiusCircle {
    id: string;
    center: [number, number];
    radius: number;
    unit: 'km' | 'miles' | 'meters';
    schoolName: string;
    year: number;
    color: string;
    olFeature?: Feature;
    isVisible: boolean;
    schoolId: string;
}

interface PinInfo {
    id: string;
    type: 'school' | 'location' | 'measurement';
    coordinates: [number, number];
    title: string;
    description?: string;
    schoolId?: string;
    isDraggable: boolean;
    feature?: Feature;
}

interface MapFormData {
    address: string;
    radius: string;
    unit: 'km' | 'miles' | 'meters';
    schoolName: string;
    selectedYear: number;
    selectedSchoolId: string;
    viewMode: 'all' | 'single-year';
    focusSchoolId: string;
    pinPlacementMode: 'off' | 'school' | 'location';
    coordinateInput: { lat: string; lng: string };
}

export default function SchoolCatchmentMap({ 
    isFullScreenMode = false, 
    initialData = null 
}: { 
    isFullScreenMode?: boolean; 
    initialData?: any; 
} = {}) {

    // Main state
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
    const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]);
    const [customPin, setCustomPin] = useState<[number, number] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isResizingMap, setIsResizingMap] = useState(false);
    const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>(new Date().getFullYear());
    const [favoriteSchools, setFavoriteSchools] = useState<School[]>([]);
    const [focusedSchoolId, setFocusedSchoolId] = useState<string>('');
    const [placedPins, setPlacedPins] = useState<PinInfo[]>([]);
    const [showCoordinateInput, setShowCoordinateInput] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);
    const [mobileControlsVisible, setMobileControlsVisible] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Refs
    const mapRef = useRef<MapContainerRef>(null);
    const measurementLineRef = useRef<Feature | null>(null);

    // Color palette system
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

    // Utility functions
    const convertToMeters = (radius: number, unit: 'km' | 'miles' | 'meters'): number => {
        if (isNaN(radius) || radius <= 0) {
            console.error('Invalid radius for conversion:', radius);
            return 1000;
        }
        
        switch (unit) {
            case 'km': return radius * 1000;
            case 'miles': return radius * 1609.344; // More precise conversion
            case 'meters': return radius;
            default: return radius * 1000;
        }
    };

    // Create accurate geographic circle using coordinate transformations
    const createGeographicCircle = (centerCoords: [number, number], radiusInMeters: number) => {
        // Convert center coordinates to Web Mercator projection
        const centerPoint = fromLonLat([centerCoords[1], centerCoords[0]]);
        
        // For better accuracy, we need to account for the projection distortion
        // Use the circumference formula to calculate the projected radius
        const lat = centerCoords[0] * Math.PI / 180; // Convert to radians
        const projectionScale = Math.cos(lat); // Scale factor for Web Mercator at this latitude
        const adjustedRadius = radiusInMeters / projectionScale;
        
        return new Circle(centerPoint, adjustedRadius);
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const favoriteSchoolsFromDB = await favoriteSchoolsService.getFavoriteSchools();
                if (favoriteSchoolsFromDB.length > 0) {
                    setFavoriteSchools(favoriteSchoolsFromDB);
                    
                    // Restore catchment circles
                    const catchmentCircles: RadiusCircle[] = [];
                    favoriteSchoolsFromDB.forEach(school => {
                        if (school.catchmentZones && Array.isArray(school.catchmentZones)) {
                            school.catchmentZones.forEach(zone => {
                                if (zone.id && zone.radius && zone.unit && zone.year && zone.color) {
                                    const radius = typeof zone.radius === 'string' ? parseFloat(zone.radius) : zone.radius;
                                    const radiusInMeters = convertToMeters(radius, zone.unit);
                                    
                                    // Create circle feature for OpenLayers with accurate geographic projection
                                    const circleGeometry = createGeographicCircle(school.coordinates, radiusInMeters);
                                    
                                    const circleFeature = new Feature({
                                        geometry: circleGeometry,
                                        name: `${school.name} - ${radius} ${zone.unit} (${zone.year})`,
                                        type: 'catchment-circle',
                                        circleId: zone.id,
                                    });

                                    circleFeature.setStyle(new Style({
                                        fill: new Fill({
                                            color: `${zone.color}55`,
                                        }),
                                        stroke: new Stroke({
                                            color: zone.color,
                                            width: 3,
                                        }),
                                    }));

                                    catchmentCircles.push({
                                        id: zone.id,
                                        center: school.coordinates,
                                        radius: radius,
                                        unit: zone.unit,
                                        schoolName: school.name,
                                        year: zone.year,
                                        color: zone.color,
                                        isVisible: zone.isVisible !== false,
                                        schoolId: school.id,
                                        olFeature: circleFeature
                                    });
                                }
                            });
                        }
                    });
                    
                    if (catchmentCircles.length > 0) {
                        setCircles(catchmentCircles);
                    }
                    
                    setSaveMessage({
                        type: 'success',
                        text: `✨ Loaded ${favoriteSchoolsFromDB.length} schools with ${catchmentCircles.length} catchment zones`
                    });
                    setTimeout(() => setSaveMessage(null), 5000);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setSaveMessage({
                    type: 'error',
                    text: 'Failed to load saved data'
                });
                setTimeout(() => setSaveMessage(null), 5000);
            }
        };

        loadData();
    }, []);

    // Ensure all circles have OpenLayers features
    useEffect(() => {
        setCircles(prev => prev.map(circle => {
            if (!circle.olFeature) {
                const radiusInMeters = convertToMeters(circle.radius, circle.unit);
                
                // Create circle feature for OpenLayers with accurate geographic projection
                const circleGeometry = createGeographicCircle(circle.center, radiusInMeters);
                
                const circleFeature = new Feature({
                    geometry: circleGeometry,
                    name: `${circle.schoolName} - ${circle.radius} ${circle.unit} (${circle.year})`,
                    type: 'catchment-circle',
                    circleId: circle.id,
                });

                circleFeature.setStyle(new Style({
                    fill: new Fill({
                        color: `${circle.color}55`,
                    }),
                    stroke: new Stroke({
                        color: circle.color,
                        width: 3,
                    }),
                }));

                return { ...circle, olFeature: circleFeature };
            }
            return circle;
        }));
    }, [circles.length]); // Only run when circle count changes to avoid infinite loops

    const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
        const point1 = fromLonLat([coord1[1], coord1[0]]);
        const point2 = fromLonLat([coord2[1], coord2[0]]);
        return getDistance(point1, point2);
    };

    const getColorForSchoolYear = (schoolId: string, year: number): string => {
        let palette: string[] = [];
        
        if (selectedColorPalette.type === 'schools') {
            const schoolPalettes = colorPalettes.schools;
            palette = schoolPalettes[selectedColorPalette.name as keyof typeof schoolPalettes] || [];
            const schoolIndex = favoriteSchools.findIndex(s => s.id === schoolId);
            return palette[schoolIndex % palette.length] || '#3B82F6';
        } else {
            const yearPalettes = colorPalettes.years;
            palette = yearPalettes[selectedColorPalette.name as keyof typeof yearPalettes] || [];
            const yearIndex = Math.abs(year - 2020) % palette.length;
            return palette[yearIndex] || '#3B82F6';
        }
    };

    // Address search
    const searchAddress = async () => {
        if (!formData.address.trim()) {
            setError('Please enter an address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Check if the input looks like coordinates (lat, lng format)
            const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
            const coordinateMatch = formData.address.trim().match(coordinatePattern);
            
            if (coordinateMatch) {
                // Handle direct coordinate input
                const coords = formData.address.split(',').map(coord => parseFloat(coord.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    const [lat, lng] = coords;
                    
                    // Validate coordinate ranges
                    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        const coordinates: [number, number] = [lat, lng];
                        // For coordinate searches, use a moderate zoom level
                        if (mapRef.current) {
                            mapRef.current.centerOn(coordinates, 15);
                        } else {
                            setMapCenter(coordinates);
                        }
                        setError('');
                        return;
                    } else {
                        setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
                        return;
                    }
                } else {
                    setError('Invalid coordinate format. Please use: latitude, longitude (e.g., 51.4994, -0.1244)');
                    return;
                }
            }

            // Regular address search using Nominatim
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
            
            // For address searches, use a moderate zoom level that's good for viewing the area
            if (mapRef.current) {
                mapRef.current.centerOn(coordinates, 15);
            } else {
                setMapCenter(coordinates);
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            setError('Failed to find address. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Pin placement functions
    const togglePinPlacementMode = (mode: 'off' | 'school' | 'location') => {
        setFormData(prev => ({ ...prev, pinPlacementMode: mode }));
        setMeasurementMode(false);
        setError('');
    };

    const placePinFromCoordinates = () => {
        const lat = parseFloat(formData.coordinateInput.lat);
        const lng = parseFloat(formData.coordinateInput.lng);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Please enter valid coordinates');
            return;
        }

        const coordinates: [number, number] = [lat, lng];
        const title = formData.pinPlacementMode === 'school' ? 'Precise School Location' : 'Custom Location';
        
        placePinAtCoordinates(coordinates, formData.pinPlacementMode as 'school' | 'location', title);
        
        setFormData(prev => ({ 
            ...prev, 
            coordinateInput: { lat: '', lng: '' },
            pinPlacementMode: 'off'
        }));
        setShowCoordinateInput(false);
        setError('');

        if (mapRef.current) {
            mapRef.current.centerOn(coordinates, 16);
        }
    };

    const placePinAtCoordinates = (coordinates: [number, number], type: 'school' | 'location' | 'measurement', title: string, schoolId?: string) => {
        const pinId = `${type}-${Date.now()}`;
        const color = type === 'school' ? '#3B82F6' : type === 'location' ? '#EF4444' : '#F59E0B';
        
        const pinFeature = new Feature({
            geometry: new Point(fromLonLat([coordinates[1], coordinates[0]])),
            name: title,
            type: `${type}-pin`,
            pinId: pinId,
        });

        pinFeature.setStyle(new Style({
            image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: color }),
                stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
            text: new Text({
                text: type === 'school' ? '🏫' : type === 'location' ? '📍' : '📏',
                font: '14px sans-serif',
                offsetY: -20,
            }),
        }));

        const pinInfo: PinInfo = {
            id: pinId,
            type: type,
            coordinates: coordinates,
            title: title,
            schoolId: schoolId,
            isDraggable: true,
            feature: pinFeature
        };

        setPlacedPins(prev => [...prev, pinInfo]);
        return pinInfo;
    };

    const removePin = (pinId: string) => {
        setPlacedPins(prev => prev.filter(p => p.id !== pinId));
    };

    const assignPinToSchool = (pinId: string, schoolId: string) => {
        const pin = placedPins.find(p => p.id === pinId);
        const school = favoriteSchools.find(s => s.id === schoolId);
        
        if (pin && school) {
            setFavoriteSchools(prev => prev.map(s =>
                s.id === schoolId
                    ? { ...s, coordinates: pin.coordinates }
                    : s
            ));

            setPlacedPins(prev => prev.map(p =>
                p.id === pinId
                    ? { ...p, schoolId: schoolId, title: `${school.name} - Precise Location` }
                    : p
            ));

            // Update circle centers
            setCircles(prev => prev.map(circle =>
                circle.schoolId === schoolId
                    ? { ...circle, center: pin.coordinates }
                    : circle
            ));
        }
    };

    // Catchment zone management
    const addCatchmentZone = async () => {
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

        const centerCoords = selectedSchool.coordinates;
        const zoneColor = getColorForSchoolYear(selectedSchool.id, formData.selectedYear);

        const newZone: CatchmentZone = {
            id: `${selectedSchool.id}-${formData.selectedYear}`,
            year: formData.selectedYear,
            radius: radius,
            unit: formData.unit,
            color: zoneColor,
            isVisible: true
        };

        const updatedZones = [...selectedSchool.catchmentZones.filter(z => z.year !== formData.selectedYear), newZone];
        const updatedSchool = { ...selectedSchool, catchmentZones: updatedZones };

        try {
            const saveResult = await favoriteSchoolsService.updateFavoriteSchool(updatedSchool);
            if (!saveResult.success) {
                setError(saveResult.message || 'Failed to save catchment zone');
                return;
            }
        } catch (error) {
            console.error('Error saving catchment zone:', error);
            setError('Failed to save catchment zone');
            return;
        }

        setFavoriteSchools(prev => prev.map(school => 
            school.id === selectedSchool.id ? updatedSchool : school
        ));

        const radiusInMeters = convertToMeters(radius, formData.unit);
        
        // Create circle feature for OpenLayers with accurate geographic projection
        const circleGeometry = createGeographicCircle(centerCoords, radiusInMeters);
        
        const circleFeature = new Feature({
            geometry: circleGeometry,
            name: `${selectedSchool.name} - ${radius} ${formData.unit} (${formData.selectedYear})`,
            type: 'catchment-circle',
            circleId: newZone.id,
        });

        circleFeature.setStyle(new Style({
            fill: new Fill({
                color: `${zoneColor}55`,
            }),
            stroke: new Stroke({
                color: zoneColor,
                width: 3,
            }),
        }));

        const newCircle: RadiusCircle = {
            id: newZone.id,
            center: centerCoords,
            radius: radius,
            unit: formData.unit,
            schoolName: selectedSchool.name,
            year: formData.selectedYear,
            color: zoneColor,
            olFeature: circleFeature,
            isVisible: true,
            schoolId: selectedSchool.id
        };

        setCircles(prev => [...prev.filter(c => c.id !== newZone.id), newCircle]);
        
        // Auto-center map on the school
        if (mapRef.current) {
            let zoomLevel = 13;
            if (radiusInMeters < 500) zoomLevel = 16;
            else if (radiusInMeters < 1000) zoomLevel = 15;
            else if (radiusInMeters < 2000) zoomLevel = 14;
            else if (radiusInMeters > 5000) zoomLevel = 12;
            
            mapRef.current.centerOn(centerCoords, zoomLevel);
        }
        
        setError('');
        setSaveMessage({
            type: 'success',
            text: 'Catchment zone saved successfully!'
        });
        setTimeout(() => setSaveMessage(null), 3000);
    };

    const removeCircle = async (id: string) => {
        const circleToRemove = circles.find(circle => circle.id === id);
        if (!circleToRemove) return;

        const school = favoriteSchools.find(s => s.id === circleToRemove.schoolId);
        if (school) {
            const updatedZones = school.catchmentZones.filter(z => z.id !== id);
            const updatedSchool = { ...school, catchmentZones: updatedZones };

            try {
                const saveResult = await favoriteSchoolsService.updateFavoriteSchool(updatedSchool);
                if (saveResult.success) {
                    setFavoriteSchools(prev => prev.map(s => 
                        s.id === school.id ? updatedSchool : s
                    ));
                    
                    setSaveMessage({
                        type: 'success',
                        text: 'Catchment zone removed successfully!'
                    });
                    setTimeout(() => setSaveMessage(null), 3000);
                }
            } catch (error) {
                console.error('Error removing catchment zone:', error);
                setSaveMessage({
                    type: 'error',
                    text: 'Failed to remove catchment zone'
                });
                setTimeout(() => setSaveMessage(null), 3000);
                return;
            }
        }

        setCircles(prev => prev.filter(circle => circle.id !== id));
    };

    // Reverse geocoding function to convert coordinates to address
    const reverseGeocode = async (coordinate: [number, number]) => {
        try {
            // Add a small delay to prevent too many rapid requests
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate[0]}&lon=${coordinate[1]}&countrycodes=gb&addressdetails=1&zoom=18`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && data.display_name) {
                // Clean up the display name for better readability
                let address = data.display_name;
                
                // If we have structured address data, try to format it nicely
                if (data.address) {
                    const addr = data.address;
                    const parts = [];
                    
                    // Add house number and road
                    if (addr.house_number && addr.road) {
                        parts.push(`${addr.house_number} ${addr.road}`);
                    } else if (addr.road) {
                        parts.push(addr.road);
                    }
                    
                    // Add locality information
                    if (addr.suburb) parts.push(addr.suburb);
                    else if (addr.neighbourhood) parts.push(addr.neighbourhood);
                    else if (addr.hamlet) parts.push(addr.hamlet);
                    
                    // Add town/city
                    if (addr.town) parts.push(addr.town);
                    else if (addr.city) parts.push(addr.city);
                    else if (addr.village) parts.push(addr.village);
                    
                    // Add postcode
                    if (addr.postcode) parts.push(addr.postcode);
                    
                    if (parts.length > 0) {
                        address = parts.join(', ');
                    }
                }
                
                return address;
            } else {
                // Fallback to simple coordinate format that search can understand
                return `${coordinate[0].toFixed(6)}, ${coordinate[1].toFixed(6)}`;
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Fallback to simple coordinate format that search can understand
            return `${coordinate[0].toFixed(6)}, ${coordinate[1].toFixed(6)}`;
        }
    };

    // Map event handlers
    const handleMapClick = async (coordinate: [number, number]) => {
        // Always set the custom pin for visual feedback
        setCustomPin(coordinate);
        
        // Show loading state in address field
        setFormData(prev => ({ ...prev, address: '� Looking up address...' }));
        setMapCenter(coordinate);
        
        // Perform reverse geocoding to get address and update the search field
        try {
            const address = await reverseGeocode(coordinate);
            setFormData(prev => ({ ...prev, address: address }));
        } catch (error) {
            console.error('Failed to get address for clicked location:', error);
            // Fallback: use simple coordinates format that search can handle
            const coordsString = `${coordinate[0].toFixed(6)}, ${coordinate[1].toFixed(6)}`;
            setFormData(prev => ({ ...prev, address: coordsString }));
        }

        // Handle pin placement modes
        if (formData.pinPlacementMode === 'school') {
            const title = formData.schoolName || 'New School Location';
            placePinAtCoordinates(coordinate, 'school', title);
            togglePinPlacementMode('off');
        } else if (formData.pinPlacementMode === 'location') {
            placePinAtCoordinates(coordinate, 'location', 'Custom Location');
            togglePinPlacementMode('off');
        }
    };

    const handleMeasurementClick = (coordinate: [number, number]) => {
        setMeasurementPoints(prev => {
            const newPoints = [...prev, coordinate];
            if (newPoints.length === 2) {
                const distance = calculateDistance(newPoints[0], newPoints[1]);
                const convertedDistance = distance / 1000; // Convert to km
                const displayDistance = formData.unit === 'meters' ? 
                    (convertedDistance * 1000).toFixed(0) : 
                    convertedDistance.toFixed(3);
                
                placePinAtCoordinates(newPoints[0], 'measurement', `Point A`);
                placePinAtCoordinates(newPoints[1], 'measurement', `Point B - Distance: ${displayDistance} ${formData.unit}`);
                
                // Add measurement line (handled by MapContainer)
                setMeasurementMode(false);
                return [];
            }
            return newPoints;
        });
    };

    // View mode functions
    const focusOnSchool = (schoolId: string) => {
        setFocusedSchoolId(schoolId);
        
        if (schoolId) {
            const school = favoriteSchools.find(s => s.id === schoolId);
            if (school && mapRef.current) {
                mapRef.current.centerOn(school.coordinates, 14);
            }
        }
    };

    const focusOnCircle = (circleId: string) => {
        const circle = circles.find(c => c.id === circleId);
        if (!circle) return;

        // Center the map on the circle's center (school location)
        if (mapRef.current) {
            // Calculate appropriate zoom level based on circle radius
            let zoomLevel = 14;
            const radiusInMeters = convertToMeters(circle.radius, circle.unit);
            
            if (radiusInMeters < 500) zoomLevel = 16;
            else if (radiusInMeters < 1000) zoomLevel = 15;
            else if (radiusInMeters < 2000) zoomLevel = 14;
            else if (radiusInMeters < 5000) zoomLevel = 13;
            else zoomLevel = 12;

            mapRef.current.centerOn(circle.center, zoomLevel);
        }

        // Update the map center state to show the location marker
        setMapCenter(circle.center);
        
        // Update address field with school info
        setFormData(prev => ({ 
            ...prev, 
            address: `${circle.schoolName} - ${circle.radius} ${circle.unit} catchment (${circle.year})`
        }));

        // Set custom pin for visual feedback
        setCustomPin(circle.center);

        // Show success message
        setSaveMessage({
            type: 'success',
            text: `📍 Focused on ${circle.schoolName} catchment zone`
        });
        setTimeout(() => setSaveMessage(null), 3000);
    };

    const toggleCircleVisibility = async (id: string) => {
        const circle = circles.find(c => c.id === id);
        if (!circle) return;

        // Update local state immediately for responsive UI
        setCircles(prev => prev.map(c => 
            c.id === id ? { ...c, isVisible: !c.isVisible } : c
        ));

        // Update the corresponding school's catchment zone data
        const school = favoriteSchools.find(s => s.id === circle.schoolId);
        if (school) {
            const updatedZones = school.catchmentZones.map(zone => 
                zone.id === id ? { ...zone, isVisible: !zone.isVisible } : zone
            );
            const updatedSchool = { ...school, catchmentZones: updatedZones };

            try {
                const saveResult = await favoriteSchoolsService.updateFavoriteSchool(updatedSchool);
                if (saveResult.success) {
                    // Update the local school state
                    setFavoriteSchools(prev => prev.map(s => 
                        s.id === school.id ? updatedSchool : s
                    ));
                } else {
                    // Revert local state if save failed
                    setCircles(prev => prev.map(c => 
                        c.id === id ? { ...c, isVisible: !c.isVisible } : c
                    ));
                    setSaveMessage({
                        type: 'error',
                        text: 'Failed to save visibility change'
                    });
                    setTimeout(() => setSaveMessage(null), 3000);
                }
            } catch (error) {
                console.error('Error updating circle visibility:', error);
                // Revert local state if save failed
                setCircles(prev => prev.map(c => 
                    c.id === id ? { ...c, isVisible: !c.isVisible } : c
                ));
                setSaveMessage({
                    type: 'error',
                    text: 'Error saving visibility change'
                });
                setTimeout(() => setSaveMessage(null), 3000);
            }
        }
    };

    const changeCircleColor = async (id: string, newColor: string) => {
        const circle = circles.find(c => c.id === id);
        if (!circle) return;

        // Update local state immediately for responsive UI
        setCircles(prev => prev.map(c => 
            c.id === id ? { ...c, color: newColor } : c
        ));

        // Update the corresponding school's catchment zone data
        const school = favoriteSchools.find(s => s.id === circle.schoolId);
        if (school) {
            const updatedZones = school.catchmentZones.map(zone => 
                zone.id === id ? { ...zone, color: newColor } : zone
            );
            const updatedSchool = { ...school, catchmentZones: updatedZones };

            try {
                const saveResult = await favoriteSchoolsService.updateFavoriteSchool(updatedSchool);
                if (saveResult.success) {
                    // Update the local school state
                    setFavoriteSchools(prev => prev.map(s => 
                        s.id === school.id ? updatedSchool : s
                    ));
                    setSaveMessage({
                        type: 'success',
                        text: 'Color updated successfully!'
                    });
                    setTimeout(() => setSaveMessage(null), 2000);
                } else {
                    // Revert local state if save failed
                    setCircles(prev => prev.map(c => 
                        c.id === id ? { ...c, color: circle.color } : c
                    ));
                    setSaveMessage({
                        type: 'error',
                        text: 'Failed to save color change'
                    });
                    setTimeout(() => setSaveMessage(null), 3000);
                }
            } catch (error) {
                console.error('Error updating circle color:', error);
                // Revert local state if save failed
                setCircles(prev => prev.map(c => 
                    c.id === id ? { ...c, color: circle.color } : c
                ));
                setSaveMessage({
                    type: 'error',
                    text: 'Error saving color change'
                });
                setTimeout(() => setSaveMessage(null), 3000);
            }
        }
    };

    const applyPaletteToAll = (paletteType: 'schools' | 'years', paletteName: string) => {
        setSelectedColorPalette({ type: paletteType, name: paletteName });
        
        let palette: string[] = [];
        if (paletteType === 'schools') {
            palette = colorPalettes.schools[paletteName as keyof typeof colorPalettes.schools] || [];
        } else {
            palette = colorPalettes.years[paletteName as keyof typeof colorPalettes.years] || [];
        }

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

    const clearAll = async () => {
        if (!confirm('Are you sure you want to clear all data?')) {
            return;
        }

        const clearPromises = favoriteSchools.map(school => 
            favoriteSchoolsService.removeFavoriteSchool(school.id)
        );
        
        try {
            await Promise.all(clearPromises);
        } catch (error) {
            console.error('Error clearing data:', error);
        }

        setCircles([]);
        setSchools([]);
        setFavoriteSchools([]);
        setCustomPin(null);
        setPlacedPins([]);
        setError('');
        setSaveMessage(null);
    };

    const canSaveData = () => {
        return favoriteSchools.length > 0 || circles.length > 0;
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsResizingMap(true);
        setIsFullscreen(!isFullscreen);
        
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.updateSize();
            }
            setIsResizingMap(false);
        }, 300);
    };

    // Form data helpers
    const handleInputChange = (field: keyof MapFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const getCalculationResults = () => {
        return {
            searchedAddress: formData.address || '',
            mapCenter: mapCenter,
            schools: schools,
            favoriteSchools: favoriteSchools,
            circles: circles,
            customPin: customPin,
            placedPins: placedPins,
            statistics: {
                totalCircles: circles.length,
                totalSchools: schools.length,
                totalFavoriteSchools: favoriteSchools.length,
                totalPins: placedPins.length,
            }
        };
    };

    return (
        <div className={`bg-white transition-all duration-300 ${
            isFullscreen 
                ? 'fixed inset-0 z-50 flex flex-col h-screen w-screen' 
                : 'rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 lg:p-8'
        }`}>
            <ToastContainer />
            
            {/* Fullscreen Branding Bar */}
            {isFullscreen && (
                <div className="bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] px-4 py-2 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                                <span className="text-[#00BCD4] font-bold text-lg">🏠</span>
                            </div>
                            <span className="text-white font-bold text-lg">Moovey</span>
                        </div>
                        <div className="hidden sm:block w-px h-6 bg-white/30"></div>
                        <span className="text-white/90 text-sm font-medium hidden sm:block">School Catchment Analysis Tool</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                        <span className="hidden md:inline">Press ESC to exit fullscreen</span>
                        <span className="md:hidden">ESC to exit</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={`flex justify-between items-center ${isFullscreen ? 'mb-4 px-4 py-3 bg-gray-50/80 border-b border-gray-200' : 'mb-6'}`}>
                <div className="flex items-center gap-3">
                    {!isFullscreen && (
                        <h2 className="text-2xl font-bold text-gray-900">🏫 School Catchment Analysis</h2>
                    )}
                    {isFullscreen && (
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">🏫 Catchment Analysis</h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#00BCD4]/10 text-[#00BCD4] border border-[#00BCD4]/20 rounded-full text-sm font-medium">
                                <span className="text-base">🖥️</span>
                                <span>Full Screen Mode</span>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3">
                    {isFullscreen && (
                        <div className="text-sm text-gray-600 hidden sm:block">
                            Press <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs font-mono">ESC</kbd> to exit
                        </div>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen for Better View'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm font-medium ${
                            isFullscreen 
                                ? 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                        }`}
                    >
                        <span className="text-lg">{isFullscreen ? '❌' : '⛶'}</span>
                        <span className="text-sm font-semibold tracking-wide">
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                        </span>
                    </button>
                </div>
            </div>

            <div className={`${isFullscreen ? 'flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50/30' : 'space-y-4 sm:space-y-6'}`}>
                {/* Controls Panel */}
                <div className={`${
                    isFullscreen 
                        ? 'w-full lg:w-80 xl:w-96 2xl:w-[28rem] flex-shrink-0 overflow-y-auto px-3 sm:px-4 lg:pr-6 bg-white lg:border-r border-gray-200 lg:shadow-sm' 
                        : 'w-full'
                }`}>
                    {/* Mobile Controls Toggle */}
                    {isFullscreen && (
                        <div className="lg:hidden mb-3">
                            <button
                                onClick={() => setMobileControlsVisible(!mobileControlsVisible)}
                                className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700"
                            >
                                <span>🎛️ Controls & Tools</span>
                                <span className={`transform transition-transform ${mobileControlsVisible ? 'rotate-180' : ''}`}>⌄</span>
                            </button>
                        </div>
                    )}
                    
                    {/* Controls Content */}
                    <div className={`${isFullscreen ? `lg:block ${mobileControlsVisible ? 'block' : 'hidden'}` : 'block'}`}>
                        <div className="space-y-4">
                            {/* School Management */}
                            <SchoolManagement
                                favoriteSchools={favoriteSchools}
                                setFavoriteSchools={setFavoriteSchools}
                                schoolName={formData.schoolName}
                                setSchoolName={(name) => handleInputChange('schoolName', name)}
                                address={formData.address}
                                setAddress={(address) => handleInputChange('address', address)}
                                customPin={customPin}
                                mapCenter={mapCenter}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                error={error}
                                setError={setError}
                                onSaveMessage={(message) => setSaveMessage(message)}
                                onAddressSearch={searchAddress}
                                pinPlacementMode={formData.pinPlacementMode}
                                onTogglePinPlacement={togglePinPlacementMode}
                                isFullscreen={isFullscreen}
                            />

                            {/* Catchment Zone Controls */}
                            <CatchmentZoneControls
                                favoriteSchools={favoriteSchools}
                                selectedSchoolId={formData.selectedSchoolId}
                                setSelectedSchoolId={(id) => handleInputChange('selectedSchoolId', id)}
                                radius={formData.radius}
                                setRadius={(radius) => handleInputChange('radius', radius)}
                                unit={formData.unit}
                                setUnit={(unit) => handleInputChange('unit', unit)}
                                selectedYear={formData.selectedYear}
                                setSelectedYear={(year) => handleInputChange('selectedYear', year)}
                                onAddCatchmentZone={addCatchmentZone}
                                error={error}
                                isFullscreen={isFullscreen}
                            />

                            {/* Map Controls */}
                            <MapControls
                                address={formData.address}
                                setAddress={(address) => handleInputChange('address', address)}
                                onAddressSearch={searchAddress}
                                isLoading={isLoading}
                                pinPlacementMode={formData.pinPlacementMode}
                                onTogglePinPlacement={togglePinPlacementMode}
                                measurementMode={measurementMode}
                                setMeasurementMode={setMeasurementMode}
                                showCoordinateInput={showCoordinateInput}
                                setShowCoordinateInput={setShowCoordinateInput}
                                coordinateInput={formData.coordinateInput}
                                setCoordinateInput={(coords) => setFormData(prev => ({...prev, coordinateInput: coords}))}
                                onPlacePinFromCoordinates={placePinFromCoordinates}
                                onClearAll={clearAll}
                                canSaveData={canSaveData}
                                placedPins={placedPins}
                                onRemovePin={removePin}
                                favoriteSchools={favoriteSchools}
                                onAssignPinToSchool={assignPinToSchool}
                                error={error}
                                isFullscreen={isFullscreen}
                            />

                            {/* Circle Management */}
                            <CircleManagement
                                circles={circles}
                                favoriteSchools={favoriteSchools}
                                selectedYearFilter={selectedYearFilter}
                                setSelectedYearFilter={setSelectedYearFilter}
                                focusedSchoolId={focusedSchoolId}
                                onFocusOnSchool={focusOnSchool}
                                onToggleCircleVisibility={toggleCircleVisibility}
                                onRemoveCircle={removeCircle}
                                onChangeCircleColor={changeCircleColor}
                                onApplyPaletteToAll={applyPaletteToAll}
                                onFocusOnCircle={focusOnCircle}
                                selectedColorPalette={selectedColorPalette}
                                colorPalettes={colorPalettes}
                                isFullscreen={isFullscreen}
                            />
                        </div>

                        {/* Save Results Button */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <SaveResultsButton
                                toolType="school-catchment"
                                results={getCalculationResults()}
                                formData={formData}
                                onSaveComplete={(success, message) => setSaveMessage({
                                    type: success ? 'success' : 'error',
                                    text: message
                                })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className={`${
                    isFullscreen 
                        ? 'flex-1 flex flex-col' 
                        : 'w-full'
                }`}>
                    <MapContainer
                        ref={mapRef}
                        mapCenter={mapCenter}
                        favoriteSchools={favoriteSchools}
                        circles={circles}
                        customPin={customPin}
                        placedPins={placedPins}
                        isFullscreen={isFullscreen}
                        isResizingMap={isResizingMap}
                        onMapClick={handleMapClick}
                        formData={formData}
                        measurementMode={measurementMode}
                        onMeasurementClick={handleMeasurementClick}
                        onCircleClick={focusOnCircle}
                    />
                </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg max-w-sm ${
                    saveMessage.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    <div className="text-sm font-medium">{saveMessage.text}</div>
                </div>
            )}
        </div>
    );
}