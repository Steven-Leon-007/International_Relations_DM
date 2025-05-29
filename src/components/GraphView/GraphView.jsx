import { useJsApiLoader } from '@react-google-maps/api';
import { useRef } from 'react';
import MapBackground from '../MapBackground/MapBackground.jsx';
import GraphCanvas from '../GraphCanvas/GraphCanvas.jsx';
import './GraphView.css';

const GraphView = () => {
  const mapRef = useRef();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  return isLoaded ? (
    <div className="main-container">
      <MapBackground onLoad={(map) => (mapRef.current = map)} />
      <GraphCanvas isMapLoaded={isLoaded} />
    </div>
  ) : (
    <div>Cargando mapa...</div>
  );
};

export default GraphView;
