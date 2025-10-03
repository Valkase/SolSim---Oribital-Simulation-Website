# SimulationWizard Component Documentation

**File**: `pages/SimulationWizard/SimulationWizard.jsx`

## Purpose

The SimulationWizard is the core feature of the application. It guides users through a step-by-step process to select an asteroid, visualize its orbit, simulate an impact, view results, and test mitigation strategies.

## Component Structure

\`\`\`jsx
function SimulationWizard()
\`\`\`

### Line-by-Line Explanation

#### Imports (Lines 1-10)
\`\`\`jsx
import React, { useState, useEffect } from 'react';
import NEOSelector from '../../components/NEOSelector/NEOSelector';
import OrbitVisualization from '../../components/OrbitVisualization/OrbitVisualization';
import ImpactSimulator from '../../components/ImpactSimulator/ImpactSimulator';
import ImpactResults from '../../components/ImpactResults/ImpactResults';
import MitigationPanel from '../../components/MitigationPanel/MitigationPanel';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import NEODataService from '../../Simulation/NEODataService';
import './SimulationWizard.css';
\`\`\`
- **Line 1**: React core and hooks for state management and side effects
- **Lines 2-7**: All child components used in the wizard
- **Line 8**: Service for fetching NEO data from NASA API
- **Line 9**: Component styles

#### Component Declaration & State (Lines 12-18)
\`\`\`jsx
const SimulationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [neos, setNeos] = useState([]);
  const [selectedNEO, setSelectedNEO] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
\`\`\`
- **Line 13**: `currentStep` tracks which wizard step is active (1-5)
- **Line 14**: `neos` stores array of NEO objects from NASA API
- **Line 15**: `selectedNEO` stores the asteroid chosen by user
- **Line 16**: `impactData` stores calculated impact results
- **Line 17**: `loading` boolean for loading state
- **Line 18**: `error` stores error messages if API fails

#### Data Fetching Effect (Lines 20-36)
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
        setError('Failed to load asteroid data. Using cached data if available.');
      } finally {
        setLoading(false);
      }
    };

    loadNEOs();
  }, []);
\`\`\`
- **Line 20**: `useEffect` runs once on component mount (empty dependency array)
- **Line 21**: Async function to fetch NEO data
- **Line 23**: Set loading to true before fetch
- **Line 24**: Call NASA API through NEODataService
- **Line 25**: Store fetched NEOs in state
- **Line 26**: Clear any previous errors
- **Lines 27-30**: Catch block handles API failures
  - Logs error to console
  - Sets user-friendly error message
  - NEODataService automatically falls back to cached data
- **Lines 31-33**: Finally block always runs
  - Sets loading to false regardless of success/failure
- **Line 36**: Call loadNEOs immediately

#### Step Navigation Handlers (Lines 38-48)
\`\`\`jsx
  const handleNEOSelect = (neo) => {
    setSelectedNEO(neo);
    setCurrentStep(2);
  };

  const handleOrbitView = () => {
    setCurrentStep(3);
  };

  const handleImpactCalculated = (data) => {
    setImpactData(data);
    setCurrentStep(4);
  };
\`\`\`
- **Lines 38-41**: `handleNEOSelect`
  - Called when user selects an asteroid
  - Stores selected NEO in state
  - Advances to step 2 (Orbit Visualization)

- **Lines 43-45**: `handleOrbitView`
  - Called when user finishes viewing orbit
  - Advances to step 3 (Impact Simulator)

- **Lines 47-50**: `handleImpactCalculated`
  - Called when impact calculation completes
  - Stores impact results in state
  - Advances to step 4 (Impact Results)

#### Reset Handler (Lines 52-57)
\`\`\`jsx
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedNEO(null);
    setImpactData(null);
  };
\`\`\`
- Resets wizard to initial state
- Clears selected NEO and impact data
- Returns to step 1 (NEO Selection)

#### Loading State Render (Lines 59-65)
\`\`\`jsx
  if (loading) {
    return (
      <div className="simulation-wizard">
        <LoadingSpinner message="Loading asteroid data from NASA..." />
      </div>
    );
  }
\`\`\`
- Conditional render while data is loading
- Shows LoadingSpinner component with message
- Prevents rendering wizard steps before data is ready

#### Main Render (Lines 67-72)
\`\`\`jsx
  return (
    <div className="simulation-wizard">
      <div className="wizard-header">
        <h1>Orbit & Impact Simulator</h1>
        <p className="wizard-subtitle">Step-by-step asteroid threat analysis</p>
      </div>
\`\`\`
- Root container with class for styling
- Header section with title and subtitle

#### Error Display (Lines 74-78)
\`\`\`jsx
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
\`\`\`
- Conditional render if error exists
- Displays error message in banner
- User can still proceed if cached data is available

#### Step Indicator (Lines 80-92)
\`\`\`jsx
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Select NEO</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. View Orbit</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Simulate Impact</div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. View Results</div>
        <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>5. Test Mitigation</div>
      </div>
\`\`\`
- Visual progress indicator showing all 5 steps
- Each step has conditional `active` class
- Steps are marked active when `currentStep` reaches or passes that number
- Provides visual feedback of user's progress through wizard

#### Step Content Rendering (Lines 94-134)
\`\`\`jsx
      <div className="wizard-content">
        {currentStep === 1 && (
          <NEOSelector
            neos={neos}
            onSelect={handleNEOSelect}
          />
        )}

        {currentStep === 2 && selectedNEO && (
          <OrbitVisualization
            neo={selectedNEO}
            onContinue={handleOrbitView}
          />
        )}

        {currentStep === 3 && selectedNEO && (
          <ImpactSimulator
            neo={selectedNEO}
            onImpactCalculated={handleImpactCalculated}
          />
        )}

        {currentStep === 4 && impactData && (
          <ImpactResults
            impactData={impactData}
            onContinue={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 5 && selectedNEO && impactData && (
          <MitigationPanel
            neo={selectedNEO}
            impactData={impactData}
            onReset={handleReset}
          />
        )}
      </div>
\`\`\`

**Step 1: NEO Selection (Lines 95-100)**
- Renders when `currentStep === 1`
- Passes `neos` array to NEOSelector
- Passes `handleNEOSelect` callback for when user selects asteroid

**Step 2: Orbit Visualization (Lines 102-107)**
- Renders when `currentStep === 2` AND `selectedNEO` exists
- Passes selected NEO data to OrbitVisualization
- Passes `handleOrbitView` callback for continue button

**Step 3: Impact Simulation (Lines 109-114)**
- Renders when `currentStep === 3` AND `selectedNEO` exists
- Passes selected NEO to ImpactSimulator
- Passes `handleImpactCalculated` callback to receive results

**Step 4: Impact Results (Lines 116-121)**
- Renders when `currentStep === 4` AND `impactData` exists
- Displays calculated impact results
- Inline callback advances to step 5

**Step 5: Mitigation Testing (Lines 123-129)**
- Renders when `currentStep === 5` AND both `selectedNEO` and `impactData` exist
- Passes both NEO and impact data to MitigationPanel
- Passes `handleReset` callback to restart wizard

#### Component Export (Line 139)
\`\`\`jsx
export default SimulationWizard;
\`\`\`

## State Flow Diagram

\`\`\`
Initial State:
  currentStep: 1
  neos: []
  selectedNEO: null
  impactData: null
  loading: true

↓ (useEffect runs)

After API Fetch:
  neos: [NEO objects]
  loading: false

↓ (User selects asteroid)

After Selection:
  selectedNEO: {NEO object}
  currentStep: 2

↓ (User views orbit)

After Orbit View:
  currentStep: 3

↓ (Impact calculated)

After Impact:
  impactData: {impact results}
  currentStep: 4

↓ (User views results)

After Results:
  currentStep: 5

↓ (User tests mitigation)

After Reset:
  Back to Initial State
\`\`\`

## Styling (SimulationWizard.css)

### Container
\`\`\`css
.simulation-wizard {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}
\`\`\`
- Full viewport height
- Space-themed gradient background

### Step Indicator
\`\`\`css
.step-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.step {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.step.active {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
  color: #00ffff;
}
\`\`\`
- Flexbox horizontal layout
- Inactive steps are dimmed
- Active steps glow with cyan color
- Smooth transitions between states

### Error Banner
\`\`\`css
.error-banner {
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #ff6b6b;
}
\`\`\`
- Red-tinted background for errors
- Non-blocking (user can still proceed)

## Data Flow Between Steps

1. **NEOSelector** → `handleNEOSelect(neo)` → stores in `selectedNEO`
2. **OrbitVisualization** → `handleOrbitView()` → advances step
3. **ImpactSimulator** → `handleImpactCalculated(data)` → stores in `impactData`
4. **ImpactResults** → inline callback → advances step
5. **MitigationPanel** → `handleReset()` → clears all data

## Error Handling

- API failures are caught and displayed in error banner
- Cached data is used as fallback
- Each step checks for required data before rendering
- Loading state prevents premature rendering

## Accessibility

- Semantic HTML structure
- Clear step labels
- Visual progress indicator
- Error messages are descriptive
- Keyboard navigation supported through child components
