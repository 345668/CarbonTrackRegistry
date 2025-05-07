import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Project } from '@/types';
import { getCategoryColor } from '@/lib/utils';
import L from 'leaflet';

// Default map settings
const DEFAULT_LONGITUDE = -0.1;
const DEFAULT_LATITUDE = 51.5;
const DEFAULT_ZOOM = 1.5;

interface MapComponentProps {
  projects?: Project[];
  height?: string;
  showPopup?: boolean;
  interactive?: boolean;
}

// This component adjusts the map view to fit all markers
function FitBounds({ projects }: { projects: Project[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!projects.length) return;
    
    const bounds = L.latLngBounds([]);
    projects.forEach(project => {
      if (project.latitude && project.longitude) {
        const lat = parseFloat(project.latitude);
        const lng = parseFloat(project.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend([lat, lng]);
        }
      }
    });
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, projects]);
  
  return null;
}

export default function MapComponent({ 
  projects = [], 
  height = '400px',
  showPopup = true,
  interactive = true
}: MapComponentProps) {
  const [projectsWithCoords, setProjectsWithCoords] = useState<Project[]>([]);
  
  // Fix default marker icon issue in Leaflet
  useEffect(() => {
    // Fix the icon paths
    // @ts-ignore - Leaflet has a known issue with TypeScript definitions
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // Filter projects with valid coordinates
  useEffect(() => {
    if (projects.length > 0) {
      // Add sample coordinates for development purposes
      const validProjects = projects.map(p => {
        // For demonstration, assign sample coordinates to projects 
        // that don't have them yet
        if (!p.longitude && !p.latitude) {
          const demoCoords: Record<number, [string, string]> = {
            1: ["-46.633", "-23.55"], // São Paulo
            2: ["13.404", "52.52"],   // Berlin
            3: ["77.209", "28.614"],  // New Delhi
            4: ["2.352", "48.857"],   // Paris
            5: ["-74.006", "40.713"], // New York
          };
          
          const coords = demoCoords[p.id] || [
            (Math.random() * 360 - 180).toFixed(3), 
            (Math.random() * 170 - 85).toFixed(3)
          ];
          
          return {
            ...p,
            longitude: coords[0],
            latitude: coords[1]
          };
        }
        return p;
      });
      
      setProjectsWithCoords(validProjects);
    }
  }, [projects]);

  // Create custom marker icons for each project
  const createCustomIcon = (category: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${getCategoryColor(category, true)}; box-shadow: 0 0 0 3px rgba(255,255,255,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  return (
    <div 
      style={{ width: '100%', height }}
      className="rounded overflow-hidden bg-gray-100"
    >
      <MapContainer 
        style={{ height: '100%', width: '100%' }}
        dragging={interactive}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        attributionControl={true}
        center={[DEFAULT_LATITUDE, DEFAULT_LONGITUDE] as [number, number]} 
        zoom={DEFAULT_ZOOM}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {projectsWithCoords.map(project => {
          if (!project.latitude || !project.longitude) return null;
          
          const lat = parseFloat(project.latitude);
          const lng = parseFloat(project.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker 
              key={project.id}
              position={[lat, lng]}
              icon={createCustomIcon(project.category)}
            >
              {showPopup && (
                <Popup>
                  <div style={{ maxWidth: "300px" }}>
                    <div 
                      className="w-full h-1 rounded-full mb-2" 
                      style={{ backgroundColor: getCategoryColor(project.category, true) }}
                    ></div>
                    <h3 className="text-sm font-semibold">{project.name}</h3>
                    <p className="text-xs opacity-70">{project.location}</p>
                    <div className="flex items-center mt-1 gap-1.5">
                      <span className="text-xs inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                        {project.category}
                      </span>
                      <span className="text-xs inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs mt-2">
                      {project.description.substring(0, 100)}
                      {project.description.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
        
        <FitBounds projects={projectsWithCoords} />
      </MapContainer>
    </div>
  );
}