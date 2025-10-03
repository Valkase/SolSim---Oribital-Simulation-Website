# HomePage Component Documentation

**File**: `pages/HomePage/HomePage.jsx`

## Purpose

The HomePage serves as the landing page and entry point for the NEO tracking application. It provides an overview of the application's capabilities and navigation to main features.

## Component Structure

\`\`\`jsx
function HomePage()
\`\`\`

### Line-by-Line Explanation

#### Imports (Lines 1-3)
\`\`\`jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
\`\`\`
- **Line 1**: Imports React library for component creation
- **Line 2**: Imports `useNavigate` hook from React Router for programmatic navigation
- **Line 3**: Imports component-specific styles

#### Component Declaration (Line 5)
\`\`\`jsx
const HomePage = () => {
\`\`\`
- Declares HomePage as a functional component using arrow function syntax
- No props are passed to this component

#### Navigation Hook (Line 6)
\`\`\`jsx
  const navigate = useNavigate();
\`\`\`
- Initializes the `navigate` function from React Router
- Used to programmatically navigate to different routes when buttons are clicked

#### JSX Return (Lines 8-60)
\`\`\`jsx
  return (
    <div className="home-page">
\`\`\`
- Returns the JSX structure for the component
- Root div with class `home-page` for styling

#### Hero Section (Lines 9-13)
\`\`\`jsx
      <div className="hero-section">
        <h1 className="hero-title">NEO Impact Simulator</h1>
        <p className="hero-subtitle">
          Track Near-Earth Objects and Simulate Planetary Defense Scenarios
        </p>
\`\`\`
- **Line 9**: Container for hero content
- **Line 10**: Main title with large, prominent styling
- **Lines 11-13**: Subtitle explaining the application's purpose

#### Feature Cards Container (Lines 16-17)
\`\`\`jsx
      <div className="features-grid">
        {/* Feature Card 1: Orbit Simulator */}
\`\`\`
- Grid container that holds three feature cards
- Uses CSS Grid for responsive layout

#### Feature Card 1: Orbit Simulator (Lines 18-31)
\`\`\`jsx
        <div className="feature-card">
          <div className="feature-icon">🛰️</div>
          <h2 className="feature-title">Orbit Simulator</h2>
          <p className="feature-description">
            Visualize asteroid trajectories in 3D space. Track orbital paths
            and predict close approaches to Earth.
          </p>
          <button
            className="feature-button"
            onClick={() => navigate('/simulator')}
          >
            Launch Simulator
          </button>
        </div>
\`\`\`
- **Line 18**: Card container
- **Line 19**: Icon display (satellite emoji)
- **Line 20**: Feature title
- **Lines 21-24**: Description of the orbit simulation feature
- **Lines 25-30**: Button that navigates to `/simulator` route when clicked
  - `onClick` handler calls `navigate('/simulator')`

#### Feature Card 2: Mitigation Lab (Lines 33-46)
\`\`\`jsx
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h2 className="feature-title">Mitigation Lab</h2>
          <p className="feature-description">
            Test planetary defense strategies. Simulate kinetic impactors,
            nuclear deflection, and gravity tractors.
          </p>
          <button
            className="feature-button"
            onClick={() => navigate('/mitigation')}
          >
            Enter Lab
          </button>
        </div>
\`\`\`
- Similar structure to Feature Card 1
- Rocket emoji icon
- Navigates to `/mitigation` route
- Focuses on deflection strategy testing

#### Feature Card 3: Game Mode (Lines 48-61)
\`\`\`jsx
        <div className="feature-card feature-card-disabled">
          <div className="feature-icon">🎮</div>
          <h2 className="feature-title">Game Mode</h2>
          <p className="feature-description">
            Defend Earth from incoming threats. Race against time to save
            humanity. (Coming Soon)
          </p>
          <button
            className="feature-button"
            disabled
          >
            Coming Soon
          </button>
        </div>
\`\`\`
- **Line 48**: Additional class `feature-card-disabled` for visual distinction
- **Line 56**: Button is disabled (not clickable)
- Placeholder for future gamification feature

#### Component Export (Line 67)
\`\`\`jsx
export default HomePage;
\`\`\`
- Exports HomePage as default export for use in routing

## Styling (HomePage.css)

### Container Styles
\`\`\`css
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}
\`\`\`
- Full viewport height
- Flexbox column layout for vertical stacking
- Dark space-themed gradient background

### Hero Section
\`\`\`css
.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  max-width: 800px;
}
\`\`\`
- Centered text alignment
- Bottom margin for spacing
- Max width for readability

### Features Grid
\`\`\`css
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
}
\`\`\`
- CSS Grid with responsive columns
- Minimum column width of 300px
- Automatically adjusts to screen size

### Feature Cards
\`\`\`css
.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
}
\`\`\`
- Semi-transparent background
- Cyan border with glow effect
- Hover animation: lifts up and glows brighter

## User Interactions

1. **Page Load**: User sees hero section and three feature cards
2. **Hover Effects**: Cards lift and glow when mouse hovers over them
3. **Button Clicks**:
   - "Launch Simulator" → Navigates to SimulationWizard
   - "Enter Lab" → Navigates to MitigationStrategies
   - "Coming Soon" → Disabled, no action

## Navigation Flow

\`\`\`
HomePage
  ├─→ /simulator (Orbit Simulator)
  ├─→ /mitigation (Mitigation Lab)
  └─→ /game (Coming Soon - disabled)
\`\`\`

## Accessibility Features

- Semantic HTML structure (`h1`, `h2`, `p`, `button`)
- Clear button labels
- Disabled state for unavailable features
- High contrast text on dark background

## Responsive Design

- Grid adapts from 3 columns (desktop) to 1 column (mobile)
- Padding adjusts for smaller screens
- Text remains readable at all sizes
