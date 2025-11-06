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
    onMapClick: (coordinate: [number, number]) => void | Promise<void>;
    formData: {
        pinPlacementMode: 'off' | 'school' | 'location';
        address: string;
        unit: 'km' | 'miles' | 'meters';
    };
    measurementMode: boolean;
    onMeasurementClick: (coordinate: [number, number]) => void;
    onCircleClick?: (circleId: string) => void;
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
    onMeasurementClick,
    onCircleClick
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
            declutter: true,
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
            
            // Check if a feature was clicked
            const featuresAtPixel = map.getFeaturesAtPixel(event.pixel);
            let circleClicked = false;

            if (featuresAtPixel.length > 0) {
                // Look for a catchment circle feature
                const circleFeature = featuresAtPixel.find(feature => 
                    feature.get('type') === 'catchment-circle'
                );
                
                if (circleFeature && onCircleClick) {
                    const circleId = circleFeature.get('circleId');
                    if (circleId) {
                        onCircleClick(circleId);
                        circleClicked = true;
                    }
                }
            }

            // Only handle regular map click if no circle was clicked
            if (!circleClicked) {
                if (measurementMode) {
                    onMeasurementClick(clickedPoint);
                } else {
                    onMapClick(clickedPoint);
                }
            }
        });

        // Add pointer move handler for cursor changes
        map.on('pointermove', (event) => {
            const featuresAtPixel = map.getFeaturesAtPixel(event.pixel);
            const hasCircle = featuresAtPixel.some(feature => 
                feature.get('type') === 'catchment-circle'
            );
            
            map.getTargetElement().style.cursor = hasCircle ? 'pointer' : '';
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
            const currentZoom = mapRef.current.getView().getZoom() || 13;
            mapRef.current.getView().setCenter(fromLonLat([mapCenter[1], mapCenter[0]]));
            // Preserve current zoom level instead of forcing to 13
            mapRef.current.getView().setZoom(currentZoom);
            
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

    // Handle catchment circles
    useEffect(() => {
        if (!mapRef.current || !vectorSourceRef.current) return;

        // Remove existing catchment circles and their labels
        const existingCircles = vectorSourceRef.current.getFeatures().filter(f => 
            f.get('type') === 'catchment-circle'
        );
        existingCircles.forEach(circle => {
            vectorSourceRef.current!.removeFeature(circle);
        });
        const existingLabels = vectorSourceRef.current.getFeatures().filter(f => 
            f.get('type') === 'catchment-label'
        );
        existingLabels.forEach(label => {
            vectorSourceRef.current!.removeFeature(label);
        });

        // Add current visible circles and separate label features placed on the circle rim
        circles.forEach(circle => {
            if (circle.isVisible && circle.olFeature) {
                // Update the style based on current visibility and color
                const style = new Style({
                    fill: new Fill({
                        color: `${circle.color}55`, // Add transparency
                    }),
                    stroke: new Stroke({
                        color: circle.color,
                        width: 3,
                    }),
                });
                circle.olFeature.setStyle(style);
                vectorSourceRef.current!.addFeature(circle.olFeature);

                // Create a label feature positioned on the circle circumference (east side, angle = 0)
                const geom = circle.olFeature.getGeometry();
                if (geom && typeof (geom as any).getCenter === 'function' && typeof (geom as any).getRadius === 'function') {
                    const center = (geom as any).getCenter(); // in map projection
                    const radius = (geom as any).getRadius(); // in map projection units
                    const angle = 0; // radians, 0 = east; change to -Math.PI/2 for north if preferred
                    const labelX = center[0] + radius * Math.cos(angle);
                    const labelY = center[1] + radius * Math.sin(angle);

                    const labelFeature = new Feature({
                        geometry: new Point([labelX, labelY]),
                        type: 'catchment-label',
                        circleId: circle.id,
                        name: `${circle.schoolName} ${circle.year}`,
                    });

                    labelFeature.setStyle(new Style({
                        text: new Text({
                            text: `${circle.year}`,
                            font: 'bold 12px sans-serif',
                            fill: new Fill({ color: circle.color }),
                            stroke: new Stroke({ color: '#ffffff', width: 3 }),
                            textAlign: 'center',
                            offsetY: 0,
                            padding: [2, 4, 2, 4],
                            backgroundFill: new Fill({ color: 'rgba(255,255,255,0.85)' }),
                            backgroundStroke: new Stroke({ color: 'rgba(0,0,0,0.15)', width: 1 }),
                        }),
                    }));

                    vectorSourceRef.current!.addFeature(labelFeature);
                }
            }
        });
    }, [circles]);

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