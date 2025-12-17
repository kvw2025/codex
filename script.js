const cities = [
  { name: 'My timezone', tz: 'America/Los_Angeles', lat: 37.3382, lon: -121.8863 },
  { name: 'New York', tz: 'America/New_York', lat: 40.7128, lon: -74.006 },
  { name: 'Beijing', tz: 'Asia/Shanghai', lat: 39.9042, lon: 116.4074 },
];
let selectedCityIndex = 0;
function formatTime(date, tz, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
    ...options,
  }).format(date);
}
function getSecond(date) {
  return date.getSeconds();
}
function Pgs_sec(date) {
    return getSecond(date) / 60;
}
function updateDate(selectCityIndex,Element){
    const now = new Date();
    selectedCity = cities[selectCityIndex];
    Element.innerHTML = formatTime(now, selectedCity.tz);
    const secLabel = document.getElementById("sec-label");
    secLabel.innerHTML = getSecond(now).toString().padStart(2, '0') + "";
    const pgsContainer = document.getElementById("pgs-sec");
    const pgsValue = Pgs_sec(now);
    pgsContainer.style.width = (pgsValue * 100) + "%";
    console.log(pgsValue);
}
function calculateTimezoneDifferences(tz1, tz2) {
    const now = new Date();
    const options = { hour: '2-digit', hour12: false, timeZone: tz1 };
    const time1 = new Intl.DateTimeFormat('en-US', options).format(now);
    options.timeZone = tz2;
    const time2 = new Intl.DateTimeFormat('en-US', options).format(now);
    const hour1 = parseInt(time1, 10);
    const hour2 = parseInt(time2, 10);
    let diff = hour2 - hour1;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;
    return diff;
}
function displayCityListTimes(cities){
    const cityListEl = document.getElementById("city-date");
    cityListEl.innerHTML = "";
    selectedCity = cities[selectedCityIndex];
    cities.forEach((city, index) => {
        const cityItemEl = document.createElement("div");
        cityItemEl.className = "city-item";
        
        if (calculateTimezoneDifferences(selectedCity.tz, city.tz) == 0) {
            return;
        }
        cityItemEl.innerHTML = `<div class="cityname">${city.name}</div> 
         <div class="relativity">${calculateTimezoneDifferences(selectedCity.tz, city.tz) >= 0 ? '+' : ''}${calculateTimezoneDifferences(selectedCity.tz, city.tz)}h</div>
          <div class="citytime">${formatTime(new Date(), city.tz)}</div> `;
        cityItemEl.style.cursor = "pointer";
        cityItemEl.style.gap = "20px";
        cityItemEl.style.display = "flex";
        cityItemEl.style.justifyContent = "center";
        cityItemEl.style.marginTop = "15px";
        cityItemEl.style.marginLeft = "0";
        cityItemEl.style.alignItems = "center";
        cityItemEl.onclick = () => {
            selectedCityIndex = index;
            selectedCity = cities[selectedCityIndex];
            const cityNameEl = document.getElementById("city-name");
            const cityTimeEl = document.getElementById("city-time");
            cityNameEl.innerText = city.name;
            selectedCityIndex = index;
            updateDate(index, cityTimeEl);
        };
        cityListEl.appendChild(cityItemEl);
    });
}

const cityDateEl = document.getElementById("city-time")
const statusTimeEl = document.getElementById("status-time");
setInterval(() => {
    updateDate(selectedCityIndex,cityDateEl);
    updateDate(0,statusTimeEl);
    displayCityListTimes(cities);
}, 1000);
    updateDate(selectedCityIndex,cityDateEl);
    updateDate(0,statusTimeEl);
    displayCityListTimes(cities);
function countdownPgs(startDate, endDate, tz, PgsBarElement, dataLabelElement=null, secLabelElement=null, decimalPlaces=4,formattedRemainingElement=null) {
    const now = new Date();
    const options = { timeZone: tz };
    const start = new Date(startDate.toLocaleString('en-US', options));
    const end = new Date(endDate.toLocaleString('en-US', options));
    const totalSeconds = (end - start) / 1000;
    const elapsedSeconds = (now - start) / 1000;
    const pgsValue = Math.min(Math.max((now - start) / (end - start), 0), 1);
    PgsBarElement.style.width = (pgsValue * 100) + "%";
    if (dataLabelElement) {
        const progressPercentage = (pgsValue * 100).toFixed(decimalPlaces);
        dataLabelElement.innerHTML = `${progressPercentage}%`;
    }
    if (secLabelElement) {
        const remainingSeconds = Math.max(0, Math.ceil((end - now) / 1000));
        secLabelElement.innerHTML = remainingSeconds.toString().padStart(2, '0') + "s";
    }
    const formattedRemaining = `<b style="color:var(--accent)">${Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)))}</b><c style="font-size:smaller;color:var(--accent)">d</c><br><c style="font-size:smaller;color:var(--accent)">${Math.max(0, Math.floor((end - now) / (1000 * 60 * 60)) % 24).toString().padStart(2, '0')}:${Math.max(0, Math.floor((end - now) / (1000 * 60)) % 60).toString().padStart(2, '0')}:${Math.max(0, Math.floor((end - now) / 1000) % 60).toString().padStart(2, '0')}</c>`; 
    if (formattedRemainingElement) {
        formattedRemainingElement.innerHTML = formattedRemaining;
    }
}

setInterval(() => {
    const vacationStart = new Date('2025-12-12');
    const vacationEnd = new Date('2026-01-04');
    const pgsContainer = document.getElementById("vac-pgs");
    const dataLabel = document.getElementById("vac-percentage");
    const Remaining = document.getElementById("vac-label");
    const secLabel = document.getElementById("vacation-sec-label");
    countdownPgs(vacationStart, vacationEnd, Intl.DateTimeFormat().resolvedOptions().timeZone, pgsContainer,dataLabel, secLabel, 4, Remaining);
}, 50);