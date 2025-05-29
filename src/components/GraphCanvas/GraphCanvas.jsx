import { useEffect, useState, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import graphData from '../../assets/graphData.json';
import RelationWeightModal from '../RelationWeightModal/RelationWeightModal.jsx';
import RelatedCountriesModal from '../RelatedCountriesModal/RelatedCountriesModal.jsx';
import { link } from 'd3';

const ZOOM = 2;

const GraphCanvas = ({ isMapLoaded }) => {
  const graphRef = useRef();
  const [graph, setGraph] = useState(null);
  const [flagImages, setFlagImages] = useState({});

  const [selectedLink, setSelectedLink] = useState(null);
  const [newWeight, setNewWeight] = useState(0);

  const [relatedCountries, setRelatedCountries] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(false);

  const [filteredGraph, setFilteredGraph] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);


  const projectLatLng = useCallback((lat, lng) => {
    const scale = Math.pow(2, ZOOM) * 256;
    const siny = Math.sin((lat * Math.PI) / 180);
    const y = 0.5 - (Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI));
    const x = (lng + 180) / 360;
    return { x: x * scale, y: y * scale };
  }, []);

  useEffect(() => {
    if (!isMapLoaded) return;

    const positionedNodes = graphData.nodes.map(node => {
      const { x, y } = projectLatLng(node.lat, node.lon);
      return { ...node, fx: x, fy: y };
    });

    setGraph({ ...graphData, nodes: positionedNodes });

    const images = {};
    graphData.nodes.forEach(node => {
      const code = node.code?.toLowerCase();
      const img = new Image();
      img.src = `https://flagcdn.com/w160/${code}.png`;
      images[node.id] = img;
    });

    setFlagImages(images);
  }, [isMapLoaded, projectLatLng]);

  const getColorFromWeight = (weight) => {
    if (weight >= 7) return 'green';
    if (weight >= 3) return 'orange';
    if (weight >= 0) return 'gray';
    if (weight >= -4) return 'red';
    return 'darkred';
  };

  const handleSave = () => {
    setGraph(prev => ({
      ...prev,
      links: prev.links.map(link =>
        link === selectedLink ? { ...link, weight: newWeight } : link
      )
    }));
    setSelectedLink(null);
  };

  const handleClose = () => {
    setSelectedLink(null);
  };

  if (!graph) return null;

  const handleShowOnMap = () => {
    const visibleNodeIds = new Set([
      selectedNodeId,
      ...relatedCountries.map(rc => rc.id)
    ]);

    const visibleNodes = graph.nodes
      .filter(n => visibleNodeIds.has(n.id))
      .map(n => ({
        ...n,
        fx: n.fx,
        fy: n.fy
      }));


    const nodeMap = Object.fromEntries(visibleNodes.map(n => [n.id, n]));

    const visibleLinks = graphData.links.filter(l =>
        visibleNodeIds.has(l.source.id || l.source) &&
        visibleNodeIds.has(l.target.id || l.target)
      )
      .map(l => ({
        ...l,
        source: nodeMap[l.source.id || l.source],
        target: nodeMap[l.target.id || l.target]
      }));

    setFilteredGraph({ nodes: visibleNodes, links: visibleLinks });
    setIsModalVisible(false);
  };


  return (
    <>
      <ForceGraph2D
        ref={graphRef}
        graphData={filteredGraph || graph}
        enableZoomInteraction={false}
        enablePanInteraction={false}
        cooldownTicks={0}
        zoom={1}
        minZoom={0.1}
        maxZoom={5}
        onEngineStop={() => {
          if (!filteredGraph) {
            graphRef.current.zoomToFit(3000, 100);
          }
        }}

        nodeCanvasObject={(node, ctx, globalScale) => {
          const img = flagImages[node.id];
          const size = 8 + 4 / globalScale;
          if (img && img.complete) {
            ctx.drawImage(img, node.x - size / 2, node.y - size / 2, size, size);
          } else {
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
        linkDirectionalParticleSpeed={(d) => (d.weight != -10) ? ((d.weight + 10) * 0.0004) : 0.0004}
        linkDirectionalParticleWidth={5}
        linkWidth={3}
        linkColor={(link) => getColorFromWeight(link.weight)}

        onLinkClick={(link) => {
          setSelectedLink(link);
          setNewWeight(link.weight);
        }}

        onNodeClick={(node) => {
          const relatedNodes = [node.id];
          const relatedLinks = [];

          graphData.links.forEach(entry => {
            if (entry.source.id === node.id) {
              relatedNodes.push(entry.target.id);
              relatedLinks.push(entry);
            } else if (entry.target.id === node.id) {
              relatedNodes.push(entry.source.id);
              relatedLinks.push(entry);
            }
          });

          const relatedCountriesFull = graphData.nodes.filter(n => relatedNodes.includes(n.id));

          setRelatedCountries(relatedCountriesFull);
          setSelectedNodeId(node.id);
          setIsModalVisible(true);
          setSelectedCountry(node.id)
        }}




      />
      {filteredGraph && (
        <button
          onClick={() => setFilteredGraph(null)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 12px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          Mostrar todo el grafo
        </button>
      )}

      <RelationWeightModal
        visible={!!selectedLink}
        value={newWeight}
        onChange={setNewWeight}
        onClose={handleClose}
        onSave={handleSave}
      />

      <RelatedCountriesModal
        visible={isModalVisible}
        countries={relatedCountries}
        onClose={() => setIsModalVisible(false)}
        onShowOnMap={handleShowOnMap}
        selectedCountry={selectedCountry}
      />

    </>
  );
};

export default GraphCanvas;
