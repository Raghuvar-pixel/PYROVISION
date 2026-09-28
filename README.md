# PyroVision — Enhanced YouTube Prototype

This package starts from the ORIGINAL PyroVision prototype files and keeps the original UI/features.
Additional prototype capabilities have been added on top.

## Original features retained
- Login / demo credentials
- Dashboard
- OpenLayers map
- Map / Satellite layers
- My Location
- Location search
- Fire incident list
- Fire classification
- Alerts table
- Analytics charts
- Reports section
- Settings
- AI Assistant / CSV data queries
- Local Python CSV/API bridge

## Added features
- Risk Score (0–100)
- Risk levels: Low / Moderate / High / Critical
- Risk ranking panel
- Risk information in Alerts
- Dynamic risk summary in Analytics
- Heatmap overlay using OpenLayers
- Weather context using Open-Meteo (internet required for live weather)
- Real-time alert simulation for YouTube demonstration
- Emergency response protocol cards
- Functional CSV risk report download
- Print / Save-as-PDF report
- Improved AI Assistant queries
- Fixed the original chatbot template-string display bug
- Removed duplicate chatbot implementation
- Prototype labeling so the demo does not falsely claim production/live AI

## Demo login
admin / admin123
or
demo / demo123

## Run
Option 1:
Open index.html.

Option 2 (recommended):
python connect_db.py
Then open http://localhost:5000/

## Important prototype note
The fire dataset remains the project's existing sample CSV. The weather layer uses Open-Meteo when internet is available.
This is a prototype; NASA FIRMS live ingestion, trained computer-vision detection, production authentication, emergency dispatch, and SMS/email gateways are not implemented as production services in this package.

AI Assistant upgrade:
- Natural-language dataset analysis
- High-risk incident ranking and map focus
- Top FRP analysis
- Smart FRP filters in Alerts
- Risk explanation with FRP, temperature and confidence factors
- Location-aware weather actions
- Analytics page navigation from the assistant
- Incident report / PDF print action
- Map control commands
- Quick action chips in the assistant

Note: AI responses are implemented as a local intelligent command/query layer over the supplied dataset. This is not a cloud LLM or trained computer-vision model.


DATA UPDATE (India-only demo)
- Removed 110 clearly non-India hotspot records from the mixed dataset.
- Added 110 synthetic/demo Indian wildfire records across multiple Indian forest regions.
- Demo wildfire records are labelled 'Demo Indian Wildfire' and dated 2026-09-27.
- These added wildfire points are synthetic demo data, not claimed as live satellite detections.
- Indian source context: FSI/NRSC forest-fire monitoring uses MODIS and VIIRS hotspot data; see official FSI/NRSC sources.


DATASET UPDATE — 100 MIXED INDIA FIRE LOCATIONS
- Total dataset records: 100
- Wildfire: 50
- Industrial Fire: 5
- Agricultural Fire: 45
- The 100 records are selected from the supplied project dataset.
- Wildfire marker/legend color is now purple (#a855f7), clearly separated from industrial orange (#ff5722).

Map visibility fix: initial map now automatically fits all incident coordinates, with larger high-contrast markers and a Fit All control when available.
