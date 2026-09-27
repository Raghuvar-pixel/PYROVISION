let mainMap = null;
let fullMap = null;
let vectorSource = null;
let currentLayer = null; 
let fullMapLayer = null; 
let userLocationFeature = null;
let heatmapLayer = null;
let riskAlertsEnabled = true;
let weatherEnabled = true;
let weatherCache = null;


// Tile Layer Sources
const mapSources = {
  osm: new ol.source.OSM(),
  satellite: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19
  })
};

// India hotspot dataset supplied by the user (244 records), classified with the existing prototype FRP rules.
const csvDataset = [{"latitude":30.13606,"longitude":78.5134,"bright_ti4":330.15,"scan":0.45,"track":0.43,"acq_date":"2026-09-27","acq_time":1403,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":303.38,"frp":76.18,"daynight":"N","temp_celsius":87.29,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.29843,"longitude":79.75187,"bright_ti4":331.59,"scan":0.51,"track":0.55,"acq_date":"2026-09-27","acq_time":581,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":296.62,"frp":51.05,"daynight":"D","temp_celsius":93.59,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.39785,"longitude":78.092,"bright_ti4":339.64,"scan":0.4,"track":0.51,"acq_date":"2026-09-27","acq_time":1733,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":293.4,"frp":45.25,"daynight":"N","temp_celsius":92.41,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.69427,"longitude":78.74605,"bright_ti4":359.71,"scan":0.49,"track":0.73,"acq_date":"2026-09-27","acq_time":1528,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":291.47,"frp":63.38,"daynight":"N","temp_celsius":88.95,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.86977,"longitude":79.25352,"bright_ti4":339.05,"scan":0.41,"track":0.56,"acq_date":"2026-09-27","acq_time":2252,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":294.16,"frp":87.47,"daynight":"D","temp_celsius":87.08,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.68907,"longitude":78.82698,"bright_ti4":330.87,"scan":0.43,"track":0.66,"acq_date":"2026-09-27","acq_time":641,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":292.89,"frp":44.31,"daynight":"N","temp_celsius":77.63,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":31.15437,"longitude":79.71163,"bright_ti4":341.15,"scan":0.73,"track":0.51,"acq_date":"2026-09-27","acq_time":1988,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":311.37,"frp":58.67,"daynight":"D","temp_celsius":80.51,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.6609,"longitude":78.51561,"bright_ti4":362.64,"scan":0.51,"track":0.54,"acq_date":"2026-09-27","acq_time":500,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":305.97,"frp":51.31,"daynight":"D","temp_celsius":77.01,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":31.02019,"longitude":78.30801,"bright_ti4":352.21,"scan":0.74,"track":0.39,"acq_date":"2026-09-27","acq_time":1127,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":292.91,"frp":48.3,"daynight":"D","temp_celsius":73.82,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.06266,"longitude":80.00793,"bright_ti4":340.98,"scan":0.56,"track":0.66,"acq_date":"2026-09-27","acq_time":1047,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":286.58,"frp":44.16,"daynight":"N","temp_celsius":90.27,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.88402,"longitude":78.00497,"bright_ti4":356.89,"scan":0.71,"track":0.58,"acq_date":"2026-09-27","acq_time":1723,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":295.11,"frp":94.83,"daynight":"N","temp_celsius":84.66,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.46703,"longitude":78.70935,"bright_ti4":337.45,"scan":0.48,"track":0.69,"acq_date":"2026-09-27","acq_time":2053,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":290.79,"frp":45.99,"daynight":"N","temp_celsius":58.8,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.1671,"longitude":79.94814,"bright_ti4":361.34,"scan":0.49,"track":0.64,"acq_date":"2026-09-27","acq_time":1603,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":285.85,"frp":91.51,"daynight":"D","temp_celsius":81.76,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.97473,"longitude":79.20074,"bright_ti4":345.66,"scan":0.61,"track":0.37,"acq_date":"2026-09-27","acq_time":874,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":307.2,"frp":75.03,"daynight":"N","temp_celsius":91.65,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.69824,"longitude":79.94346,"bright_ti4":358.97,"scan":0.66,"track":0.36,"acq_date":"2026-09-27","acq_time":683,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":294.26,"frp":50.93,"daynight":"N","temp_celsius":82.83,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.33317,"longitude":79.38333,"bright_ti4":341.43,"scan":0.37,"track":0.53,"acq_date":"2026-09-27","acq_time":1327,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":310.77,"frp":77.2,"daynight":"N","temp_celsius":85.49,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.35283,"longitude":79.78264,"bright_ti4":335.27,"scan":0.58,"track":0.47,"acq_date":"2026-09-27","acq_time":1948,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":303.01,"frp":60.74,"daynight":"D","temp_celsius":64.45,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":31.05,"longitude":79.13163,"bright_ti4":345.99,"scan":0.66,"track":0.74,"acq_date":"2026-09-27","acq_time":400,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":310.18,"frp":82.53,"daynight":"D","temp_celsius":84.25,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":31.07192,"longitude":78.9334,"bright_ti4":354.41,"scan":0.35,"track":0.66,"acq_date":"2026-09-27","acq_time":1434,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":308.09,"frp":87.28,"daynight":"N","temp_celsius":67.9,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":30.27736,"longitude":78.89237,"bright_ti4":351.24,"scan":0.75,"track":0.47,"acq_date":"2026-09-27","acq_time":1124,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":309.71,"frp":56.33,"daynight":"N","temp_celsius":66.04,"title":"Demo Indian Wildfire","demo_state":"Uttarakhand","demo_data":true,"type":"wildfire"},{"latitude":31.54112,"longitude":78.32112,"bright_ti4":351.58,"scan":0.7,"track":0.65,"acq_date":"2026-09-27","acq_time":1202,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":295.36,"frp":56.09,"daynight":"D","temp_celsius":81.07,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.50931,"longitude":77.72168,"bright_ti4":346.4,"scan":0.67,"track":0.74,"acq_date":"2026-09-27","acq_time":79,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":301.73,"frp":48.17,"daynight":"N","temp_celsius":65.88,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":30.63642,"longitude":77.33841,"bright_ti4":349.54,"scan":0.61,"track":0.54,"acq_date":"2026-09-27","acq_time":1579,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":289.52,"frp":81.56,"daynight":"N","temp_celsius":67.94,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":30.99727,"longitude":77.44342,"bright_ti4":349.18,"scan":0.47,"track":0.59,"acq_date":"2026-09-27","acq_time":987,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":314.94,"frp":80.81,"daynight":"D","temp_celsius":77.33,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.78953,"longitude":78.34557,"bright_ti4":341.86,"scan":0.51,"track":0.44,"acq_date":"2026-09-27","acq_time":945,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":300.31,"frp":72.86,"daynight":"D","temp_celsius":74.34,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":30.91677,"longitude":78.32776,"bright_ti4":334.49,"scan":0.67,"track":0.48,"acq_date":"2026-09-27","acq_time":2017,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":306.23,"frp":84.85,"daynight":"N","temp_celsius":72.06,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.62495,"longitude":77.94629,"bright_ti4":337.32,"scan":0.36,"track":0.57,"acq_date":"2026-09-27","acq_time":270,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":303.54,"frp":44.51,"daynight":"D","temp_celsius":85.71,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.66498,"longitude":77.61461,"bright_ti4":350.32,"scan":0.72,"track":0.38,"acq_date":"2026-09-27","acq_time":2016,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":292.68,"frp":56.44,"daynight":"D","temp_celsius":93.69,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.21981,"longitude":76.98747,"bright_ti4":342.92,"scan":0.63,"track":0.63,"acq_date":"2026-09-27","acq_time":372,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":287.43,"frp":54.08,"daynight":"D","temp_celsius":81.04,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.56126,"longitude":77.62889,"bright_ti4":358.64,"scan":0.37,"track":0.55,"acq_date":"2026-09-27","acq_time":901,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":293.27,"frp":61.27,"daynight":"N","temp_celsius":93.85,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":30.74586,"longitude":77.60944,"bright_ti4":340.75,"scan":0.54,"track":0.64,"acq_date":"2026-09-27","acq_time":1253,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":289.73,"frp":57.55,"daynight":"N","temp_celsius":64.01,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":32.04899,"longitude":77.79926,"bright_ti4":357.27,"scan":0.5,"track":0.52,"acq_date":"2026-09-27","acq_time":281,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":297.37,"frp":47.93,"daynight":"N","temp_celsius":73.67,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.59163,"longitude":76.94177,"bright_ti4":330.75,"scan":0.55,"track":0.49,"acq_date":"2026-09-27","acq_time":1104,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":291.05,"frp":47.95,"daynight":"D","temp_celsius":66.42,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.40219,"longitude":77.6189,"bright_ti4":348.59,"scan":0.42,"track":0.7,"acq_date":"2026-09-27","acq_time":1961,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":309.32,"frp":72.09,"daynight":"N","temp_celsius":66.12,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":32.09565,"longitude":77.11319,"bright_ti4":338.97,"scan":0.41,"track":0.45,"acq_date":"2026-09-27","acq_time":2004,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":292.86,"frp":48.64,"daynight":"N","temp_celsius":71.67,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":31.47179,"longitude":78.45316,"bright_ti4":351.16,"scan":0.44,"track":0.55,"acq_date":"2026-09-27","acq_time":145,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":292.67,"frp":87.67,"daynight":"D","temp_celsius":69.36,"title":"Demo Indian Wildfire","demo_state":"Himachal Pradesh","demo_data":true,"type":"wildfire"},{"latitude":21.48452,"longitude":77.37015,"bright_ti4":331.87,"scan":0.66,"track":0.73,"acq_date":"2026-09-27","acq_time":454,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":310.58,"frp":47.58,"daynight":"D","temp_celsius":86.73,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":23.02629,"longitude":76.93468,"bright_ti4":353.27,"scan":0.39,"track":0.73,"acq_date":"2026-09-27","acq_time":2216,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":311.76,"frp":74.0,"daynight":"N","temp_celsius":84.19,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":22.13002,"longitude":81.56411,"bright_ti4":363.54,"scan":0.39,"track":0.41,"acq_date":"2026-09-27","acq_time":718,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":308.53,"frp":54.02,"daynight":"N","temp_celsius":82.22,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":23.06823,"longitude":79.83694,"bright_ti4":353.86,"scan":0.55,"track":0.46,"acq_date":"2026-09-27","acq_time":1189,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":302.71,"frp":47.73,"daynight":"D","temp_celsius":91.92,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":21.87434,"longitude":79.10401,"bright_ti4":359.87,"scan":0.48,"track":0.66,"acq_date":"2026-09-27","acq_time":1324,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":297.45,"frp":53.04,"daynight":"D","temp_celsius":86.41,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":23.49611,"longitude":76.13093,"bright_ti4":337.99,"scan":0.7,"track":0.61,"acq_date":"2026-09-27","acq_time":2032,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":292.76,"frp":57.98,"daynight":"N","temp_celsius":86.09,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":21.04616,"longitude":81.19078,"bright_ti4":330.52,"scan":0.52,"track":0.62,"acq_date":"2026-09-27","acq_time":1106,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":304.93,"frp":51.29,"daynight":"D","temp_celsius":81.4,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":22.62442,"longitude":76.86957,"bright_ti4":337.7,"scan":0.51,"track":0.4,"acq_date":"2026-09-27","acq_time":1625,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":304.64,"frp":61.44,"daynight":"D","temp_celsius":77.06,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":23.17426,"longitude":81.69097,"bright_ti4":340.23,"scan":0.6,"track":0.52,"acq_date":"2026-09-27","acq_time":1198,"satellite":"VIIRS-Demo","confidence":"high","version":"Demo-India","bright_ti5":297.47,"frp":45.62,"daynight":"N","temp_celsius":66.51,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":22.05627,"longitude":78.11749,"bright_ti4":341.22,"scan":0.65,"track":0.71,"acq_date":"2026-09-27","acq_time":1346,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":293.85,"frp":46.95,"daynight":"N","temp_celsius":88.52,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":21.18113,"longitude":78.67362,"bright_ti4":357.34,"scan":0.52,"track":0.64,"acq_date":"2026-09-27","acq_time":1525,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":292.89,"frp":85.3,"daynight":"D","temp_celsius":84.57,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":23.33838,"longitude":77.30125,"bright_ti4":357.72,"scan":0.64,"track":0.46,"acq_date":"2026-09-27","acq_time":556,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":314.47,"frp":74.07,"daynight":"D","temp_celsius":76.38,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":23.17,"longitude":81.02945,"bright_ti4":338.13,"scan":0.38,"track":0.74,"acq_date":"2026-09-27","acq_time":2330,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":290.02,"frp":76.64,"daynight":"N","temp_celsius":83.72,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":23.67779,"longitude":79.04355,"bright_ti4":361.62,"scan":0.47,"track":0.65,"acq_date":"2026-09-27","acq_time":700,"satellite":"VIIRS-Demo","confidence":"nominal","version":"Demo-India","bright_ti5":303.42,"frp":93.41,"daynight":"D","temp_celsius":63.37,"title":"Demo Indian Wildfire","demo_state":"Madhya Pradesh","demo_data":true,"type":"wildfire"},{"latitude":21.10014,"longitude":72.63404,"bright_ti4":336.61,"scan":0.6,"track":0.53,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":298.34,"frp":36.33,"daynight":"D","temp_celsius":63.46,"title":"Industrial Fire","demo_state":NaN,"demo_data":false,"type":"industrial"},{"latitude":28.7746,"longitude":71.00861,"bright_ti4":353.66,"scan":0.53,"track":0.5,"acq_date":"2026-09-10","acq_time":750,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":310.18,"frp":15.55,"daynight":"D","temp_celsius":80.51,"title":"Industrial Fire","demo_state":NaN,"demo_data":false,"type":"industrial"},{"latitude":21.09986,"longitude":72.63593,"bright_ti4":367.0,"scan":0.6,"track":0.71,"acq_date":"2026-09-11","acq_time":731,"satellite":"N21","confidence":"high","version":"2.0NRT","bright_ti5":292.5,"frp":16.4,"daynight":"D","temp_celsius":93.85,"title":"Industrial Fire","demo_state":NaN,"demo_data":false,"type":"industrial"},{"latitude":21.10254,"longitude":72.64712,"bright_ti4":332.28,"scan":0.6,"track":0.71,"acq_date":"2026-09-11","acq_time":731,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":291.89,"frp":16.69,"daynight":"D","temp_celsius":59.13,"title":"Industrial Fire","demo_state":NaN,"demo_data":false,"type":"industrial"},{"latitude":27.76173,"longitude":96.05025,"bright_ti4":367.0,"scan":0.49,"track":0.65,"acq_date":"2026-09-11","acq_time":729,"satellite":"N21","confidence":"high","version":"2.0NRT","bright_ti5":291.32,"frp":30.46,"daynight":"D","temp_celsius":93.85,"title":"Industrial Fire","demo_state":NaN,"demo_data":false,"type":"industrial"},{"latitude":28.02405,"longitude":96.64853,"bright_ti4":329.18,"scan":0.53,"track":0.5,"acq_date":"2026-09-10","acq_time":608,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":291.84,"frp":6.33,"daynight":"D","temp_celsius":56.03,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":8.41569,"longitude":77.66499,"bright_ti4":335.52,"scan":0.47,"track":0.48,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":302.54,"frp":3.43,"daynight":"D","temp_celsius":62.37,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":8.43529,"longitude":77.6227,"bright_ti4":336.99,"scan":0.47,"track":0.48,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":304.43,"frp":1.21,"daynight":"D","temp_celsius":63.84,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":8.61568,"longitude":78.09698,"bright_ti4":336.26,"scan":0.44,"track":0.46,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":293.13,"frp":4.47,"daynight":"D","temp_celsius":63.11,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":8.90687,"longitude":77.60324,"bright_ti4":339.94,"scan":0.47,"track":0.48,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":306.89,"frp":3.33,"daynight":"D","temp_celsius":66.79,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":8.90438,"longitude":77.60378,"bright_ti4":333.52,"scan":0.47,"track":0.48,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"low","version":"2.0NRT","bright_ti5":304.14,"frp":4.95,"daynight":"D","temp_celsius":60.37,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":8.96667,"longitude":77.85931,"bright_ti4":348.35,"scan":0.45,"track":0.47,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":309.61,"frp":14.16,"daynight":"D","temp_celsius":75.2,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":9.2705,"longitude":78.60549,"bright_ti4":343.63,"scan":0.4,"track":0.44,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":304.06,"frp":2.3,"daynight":"D","temp_celsius":70.48,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":9.36015,"longitude":78.76106,"bright_ti4":339.16,"scan":0.39,"track":0.44,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":302.15,"frp":1.88,"daynight":"D","temp_celsius":66.01,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":9.24767,"longitude":77.89903,"bright_ti4":342.41,"scan":0.44,"track":0.46,"acq_date":"2026-09-10","acq_time":744,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":308.27,"frp":12.1,"daynight":"D","temp_celsius":69.26,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":14.50943,"longitude":77.50732,"bright_ti4":345.89,"scan":0.39,"track":0.44,"acq_date":"2026-09-10","acq_time":746,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":301.31,"frp":6.11,"daynight":"D","temp_celsius":72.74,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.17447,"longitude":76.8308,"bright_ti4":341.83,"scan":0.41,"track":0.45,"acq_date":"2026-09-10","acq_time":746,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":297.72,"frp":3.73,"daynight":"D","temp_celsius":68.68,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":17.3086,"longitude":77.62019,"bright_ti4":333.06,"scan":0.52,"track":0.41,"acq_date":"2026-09-10","acq_time":746,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":285.06,"frp":8.89,"daynight":"D","temp_celsius":59.91,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":17.30932,"longitude":77.6216,"bright_ti4":330.95,"scan":0.52,"track":0.41,"acq_date":"2026-09-10","acq_time":746,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":284.98,"frp":8.81,"daynight":"D","temp_celsius":57.8,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":17.70016,"longitude":75.35762,"bright_ti4":335.22,"scan":0.46,"track":0.47,"acq_date":"2026-09-10","acq_time":746,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":297.83,"frp":3.82,"daynight":"D","temp_celsius":62.07,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":18.63248,"longitude":74.05639,"bright_ti4":331.15,"scan":0.54,"track":0.51,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":291.95,"frp":4.94,"daynight":"D","temp_celsius":58.0,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":19.92554,"longitude":79.11815,"bright_ti4":332.8,"scan":0.42,"track":0.37,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"low","version":"2.0NRT","bright_ti5":298.29,"frp":8.46,"daynight":"D","temp_celsius":59.65,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":22.21438,"longitude":84.866,"bright_ti4":333.48,"scan":0.51,"track":0.41,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":288.1,"frp":5.73,"daynight":"D","temp_celsius":60.33,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":22.21149,"longitude":84.86465,"bright_ti4":334.91,"scan":0.51,"track":0.41,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":289.17,"frp":5.09,"daynight":"D","temp_celsius":61.76,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":22.7853,"longitude":86.20583,"bright_ti4":337.65,"scan":0.41,"track":0.45,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":292.54,"frp":7.11,"daynight":"D","temp_celsius":64.5,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":21.10247,"longitude":72.64529,"bright_ti4":342.82,"scan":0.6,"track":0.53,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":295.75,"frp":9.05,"daynight":"D","temp_celsius":69.67,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":21.10725,"longitude":72.6442,"bright_ti4":331.63,"scan":0.6,"track":0.53,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":298.17,"frp":9.05,"daynight":"D","temp_celsius":58.48,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":23.68556,"longitude":86.39387,"bright_ti4":336.97,"scan":0.43,"track":0.46,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":293.54,"frp":5.88,"daynight":"D","temp_celsius":63.82,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":23.71437,"longitude":86.45137,"bright_ti4":333.64,"scan":0.43,"track":0.46,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":292.95,"frp":6.09,"daynight":"D","temp_celsius":60.49,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":23.73816,"longitude":86.43526,"bright_ti4":336.08,"scan":0.43,"track":0.46,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":293.61,"frp":6.49,"daynight":"D","temp_celsius":62.93,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":23.77997,"longitude":86.21016,"bright_ti4":342.33,"scan":0.42,"track":0.45,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":293.47,"frp":8.13,"daynight":"D","temp_celsius":69.18,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":23.77832,"longitude":86.21114,"bright_ti4":335.85,"scan":0.42,"track":0.45,"acq_date":"2026-09-10","acq_time":748,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":292.01,"frp":8.84,"daynight":"D","temp_celsius":62.7,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":23.22823,"longitude":69.83833,"bright_ti4":335.21,"scan":0.41,"track":0.61,"acq_date":"2026-09-10","acq_time":750,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":298.63,"frp":6.36,"daynight":"D","temp_celsius":62.06,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":23.22733,"longitude":69.83443,"bright_ti4":353.5,"scan":0.41,"track":0.61,"acq_date":"2026-09-10","acq_time":750,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":299.98,"frp":6.36,"daynight":"D","temp_celsius":80.35,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":25.78074,"longitude":73.69642,"bright_ti4":330.59,"scan":0.42,"track":0.45,"acq_date":"2026-09-10","acq_time":750,"satellite":"N21","confidence":"low","version":"2.0NRT","bright_ti5":304.03,"frp":1.44,"daynight":"D","temp_celsius":57.44,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":25.56557,"longitude":72.19657,"bright_ti4":334.68,"scan":0.52,"track":0.5,"acq_date":"2026-09-10","acq_time":750,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":304.27,"frp":3.32,"daynight":"D","temp_celsius":61.53,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":18.80434,"longitude":74.2586,"bright_ti4":310.09,"scan":0.41,"track":0.45,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":289.83,"frp":0.77,"daynight":"N","temp_celsius":36.94,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.3341,"longitude":76.28777,"bright_ti4":307.32,"scan":0.44,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":291.88,"frp":1.69,"daynight":"N","temp_celsius":34.17,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.1776,"longitude":77.10484,"bright_ti4":306.7,"scan":0.41,"track":0.37,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":291.49,"frp":1.38,"daynight":"N","temp_celsius":33.55,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.22459,"longitude":76.76285,"bright_ti4":317.18,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":293.41,"frp":2.43,"daynight":"N","temp_celsius":44.03,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.17476,"longitude":77.10052,"bright_ti4":308.85,"scan":0.41,"track":0.37,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":291.91,"frp":1.38,"daynight":"N","temp_celsius":35.7,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.18192,"longitude":76.66852,"bright_ti4":316.12,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":284.73,"frp":1.24,"daynight":"N","temp_celsius":42.97,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.18135,"longitude":76.67244,"bright_ti4":302.51,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":285.75,"frp":1.24,"daynight":"N","temp_celsius":29.36,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.18079,"longitude":76.67635,"bright_ti4":308.84,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":286.89,"frp":1.76,"daynight":"N","temp_celsius":35.69,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.17677,"longitude":76.67976,"bright_ti4":323.76,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":286.41,"frp":1.45,"daynight":"N","temp_celsius":50.61,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.17734,"longitude":76.67583,"bright_ti4":308.41,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":286.12,"frp":1.45,"daynight":"N","temp_celsius":35.26,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.1767,"longitude":76.65572,"bright_ti4":325.35,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":283.32,"frp":4.18,"daynight":"N","temp_celsius":52.2,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.17614,"longitude":76.65965,"bright_ti4":313.93,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":282.92,"frp":2.24,"daynight":"N","temp_celsius":40.78,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.17332,"longitude":76.67924,"bright_ti4":311.98,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":285.1,"frp":1.45,"daynight":"N","temp_celsius":38.83,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"},{"latitude":15.17324,"longitude":76.6552,"bright_ti4":300.7,"scan":0.42,"track":0.38,"acq_date":"2026-09-10","acq_time":2017,"satellite":"N21","confidence":"nominal","version":"2.0NRT","bright_ti5":280.61,"frp":0.62,"daynight":"N","temp_celsius":27.55,"title":"Agricultural Fire","demo_state":NaN,"demo_data":false,"type":"agricultural"}];

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const activeUser = localStorage.getItem('pyrovision_user');
  if (activeUser) {
    showDashboard(activeUser);
  } else {
    showLogin();
  }
});

