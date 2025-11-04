import { useState, useEffect, useRef } from 'react';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import LineString from 'ol/geom/LineString';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { getDistance } from 'ol/sphere';
import { NodeSelection } from 'prosemirror-state';
import { toast, ToastContainer } from 'react-toastify';
import SaveResultsButton from '@/components/SaveResultsButton';
import { favoriteSchoolsService } from '@/services/favoriteSchoolsService';

// Import new modular components
import SchoolManagement from './catchment-map/SchoolManagement';
import CatchmentZoneControls from './catchment-map/CatchmentZoneControls';
import MapControls from './catchment-map/MapControls';
import CircleManagement from './catchment-map/CircleManagement';
import MapContainer, { MapContainerRef } from './catchment-map/MapContainer';

import 'ol/ol.css';
import 'react-toastify/dist/ReactToastify.css';

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
    radius: string;
    unit: 'km' | 'miles' | 'meters';
    schoolName: string;
    selectedYear: number;
    selectedSchoolId: string;
    viewMode: 'all' | 'single-year' | 'average' | 'comparison';
    focusSchoolId: string;
    pinPlacementMode: 'off' | 'school' | 'location';
    coordinateInput: { lat: string; lng: string };
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

export default function SchoolCatchmentMap({ 
    isFullScreenMode = false, 
    initialData = null 
}: { 
    isFullScreenMode?: boolean; 
    initialData?: any; 
} = {}) {
    // Verification log to confirm OpenLayers version is loading
    console.log('🗺️ SchoolCatchmentMap: OpenLayers version loaded successfully');
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
    const [favoriteSchools, setFavoriteSchools] = useState<School[]>([]);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [focusedSchoolId, setFocusedSchoolId] = useState<string>('');
    const [showOverlapAreas, setShowOverlapAreas] = useState(false);
    const [streetLayerVisible, setStreetLayerVisible] = useState(true);
    const [placedPins, setPlacedPins] = useState<PinInfo[]>([]);
    const [selectedPinForSchool, setSelectedPinForSchool] = useState<string>('');
    const [showCoordinateInput, setShowCoordinateInput] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);
    const [mobileControlsVisible, setMobileControlsVisible] = useState(false);
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const mapRef = useRef<Map | null>(null);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    
    // OpenLayers specific refs
    const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const vectorSourceRef = useRef<VectorSource | null>(null);
    const popupRef = useRef<Overlay | null>(null);
    const popupElementRef = useRef<HTMLDivElement | null>(null);
    const measurementLineRef = useRef<Feature | null>(null);
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
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
    const [customColors, setCustomColors] = useState<{[key: string]: string}>({});
    const [schoolColorSchemes, setSchoolColorSchemes] = useState<{[schoolId: string]: string[]}>({});
    
    // localStorage keys for persistence
    const STORAGE_KEYS = {
        placedPins: 'schoolCatchment_placedPins',
        formData: 'schoolCatchment_formData'
    };

    // Load data from localStorage and database on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingFavorites(true);
                const favoriteSchoolsFromDB = await favoriteSchoolsService.getFavoriteSchools();
                
                const savedPlacedPins = localStorage.getItem(STORAGE_KEYS.placedPins);
                const savedFormData = localStorage.getItem(STORAGE_KEYS.formData);
                
                let restoredItems = [];
                
                if (favoriteSchoolsFromDB.length > 0) {
                    setFavoriteSchools(favoriteSchoolsFromDB);
                    restoredItems.push(`${favoriteSchoolsFromDB.length} favorite school${favoriteSchoolsFromDB.length > 1 ? 's' : ''}`);
                    
                    const catchmentCircles: any[] = [];
                    favoriteSchoolsFromDB.forEach(school => {
                        if (school.catchmentZones && Array.isArray(school.catchmentZones)) {
                            school.catchmentZones.forEach(zone => {
                                if (zone.id && zone.radius && zone.unit && zone.year && zone.color) {
                                    const circle = {
                                        id: zone.id,
                                        center: school.coordinates,
                                        radius: typeof zone.radius === 'string' ? parseFloat(zone.radius) : zone.radius,
                                        unit: zone.unit,
                                        schoolName: school.name,
                                        year: zone.year,
                                        color: zone.color,
                                        isVisible: zone.isVisible !== false,
                                        schoolId: school.id
                                    };
                                    catchmentCircles.push(circle);
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
                
                if (restoredItems.length > 0) {
                    setSaveMessage({
                        type: 'success',
                        text: `✨ Restored your previous session: ${restoredItems.join(', ')}`
                    });
                    setTimeout(() => setSaveMessage(null), 5000);
                }
                
                localStorage.removeItem('schoolCatchment_circles');
            } catch (error) {
                console.warn('Error loading data:', error);
                Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
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

    // Save placed pins to localStorage
    useEffect(() => {
        if (placedPins.length > 0) {
            localStorage.setItem(STORAGE_KEYS.placedPins, JSON.stringify(placedPins));
        } else {
            localStorage.removeItem(STORAGE_KEYS.placedPins);
        }
    }, [placedPins]);

    // Save form data to localStorage
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

    // Create popup element for OpenLayers
    useEffect(() => {
        if (!popupElementRef.current) {
            popupElementRef.current = document.createElement('div');
            popupElementRef.current.className = 'ol-popup';
            popupElementRef.current.style.cssText = `
                background: white;
                color: #1f2937;
                padding: 12px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border: 1px solid #d1d5db;
                max-width: 280px;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
                position: relative;
                z-index: 1000;
            `;
        }
    }, []);

    // Initialize OpenLayers map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const vectorSource = new VectorSource();
        vectorSourceRef.current = vectorSource;

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });
        vectorLayerRef.current = vectorLayer;

        const baseLayer = new TileLayer({
            source: new OSM(),
        });

        const map = new Map({
            target: mapContainerRef.current,
            layers: [baseLayer, vectorLayer],
            view: new View({
                center: fromLonLat([mapCenter[1], mapCenter[0]]),
                zoom: 13,
            }),
        });

        if (popupElementRef.current) {
            const popup = new Overlay({
                element: popupElementRef.current,
                autoPan: true,
            });
            map.addOverlay(popup);
            popupRef.current = popup;
        }

        // Add click handler
        map.on('click', (event) => {
            const coordinate = event.coordinate;
            const lonLat = toLonLat(coordinate);
            const clickedPoint: [number, number] = [lonLat[1], lonLat[0]];
            
            if (formData.pinPlacementMode === 'school') {
                const title = formData.schoolName || 'New School Location';
                setCustomPin(clickedPoint);
                placePinAtCoordinates(clickedPoint, 'school', title);
                togglePinPlacementMode('off');
                return;
            } else if (formData.pinPlacementMode === 'location') {
                placePinAtCoordinates(clickedPoint, 'location', 'Custom Location');
                togglePinPlacementMode('off');
                return;
            } else if (measurementMode) {
                setMeasurementPoints(prev => {
                    const newPoints = [...prev, clickedPoint];
                    if (newPoints.length === 2) {
                        const distance = calculateDistance(newPoints[0], newPoints[1]);
                        const convertedDistance = convertRadius(distance / 1000, 'km', formData.unit);
                        const displayDistance = formData.unit === 'meters' ? 
                            convertedDistance.toFixed(0) : 
                            convertedDistance.toFixed(3);
                        
                        placePinAtCoordinates(newPoints[0], 'measurement', `Point A`);
                        placePinAtCoordinates(newPoints[1], 'measurement', `Point B - Distance: ${displayDistance} ${formData.unit}`);
                        
                        if (measurementLineRef.current && vectorSourceRef.current) {
                            vectorSourceRef.current.removeFeature(measurementLineRef.current);
                        }
                        
                        const lineFeature = new Feature({
                            geometry: new LineString([
                                fromLonLat([newPoints[0][1], newPoints[0][0]]),
                                fromLonLat([newPoints[1][1], newPoints[1][0]])
                            ]),
                        });
                        
                        lineFeature.setStyle(new Style({
                            stroke: new Stroke({
                                color: '#FF6B35',
                                width: 3,
                                lineDash: [5, 10],
                            }),
                        }));
                        
                        vectorSource.addFeature(lineFeature);
                        measurementLineRef.current = lineFeature;
                        
                        setMeasurementMode(false);
                        return [];
                    }
                    return newPoints;
                });
                return;
            }
            
            const schoolsInRange = checkPointInCatchment(clickedPoint);
            
            let popupContent = `
                <div style="color: #1f2937; font-weight: 600; font-size: 15px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>📍</span>
                    <span>Location Analysis</span>
                </div>
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 10px; font-family: monospace;">
                    ${clickedPoint[0].toFixed(6)}, ${clickedPoint[1].toFixed(6)}
                </div>
            `;
            
            if (schoolsInRange.length > 0) {
                popupContent += `
                    <div style="color: #059669; font-weight: 600; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                        <span>✅</span>
                        <span>Within catchment of:</span>
                    </div>
                `;
                schoolsInRange.forEach(schoolId => {
                    const school = favoriteSchools.find(s => s.id === schoolId);
                    if (school) {
                        const distance = calculateDistance(clickedPoint, school.coordinates);
                        const convertedDistance = convertRadius(distance / 1000, 'km', formData.unit);
                        const displayDistance = formData.unit === 'meters' ? 
                            convertedDistance.toFixed(0) : 
                            convertedDistance.toFixed(2);
                        popupContent += `
                            <div style="color: #374151; margin-left: 12px; margin-bottom: 4px; font-size: 13px;">
                                • <strong>${school.name}</strong><br/>
                                <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">${displayDistance} ${formData.unit} away</span>
                            </div>
                        `;
                    }
                });
            } else {
                popupContent += `
                    <div style="color: #dc2626; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                        <span>❌</span>
                        <span>Not within any favorite school catchments</span>
                    </div>
                `;
            }
            
            if (popupRef.current && popupElementRef.current) {
                popupElementRef.current.innerHTML = popupContent;
                popupRef.current.setPosition(coordinate);
            }
            
            if (formData.pinPlacementMode === 'off') {
                setCustomPin(clickedPoint);
            }
        });

        mapRef.current = map;
        setMapInitialized(true);

        return () => {
            if (mapRef.current) {
                mapRef.current.setTarget(undefined);
                mapRef.current = null;
            }
        };
    }, []);

    // Recreate OpenLayers features for restored circles that don't have olFeature
    useEffect(() => {
        if (!mapRef.current || !mapInitialized || !vectorSourceRef.current) return;

        setCircles(prevCircles => {
            return prevCircles.map(circle => {
                if (!circle.olFeature) {
                    console.log('Creating OpenLayers circle for:', circle);
                    
                    const radiusInMeters = convertToMeters(circle.radius, circle.unit);
                    console.log('OpenLayers circle radius in meters:', radiusInMeters);
                    
                    const circleFeature = new Feature({
                        geometry: new Circle(
                            fromLonLat([circle.center[1], circle.center[0]]),
                            radiusInMeters
                        ),
                        name: `${circle.schoolName} - ${circle.radius} ${circle.unit} (${circle.year})`,
                        type: 'catchment-circle',
                        circleId: circle.id,
                    });

                    circleFeature.setStyle(new Style({
                        fill: new Fill({
                            color: circle.isVisible ? `${circle.color}55` : 'transparent', // Increased opacity
                        }),
                        stroke: new Stroke({
                            color: circle.isVisible ? circle.color : 'transparent',
                            width: circle.isVisible ? 3 : 0, // Increased width and better visibility logic
                        }),
                    }));
                    
                    console.log('Restored circle visibility:', {
                        id: circle.id,
                        isVisible: circle.isVisible,
                        color: circle.color,
                        radiusInMeters
                    });

                    if (circle.isVisible && vectorSourceRef.current) {
                        vectorSourceRef.current.addFeature(circleFeature);
                    }

                    return {
                        ...circle,
                        olFeature: circleFeature
                    };
                }
                return circle;
            });
        });
    }, [mapInitialized]);

    // Update map center when coordinates change
    useEffect(() => {
        if (mapRef.current && mapInitialized && vectorSourceRef.current) {
            mapRef.current.getView().setCenter(fromLonLat([mapCenter[1], mapCenter[0]]));
            mapRef.current.getView().setZoom(13);
            
            const existingMarker = vectorSourceRef.current.getFeatures().find(f => f.get('type') === 'location-marker');
            if (existingMarker) {
                vectorSourceRef.current.removeFeature(existingMarker);
            }
            
            const markerFeature = new Feature({
                geometry: new Point(fromLonLat([mapCenter[1], mapCenter[0]])),
                name: formData.address || 'Selected Location',
                type: 'location-marker',
            });

            markerFeature.setStyle(new Style({
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({ color: '#3B82F6' }),
                    stroke: new Stroke({ color: '#ffffff', width: 2 }),
                }),
            }));

            vectorSourceRef.current.addFeature(markerFeature);
        }
    }, [mapCenter, mapInitialized, formData.address]);

    // Handle custom pin updates
    useEffect(() => {
        if (mapRef.current && mapInitialized && customPin && vectorSourceRef.current) {
            const existingPin = vectorSourceRef.current.getFeatures().find(f => f.get('type') === 'custom-pin');
            if (existingPin) {
                vectorSourceRef.current.removeFeature(existingPin);
            }
            
            const pinFeature = new Feature({
                geometry: new Point(fromLonLat([customPin[1], customPin[0]])),
                name: 'Custom Location Pin',
                type: 'custom-pin',
            });

            pinFeature.setStyle(new Style({
                image: new CircleStyle({
                    radius: 10,
                    fill: new Fill({ color: '#EF4444' }),
                    stroke: new Stroke({ color: '#ffffff', width: 3 }),
                }),
            }));

            vectorSourceRef.current.addFeature(pinFeature);
        }
    }, [customPin, mapInitialized]);

    // Handle school markers on map
    useEffect(() => {
        if (!mapRef.current || !mapInitialized || !vectorSourceRef.current) return;

        const existingSchoolMarkers = vectorSourceRef.current.getFeatures().filter(f => f.get('type') === 'school-marker');
        existingSchoolMarkers.forEach(marker => {
            vectorSourceRef.current!.removeFeature(marker);
        });

        favoriteSchools.forEach(school => {
            const schoolFeature = new Feature({
                geometry: new Point(fromLonLat([school.coordinates[1], school.coordinates[0]])),
                name: school.name,
                type: 'school-marker',
                schoolId: school.id,
                schoolData: school,
            });

            schoolFeature.setStyle(new Style({
                image: new CircleStyle({
                    radius: 12,
                    fill: new Fill({ color: '#10B981' }),
                    stroke: new Stroke({ color: '#ffffff', width: 3 }),
                }),
                text: new Text({
                    text: '🏫',
                    font: '16px sans-serif',
                    offsetY: -20,
                }),
            }));

            vectorSourceRef.current!.addFeature(schoolFeature);
        });

        if (favoriteSchools.length > 0) {
            setTimeout(() => centerMapOnSchools(), 100);
        }
    }, [favoriteSchools, mapInitialized]);

    // Handle map resize when fullscreen mode changes - OpenLayers handles this much better
    useEffect(() => {
        if (mapRef.current && mapInitialized) {
            setIsResizingMap(true);
            
            const resizeMap = () => {
                if (mapRef.current) {
                    // Force multiple resize attempts to ensure proper rendering
                    mapRef.current.updateSize();
                    mapRef.current.renderSync();
                    
                    // Additional resize after a short delay
                    setTimeout(() => {
                        if (mapRef.current) {
                            mapRef.current.updateSize();
                            mapRef.current.renderSync();
                        }
                    }, 100);
                    
                    // Final resize attempt
                    setTimeout(() => {
                        if (mapRef.current) {
                            mapRef.current.updateSize();
                            setIsResizingMap(false);
                        }
                    }, 300);
                }
            };

            // Use multiple timeframes to ensure resize happens after DOM update
            requestAnimationFrame(() => {
                resizeMap();
            });
            
            setTimeout(resizeMap, 50);
            setTimeout(resizeMap, 150);
        }
    }, [isFullscreen, mapInitialized]);

    // Additional effect to handle container visibility changes
    useEffect(() => {
        if (mapContainerRef.current && mapRef.current && mapInitialized) {
            const container = mapContainerRef.current;
            
            // Use ResizeObserver to detect when container size actually changes
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                        setTimeout(() => {
                            if (mapRef.current) {
                                mapRef.current.updateSize();
                                mapRef.current.renderSync();
                            }
                        }, 50);
                    }
                }
            });

            resizeObserver.observe(container);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [mapInitialized]);

    // Toggle fullscreen mode - OpenLayers handles resizing much better
    const toggleFullscreen = () => {
        setIsResizingMap(true);
        const newFullscreenState = !isFullscreen;
        setIsFullscreen(newFullscreenState);
        
        // Force immediate DOM update for fullscreen
        if (mapRef.current) {
            // Use multiple timing strategies to ensure proper resize
            const resizeSequence = () => {
                if (mapRef.current) {
                    mapRef.current.updateSize();
                    mapRef.current.renderSync();
                }
            };
            
            // Immediate resize
            requestAnimationFrame(() => {
                resizeSequence();
            });
            
            // Short delay resize
            setTimeout(() => {
                resizeSequence();
            }, 50);
            
            // Medium delay resize
            setTimeout(() => {
                resizeSequence();
            }, 200);
            
            // Final resize and clear loading state
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.updateSize();
                    mapRef.current.renderSync();
                    
                    // Force a view update to ensure map tiles are properly loaded
                    const view = mapRef.current.getView();
                    if (view) {
                        const currentCenter = view.getCenter();
                        const currentZoom = view.getZoom();
                        if (currentCenter && currentZoom) {
                            view.setCenter(currentCenter);
                            view.setZoom(currentZoom);
                        }
                    }
                    
                    setIsResizingMap(false);
                }
            }, 500);
        } else {
            setTimeout(() => setIsResizingMap(false), 500);
        }
    };

    // Convert radius to meters
    const convertToMeters = (radius: number, unit: 'km' | 'miles' | 'meters'): number => {
        if (isNaN(radius) || radius <= 0) {
            console.error('Invalid radius for conversion:', radius);
            return 1000; // Default 1km
        }
        
        let result: number;
        switch (unit) {
            case 'km': result = radius * 1000; break;
            case 'miles': result = radius * 1609.34; break;
            case 'meters': result = radius; break;
            default: result = radius * 1000; break;
        }
        
        console.log('Converted radius:', { input: radius, unit, output: result });
        return result;
    };

    // Convert radius between units
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

    // Calculate distance between coordinates using OpenLayers
    const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
        const point1 = fromLonLat([coord1[1], coord1[0]]);
        const point2 = fromLonLat([coord2[1], coord2[0]]);
        return getDistance(point1, point2);
    };

    // Search address using Nominatim
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

    // Check if point is within catchment
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

    // Pin placement functions
    const createPinIcon = (type: 'school' | 'location' | 'measurement') => {
        const colors = {
            school: '#3B82F6',
            location: '#EF4444',
            measurement: '#F59E0B'
        };
        return colors[type];
    };

    const placePinAtCoordinates = (coordinates: [number, number], type: 'school' | 'location' | 'measurement', title: string, schoolId?: string) => {
        if (!vectorSourceRef.current) return null;

        const pinId = `${type}-${Date.now()}`;
        const color = createPinIcon(type);
        
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

        vectorSourceRef.current.addFeature(pinFeature);

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

    const togglePinPlacementMode = (mode: 'off' | 'school' | 'location') => {
        setFormData(prev => ({ ...prev, pinPlacementMode: mode }));
        setMeasurementMode(false);
        setError('');

        if (mapRef.current) {
            if (mode === 'school') {
                mapRef.current.getViewport().style.cursor = 'crosshair';
                // Clear address when switching to pin mode for schools
                setFormData(prev => ({ ...prev, address: '' }));
            } else if (mode !== 'off') {
                mapRef.current.getViewport().style.cursor = 'crosshair';
            } else {
                mapRef.current.getViewport().style.cursor = '';
            }
        }
    };

    // Advanced pin management functions
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
        
        setFormData(prev => ({ 
            ...prev, 
            coordinateInput: { lat: '', lng: '' },
            pinPlacementMode: 'off'
        }));
        setShowCoordinateInput(false);
        setError('');

        if (mapRef.current) {
            mapRef.current.getView().setCenter(fromLonLat([coordinates[1], coordinates[0]]));
            mapRef.current.getView().setZoom(16);
        }
    };

    const removePin = (pinId: string) => {
        const pin = placedPins.find(p => p.id === pinId);
        if (pin && pin.feature && vectorSourceRef.current) {
            vectorSourceRef.current.removeFeature(pin.feature);
        }

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

            circles.forEach(circle => {
                if (circle.schoolId === schoolId && circle.olFeature) {
                    const geometry = circle.olFeature.getGeometry() as Circle;
                    const newCenter = fromLonLat([pin.coordinates[1], pin.coordinates[0]]);
                    geometry.setCenter(newCenter);
                }
            });

            setCircles(prev => prev.map(circle =>
                circle.schoolId === schoolId
                    ? { ...circle, center: pin.coordinates }
                    : circle
            ));
        }
    };

    const handleInputChange = (field: keyof MapFormData, value: string | number) => {
        setFormData(prev => {
            if (field === 'unit' && typeof value === 'string') {
                const oldUnit = prev.unit;
                const newUnit = value as 'km' | 'miles' | 'meters';
                const currentRadius = parseFloat(prev.radius);
                
                if (!isNaN(currentRadius) && currentRadius > 0) {
                    const convertedRadius = convertRadius(currentRadius, oldUnit, newUnit);
                    return {
                        ...prev,
                        unit: newUnit,
                        radius: convertedRadius.toFixed(3)
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

    // Color management functions
    const getColorForSchoolYear = (schoolId: string, year: number): string => {
        const customKey = `${schoolId}-${year}`;
        if (customColors[customKey]) {
            return customColors[customKey];
        }

        if (schoolColorSchemes[schoolId]) {
            const yearIndex = Math.abs(year - 2020) % schoolColorSchemes[schoolId].length;
            return schoolColorSchemes[schoolId][yearIndex];
        }

        let palette: string[] = [];
        
        if (selectedColorPalette.type === 'schools') {
            const schoolPalettes = colorPalettes.schools;
            palette = schoolPalettes[selectedColorPalette.name as keyof typeof schoolPalettes] || [];
        } else {
            const yearPalettes = colorPalettes.years;
            palette = yearPalettes[selectedColorPalette.name as keyof typeof yearPalettes] || [];
        }
        
        if (selectedColorPalette.type === 'schools') {
            const schoolIndex = favoriteSchools.findIndex(s => s.id === schoolId);
            return palette[schoolIndex % palette.length] || '#3B82F6';
        } else {
            const yearIndex = Math.abs(year - 2020) % palette.length;
            return palette[yearIndex] || '#3B82F6';
        }
    };

    const changeCircleColor = (id: string, newColor: string) => {
        setCircles(prev => prev.map(circle => {
            if (circle.id === id) {
                const updatedCircle = { ...circle, color: newColor };
                if (circle.olFeature) {
                    circle.olFeature.setStyle(new Style({
                        fill: new Fill({
                            color: `${newColor}55`, // Increased opacity
                        }),
                        stroke: new Stroke({
                            color: newColor,
                            width: 3, // Increased width
                        }),
                    }));
                }
                return updatedCircle;
            }
            return circle;
        }));
    };

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

            if (circle.olFeature) {
                circle.olFeature.setStyle(new Style({
                    fill: new Fill({
                        color: `${newColor}55`, // Increased opacity
                    }),
                    stroke: new Stroke({
                        color: newColor,
                        width: 3, // Increased width
                    }),
                }));
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

    // School management functions
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

        const saveResult = await favoriteSchoolsService.addFavoriteSchool(newSchool);
        if (saveResult.success) {
            setFavoriteSchools(prev => [...prev, newSchool]);
            setSchools(prev => [...prev, newSchool]);
            setFormData(prev => ({ ...prev, schoolName: '', selectedSchoolId: newSchool.id }));
            setError('');
            
            setSaveMessage({
                type: 'success',
                text: saveResult.message || 'School added to favorites!'
            });
            setTimeout(() => setSaveMessage(null), 3000);
            
            try {
                toast.success(saveResult.message || 'School added to favorites!', { position: 'top-right', autoClose: 3000 });
            } catch (e) {
                // Ignore toast errors
            }
        } else {
            setError(saveResult.message || 'Failed to add school to favorites');
            try {
                toast.error(saveResult.message || 'Failed to add school to favorites', { position: 'top-right', autoClose: 4000 });
            } catch (e) {
                // Ignore toast errors
            }
        }
    };

    const removeSchool = async (id: string) => {
        const schoolCircles = circles.filter(circle => circle.schoolId === id);
        
        schoolCircles.forEach(circle => {
            if (circle.olFeature && vectorSourceRef.current) {
                vectorSourceRef.current.removeFeature(circle.olFeature);
            }
        });

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

    const calculateAverageCatchment = (school: School): number => {
        if (school.catchmentZones.length === 0) return 0;
        
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

    const centerMapOnSchools = () => {
        if (favoriteSchools.length === 0 || !mapRef.current) return;
        
        const view = mapRef.current.getView();
        
        if (favoriteSchools.length === 1) {
            const school = favoriteSchools[0];
            view.setCenter(fromLonLat([school.coordinates[1], school.coordinates[0]]));
            view.setZoom(13);
        } else {
            const coordinates = favoriteSchools.map(s => s.coordinates);
            const extent = coordinates.reduce((extent, coord) => {
                const point = fromLonLat([coord[1], coord[0]]);
                return extent ? 
                    [
                        Math.min(extent[0], point[0]),
                        Math.min(extent[1], point[1]),
                        Math.max(extent[2], point[0]),
                        Math.max(extent[3], point[1])
                    ] : 
                    [point[0], point[1], point[0], point[1]];
            }, null as number[] | null);
            
            if (extent) {
                const padding = 1000;
                const paddedExtent = [
                    extent[0] - padding,
                    extent[1] - padding,
                    extent[2] + padding,
                    extent[3] + padding
                ];
                view.fit(paddedExtent, { padding: [20, 20, 20, 20] });
            }
        }
    };

    // View mode control functions
    const toggleAverageZones = () => {
        setShowAverageZones(prev => {
            const newState = !prev;
            
            setFavoriteSchools(schools => schools.map(school => ({
                ...school,
                averageCatchment: school.averageCatchment ? {
                    ...school.averageCatchment,
                    isVisible: newState
                } : undefined
            })));

            favoriteSchools.forEach(school => {
                if (school.averageCatchment && vectorSourceRef.current) {
                    const averageCircleId = `avg-${school.id}`;
                    
                    const existingCircle = circles.find(c => c.id === averageCircleId);
                    if (existingCircle && existingCircle.olFeature && vectorSourceRef.current) {
                        vectorSourceRef.current.removeFeature(existingCircle.olFeature);
                        setCircles(prev => prev.filter(c => c.id !== averageCircleId));
                    }

                    if (newState && school.averageCatchment.radius > 0) {
                        const radiusInMeters = convertToMeters(school.averageCatchment.radius, school.averageCatchment.unit);
                        const circleFeature = new Feature({
                            geometry: new Circle(
                                fromLonLat([school.coordinates[1], school.coordinates[0]]),
                                radiusInMeters
                            ),
                            name: `${school.name} - Average: ${school.averageCatchment.radius} ${school.averageCatchment.unit} (5-year avg)`,
                            type: 'catchment-circle',
                            circleId: averageCircleId,
                        });

                        circleFeature.setStyle(new Style({
                            fill: new Fill({
                                color: `${school.averageCatchment.color}1A`,
                            }),
                            stroke: new Stroke({
                                color: school.averageCatchment.color,
                                width: 3,
                                lineDash: [10, 10],
                            }),
                        }));

                        vectorSourceRef.current.addFeature(circleFeature);

                        const avgCircle: RadiusCircle = {
                            id: averageCircleId,
                            center: school.coordinates,
                            radius: school.averageCatchment.radius,
                            unit: school.averageCatchment.unit,
                            schoolName: school.name,
                            year: 0,
                            color: school.averageCatchment.color,
                            olFeature: circleFeature,
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

    const focusOnSchool = (schoolId: string) => {
        setFocusedSchoolId(schoolId);
        setFormData(prev => ({ ...prev, focusSchoolId: schoolId }));
        
        circles.forEach(circle => {
            if (circle.olFeature && vectorSourceRef.current) {
                if (schoolId === '' || circle.schoolId === schoolId) {
                    if (!vectorSourceRef.current.hasFeature(circle.olFeature)) {
                        vectorSourceRef.current.addFeature(circle.olFeature);
                    }
                    circle.olFeature.setStyle(new Style({
                        fill: new Fill({
                            color: `${circle.color}55`, // Increased opacity for focus mode
                        }),
                        stroke: new Stroke({
                            color: circle.color,
                            width: 3, // Increased width for focus mode
                        }),
                    }));
                } else {
                    circle.olFeature.setStyle(new Style({
                        fill: new Fill({
                            color: `${circle.color}0D`,
                        }),
                        stroke: new Stroke({
                            color: circle.color,
                            width: 1,
                        }),
                    }));
                }
            }
        });

        setCircles(prev => prev.map(circle => ({
            ...circle,
            isVisible: schoolId === '' || circle.schoolId === schoolId
        })));

        if (schoolId) {
            const school = favoriteSchools.find(s => s.id === schoolId);
            if (school && mapRef.current) {
                mapRef.current.getView().setCenter(fromLonLat([school.coordinates[1], school.coordinates[0]]));
                mapRef.current.getView().setZoom(14);
            }
        }
    };

    const toggleComparisonMode = () => {
        setComparisonMode(prev => {
            const newMode = !prev;
            setFormData(prevForm => ({ 
                ...prevForm, 
                viewMode: newMode ? 'comparison' : 'all' 
            }));
            
            if (!newMode) {
                focusOnSchool('');
            }
            
            return newMode;
        });
    };

    const filterZonesByYear = (year: number | 'all') => {
        setSelectedYearFilter(year);
        
        circles.forEach(circle => {
            if (circle.olFeature && vectorSourceRef.current) {
                if (year === 'all' || circle.year === year || circle.year === 0) {
                    if (!vectorSourceRef.current.hasFeature(circle.olFeature)) {
                        vectorSourceRef.current.addFeature(circle.olFeature);
                    }
                    circle.olFeature.setStyle(new Style({
                        fill: new Fill({
                            color: `${circle.color}55`, // Increased opacity for year filter
                        }),
                        stroke: new Stroke({
                            color: circle.color,
                            width: 3, // Increased width for year filter
                        }),
                    }));
                } else {
                    circle.olFeature.setStyle(new Style({
                        fill: new Fill({
                            color: 'transparent',
                        }),
                        stroke: new Stroke({
                            color: 'transparent',
                            width: 0,
                        }),
                    }));
                }
            }
        });

        setCircles(prev => prev.map(circle => ({
            ...circle,
            isVisible: year === 'all' || circle.year === year || circle.year === 0
        })));
    };

    // Catchment zone management functions
    const addCatchmentZone = async () => {
        if (!mapRef.current || !mapInitialized) {
            setError('Please search for an address first');
            return;
        }

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
        
        if (updatedZones.length > 0) {
            const averageRadius = calculateAverageCatchment(updatedSchool);
            updatedSchool.averageCatchment = {
                radius: parseFloat(averageRadius.toFixed(1)),
                unit: 'km',
                color: '#6B7280',
                isVisible: showAverageZones
            };
        }

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

        setFavoriteSchools(prev => prev.map(school => 
            school.id === selectedSchool.id ? updatedSchool : school
        ));

        const radiusInMeters = convertToMeters(radius, formData.unit);
        const centerPoint = fromLonLat([centerCoords[1], centerCoords[0]]);
        console.log('Circle center point (projected):', centerPoint);
        console.log('Circle center coords (lat/lng):', centerCoords);
        
        const circleGeometry = new Circle(centerPoint, radiusInMeters);
        console.log('Circle geometry extent:', circleGeometry.getExtent());
        
        const circleFeature = new Feature({
            geometry: circleGeometry,
            name: `${selectedSchool.name} - ${radius} ${formData.unit} (${formData.selectedYear})`,
            type: 'catchment-circle',
            circleId: newZone.id,
        });

        circleFeature.setStyle(new Style({
            fill: new Fill({
                color: `${zoneColor}55`, // Increased opacity from 33 to 55 (33% opacity)
            }),
            stroke: new Stroke({
                color: zoneColor,
                width: 3, // Increased width from 2 to 3 for better visibility
            }),
        }));
        
        console.log('Creating circle with:', {
            center: centerCoords,
            radiusInMeters,
            color: zoneColor,
            school: selectedSchool.name,
            year: formData.selectedYear
        });

        if (vectorSourceRef.current) {
            console.log('Adding circle feature to vector source');
            vectorSourceRef.current.addFeature(circleFeature);
            
            // Force map refresh to ensure the circle is visible
            if (mapRef.current) {
                console.log('Forcing map render');
                mapRef.current.renderSync();
            }
        } else {
            console.error('No vector source available to add circle feature!');
        }

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
        setError('');
        
        // Center map on the school to make the circle more visible
        if (mapRef.current) {
            const view = mapRef.current.getView();
            view.setCenter(fromLonLat([centerCoords[1], centerCoords[0]]));
            
            // Set appropriate zoom level based on radius to ensure circle is visible
            let zoomLevel = 13;
            if (radiusInMeters < 500) zoomLevel = 16;
            else if (radiusInMeters < 1000) zoomLevel = 15;
            else if (radiusInMeters < 2000) zoomLevel = 14;
            else if (radiusInMeters > 5000) zoomLevel = 12;
            
            view.setZoom(zoomLevel);
            console.log('Centered map on school with zoom:', zoomLevel);
        }

        setSaveMessage({
            type: 'success',
            text: 'Catchment zone saved to database!'
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
            
            if (updatedZones.length > 0) {
                const averageRadius = calculateAverageCatchment(updatedSchool);
                updatedSchool.averageCatchment = {
                    radius: parseFloat(averageRadius.toFixed(1)),
                    unit: 'km',
                    color: '#6B7280',
                    isVisible: showAverageZones
                };
            } else {
                updatedSchool.averageCatchment = undefined;
            }

            try {
                const saveResult = await favoriteSchoolsService.updateFavoriteSchool(updatedSchool);
                if (saveResult.success) {
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
                    return;
                }
            } catch (error) {
                console.error('Error removing catchment zone from database:', error);
                setSaveMessage({
                    type: 'error',
                    text: 'Failed to remove catchment zone from database'
                });
                setTimeout(() => setSaveMessage(null), 3000);
                return;
            }
        }

        if (circleToRemove.olFeature && vectorSourceRef.current) {
            vectorSourceRef.current.removeFeature(circleToRemove.olFeature);
        }
        setCircles(prev => prev.filter(circle => circle.id !== id));
    };

    const toggleCircleVisibility = (id: string) => {
        setCircles(prev => prev.map(circle => {
            if (circle.id === id) {
                const updatedCircle = { ...circle, isVisible: !circle.isVisible };
                if (circle.olFeature && vectorSourceRef.current) {
                    if (updatedCircle.isVisible) {
                        if (!vectorSourceRef.current.hasFeature(circle.olFeature)) {
                            vectorSourceRef.current.addFeature(circle.olFeature);
                        }
                        circle.olFeature.setStyle(new Style({
                            fill: new Fill({
                                color: `${circle.color}55`, // Increased opacity for better visibility
                            }),
                            stroke: new Stroke({
                                color: circle.color,
                                width: 3, // Increased width for better visibility
                            }),
                        }));
                        
                        console.log('Made circle visible:', {
                            id: circle.id,
                            color: circle.color,
                            schoolName: circle.schoolName
                        });
                    } else {
                        circle.olFeature.setStyle(new Style({
                            fill: new Fill({
                                color: 'transparent',
                            }),
                            stroke: new Stroke({
                                color: 'transparent',
                                width: 0,
                            }),
                        }));
                    }
                }
                return updatedCircle;
            }
            return circle;
        }));
    };

    // Keyboard shortcuts and utilities
    const clearAll = async () => {
        if (!confirm('Are you sure you want to clear all data? This will remove all favorite schools from your account permanently.')) {
            return;
        }
        
        if (vectorSourceRef.current) {
            vectorSourceRef.current.clear();
        }
        
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        
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
        setPlacedPins([]);
    };

    // Handle ESC key to exit fullscreen and F11 for toggle
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            } else if (event.key === 'F11') {
                event.preventDefault();
                setIsFullscreen(!isFullscreen);
            }
        };

        let resizeTimeout: NodeJS.Timeout;
        
        const handleResize = () => {
            if (mapRef.current && mapInitialized) {
                // Debounce resize events
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.updateSize();
                        mapRef.current.renderSync();
                    }
                }, 100);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        window.addEventListener('resize', handleResize);
        
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = 'unset';
            clearTimeout(resizeTimeout);
        };
    }, [isFullscreen, mapInitialized]);

    // Save utilities
    const canSaveData = () => {
        return favoriteSchools.length > 0 || circles.length > 0;
    };

    const handleSaveComplete = (success: boolean, message: string) => {
        setSaveMessage({
            type: success ? 'success' : 'error',
            text: message
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    };

    const getFormData = () => {
        return {
            address: formData.address,
            unit: formData.unit,
            selectedYear: formData.selectedYear,
            selectedSchoolId: formData.selectedSchoolId,
            schoolName: formData.schoolName,
            radius: formData.radius,
            viewMode: formData.viewMode,
            pinPlacementMode: formData.pinPlacementMode,
            focusSchoolId: formData.focusSchoolId,
            coordinateInput: formData.coordinateInput
        };
    };

    const getCalculationResults = () => {
        const timestamp = new Date().toISOString();
        
        return {
            searchedAddress: formData.address || '',
            mapCenter: mapCenter || [51.5074, -0.1278],
            schools: schools || [],
            favoriteSchools: favoriteSchools,
            circles: circles,
            customPin: customPin || null,
            placedPins: placedPins,
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
            statistics: {
                totalCircles: circles.length,
                totalSchools: schools.length,
                totalFavoriteSchools: favoriteSchools.length,
                totalPins: placedPins.length,
                visibleCircles: circles.filter(c => c.isVisible).length,
                schoolsWithCatchmentData: favoriteSchools.filter(s => s.catchmentZones && s.catchmentZones.length > 0).length,
                averageRadius: circles.length > 0 ? circles.reduce((sum, c) => sum + c.radius, 0) / circles.length : 0
            },
            metadata: {
                calculatedAt: timestamp,
                toolVersion: '2.0.0 OpenLayers',
                zoom: mapRef.current ? mapRef.current.getView().getZoom() : 13
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
                    {/* Mobile Controls Toggle for Fullscreen */}
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
                        {/* Add Favourite School */}
                        <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                            <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>🏫 Add Favourite School</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        School Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter school name"
                                        value={formData.schoolName}
                                        onChange={(e) => handleInputChange('schoolName', e.target.value)}
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
                                            placeholder="Enter school postcode (e.g., 'SW1A 1AA')"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                                        />
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span>OR</span>
                                            <button
                                                onClick={() => togglePinPlacementMode(formData.pinPlacementMode === 'school' ? 'off' : 'school')}
                                                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                                                    formData.pinPlacementMode === 'school'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                📍 {formData.pinPlacementMode === 'school' ? 'Cancel Pin Mode' : 'Drag Pin on Map'}
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
                                            onClick={searchAddress}
                                            disabled={isLoading || !formData.address.trim()}
                                            className={`flex-1 bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                                        >
                                            {isLoading ? 'Searching...' : 'Search Address'}
                                        </button>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={addSchool}
                                    disabled={!formData.schoolName.trim() || favoriteSchools.length >= 6 || (!formData.address.trim() && !customPin)}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Add to Favorites ({favoriteSchools.length}/6)
                                </button>
                                {error && (
                                    <p className="text-red-500 text-sm mt-2">{error}</p>
                                )}
                            </div>
                        </div>

                        {/* General Address Search */}
                        <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                            <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>🔍 Search Location</h3>
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <input
                                    type="text"
                                    placeholder="Search any address or postcode to navigate map"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                                />
                                <button
                                    onClick={searchAddress}
                                    disabled={isLoading || !formData.address.trim()}
                                    className={`bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? 'text-sm' : 'text-sm sm:text-base'}`}
                                >
                                    {isLoading ? 'Searching...' : 'Navigate to Location'}
                                </button>
                            </div>
                        </div>

                        {/* Catchment Zone Creation */}
                        <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                            <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>📐 Catchment Zone Analysis</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select School
                                    </label>
                                    <select
                                        value={formData.selectedSchoolId}
                                        onChange={(e) => handleInputChange('selectedSchoolId', e.target.value)}
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
                                            value={formData.radius}
                                            onChange={(e) => handleInputChange('radius', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit
                                        </label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => handleInputChange('unit', e.target.value)}
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
                                        value={formData.selectedYear}
                                        onChange={(e) => handleInputChange('selectedYear', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 bg-white text-sm"
                                    />
                                </div>

                                <button
                                    onClick={addCatchmentZone}
                                    disabled={!formData.selectedSchoolId || !formData.radius || parseFloat(formData.radius) <= 0}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Add Catchment Zone
                                </button>
                            </div>
                        </div>

                        {/* View Controls */}
                        <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                            <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>👁️ View Controls</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Year
                                    </label>
                                    <select
                                        value={selectedYearFilter}
                                        onChange={(e) => filterZonesByYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-gray-900 bg-white text-sm"
                                    >
                                        <option value="all">All Years</option>
                                        {Array.from(new Set(circles.map(c => c.year).filter(y => y > 0))).sort().map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Focus on School
                                    </label>
                                    <select
                                        value={focusedSchoolId}
                                        onChange={(e) => focusOnSchool(e.target.value)}
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

                        {/* Favorite Schools List */}
                        {favoriteSchools.length > 0 && (
                            <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                                <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>⭐ Favorite Schools ({favoriteSchools.length})</h3>
                                <div className="space-y-2">
                                    {favoriteSchools.map(school => (
                                        <div key={school.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">{school.name}</h4>
                                                    <p className="text-xs text-gray-500 truncate">{school.address}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {school.catchmentZones.length} zone{school.catchmentZones.length !== 1 ? 's' : ''}
                                                        {school.averageCatchment && (
                                                            <span> • Avg: {school.averageCatchment.radius} {school.averageCatchment.unit}</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeSchool(school.id)}
                                                    className="ml-2 text-red-600 hover:text-red-700 transition-colors"
                                                    title="Remove from favorites"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Catchment Zones List */}
                        {circles.length > 0 && (
                            <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                                <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>🎯 Catchment Zones ({circles.length})</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {circles.filter(c => c.year > 0).map(circle => (
                                        <div key={circle.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                            style={{ backgroundColor: circle.color }}
                                                        ></div>
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">{circle.schoolName}</h4>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {circle.radius} {circle.unit} • {circle.year}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => toggleCircleVisibility(circle.id)}
                                                        className={`text-sm ${circle.isVisible ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-700 transition-colors`}
                                                        title={circle.isVisible ? 'Hide zone' : 'Show zone'}
                                                    >
                                                        {circle.isVisible ? '👁️' : '🙈'}
                                                    </button>
                                                    <button
                                                        onClick={() => removeCircle(circle.id)}
                                                        className="text-red-600 hover:text-red-700 transition-colors ml-1"
                                                        title="Remove zone"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Palette Controls */}
                        <div className={`${isFullscreen ? 'mb-4' : 'mb-4 sm:mb-6'}`}>
                            <h3 className={`${isFullscreen ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 ${isFullscreen ? 'mb-3' : 'mb-4'}`}>🎨 Color Schemes</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color by Schools
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(colorPalettes.schools).map(paletteName => (
                                            <button
                                                key={paletteName}
                                                onClick={() => applyPaletteToAll('schools', paletteName)}
                                                className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                                                    selectedColorPalette.type === 'schools' && selectedColorPalette.name === paletteName
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {paletteName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color by Years
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(colorPalettes.years).map(paletteName => (
                                            <button
                                                key={paletteName}
                                                onClick={() => applyPaletteToAll('years', paletteName)}
                                                className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                                                    selectedColorPalette.type === 'years' && selectedColorPalette.name === paletteName
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {paletteName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {canSaveData() && (
                                <SaveResultsButton 
                                    toolType="school-catchment"
                                    results={getCalculationResults()}
                                    formData={getFormData()}
                                    onSaveComplete={handleSaveComplete}
                                    className="w-full"
                                />
                            )}
                            
                            <button
                                onClick={clearAll}
                                disabled={favoriteSchools.length === 0 && circles.length === 0}
                                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Clear All Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className={`${
                    isFullscreen 
                        ? 'flex-1 min-h-0' 
                        : 'w-full h-96 sm:h-[28rem] md:h-[32rem] lg:h-[36rem]'
                } relative`}>
                    <div 
                        ref={mapContainerRef}
                        className={`w-full h-full rounded-lg shadow-sm border border-gray-200 ${
                            isResizingMap ? 'transition-all duration-300' : ''
                        }`}
                        style={{ 
                            backgroundColor: '#f8fafc',
                            minHeight: isFullscreen ? '100vh' : '400px'
                        }}
                    />
                    
                    {isResizingMap && (
                        <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium text-blue-900">Resizing map...</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Pin Placement Mode Indicator */}
                    {formData.pinPlacementMode === 'school' && (
                        <div className="absolute top-4 left-4 right-4 z-10">
                            <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg border border-blue-500 flex items-center gap-3">
                                <span className="text-xl">🎯</span>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">School Pin Placement Mode</div>
                                    <div className="text-xs text-blue-100">Click anywhere on the map to place the school location pin</div>
                                </div>
                                <button
                                    onClick={() => togglePinPlacementMode('off')}
                                    className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save message */}
            {saveMessage && (
                <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border ${
                    saveMessage.type === 'success' 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {saveMessage.text}
                </div>
            )}
        </div>
    );
}