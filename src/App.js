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

  // State to manage the current screen ('home', 'tracking', 'history', 'about') (Updated)
  const [currentPage, setCurrentPage] = useState('tracking'); // Start on the tracking screen as per screenshot layout

   // State to toggle between general and Filipino food lists (Added)
   const [showFilipinoFoods, setShowFilipinoFoods] = useState(false);


  // --- Protein values per 100g for common foods (Expanded) ---
  const proteinPer100g = {
    // General Meats
    chicken_breast: 31, // Approximate value
    lean_beef: 26, // Approximate value for lean cuts
    pork: 27, // Approximate value (can vary by cut)
    // General Fish & Seafood
    salmon: 20, // Approximate value
    // General Eggs & Dairy
    eggs: 13, // Approximate value (for about 2 medium eggs)
    greek_yogurt: 10, // Approximate value (plain, non-fat)
    // General Plant-Based
    tofu: 10, // Approximate value (firm)
    lentils_cooked: 9, // Approximate value for cooked lentils
    chickpeas_cooked: 7, // Approximate value for cooked chickpeas
    quinoa_cooked: 4, // Approximate value for cooked quinoa
    pumpkin_seeds: 30, // Approximate value (shelled)

    // --- Filipino Specific Foods (Added) ---
    chicken_manok: 31, // Assuming similar to chicken breast
    pork_baboy: 27, // Assuming similar to general pork
    beef_baka: 26, // Assuming similar to lean beef
    bangus_milkfish: 24, // Approximate value
    galunggong_round_scad: 21, // Approximate value
    tilapia: 26, // Approximate value
    itlog_eggs: 13, // Assuming similar to general eggs
    gatas_ng_kalabaw: 4, // Approximate value (Carabao milk)
    tokwa_tofu: 10, // Assuming similar to general tofu
    monggo_mung_beans_cooked: 7, // Approximate value for cooked mung beans
    malunggay_moringa_leaves: 2, // Approximate value (per 100g raw leaves)
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
  }, [height, weight, activityLevel, gender, manualTarget, calculateSuggestedTarget]); // Dependencies: recalculate if any of these change, ADDED calculateSuggestedTarget

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
    <div className="container mx-auto p-4 max-w-md bg-gray-100 rounded-xl shadow-lg min-h-screen flex flex-col pb-20"> {/* Added background, rounded corners, shadow, min-h-screen, flex-col, ADDED pb-20 */}
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Protein Tracker</h1> {/* Adjusted text color */}


      {/* Conditional Rendering based on currentPage */}
      {currentPage === 'home' && (
        // --- Section for Daily Protein Requirement (Home Screen) ---
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex-grow"> {/* Styled background, rounded corners, shadow, flex-grow */}
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Daily Target</h2> {/* Adjusted text color */}

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
            <div className="mt-4 text-lg font-medium text-center text-gray-800"> {/* Adjusted text color */}
              Daily Target: <span className="text-blue-600 font-semibold">{dailyTarget}</span> grams {/* Added font-semibold */}
            </div>

              {/* Button to go to Tracking (Added) */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => setCurrentPage('tracking')}
                    className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                    Go to Tracking
                </button>
            </div>


        </div>
      )}

      {currentPage === 'tracking' && (
        // --- Section for Tracking Protein (Tracking Screen) ---
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex-grow flex flex-col items-center"> {/* Styled background, rounded corners, shadow, flex-grow, flex-col, items-center */}
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Track Protein</h2> {/* Adjusted text color */}

          {/* Display Daily Target in Tracking Section */}
          <div className="mb-4 text-lg font-medium text-center text-gray-800"> {/* Adjusted text color */}
              Daily Target: <span className="text-blue-600 font-semibold">{dailyTarget}</span> grams {/* Added font-semibold */}
          </div>

          {/* Circular Progress Bar (Implemented using SVG) */}
          <div className="flex justify-center mb-6"> {/* Removed mb-6, added to parent div */}
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
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800"> {/* Adjusted text color */}
                      {totalConsumed}g
                  </div>
              </div>
          </div>

          {/* Display Percentage Achieved */}
          <div className="mb-4 text-center text-sm text-gray-600">
              Achieved: <span className="font-semibold text-green-600">{clampedProgress.toFixed(0)}%</span> {/* Highlighted percentage */}
          </div>

          {/* Display Protein Remaining */}
           <div className="mb-6 text-lg font-medium text-center text-gray-800"> {/* Adjusted text color, added mb-6 */}
            Protein Remaining: <span className="text-orange-600 font-semibold">{proteinRemaining}</span> grams {/* Added font-semibold */}
          </div>

          {/* Feedback Message Display */}
          {feedbackMessage && (
              <div className={`mb-4 text-center text-sm ${feedbackMessage.includes('Please') ? 'text-red-600' : 'text-green-600'}`}>
                  {feedbackMessage}
              </div>
          )}

           {/* Checkbox to toggle Filipino Foods (Added) */}
            <div className="mb-4 w-full"> {/* Added w-full */}
                <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                        type="checkbox"
                        checked={showFilipinoFoods}
                        onChange={(e) => setShowFilipinoFoods(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                    />
                    <span className="ml-2">Show Filipino Food Options</span>
                </label>
            </div>


          {/* Food Input */}
          <div className="w-full mb-4"> {/* Added w-full */}
            <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">Food Type</label>
             {/* This will be a select/dropdown with common protein sources */}
            <select
              id="foodType"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity50"
            >
              <option value="">Select food type</option>
              {/* Conditionally render options based on showFilipinoFoods */}
              {showFilipinoFoods ? (
                  // Filipino Food Options
                  <>
                    <option value="chicken_manok">Chicken (Manok)</option>
                    <option value="pork_baboy">Pork (Baboy)</option>
                    <option value="beef_baka">Beef (Baka)</option>
                    <option value="bangus_milkfish">Bangus (Milkfish)</option>
                    <option value="galunggong_round_scad">Galunggong (Round scad)</option>
                    <option value="tilapia">Tilapia</option>
                    <option value="itlog_eggs">Itlog (Eggs)</option>
                    <option value="gatas_ng_kalabaw">Gatas ng kalabaw (Carabao’s milk)</option>
                    <option value="tokwa_tofu">Tokwa (Tofu)</option>
                    <option value="monggo_mung_beans_cooked">Monggo (Mung beans)</option>
                    <option value="malunggay_moringa_leaves">Malunggay (Moringa leaves)</option>
                  </>
              ) : (
                  // General Food Options
                  <>
                    <option value="chicken_breast">Chicken Breast</option>
                    <option value="lean_beef">Lean Beef</option>
                    <option value="salmon">Salmon</option>
                    <option value="pork">Pork</option>
                    <option value="eggs">Eggs</option>
                    <option value="greek_yogurt">Greek Yogurt</option>
                    <option value="tofu">Tofu</option>
                    <option value="lentils_cooked">Lentils (cooked)</option>
                    <option value="chickpeas_cooked">Chickpeas (cooked)</option>
                    <option value="quinoa_cooked">Quinoa (cooked)</option>
                    <option value="pumpkin_seeds">Pumpkin Seeds</option>
                  </>
              )}
            </select>
          </div>

          <div className="w-full mb-4"> {/* Added w-full */}
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
            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Add Protein
          </button>

          {/* Display Protein Remaining */}
           <div className="mt-4 text-lg font-medium text-center text-gray-800"> {/* Adjusted text color */}
            Protein Remaining: <span className="text-orange-600 font-semibold">{proteinRemaining}</span> grams {/* Added font-semibold */}
          </div>

          {/* Manual Daily Reset Button */}
          <div className="mt-6 text-center w-full"> {/* Added w-full */}
              <button
                  onClick={handleDailyReset}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                  Reset Daily Tracking
              </button>
          </div>


        </div>
      )}

       {currentPage === 'history' && (
            // --- Section for History (History Screen) ---
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex-grow"> {/* Styled background, rounded corners, shadow, flex-grow */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Today's Log</h2> {/* Title indicates it's today's history, adjusted text color */}

                {/* This section displays the addedItems list */}
                {addedItems.length === 0 ? (
                  <p className="text-gray-500 text-center">No items added today.</p>
                ) : (
                  <ul>
                    {addedItems.map((item, index) => (
                      <li key={index} className="mb-2 pb-2 border-b last:border-b-0 text-sm text-gray-700"> {/* Adjusted text color */}
                        <span className="font-medium">{item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>: {item.protein}g ({item.weight}g) {/* Highlighted food type */}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
       )}

        {currentPage === 'about' && (
            // --- Section for About (About Screen) ---
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex-grow"> {/* Styled background, rounded corners, shadow, flex-grow */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800">About This App</h2> {/* Adjusted text color */}

                <p className="text-sm text-gray-700 mb-4">
                    This app helps you track your daily protein intake and provides a suggested daily protein target based on general guidelines.
                </p>

                <h3 className="text-lg font-semibold mb-2 text-gray-800">Protein Requirement Calculation</h3>
                <p className="text-sm text-gray-700 mb-4">
                    The suggested daily protein target is calculated based on your weight, gender, and activity level, using common recommendations often aligned with Recommended Dietary Allowances (RDA) or similar guidelines.
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside mb-4">
                    <li>**Sedentary:** Approximately 0.8 grams of protein per kilogram of body weight.</li>
                    <li>**Lightly Active:** Approximately 1.2 - 1.4 grams per kg.</li>
                    <li>**Moderately Active:** Approximately 1.4 - 1.6 grams per kg.</li>
                    <li>**Very Active:** Approximately 1.6 - 2.2 grams per kg.</li>
                </ul>
                   <p className="text-sm text-gray-700 mb-4">
                    A slight adjustment is made for gender, with males typically having slightly higher requirements.
                </p>

                <h3 className="text-lg font-semibold mb-2 text-gray-800">Disclaimer</h3>
                {/* Basic Disclaimer (Moved to About Screen) */}
               <p className="text-sm text-gray-500 italic"> {/* Adjusted styling */}
                    Protein requirement calculation is a suggestion based on general guidelines and not medical advice. Consult a healthcare professional for personalized recommendations.
               </p>
            </div>
        )}


        {/* Fixed Bottom Navigation Bar (Corrected width and padding) */}
       <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg"> {/* Corrected positioning and width */}
            <div className="flex justify-around items-center h-16 px-4"> {/* Added px-4 for padding */}
                {/* Home Button */}
                <button
                    onClick={() => setCurrentPage('home')}
                    className={`flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors duration-200 ${currentPage === 'home' ? 'text-blue-600 font-semibold' : ''}`}
                >
                    <i className="fas fa-home text-xl mb-1"></i> {/* Font Awesome Home icon, added mb-1 for spacing */}
                    <span className="text-xs">Home</span>
                </button>
                {/* Tracking Button */}
                <button
                    onClick={() => setCurrentPage('tracking')}
                    className={`flex flex-col items-center justify-center text-gray-600 hover:text-green-600 transition-colors duration-200 ${currentPage === 'tracking' ? 'text-green-600 font-semibold' : ''}`}
                >
                    <i className="fas fa-chart-bar text-xl mb-1"></i> {/* Font Awesome Chart icon, added mb-1 for spacing */}
                    <span className="text-xs">Tracking</span>
                </button>
                {/* History Button */}
                <button
                    onClick={() => setCurrentPage('history')}
                    className={`flex flex-col items-center justify-center text-gray-600 hover:text-purple-600 transition-colors duration-200 ${currentPage === 'history' ? 'text-purple-600 font-semibold' : ''}`}
                >
                    <i className="fas fa-history text-xl mb-1"></i> {/* Font Awesome History icon, added mb-1 for spacing */}
                    <span className="text-xs">History</span>
                </button>
                 {/* About Button (Added) */}
                <button
                    onClick={() => setCurrentPage('about')}
                    className={`flex flex-col items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200 ${currentPage === 'about' ? 'text-gray-800 font-semibold' : ''}`}
                >
                    <i className="fas fa-info-circle text-xl mb-1"></i> {/* Font Awesome Info icon */}
                    <span className="text-xs">About</span>
                </button>
            </div>
        </div>

        {/* Include Font Awesome Script */}
        <FontAwesomeScript />

    </div>
  );
}

export default App;