async function handleLogin(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('username').value.trim();
  const passwordInput = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('loginError');

  if ((usernameInput === 'admin' || usernameInput === 'demo') && (passwordInput === 'admin123' || passwordInput === 'demo123')) {
    localStorage.setItem('pyrovision_user', usernameInput);
    showDashboard(usernameInput);
  } else {
    errorDiv.style.display = 'block';
  }
}

function handleLogout() {
  localStorage.removeItem('pyrovision_user');
  showLogin();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboardScreen').style.display = 'none';
}

function showDashboard(username) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'flex';
  document.getElementById('loggedInUser').textContent = username;

  setTimeout(() => {
    initMaps();
    renderCSVIncidents(csvDataset);
    initAnalyticsCharts();
  }, 200);
}

function switchView(viewId, element) {
  document.querySelectorAll('.view-page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  const targetPage = document.getElementById(viewId);
  if (targetPage) targetPage.classList.add('active');
  if (element) element.classList.add('active');

  setTimeout(() => {
    if (mainMap) mainMap.updateSize();
    if (fullMap) fullMap.updateSize();
  }, 100);
}

function initMaps() {
  const mapElement = document.getElementById('map');
  if (!mapElement || mainMap) return;

  vectorSource = new ol.source.Vector();
  const vectorLayer = new ol.layer.Vector({ source: vectorSource });

  heatmapLayer = new ol.layer.Heatmap({
    source: vectorSource,
    blur: 18,
    radius: 9,
    weight: feature => feature.get('riskWeight') || 0.3,
    visible: false
  });

  currentLayer = new ol.layer.Tile({ source: mapSources.satellite });

  // Default accurate center set to Delhi, India
  mainMap = new ol.Map({
    target: 'map',
    layers: [currentLayer, heatmapLayer, vectorLayer],
    view: new ol.View({
      center: ol.proj.fromLonLat([77.2090, 28.6139]),
      zoom: 6
    })
  });

  const fullMapElement = document.getElementById('map-full');
  if (fullMapElement && !fullMap) {
    fullMapLayer = new ol.layer.Tile({ source: mapSources.satellite });
    fullMap = new ol.Map({
      target: 'map-full',
      layers: [fullMapLayer, heatmapLayer, new ol.layer.Vector({ source: vectorSource })],
      view: mainMap.getView()
    });
  }
}

function setMapLayer(type) {
  if (!mapSources[type]) return;
  if (currentLayer) currentLayer.setSource(mapSources[type]);
  if (fullMapLayer) fullMapLayer.setSource(mapSources[type]);

  document.querySelectorAll('.layer-btn').forEach(btn => {
    if (!btn.innerHTML.includes('My Location')) {
      btn.classList.remove('active');
    }
  });

  const btnIdMap = { osm: 'map', satellite: 'sat' };
  const targetKey = btnIdMap[type];
  
  const activeBtn = document.getElementById(`btn-${targetKey}`);
  const activeFullBtn = document.getElementById(`btn-full-${targetKey}`);
  
  if (activeBtn) activeBtn.classList.add('active');
  if (activeFullBtn) activeFullBtn.classList.add('active');
}

function handleSearchKeyPress(event) {
  if (event.key === 'Enter') {
    const query = document.getElementById('mapSearchInput').value.trim();
    if (!query) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const coord = ol.proj.fromLonLat([lon, lat]);

          if (mainMap) {
            mainMap.getView().animate({ center: coord, zoom: 11, duration: 1200 });
          }
          refreshWeather(lat, lon, data[0].display_name || 'Selected Location');
        } else {
          alert("Location not found. Please try another city or region name.");
        }
      })
      .catch(err => console.error("Search error:", err));
  }
}

function panToLiveLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lon = position.coords.longitude;
      const lat = position.coords.latitude;
      const coord = ol.proj.fromLonLat([lon, lat]);

      if (mainMap) {
        mainMap.getView().animate({ center: coord, zoom: 13, duration: 1000 });
      }
      refreshWeather(lat, lon, 'My Location');

      if (userLocationFeature) {
        vectorSource.removeFeature(userLocationFeature);
      }

      userLocationFeature = new ol.Feature({
        geometry: new ol.geom.Point(coord),
        name: "My Live Location"
      });

      userLocationFeature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({ color: '#3b82f6' }),
          stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 })
        })
      }));

      vectorSource.addFeature(userLocationFeature);
    },
    (error) => {
      alert("Unable to retrieve your exact GPS location. Please check browser permissions.");
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}


function getRiskScore(row) {
  const frp = Number(row.frp) || 0;
  const temp = Number(row.temp_celsius) || 0;
  const confidence = String(row.confidence || '').toLowerCase();
  const confScore = confidence.includes('high') ? 18 : confidence.includes('nominal') ? 11 : 6;
  const frpScore = Math.min(55, frp * 1.05);
  const tempScore = Math.min(27, Math.max(0, (temp - 285) * 0.9));
  return Math.round(Math.min(100, frpScore + tempScore + confScore));
}

