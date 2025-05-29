import { GoogleMap } from '@react-google-maps/api';
import "./MapBackground.css";

const containerStyle = {
  width: '100%',
  height: '100vh',
  position: 'absolute'
};

const center = { lat: 0, lng: 0 };

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


const MapBackground = ({ onLoad }) => (
  <GoogleMap
    mapContainerStyle={containerStyle}
    center={center}
    zoom={2}
    options={{
      disableDefaultUI: true,
      gestureHandling: 'none',
      zoomControl: false,
      draggable: false,
      styles: darkMapStyles
    }}
    onLoad={onLoad}
  />
);

export default MapBackground;
