import React, { useRef, useEffect, useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import graphData from "../../assets/graphData.json";
import RelatedCountriesModal from "../RelatedCountriesModal/RelatedCountriesModal";
import RelationWeightModal from "../RelationWeightModal/RelationWeightModal";
import "./GraphView.css";
import PropagationModal from "../PropagationModal/PropagationModal";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const center = {
  lat: 32.056918,
  lng: 20.532671,
};

function getColorByWeight(weight) {
  if (weight >= 7) return "#00cc66";
  if (weight > 4) return "#ffcc00";
  if (weight > 0) return "#ff9900";
  if (weight < 0) return "#cc0000";
  return "#999999";
}

const GraphMap = () => {
  const mapRef = useRef(null);
  const [viewport, setViewport] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: 2,
  });

  //states
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusedNode, setFocusedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [weightValue, setWeightValue] = useState(0);
  const [propagatedChanges, setPropagatedChanges] = useState([]);
  const [showPropagationModal, setShowPropagationModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { nodes } = graphData;

  const [edges, setEdges] = useState(graphData.edges);

  let displayedNodes = nodes;
  let displayedEdges = edges;

  if (focusedNode) {
    const relatedEdges = edges.filter(
      edge => edge.from === focusedNode.id || edge.to === focusedNode.id
    );
    const relatedNodeIds = new Set(
      relatedEdges.flatMap(edge => [edge.from, edge.to])
    );

    displayedNodes = nodes.filter(n => relatedNodeIds.has(n.id));
    displayedEdges = relatedEdges;
  }

  function handleNodeClick(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    setSelectedNode(node);
  }

  const getNodesFromEdge = (edge) => {
    if (!edge) return [];
    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);
    return [fromNode, toNode].filter(Boolean);
  };

  useEffect(() => {
    if (selectedEdge) {
      setWeightValue(selectedEdge.weight);
    }
  }, [selectedEdge]);



  const lineFeatures = displayedEdges
    .map(({ from, to, weight }) => {
      const fromNode = nodes.find((n) => n.id === from);
      const toNode = nodes.find((n) => n.id === to);
      if (!fromNode || !toNode) return null;

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [fromNode.position.lng, fromNode.position.lat],
            [toNode.position.lng, toNode.position.lat],
          ],
        },
        properties: {
          weight,
          color: getColorByWeight(weight),
          edgeId: `${from}-${to}`
        },
      };
    })
    .filter(Boolean);

  const geojson = {
    type: "FeatureCollection",
    features: lineFeatures,
  };

  const lineLayer = {
    id: "edges",
    type: "line",
    source: "edges",
    paint: {
      "line-color": ["get", "color"],
      "line-width": 3.5,
      "line-opacity": 0.8,
    },
  };

  function handleViewOnMap(node) {
    setFocusedNode(node);       // guardar nodo central
    setSelectedNode(null);      // cerrar el modal
  }
  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={viewport}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        renderWorldCopies={false}
        minZoom={2}
        maxZoom={12}
        interactiveLayerIds={['edges']}

        onMouseMove={(event) => {
          const features = event.target.queryRenderedFeatures(event.point, {
            layers: ['edges']
          });

          if (features.length > 0) {
            event.target.getCanvas().style.cursor = 'pointer';
          } else {
            event.target.getCanvas().style.cursor = '';
          }
        }}
        onMouseLeave={() => {
          mapRef.current.getCanvas().style.cursor = '';
        }}

        onClick={(event) => {
          const feature = event.features?.[0];
          if (feature?.layer?.id === 'edges') {
            const { edgeId } = feature.properties;
            const edge = edges.find(e => `${e.from}-${e.to}` === edgeId);
            if (edge) {
              setSelectedEdge(edge);
            }
          }
        }}
      >
        {/* Renderizar nodos */}
        {displayedNodes.map(({ id, position, code }) => (
          <Marker
            key={id}
            longitude={position.lng}
            latitude={position.lat}
            anchor="center"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(id);
              }}
              style={{
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              <img
                src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                alt={`${id} flag`}
                style={{
                  width: "24px",
                  height: "18px",
                  borderRadius: "2px",
                  boxShadow: "0 0 3px rgba(0, 0, 0, 0.5)",
                }}
                className="country-flag"
              />
            </div>
          </Marker>

        ))}

        <Source id="edges" type="geojson" data={geojson}>
          <Layer {...lineLayer} />
        </Source>
      </Map>

      {selectedNode && (
        <RelatedCountriesModal
          visible={!!selectedNode}
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onViewOnMap={handleViewOnMap}
        />
      )}

      <div className="title-box">
        <h2>
          Relaciones Internacionales
        </h2>
      </div>

      {focusedNode && (
        <div style={{ position: "absolute", top: 60, left: 20, zIndex: 1 }}>
          <button onClick={() => setFocusedNode(null)} className="btn">
            Regresar
          </button>
        </div>
      )}

      {selectedEdge && (
        <RelationWeightModal
          visible={!!selectedEdge}
          value={weightValue}
          onChange={setWeightValue}
          onClose={() => setSelectedEdge(null)}
          onSave={() => {
            const { from, to } = selectedEdge;

            setEdges(prevEdges => {
              const propagated = [];
              // Obtener peso anterior
              const oldEdge = prevEdges.find(e => e.from === from && e.to === to);
              const oldWeight = oldEdge?.weight ?? 0;

              // Actualizar la arista seleccionada
              const updatedEdges = prevEdges.map(e =>
                e.from === from && e.to === to ? { ...e, weight: weightValue } : e
              );

              const getEdgeWeight = (a, b) => {
                const edge = updatedEdges.find(e =>
                  (e.from === a && e.to === b) || (e.from === b && e.to === a)
                );
                return edge?.weight ?? null;
              };

              const thirdCountries = new Set();
              updatedEdges.forEach(e => {
                if (e.from === from || e.to === from || e.from === to || e.to === to) {
                  const other = e.from === from || e.from === to ? e.to : e.from;
                  if (other !== from && other !== to) {
                    thirdCountries.add(other);
                  }
                }
              });

              const improved = weightValue > oldWeight;

              const extraAdjustedEdges = updatedEdges.map(e => {
                // Solo relaciones que conecten a un país involucrado (from/to) con un tercero
                const isFromRelated = (e.from === from && e.to !== to && e.to !== from);
                const isToRelated = (e.to === to && e.from !== from && e.from !== to);
                const isToFromRelated = (e.to === from && e.from !== from && e.from !== to);
                const isFromToRelated = (e.from === to && e.to !== from && e.to !== to);

                if (!(isFromRelated || isToRelated || isToFromRelated || isFromToRelated)) return e;

                const third = [e.from, e.to].find(c => c !== from && c !== to);
                const weightWithFrom = getEdgeWeight(third, from);
                const weightWithTo = getEdgeWeight(third, to);

                if (weightWithFrom == null || weightWithTo == null) return e;

                const avg = (weightWithFrom + weightWithTo) / 2;

                let delta = 0;
                if (improved) {
                  if (avg > 4) delta = 1;
                  else if (avg < -4) delta = -1;
                } else {
                  if (avg > 4) delta = -1;
                  else if (avg < -4) delta = 1;
                }

                if (delta === 0) return e;

                const newWeight = Math.max(-10, Math.min(10, e.weight + delta));

                propagated.push({
                  from: e.from,
                  to: e.to,
                  oldWeight: e.weight,
                  newWeight: newWeight
                });

                return { ...e, weight: newWeight };
              });
              setPropagatedChanges(prev => {
                const unique = [...prev, ...propagated].filter(
                  (item, index, self) =>
                    index === self.findIndex(
                      t =>
                        t.from === item.from &&
                        t.to === item.to &&
                        t.oldWeight === item.oldWeight &&
                        t.newWeight === item.newWeight
                    )
                );
                return unique;
              });
              setShowPropagationModal(true);

              return extraAdjustedEdges;
            });

            setSelectedEdge(null);
          }}
          countries={getNodesFromEdge(selectedEdge)}
        />

      )}

      {showPropagationModal && (
        <PropagationModal
          visible={showPropagationModal}
          changes={propagatedChanges}
          onClose={() => { setShowPropagationModal(false); setPropagatedChanges([]) }}
          nodes={graphData.nodes}
        />
      )}

      <div className="legend-box">
        <strong>Fortaleza de la relación:</strong><br />
        <div className="legend-item green">
          <span className="dot" style={{ color: "#00cc66" }}>●</span> Muy fuerte (≥ 7)
        </div>
        <div className="legend-item yellow">
          <span className="dot" style={{ color: "#ffcc00" }}>●</span> Fuerte (5–6)
        </div>
        <div className="legend-item orange">
          <span className="dot" style={{ color: "#ff9900" }}>●</span> Media (1–4)
        </div>
        <div className="legend-item red">
          <span className="dot" style={{ color: "#cc0000" }}>●</span> Negativa (&lt; 0)
        </div>
        <div className="legend-item gray">
          <span className="dot" style={{ color: "#999999" }}>●</span> Neutra (0)
        </div>
      </div>

      <div className={`instructions-drawer ${drawerOpen ? 'open' : ''}`}>
        <button className="toggle-button" onClick={() => setDrawerOpen(!drawerOpen)}>
          📝 Instrucciones
        </button>
        <div className="instructions-content">          
          <ul>
            <li>Haz clic en una bandera para ver sus relaciones.</li>
            <li>Haz clic en una línea para modificar su peso.</li>
            <li>Usa el botón "Regresar" para ver todos los países.</li>
            <li>Los colores indican la intensidad de las relaciones.</li>
            <li>Los cambios pueden afectar otras relaciones.</li>
          </ul>
        </div>
      </div>

    </>


  );
}

export default GraphMap;
