import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import { LatLngBoundsExpression } from "leaflet";
import { BoundaryPolygon } from "@/data/boundarySeeds";

interface BoundaryMapProps {
  polygons: BoundaryPolygon[];
  highlightedId?: string;
  bounds?: LatLngBoundsExpression;
  height?: number | string;
}

export default function BoundaryMap({ polygons, highlightedId, bounds, height = 360 }: BoundaryMapProps) {
  const fallbackBounds: LatLngBoundsExpression = bounds ?? [
    [-34.36, 18.36],
    [-33.78, 18.72],
  ];

  return (
    <div className="rounded-lg overflow-hidden border border-border" style={{ height }}>
      <MapContainer
        bounds={fallbackBounds}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polygons.map((p) => {
          const isHighlighted = p.id === highlightedId;
          return (
            <Polygon
              key={p.id}
              positions={p.coords}
              pathOptions={{
                color: isHighlighted ? "hsl(180 70% 35%)" : "hsl(220 70% 50%)",
                weight: isHighlighted ? 3 : 2,
                fillOpacity: isHighlighted ? 0.35 : 0.15,
              }}
            >
              <Tooltip>{p.name}</Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}
