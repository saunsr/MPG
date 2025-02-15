document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

    let evaporationTimeout; // 🔥 Fixes "ReferenceError: evaporationTimeout is not defined" - applied as a global variable

    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");
    const startButton = document.getElementById("start-btn");
    const farmGrid = document.getElementById("farm-grid");
    const soilMapBtn = document.getElementById("soil-map-btn");
    const soilMapOverlay = document.getElementById("soil-map-overlay");
    const forecastText = document.getElementById("forecast-text");
    const applyTillageBtn = document.getElementById("tillage-btn");
    const growCropsBtn = document.getElementById("grow-crop-btn");
    const irrigateFieldBtn = document.getElementById("irrigation-btn");
    const harvestCropsBtn = document.getElementById("harvest-crop-btn");
    const cropCounter = document.getElementById("crop-count"); // New counter element


    // Define soil types and moisture properties
    const soilTypes = ["sandy", "clay", "loam"];
    const soilMoistureRange = {
        sandy: [20, 40], // Dries faster
        loam: [40, 60],  // Balanced moisture
        clay: [60, 80]   // Retains moisture
    };

    const farmCells = []; // Ensure we track farm cells
    const moistureLevels = []; // Store each cell's moisture value


    let isTillageInProgress = false; // Track tillage status
    let isTillageCompleted = false; // Flag for tillage completion
    let lastRow = 6; // Last row where tractor stopped (starts from bottom-left)
    let lastCol = 0; // Last column where tractor stopped (starts from bottom-left)
    let lastDirection = 'right'; // Direction of tractor movement ('right' or 'left')
    let harvestedCrops = 0; // Track harvested crops


    // Function to continuously update the farm grid
    function continuouslyUpdateFarmGrid() {
        console.log("✔️ continuouslyUpdateFarmGrid() is running...");

        setInterval(() => {
            farmCells.forEach((cell, index) => {
                let moisture = moistureLevels[index];

                // Simulate slight moisture fluctuation
                let randomChange = Math.random() > 0.5 ? 1 : -1;
                moistureLevels[index] = Math.max(0, Math.min(100, moisture + randomChange));

                // Update visual representation of moisture
                updateMoistureCell(cell, moistureLevels[index], true);
            });

            console.log("🔄 Farm grid updated with new moisture levels.");
        }, 5000); // Update every 5 seconds
    }



    // Start Game
    startButton.addEventListener("click", function () {
        console.log("🎮 Game started! Calling setupWeatherSystem()...");
        console.log("Game started!");
        startScreen.style.display = "none";
        gameContainer.style.display = "flex";
        createFarmGrid();
        setupWeatherSystem();
    });    

    // Create farm grid, assign soil types, track crop count, and create pipeline wvwery two farm rows
    function createFarmGrid() {
        farmGrid.innerHTML = "";
        farmCells.length = 0; // Reset the array

        for (let i = 0; i < 7 * 7; i++) {
            let cell = document.createElement("div");
            cell.classList.add("farm-cell");

            // Assign a random soil type
            let soilType = soilTypes[Math.floor(Math.random() * soilTypes.length)];
            cell.dataset.soilType = soilType; // Store soil type in dataset
            cell.classList.add(soilType); // Add class for CSS styling

            // Initialize crop count
            cell.dataset.cropCount = 0; // Track the number of crops per cell

            farmCells.push(cell);
            farmGrid.appendChild(cell);
        }
        createPipeline(); // Create pipeline across rows
        createMoistureMap(); // Call moisture map function after creating farm grid
        continuouslyUpdateFarmGrid(); // Start continuous updates after moisture map is ready
    }

    
    // Function to create the Soil Moisture Map
function createMoistureMap() {
    const moistureMap = document.getElementById("moisture-map");
    moistureMap.innerHTML = ""; // Clear existing map
    moistureLevels.length = 0; // Reset array

    farmCells.forEach((cell, index) => {
        let soilType = cell.dataset.soilType;
        let moisture = Math.floor(Math.random() * 
            (soilMoistureRange[soilType][1] - soilMoistureRange[soilType][0])) + soilMoistureRange[soilType][0];

        moistureLevels.push(moisture); // Store moisture level

        // Create Soil Moisture Map Cell
        let moistureCell = document.createElement("div");
        moistureCell.classList.add("moisture-cell");
        moistureCell.dataset.moisture = moisture;
        updateMoistureCell(moistureCell, moisture); // Apply correct color
        moistureMap.appendChild(moistureCell);

        // 🔥 Update the farm grid cell color dynamically
        updateMoistureCell(cell, moisture, true); // Ensure farm cell reflects moisture
    });

    continuouslyUpdateFarmGrid(); // Start automatic updates
    applyEvaporation(); // 🔥 Now correctly starts after initialization
}


