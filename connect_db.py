""" 
PyroVision (SIH PS 162) - Local Database Connector & API Bridge
Serves frontend and API endpoints on http://localhost:5000 (CSV-Driven Architecture)
""" 
import json
import os
from http.server import SimpleHTTPRequestHandler, HTTPServer 
import pandas as pd

PORT = 5000
CSV_FILE = "sample_fires_dataset.csv"

def get_hotspot_data(): 
    # Strictly CSV-driven dataset loading as requested
    if os.path.exists(CSV_FILE):
        try:
            df = pd.read_csv(CSV_FILE)
            results = []
            for idx, row in df.iterrows():
                frp_val = float(row.get('frp', 5.0))
                
                # Use explicit demo classification when present; otherwise retain FRP fallback.
                csv_type = str(row.get('fire_type', '')).strip().lower()
                csv_title = str(row.get('title', '')).strip()
                if csv_type in ['agricultural', 'industrial', 'wildfire']:
                    fire_type = csv_type
                    title = csv_title or ('Wildfire Hotspot' if fire_type == 'wildfire' else fire_type.title() + ' Fire')
                elif frp_val < 15.0:
                    fire_type = 'agricultural'
                    title = 'Agricultural Fire'
                elif frp_val <= 40.0:
                    fire_type = 'industrial'
                    title = 'Industrial Fire'
                else:
                    fire_type = 'wildfire'
                    title = 'Wildfire Hotspot'
                
                lat = float(row['latitude'])
                lon = float(row['longitude'])
                
                results.append({
                    "id": int(idx + 1),
                    "type": fire_type,
                    "title": title,
                    "location": f"Lat: {lat:.4f}, Lon: {lon:.4f}",
                    "lat": lat,
                    "lon": lon,
                    "latitude": lat,
                    "longitude": lon,
                    "time": f"{row.get('acq_date', '2026-09-13')} ({row.get('acq_time', '0000')})",
                    "confidence": str(row.get('confidence', 'Nominal')).capitalize(),
                    "temp_celsius": float(row.get('temp_celsius', 25.0)),
                    "frp": frp_val
                })
            return results
        except Exception as e:
            print(f"[Error reading CSV]: {e}")
    return []

class PyroVisionHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/login':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                username = data.get('username', '').strip()
                password = data.get('password', '').strip()
                
                if username in ['admin', 'demo'] and password in ['admin123', 'demo123']:
                    response = {"status": "success", "user": username}
                else:
                    response = {"status": "error", "message": "Invalid demo credentials. Use admin/admin123 or demo/demo123"}
            except Exception:
                response = {"status": "error", "message": "Invalid request format"}
            
            payload = json.dumps(response).encode('utf-8')
            self.send_response(200 if response['status'] == 'success' else 401)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path in ['/api/fires', '/api/incidents']:
            data = get_hotspot_data()
            payload = json.dumps({"status": "success", "total": len(data), "data": data}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            if self.path == '/':
                self.path = '/index.html'
            return super().do_GET()

if __name__ == '__main__':
    print("============================================================")
    print("  PyroVision Bridge Server (SIH PS 162) - CSV Powered")
    print(f"  Running at: http://localhost:{PORT}")
    print("  API Endpoints: /api/fires & /api/incidents")
    print("============================================================")
    server = HTTPServer(('127.0.0.1', PORT), PyroVisionHandler)
    server.serve_forever()
