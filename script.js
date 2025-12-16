const cities = [
  { name: 'San Jose', tz: 'America/Los_Angeles', lat: 37.3382, lon: -121.8863 },
  { name: 'New York', tz: 'America/New_York', lat: 40.7128, lon: -74.006 },
  { name: 'London', tz: 'Europe/London', lat: 51.5074, lon: -0.1278 },
  { name: 'Lagos', tz: 'Africa/Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'São Paulo', tz: 'America/Sao_Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Dubai', tz: 'Asia/Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', tz: 'Australia/Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Tokyo', tz: 'Asia/Tokyo', lat: 35.6762, lon: 139.6503 },
];

const landPolygons = [
  [
    [-168, 70], [-52, 70], [-52, 12], [-80, 8], [-100, 8], [-120, 24], [-134, 42], [-168, 44]
  ], // North America
  [
    [-82, 12], [-34, 12], [-34, -56], [-68, -56], [-82, -24]
  ], // South America
  [
    [-10, 72], [40, 72], [40, 35], [0, 35]
  ], // Europe (upper band)
  [
    [-20, 35], [52, 35], [52, -35], [-20, -35]
  ], // Africa
  [
    [40, 72], [180, 72], [180, 8], [120, 8], [96, 20], [70, 20], [70, 35], [40, 35]
  ], // Asia
  [
    [110, -10], [156, -10], [156, -44], [110, -44]
  ], // Australia
  [
    [-180, -90], [180, -90], [180, -60], [-180, -60]
  ], // Antarctica base
];

const mapCanvas = document.getElementById('world-map');
const ctx = mapCanvas.getContext('2d');
const statusTimeEl = document.getElementById('status-time');
const cityNameEl = document.getElementById('city-name');
const cityTimeEl = document.getElementById('city-time');
const cityDateEl = document.getElementById('city-date');
const citySelectorEl = document.getElementById('city-selector');
const mapPanel = document.querySelector('.map-panel');

let selectedCity = cities[0];
let dots = [];
let mapWidth = 1200;
let mapHeight = 580;

function lonLatToXY(lon, lat) {
  return {
    x: ((lon + 180) / 360) * mapWidth,
    y: ((90 - lat) / 180) * mapHeight,
  };
}

function pointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function generateDots() {
  dots = [];
  const spacing = Math.max(14, Math.min(20, mapWidth / 70));
  for (let x = 0; x <= mapWidth; x += spacing) {
    for (let y = 0; y <= mapHeight; y += spacing) {
      const lon = (x / mapWidth) * 360 - 180;
      const lat = 90 - (y / mapHeight) * 180;
      if (landPolygons.some(poly => pointInPolygon([lon, lat], poly))) {
        dots.push({ x, y, lon, lat });
      }
    }
  }
}

function getSunLongitude(now) {
  const minutesUTC = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  return (minutesUTC / (24 * 60)) * 360 - 180;
}

function drawTerminator(phase) {
  ctx.save();
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  const amplitude = mapHeight * 0.42;
  const yOffset = mapHeight * 0.55;
  const segments = 180;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = t * mapWidth;
    const y = yOffset + Math.sin(t * Math.PI * 2 + phase) * amplitude * 0.35;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawMap() {
  const now = new Date();
  const sunLon = getSunLongitude(now);
  const phase = ((sunLon + 180) / 360) * Math.PI * 2;

  ctx.clearRect(0, 0, mapWidth, mapHeight);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, mapWidth, mapHeight);

  drawTerminator(phase);

  dots.forEach(dot => {
    const lightFactor = Math.max(0, Math.cos((dot.lon - sunLon) * (Math.PI / 180)));
    const alpha = 0.28 + lightFactor * 0.5;
    const colorChannel = Math.floor(80 + lightFactor * 140);
    ctx.fillStyle = `rgba(${colorChannel},${colorChannel},${colorChannel},${alpha})`;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 5.2, 0, Math.PI * 2);
    ctx.fill();
  });

  cities.forEach(city => {
    const { x, y } = lonLatToXY(city.lon, city.lat);
    const isSelected = city === selectedCity;
    ctx.beginPath();
    ctx.fillStyle = isSelected ? '#f48c1a' : 'rgba(244,140,26,0.75)';
    ctx.arc(x, y, isSelected ? 11 : 9, 0, Math.PI * 2);
    ctx.fill();

    if (isSelected) {
      ctx.strokeStyle = 'rgba(244,140,26,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function resizeCanvas() {
  const { width, height } = mapPanel.getBoundingClientRect();
  mapWidth = Math.round(width * window.devicePixelRatio);
  mapHeight = Math.round(Math.max(height, width * 0.55) * window.devicePixelRatio);

  mapCanvas.width = mapWidth;
  mapCanvas.height = mapHeight;
  mapCanvas.style.width = `${width}px`;
  mapCanvas.style.height = `${mapHeight / window.devicePixelRatio}px`;
  generateDots();
  drawMap();
}

function formatTime(date, tz, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
    ...options,
  }).format(date);
}

function updateClock() {
  const now = new Date();
  statusTimeEl.textContent = formatTime(now, Intl.DateTimeFormat().resolvedOptions().timeZone);

  cityNameEl.textContent = selectedCity.name;
  cityTimeEl.textContent = formatTime(now, selectedCity.tz);
  cityDateEl.textContent = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: selectedCity.tz,
  }).format(now);

  drawMap();
}

function buildCitySelector() {
  cities.forEach(city => {
    const chip = document.createElement('button');
    chip.className = 'city-chip';
    chip.type = 'button';
    chip.textContent = city.name;
    chip.setAttribute('aria-pressed', city === selectedCity);
    chip.addEventListener('click', () => selectCity(city));
    citySelectorEl.appendChild(chip);
  });
  refreshChips();
}

function refreshChips() {
  [...citySelectorEl.children].forEach(chip => {
    const city = cities.find(c => c.name === chip.textContent);
    const active = city === selectedCity;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', active);
  });
}

function selectCity(city) {
  selectedCity = city;
  refreshChips();
  updateClock();
}

function handleResize() {
  resizeCanvas();
}

window.addEventListener('resize', handleResize);

buildCitySelector();
resizeCanvas();
updateClock();
setInterval(updateClock, 1000);