function getRiskLevel(score) {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
}

function getRiskClass(level) {
  return 'risk-' + level.toLowerCase();
}

function updateRiskSummary(data) {
  const scored = data.map((row, i) => ({ row, score: getRiskScore(row), index: i }));
  const highest = [...scored].sort((a,b) => b.score - a.score)[0];
  const highCount = scored.filter(x => x.score >= 50).length;
  const avg = scored.length ? Math.round(scored.reduce((s,x) => s+x.score,0) / scored.length) : 0;

  const hv = document.getElementById('highestRiskValue');
  const hm = document.getElementById('highestRiskMeta');
  const hc = document.getElementById('highRiskCount');
  const av = document.getElementById('averageRiskValue');
  if (hv) hv.textContent = highest ? highest.score + '/100' : '--';
  if (hm) hm.textContent = highest ? `${highest.row.title} • ${getRiskLevel(highest.score)}` : 'No incidents';
  if (hc) hc.textContent = highCount;
  if (av) av.textContent = avg;
}

function renderRiskRanking(data) {
  const box = document.getElementById('riskRanking');
  if (!box) return;
  const ranked = data.map(row => ({ row, score: getRiskScore(row) }))
    .sort((a,b) => b.score - a.score);

  box.innerHTML = ranked.map(({row, score}) => {
    const level = getRiskLevel(score);
    return `<div class="risk-row">
      <div>
        <div class="risk-row-title">${row.title}</div>
        <div class="risk-row-meta">Lat ${row.latitude}, Lon ${row.longitude} • FRP ${row.frp} MW</div>
      </div>
      <span class="risk-badge ${getRiskClass(level)}">${level}</span>
      <div class="risk-score">${score}</div>
    </div>`;
  }).join('');
}

