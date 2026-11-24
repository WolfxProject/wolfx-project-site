let last_station_data = null;
let last_seis_data = null;
let last_server_info = null;

let stationmeterRunning = false;
let lastAlertState = false; // 用于边沿触发（避免每5秒响一次）

function toNum(v, def = NaN) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

async function fetchJsonWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function get_station_data() {
  try {
    const data = await fetchJsonWithTimeout(
      "https://station.wolfx.jp/data.json?" + Date.now(),
      5000
    );

    const result = [
      toNum(data["temperature"]),
      toNum(data["humidity"]),
      toNum(data["pressure"]),
      toNum(data["pm2.5"]),
      toNum(data["pm10"]),
      toNum(data["usv"]),
      toNum(data["usv_avg"]),
    ];

    last_station_data = result;
    return result;
  } catch (e) {
    return last_station_data ?? [NaN, NaN, NaN, NaN, NaN, NaN, NaN];
  }
}

async function get_seis_station_data() {
  try {
    const data = await fetchJsonWithTimeout(
      "https://station.wolfx.jp/data_seis.json?" + Date.now(),
      5000
    );

    const result = [
      toNum(data["temperature"]),
      toNum(data["humidity"]),
      toNum(data["pressure"]),
    ];

    last_seis_data = result;
    return result;
  } catch (e) {
    return last_seis_data ?? [NaN, NaN, NaN];
  }
}

