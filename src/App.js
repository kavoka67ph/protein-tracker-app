import React, { useState, useEffect } from 'react';

// Add Font Awesome for icons
// This script tag should ideally be in your index.html, but for a single immersive file,
// we'll include it here. In a real React project, you'd install the Font Awesome package.
const FontAwesomeScript = () => (
  <script src="https://kit.fontawesome.com/a076d05399.js" crossOrigin="anonymous"></script>
);


// This is the main component for our Protein Tracker App
function App() {
  // --- State variables ---
  // Initialize state from localStorage if data exists, otherwise use default values
  const [height, setHeight] = useState(() => localStorage.getItem('proteinTracker_height') || '');
  const [weight, setWeight] = useState(() => localStorage.getItem('proteinTracker_weight') || '');
  const [activityLevel, setActivityLevel] = useState(() => localStorage.getItem('proteinTracker_activityLevel') || '');
  const [gender, setGender] = useState(() => localStorage.getItem('proteinTracker_gender') || '');
  const [manualTarget, setManualTarget] = useState(() => localStorage.getItem('proteinTracker_manualTarget') || '');
  // dailyTarget needs to be calculated or loaded, handled in useEffect below
  const [dailyTarget, setDailyTarget] = useState(() => {
      const savedTarget = localStorage.getItem('proteinTracker_dailyTarget');
      return savedTarget ? Number(savedTarget) : 0;
  });
  const [foodType, setFoodType] = useState(''); // This input doesn't need to be saved
  const [foodWeight, setFoodWeight] = useState(''); // This input doesn't need to be saved
  // totalConsumed and addedItems need daily reset logic, handled in useEffect and handleDailyReset
  const [totalConsumed, setTotalConsumed] = useState(() => {
      const savedConsumed = localStorage.getItem('proteinTracker_totalConsumed');
       // We'll add daily reset logic in a separate effect or check based on date
      return savedConsumed ? Number(savedConsumed) : 0; // For now, just load
  });
  const [addedItems, setAddedItems] = useState(() => {
      const savedItems = localStorage.getItem('proteinTracker_addedItems');
       // We'll add daily reset logic in a separate effect or check based on date
      return savedItems ? JSON.parse(savedItems) : []; // For now, just load
  });
  const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback message

  // State to manage the current screen ('home', 'tracking', or 'history') (Updated)
  const [currentPage, setCurrentPage] = useState('home'); // Start on the home (target setting) screen

  // --- Protein values per 100g for common foods ---
  const proteinPer100g = {
    chicken_breast: 31, // Approximate value
    fish: 22, // Approximate value (can vary by type)
    eggs: 13, // Approximate value (for about 2 medium eggs)
    pork: 27, // Approximate value (can vary by cut)
    // Add more common protein sources here later
  };

  // --- Logic for calculating suggested protein requirement ---
  const calculateSuggestedTarget = () => {
    const weightKg = Number(weight);
    if (!weightKg || !activityLevel || !gender) {
      console.log('Missing inputs for calculation.');
      // Do not reset dailyTarget if manualTarget is set or if inputs are just temporarily missing
      if (manualTarget === '') {
         // Optionally set to 0 or a default if all calculation inputs are empty
         // setDailyTarget(0);
      }
      return;
    }

    let multiplier = 0;
    // Base multipliers per kg body weight (mid-range values)
    switch (activityLevel) {
      case 'sedentary':
        multiplier = 0.8;
        break;
      case 'lightly_active':
        multiplier = 1.3; // Mid-range of 1.2-1.4
        break;
      case 'moderately_active':
        multiplier = 1.5; // Mid-range of 1.4-1.6
        break;
      case 'very_active':
        multiplier = 1.9; // Mid-range of 1.6-2.2
        break;
      default:
        multiplier = 0; // Should not happen if activityLevel is from dropdown
    }

    // Adjust multiplier slightly based on gender (example adjustment)
    if (gender === 'male') {
        multiplier *= 1.1; // Example: 10% higher for males
    }
     // No adjustment needed for female based on this simple example

    const suggestedTarget = Math.round(weightKg * multiplier); // Round to nearest whole number
    setDailyTarget(suggestedTarget);
    console.log('Calculated suggested target:', suggestedTarget);
  };

  // --- Effect to recalculate suggested target when inputs change ---
  // This makes the calculation happen automatically when height, weight, activity, or gender changes
  useEffect(() => {
      if (manualTarget === '') { // Only auto-calculate if manual target is not set
          calculateSuggestedTarget();
      }
  }, [height, weight, activityLevel, gender, manualTarget]); // Dependencies: recalculate if any of these change

  // --- Effect to save user profile data to localStorage whenever it changes ---
  useEffect(() => {
      localStorage.setItem('proteinTracker_height', height);
      localStorage.setItem('proteinTracker_weight', weight);
      localStorage.setItem('proteinTracker_activityLevel', activityLevel);
      localStorage.setItem('proteinTracker_gender', gender);
      localStorage.setItem('proteinTracker_manualTarget', manualTarget);
      // dailyTarget is saved below when totalConsumed or addedItems change,
      // or manually when manualTarget is set.
  }, [height, weight, activityLevel, gender, manualTarget]); // Dependencies

    // --- Effect to save daily tracking data to localStorage whenever it changes ---
    // Also saves dailyTarget here to ensure it's persisted with tracking data
    useEffect(() => {
        localStorage.setItem('proteinTracker_totalConsumed', totalConsumed);
        localStorage.setItem('proteinTracker_addedItems', JSON.stringify(addedItems));
        localStorage.setItem('proteinTracker_dailyTarget', dailyTarget); // Save daily target with tracking data
    }, [totalConsumed, addedItems, dailyTarget]); // Dependencies


    // --- Effect to handle daily reset based on date (Optional but recommended for "daily" tracking) ---
    // This is a more advanced feature. For a simple prototype, the manual reset button might be enough.
    // Implementing automatic daily reset requires comparing the saved date with the current date.
    // Let's add the structure for this, but keep it simple for now.
    useEffect(() => {
        const lastResetDate = localStorage.getItem('proteinTracker_lastResetDate');
        const today = new Date().toDateString();

        if (lastResetDate !== today) {
            // It's a new day, perform automatic reset
            console.log("New day detected. Resetting daily tracking.");
            setTotalConsumed(0);
            setAddedItems([]);
            localStorage.setItem('proteinTracker_lastResetDate', today);
            // Note: User profile data (height, weight, target) is NOT reset here.
        }
    }, []); // Empty dependency array means this effect runs only once on mount


  // --- Function to handle adding protein ---
  const handleAddProtein = () => {
    const weightGrams = Number(foodWeight);
    if (!foodType || !weightGrams || weightGrams <= 0) {
      setFeedbackMessage('Please select food type and enter valid weight.');
      return;
    }

    // Get protein per 100g for the selected food type
    const proteinPer100 = proteinPer100g[foodType];

    if (proteinPer100 === undefined) {
        setFeedbackMessage('Unknown food type selected.');
        return; // Should not happen if dropdown is populated correctly
    }

    const proteinPerGram = proteinPer100 / 100; // Get protein per gram
    const proteinToAdd = Math.round(weightGrams * proteinPerGram); // Calculate protein and round

    if (proteinToAdd <= 0) {
        setFeedbackMessage('Calculated protein is 0. Please check food type and weight.');
        return;
    }

    setTotalConsumed(totalConsumed + proteinToAdd);
    setAddedItems([...addedItems, { type: foodType, weight: weightGrams, protein: proteinToAdd }]);
    setFeedbackMessage(`Added ${proteinToAdd}g protein from ${foodType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}.`); // Feedback message with formatted name

    // Clear input fields after adding
    setFoodType('');
    setFoodWeight('');
  };

  // Function to handle manual target input
  const handleManualTargetChange = (e) => {
    const value = e.target.value;
    setManualTarget(value);
    // If manual target is entered, use it as the daily target
    if (value !== '') {
      setDailyTarget(Number(value));
    } else {
      // If manual target is cleared, recalculate based on height/weight/activity/gender
      calculateSuggestedTarget();
    }
  };

  // Function to handle daily reset (Implemented with localStorage update)
  const handleDailyReset = () => {
      setTotalConsumed(0);
      setAddedItems([]);
      localStorage.setItem('proteinTracker_totalConsumed', 0); // Clear in localStorage
      localStorage.setItem('proteinTracker_addedItems', JSON.stringify([])); // Clear in localStorage
      localStorage.setItem('proteinTracker_lastResetDate', new Date().toDateString()); // Update reset date (for auto-reset)
      setFeedbackMessage('Daily tracking reset.'); // Feedback message
      console.log('Daily tracking reset.');
      // User profile data (height, weight, target) is NOT reset here.
  };

  // Calculate protein remaining
  const proteinRemaining = dailyTarget > 0 ? dailyTarget - totalConsumed : 0; // Ensure it doesn't go negative if no target

  // Calculate progress for the circular bar (as a percentage)
  const progressPercentage = dailyTarget > 0 ? (totalConsumed / dailyTarget) * 100 : 0;
  // Ensure percentage is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progressPercentage));

  // --- Circular Progress Bar SVG calculations ---
  const radius = 70; // Radius of the circle
  const circumference = 2 * Math.PI * radius;
  // The stroke-dashoffset controls how much of the circle is filled
  // 0 means fully filled, circumference means empty
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;


  // --- JSX structure for the UI layout ---
  return (
    <div className="container mx-auto p-4 max-w-md"> {/* Removed pb-20 */}
      <h1 className="text-2xl font-bold mb-6 text-center">Protein Tracker</h1>

      {/* Inline Navigation Bar (Moved and Styled) */}
       <div className="mb-6 p-4 border rounded-lg shadow-sm"> {/* Added styling */}
           <div className="flex justify-around items-center h-16">
               {/* Home Button */}
               <button
                   onClick={() => setCurrentPage('home')}
                   className={`flex flex-col items-center justify-center text-gray-600 ${currentPage === 'home' ? 'text-blue-600' : ''}`}
               >
                   <i className="fas fa-home text-xl"></i> {/* Font Awesome Home icon */}
                   <span className="text-xs">Home</span>
               </button>
               {/* Tracking Button */}
               <button
                   onClick={() => setCurrentPage('tracking')}
                   className={`flex flex-col items-center justify-center text-gray-600 ${currentPage === 'tracking' ? 'text-green-600' : ''}`}
               >
                   <i className="fas fa-chart-bar text-xl"></i> {/* Font Awesome Chart icon */}
                   <span className="text-xs">Tracking</span>
               </button>
               {/* History Button */}
               <button
                   onClick={() => setCurrentPage('history')}
                   className={`flex flex-col items-center justify-center text-gray-600 ${currentPage === 'history' ? 'text-purple-600' : ''}`}
               >
                   <i className="fas fa-history text-xl"></i> {/* Font Awesome History icon */}
                   <span className="text-xs">History</span>
               </button>
           </div>
       </div>


      {/* Conditional Rendering based on currentPage */}
      {currentPage === 'home' && (
        // --- Section for Daily Protein Requirement (Home Screen) ---
        <div className="mb-6 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Daily Target</h2>

          {/* Inputs for Calculation */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="flex items-center space-x-4">
                  <div>
                      <input
                          type="radio"
                          id="female"
                          name="gender"
                          value="female"
                          checked={gender === 'female'}
                          onChange={(e) => setGender(e.target.value)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="female" className="ml-2 text-sm font-medium text-gray-700">Female</label>
                  </div>
                  <div>
                      <input
                          type="radio"
                          id="male"
                          name="gender"
                          value="male"
                          checked={gender === 'male'}
                          onChange={(e) => setGender(e.target.value)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="male" className="ml-2 text-sm font-medium text-gray-700">Male</label>
                  </div>
              </div>
          </div>


          <div className="mb-4">
            <label htmlFor="activity" className="block text-sm font-medium text-gray-700">Activity Level</label>
            <select
              id="activity"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (0.8g/kg)</option>
              <option value="lightly_active">Lightly Active (1.2-1.4g/kg)</option>
              <option value="moderately_active">Moderately Active (1.4-1.6g/kg)</option>
              <option value="very_active">Very Active (1.6-2.2g/kg)</option>
            </select>
          </div>

          {/* Removed the Calculate Suggested Target button */}
          {/* <button
            onClick={calculateSuggestedTarget}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Calculate Suggested Target
          </button> */}

          <div className="mt-4 text-center text-sm text-gray-600">-- OR --</div>

          {/* Manual Target Input */}
          <div className="mt-4">
            <label htmlFor="manualTarget" className="block text-sm font-medium text-gray-700">Manually Set Target (grams)</label>
            <input
              type="number"
              id="manualTarget"
              value={manualTarget}
              onChange={handleManualTargetChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="e.g., 120"
            />
          </div>

           {/* Display Daily Target on Home Screen */}
            <div className="mt-4 text-lg font-medium text-center">
              Daily Target: <span className="text-blue-600">{dailyTarget}</span> grams
            </div>

             {/* Button to go to Tracking (Added) */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => setCurrentPage('tracking')}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Go to Tracking
                </button>
            </div>


        </div>
      )}

      {currentPage === 'tracking' && (
        // --- Section for Tracking Protein (Tracking Screen) ---
        <div className="mb-6 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Track Protein</h2>

          {/* Display Daily Target in Tracking Section */}
          <div className="mb-4 text-lg font-medium text-center">
              Daily Target: <span className="text-blue-600">{dailyTarget}</span> grams
          </div>

          {/* Circular Progress Bar (Implemented using SVG) */}
          <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40"> {/* Container for SVG and text */}
                  <svg className="w-full h-full" viewBox="0 0 160 160"> {/* SVG viewBox */}
                      {/* Background circle */}
                      <circle
                          cx="80" // Center x
                          cy="80" // Center y
                          r={radius} // Radius
                          fill="none"
                          strokeWidth="15" // Stroke width
                          className="stroke-gray-200" // Tailwind class for color
                      />
                      {/* Progress circle */}
                      <circle
                          cx="80" // Center x
                          cy="80" // Center y
                          r={radius} // Radius
                          fill="none"
                          strokeWidth="15" // Stroke width
                          strokeLinecap="round" // Rounded ends for the progress bar
                          className="stroke-green-500 transition-all duration-500 ease-linear" // Tailwind class for color and transition
                          style={{
                              strokeDasharray: circumference, // Full circle circumference
                              strokeDashoffset: strokeDashoffset, // Controls the fill level
                              transform: 'rotate(-90deg)', // Start from the top
                              transformOrigin: '50% 50%', // Rotate around the center
                          }}
                      />
                  </svg>
                   {/* Text in the center of the circle */}
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                      {totalConsumed}g
                  </div>
              </div>
          </div>

          {/* Display Percentage Achieved */}
          <div className="mb-4 text-center text-sm text-gray-600">
              Achieved: <span className="font-semibold">{clampedProgress.toFixed(0)}%</span>
          </div>

          {/* Feedback Message Display */}
          {feedbackMessage && (
              <div className={`mb-4 text-center text-sm ${feedbackMessage.includes('Please') ? 'text-red-600' : 'text-green-600'}`}>
                  {feedbackMessage}
              </div>
          )}


          {/* Food Input */}
          <div className="mb-4">
            <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">Food Type</label>
             {/* This will be a select/dropdown with common protein sources */}
            <select
              id="foodType"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Select food type</option>
              {Object.keys(proteinPer100g).map(key => (
                  <option key={key} value={key}>{key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option> // Display formatted name
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="foodWeight" className="block text-sm font-medium text-gray-700">Weight (grams)</label>
            <input
              type="number"
              id="foodWeight"
              value={foodWeight}
              onChange={(e) => setFoodWeight(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="e.g., 100"
            />
          </div>

          <button
            onClick={handleAddProtein}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add Protein
          </button>

          {/* Display Protein Remaining */}
           <div className="mt-4 text-lg font-medium text-center">
            Protein Remaining: <span className="text-orange-600">{proteinRemaining}</span> grams
          </div>

          {/* Manual Daily Reset Button */}
          <div className="mt-6 text-center">
              <button
                  onClick={handleDailyReset}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                  Reset Daily Tracking
              </button>
          </div>

        </div>
      )}

       {currentPage === 'history' && (
            // --- Section for History (History Screen) ---
            <div className="mb-6 p-4 border rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Today's Log</h2> {/* Title indicates it's today's history */}

                {/* This section displays the addedItems list */}
                {addedItems.length === 0 ? (
                  <p className="text-gray-500 text-center">No items added today.</p>
                ) : (
                  <ul>
                    {addedItems.map((item, index) => (
                      <li key={index} className="mb-2 pb-2 border-b last:border-b-0 text-sm">
                        {item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: {item.protein}g ({item.weight}g)
                      </li>
                    ))}
                  </ul>
                )}
            </div>
       )}


       {/* Basic Disclaimer (Visible on all screens) */}
       <p className="text-center text-xs text-gray-500 mt-4"> {/* Removed mb-20 */}
           Protein requirement calculation is a suggestion based on general guidelines and not medical advice. Consult a healthcare professional for personalized recommendations.
       </p>

       {/* Include Font Awesome Script */}
       <FontAwesomeScript />

    </div>
  );
}

export default App;
