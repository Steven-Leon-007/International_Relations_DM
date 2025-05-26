import React, { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import graphData from '../../assets/graphData.json';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import * as d3 from 'd3';
import "./GraphView.css";

const containerStyle = {
    width: '100%',
    height: '100vh',
    position: 'absolute'
};

const center = {
    lat: 0,
    lng: 0,
};

const darkMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    // Ocultar todo el texto excepto en el agua
    { elementType: 'labels.text.fill', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.stroke', stylers: [{ visibility: 'off' }] },
    {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ color: '#757575' }],
    },
    {
        featureType: 'administrative.land_parcel',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.stroke',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'transit',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: 'off' }],
    },
    // Mantener labels del agua visibles
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#000000' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#3d3d3d', visibility: 'on' }],
    },
];


const zoom = 2;

const GraphView = () => {
    const [data, setData] = useState(null);
    const [flagImages, setFlagImages] = useState({});
    const graphRef = useRef();
    const mapRef = useRef();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    // Utiliza la proyección de Google Maps para convertir lat/lng a x/y
    const projectLatLng = useCallback((lat, lng) => {
        const scale = Math.pow(2, zoom) * 256;
        const siny = Math.sin((lat * Math.PI) / 180);
        const y = 0.5 - (Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI));
        const x = (lng + 180) / 360;

        return {
            x: x * scale,
            y: y * scale,
        };
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const positionedNodes = graphData.nodes.map(node => {
            const { x, y } = projectLatLng(node.lat, node.lon);
            return {
                ...node,
                fx: x,
                fy: y,
            };
        });

        setData({ ...graphData, nodes: positionedNodes });

        const images = {};
        graphData.nodes.forEach(node => {
            const code = node.code?.toLowerCase();
            const img = new Image();
            img.src = `https://flagcdn.com/w160/${code}.png`;
            images[node.id] = img;
        });

        setFlagImages(images);
    }, [isLoaded, projectLatLng]);

    const getColorFromWeight = (weight) => {
        if (weight >= 7) return 'green';
        if (weight >= 3) return 'orange';
        if (weight >= 0) return 'gray';
        if (weight >= -4) return 'red';
        return 'darkred';
    };

    return isLoaded ? (
        <div className='main-container'>
            < GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                options={{
                    disableDefaultUI: true,
                    gestureHandling: 'none',
                    zoomControl: false,
                    draggable: false,
                    styles: darkMapStyles
                }
                }
                onLoad={(map) => {
                    mapRef.current = map;
                }}>
            </GoogleMap >
            {data && (
                <ForceGraph2D
                    ref={graphRef}
                    graphData={data}
                    enableZoomInteraction={false}
                    enablePanInteraction={false}
                    cooldownTicks={0}
                    zoom={1}
                    minZoom={0.1}
                    maxZoom={5}
                    onEngineStop={() => {
                        graphRef.current.zoomToFit(3000, 100); // opcional: recentra al detenerse la física
                    }}

                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const img = flagImages[node.id];
                        const size = 8 + 4 / globalScale; // ajusta tamaño según zoom
                        if (img && img.complete) {
                            ctx.drawImage(img, node.x - size / 2, node.y - size / 2, size, size);
                        } else {
                            // Fallback por si la imagen no ha cargado
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                            ctx.fillStyle = '#ccc';
                            ctx.fill();
                        }
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillStyle = 'white';
                        ctx.fillText(node.id, node.x, node.y + size / 2 + 2);
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        const size = 12;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={d => Math.abs(d.weight) * 0.001}
                    linkWidth={3}
                    linkColor={link => getColorFromWeight(link.weight)}
                />
            )}
        </div >
    ) : (<div>Cargando mapa...</div>);
};

export default GraphView;
