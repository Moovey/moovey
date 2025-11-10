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
import { Modify, Select, Translate } from 'ol/interaction';
import { click, pointerMove } from 'ol/events/condition';
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
    onPinDrag?: (pinId: string, newCoordinates: [number, number]) => void;
    onSchoolDrag?: (schoolId: string, newCoordinates: [number, number]) => void;
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
    onCircleClick,
    onPinDrag,
    onSchoolDrag
}, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);
    const vectorSourceRef = useRef<VectorSource | null>(null);
    const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const popupRef = useRef<Overlay | null>(null);
    const popupElementRef = useRef<HTMLDivElement | null>(null);
    const selectInteractionRef = useRef<Select | null>(null);
    const translateInteractionRef = useRef<Translate | null>(null);

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

        // Track if we're in the middle of a drag operation
        let isDragging = false;

        // Add click handler
        map.on('click', (event) => {
            // Don't process clicks if we just finished dragging
            if (isDragging) {
                isDragging = false;
                return;
            }

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

        // Add pointer move handler for cursor changes and hover effects
        map.on('pointermove', (event) => {
            const featuresAtPixel = map.getFeaturesAtPixel(event.pixel);
            const hasCircle = featuresAtPixel.some(feature => 
                feature.get('type') === 'catchment-circle'
            );
            const draggableFeature = featuresAtPixel.find(feature => {
                const type = feature.get('type');
                return type === 'school-marker' || 
                       type === 'catchment-circle' ||
                       (type?.includes('-pin') && feature.get('pinId'));
            });
            const hoveredCircleFeatures = featuresAtPixel.filter(feature => feature.get('type') === 'catchment-circle');
            
            // Reset all hover effects first
            vectorSource.getFeatures().forEach(feature => {
                if (feature instanceof Feature) {
                    const type = feature.get('type');
                    if (type === 'school-marker') {
                        // Reset school marker style
                        feature.setStyle(new Style({
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
                    } else if (type?.includes('-pin')) {
                        // Reset pin styles to their original appearance
                        const pinType = type.replace('-pin', '');
                        const color = pinType === 'school' ? '#3B82F6' : pinType === 'location' ? '#EF4444' : '#F59E0B';
                        const emoji = pinType === 'school' ? '🏫' : pinType === 'location' ? '📍' : '📏';
                        
                        feature.setStyle(new Style({
                            image: new CircleStyle({
                                radius: 8,
                                fill: new Fill({ color: color }),
                                stroke: new Stroke({ color: '#ffffff', width: 2 }),
                            }),
                            text: new Text({
                                text: emoji,
                                font: '14px sans-serif',
                                offsetY: -20,
                            }),
                        }));
                    } else if (type === 'catchment-circle') {
                        // Reset circle style to base stroke width
                        const style = feature.getStyle() as Style | undefined;
                        const strokeColor = style?.getStroke()?.getColor() || '#3B82F6';
                        const fillColor = style?.getFill()?.getColor() || 'rgba(59,130,246,0.33)';
                        feature.setStyle(new Style({
                            fill: new Fill({ color: fillColor as any }),
                            stroke: new Stroke({ color: strokeColor as any, width: 3 }),
                        }));
                    }
                }
            });
            
            if (draggableFeature) {
                map.getTargetElement().style.cursor = 'move';
                
                // Apply hover effect only if it's a proper Feature
                if (draggableFeature instanceof Feature) {
                    const type = draggableFeature.get('type');
                    if (type === 'school-marker') {
                        // Enhance school marker on hover
                        draggableFeature.setStyle(new Style({
                            image: new CircleStyle({
                                radius: 14,
                                fill: new Fill({ color: '#10B981' }),
                                stroke: new Stroke({ color: '#ffffff', width: 4 }),
                            }),
                            text: new Text({
                                text: '🏫',
                                font: '18px sans-serif',
                                offsetY: -22,
                            }),
                        }));
                    } else if (type?.includes('-pin')) {
                        // Enhance pin on hover
                        const pinType = type.replace('-pin', '');
                        const color = pinType === 'school' ? '#3B82F6' : pinType === 'location' ? '#EF4444' : '#F59E0B';
                        const emoji = pinType === 'school' ? '🏫' : pinType === 'location' ? '📍' : '📏';
                        
                        draggableFeature.setStyle(new Style({
                            image: new CircleStyle({
                                radius: 10,
                                fill: new Fill({ color: color }),
                                stroke: new Stroke({ color: '#ffffff', width: 3 }),
                            }),
                            text: new Text({
                                text: emoji,
                                font: '16px sans-serif',
                                offsetY: -22,
                            }),
                        }));
                    } else if (type === 'catchment-circle') {
                        // Bump circle stroke width on hover for better affordance
                        const style = draggableFeature.getStyle() as Style | undefined;
                        const strokeColor = style?.getStroke()?.getColor() || '#3B82F6';
                        const fillColor = style?.getFill()?.getColor() || 'rgba(59,130,246,0.33)';
                        draggableFeature.setStyle(new Style({
                            fill: new Fill({ color: fillColor as any }),
                            stroke: new Stroke({ color: strokeColor as any, width: 5 }),
                        }));
                    }
                }
            } else if (hoveredCircleFeatures.length > 0) {
                // If not considered draggableFeature due to filter, still bump circles under cursor
                hoveredCircleFeatures.forEach(feature => {
                    if (feature instanceof Feature) {
                        const style = feature.getStyle() as Style | undefined;
                        const strokeColor = style?.getStroke()?.getColor() || '#3B82F6';
                        const fillColor = style?.getFill()?.getColor() || 'rgba(59,130,246,0.33)';
                        feature.setStyle(new Style({
                            fill: new Fill({ color: fillColor as any }),
                            stroke: new Stroke({ color: strokeColor as any, width: 5 }),
                        }));
                    }
                });
            } else if (hasCircle) {
                // circles are draggable, show move cursor
                map.getTargetElement().style.cursor = 'move';
            } else {
                map.getTargetElement().style.cursor = '';
            }
        });

        // Add drag functionality for pins and school markers
        const selectInteraction = new Select({
            condition: click,
            filter: (feature) => {
                const type = feature.get('type');
                return type === 'school-marker' || 
                       type === 'catchment-circle' ||
                       (type?.includes('-pin') && feature.get('pinId'));
            },
            style: undefined // Don't change style when selected
        });

        // Use Translate interaction for better real-time dragging performance
        const translateInteraction = new Translate({
            features: selectInteraction.getFeatures(),
        });

        // Track dragging state
        let draggedFeature: Feature | null = null;
        let draggedSchoolId: string | null = null;

        // Handle drag start event
        translateInteraction.on('translatestart', (event) => {
            const feature = event.features.getArray()[0];
            if (feature) {
                // Add dragging visual feedback
                map.getTargetElement().style.cursor = 'grabbing';
                isDragging = true;
                draggedFeature = feature;
                
                // Store the school ID for real-time updates
                const featureType = feature.get('type');
                if (featureType === 'school-marker') {
                    draggedSchoolId = feature.get('schoolId');
                } else if (featureType === 'catchment-circle') {
                    draggedSchoolId = feature.get('schoolId') || null;
                } else if (featureType?.includes('-pin')) {
                    const pinId = feature.get('pinId');
                    const pinData = placedPins.find(p => p.id === pinId);
                    draggedSchoolId = pinData?.schoolId || null;
                }
            }
        });

        // Throttle real-time updates for better performance
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE = 16; // ~60fps

        // Handle real-time dragging (this fires continuously during drag)
        translateInteraction.on('translating', (event) => {
            const now = Date.now();
            if (now - lastUpdateTime < UPDATE_THROTTLE) return;
            lastUpdateTime = now;

            const feature = event.features.getArray()[0];
            if (!feature) return;

            const geometry = feature.getGeometry();
            if (!geometry) return;

            // If dragging a school marker or pin (Point)
            if (geometry instanceof Point) {
                const coordinates = geometry.getCoordinates();
                const lonLat = toLonLat(coordinates);
                const newCoordinates: [number, number] = [lonLat[1], lonLat[0]];
                if (draggedSchoolId) {
                    updateCirclesRealtime(draggedSchoolId, newCoordinates);
                }
            } else if ((geometry as any).getCenter && (geometry as any).getRadius) {
                // Dragging a circle: compute center's lon/lat from current circle geometry
                const center = (geometry as any).getCenter();
                const lonLat = toLonLat(center);
                const newCoordinates: [number, number] = [lonLat[1], lonLat[0]];
                const schoolId = draggedSchoolId || feature.get('schoolId');
                if (schoolId) {
                    updateCirclesRealtime(schoolId, newCoordinates);
                }
            }
        });

        // Handle drag end event
        translateInteraction.on('translateend', (event) => {
            const feature = event.features.getArray()[0];
            if (!feature) return;

            // Reset cursor and mark that we finished dragging
            map.getTargetElement().style.cursor = 'move';
            
            // Clear drag tracking variables
            draggedFeature = null;
            draggedSchoolId = null;
            
            // Keep isDragging true briefly to prevent click events
            setTimeout(() => {
                isDragging = false;
            }, 50);

            const geometry = feature.getGeometry();
            if (!geometry) return;

            const featureType = feature.get('type');

            // End drag for points (school marker or pin)
            if (geometry instanceof Point) {
                const coordinates = geometry.getCoordinates();
                const lonLat = toLonLat(coordinates);
                const newCoordinates: [number, number] = [lonLat[1], lonLat[0]];

                if (featureType === 'school-marker') {
                    const schoolId = feature.get('schoolId');
                    if (schoolId && onSchoolDrag) {
                        onSchoolDrag(schoolId, newCoordinates);
                    }
                } else if (featureType?.includes('-pin')) {
                    const pinId = feature.get('pinId');
                    if (pinId && onPinDrag) {
                        onPinDrag(pinId, newCoordinates);
                    }
                }
            } else if ((geometry as any).getCenter && featureType === 'catchment-circle') {
                // End drag for circle: compute new center and move the associated school
                const center = (geometry as any).getCenter();
                const lonLat = toLonLat(center);
                const newCoordinates: [number, number] = [lonLat[1], lonLat[0]];
                const schoolId = feature.get('schoolId');
                if (schoolId && onSchoolDrag) {
                    onSchoolDrag(schoolId, newCoordinates);
                }
            }
        });

        // Function to update circles in real-time during drag
        const updateCirclesRealtime = (schoolId: string, newCoordinates: [number, number]) => {
            // Find the corresponding circle data to get radius information
            circles.forEach(circleData => {
                if (circleData.schoolId === schoolId && circleData.olFeature && circleData.isVisible) {
                    // Convert radius to meters
                    let radiusInMeters: number;
                    switch (circleData.unit) {
                        case 'km':
                            radiusInMeters = circleData.radius * 1000;
                            break;
                        case 'miles':
                            radiusInMeters = circleData.radius * 1609.344;
                            break;
                        default: // meters
                            radiusInMeters = circleData.radius;
                            break;
                    }
                    
                    // Create new circle geometry with updated center using the same method as the main component
                    const centerPoint = fromLonLat([newCoordinates[1], newCoordinates[0]]);
                    const lat = newCoordinates[0] * Math.PI / 180; // Convert to radians
                    const projectionScale = Math.cos(lat); // Scale factor for Web Mercator at this latitude
                    const adjustedRadius = radiusInMeters / projectionScale;
                    const newGeometry = new Circle(centerPoint, adjustedRadius);
                    
                    // Update the geometry of the existing feature
                    circleData.olFeature.setGeometry(newGeometry);

                    // Update circle labels in real-time too
                    const labelFeatures = vectorSource.getFeatures().filter(feature => 
                        feature.get('type') === 'catchment-label' && 
                        feature.get('circleId') === circleData.id
                    );

                    labelFeatures.forEach(labelFeature => {
                        const angle = 0; // east side
                        const labelX = centerPoint[0] + adjustedRadius * Math.cos(angle);
                        const labelY = centerPoint[1] + adjustedRadius * Math.sin(angle);
                        labelFeature.setGeometry(new Point([labelX, labelY]));
                    });
                }
            });
        };

        map.addInteraction(selectInteraction);
        map.addInteraction(translateInteraction);
        
        selectInteractionRef.current = selectInteraction;
        translateInteractionRef.current = translateInteraction;

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                // Clean up interactions
                if (selectInteractionRef.current) {
                    mapRef.current.removeInteraction(selectInteractionRef.current);
                }
                if (translateInteractionRef.current) {
                    mapRef.current.removeInteraction(translateInteractionRef.current);
                }
                
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

        const existingSchoolMarkers = vectorSourceRef.current.getFeatures().filter(f => f.get('type') === 'school-marker');
        
        // Create a map of existing markers by school ID
        const existingMarkerMap = new Map();
        existingSchoolMarkers.forEach(marker => {
            const schoolId = marker.get('schoolId');
            if (schoolId) {
                existingMarkerMap.set(schoolId, marker);
            }
        });

        // Remove markers for schools that no longer exist
        existingSchoolMarkers.forEach(marker => {
            const schoolId = marker.get('schoolId');
            const currentSchool = favoriteSchools.find(s => s.id === schoolId);
            if (!currentSchool) {
                vectorSourceRef.current!.removeFeature(marker);
            }
        });

        // Add or update school markers
        favoriteSchools.forEach(school => {
            const existingMarker = existingMarkerMap.get(school.id);
            
            if (existingMarker) {
                // Update existing marker position if coordinates changed
                const currentGeom = existingMarker.getGeometry() as Point;
                const currentCoords = toLonLat(currentGeom.getCoordinates());
                const newCoords = [school.coordinates[1], school.coordinates[0]]; // [lng, lat] for fromLonLat
                
                // Only update if coordinates actually changed (with small tolerance for floating point)
                const tolerance = 0.000001;
                if (Math.abs(currentCoords[0] - newCoords[0]) > tolerance || 
                    Math.abs(currentCoords[1] - newCoords[1]) > tolerance) {
                    currentGeom.setCoordinates(fromLonLat(newCoords));
                }
                
                // Update marker name if it changed
                if (existingMarker.get('name') !== school.name) {
                    existingMarker.set('name', school.name);
                }
            } else {
                // Create new marker
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
            }
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

        // Get existing circles and labels
        const existingCircles = vectorSourceRef.current.getFeatures().filter(f => 
            f.get('type') === 'catchment-circle'
        );
        const existingLabels = vectorSourceRef.current.getFeatures().filter(f => 
            f.get('type') === 'catchment-label'
        );

        // Create a map of existing circles by ID for efficient lookup
        const existingCircleMap = new Map();
        existingCircles.forEach(circle => {
            const circleId = circle.get('circleId');
            if (circleId) {
                existingCircleMap.set(circleId, circle);
            }
        });

        // Remove circles that are no longer in the current state or not visible
        existingCircles.forEach(circle => {
            const circleId = circle.get('circleId');
            const currentCircle = circles.find(c => c.id === circleId);
            if (!currentCircle || !currentCircle.isVisible) {
                vectorSourceRef.current!.removeFeature(circle);
            }
        });

        // Remove all labels (we'll recreate them)
        existingLabels.forEach(label => {
            vectorSourceRef.current!.removeFeature(label);
        });

        // Add or update current visible circles
        circles.forEach(circle => {
            if (circle.isVisible && circle.olFeature) {
                const existingFeature = existingCircleMap.get(circle.id);
                
                if (existingFeature) {
                    // Update existing feature style and geometry
                    const style = new Style({
                        fill: new Fill({
                            color: `${circle.color}55`, // Add transparency
                        }),
                        stroke: new Stroke({
                            color: circle.color,
                            width: 3,
                        }),
                    });
                    existingFeature.setStyle(style);
                    // Update geometry if it's different (this happens during drag)
                    existingFeature.setGeometry(circle.olFeature.getGeometry());
                } else {
                    // Add new feature
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
                }

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

            {/* Drag Hint */}
            {(favoriteSchools.length > 0 || placedPins.length > 0) && 
             formData.pinPlacementMode === 'off' && !measurementMode && (
                <div className="absolute bottom-4 left-4 bg-gray-800/90 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-10">
                    💡 Drag pins and school markers to reposition catchment areas
                </div>
            )}
        </div>
    );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;