// Function to apply gradual evaporation
function applyEvaporation() {
    farmCells.forEach((cell, index) => {
        let soilType = cell.dataset.soilType;

        // 🔥 Different evaporation rates based on soil type
        let evaporationRate = soilType === "sandy" ? 2 : soilType === "loam" ? 1.5 : 1;

        // 🔻 Reduce moisture
        moistureLevels[index] = Math.max(0, moistureLevels[index] - evaporationRate);

        // 🔄 Update the moisture display
        updateMoistureCell(cell, moistureLevels[index], true);
    });

    setTimeout(applyEvaporation, 10000); // Run evaporation every 10 seconds
}


// Function to update moisture cell color based on moisture level
function updateMoistureCell(cell, moisture, isFarmGrid = false) {
    cell.classList.remove("dry", "moderate", "wet");

    if (moisture <= 30) {
        cell.classList.add("dry");
    } else if (moisture <= 70) {
        cell.classList.add("moderate");
    } else {
        cell.classList.add("wet");
    }

    // ✅ Ensure the farm grid reflects moisture changes
    if (isFarmGrid) {
        let index = farmCells.indexOf(cell); // Get farm cell index
        if (index !== -1) {
            farmCells[index].style.transition = "background-color 2s ease-in-out"; // Apply transition
            farmCells[index].style.backgroundColor = cell.style.backgroundColor; // Sync colors
        }
    }
}


