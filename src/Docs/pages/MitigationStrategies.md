# MitigationStrategies Page Documentation

**File**: `pages/MitigationStrategies/MitigationStrategies.jsx`

## Purpose

The MitigationStrategies page provides a dedicated environment for testing planetary defense strategies against Near-Earth Objects. Users can select asteroids and experiment with different deflection methods without going through the full simulation wizard.

## Component Structure

\`\`\`jsx
function MitigationStrategies()
\`\`\`

### Line-by-Line Explanation

#### Imports (Lines 1-7)
\`\`\`jsx
import React, { useState, useEffect } from 'react';
import NEOSelector from '../../components/NEOSelector/NEOSelector';
import MitigationPanel from '../../components/MitigationPanel/MitigationPanel';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import NEODataService from '../../Simulation/NEODataService';
import './MitigationStrategies.css';
\`\`\`
- **Line 1**: React and hooks for state and lifecycle management
- **Line 2**: NEOSelector component for choosing asteroids
- **Line 3**: MitigationPanel component for testing deflection strategies
- **Line 4**: LoadingSpinner for async operations
- **Line 5**: Service to fetch NEO data from NASA API
- **Line 6**: Component-specific styles

#### Component Declaration & State (Lines 9-13)
\`\`\`jsx
const MitigationStrategies = () => {
  const [neos, setNeos] = useState([]);
  const [selectedNEO, setSelectedNEO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
\`\`\`
- **Line 10**: `neos` - Array of NEO objects from NASA API
- **Line 11**: `selectedNEO` - Currently selected asteroid for mitigation testing
- **Line 12**: `loading` - Boolean flag for data loading state
- **Line 13**: `error` - Stores error messages from API failures

#### Data Fetching Effect (Lines 15-31)
\`\`\`jsx
  useEffect(() => {
    const loadNEOs = async () => {
      try {
        setLoading(true);
        const data = await NEODataService.fetchNEOs();
        setNeos(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load NEOs:', err);
        setError('Failed to load asteroid data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadNEOs();
  }, []);
\`\`\`
- **Line 15**: useEffect with empty dependency array (runs once on mount)
- **Line 16**: Async function to handle data fetching
- **Line 18**: Set loading state to true before API call
- **Line 19**: Fetch NEO data from NASA API via NEODataService
  - NEODataService handles caching and fallback logic internally
- **Line 20**: Store fetched data in state
- **Line 21**: Clear any previous errors on success
- **Lines 22-25**: Error handling
  - Log error to console for debugging
  - Set user-friendly error message
- **Lines 26-28**: Finally block
  - Always executes after try/catch
  - Sets loading to false regardless of outcome
- **Line 31**: Immediately invoke loadNEOs function

#### NEO Selection Handler (Lines 33-35)
\`\`\`jsx
  const handleNEOSelect = (neo) => {
    setSelectedNEO(neo);
  };
\`\`\`
- Callback function passed to NEOSelector
- Updates `selectedNEO` state when user selects an asteroid
- Triggers re-render to show MitigationPanel

#### Loading State Render (Lines 37-43)
\`\`\`jsx
  if (loading) {
    return (
      <div className="mitigation-strategies">
        <LoadingSpinner message="Loading asteroid data..." />
      </div>
    );
  }
\`\`\`
- Conditional render during data fetch
- Shows loading spinner with descriptive message
- Prevents rendering main content before data is ready

#### Main Render Structure (Lines 45-52)
\`\`\`jsx
  return (
    <div className="mitigation-strategies">
      <div className="page-header">
        <h1>Planetary Defense Laboratory</h1>
        <p className="page-subtitle">
          Test deflection strategies against Near-Earth Objects
        </p>
      </div>
\`\`\`
- Root container with class for styling
- Header section with title and subtitle
- Describes page purpose to user

#### Error Display (Lines 54-58)
\`\`\`jsx
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
\`\`\`
- Conditional render if error exists
- Displays error message in styled banner
- Non-blocking (cached data may still be available)

#### Content Layout (Lines 60-62)
\`\`\`jsx
      <div className="mitigation-content">
        <div className="selector-section">
          <h2>Select Target Asteroid</h2>
\`\`\`
- Two-column layout container
- Left section for NEO selection
- Section header for clarity

#### NEO Selector (Lines 63-66)
\`\`\`jsx
          <NEOSelector
            neos={neos}
            onSelect={handleNEOSelect}
          />
\`\`\`
- Renders NEOSelector component
- **Props**:
  - `neos`: Array of available asteroids
  - `onSelect`: Callback function when asteroid is selected

#### Mitigation Panel Section (Lines 69-71)
\`\`\`jsx
        <div className="mitigation-section">
          <h2>Deflection Strategies</h2>
          {selectedNEO ? (
\`\`\`
- Right section for mitigation controls
- Section header
- Conditional render based on selection

#### Selected NEO Display (Lines 72-82)
\`\`\`jsx
            <>
              <div className="selected-neo-info">
                <h3>{selectedNEO.name}</h3>
                <p>Diameter: {selectedNEO.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km</p>
                <p>Velocity: {selectedNEO.close_approach_data[0]?.relative_velocity.kilometers_per_hour} km/h</p>
                <p>Miss Distance: {selectedNEO.close_approach_data[0]?.miss_distance.kilometers} km</p>
              </div>
              <MitigationPanel
                neo={selectedNEO}
                impactData={null}
              />
\`\`\`
- **Lines 73-78**: Info card showing selected NEO details
  - Name of asteroid
  - Maximum estimated diameter in kilometers (2 decimal places)
  - Relative velocity from first close approach
  - Miss distance from Earth
- **Lines 79-82**: MitigationPanel component
  - Receives selected NEO data
  - `impactData` is null (not needed for this page)

#### No Selection Placeholder (Lines 84-88)
\`\`\`jsx
          ) : (
            <div className="no-selection">
              <p>Select an asteroid to test mitigation strategies</p>
            </div>
          )}
\`\`\`
- Displays when no NEO is selected
- Prompts user to make a selection
- Provides clear instruction

#### Component Export (Line 96)
\`\`\`jsx
export default MitigationStrategies;
\`\`\`

## Component Hierarchy

\`\`\`
MitigationStrategies
├── LoadingSpinner (conditional)
├── page-header
│   ├── h1
│   └── p (subtitle)
├── error-banner (conditional)
└── mitigation-content
    ├── selector-section
    │   ├── h2
    │   └── NEOSelector
    └── mitigation-section
        ├── h2
        └── (conditional)
            ├── selected-neo-info
            │   ├── h3 (name)
            │   └── p (details)
            └── MitigationPanel
            OR
            └── no-selection placeholder
\`\`\`

## State Management

### Initial State
\`\`\`javascript
{
  neos: [],
  selectedNEO: null,
  loading: true,
  error: null
}
\`\`\`

### After Successful Load
\`\`\`javascript
{
  neos: [Array of NEO objects],
  selectedNEO: null,
  loading: false,
  error: null
}
\`\`\`

### After NEO Selection
\`\`\`javascript
{
  neos: [Array of NEO objects],
  selectedNEO: {NEO object with all properties},
  loading: false,
  error: null
}
\`\`\`

### After Error
\`\`\`javascript
{
  neos: [Possibly cached data],
  selectedNEO: null,
  loading: false,
  error: "Error message string"
}
\`\`\`

## Styling (MitigationStrategies.css)

### Page Container
\`\`\`css
.mitigation-strategies {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}
\`\`\`
- Full viewport height
- Consistent padding
- Dark space-themed gradient

### Content Layout
\`\`\`css
.mitigation-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
\`\`\`
- Two-column grid layout
- Equal width columns
- 2rem gap between columns
- Centered with max width
- Responsive: collapses to single column on mobile

### Selected NEO Info Card
\`\`\`css
.selected-neo-info {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.selected-neo-info h3 {
  color: #00ffff;
  margin-bottom: 1rem;
}

.selected-neo-info p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}
\`\`\`
- Cyan-tinted background
- Glowing border effect
- Rounded corners
- Cyan heading color
- Semi-transparent white text

### No Selection Placeholder
\`\`\`css
.no-selection {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}
\`\`\`
- Centered text
- Generous padding
- Dimmed color
- Italic style for emphasis

## Data Flow

\`\`\`
Component Mount
    ↓
useEffect triggers
    ↓
loadNEOs() called
    ↓
NEODataService.fetchNEOs()
    ↓
[Success]              [Failure]
    ↓                      ↓
setNeos(data)         setError(message)
    ↓                      ↓
Render NEOSelector    Show error banner
    ↓
User selects NEO
    ↓
handleNEOSelect(neo)
    ↓
setSelectedNEO(neo)
    ↓
Render selected info + MitigationPanel
\`\`\`

## User Interactions

1. **Page Load**: User sees loading spinner while data fetches
2. **After Load**: Left panel shows list of asteroids, right panel shows instruction
3. **Select Asteroid**: User clicks on asteroid in left panel
4. **View Details**: Right panel updates to show asteroid info and mitigation controls
5. **Test Strategies**: User adjusts sliders and sees deflection calculations
6. **Select Different Asteroid**: User can switch asteroids without page reload

## Error Handling

- **API Failure**: Error banner displays, cached data used if available
- **No Data**: Loading spinner continues until data is available
- **Invalid Selection**: Component checks for `selectedNEO` before rendering details
- **Missing Properties**: Optional chaining (`?.`) prevents crashes on missing data

## Responsive Behavior

- **Desktop (>768px)**: Two-column layout
- **Tablet/Mobile (<768px)**: Single column, selector above mitigation panel
- **Text**: Scales appropriately for readability
- **Cards**: Full width on mobile

## Accessibility Features

- Semantic HTML headings (h1, h2, h3)
- Descriptive labels and instructions
- High contrast text on dark background
- Clear visual hierarchy
- Keyboard navigation through child components
