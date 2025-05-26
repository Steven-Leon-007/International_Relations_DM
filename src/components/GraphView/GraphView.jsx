// src/components/GraphView.jsx
import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import graphData from '../../assets/graphData.json';

const GraphView = () => {
    const [data, setData] = useState(null);
    const [flagImages, setFlagImages] = useState({});
    const graphRef = useRef();

    useEffect(() => {
        setData(graphData);

        const images = {};
        graphData.nodes.forEach(node => {
            const code = node.code?.toLowerCase();
            const img = new Image();
            img.src = `https://flagcdn.com/w160/${code}.png`; // usa 40px por rendimiento
            images[node.id] = img;
        });

        setFlagImages(images);
    }, []);

    useEffect(() => {
        if (!graphRef.current) return;
        // Aumentar separación entre nodos
        graphRef.current.d3Force('charge').strength(-300);
    }, [data]);

    const getColorFromWeight = (weight) => {
        if (weight >= 7) return 'green';
        if (weight >= 3) return 'orange';
        if (weight >= 0) return 'gray';
        if (weight >= -4) return 'darkred';
        return 'red';
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            {data && (
                <ForceGraph2D
                    ref={graphRef}
                    graphData={data}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const img = flagImages[node.id];
                        const size = 16 + 4 / globalScale; // ajusta tamaño según zoom
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