function toggleHeatmap(force) {
  if (!heatmapLayer) return;
  const next = typeof force === 'boolean' ? force : !heatmapLayer.getVisible();
  heatmapLayer.setVisible(next);
  ['btn-heat','btn-full-heat'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', next);
  });
  const setting = document.getElementById('heatmapToggle');
  if (setting) setting.checked = next;
}

function toggleHeatmapFromSetting(checked) {
  toggleHeatmap(checked);
}

function toggleRiskAlerts(checked) {
  riskAlertsEnabled = checked;
}


function toggleSidebar(force) {
  const body = document.body;
  const button = document.getElementById('sidebarToggle');
  const isCollapsed = body.classList.contains('sidebar-collapsed');
  const nextCollapsed = typeof force === 'boolean' ? force : !isCollapsed;

  body.classList.toggle('sidebar-collapsed', nextCollapsed);
  localStorage.setItem('pyrovision_sidebar_collapsed', String(nextCollapsed));

  if (button) {
    button.setAttribute('aria-label', nextCollapsed ? 'Show navigation' : 'Hide navigation');
    button.setAttribute('title', nextCollapsed ? 'Show navigation' : 'Hide navigation');
    button.innerHTML = nextCollapsed
      ? '<i data-lucide="panel-left-open"></i>'
      : '<i data-lucide="panel-left-close"></i>';
  }
  if (window.lucide) lucide.createIcons();
}

function initSidebarState() {
  const saved = localStorage.getItem('pyrovision_sidebar_collapsed');
  if (saved === 'true') toggleSidebar(true);
}

function togglePrototypeTools() {
  const menu = document.getElementById('prototypeToolsMenu');
  const button = document.querySelector('.prototype-tools-toggle');
  if (!menu) return;
  const willOpen = menu.hidden;
  menu.hidden = !willOpen;
  if (button) button.setAttribute('aria-expanded', String(willOpen));
  if (window.lucide) lucide.createIcons();
}


function toggleWeather(checked) {
  weatherEnabled = checked;
  const mini = document.getElementById('weatherMini');
  const panel = document.getElementById('weatherPanel');
  if (!checked) {
    if (mini) mini.innerHTML = '<strong>Weather Risk:</strong> disabled in Settings';
    if (panel) panel.innerHTML = '<div class="weather-loading">Weather context disabled.</div>';
  } else {
    refreshWeather();
  }
}

async function refreshWeather(lat = 28.6139, lon = 77.2090, locationLabel = 'Delhi') {
  if (!weatherEnabled) return;
  const mini = document.getElementById('weatherMini');
  const panel = document.getElementById('weatherPanel');
  if (mini) mini.innerHTML = `<strong>${locationLabel} Weather:</strong> loading...`;
  if (panel) panel.innerHTML = '<div class="weather-loading">Fetching current weather for the selected map location...</div>';

  // Weather is requested for the actual map/incident coordinates.
  // Initial dashboard reference remains New Delhi.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=Asia%2FKolkata`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather request failed');
    const data = await response.json();
    weatherCache = data.current;
    const t = Number(data.current.temperature_2m).toFixed(1);
    const h = Number(data.current.relative_humidity_2m).toFixed(0);
    const w = Number(data.current.wind_speed_10m).toFixed(1);
    const p = Number(data.current.precipitation).toFixed(1);
    const weatherRisk = (Number(t) >= 38 && Number(w) >= 15) ? 'Elevated' :
                        (Number(t) >= 34 || Number(w) >= 12) ? 'Moderate' : 'Low';

    if (mini) mini.innerHTML = `<strong>${locationLabel} Weather:</strong> ${t}°C • Wind ${w} km/h • Risk ${weatherRisk}`;
    if (panel) panel.innerHTML = `<div class="weather-grid">
      <div class="weather-cell"><span>Temperature</span><strong>${t}°C</strong></div>
      <div class="weather-cell"><span>Humidity</span><strong>${h}%</strong></div>
      <div class="weather-cell"><span>Wind</span><strong>${w} km/h</strong></div>
      <div class="weather-cell"><span>Precipitation</span><strong>${p} mm</strong></div>
      <div class="weather-cell"><span>Risk Context</span><strong>${weatherRisk}</strong></div>
      <div class="weather-cell"><span>Coordinates</span><strong>${Number(lat).toFixed(3)}, ${Number(lon).toFixed(3)}</strong></div>
      <div class="weather-cell"><span>Source</span><strong>Open-Meteo</strong></div>
    </div>`;
  } catch (err) {
    if (mini) mini.innerHTML = `<strong>${locationLabel} Weather:</strong> unavailable`;
    if (panel) panel.innerHTML = '<div class="weather-loading">Live weather is unavailable for this location right now.</div>';
  }
}

function simulateRealTimeAlert() {
  const top = csvDataset.map(row => ({row, score:getRiskScore(row)}))
    .sort((a,b) => b.score-a.score)[0];
  if (!top) return;
  const toast = document.getElementById('alertToast');
  if (!toast) return;
  toast.innerHTML = `🚨 <strong>New Risk Alert</strong><br>${top.row.title} detected at ${top.row.latitude.toFixed(4)}, ${top.row.longitude.toFixed(4)}<br>Risk Score: <strong>${top.score}/100</strong> (${getRiskLevel(top.score)})`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 6000);
}

