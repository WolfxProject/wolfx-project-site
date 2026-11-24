// Each station reports independently. Missing readings use the neutral indicator.
const colors = {
  missing: '#808080',
  blue: '#1e90ff',
  cyan: '#00ffff',
  green: '#00ff00',
  yellow: '#ffff00',
  orange: '#ff8c00',
  red: '#ff0000',
  darkRed: '#8b0000',
}

function reading(value) {
  if (typeof value !== 'number' && !(typeof value === 'string' && value.trim()))
    return NaN
  const number = Number(value)
  return Number.isFinite(number) ? number : NaN
}

function temperatureColor(value) {
  if (value <= 0) return colors.blue
  if (value <= 15) return colors.cyan
  if (value <= 25) return colors.green
  if (value <= 32) return colors.yellow
  if (value <= 35) return colors.orange
  return colors.red
}

function humidityColor(value) {
  if (value < 25) return colors.yellow
  if (value <= 75) return colors.green
  if (value <= 90) return colors.yellow
  if (value < 95) return colors.orange
  return colors.red
}

function pressureColor(value) {
  if (value < 970) return colors.red
  if (value < 985) return colors.orange
  if (value < 1000) return colors.yellow
  if (value <= 1025) return colors.green
  return colors.cyan
}

function pm25Color(value) {
  if (value <= 15) return colors.green
  if (value <= 35) return colors.yellow
  if (value <= 75) return colors.orange
  if (value <= 150) return colors.red
  return colors.darkRed
}

function pm10Color(value) {
  if (value <= 40) return colors.green
  if (value <= 70) return colors.yellow
  if (value <= 100) return colors.orange
  return colors.red
}

function radiationColor(value, average) {
  if (value < (average ? 0.26 : 0.30)) return colors.green
  if (value < (average ? 0.32 : 0.40)) return colors.yellow
  if (value < (average ? 0.45 : 0.70)) return colors.orange
  if (value < (average ? 1 : 2)) return colors.red
  return colors.darkRed
}

function display(id, raw, color, format) {
  const value = reading(raw)
  const available = Number.isFinite(value)
  document.getElementById(id).textContent = available ? format(value) : '--'
  document.getElementById(id + 'color').style.backgroundColor = available ? color(value) : colors.missing
}

function displayWeather(data, ids) {
  display(ids[0], data?.temperature, temperatureColor, value => value.toFixed(1))
  display(ids[1], data?.humidity, humidityColor, value => value.toFixed(0))
  display(ids[2], data?.pressure, pressureColor, value => value.toFixed(2))
}

function formatRadiation(value) {
  return value >= 1000 ? (value / 1000).toFixed(2) + ' mSv/h' : value.toFixed(2) + ' μSv/h'
}

let alertActive = false
function displayStation(data) {
  displayWeather(data, ['temp', 'hum', 'atom'])
  display('pm25', data?.['pm2.5'], pm25Color, value => value.toFixed(1))
  display('pm10', data?.pm10, pm10Color, value => value.toFixed(1))
  display('rad', data?.usv, value => radiationColor(value, false), formatRadiation)
  display('radavg', data?.usv_avg, value => radiationColor(value, true), formatRadiation)

  const current = reading(data?.usv)
  const average = reading(data?.usv_avg)
  const alert = average >= 0.45 || (current >= 0.70 && average >= 0.32) || current >= 2
  if (alert && !alertActive)
    new Audio('/geiger/sounds/alert.wav').play().catch(() => {})
  if (alert || (Number.isFinite(current) && Number.isFinite(average)))
    alertActive = alert
}

async function fetchStation(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(url + '?' + Date.now(), { signal: controller.signal, cache: 'no-store' })
    return response.ok ? await response.json() : null
  }
  catch {
    return null
  }
  finally {
    clearTimeout(timer)
  }
}

let refreshing = false
async function refresh() {
  if (refreshing) return
  refreshing = true
  try {
    await Promise.all([
      fetchStation('https://station.wolfx.jp/data.json').then(displayStation),
      fetchStation('https://station.wolfx.jp/data_seis.json').then(data => displayWeather(data, ['c1', 'c2', 'c3'])),
    ])
  }
  finally {
    refreshing = false
  }
}

refresh()
setInterval(refresh, 5000)