async function stationmeter() {
  if (stationmeterRunning) return;
  stationmeterRunning = true;

  try {
    const weather_data = await get_station_data();
    const [
      temperature,
      humidity,
      pressure,
      pm25,
      pm10,
      usv,
      usv_avg,
    ] = weather_data;

    const weather_seis_data = await get_seis_station_data();
    const [temperature_seis, humidity_seis, pressure_seis] = weather_seis_data;

    const warn1 = (usv_avg >= 0.45) || (usv >= 0.70 && usv_avg >= 0.32);
    const warn2 = (usv_avg >= 0.70) || (usv >= 2.0);

    // 边沿触发（只响一次）
    const nowAlert = warn1 || warn2;
    if (nowAlert && !lastAlertState) {
      new Audio("sounds/alert.wav").play().catch(() => { });
    }
    lastAlertState = nowAlert;

    // ====== [1] 温度：增加“无效值=灰色”，并把 <=0 当作冷（蓝） ======
    if (!Number.isFinite(temperature)) {
      $("#tempcolor").css("background-color", "#808080"); // GRAY
      $("#temp").text("--");
    } else if (temperature <= 0) {
      $("#tempcolor").css("background-color", "#1E90FF"); // BLUE (cold)
      $("#temp").text(temperature.toFixed(1));
    } else if (temperature <= 15) {
      $("#tempcolor").css("background-color", "#00FFFF"); // CYAN (cool)
      $("#temp").text(temperature.toFixed(1));
    } else if (temperature <= 25) {
      $("#tempcolor").css("background-color", "#00FF00"); // GREEN
      $("#temp").text(temperature.toFixed(1));
    } else if (temperature <= 32) {
      $("#tempcolor").css("background-color", "#FFFF00"); // YELLOW
      $("#temp").text(temperature.toFixed(1));
    } else if (temperature <= 35) {
      $("#tempcolor").css("background-color", "#FF8C00"); // ORANGE
      $("#temp").text(temperature.toFixed(1));
    } else {
      $("#tempcolor").css("background-color", "#FF0000"); // RED
      $("#temp").text(temperature.toFixed(1));
    }

    if (!Number.isFinite(humidity)) {
      $("#humcolor").css("background-color", "#808080");
      $("#hum").text("--");
    } else if (humidity < 25) {
      $("#humcolor").css("background-color", "#FFFF00"); // YELLOW
      $("#hum").text(humidity.toFixed(0));
    } else if (humidity <= 75) {
      $("#humcolor").css("background-color", "#00FF00"); // GREEN
      $("#hum").text(humidity.toFixed(0));
    } else if (humidity <= 90) {
      $("#humcolor").css("background-color", "#FFFF00"); // YELLOW
      $("#hum").text(humidity.toFixed(0));
    } else if (humidity < 95) {
      $("#humcolor").css("background-color", "#FF8C00"); // ORANGE
      $("#hum").text(humidity.toFixed(0));
    } else {
      $("#humcolor").css("background-color", "#FF0000"); // RED
      $("#hum").text(humidity.toFixed(0));
    }

    // ====== 气压 ======
    if (!Number.isFinite(pressure)) {
      $("#atomcolor").css("background-color", "#808080"); // GRAY
      $("#atom").text("--");
    } else if (pressure < 970) {
      $("#atomcolor").css("background-color", "#FF0000"); // RED（异常低压）
      $("#atom").text(pressure.toFixed(2));
    } else if (pressure < 985) {
      $("#atomcolor").css("background-color", "#FF8C00"); // ORANGE（明显低压）
      $("#atom").text(pressure.toFixed(2));
    } else if (pressure < 1000) {
      $("#atomcolor").css("background-color", "#FFFF00"); // YELLOW（低压天气）
      $("#atom").text(pressure.toFixed(2));
    } else if (pressure <= 1025) {
      $("#atomcolor").css("background-color", "#00FF00"); // GREEN（正常）
      $("#atom").text(pressure.toFixed(2));
    } else {
      $("#atomcolor").css("background-color", "#00FFFF"); // CYAN（稳定高压）
      $("#atom").text(pressure.toFixed(2));
    }

    // ====== [4] PM2.5：完全重做颜色语义（绿→黄→橙→红→深红） ======
    if (!Number.isFinite(pm25)) {
      $("#pm25color").css("background-color", "#808080"); // GRAY
      $("#pm25").text("--");
    } else if (pm25 <= 15) {
      $("#pm25color").css("background-color", "#00FF00"); // GREEN (very good)
      $("#pm25").text(pm25.toFixed(1));
    } else if (pm25 <= 35) {
      $("#pm25color").css("background-color", "#FFFF00"); // YELLOW (acceptable/attention)
      $("#pm25").text(pm25.toFixed(1));
    } else if (pm25 <= 75) {
      $("#pm25color").css("background-color", "#FF8C00"); // ORANGE (unhealthy for sensitive)
      $("#pm25").text(pm25.toFixed(1));
    } else if (pm25 <= 150) {
      $("#pm25color").css("background-color", "#FF0000"); // RED (unhealthy)
      $("#pm25").text(pm25.toFixed(1));
    } else {
      $("#pm25color").css("background-color", "#8B0000"); // DEEP_RED (very unhealthy/hazardous)
      $("#pm25").text(pm25.toFixed(1));
    }

    // ====== [5] PM10：微调一下，增加橙色层（可选但推荐） ======
    if (!Number.isFinite(pm10)) {
      $("#pm10color").css("background-color", "#808080"); // GRAY
      $("#pm10").text("--");
    } else if (pm10 <= 40) {
      $("#pm10color").css("background-color", "#00FF00"); // GREEN
      $("#pm10").text(pm10.toFixed(1));
    } else if (pm10 <= 70) {
      $("#pm10color").css("background-color", "#FFFF00"); // YELLOW
      $("#pm10").text(pm10.toFixed(1));
    } else if (pm10 <= 100) {
      $("#pm10color").css("background-color", "#FF8C00"); // ORANGE
      $("#pm10").text(pm10.toFixed(1));
    } else {
      $("#pm10color").css("background-color", "#FF0000"); // RED
      $("#pm10").text(pm10.toFixed(1));
    }

    // ====== [6] 辐射 usv：让颜色覆盖到 0.4 附近，避免“绿着但报警”割裂 ======
    if (!Number.isFinite(usv)) {
      $("#radcolor").css("background-color", "#808080"); // GRAY
      $("#rad").text("--");
    } else if (usv < 0.30) {
      $("#radcolor").css("background-color", "#00FF00"); // GREEN
      $("#rad").text(usv.toFixed(2) + "uSv/h");
    } else if (usv < 0.40) {
      $("#radcolor").css("background-color", "#FFFF00"); // YELLOW
      $("#rad").text(usv.toFixed(2) + "uSv/h");
    } else if (usv < 0.70) {
      $("#radcolor").css("background-color", "#FF8C00"); // ORANGE
      $("#rad").text(usv.toFixed(2) + "uSv/h");
    } else if (usv < 2.0) {
      $("#radcolor").css("background-color", "#FF0000"); // RED
      $("#rad").text(usv.toFixed(2) + "uSv/h");
    } else if (usv < 1000.0) {
      $("#radcolor").css("background-color", "#8B0000"); // DEEP_RED
      $("#rad").text(usv.toFixed(2) + "uSv/h");
    } else {
      $("#radcolor").css("background-color", "#8B0000"); // DEEP_RED
      $("#rad").text((usv / 1000).toFixed(2) + "mSv/h");
    }

    // ====== [7] 辐射 usv_avg：同样逻辑套一份 ======
    if (!Number.isFinite(usv_avg)) {
      $("#radavgcolor").css("background-color", "#808080"); // GRAY
      $("#radavg").text("--");
    } else if (usv_avg < 0.26) {
      $("#radavgcolor").css("background-color", "#00FF00"); // GREEN
      $("#radavg").text(usv_avg.toFixed(2) + "uSv/h");
    } else if (usv_avg < 0.32) {
      $("#radavgcolor").css("background-color", "#FFFF00"); // YELLOW
      $("#radavg").text(usv_avg.toFixed(2) + "uSv/h");
    } else if (usv_avg < 0.45) {
      $("#radavgcolor").css("background-color", "#FF8C00"); // ORANGE
      $("#radavg").text(usv_avg.toFixed(2) + "uSv/h");
    } else if (usv_avg < 1.0) {
      $("#radavgcolor").css("background-color", "#FF0000"); // RED
      $("#radavg").text(usv_avg.toFixed(2) + "uSv/h");
    } else if (usv_avg < 1000.0) {
      $("#radavgcolor").css("background-color", "#8B0000"); // DEEP_RED
      $("#radavg").text(usv_avg.toFixed(2) + "uSv/h");
    } else {
      $("#radavgcolor").css("background-color", "#8B0000"); // DEEP_RED
      $("#radavg").text((usv_avg / 1000).toFixed(2) + "mSv/h");
    }

    // ====== [SEIS-1] 测站温度 temperature_seis ======
    if (!Number.isFinite(temperature_seis)) {
      $("#c1color").css("background-color", "#808080"); // GRAY
      $("#c1").text("--");
    } else if (temperature_seis <= 0) {
      $("#c1color").css("background-color", "#1E90FF"); // BLUE (cold)
      $("#c1").text(temperature_seis.toFixed(1));
    } else if (temperature_seis <= 15) {
      $("#c1color").css("background-color", "#00FFFF"); // CYAN (cool)
      $("#c1").text(temperature_seis.toFixed(1));
    } else if (temperature_seis <= 25) {
      $("#c1color").css("background-color", "#00FF00"); // GREEN
      $("#c1").text(temperature_seis.toFixed(1));
    } else if (temperature_seis <= 32) {
      $("#c1color").css("background-color", "#FFFF00"); // YELLOW
      $("#c1").text(temperature_seis.toFixed(1));
    } else if (temperature_seis <= 35) {
      $("#c1color").css("background-color", "#FF8C00"); // ORANGE
      $("#c1").text(temperature_seis.toFixed(1));
    } else {
      $("#c1color").css("background-color", "#FF0000"); // RED
      $("#c1").text(temperature_seis.toFixed(1));
    }

    if (!Number.isFinite(humidity_seis)) {
      $("#c2color").css("background-color", "#808080");
      $("#c2").text("--");
    } else if (humidity_seis < 25) {
      $("#c2color").css("background-color", "#FFFF00");
      $("#c2").text(humidity_seis.toFixed(0));
    } else if (humidity_seis <= 75) {
      $("#c2color").css("background-color", "#00FF00");
      $("#c2").text(humidity_seis.toFixed(0));
    } else if (humidity_seis <= 90) {
      $("#c2color").css("background-color", "#FFFF00");
      $("#c2").text(humidity_seis.toFixed(0));
    } else if (humidity_seis < 95) {
      $("#c2color").css("background-color", "#FF8C00");
      $("#c2").text(humidity_seis.toFixed(0));
    } else {
      $("#c2color").css("background-color", "#FF0000");
      $("#c2").text(humidity_seis.toFixed(0));
    }

    // ====== 测站气压 pressure_seis（同一标准） ======
    if (!Number.isFinite(pressure_seis)) {
      $("#c3color").css("background-color", "#808080"); // GRAY
      $("#c3").text("--");
    } else if (pressure_seis < 970) {
      $("#c3color").css("background-color", "#FF0000"); // RED
      $("#c3").text(pressure_seis.toFixed(2));
    } else if (pressure_seis < 985) {
      $("#c3color").css("background-color", "#FF8C00"); // ORANGE
      $("#c3").text(pressure_seis.toFixed(2));
    } else if (pressure_seis < 1000) {
      $("#c3color").css("background-color", "#FFFF00"); // YELLOW
      $("#c3").text(pressure_seis.toFixed(2));
    } else if (pressure_seis <= 1025) {
      $("#c3color").css("background-color", "#00FF00"); // GREEN
      $("#c3").text(pressure_seis.toFixed(2));
    } else {
      $("#c3color").css("background-color", "#00FFFF"); // CYAN
      $("#c3").text(pressure_seis.toFixed(2));
    }

  } finally {
    stationmeterRunning = false;
  }
}

stationmeter();
setInterval(stationmeter, 5000);
