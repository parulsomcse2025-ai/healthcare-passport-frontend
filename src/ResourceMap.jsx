import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ResourceMap.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ResourceMap({ resources }) {
  return (
    <div className="resource-map-container">
      <h2>Healthcare Resources Map</h2>

      <p className="resource-map-description">
        View suitable healthcare resources on the map.
      </p>

      <MapContainer
        center={[28.9845, 77.7064]}
        zoom={13}
        scrollWheelZoom={true}
        className="resource-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {resources.map((resource) => {
          if (!resource.latitude || !resource.longitude) {
            return null;
          }

          return (
            <Marker
              key={resource.id}
              position={[
                resource.latitude,
                resource.longitude,
              ]}
            >
              <Popup>
                <div>
                  <h3>{resource.name}</h3>

                  <p>
                    <strong>Type:</strong>{" "}
                    {resource.resource_type}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {resource.address}
                    {resource.city
                      ? `, ${resource.city}`
                      : ""}
                  </p>

                  {resource.phone && (
                    <p>
                      <strong>Phone:</strong>{" "}
                      {resource.phone}
                    </p>
                  )}

                  <p>
                    <strong>Status:</strong>{" "}
                    {resource.availability_status}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default ResourceMap;