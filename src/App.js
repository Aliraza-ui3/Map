import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

const App = () => {
  const [roads, setRoads] = useState([]);
  const [markers, setMarkers] = useState([
    {
      key: 1,
      position: [48.8566, 2.3522],
      popup: "Eiffel Tower, Paris",
      isStart: true,
    },
    {
      key: 2,
      position: [48.8738, 2.2950],
      popup: "Arc de Triomphe, Paris",
      isFinish: true,
    },
  ]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [movingStart, setMovingStart] = useState(false);
  const [movingEnd, setMovingEnd] = useState(false);

  const customIcon = new Icon({
    iconUrl: require('./assets/placeholder.png'), // Replace with the path to your custom icon image
    iconSize: [38, 38], // Adjust the size of the icon as needed
    iconAnchor: [19, 38], // The point of the icon which will correspond to marker's location
    popupAnchor: [0, -38] // The point from which the popup should open relative to the iconAnchor
  });

  useEffect(() => {
    const fetchRoads = async () => {
      const overpassQuery = `
        [out:json];
        (
          way["highway"](around:10000,48.8566,2.3522);
        );
        out geom;
      `;

      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
          headers: {
            'Content-Type': 'text/plain'
          }
        });
        const roadData = response.data.elements.map(element => {
          return {
            id: element.id,
            coordinates: element.geometry.map(coord => [coord.lat, coord.lon])
          };
        });
        setRoads(roadData);
        console.log('Fetched Roads:', roadData);  // Log to verify fetched data
      } catch (error) {
        console.error('Error fetching roads data:', error);
      }
    };

    fetchRoads();
  }, []);

  const handleMarkerMouseDown = (markerKey) => {
    if (markers.find(marker => marker.key === markerKey).isStart) {
      setMovingStart(true);
    } else if (markers.find(marker => marker.key === markerKey).isFinish) {
      setMovingEnd(true);
    }
    setMouseIsPressed(true);
  };

  const handleMarkerMouseEnter = (markerKey, latlng) => {
    if (!mouseIsPressed) return;
    if (movingStart) {
      const updatedMarkers = markers.map(marker =>
        marker.key === markerKey ? { ...marker, position: [latlng.lat, latlng.lng] } : marker
      );
      setMarkers(updatedMarkers);
    } else if (movingEnd) {
      const updatedMarkers = markers.map(marker =>
        marker.key === markerKey ? { ...marker, position: [latlng.lat, latlng.lng] } : marker
      );
      setMarkers(updatedMarkers);
    }
  };

  const handleMarkerMouseUp = () => {
    setMouseIsPressed(false);
    setMovingStart(false);
    setMovingEnd(false);
  };

  return (
    <MapContainer center={[48.864716, 2.349014]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map(marker => (
        <Marker
          key={marker.key}
          position={marker.position}
          icon={customIcon}
          draggable={true}
          onMouseDown={() => handleMarkerMouseDown(marker.key)}
          onMouseEnter={(event) => handleMarkerMouseEnter(marker.key, event.latlng)}
          onMouseUp={handleMarkerMouseUp}
        >
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
      {roads.map((road, idx) => (
        <Polyline key={idx} positions={road.coordinates} color="blue" />
      ))}
    </MapContainer>
  );
};

export default App;
