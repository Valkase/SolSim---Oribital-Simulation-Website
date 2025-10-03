# NEO Tracking & Impact Simulation System - Documentation

## Overview

This application is a Near-Earth Object (NEO) tracking and impact simulation system that integrates with NASA's API to fetch real asteroid data, calculate orbital trajectories, simulate potential impacts, and test mitigation strategies.

## Architecture

### Technology Stack

- **Frontend Framework**: React 19 with Next.js 15
- **Routing**: React Router DOM 7
- **3D Visualization**: Three.js
- **Styling**: CSS Modules + Tailwind CSS
- **API**: NASA NeoWs (Near Earth Object Web Service)

### Project Structure

\`\`\`
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Entry point
├── components/                   # Reusable UI components
│   ├── Navigation/              # App navigation bar
│   ├── LoadingSpinner/          # Loading state indicator
│   ├── NEOSelector/             # Asteroid browser/selector
│   ├── OrbitVisualization/      # 3D orbit display (Three.js)
│   ├── ImpactSimulator/         # Impact parameter controls
│   ├── ImpactResults/           # Impact calculation display
│   └── MitigationPanel/         # Deflection strategy controls
├── pages/                        # Route pages
│   ├── HomePage/                # Landing page
│   ├── SimulationWizard/        # Core simulation wizard
│   ├── MitigationStrategies/    # Mitigation testing page
│   └── GameMode/                # Future gamification (placeholder)
├── Simulation/                   # Core calculation modules
│   ├── NEODataService.js        # NASA API integration
│   ├── OrbitCalculator.js       # Orbital mechanics
│   ├── ImpactCalculator.js      # Impact physics
│   ├── constants.js             # Physical constants
│   └── types.js                 # Type definitions
├── App.jsx                       # Main app component
└── main.jsx                      # React entry point
\`\`\`

## Data Flow

### 1. Application Initialization
\`\`\`
main.jsx → App.jsx → Router Setup → HomePage
\`\`\`

### 2. NEO Data Fetching
\`\`\`
NEODataService.fetchNEOs() 
  → NASA API Request
  → Cache in localStorage
  → Return NEO array
\`\`\`

### 3. Simulation Wizard Flow
\`\`\`
Step 1: NEOSelector (Select Asteroid)
  ↓
Step 2: OrbitVisualization (View Trajectory)
  ↓
Step 3: ImpactSimulator (Configure Impact)
  ↓
Step 4: ImpactResults (View Calculations)
  ↓
Step 5: MitigationPanel (Test Deflection)
\`\`\`

### 4. Calculation Pipeline
\`\`\`
Selected NEO
  ↓
OrbitCalculator.calculateOrbit()
  → Heliocentric orbit path
  → Geocentric orbit path
  → Close approach data
  ↓
ImpactCalculator.calculateImpact()
  → Impact energy
  → Crater formation
  → Seismic effects
  → Tsunami modeling
  → Damage zones
  ↓
Display in ImpactResults component
\`\`\`

## Key Features

### 1. Real-Time NASA Data Integration
- Fetches current NEO data from NASA API
- Caches data locally for offline use
- Automatic fallback on API failure

### 2. 3D Orbit Visualization
- Interactive Three.js scene
- Heliocentric (Sun-centered) orbits
- Geocentric (Earth-centered) close approaches
- Real-time camera controls

### 3. Impact Physics Simulation
- Energy calculations (TNT equivalent)
- Crater modeling (simple vs complex)
- Seismic magnitude estimation
- Tsunami wave height prediction
- Damage zone mapping

### 4. Mitigation Strategy Testing
- Kinetic impactor simulation
- Nuclear deflection modeling
- Gravity tractor calculations
- Success probability estimation

## Environment Variables

\`\`\`env
NEXT_PUBLIC_NASA_API_KEY=your_api_key_here
\`\`\`

Get your free API key at: https://api.nasa.gov/

## State Management

The application uses React's built-in state management:

- **Local Component State**: `useState` for UI interactions
- **Data Caching**: `localStorage` for API response caching
- **Prop Drilling**: Parent-to-child data passing through wizard steps

## Error Handling

1. **API Failures**: Automatic fallback to cached data
2. **Calculation Errors**: Try-catch blocks with user-friendly messages
3. **3D Rendering**: WebGL compatibility checks
4. **Missing Data**: Graceful degradation with default values

## Performance Optimizations

1. **Data Caching**: Reduces API calls
2. **Lazy Loading**: Components load on demand
3. **Memoization**: Prevents unnecessary re-renders
4. **Three.js Optimization**: Efficient geometry and material reuse

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL Support**: Required for 3D visualization
- **LocalStorage**: Required for data caching

## Future Enhancements

- Gamification mode implementation
- Multi-asteroid threat scenarios
- Real-time tracking updates
- Social sharing features
- Advanced deflection simulations