// Start Game - Call both grid and moisture map
document.getElementById("start-btn").addEventListener("click", function () {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
    createFarmGrid(); // Automatically calls createMoistureMap()
});

    // Toggle Soil Map
    soilMapBtn.addEventListener("click", function () {
        const soilMap = document.getElementById("soil-map");
        if (soilMap.style.display === "none") {
            soilMap.style.display = "block";
            updateSoilMap();
        } else {
            soilMap.style.display = "none";
        }
    });

    // Update Soil Map Overlay
    function updateSoilMap() {
        soilMapOverlay.innerHTML = ""; // Clear previous map

        farmCells.forEach((cell) => {
            let soilCell = document.createElement("div");
            soilCell.classList.add("soil-map-cell", cell.dataset.soilType);
            soilMapOverlay.appendChild(soilCell);
        });
    }




    // Function to create a pipeline every two rows
    function createPipeline() {
        let farmCells = document.querySelectorAll(".farm-cell");

        for (let row = 0; row < 7; row += 2) { // Add pipeline every two rows
            let pipeline = document.createElement("div");
            pipeline.classList.add("pipeline");
            pipeline.style.top = `${row * 60 + 10}px`; // Positioning the pipeline
            farmGrid.appendChild(pipeline);
        }
    }


        // Weather System (Drought, Rain, Storms)
        window.setupWeatherSystem = function() {
            const seasonTypes = ["Dry", "Balanced", "Stormy"];
            const selectedSeason = seasonTypes[Math.floor(Math.random() * seasonTypes.length)];
        
            let droughtChance = selectedSeason === "Dry" ? 50 : selectedSeason === "Stormy" ? 10 : 30;
            let moderateRainChance = selectedSeason === "Stormy" ? 40 : 50;
            let stormChance = selectedSeason === "Stormy" ? 40 : 20;
            let rainCountdown = 300;
        
            console.log(`🌦️ Season Type: ${selectedSeason}`);
        
            // **Force Immediate Forecast Update at Game Start**
            let initialWeatherEvent = determineWeatherEvent();
            if (initialWeatherEvent === "Moderate Rain") {
                forecastText.textContent = "🟢 Moderate rain expected in 5 minutes.";
            } else if (initialWeatherEvent === "Heavy Storm") {
                let stormIncorrect = Math.random() < 0.3;
                forecastText.textContent = stormIncorrect
                    ? "⚠️ Storm MAY arrive in 5 minutes! (Forecast Uncertain)"
                    : "⚠️ Heavy storm expected in 5 minutes!";
            } else {
                forecastText.textContent = "☀️ Dry weather expected. Monitor soil moisture.";
            }
        
            function updateRainTimer() {
                console.log(`⏳ Rain countdown: ${rainCountdown}`);
                rainCountdown--;
        
                if (rainCountdown === 180) { // Drought hint
                    if (Math.random() * 100 < droughtChance) {
                        applyDroughtHint();
                        forecastText.textContent = "⚠️ Dry spell approaching! Soil losing moisture.";
                        console.log("🚨 Drought Warning Issued!");
                    }
                }
        
                if (rainCountdown === 300) {
                    let weatherEvent = determineWeatherEvent();
                    console.log(`🌦️ New weather event determined: ${weatherEvent}`);

                    if (weatherEvent === "Moderate Rain") {
                        forecastText.textContent = "🟢 Moderate rain expected in 5 minutes.";
                    } else if (weatherEvent === "Heavy Storm") {
                        let stormIncorrect = Math.random() < 0.3;
                        forecastText.textContent = stormIncorrect
                            ? "⚠️ Storm MAY arrive in 5 minutes! (Forecast Uncertain)"
                            : "⚠️ Heavy storm expected in 5 minutes!";
                    } else {
                        forecastText.textContent = "☀️ No rain expected. Soil may dry up!";
                    }
                }
        
                if (rainCountdown <= 0) {
                    startRainfall();
                    forecastText.textContent = "🌧️ It's raining! Soil is being irrigated.";
                    rainCountdown = 300;
                    console.log("🌧️ Rain Started!");
                }
            }
        
            function determineWeatherEvent() {
                let randomRoll = Math.random() * 100;
                return randomRoll < droughtChance
                    ? "Drought"
                    : randomRoll < moderateRainChance + droughtChance
                    ? "Moderate Rain"
                    : "Heavy Storm";
            }
        
            function applyDroughtHint() {
                document.querySelectorAll(".farm-cell").forEach(cell => {
                    if (Math.random() > 0.5) {
                        cell.classList.add("drying");
                    }
                });
            }
        
            // **Fix: Ensure forecast updates IMMEDIATELY when game starts**
            setTimeout(updateRainTimer, 1000);
            setInterval(updateRainTimer, 1000);
        };


    // Function to start tillage with zig-zag movement
    function startTillage() {
        if (isTillageInProgress) {
            // Stop Tillage
            stopTillage();
        } else {
            // Start Tillage
            console.log("🚜 Tillage started...");
            isTillageInProgress = true;
            applyTillageBtn.textContent = "Stop Tillage"; // Change button text

            let farmCells = document.querySelectorAll(".farm-cell");
            let currentRow = lastRow; // Start from last position (bottom-left)
            let currentCol = lastCol; // Start from last position (bottom-left)
            let movingRight = lastDirection === 'right'; // Resume last direction

            let tractor = document.createElement("img");
            tractor.src = "images/tractor.png";
            tractor.id = "tractor";
            tractor.style.width = "50px";
            tractor.style.height = "50px";
            tractor.style.position = "absolute"; 
            tractor.style.display = "block";

            farmGrid.appendChild(tractor);

            // Set the initial position of the tractor (starting position for tillage)
            tractor.style.left = `${farmCells[currentRow * 7 + currentCol].offsetLeft}px`;
            tractor.style.top = `${farmCells[currentRow * 7 + currentCol].offsetTop}px`;

            function moveTractor() {
                if (currentRow >= 0 && isTillageInProgress) {
                    let targetCellIndex = currentRow * 7 + currentCol;
                    let targetCell = farmCells[targetCellIndex];

                    tractor.style.left = `${targetCell.offsetLeft}px`;
                    tractor.style.top = `${targetCell.offsetTop}px`;

                    console.log(`🚜 Moving Tractor → Row: ${currentRow}, Col: ${currentCol}`);

                    // Add 'tilled' class to mark cells as tilled only when tillage is in progress
                    if (!targetCell.classList.contains("tilled") && isTillageInProgress) {
                        targetCell.classList.add("tilled"); // Mark cell as tilled
                    }

                    // Move tractor in zigzag pattern (left-right and right-left)
                    if (movingRight) {
                        currentCol++;
                        if (currentCol >= 7) { // Reached the end of the row
                            currentCol = 6; // Set to last column
                            currentRow--; // Move up one row
                            movingRight = false; // Change direction
                        }
                    } else {
                        currentCol--;
                        if (currentCol < 0) { // Reached the start of the row
                            currentCol = 0; // Set to first column
                            currentRow--; // Move up one row
                            movingRight = true; // Change direction
                        }
                    }

                    // Save the position for next move
                    if (currentRow >= 0) {
                        lastRow = currentRow;
                        lastCol = currentCol;
                        lastDirection = movingRight ? 'right' : 'left';
                        setTimeout(moveTractor, 500);
                    } else {
                        console.log("✅ Tillage complete");
                        tractor.style.display = "none";
                        isTillageInProgress = false; // Mark tillage as completed
                        isTillageCompleted = true; // Mark tillage as complete
                        applyTillageBtn.textContent = "Apply Tillage"; // Reset button
                    }
                }
            }

            moveTractor();
        }
    }

    // Stop Tillage and ensure tractor disappears
    function stopTillage() {
        isTillageInProgress = false;
        console.log("🚜 Tillage stopped");
        applyTillageBtn.textContent = "Apply Tillage"; // Change button text back to Apply Tillage

        // Remove the tractor from the grid completely (not just hiding it)
        let tractor = document.getElementById("tractor");
        if (tractor) {
            tractor.remove(); // Remove tractor from the DOM entirely
        }
        console.log("No more tilling will happen.");
        
        // Save the tractor's current position (row and column where tillage was stopped)
        let farmCells = document.querySelectorAll(".farm-cell");
        lastRow = Math.floor(farmCells.findIndex(cell => cell.classList.contains("tilled")) / 7); // Find the row of the last tilled cell
        lastCol = farmCells.findIndex(cell => cell.classList.contains("tilled")) % 7; // Find the column of the last tilled cell
    }

    applyTillageBtn.addEventListener("click", startTillage);

   // Global queue to track harvest-ready crops in order
   let harvestQueue = [];

