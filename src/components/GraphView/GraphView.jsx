import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import graphData from '../../assets/graphData.json';
import * as d3 from 'd3';
import worldMap from '../../assets/Mercator_projection_Square.jpeg';

const projection = d3.geoMercator().scale(150).translate([-80, 80]);

const GraphView = () => {
    const [data, setData] = useState(null);
    const [flagImages, setFlagImages] = useState({});
    const graphRef = useRef();
    const [mapImage, setMapImage] = useState(null);

    useEffect(() => {
        // Posicionar nodos con coordenadas geográficas
        const positionedNodes = graphData.nodes.map(node => {
            const [x, y] = projection([node.lon, node.lat]);
            return {
                ...node,
                fx: x,
                fy: y
            };
        });

        setData({ ...graphData, nodes: positionedNodes });

        // Cargar imágenes de banderas
        const images = {};
        graphData.nodes.forEach(node => {
            const code = node.code?.toLowerCase();
            const img = new Image();
            img.src = `https://flagcdn.com/w160/${code}.png`; // tamaño más ligero
            images[node.id] = img;
        });

        setFlagImages(images);
    }, []);

    useEffect(() => {
        const img = new Image();
        img.src = worldMap;
        img.onload = () => setMapImage(img);
    }, []);

    const getColorFromWeight = (weight) => {
        if (weight >= 7) return 'green';
        if (weight >= 3) return 'orange';
        if (weight >= 0) return 'gray';
        if (weight >= -4) return 'red';
        return 'darkred';
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            {data && (
                <ForceGraph2D
                    ref={graphRef}
                    graphData={data}
                    enableZoomInteraction={true}
                    enablePanInteraction={true}
                    cooldownTicks={0}
                    zoom={1}
                    minZoom={0.1}
                    maxZoom={5}
                    onEngineStop={() => {
                        graphRef.current.zoomToFit(3000, 100); // opcional: recentra al detenerse la física
                    }}
                    onRenderFramePre={(ctx) => {
                        if (!mapImage) return;

                        const canvas = ctx.canvas;
                        ctx.save();

                        // Centrar la imagen en el canvas
                        const imgW = mapImage.width;
                        const imgH = mapImage.height;
                        const x = (canvas.width - imgW) / 2;
                        const y = (canvas.height - imgH) / 2;

                        ctx.drawImage(mapImage, x, y, imgW, imgH);

                        ctx.restore();
                    }}

                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const img = flagImages[node.id];
                        const size = 12 + 4 / globalScale; // ajusta tamaño según zoom
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
                        ctx.fillStyle = 'black';
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
        </div>
    );
};

export default GraphView;
