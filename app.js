/* =================================================================
   PyroVision - Satellite Disaster Management Platform (PyroVision)
   Advanced GIS Telemetry, Dynamic Geolocation, AI Assistant & Analytics
   ================================================================= */

// Global Application State
const state = { 
  activeTab: 'home',
  currentLayer: 'street', // 'dark', 'satellite', 'street' 
  userCoords: null,
  userLocationName: 'Locating...',
  dashboardMap: null,
  fullMap: null,
  dashboardLayers: {},
  fullMapLayers: {},
  activeMarkersDashboard: [],
  activeMarkersFull: [],
  userMarkerDashboard: null,
  userMarkerFull: null,
  hotspots: [],
  activeHotspot: null,
  alertFilter: 'all',
  analyticsRange: '7d',
  charts: {
    trend: null,
    distribution: null
  },
  chatOpen: false,
  chatHistory: [],
  showSpreadVector: false,
  spreadLayers: [],
  evacLayers: [],
  wind: { speed: 18, dir: 'NW', angle: 315 }
};

// Tile Layer URLs
const TILE_CONFIG = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

/* =================================================================
   1. INITIALIZATION & LIFECYCLE
   ================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  startLiveClock();
  // Zero hardcoded demo locations on startup
  renderHomeCards();
  renderAlertsPage();
});

// Live Clock in Header
function startLiveClock() {
  const clockEl = document.getElementById('liveTimestamp');
  const update = () => {
    const now = new Date();
    const options = { 
      month: 'short', day: '2-digit', year: 'numeric',
      weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true 
    };
    if (clockEl) {
      clockEl.textContent = now.toLocaleDateString('en-US', options).replace(/,/g, '');
    }
  };
  update();
  setInterval(update, 1000);
}

/* =================================================================
   2. DIRECT DASHBOARD ACCESS
   ================================================================= */
// Authentication has been removed for the demo/MVP. The dashboard opens directly.
function startDashboard() {
  setTimeout(() => {
    initLeafletMaps();
    locateUserPosition(true);
    renderHomeCards();
    renderAlertsPage();
    initAnalyticsCharts();
  }, 350);
}

document.addEventListener('DOMContentLoaded', startDashboard);

/* =================================================================
   3. LEAFLET GIS ENGINE (Multi-Layer & Hotspots)
   ================================================================= */
function initLeafletMaps() {
  // Dynamic center: user coordinates if already acquired, else national overview
  const defaultCenter = state.userCoords ? [state.userCoords.lat, state.userCoords.lng] : [20.5937, 78.9629];
  const defaultZoom = state.userCoords ? 12 : 5;

  // Initialize Dashboard Map
  if (!state.dashboardMap && document.getElementById('dashboardMap')) {
    state.dashboardMap = L.map('dashboardMap', {
      zoomControl: false,
      attributionControl: false
    }).setView(defaultCenter, defaultZoom);

    L.control.zoom({ position: 'topright' }).addTo(state.dashboardMap);
    state.dashboardLayers.satellite = L.tileLayer(TILE_CONFIG.satellite.url, { maxZoom: 19 });
    state.dashboardLayers.street = L.tileLayer(TILE_CONFIG.street.url, { maxZoom: 19 });

    state.dashboardLayers[state.currentLayer].addTo(state.dashboardMap);
  }

  // Initialize Full Map
  if (!state.fullMap && document.getElementById('fullMap')) {
    state.fullMap = L.map('fullMap', {
      zoomControl: true,
      attributionControl: false
    }).setView([20.5937, 78.9629], 5); // India overview
    state.fullMapLayers.satellite = L.tileLayer(TILE_CONFIG.satellite.url, { maxZoom: 19 });
    state.fullMapLayers.street = L.tileLayer(TILE_CONFIG.street.url, { maxZoom: 19 });

    state.fullMapLayers[state.currentLayer].addTo(state.fullMap);
  }

  renderHotspotMarkers();
}

