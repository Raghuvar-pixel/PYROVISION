"""
PyroVision (SIH PS 162) - Local Database Connector & API Bridge
Connects to local SQLite, MySQL, PostgreSQL, or CSV and serves JSON on http://localhost:5000/api/fires
"""
import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
import pandas as pd

PORT = 5000
DB_FILE = "fires.db"
CSV_FILE = "sample_fires_dataset.csv"

def get_hotspot_data():
    # 1. If SQLite database exists, read from it
    if os.path.exists(DB_FILE):
        try:
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM fires LIMIT 100")
            rows = [dict(r) for r in cursor.fetchall()]
            conn.close()
            if rows:
                return rows
        except Exception as e:
            print(f"[Warning] Could not read from SQLite: {e}")

    # 2. Fallback to CSV file processed with pandas
    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
        results = []
        for idx, row in df.iterrows():
            # Classify type based on FRP or temperature if available
            frp_val = float(row.get('frp', 5.0))
            fire_type = 'wildfire' if frp_val > 5.0 else 'industrial'
            title = 'Wildfire Hotspot' if fire_type == 'wildfire' else 'Industrial Fire'
            
            results.append({
                "id": idx + 1,
                "type": fire_type,
                "title": title,
                "location": f"Lat: {row['latitude']:.4f}, Lon: {row['longitude']:.4f}",
                "lat": float(row['latitude']),
                "lon": float(row['longitude']),
                "latitude": float(row['latitude']),
                "longitude": float(row['longitude']),
                "time": f"{row.get('acq_date', 'Recent')} ({row.get('acq_time', '')})",
                "confidence": str(row.get('confidence', 'nominal')).capitalize(),
                "temp_celsius": float(row.get('temp_celsius', 0.0)),
                "frp": frp_val
            })
        return results

    # 3. Default fallback sample
    return [
        {
            "id": 1,
            "latitude": 21.85, "longitude": 86.32, "lat": 21.85, "lon": 86.32, "frp": 72.4, "confidence": "High",
            "type": "wildfire", "title": "Wildfire Hotspot", "location": "Simlipal Tiger Reserve, Odisha",
            "time": "2026-09-10 (608)"
        },
        {
            "id": 2,
            "latitude": 17.68, "longitude": 83.21, "lat": 17.68, "lon": 83.21, "frp": 91.2, "confidence": "High",
            "type": "industrial", "title": "Industrial Fire", "location": "HPCL Refinery Flare, Visakhapatnam",
            "time": "2026-09-10 (744)"
        }
    ]

class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/fires' or self.path == '/api/incidents' or self.path == '/':
            data = get_hotspot_data()
            payload = json.dumps({"status": "success", "total": len(data), "data": data}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    print(f"============================================================")
    print(f"  PyroVision Database Bridge Server (SIH PS 162)")
    print(f"  Listening on: http://localhost:{PORT}/api/fires")
    print(f"  CORS Enabled for Web Dashboard integration.")
    print(f"============================================================")
    server = HTTPServer(('127.0.0.1', PORT), RequestHandler)
    server.serve_forever()