function showResponseGuide(type) {
  const guide = document.getElementById('responseGuide');
  if (!guide) return;
  const guides = {
    wildfire: '<strong>Wildfire:</strong> verify hotspot, assess wind direction, identify nearby population/assets, notify response teams, and consider evacuation-zone review.',
    industrial: '<strong>Industrial:</strong> verify site, check hazardous-material risk, isolate the affected zone, notify facility response, and coordinate emergency services.',
    agricultural: '<strong>Agricultural:</strong> verify field location, monitor spread toward roads/habitations, contact local response resources, and track wind conditions.',
    evacuation: '<strong>Evacuation:</strong> identify affected settlements, map safe routes, avoid fire/wind corridors, communicate verified instructions, and keep an incident log.'
  };
  guide.innerHTML = guides[type] || 'Select a protocol.';
}

function downloadCSVReport() {
  const headers = ['Fire Type','Latitude','Longitude','FRP MW','Temperature C','Confidence','Risk Score','Risk Level','Acquisition Date'];
  const rows = csvDataset.map(row => [
    row.title, row.latitude, row.longitude, row.frp, row.temp_celsius,
    row.confidence, getRiskScore(row), getRiskLevel(getRiskScore(row)), row.acq_date
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pyrovision_incident_risk_report.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function printIncidentReport() {
  const ranked = csvDataset.map(row => ({row, score:getRiskScore(row)})).sort((a,b)=>b.score-a.score);
  const report = ranked.map(x => `<tr><td>${x.row.title}</td><td>${x.row.latitude}, ${x.row.longitude}</td><td>${x.row.frp}</td><td>${x.row.temp_celsius}°C</td><td>${x.score}/100</td><td>${getRiskLevel(x.score)}</td></tr>`).join('');
  const w = window.open('', '_blank');
  if (!w) { alert('Please allow pop-ups to generate the print/PDF report.'); return; }
  w.document.write(`<html><head><title>PyroVision Incident Report</title><style>
    body{font-family:Arial,sans-serif;padding:28px;color:#111} h1{margin-bottom:4px}
    table{border-collapse:collapse;width:100%;margin-top:18px}th,td{border:1px solid #bbb;padding:8px;text-align:left}
    th{background:#eee}
  </style></head><body><h1>PyroVision Incident Analysis Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Prototype report with incident classification and risk scoring.</p>
  <table><thead><tr><th>Type</th><th>Coordinates</th><th>FRP</th><th>Temp</th><th>Risk</th><th>Level</th></tr></thead>
  <tbody>${report}</tbody></table></body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}


function getFireColor(type) {
  if (type === 'wildfire') return '#a855f7';
  if (type === 'industrial') return '#ff5722';
  return '#eab308';
}

function renderCSVIncidents(data) {
  const alertsContainer = document.getElementById('liveAlertsContainer');
  const classContainer = document.getElementById('recentClassificationsContainer');
  const tableBody = document.getElementById('alertsTableBody');

  if (alertsContainer) alertsContainer.innerHTML = '';
  if (classContainer) classContainer.innerHTML = '';
  if (tableBody) tableBody.innerHTML = '';

  updateRiskSummary(data);
  renderRiskRanking(data);
  data.forEach((row, idx) => {
    const color = getFireColor(row.type);

    if (alertsContainer) {
      alertsContainer.innerHTML += `
        <div class="alert-card" style="border-left-color: ${color};">
          <div class="alert-title">${row.title} <span>${row.acq_date}</span></div>
          <div class="alert-loc">Lat: ${row.latitude}, Lon: ${row.longitude} | Temp: ${row.temp_celsius}°C</div>
        </div>`;
    }

    if (classContainer) {
      classContainer.innerHTML += `
        <div style="font-size: 0.75rem; background: var(--card-bg); padding: 8px; border-radius: 4px; margin-bottom: 6px; border: 1px solid var(--border-color);">
          <span style="color: ${color}; font-weight: bold;">■ FRP: ${row.frp} MW</span> (Conf: ${row.confidence})<br>
          <span style="color: var(--text-muted);">Lat: ${row.latitude}, Lon: ${row.longitude}</span>
        </div>`;
    }

    if (tableBody) {
      tableBody.innerHTML += `
        <tr>
          <td><span style="color: ${color}; font-weight: bold;">${row.title}</span></td>
          <td>Lat: ${row.latitude}, Lon: ${row.longitude}</td>
          <td>${row.frp} MW</td>
          <td>${row.temp_celsius} °C</td>
          <td>${row.confidence}</td>
          <td><span class="risk-badge ${getRiskClass(getRiskLevel(getRiskScore(row)))}">${getRiskLevel(getRiskScore(row))} ${getRiskScore(row)}</span></td>
          <td>
            <button class="btn-action" onclick="focusOnMap(${row.longitude}, ${row.latitude})">View on Map</button>
          </td>
        </tr>`;
    }

    const feature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([row.longitude, row.latitude])),
      name: row.title,
      riskWeight: Math.max(0.15, getRiskScore(row) / 100)
    });

    feature.setStyle(new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({ color: color }),
        stroke: new ol.style.Stroke({ color: '#ffffff', width: 2.5 })
      })
    }));

    vectorSource.addFeature(feature);
  });

  // Automatically fit the map to every incident so the full 100-location
  // dataset is visible instead of staying focused only around Delhi.
  fitMapToAllIncidents();
}

function fitMapToAllIncidents() {
  if (!mainMap || !vectorSource || vectorSource.getFeatures().length === 0) return;

  const extent = vectorSource.getExtent();
  if (!extent || !isFinite(extent[0])) return;

  mainMap.updateSize();
  mainMap.getView().fit(extent, {
    padding: [70, 70, 70, 70],
    maxZoom: 6,
    duration: 700
  });
}

async function focusOnMap(lon, lat) {
  switchView('dashboard', document.querySelectorAll('.nav-item')[0]);
  if (mainMap) {
    mainMap.getView().animate({ 
      center: ol.proj.fromLonLat([lon, lat]), 
      zoom: 12, 
      duration: 1200 
    });
  }

  // When an alert's "View on Map" is used, move the weather card to that incident too.
  let locationLabel = `Incident (${Number(lat).toFixed(3)}, ${Number(lon).toFixed(3)})`;
  try {
    const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1`);
    if (geo.ok) {
      const result = await geo.json();
      const a = result.address || {};
      locationLabel = a.city || a.town || a.village || a.state_district || a.state || locationLabel;
    }
  } catch (e) {
    // Coordinates remain the fallback label.
  }
  refreshWeather(lat, lon, locationLabel);
}

function updateAnalyticsSummary() {
  const total = csvDataset.length;
  const wildfires = csvDataset.filter(d => d.type === 'wildfire').length;
  const industrial = csvDataset.filter(d => d.type === 'industrial').length;
  const agricultural = csvDataset.filter(d => d.type === 'agricultural').length;
  const maxFrp = total ? Math.max(...csvDataset.map(d => Number(d.frp) || 0)) : 0;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('stat-total', total);
  setText('stat-wildfire', wildfires);
  setText('stat-industrial', industrial);
  setText('stat-agricultural', agricultural);
  setText('stat-total-note', `Dataset records • ${new Set(csvDataset.map(d => d.acq_date)).size} dates`);
  setText('stat-wildfire-note', wildfires ? `Highest-risk class • max FRP ${maxFrp.toFixed(2)} MW` : 'No records in this dataset');
  setText('stat-industrial-note', `${industrial} records • FRP 15–40 MW`);
  setText('stat-agricultural-note', `${agricultural} records • FRP below 15 MW`);
}

function initAnalyticsCharts() {
  const ctxTrend = document.getElementById('trendChart');
  const ctxDist = document.getElementById('distChart');
  if (!ctxTrend || !ctxDist) return;

  updateAnalyticsSummary();

  // Aggregate the uploaded dataset by acquisition date instead of plotting a hard-coded demo series.
  const daily = {};
  csvDataset.forEach(row => {
    const date = row.acq_date || 'Unknown';
    if (!daily[date]) daily[date] = { count: 0, frp: 0, temp: 0 };
    daily[date].count += 1;
    daily[date].frp += Number(row.frp) || 0;
    daily[date].temp += Number(row.temp_celsius) || 0;
  });

  const dates = Object.keys(daily).sort();
  const labels = dates.map(d => {
    const parts = d.split('-');
    return parts.length === 3 ? `${parts[2]} Sep` : d;
  });
  const incidentCounts = dates.map(d => daily[d].count);

  const note = document.getElementById('analyticsTrendNote');
  if (note) {
    const totalFrp = csvDataset.reduce((sum, row) => sum + (Number(row.frp) || 0), 0);
    note.textContent = `${csvDataset.length} records • ${dates.length} acquisition dates • Total FRP ${totalFrp.toFixed(2)} MW`;
  }

  new Chart(ctxTrend.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Incidents',
        data: incidentCounts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,.12)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,.08)' } },
        y: { beginAtZero: true, ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,.08)' } }
      }
    }
  });

  const wildfires = csvDataset.filter(d => d.type === 'wildfire').length;
  const industrial = csvDataset.filter(d => d.type === 'industrial').length;
  const agricultural = csvDataset.filter(d => d.type === 'agricultural').length;

  new Chart(ctxDist.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Wildfire', 'Industrial Fire', 'Agricultural'],
      datasets: [{
        data: [wildfires, industrial, agricultural],
        backgroundColor: ['#a855f7', '#ff5722', '#eab308']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8' } } }
    }
  });
}

