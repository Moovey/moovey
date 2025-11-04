import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import LineString from 'ol/geom/LineString';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';

interface School {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
    catchmentZones: any[];
    isActive: boolean;
    isFavorite: boolean;
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

interface MapContainerProps {
    mapCenter: [number, number];
    favoriteSchools: School[];
    circles: RadiusCircle[];
    customPin: [number, number] | null;
    placedPins: PinInfo[];
    isFullscreen: boolean;
    isResizingMap: boolean;
    onMapClick: (coordinate: [number, number]) => void;
    formData: {
        pinPlacementMode: 'off' | 'school' | 'location';
        address: string;
        unit: 'km' | 'miles' | 'meters';
    };
    measurementMode: boolean;
    onMeasurementClick: (coordinate: [number, number]) => void;
}

export interface MapContainerRef {
    map: Map | null;
    vectorSource: VectorSource | null;
    updateSize: () => void;
    centerOn: (coordinates: [number, number], zoom?: number) => void;
    addFeature: (feature: Feature) => void;
    removeFeature: (feature: Feature) => void;
    getFeatures: () => Feature[];
    setZoom: (zoom: number) => void;
    getZoom: () => number | undefined;
    renderSync: () => void;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({
    mapCenter,
    favoriteSchools,
    circles,
    customPin,
    placedPins,
    isFullscreen,
    isResizingMap,
    onMapClick,
    formData,
    measurementMode,
    onMeasurementClick
}, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);
    const vectorSourceRef = useRef<VectorSource | null>(null);
    const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const popupRef = useRef<Overlay | null>(null);
    const popupElementRef = useRef<HTMLDivElement | null>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        map: mapRef.current,
        vectorSource: vectorSourceRef.current,
        updateSize: () => {
            if (mapRef.current) {
                mapRef.current.updateSize();
                mapRef.current.renderSync();
            }
        },
        centerOn: (coordinates: [number, number], zoom = 13) => {
            if (mapRef.current) {
                mapRef.current.getView().setCenter(fromLonLat([coordinates[1], coordinates[0]]));
                mapRef.current.getView().setZoom(zoom);
            }
        },
        addFeature: (feature: Feature) => {
            if (vectorSourceRef.current) {
                vectorSourceRef.current.addFeature(feature);
            }
        },
        removeFeature: (feature: Feature) => {
            if (vectorSourceRef.current) {
                vectorSourceRef.current.removeFeature(feature);
            }
        },
        getFeatures: () => {
            return vectorSourceRef.current?.getFeatures() || [];
        },
        setZoom: (zoom: number) => {
            if (mapRef.current) {
                mapRef.current.getView().setZoom(zoom);
            }
        },
        getZoom: () => {
            return mapRef.current?.getView().getZoom();
        },
        renderSync: () => {
            if (mapRef.current) {
                mapRef.current.renderSync();
            }
        }
    }));

    // Create popup element
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

    // Initialize map
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

        // Add popup overlay
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
            
            if (measurementMode) {
                onMeasurementClick(clickedPoint);
            } else {
                onMapClick(clickedPoint);
            }
        });

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.setTarget(undefined);
                mapRef.current = null;
            }
        };
    }, []);

    // Update map center
    useEffect(() => {
        if (mapRef.current && vectorSourceRef.current) {
            mapRef.current.getView().setCenter(fromLonLat([mapCenter[1], mapCenter[0]]));
            mapRef.current.getView().setZoom(13);
            
            // Remove existing location marker
            const existingMarker = vectorSourceRef.current.getFeatures().find(f => f.get('type') === 'location-marker');
            if (existingMarker) {
                vectorSourceRef.current.removeFeature(existingMarker);
            }
            
            // Add new location marker
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
    }, [mapCenter, formData.address]);

    // Handle custom pin
    useEffect(() => {
        if (mapRef.current && customPin && vectorSourceRef.current) {
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
    }, [customPin]);

    // Handle school markers
    useEffect(() => {
        if (!mapRef.current || !vectorSourceRef.current) return;

        // Remove existing school markers
        const existingSchoolMarkers = vectorSourceRef.current.getFeatures().filter(f => f.get('type') === 'school-marker');
        existingSchoolMarkers.forEach(marker => {
            vectorSourceRef.current!.removeFeature(marker);
        });

        // Add school markers
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
    }, [favoriteSchools]);

    // Handle placed pins
    useEffect(() => {
        if (!mapRef.current || !vectorSourceRef.current) return;

        // Remove existing placed pins
        const existingPlacedPins = vectorSourceRef.current.getFeatures().filter(f => 
            f.get('type')?.includes('-pin') && f.get('pinId')
        );
        existingPlacedPins.forEach(pin => {
            vectorSourceRef.current!.removeFeature(pin);
        });

        // Add current placed pins
        placedPins.forEach(pin => {
            if (pin.feature) {
                vectorSourceRef.current!.addFeature(pin.feature);
            }
        });
    }, [placedPins]);

    // Handle map resize for fullscreen
    useEffect(() => {
        if (mapRef.current) {
            const resizeMap = () => {
                if (mapRef.current) {
                    mapRef.current.updateSize();
                    mapRef.current.renderSync();
                }
            };

            // Multiple resize attempts for better reliability
            requestAnimationFrame(resizeMap);
            setTimeout(resizeMap, 50);
            setTimeout(resizeMap, 150);
            setTimeout(resizeMap, 300);
        }
    }, [isFullscreen]);

    // Handle cursor changes based on mode
    useEffect(() => {
        if (mapRef.current) {
            const viewport = mapRef.current.getViewport();
            if (formData.pinPlacementMode !== 'off' || measurementMode) {
                viewport.style.cursor = 'crosshair';
            } else {
                viewport.style.cursor = '';
            }
        }
    }, [formData.pinPlacementMode, measurementMode]);

    return (
        <div className={`relative ${
            isFullscreen 
                ? 'flex-1 w-full h-full' 
                : 'w-full h-96 sm:h-[500px] lg:h-[600px] xl:h-[700px]'
        }`}>
            {/* Map Container */}
            <div
                ref={mapContainerRef}
                className={`w-full h-full rounded-lg overflow-hidden shadow-inner bg-gray-100 ${
                    isResizingMap ? 'opacity-75' : 'opacity-100'
                } transition-opacity duration-200`}
                style={{
                    minHeight: isFullscreen ? '400px' : '300px',
                }}
            />

            {/* Loading Overlay */}
            {isResizingMap && (
                <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center rounded-lg">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Updating map...</span>
                    </div>
                </div>
            )}

            {/* Mode Indicator */}
            {(formData.pinPlacementMode !== 'off' || measurementMode) && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium z-10">
                    {formData.pinPlacementMode === 'school' && '🏫 Click to place school pin'}
                    {formData.pinPlacementMode === 'location' && '📍 Click to place location pin'}
                    {measurementMode && '📏 Click two points to measure distance'}
                </div>
            )}
        </div>
    );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;