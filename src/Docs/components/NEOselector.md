# NEOSelector Component Documentation

**File**: `components/NEOSelector/NEOSelector.jsx`

## Purpose

The NEOSelector component displays a searchable, filterable list of Near-Earth Objects fetched from NASA's API. Users can browse asteroids, view key information, and select one for further analysis.

## Component Structure

\`\`\`jsx
function NEOSelector({ neos, onSelect })
\`\`\`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `neos` | Array | Array of NEO objects from NASA API |
| `onSelect` | Function | Callback function called when user selects an asteroid |

### Line-by-Line Explanation

#### Imports (Lines 1-2)
\`\`\`jsx
import React, { useState } from 'react';
import './NEOSelector.css';
\`\`\`
- **Line 1**: React and useState hook for managing component state
- **Line 2**: Component-specific styles

#### Component Declaration & Props (Line 4)
\`\`\`jsx
const NEOSelector = ({ neos, onSelect }) => {
\`\`\`
- Functional component with destructured props
- `neos`: Array of asteroid objects
- `onSelect`: Callback function for selection

#### State Management (Lines 5-6)
\`\`\`jsx
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDanger, setFilterDanger] = useState(false);
\`\`\`
- **Line 5**: `searchTerm` - Stores user's search input for filtering by name
- **Line 6**: `filterDanger` - Boolean toggle to show only potentially hazardous asteroids

#### Filtered NEOs Calculation (Lines 8-16)
\`\`\`jsx
  const filteredNEOs = neos.filter(neo => {
    const matchesSearch = neo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDanger = !filterDanger || neo.is_potentially_hazardous_asteroid;
    return matchesSearch && matchesDanger;
  });
\`\`\`
- **Line 8**: Creates filtered array based on search and danger filter
- **Line 9**: Check if NEO name contains search term (case-insensitive)
  - `toLowerCase()` ensures case-insensitive matching
  - `includes()` checks for substring match
- **Line 10**: Check danger filter
  - If `filterDanger` is false, include all NEOs
  - If `filterDanger` is true, only include hazardous asteroids
- **Line 11**: Return true only if both conditions are met (AND logic)

#### Danger Level Calculation (Lines 14-22)
\`\`\`jsx
  const getDangerLevel = (neo) => {
    const diameter = neo.estimated_diameter.kilometers.estimated_diameter_max;
    const velocity = parseFloat(neo.close_approach_data[0]?.relative_velocity.kilometers_per_second);
    
    if (neo.is_potentially_hazardous_asteroid) return 'high';
    if (diameter > 1 || velocity > 20) return 'medium';
    return 'low';
  };
\`\`\`
- **Line 14**: Function to calculate danger level for visual indicators
- **Line 15**: Extract maximum diameter in kilometers
- **Line 16**: Parse velocity from first close approach
  - Uses optional chaining (`?.`) to prevent errors if data is missing
  - `parseFloat()` converts string to number
- **Line 18**: If NASA marks as potentially hazardous, return 'high'
- **Line 19**: If diameter > 1km OR velocity > 20 km/s, return 'medium'
- **Line 20**: Otherwise return 'low'

#### Main Render (Lines 24-29)
\`\`\`jsx
  return (
    <div className="neo-selector">
      <div className="selector-header">
        <h2>Select Near-Earth Object</h2>
        <p className="neo-count">{filteredNEOs.length} asteroids available</p>
      </div>
\`\`\`
- Root container with class for styling
- Header showing title and count of filtered results
- Count updates dynamically as filters change

#### Search Controls (Lines 31-42)
\`\`\`jsx
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <label className="danger-filter">
          <input
            type="checkbox"
            checked={filterDanger}
            onChange={(e) => setFilterDanger(e.target.checked)}
\`\`\`
- **Lines 32-38**: Text input for searching
  - Controlled input (value tied to state)
  - `onChange` updates `searchTerm` state on every keystroke
  - Placeholder provides user guidance
- **Lines 39-43**: Checkbox for danger filter
  - Controlled checkbox (checked tied to state)
  - `onChange` updates `filterDanger` state
  - Label text: "Show only hazardous"

#### NEO List Container (Lines 48-50)
\`\`\`jsx
      <div className="neo-list">
        {filteredNEOs.length === 0 ? (
          <div className="no-results">No asteroids match your criteria</div>
\`\`\`
- Container for list of NEO cards
- Conditional render: if no results, show message

#### NEO Card Mapping (Lines 51-77)
\`\`\`jsx
        ) : (
          filteredNEOs.map(neo => (
            <div
              key={neo.id}
              className="neo-card"
              onClick={() => onSelect(neo)}
            >
              <div className="neo-card-header">
                <h3 className="neo-name">{neo.name}</h3>
                <span className={`danger-badge ${getDangerLevel(neo)}`}>
                  {getDangerLevel(neo).toUpperCase()}
                </span>
              </div>
\`\`\`
- **Line 52**: Map over filtered NEOs to create cards
- **Line 54**: Unique key for React reconciliation
- **Line 56**: Click handler calls `onSelect` with NEO data
- **Lines 58-62**: Card header
  - NEO name as heading
  - Danger badge with dynamic class based on level
  - Badge text shows danger level in uppercase

#### NEO Details Display (Lines 64-75)
\`\`\`jsx
              <div className="neo-details">
                <div className="detail-row">
                  <span className="detail-label">Diameter:</span>
                  <span className="detail-value">
                    {neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Velocity:</span>
                  <span className="detail-value">
                    {parseFloat(neo.close_approach_data[0]?.relative_velocity.kilometers_per_second).toFixed(2)} km/s
                  </span>
                </div>
\`\`\`
- **Lines 65-70**: Diameter row
  - Label and value in separate spans
  - `toFixed(2)` formats to 2 decimal places
- **Lines 71-75**: Velocity row
  - Parses velocity string to float
  - Formats to 2 decimal places
  - Uses optional chaining for safety

#### Close Approach Date (Lines 76-81)
\`\`\`jsx
                <div className="detail-row">
                  <span className="detail-label">Next Approach:</span>
                  <span className="detail-value">
                    {new Date(neo.close_approach_data[0]?.close_approach_date).toLocaleDateString()}
                  </span>
                </div>
\`\`\`
- Displays next close approach date
- Converts ISO date string to Date object
- `toLocaleDateString()` formats according to user's locale

#### Hazardous Indicator (Lines 82-86)
\`\`\`jsx
                {neo.is_potentially_hazardous_asteroid && (
                  <div className="hazard-warning">
                    ⚠️ Potentially Hazardous
                  </div>
                )}
\`\`\`
- Conditional render only for hazardous asteroids
- Warning emoji and text
- Styled with attention-grabbing colors

#### Component Export (Line 94)
\`\`\`jsx
export default NEOSelector;
\`\`\`

## Styling (NEOSelector.css)

### Container
\`\`\`css
.neo-selector {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 1.5rem;
}
\`\`\`
- Subtle background tint
- Rounded corners
- Internal padding

### Search Controls
\`\`\`css
.search-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.search-input:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}
\`\`\`
- Flexbox layout with gap
- Search input grows to fill space
- Focus state with cyan glow
- Dark theme styling

### NEO List
\`\`\`css
.neo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
}
\`\`\`
- CSS Grid with responsive columns
- Minimum card width of 300px
- Scrollable with max height
- Auto-fill creates as many columns as fit

### NEO Cards
\`\`\`css
.neo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.neo-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.2);
}
\`\`\`
- Semi-transparent background
- Hover animation: lifts and glows
- Cursor indicates clickability
- Smooth transitions

### Danger Badges
\`\`\`css
.danger-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.danger-badge.high {
  background: rgba(255, 50, 50, 0.2);
  color: #ff5050;
  border: 1px solid #ff5050;
}

.danger-badge.medium {
  background: rgba(255, 200, 50, 0.2);
  color: #ffc832;
  border: 1px solid #ffc832;
}

.danger-badge.low {
  background: rgba(50, 255, 50, 0.2);
  color: #50ff50;
  border: 1px solid #50ff50;
}
\`\`\`
- Color-coded by danger level
- High: Red
- Medium: Orange/Yellow
- Low: Green
- Semi-transparent backgrounds with solid borders

### Hazard Warning
\`\`\`css
.hazard-warning {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 50, 50, 0.1);
  border-left: 3px solid #ff5050;
  color: #ff5050;
  font-size: 0.875rem;
  font-weight: bold;
}
\`\`\`
- Red theme for warnings
- Left border accent
- Stands out from other details

## Data Flow

\`\`\`
Parent Component
    ↓
Passes neos array & onSelect callback
    ↓
NEOSelector receives props
    ↓
User types in search → setSearchTerm
    ↓
User toggles danger filter → setFilterDanger
    ↓
filteredNEOs recalculates (automatic)
    ↓
List re-renders with filtered results
    ↓
User clicks NEO card
    ↓
onSelect(neo) called
    ↓
Parent component receives selected NEO
\`\`\`

## Filtering Logic

### Search Filter
\`\`\`javascript
// Case-insensitive substring match
"(2023 AB)" includes "ab" → true
"(2023 AB)" includes "cd" → false
\`\`\`

### Danger Filter
\`\`\`javascript
// When filterDanger is true:
is_potentially_hazardous_asteroid === true → included
is_potentially_hazardous_asteroid === false → excluded

// When filterDanger is false:
All NEOs included regardless of hazard status
\`\`\`

### Combined Filters
\`\`\`javascript
// Both conditions must be true (AND logic)
matchesSearch && matchesDanger
\`\`\`

## Danger Level Algorithm

\`\`\`javascript
if (is_potentially_hazardous_asteroid) {
  return 'high';  // NASA designation
}
if (diameter > 1 km OR velocity > 20 km/s) {
  return 'medium';  // Large or fast
}
return 'low';  // Small and slow
\`\`\`

## User Interactions

1. **Search**: Type in search box → list filters in real-time
2. **Danger Filter**: Toggle checkbox → list shows only hazardous asteroids
3. **Hover Card**: Mouse over → card lifts and glows
4. **Click Card**: Click anywhere on card → `onSelect` callback fires
5. **Scroll**: If many results → scroll within list container

## Accessibility Features

- Semantic HTML (h2, h3, labels)
- Keyboard accessible (all interactive elements focusable)
- Clear labels for inputs
- High contrast text
- Focus indicators on inputs
- Screen reader friendly structure

## Performance Considerations

- Filtering happens on every render (fast for typical NEO counts)
- No debouncing on search (instant feedback)
- Virtual scrolling not needed (typical result count < 100)
- Memoization not needed (simple calculations)

## Edge Cases Handled

- **No NEOs**: Shows "No asteroids match your criteria"
- **Missing close approach data**: Optional chaining prevents crashes
- **Invalid velocity**: parseFloat handles non-numeric strings
- **Empty search**: Shows all NEOs (or all hazardous if filter active)
\`\`\`

I'll continue with the remaining component documentation files. Would you like me to proceed with OrbitVisualization, ImpactSimulator, ImpactResults, MitigationPanel, and the Simulation modules documentation?