// Function to grow crops (only on tilled cells)
function growCrops() {
    let cells = document.querySelectorAll(".farm-cell");

    // Find the first tilled cell
    let tilledCell = Array.from(cells).find(cell => 
        cell.classList.contains("tilled") && parseInt(cell.dataset.cropCount) < 4
    );

    if (!tilledCell) {
        alert("All cells are full or no tilled cells left. Please apply tillage to a cell first.");
        return; // Stop if no tilled cell is available for planting
    }

    let cropCount = parseInt(tilledCell.dataset.cropCount);

    if (cropCount < 4) {
        let cropsToAdd = 2;

        for (let i = 0; i < cropsToAdd; i++) {
            let crop = document.createElement("img");
            crop.src = "images/crop.png";
            crop.classList.add("crop", "small-crop"); // Start small

            let positions = [
                { left: "5px", top: "5px" },
                { left: "30px", top: "5px" },
                { left: "5px", top: "30px" },
                { left: "30px", top: "30px" }
            ];

            crop.style.position = "absolute";
            crop.style.left = positions[cropCount + i].left;
            crop.style.top = positions[cropCount + i].top;

            tilledCell.appendChild(crop);

            // Track the growth timestamp
            let growthTime = Date.now();
            harvestQueue.push({ crop, tilledCell, growthTime });

            // **Make the crop grow over 60 seconds**
            setTimeout(() => {
                crop.classList.remove("small-crop");
                crop.classList.add("full-grown-crop"); // Fully grown after 1 min

                // Check if all crops in this cell are mature, then mark it "harvest-ready"
                let maturedCrops = tilledCell.querySelectorAll(".full-grown-crop").length;
                if (maturedCrops >= 4) {
                    tilledCell.classList.add("harvest-ready");
                }
            }, 60000); // 60 seconds delay
        }

        tilledCell.dataset.cropCount = cropCount + 2;
    }
}

growCropsBtn.addEventListener("click", growCrops);

// Function to harvest crops one by one
function harvestCrops() {
    let matureCrops = harvestQueue.filter(({ crop }) => crop.classList.contains("full-grown-crop"));

    if (matureCrops.length === 0) {
        alert("No crops ready for harvest yet!");
        return;
    }

    let { crop, tilledCell } = matureCrops[0]; // Get the first fully grown crop
    let cropIndex = harvestQueue.findIndex(item => item.crop === crop);
    harvestQueue.splice(cropIndex, 1); // Remove from the queue

    crop.classList.add("harvested-crop"); // Apply movement animation

    setTimeout(() => {
        crop.remove(); // Remove crop after animation
        harvestedCrops++;
        cropCounter.textContent = harvestedCrops; // Update crop counter

        let remainingCrops = tilledCell.querySelectorAll(".crop").length;
        if (remainingCrops === 0) {
            tilledCell.classList.remove("harvest-ready");
            tilledCell.dataset.cropCount = "0";
        }
    }, 1000); // Delay for visual movement
}

