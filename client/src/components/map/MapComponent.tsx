import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Project } from '@/types';
import { getCategoryColor } from '@/lib/utils';

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

export default function MapComponent({ 
  projects = [], 
  height = '400px',
  showPopup = true,
  interactive = true
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  
  const [projectsWithCoords, setProjectsWithCoords] = useState<Project[]>([]);

  // Set Mapbox token - using a hardcoded value for now since we can't access the environment variable on client-side
  useEffect(() => {
    // Hardcoded token for this app specifically
    mapboxgl.accessToken = 'pk.eyJ1IjoicmFkaWNhbHplcm8iLCJhIjoiY2x0dmRzOXB5MHZyMjJybXVod3NoamtmMCJ9.e2ZwPTkMSd1GPHUlCpescQ';
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Only initialize map once

    // Create new map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
      interactive: interactive
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [interactive]);

  // Create project markers and calculate bounds
  useEffect(() => {
    if (!map.current || projectsWithCoords.length === 0) return;

    // Clear any existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    
    // Add markers for each project
    projectsWithCoords.forEach(project => {
      if (!project.longitude || !project.latitude) return;
      
      const longitude = parseFloat(project.longitude);
      const latitude = parseFloat(project.latitude);
      
      // Skip invalid coordinates
      if (isNaN(longitude) || isNaN(latitude)) return;
      
      // Extend bounds
      bounds.extend([longitude, latitude]);
      
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'project-marker';
      markerEl.style.position = 'relative';
      markerEl.style.cursor = 'pointer';
      
      const dot = document.createElement('div');
      dot.style.width = '16px';
      dot.style.height = '16px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = getCategoryColor(project.category, true);
      dot.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.5)';
      markerEl.appendChild(dot);
      
      // Create map marker and handle popup
      if (map.current) {
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([longitude, latitude])
          .addTo(map.current);
          
        // Save marker reference for cleanup
        markersRef.current.push(marker);
        
        // Add click handler for popup
        if (showPopup) {
          markerEl.addEventListener('click', () => {
            // Remove any existing popup
            if (popupRef.current) {
              popupRef.current.remove();
              popupRef.current = null;
            }
            
            if (map.current) {
              // Create popup with project info
              const popupHTML = `
                <div class="p-2">
                  <div 
                    class="w-full h-1 rounded-full mb-2" 
                    style="background-color: ${getCategoryColor(project.category, true)}"
                  ></div>
                  <h3 class="text-sm font-semibold">${project.name}</h3>
                  <p class="text-xs opacity-70">${project.location}</p>
                  <div class="flex items-center mt-1 gap-1.5">
                    <span class="text-xs inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                      ${project.category}
                    </span>
                    <span class="text-xs inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                      ${project.status}
                    </span>
                  </div>
                  <p class="text-xs mt-2">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
                </div>
              `;
              
              // Create and display popup
              popupRef.current = new mapboxgl.Popup({ closeButton: true, maxWidth: '300px' })
                .setLngLat([longitude, latitude])
                .setHTML(popupHTML)
                .addTo(map.current);
            }
          });
        }
      }
    });
    
    // Fit map to bounds if we have at least one valid project
    if (!bounds.isEmpty() && map.current) {
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 12,
        duration: 1000
      });
    }
  }, [projectsWithCoords, showPopup]);

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height }}
      className="rounded overflow-hidden bg-gray-100"
    />
  );
}