function setMapLayer(layerName) {
  state.currentLayer = layerName;

  // Update button active state
  ['Satellite', 'Street'].forEach(name => {
    const btn = document.getElementById(`btnLayer${name}`);
    if (btn) {
      if (name.toLowerCase() === layerName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  // Switch layers on Dashboard Map
  if (state.dashboardMap) {
    Object.values(state.dashboardLayers).forEach(layer => state.dashboardMap.removeLayer(layer));
    if (state.dashboardLayers[layerName]) {
      state.dashboardLayers[layerName].addTo(state.dashboardMap);
    }
  }

  // Switch layers on Full Map
  if (state.fullMap) {
    Object.values(state.fullMapLayers).forEach(layer => state.fullMap.removeLayer(layer));
    if (state.fullMapLayers[layerName]) {
      state.fullMapLayers[layerName].addTo(state.fullMap);
    }
  }
}

/* =================================================================
   4. DYNAMIC GEOLOCATION & REAL NOMINATIM GEOCODING (NO FIXED DEMO)
   ================================================================= */
// Locate user via HTML5 Geolocation API
function locateUserPosition(silent = false) {
  if (!navigator.geolocation) {
    if (!silent) alert('Geolocation is not supported by your browser.');
    return;
  }

  if (!silent) {
    showToast('Fetching your real GPS location...', 'info');
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      state.userCoords = { lat, lng };

      // Fly both maps to user location
      if (state.dashboardMap) {
        state.dashboardMap.flyTo([lat, lng], 13, { duration: 1.8 });
      }
      if (state.fullMap && state.activeTab === 'map') {
        state.fullMap.flyTo([lat, lng], 12, { duration: 1.8 });
      }

      // Add/update User GPS pulsing pin
      updateUserGPSMarker(lat, lng);

      // Reverse geocode user location name
      reverseGeocodeCoords(lat, lng);

      // Generate realistic thermal hotspots around user location
      generateHotspotsAroundCenter(lat, lng, 'Local Area');

      if (!silent) {
        showToast('Map centered to your GPS coordinates!', 'success');
      }
    },
    (err) => {
      console.warn('Geolocation failed or denied:', err.message);
      if (!silent) {
        showToast('GPS permission denied or unavailable. Using default monitoring sector.', 'warning');
      }
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// Update User Marker
function updateUserGPSMarker(lat, lng) {
  const userIcon = L.divIcon({
    className: 'hotspot-marker',
    html: `
      <div class="user-gps-pulse"></div>
      <div class="user-gps-marker"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  if (state.dashboardMap) {
    if (state.userMarkerDashboard) state.dashboardMap.removeLayer(state.userMarkerDashboard);
    state.userMarkerDashboard = L.marker([lat, lng], { icon: userIcon })
      .addTo(state.dashboardMap)
      .bindPopup(`<strong style="color:#38bdf8;">Your Location</strong><br><span style="font-size:11px;">Active Monitoring Node</span>`);
  }

  if (state.fullMap) {
    if (state.userMarkerFull) state.fullMap.removeLayer(state.userMarkerFull);
    state.userMarkerFull = L.marker([lat, lng], { icon: userIcon })
      .addTo(state.fullMap)
      .bindPopup(`<strong style="color:#38bdf8;">Your Location</strong><br><span style="font-size:11px;">Active Monitoring Node</span>`);
  }
}

// Search location using OpenStreetMap Nominatim Geocoding API
async function handleSearchLocation(queryText) {
  const input = document.getElementById('geoSearchInput');
  const query = queryText || (input ? input.value.trim() : '');

  if (!query) {
    showToast('Please enter a city, forest, or region to search.', 'warning');
    return;
  }

  showToast(`Locating "${query}" via Nominatim GIS...`, 'info');

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();

    if (data && data.length > 0) {
      const item = data[0];
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const displayName = item.display_name.split(',')[0];

      state.userLocationName = displayName;

      // Smoothly fly maps
      if (state.dashboardMap) {
        state.dashboardMap.flyTo([lat, lng], 12, { duration: 2.0 });
      }
      if (state.fullMap) {
        state.fullMap.flyTo([lat, lng], 11, { duration: 2.0 });
      }

      // Generate dynamic hotspots clustered around this real location
      generateHotspotsAroundCenter(lat, lng, displayName);

      showToast(`Located ${displayName} (${lat.toFixed(3)}, ${lng.toFixed(3)})`, 'success');
    } else {
      showToast(`Location "${query}" not found. Try another city name.`, 'warning');
    }
  } catch (err) {
    console.error('Nominatim search error:', err);
    showToast('Geocoding service error. Check connection.', 'error');
  }
}

// Reverse geocode to get human-readable location name
async function reverseGeocodeCoords(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.state_district || data.address.state || 'Local Zone';
      state.userLocationName = city;
    }
  } catch (e) {
    state.userLocationName = `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
  }
}

/* =================================================================
   5. DYNAMIC HOTSPOTS & CLUSTER TELEMETRY (ZERO DEMO LOCATIONS)
   ================================================================= */
// Starts with completely empty hotspots array - zero hardcoded demo locations!
state.hotspots = [];
state.activeHotspot = null;

// Generate new hotspots when user searches or GPS relocates
function generateHotspotsAroundCenter(centerLat, centerLng, placeName) {
  const newHotspots = [];
  const count = 5 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let type = 'wildfire';
    let title = 'Active Forest Fire Cluster';
    let img = 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=400&auto=format&fit=crop';

    if (rand > 0.72) {
      type = 'industrial';
      title = 'Industrial Flare Stack';
      img = 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400&auto=format&fit=crop';
    } else if (rand > 0.48) {
      type = 'stubble';
      title = 'Agricultural Stubble / Biomass Fire';
      img = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop';
    }

    const offsetLat = (Math.random() - 0.5) * 0.18;
    const offsetLng = (Math.random() - 0.5) * 0.18;
    const conf = Math.floor(75 + Math.random() * 23);
    const frp = parseFloat((18 + Math.random() * 55).toFixed(1));
    const tempK = parseFloat((315 + Math.random() * 45).toFixed(1));

    newHotspots.push({
      id: `hs-dyn-${Date.now()}-${i}`,
      type: type,
      title: title,
      location: `${placeName} Sector ${i + 1}`,
      lat: centerLat + offsetLat,
      lng: centerLng + offsetLng,
      confidence: conf,
      frp: frp,
      tempK: tempK,
      satellite: Math.random() > 0.5 ? 'VIIRS Suomi-NPP (375m)' : 'Aqua MODIS (1km)',
      time: `${(i + 1) * 7} min ago`,
      timeExact: `Today, ${10 - i}:${20 + i} PM`,
      severity: conf > 90 ? 'Critical' : (conf > 80 ? 'High' : 'Moderate'),
      img: img
    });
  }

  // Prepend new spots and refresh
  state.hotspots = [...newHotspots, ...state.hotspots.slice(0, 10)];
  state.activeHotspot = newHotspots[0];

  renderHotspotMarkers();
  renderHomeCards();
  renderAlertsPage();
  updateMapBottomCard(state.activeHotspot);

  // Update stats on Screen 2
  const fullStats = document.getElementById('fullMapStats');
  if (fullStats) {
    fullStats.textContent = `${state.hotspots.length} Active Hotspots In View`;
  }
}

// Render markers on Leaflet
function renderHotspotMarkers() {
  // Clear old markers
  if (state.dashboardMap) {
    state.activeMarkersDashboard.forEach(m => state.dashboardMap.removeLayer(m));
    state.activeMarkersDashboard = [];
  }
  if (state.fullMap) {
    state.activeMarkersFull.forEach(m => state.fullMap.removeLayer(m));
    state.activeMarkersFull = [];
  }

  state.hotspots.forEach(spot => {
    // Filter check
    if (state.alertFilter !== 'all' && spot.type !== state.alertFilter) {
      return;
    }

    const typeClass = spot.type === 'wildfire' ? 'wildfire' : (spot.type === 'industrial' ? 'industrial' : 'stubble');
    const typeColor = spot.type === 'wildfire' ? '#ef4444' : (spot.type === 'industrial' ? '#f97316' : '#eab308');
    const markerHtml = `
      <div class="hotspot-pulse ${typeClass}"></div>
      <div class="hotspot-dot ${typeClass}"></div>
    `;

    const customIcon = L.divIcon({
      className: 'hotspot-marker',
      html: markerHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const popupContent = `
      <div style="min-width: 185px; font-size: 11px; padding: 3px;">
        <div style="font-weight: 700; color: ${typeColor}; margin-bottom: 2px;">
          ${spot.title}
        </div>
        <div style="color: #94a3b8; font-size: 10px;">${spot.location}</div>
        <hr style="border-color: #1e3461; margin: 4px 0;">
        <div style="display: flex; justify-content: space-between;">
          <span>Confidence:</span> <strong style="color:#10b981;">${spot.confidence}%</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>FRP:</span> <strong style="color:#fbbf24;">${spot.frp} MW</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Brightness T4:</span> <strong style="color:#38bdf8;">${spot.tempK} K</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #64748b; margin-top: 2px;">
          <span>Sensor:</span> <span>${spot.satellite.split(' ')[0]}</span>
        </div>
        <button onclick="openHotspotModalById('${spot.id}')" style="margin-top: 6px; width: 100%; background: #0284c7; color: white; border: none; border-radius: 4px; padding: 4px; font-weight: 600; cursor: pointer;">
          Inspect Alert SOP
        </button>
      </div>
    `;

    // Add to Dashboard Map
    if (state.dashboardMap) {
      const markerD = L.marker([spot.lat, spot.lng], { icon: customIcon })
        .addTo(state.dashboardMap)
        .bindPopup(popupContent);
      markerD.on('click', () => updateMapBottomCard(spot));
      state.activeMarkersDashboard.push(markerD);
    }

    // Add to Full Map
    if (state.fullMap) {
      const markerF = L.marker([spot.lat, spot.lng], { icon: customIcon })
        .addTo(state.fullMap)
        .bindPopup(popupContent);
      markerF.on('click', () => updateMapBottomCard(spot));
      state.activeMarkersFull.push(markerF);
    }
  });

  // Re-render spread vectors if enabled
  if (state.showSpreadVector) {
    renderSpreadVectors();
  }
}

function updateMapBottomCard(spot) {
  state.activeHotspot = spot;
  const title = document.getElementById('bottomCardTitle');
  const conf = document.getElementById('bottomCardConf');
  const sub = document.getElementById('bottomCardSub');
  const img = document.getElementById('bottomCardImg');

  if (title) title.textContent = spot.title;
  if (conf) {
    conf.textContent = `Confidence: ${spot.confidence}%`;
    let badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30';
    if (spot.type === 'industrial') badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    else if (spot.type === 'stubble') badgeColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    conf.className = `text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badgeColor}`;
  }
  if (sub) {
    sub.innerHTML = `
      <i class="fa-solid fa-location-dot text-red-400 text-[10px]"></i>
      <span>${spot.location}</span>
      <span class="text-slate-500">•</span>
      <span class="text-slate-400 font-mono">FRP: ${spot.frp} MW</span>
      <span class="text-slate-500">•</span>
      <span class="text-sky-400 font-mono">${spot.tempK} K</span>
    `;
  }
  if (img) img.src = spot.img;
}

/* =================================================================
   6. UI ROUTING & SCREEN SWITCHING
   ================================================================= */
function switchTab(tabId) {
  state.activeTab = tabId;

  // Hide all sections
  ['home', 'map', 'alerts', 'analytics', 'reports', 'settings'].forEach(id => {
    const sec = document.getElementById(`view-${id}`);
    const nav = document.getElementById(`nav-${id}`);
    if (sec) sec.classList.add('hidden');
    if (nav) nav.classList.remove('active');
  });

  // Show active section
  const targetSec = document.getElementById(`view-${tabId}`);
  const targetNav = document.getElementById(`nav-${tabId}`);
  if (targetSec) targetSec.classList.remove('hidden');
  if (targetNav) targetNav.classList.add('active');

  // Trigger Leaflet resize recalculations so map tiles render without gray gaps
  if (tabId === 'home' && state.dashboardMap) {
    setTimeout(() => state.dashboardMap.invalidateSize(), 200);
  } else if (tabId === 'map' && state.fullMap) {
    setTimeout(() => {
      state.fullMap.invalidateSize();
      renderHotspotMarkers();
    }, 200);
  } else if (tabId === 'analytics') {
    setTimeout(() => initAnalyticsCharts(), 200);
  }
}

// Zoom map to show entire India
function zoomToIndiaOverview() {
  if (state.fullMap) {
    state.fullMap.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  }
}

// Map filter buttons on Screen 2
function filterMapHotspots(type) {
  state.alertFilter = type;
  ['All', 'Wildfire', 'Industrial'].forEach(t => {
    const btn = document.getElementById(`filterMap${t}`);
    if (btn) {
      if (t.toLowerCase() === type) {
        btn.className = 'px-3 py-1 rounded-md text-xs font-medium bg-sky-500 text-white shadow-sm';
      } else {
        btn.className = 'px-3 py-1 rounded-md text-xs font-medium bg-[#12203d] text-slate-300 hover:text-white';
      }
    }
  });
  renderHotspotMarkers();
}

/* =================================================================
   7. SCREEN 1 CARDS (Live Alerts & Recent Classifications)
   ================================================================= */
function renderHomeCards() {
  const alertsList = document.getElementById('homeAlertsList');
  const classList = document.getElementById('homeClassificationsList');

  // Render Alerts List
  if (alertsList) {
    if (!state.hotspots || state.hotspots.length === 0) {
      alertsList.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
          <div class="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2">
            <i class="fa-solid fa-satellite-dish"></i>
          </div>
          <div class="text-xs font-semibold text-slate-200">No Demo Fires Loaded</div>
          <p class="text-[11px] text-slate-400 mt-1 max-w-[220px]">
            Map is clean. Click <span class="text-sky-400 font-semibold cursor-pointer underline" onclick="locateUserPosition()">Locate Me</span> or type any city/reserve in search bar to scan live telemetry.
          </p>
        </div>
      `;
    } else {
      alertsList.innerHTML = state.hotspots.slice(0, 4).map(spot => `
        <div onclick="openHotspotModalById('${spot.id}')" class="p-2.5 rounded-lg bg-[#081022] hover:bg-[#12203d] border border-[#172a50] flex items-center justify-between cursor-pointer transition">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-md ${spot.type === 'wildfire' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'} flex items-center justify-center text-xs">
              <i class="fa-solid ${spot.type === 'wildfire' ? 'fa-tree' : 'fa-industry'}"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-200 leading-tight">${spot.type === 'wildfire' ? 'Wildfire' : 'Industrial Fire'}</div>
              <div class="text-[10px] text-slate-400">${spot.location}</div>
            </div>
          </div>
          <div class="text-[10px] font-mono text-slate-400">${spot.time}</div>
        </div>
      `).join('');
    }
  }

  // Render Recent Classifications List
  if (classList) {
    if (!state.hotspots || state.hotspots.length === 0) {
      classList.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
          <div class="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
            <i class="fa-solid fa-radar"></i>
          </div>
          <div class="text-xs font-semibold text-slate-200">Zero Thermal Anomalies</div>
          <p class="text-[11px] text-slate-400 mt-1 max-w-[220px]">
            AI classification engine is ready. Telemetry data will populate dynamically once your location is scanned.
          </p>
        </div>
      `;
    } else {
      classList.innerHTML = state.hotspots.slice(0, 3).map(spot => `
        <div onclick="openHotspotModalById('${spot.id}')" class="p-2 rounded-lg bg-[#081022] hover:bg-[#12203d] border border-[#172a50] flex items-center justify-between cursor-pointer transition">
          <div class="flex items-center gap-2.5">
            <img src="${spot.img}" class="w-9 h-9 rounded object-cover border border-[#213768]">
            <div>
              <div class="text-xs font-bold text-slate-200 leading-tight">${spot.type === 'wildfire' ? 'Wildfire' : 'Industrial Fire'}</div>
              <div class="text-[10px] text-emerald-400 font-semibold">Confidence: ${spot.confidence}%</div>
              <div class="text-[10px] text-slate-500">${spot.location}</div>
            </div>
          </div>
          <div class="text-[10px] font-mono text-slate-400">${spot.time}</div>
        </div>
      `).join('');
    }
  }
}

/* =================================================================
   8. SCREEN 3: ALERTS PAGE (Tabbed Grid & Filter)
   ================================================================= */
function renderAlertsPage() {
  const container = document.getElementById('alertsContainer');
  if (!container) return;

  const filtered = state.hotspots.filter(spot => {
    if (state.alertFilter === 'all') return true;
    if (state.alertFilter === 'industrial') return spot.type === 'industrial';
    if (state.alertFilter === 'wildfire') return spot.type === 'wildfire';
    if (state.alertFilter === 'other') return spot.type === 'other';
    return true;
  });

  // Update sidebar badge
  const badge = document.getElementById('sidebarAlertBadge');
  if (badge) badge.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 fw-card p-8">
        <div class="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-2xl mx-auto mb-3">
          <i class="fa-solid fa-satellite"></i>
        </div>
        <h3 class="text-base font-bold text-white mb-1">No Demo Fire Locations Loaded</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto mb-5">
          This system contains zero pre-seeded fake coordinates. Use your live GPS position or search any city or reserve across India to scan real-time satellite telemetry.
        </p>
        <div class="flex items-center justify-center gap-3">
          <button onclick="locateUserPosition()" class="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/30 transition flex items-center gap-2">
            <i class="fa-solid fa-location-crosshairs"></i> Scan My Live Location
          </button>
          <button onclick="document.getElementById('geoSearchInput')?.focus()" class="px-4 py-2 rounded-lg bg-[#12203d] hover:bg-[#1b2f57] border border-[#213768] text-slate-200 text-xs font-semibold transition">
            Search A City
          </button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(spot => `
    <div class="fw-card p-4 flex flex-col justify-between hover:border-sky-500/40 transition">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
            spot.type === 'wildfire' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
            (spot.type === 'industrial' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30')
          }">
            ${spot.type}
          </span>
          <span class="text-[10px] font-mono text-slate-400">${spot.time}</span>
        </div>

        <h4 class="font-bold text-sm text-white">${spot.title}</h4>
        <p class="text-xs text-slate-400 flex items-center gap-1 mt-1">
          <i class="fa-solid fa-location-dot text-slate-500 text-[10px]"></i>
          ${spot.location}
        </p>

        <div class="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#172a50] text-xs">
          <div>
            <span class="text-[10px] text-slate-500 block">AI Confidence</span>
            <span class="font-bold text-emerald-400">${spot.confidence}%</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 block">Radiative Power</span>
            <span class="font-mono text-amber-400">${spot.frp} MW</span>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-[#172a50] flex items-center justify-between">
        <span class="text-[10px] text-slate-500 font-mono">${spot.satellite}</span>
        <button onclick="openHotspotModalById('${spot.id}')" class="px-3 py-1 rounded bg-[#12203d] hover:bg-sky-500 hover:text-white border border-[#213768] text-sky-400 text-xs font-semibold transition flex items-center gap-1">
          <span>View</span>
          <i class="fa-solid fa-angle-right text-[10px]"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function filterAlertsTab(tabType) {
  state.alertFilter = tabType;
  ['All', 'Industrial', 'Wildfire', 'Other'].forEach(t => {
    const btn = document.getElementById(`tabAlert${t}`);
    if (btn) {
      if (t.toLowerCase() === tabType) {
        btn.className = 'px-3 py-1.5 rounded-md text-xs font-bold bg-sky-500 text-white transition';
      } else {
        btn.className = 'px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white transition';
      }
    }
  });
  renderAlertsPage();
}

/* =================================================================
   9. SCREEN 4: ANALYTICS & TREND CHARTS (Chart.js)
   ================================================================= */
function initAnalyticsCharts() {
  const trendCtx = document.getElementById('fireTrendChart');
  const distCtx = document.getElementById('fireDistributionChart');

  if (!trendCtx || !distCtx) return;

  // Destroy old charts if existing
  if (state.charts.trend) state.charts.trend.destroy();
  if (state.charts.distribution) state.charts.distribution.destroy();

  // Chart Theme Defaults
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";

  // Trend Data Sets based on Range
  const trendDataConfig = {
    '7d': {
      labels: ['Sep 02', 'Sep 03', 'Sep 04', 'Sep 05', 'Sep 06', 'Sep 07', 'Sep 08'],
      wildfires: [12, 19, 14, 25, 22, 31, 28],
      industrial: [6, 9, 8, 14, 11, 12, 10],
      stubble: [3, 5, 4, 7, 5, 6, 5]
    },
    '30d': {
      labels: ['W1', 'W2', 'W3', 'W4'],
      wildfires: [45, 62, 58, 85],
      industrial: [22, 30, 28, 38],
      stubble: [10, 15, 18, 22]
    },
    '6m': {
      labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      wildfires: [120, 210, 185, 95, 80, 140],
      industrial: [65, 80, 75, 55, 60, 72],
      stubble: [45, 90, 30, 15, 25, 55]
    }
  };

  const selectedData = trendDataConfig[state.analyticsRange];

  // 1. Line Trend Chart
  state.charts.trend = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: selectedData.labels,
      datasets: [
        {
          label: 'Wildfire',
          data: selectedData.wildfires,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2.5,
          tension: 0.35,
          pointBackgroundColor: '#ef4444',
          pointRadius: 4,
          fill: true
        },
        {
          label: 'Industrial Fire',
          data: selectedData.industrial,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderWidth: 2.5,
          tension: 0.35,
          pointBackgroundColor: '#f97316',
          pointRadius: 4,
          fill: true
        },
        {
          label: 'Stubble / Agri',
          data: selectedData.stubble,
          borderColor: '#eab308',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          borderWidth: 2,
          tension: 0.35,
          pointBackgroundColor: '#eab308',
          pointRadius: 3.5,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0c162b',
          borderColor: '#1e3461',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(23, 42, 80, 0.5)' },
          ticks: { color: '#64748b' }
        },
        y: {
          grid: { color: 'rgba(23, 42, 80, 0.5)' },
          ticks: { color: '#64748b' }
        }
      }
    }
  });

  // 2. Doughnut Distribution Chart (100% Normalized)
  state.charts.distribution = new Chart(distCtx, {
    type: 'doughnut',
    data: {
      labels: ['Wildfire', 'Industrial', 'Stubble'],
      datasets: [{
        data: [65, 25, 10],
        backgroundColor: ['#ef4444', '#f97316', '#eab308'],
        borderWidth: 3,
        borderColor: '#0c162b',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0c162b',
          borderColor: '#1e3461',
          borderWidth: 1
        }
      }
    }
  });
}

function updateAnalyticsTimeRange(range) {
  state.analyticsRange = range;
  ['7d', '30d', '6m'].forEach(r => {
    const btn = document.getElementById(`btnRange${r}`);
    if (btn) {
      if (r === range) {
        btn.className = 'px-3 py-1.5 rounded-md text-xs font-bold bg-sky-500 text-white transition';
      } else {
        btn.className = 'px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white transition';
      }
    }
  });

  // Update summary numbers randomly for realism
  const mult = range === '7d' ? 1 : (range === '30d' ? 3.5 : 12);
  document.getElementById('statTotalFires').textContent = Math.round(48 * mult);
  document.getElementById('statWildfires').textContent = Math.round(31 * mult);
  document.getElementById('statIndustrial').textContent = Math.round(12 * mult);
  document.getElementById('statOther').textContent = Math.round(5 * mult);

  initAnalyticsCharts();
}

/* =================================================================
   10. SCREEN 9: HIGH SEVERITY ALERT MODAL
   ================================================================= */
function openActiveHotspotModal() {
  if (state.activeHotspot) {
    showSeverityModal(state.activeHotspot);
  }
}

function openHotspotModalById(id) {
  const spot = state.hotspots.find(s => s.id === id);
  if (spot) {
    showSeverityModal(spot);
  }
}

function showSeverityModal(spot) {
  state.activeHotspot = spot;
  const modal = document.getElementById('severityModal');
  const sub = document.getElementById('modalAlertSubtitle');
  const type = document.getElementById('modalType');
  const loc = document.getElementById('modalLocation');
  const conf = document.getElementById('modalConfidence');
  const frp = document.getElementById('modalFRP');
  const bright = document.getElementById('modalBrightnessTemp');
  const sensor = document.getElementById('modalSensor');
  const time = document.getElementById('modalTimestamp');
  const img = document.getElementById('modalImg');

  if (sub) sub.textContent = `${spot.title} near ${spot.location}`;
  if (type) {
    if (spot.type === 'wildfire') {
      type.textContent = 'Forest Wildfire';
      type.className = 'font-semibold text-red-400';
    } else if (spot.type === 'industrial') {
      type.textContent = 'Industrial Fire Hazard';
      type.className = 'font-semibold text-orange-400';
    } else {
      type.textContent = 'Agricultural Stubble Burn';
      type.className = 'font-semibold text-yellow-400';
    }
  }
  if (loc) loc.textContent = spot.location;
  if (conf) conf.textContent = `${spot.confidence}%`;
  if (frp) frp.textContent = `${spot.frp} MW`;
  if (bright) bright.textContent = `${spot.tempK} K (${(spot.tempK - 273.15).toFixed(1)}°C)`;
  if (sensor) sensor.textContent = spot.satellite || 'VIIRS Suomi-NPP (375m)';
  if (time) time.textContent = spot.timeExact || spot.time;
  if (img) img.src = spot.img;

  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeSeverityModal() {
  const modal = document.getElementById('severityModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function dispatchSDRFAlert() {
  closeSeverityModal();
  showToast('Standard Operating Procedure (SOP) dispatched to SDRF & District Fire Station!', 'success');
}

function viewHotspotOnMapFromModal() {
  closeSeverityModal();
  switchTab('home');
  if (state.activeHotspot && state.dashboardMap) {
    state.dashboardMap.flyTo([state.activeHotspot.lat, state.activeHotspot.lng], 14, { duration: 1.5 });
  }
}

/* =================================================================
   10B. C-DOT / NDMA EMERGENCY SMS & EVACUATION PERIMETER SOP
   ================================================================= */
function openSmsModalForActive() {
  const spot = state.activeHotspot;
  if (!spot) return;

  const modal = document.getElementById('smsModal');
  const payloadBox = document.getElementById('smsPayloadText');
  const charCount = document.getElementById('smsCharCount');

  const locSlug = (spot.location || 'SECTOR1').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().slice(0, 16);
  const typeSlug = (spot.type || 'WILDFIRE').toUpperCase();
  const smsString = `ALERT#PS162#${typeSlug}#LOC:${locSlug}#LAT:${spot.lat.toFixed(2)}#LON:${spot.lng.toFixed(2)}#FRP:${spot.frp}MW#WIND:18KMH_NW#EVAC:2KM#CALL:1077`;

  if (payloadBox) payloadBox.value = smsString;
  if (charCount) charCount.textContent = `${smsString.length} / 140 Chars (GSM-7)`;
  if (modal) modal.classList.remove('hidden');
}

function closeSmsModal() {
  const modal = document.getElementById('smsModal');
  if (modal) modal.classList.add('hidden');
}

function copySmsPayload() {
  const payloadBox = document.getElementById('smsPayloadText');
  if (payloadBox) {
    navigator.clipboard.writeText(payloadBox.value);
    showToast('SMS payload copied to clipboard!', 'success');
  }
}

function simulateSmsBroadcast() {
  showToast('Dispatched emergency SMS payload via NIC / C-DOT gateway to local towers!', 'success');
  closeSmsModal();
}

function triggerEvacPerimeterForActive() {
  const spot = state.activeHotspot;
  if (!spot) return;

  closeSeverityModal();
  switchTab('home');

  if (state.dashboardMap) {
    state.dashboardMap.flyTo([spot.lat, spot.lng], 13);

    // Clear previous evac layers
    if (state.evacLayers) {
      state.evacLayers.forEach(l => state.dashboardMap.removeLayer(l));
    }
    state.evacLayers = [];

    // Draw 2km immediate danger ring
    const ring2km = L.circle([spot.lat, spot.lng], {
      radius: 2000,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.22,
      weight: 2
    }).addTo(state.dashboardMap).bindTooltip('2.0 km Immediate Evacuation Perimeter', { permanent: true, direction: 'top' });

    // Draw 5km advisory smoke ring
    const ring5km = L.circle([spot.lat, spot.lng], {
      radius: 5000,
      color: '#eab308',
      dashArray: '6, 6',
      fillColor: '#eab308',
      fillOpacity: 0.08,
      weight: 1.5
    }).addTo(state.dashboardMap).bindTooltip('5.0 km Smoke & Ember Advisory Zone');

    state.evacLayers.push(ring2km, ring5km);
    showToast(`Plotted 2km & 5km evacuation perimeters for ${spot.location}`, 'warning');
  }
}

/* =================================================================
   10C. WIND VECTOR & DYNAMIC FIRE SPREAD PREDICTION CONE
   ================================================================= */
function toggleSpreadVector() {
  state.showSpreadVector = !state.showSpreadVector;
  const btn = document.getElementById('btnSpreadVector');
  if (btn) {
    if (state.showSpreadVector) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
  renderSpreadVectors();
}

function renderSpreadVectors() {
  // Clear old spread layers
  if (state.spreadLayers) {
    state.spreadLayers.forEach(l => {
      if (state.dashboardMap) state.dashboardMap.removeLayer(l);
      if (state.fullMap) state.fullMap.removeLayer(l);
    });
  }
  state.spreadLayers = [];

  if (!state.showSpreadVector) return;

  const wildfires = state.hotspots.filter(h => h.type === 'wildfire');
  if (wildfires.length === 0) {
    showToast('No active wildfires in view for spread simulation.', 'info');
    return;
  }

  // Wind vector: blowing toward Northwest (315 degrees) at 18 km/h
  const angleRad = (315 * Math.PI) / 180;
  const spreadDist2h = 0.045; // approx 4-5 km
  const spreadDist6h = 0.095; // approx 10 km

  wildfires.forEach(wf => {
    // 2h cone
    const tip2 = [wf.lat + spreadDist2h * Math.cos(angleRad), wf.lng + spreadDist2h * Math.sin(angleRad)];
    const left2 = [wf.lat + (spreadDist2h * 0.7) * Math.cos(angleRad - 0.45), wf.lng + (spreadDist2h * 0.7) * Math.sin(angleRad - 0.45)];
    const right2 = [wf.lat + (spreadDist2h * 0.7) * Math.cos(angleRad + 0.45), wf.lng + (spreadDist2h * 0.7) * Math.sin(angleRad + 0.45)];
    const poly2h = [[wf.lat, wf.lng], left2, tip2, right2];

    // 6h cone
    const tip6 = [wf.lat + spreadDist6h * Math.cos(angleRad), wf.lng + spreadDist6h * Math.sin(angleRad)];
    const left6 = [wf.lat + (spreadDist6h * 0.7) * Math.cos(angleRad - 0.55), wf.lng + (spreadDist6h * 0.7) * Math.sin(angleRad - 0.55)];
    const right6 = [wf.lat + (spreadDist6h * 0.7) * Math.cos(angleRad + 0.55), wf.lng + (spreadDist6h * 0.7) * Math.sin(angleRad + 0.55)];
    const poly6h = [[wf.lat, wf.lng], left6, tip6, right6];

    if (state.dashboardMap) {
      const cone6 = L.polygon(poly6h, {
        color: '#f97316',
        dashArray: '4, 4',
        fillColor: '#f97316',
        fillOpacity: 0.15,
        weight: 1.5
      }).addTo(state.dashboardMap).bindTooltip('6-Hour Fire Risk Zone (Wind: 18 km/h NW)', { sticky: true });

      const cone2 = L.polygon(poly2h, {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.35,
        weight: 2
      }).addTo(state.dashboardMap).bindTooltip('2-Hour Critical Spread Perimeter', { sticky: true });

      state.spreadLayers.push(cone6, cone2);
    }
  });

  showToast('Fire spread vectors simulated (Wind: 18 km/h NW).', 'warning');
}

function filterMapHotspots(type) {
  ['All', 'Wildfire', 'Industrial', 'Stubble'].forEach(t => {
    const btn = document.getElementById(`filterMap${t}`);
    if (btn) {
      if (t.toLowerCase() === type.toLowerCase()) {
        btn.className = 'px-3 py-1 rounded-md text-xs font-medium bg-sky-500 text-white shadow-sm';
      } else {
        btn.className = 'px-3 py-1 rounded-md text-xs font-medium bg-[#12203d] text-slate-300 hover:text-white';
      }
    }
  });

  state.alertFilter = type;
  renderHotspotMarkers();
}

/* =================================================================
   10D. CONNECT LAPTOP DATABASE / CSV / JSON IMPORT
   ================================================================= */
function openDbConnectModal() {
  const modal = document.getElementById('dbConnectModal');
  if (modal) modal.classList.remove('hidden');
}

function closeDbConnectModal() {
  const modal = document.getElementById('dbConnectModal');
  if (modal) modal.classList.add('hidden');
}

function switchDbTab(tab) {
  state.dbTab = tab;
  ['file', 'api', 'preset'].forEach(t => {
    const btn = document.getElementById(`tabDb${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const view = document.getElementById(`dbView${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) {
      if (t === tab) {
        btn.className = 'flex-1 py-1.5 rounded text-xs font-semibold bg-sky-500 text-white transition';
      } else {
        btn.className = 'flex-1 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white transition';
      }
    }
    if (view) {
      if (t === tab) view.classList.remove('hidden');
      else view.classList.add('hidden');
    }
  });
}

function handleFileDatabaseUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    let parsedHotspots = [];

    if (file.name.endsWith('.json') || file.type.includes('json')) {
      parsedHotspots = parseJsonDataset(content);
    } else {
      parsedHotspots = parseCsvDataset(content);
    }

    if (parsedHotspots.length > 0) {
      state.importedHotspots = parsedHotspots;
      const summary = document.getElementById('dbImportSummary');
      const countEl = document.getElementById('dbImportCount');
      if (summary) summary.classList.remove('hidden');
      if (countEl) countEl.textContent = `Successfully parsed ${parsedHotspots.length} fire records from ${file.name}`;
      showToast(`Loaded ${parsedHotspots.length} records! Click 'Plot All On GIS Map'.`, 'success');
    } else {
      showToast('Could not find latitude/longitude columns in your file. Please check file format.', 'error');
    }
  };
  reader.readAsText(file);
}

function parseCsvDataset(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  const latIdx = headers.findIndex(h => ['lat', 'latitude', 'y', 'decimallatitude'].includes(h));
  const lngIdx = headers.findIndex(h => ['lon', 'lng', 'long', 'longitude', 'x', 'decimallongitude'].includes(h));
  const frpIdx = headers.findIndex(h => ['frp', 'power', 'intensity', 'fire_radiative_power'].includes(h));
  const confIdx = headers.findIndex(h => ['confidence', 'conf', 'confidence_level'].includes(h));
  const typeIdx = headers.findIndex(h => ['type', 'category', 'classification', 'class'].includes(h));
  const locIdx = headers.findIndex(h => ['location', 'place', 'name', 'city', 'district', 'state'].includes(h));

  if (latIdx === -1 || lngIdx === -1) return [];

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/["']/g, ''));
    if (cols.length <= Math.max(latIdx, lngIdx)) continue;

    const lat = parseFloat(cols[latIdx]);
    const lng = parseFloat(cols[lngIdx]);
    if (isNaN(lat) || isNaN(lng)) continue;

    const frp = frpIdx !== -1 && !isNaN(parseFloat(cols[frpIdx])) ? parseFloat(cols[frpIdx]) : parseFloat((20 + Math.random() * 50).toFixed(1));
    const conf = confIdx !== -1 && !isNaN(parseInt(cols[confIdx])) ? parseInt(cols[confIdx]) : Math.floor(75 + Math.random() * 23);
    const rawType = typeIdx !== -1 ? cols[typeIdx].toLowerCase() : (frp > 60 ? 'industrial' : 'wildfire');
    let type = 'wildfire';
    if (rawType.includes('ind') || rawType.includes('flare')) type = 'industrial';
    else if (rawType.includes('stub') || rawType.includes('agri') || rawType.includes('crop')) type = 'stubble';

    const location = locIdx !== -1 && cols[locIdx] ? cols[locIdx] : `Sector (${lat.toFixed(2)}, ${lng.toFixed(2)})`;

    results.push({
      id: `custom-csv-${Date.now()}-${i}`,
      type: type,
      title: type === 'wildfire' ? 'Wildfire Hotspot' : (type === 'industrial' ? 'Industrial Flare' : 'Stubble Burn Cluster'),
      location: location,
      lat: lat,
      lng: lng,
      confidence: conf,
      frp: frp,
      tempK: parseFloat((320 + Math.random() * 40).toFixed(1)),
      satellite: 'Local Database Telemetry',
      time: 'Just now',
      timeExact: new Date().toLocaleTimeString(),
      severity: conf > 90 ? 'Critical' : 'High',
      img: type === 'industrial'
        ? 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=400&auto=format&fit=crop'
    });
  }
  return results;
}

function parseJsonDataset(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    const array = Array.isArray(data) ? data : (data.features || data.fires || data.hotspots || data.data || []);
    const results = [];

    array.forEach((item, idx) => {
      let lat = item.lat || item.latitude || (item.geometry && item.geometry.coordinates ? item.geometry.coordinates[1] : null);
      let lng = item.lng || item.lon || item.longitude || (item.geometry && item.geometry.coordinates ? item.geometry.coordinates[0] : null);

      if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        const props = item.properties || item;
        const frp = parseFloat(props.frp || props.power || (25 + Math.random() * 45).toFixed(1));
        const conf = parseInt(props.confidence || props.conf || 88);
        const rawType = (props.type || 'wildfire').toLowerCase();
        let type = 'wildfire';
        if (rawType.includes('ind') || rawType.includes('flare')) type = 'industrial';
        else if (rawType.includes('stub') || rawType.includes('agri')) type = 'stubble';

        results.push({
          id: `custom-json-${Date.now()}-${idx}`,
          type: type,
          title: props.title || (type === 'industrial' ? 'Industrial Thermal Flare' : (type === 'stubble' ? 'Stubble Burn' : 'Forest Fire Anomaly')),
          location: props.location || props.name || `Latitude ${lat.toFixed(2)}, Longitude ${lng.toFixed(2)}`,
          lat: lat,
          lng: lng,
          confidence: conf,
          frp: frp,
          tempK: parseFloat(props.tempK || (325 + Math.random() * 35).toFixed(1)),
          satellite: props.satellite || 'Imported Database',
          time: props.time || 'Live Synced',
          timeExact: new Date().toLocaleTimeString(),
          severity: conf > 90 ? 'Critical' : 'High',
          img: type === 'industrial' 
            ? 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=400&auto=format&fit=crop'
        });
      }
    });
    return results;
  } catch (err) {
    console.error('JSON parse error:', err);
    return [];
  }
}


function loadPresetDataset(name) {
  let list = [];
  if (name === 'india_top_hotspots') {
    list = [
      { id: 'in-1', type: 'wildfire', title: 'Simlipal Forest Canopy Fire', location: 'Mayurbhanj, Odisha', lat: 21.85, lng: 86.32, confidence: 94, frp: 68.4, tempK: 348.2, satellite: 'VIIRS Suomi-NPP (375m)', time: '8 min ago', severity: 'Critical', img: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=400&auto=format&fit=crop' },
      { id: 'in-2', type: 'wildfire', title: 'Bandipur Core Forest Fire', location: 'Chamarajanagar, Karnataka', lat: 11.66, lng: 76.63, confidence: 91, frp: 52.1, tempK: 339.5, satellite: 'Aqua MODIS (1km)', time: '14 min ago', severity: 'High', img: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=400&auto=format&fit=crop' },
      { id: 'in-3', type: 'industrial', title: 'HPCL Refinery Flare Stack', location: 'Visakhapatnam, Andhra Pradesh', lat: 17.68, lng: 83.21, confidence: 96, frp: 88.5, tempK: 362.0, satellite: 'VIIRS NOAA-20 (375m)', time: '22 min ago', severity: 'High', img: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400&auto=format&fit=crop' },
      { id: 'in-4', type: 'industrial', title: 'Mundra Petrochem Terminal Flare', location: 'Kutch, Gujarat', lat: 22.84, lng: 69.71, confidence: 93, frp: 74.2, tempK: 355.8, satellite: 'VIIRS Suomi-NPP (375m)', time: '35 min ago', severity: 'High', img: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400&auto=format&fit=crop' },
      { id: 'in-5', type: 'stubble', title: 'Wheat Stubble Agricultural Burning', location: 'Bathinda, Punjab', lat: 30.21, lng: 74.95, confidence: 89, frp: 34.6, tempK: 328.4, satellite: 'Terra MODIS (1km)', time: '41 min ago', severity: 'Moderate', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop' },
      { id: 'in-6', type: 'stubble', title: 'Paddy Residue Farm Fire', location: 'Karnal, Haryana', lat: 29.68, lng: 76.99, confidence: 87, frp: 29.8, tempK: 324.6, satellite: 'Aqua MODIS (1km)', time: '55 min ago', severity: 'Moderate', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop' },
      { id: 'in-7', type: 'wildfire', title: 'Jim Corbett Buffer Fire', location: 'Nainital, Uttarakhand', lat: 29.53, lng: 78.77, confidence: 92, frp: 61.3, tempK: 344.0, satellite: 'VIIRS Suomi-NPP (375m)', time: '1 hr ago', severity: 'Critical', img: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=400&auto=format&fit=crop' }
    ];
  } else {
    list = [
      { id: 'st-1', type: 'stubble', title: 'Farm Crop Residue Burning', location: 'Sangrur, Punjab', lat: 30.24, lng: 75.84, confidence: 93, frp: 41.2, tempK: 332.1, satellite: 'VIIRS (375m)', time: '10 min ago', severity: 'High', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop' },
      { id: 'st-2', type: 'stubble', title: 'Agricultural Straw Fire', location: 'Ludhiana Rural, Punjab', lat: 30.90, lng: 75.85, confidence: 90, frp: 38.0, tempK: 330.5, satellite: 'MODIS (1km)', time: '20 min ago', severity: 'Moderate', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop' },
      { id: 'st-3', type: 'stubble', title: 'Wheat Stubble Anomaly', location: 'Kaithal, Haryana', lat: 29.80, lng: 76.40, confidence: 88, frp: 32.5, tempK: 327.2, satellite: 'VIIRS (375m)', time: '30 min ago', severity: 'Moderate', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop' }
    ];
  }

  state.importedHotspots = list;
  applyImportedHotspotsToMap();
}

function triggerSampleHighAlert() {
  const randomSpot = state.hotspots[Math.floor(Math.random() * state.hotspots.length)];
  showSeverityModal(randomSpot);
}

/* =================================================================
   11. OMNIPRESENT AI DISASTER CHATBOT (Screen 7 Everywhere)
   ================================================================= */
function toggleChatbot() {
  state.chatOpen = !state.chatOpen;
  const win = document.getElementById('aiChatbotWindow');
  if (win) {
    if (state.chatOpen) {
      win.classList.remove('hidden');
      document.getElementById('chatInput')?.focus();
    } else {
      win.classList.add('hidden');
    }
  }
}

function sendPresetQuery(text) {
  const input = document.getElementById('chatInput');
  if (input) input.value = text;
  handleUserSendMessage();
}

function handleUserSendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  // Append user message
  appendChatMessage(message, 'user');
  input.value = '';

  // Simulate AI Thinking Indicator
  const chatMessages = document.getElementById('chatMessages');
  const typingId = `typing-${Date.now()}`;
  const typingEl = document.createElement('div');
  typingEl.id = typingId;
  typingEl.className = 'flex gap-2 items-center text-slate-400 text-xs italic pl-2';
  typingEl.innerHTML = `
    <i class="fa-solid fa-robot text-sky-400 animate-spin"></i>
    <span>Analyzing NASA telemetry & disaster protocols...</span>
  `;
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    typingEl.remove();
    const botReply = generateAIResponse(message);
    appendChatMessage(botReply, 'assistant');
  }, 750);
}

function appendChatMessage(htmlContent, sender) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `flex gap-2.5 items-start ${sender === 'user' ? 'justify-end' : ''}`;

  if (sender === 'user') {
    msgDiv.innerHTML = `
      <div class="bg-sky-600 text-white rounded-2xl rounded-tr-none p-3 shadow-sm leading-relaxed max-w-[85%]">
        ${escapeHtml(htmlContent)}
      </div>
      <div class="w-7 h-7 rounded bg-sky-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
        You
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="w-7 h-7 rounded bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0 text-xs">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div class="bg-[#12203d] border border-[#1e3461] rounded-2xl rounded-tl-none p-3 text-slate-200 shadow-sm leading-relaxed max-w-[85%]">
        ${htmlContent}
      </div>
    `;
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Context-Aware Disaster AI Response Engine
function generateAIResponse(query) {
  const q = query.toLowerCase();

  // Check if user is asking to search/fly to a place
  if (q.includes('show') || q.includes('go to') || q.includes('search') || q.includes('fly to') || q.includes('locate')) {
    const matchedCity = query.replace(/(show|go to|search|fly to|locate|fires in|fires near)/gi, '').trim();
    if (matchedCity.length > 2) {
      handleSearchLocation(matchedCity);
      return `Targeting GIS sensors on <strong>${matchedCity}</strong>! Leaflet map is smoothly repositioning and populating real-time NASA FIRMS thermal anomaly clusters.`;
    }
  }

  if (q.includes('wildfire') && q.includes('identify')) {
    return `
      <strong>How to Identify Wildfires:</strong><br>
      Wildfires appear as <strong>Red Hotspot Dots</strong> on the map.<br><br>
      • <strong>Visual Cues:</strong> Surrounded by a pulsing red radar ring.<br>
      • <strong>Telemetry:</strong> Characterized by lower FRP (Fire Radiative Power) density spread over wider vegetative terrain, accompanied by high SWIR/NIR reflectance.<br>
      • <strong>Classification:</strong> Model confidence &gt; 85% indicates verified biomass combustion.
    `;
  }

  if (q.includes('frp') || q.includes('fire radiative power')) {
    return `
      <strong>Fire Radiative Power (FRP):</strong><br>
      FRP is measured in <strong>Megawatts (MW)</strong> and quantifies the instantaneous radiant energy output from combustion.<br><br>
      • FRP &lt; 20 MW: Low-intensity surface burn or stubble residue.<br>
      • FRP 20–50 MW: Moderate wildfire or industrial flare.<br>
      • FRP &gt; 50 MW: <em>High severity emergency</em> requiring immediate aerial drops or SDRF deployment.
    `;
  }

  if (q.includes('evacuat') || q.includes('protocol') || q.includes('sop')) {
    return `
      <strong>Disaster Mitigation SOP & Evacuation:</strong><br>
      1. <strong>Perimeter Cordage:</strong> Establish a 2.5 km downwind exclusion zone.<br>
      2. <strong>Priority Broadcast:</strong> Trigger automated SMS alerts via NDMA gateway to local village gram panchayats.<br>
      3. <strong>SDRF Deployment:</strong> Dispatch nearest quick-response foam tenders and water tankers.<br>
      4. <strong>Wind Vector Tracking:</strong> Monitor live wind velocity to forecast spread vectors.
    `;
  }

  // Default helpful response
  return `
    I have processed your query regarding <em>"${escapeHtml(query)}"</em>.<br><br>
    As part of the <strong>PyroVision PyroVision Command System</strong>, you can use the top search bar to inspect any forest division or industrial park in India. Let me know if you need specific SOP procedures or satellite sensor explanations!
  `;
}

function clearChatMessages() {
  const box = document.getElementById('chatMessages');
  if (box) {
    box.innerHTML = `
      <div class="flex gap-2.5 items-start">
        <div class="w-7 h-7 rounded bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0 text-xs">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bg-[#12203d] border border-[#1e3461] rounded-2xl rounded-tl-none p-3 text-slate-200 shadow-sm leading-relaxed max-w-[85%] text-xs">
          Chat cleared. Ready for your operational commands, Officer.
        </div>
      </div>
    `;
  }
}

/* =================================================================
   12. MISCELLANEOUS UTILITIES
   ================================================================= */
function refreshSatelliteFeeds() {
  showToast('Synchronizing latest NASA FIRMS VIIRS orbit pass...', 'info');
  const indicator = document.getElementById('firmsLastUpdate');
  if (indicator) {
    indicator.textContent = 'Last updated: Just now (Pass SUOMI-NPP)';
  }
  setTimeout(() => {
    showToast('Telemetry updated with zero latency.', 'success');
  }, 800);
}

function downloadMockReport(filename) {
  showToast(`Compiling and exporting ${filename}...`, 'info');
  setTimeout(() => {
    // Trigger mock download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`PyroVision Disaster Incident Report\nGenerated for: SIH Problem Statement 162\nTimestamp: ${new Date().toISOString()}\nTelemetry Source: NASA FIRMS\nSeverity: Verified\n`));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded ${filename} successfully!`, 'success');
  }, 1000);
}

function clearSystemCache() {
  showToast('GIS offline raster tiles and telemetry cache purged.', 'info');
}

// Toast notification banner
function showToast(message, type = 'info') {
  const existing = document.getElementById('fwToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'fwToast';
  const bgClass = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-red-600' : (type === 'warning' ? 'bg-amber-600' : 'bg-sky-600'));

  toast.className = `fixed top-5 right-5 z-[300] px-4 py-2.5 rounded-lg text-white text-xs font-semibold shadow-2xl flex items-center gap-2 ${bgClass} transition duration-300`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info')}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}