harvestCropsBtn.addEventListener("click", harvestCrops);


// Irrigation Functionality with Gradual Color Change
function irrigateField() {
    console.log("💦 Irrigation applied to all farm cells.");

    // Apply irrigation effect (turn blue)
    farmCells.forEach((cell, index) => {
        cell.classList.add("irrigated");

         // ✅ Increase moisture level in the data array
        moistureLevels[index] = Math.min(100, moistureLevels[index] + 20); 

        // ✅ Update the visual representation in both farm grid and moisture map
        updateMoistureCell(cell, moistureLevels[index], true);
    });

    createMoistureMap(); // ✅ Force update of the moisture map

    // ✅ Trigger water animation on pipelines
    let pipelines = document.querySelectorAll(".pipeline");
    pipelines.forEach(pipeline => {
        let waterFlow = document.createElement("div");
        waterFlow.classList.add("water-flow");
        pipeline.appendChild(waterFlow);
        
        // Pipeline: Remove water flow animation after 1 seconds
        setTimeout(() => {
            if (waterFlow && waterFlow.parentNode) {
                waterFlow.remove();
            }
        }, 1000);        
    }, 100); // Small delay to ensure animation applies after map update to prevent glitches to prevent soil moisture changes

    // ✅ Prevent evaporation for 15 seconds to let moisture remain
    clearTimeout(evaporationTimeout); // Stop existing evaporation cycle
    setTimeout(() => {
        console.log("🔥 Restarting evaporation after irrigation.");
        applyEvaporation(); // makes sure moisture starts decreasing again, so the blue effect disappears naturally, since previous set timeout may be overridden
    }, 15000);

    // **Farm Cells: Remove irrigation effect after 1.5 seconds**
    setTimeout(() => {
        farmCells.forEach(cell => {
            cell.classList.remove("irrigated"); // Force remove the irrigation effect (previous if function not removing irrigation effect)
            cell.classList.add("drying-back"); // Smooth transition back
        });
        console.log("⏳ Irrigation effect removed properly.");
    }, 1500);
}

irrigateFieldBtn.addEventListener("click", irrigateField);



// Raindrop animation effect
function startRainfall() {
    let farm = document.getElementById("farm-grid");
    let farmCells = document.querySelectorAll(".farm-cell");
    
    forecastText.textContent = "🌧️ It's raining! Soil is being irrigated.";

    rainCountdown = 300; // ✅ Reset countdown immediately

    for (let i = 0; i < 80; i++) {  // Create 50 raindrops
        let drop = document.createElement("div");
        drop.classList.add("rain-drop");

        // Random position for raindrop
        let xPos = Math.random() * farm.offsetWidth;
        let yPos = Math.random() * farm.offsetHeight;
        drop.style.left = `${xPos}px`;
        drop.style.top = `-10px`; // Start slightly above the farm

        farm.appendChild(drop);

        // Animate the raindrop falling
        drop.animate([
            { transform: `translateY(0px)`, opacity: 1 },
            { transform: `translateY(${yPos}px)`, opacity: 0.8 },
            { transform: `translateY(${yPos + 20}px)`, opacity: 0 }
        ], { duration: 1000 });

        // Remove raindrop after animation
        setTimeout(() => { drop.remove(); }, 1000);

        // Determine which cell the raindrop lands on
        let col = Math.floor((xPos / farm.offsetWidth) * 7);
        let row = Math.floor((yPos / farm.offsetHeight) * 7);
        let targetIndex = row * 7 + col;

        if (targetIndex >= 0 && targetIndex < farmCells.length) {
            let targetCell = farmCells[targetIndex];
            targetCell.classList.add("rain-irrigated"); // ✅ Apply rain effect
            // ✅ Remove rain effect after 10 seconds
            setTimeout(() => {
                targetCell.classList.remove("rain-irrigated");
            }, 10000);
        }
    }
 // ✅ Clear forecast after rain stops
 setTimeout(() => { forecastText.textContent = ""; }, 10000);
}

});
