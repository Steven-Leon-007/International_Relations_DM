import React, { useRef, useEffect, useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import graphData from "../../assets/graphData.json";
import mapStyles from "../../assets/mapStyles.json";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const center = {
  lat: 32.056918,
  lng: 20.532671,
};

function getColorByWeight(weight) {
  if (weight > 7) return "#00cc66";
  if (weight > 4) return "#ffcc00";
  if (weight > 0) return "#ff9900";
  if (weight < 0) return "#cc0000";
  return "#999999";
}

function GraphMap() {
  const mapRef = useRef(null);
  const [viewport, setViewport] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: 2,
  });

  const { nodes, edges } = graphData;

  // Construir las líneas como una FeatureCollection
  const lineFeatures = edges
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
      "line-width": 2,
      "line-opacity": 0.8,
    },
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={viewport}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      renderWorldCopies={false}
      minZoom={2}
      maxZoom={8}
    >
      {/* Renderizar nodos */}
      {nodes.map(({ id, position }) => (
        <Marker
          key={id}
          longitude={position.lng}
          latitude={position.lat}
          anchor="center"
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "2px solid #000000",
            }}
          />
        </Marker>
      ))}

      {/* Renderizar aristas */}
      <Source id="edges" type="geojson" data={geojson}>
        <Layer {...lineLayer} />
      </Source>
    </Map>
  );
}

export default GraphMap;