function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  if (chatBox) chatBox.classList.toggle('open');
}


function escapeAI(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function addAIMessage(html, isBot = true) {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const el = document.createElement('div');
  el.className = isBot ? 'msg bot' : 'msg user';
  if (isBot) el.innerHTML = html; else el.textContent = html;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

function runAICommand(command) {
  const input = document.getElementById('chatInput');
  if (input) input.value = command;
  sendChatMessage();
}

function getTopRiskIncidents(limit = 5) {
  return csvDataset.map(row => ({row, score:getRiskScore(row)})).sort((a,b)=>b.score-a.score).slice(0, limit);
}

function getTopFRPIncidents(limit = 5) {
  return [...csvDataset].sort((a,b)=>(Number(b.frp)||0)-(Number(a.frp)||0)).slice(0, limit);
}

function getTypeCounts() {
  return {
    wildfire: csvDataset.filter(d => d.type === 'wildfire').length,
    industrial: csvDataset.filter(d => d.type === 'industrial').length,
    agricultural: csvDataset.filter(d => d.type === 'agricultural').length
  };
}

function aiAnalyzeData() {
  const counts = getTypeCounts();
  const totalFRP = csvDataset.reduce((s,r)=>s+(Number(r.frp)||0),0);
  const avgFRP = csvDataset.length ? totalFRP/csvDataset.length : 0;
  const maxTemp = csvDataset.reduce((a,b)=>(Number(a.temp_celsius)||0)>(Number(b.temp_celsius)||0)?a:b, csvDataset[0]);
  const dates = [...new Set(csvDataset.map(r=>r.acq_date).filter(Boolean))].sort();
  return `📊 <strong>PyroVision Data Analysis</strong><br>Total incidents: <strong>${csvDataset.length}</strong><br>• Agricultural: ${counts.agricultural}<br>• Industrial: ${counts.industrial}<br>• Wildfire: ${counts.wildfire}<br>• Total FRP: <strong>${totalFRP.toFixed(2)} MW</strong><br>• Average FRP: ${avgFRP.toFixed(2)} MW<br>• Acquisition dates: ${dates.join(', ') || 'N/A'}<br>• Highest temperature: ${maxTemp ? `${Number(maxTemp.temp_celsius).toFixed(1)}°C at ${Number(maxTemp.latitude).toFixed(3)}, ${Number(maxTemp.longitude).toFixed(3)}` : 'N/A'}<div class="ai-action-row"><button onclick="switchView('analytics', document.querySelectorAll('.nav-item')[3])">Open Analytics</button></div>`;
}

function aiShowTopFRP(limit=5) {
  const rows = getTopFRPIncidents(limit);
  const list = rows.map((r,i)=>`${i+1}. <strong>${escapeAI(r.title)}</strong> — FRP ${Number(r.frp).toFixed(2)} MW • Risk ${getRiskScore(r)}/100`).join('<br>');
  const top = rows[0];
  return `⚡ <strong>Top ${rows.length} incidents by FRP</strong><br>${list}<div class="ai-action-row"><button onclick="focusOnMap(${top.longitude}, ${top.latitude})">Show #1 on Map</button></div>`;
}

function aiShowHighRisk(limit=5) {
  const rows = getTopRiskIncidents(limit);
  const list = rows.map((x,i)=>`${i+1}. <strong>${escapeAI(x.row.title)}</strong> — Risk ${x.score}/100 (${getRiskLevel(x.score)}) • FRP ${Number(x.row.frp).toFixed(2)} MW`).join('<br>');
  const top = rows[0];
  return `🚨 <strong>Top ${rows.length} high-risk incidents</strong><br>${list}<div class="ai-action-row"><button onclick="focusOnMap(${top.row.longitude}, ${top.row.latitude})">Show highest risk on Map</button><button onclick="showHighRiskAlerts()">Open filtered Alerts</button></div>`;
}

function showHighRiskAlerts() {
  switchView('alerts', document.querySelectorAll('.nav-item')[2]);
  const body = document.getElementById('alertsTableBody');
  if (!body) return;
  const rows = getTopRiskIncidents(10);
  body.querySelectorAll('tr').forEach(tr => tr.style.display='none');
  // Rebuild the table with the selected high-risk records so the filter is meaningful.
  body.innerHTML = rows.map(({row,score}) => `<tr><td>${escapeAI(row.title)}</td><td>Lat: ${Number(row.latitude).toFixed(5)}, Lon: ${Number(row.longitude).toFixed(5)}</td><td>${row.frp} MW</td><td>${row.temp_celsius} °C</td><td>${escapeAI(row.confidence)}</td><td><span class="risk-badge ${getRiskClass(getRiskLevel(score))}">${getRiskLevel(score)} ${score}</span></td><td><button class="btn-action" onclick="focusOnMap(${row.longitude}, ${row.latitude})">View on Map</button></td></tr>`).join('');
}

function aiLocationList(query) {
  let rows = csvDataset;
  const nearDelhi = /delhi|new delhi/.test(query);
  if (nearDelhi) {
    rows = [...csvDataset].sort((a,b)=>{
      const da=Math.hypot(a.latitude-28.6139,a.longitude-77.2090);
      const db=Math.hypot(b.latitude-28.6139,b.longitude-77.2090);
      return da-db;
    }).slice(0,5);
  } else {
    rows = csvDataset.slice(0,5);
  }
  const list = rows.map((r,i)=>`${i+1}. ${escapeAI(r.title)} — ${Number(r.latitude).toFixed(4)}, ${Number(r.longitude).toFixed(4)} • FRP ${Number(r.frp).toFixed(2)} MW`).join('<br>');
  const top=rows[0];
  return `📍 <strong>Incident locations</strong><br>${list}<div class="ai-action-row">${top?`<button onclick="focusOnMap(${top.longitude}, ${top.latitude})">Show first on Map</button>`:''}</div>`;
}

function aiExplainIncident(query) {
  const ranked = getTopRiskIncidents(1)[0];
  if (!ranked) return 'No incident data is available.';
  const r=ranked.row, score=ranked.score;
  const frp=Number(r.frp)||0, temp=Number(r.temp_celsius)||0;
  const conf=String(r.confidence||'').toLowerCase();
  const reasons=[];
  if(frp>=25) reasons.push(`high FRP (${frp.toFixed(2)} MW)`); else if(frp>=15) reasons.push(`moderate FRP (${frp.toFixed(2)} MW)`); else reasons.push(`lower FRP (${frp.toFixed(2)} MW)`);
  if(temp>=320) reasons.push(`high thermal reading (${temp.toFixed(1)}°C)`); else reasons.push(`thermal reading of ${temp.toFixed(1)}°C`);
  if(conf.includes('high')) reasons.push('high detection confidence'); else if(conf.includes('nominal')) reasons.push('nominal detection confidence'); else reasons.push(`${conf || 'unknown'} detection confidence`);
  return `🧠 <strong>Why this incident is ${getRiskLevel(score).toLowerCase()}</strong><br>${escapeAI(r.title)} has a risk score of <strong>${score}/100</strong> based on ${reasons.join(', ')}. This is a prototype rule-based explanation, not a trained ML diagnosis.<div class="ai-action-row"><button onclick="focusOnMap(${r.longitude}, ${r.latitude})">View on Map</button><button onclick="refreshWeather(${r.latitude}, ${r.longitude}, 'Incident Location')">Check Weather</button></div>`;
}

function aiGenerateIncidentReport() {
  printIncidentReport();
  return `📄 <strong>Incident report prepared.</strong><br>The browser print dialog has been opened. Choose <strong>Save as PDF</strong> to export the PyroVision report.`;
}

function aiSmartFilter(query) {
  const thresholdMatch = query.match(/frp\s*(?:above|over|greater than)\s*(\d+(?:\.\d+)?)/i);
  if (thresholdMatch) {
    const threshold=Number(thresholdMatch[1]);
    const rows=csvDataset.filter(r=>(Number(r.frp)||0)>threshold).sort((a,b)=>(Number(b.frp)||0)-(Number(a.frp)||0));
    switchView('alerts', document.querySelectorAll('.nav-item')[2]);
    const body=document.getElementById('alertsTableBody');
    if(body) body.innerHTML=rows.map(r=>`<tr><td>${escapeAI(r.title)}</td><td>Lat: ${Number(r.latitude).toFixed(5)}, Lon: ${Number(r.longitude).toFixed(5)}</td><td>${r.frp} MW</td><td>${r.temp_celsius} °C</td><td>${escapeAI(r.confidence)}</td><td><span class="risk-badge ${getRiskClass(getRiskLevel(getRiskScore(r)))}">${getRiskLevel(getRiskScore(r))} ${getRiskScore(r)}</span></td><td><button class="btn-action" onclick="focusOnMap(${r.longitude}, ${r.latitude})">View on Map</button></td></tr>`).join('');
    return `🔎 Found <strong>${rows.length}</strong> incidents with FRP above ${threshold} MW. The Alerts table is now filtered.`;
  }
  return null;
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  if (!input || !messages) return;
  const text = input.value.trim();
  if (!text) return;
  addAIMessage(text, false);
  input.value = '';
  const query = text.toLowerCase();
  setTimeout(() => {
    let reply;
    const filtered = aiSmartFilter(query);
    if (filtered) reply = filtered;
    else if (/^(hello|hi|hey)\b/.test(query)) reply = 'Hello! I can analyze your fire dataset, explain risk, filter incidents, control the map, check weather, and prepare reports.';
    else if ((query.includes('show') || query.includes('find')) && (query.includes('high-risk') || query.includes('high risk') || query.includes('danger'))) reply = aiShowHighRisk(5);
    else if (query.includes('top') && (query.includes('frp') || query.includes('radiative power'))) reply = aiShowTopFRP(5);
    else if (query.includes('analy') || query.includes('summary') || query.includes('overview') || query.includes('today')) reply = aiAnalyzeData();
    else if (query.includes('why') && (query.includes('risk') || query.includes('danger') || query.includes('high'))) reply = aiExplainIncident(query);
    else if (query.includes('report') || query.includes('pdf')) reply = aiGenerateIncidentReport();
    else if (query.includes('weather') && (query.includes('highest') || query.includes('risk') || query.includes('fire') || query.includes('incident'))) {
      const top=getTopRiskIncidents(1)[0];
      reply=`🌦️ Checking weather at the highest-risk incident...<div class="ai-action-row"><button onclick="refreshWeather(${top.row.latitude}, ${top.row.longitude}, 'Highest-Risk Incident')">Load Weather</button></div>`;
      refreshWeather(top.row.latitude, top.row.longitude, 'Highest-Risk Incident');
    }
    else if (query.includes('weather') || query.includes('temperature') || query.includes('wind')) reply='🌤️ The weather card uses the currently selected map/incident location. You can also ask “weather at highest-risk fire”.';
    else if (query.includes('where') || query.includes('location') || query.includes('coords')) reply=aiLocationList(query);
    else if (query.includes('wildfire') || query.includes('industrial') || query.includes('agricultural')) {
      const type=query.includes('wildfire')?'wildfire':query.includes('industrial')?'industrial':'agricultural';
      const rows=csvDataset.filter(d=>d.type===type);
      reply=`📊 <strong>${rows.length}</strong> ${type} incidents found.<div class="ai-action-row"><button onclick="switchView('alerts', document.querySelectorAll('.nav-item')[2])">Open Alerts</button></div>`;
    }
    else if (query.includes('how many') || query.includes('total incident') || query.includes('total fire')) reply=aiAnalyzeData();
    else if (query.includes('map') || query.includes('zoom') || query.includes('show on map')) {
      const top=getTopRiskIncidents(1)[0];
      reply=`🗺️ I can control the map. The highest-risk incident is ready to display.<div class="ai-action-row"><button onclick="focusOnMap(${top.row.longitude}, ${top.row.latitude})">Zoom to Highest Risk</button></div>`;
    }
    else reply='Try: “show high-risk fires on map”, “top 5 fires by FRP”, “analyze today”, “FRP above 20”, “why is this fire high risk?”, “weather at highest-risk fire”, or “generate incident report”.';
    addAIMessage(reply, true);
  }, 300);
}

function handleKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function initEnhancedFeatures() {
  updateRiskSummary(csvDataset);
  renderRiskRanking(csvDataset);
  refreshWeather();
  if (window.lucide) lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initEnhancedFeatures, 800);
});
