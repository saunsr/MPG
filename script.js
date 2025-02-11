document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

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

    const soilTypes = ["sandy", "clay", "loam"];
    const farmCells = [];

    let isTillageInProgress = false; // Track tillage status
    let isTillageCompleted = false; // Flag for tillage completion
    let lastRow = 6; // Last row where tractor stopped (starts from bottom-left)
    let lastCol = 0; // Last column where tractor stopped (starts from bottom-left)
    let lastDirection = 'right'; // Direction of tractor movement ('right' or 'left')
    let harvestedCrops = 0; // Track harvested crops

    // Start Game
    startButton.addEventListener("click", function () {
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
    }

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
        function setupWeatherSystem() {
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
                rainCountdown--;
        
                if (rainCountdown === 180) { // Drought hint
                    if (Math.random() * 100 < droughtChance) {
                        applyDroughtHint();
                        forecastText.textContent = "⚠️ Dry spell approaching! Soil losing moisture.";
                    }
                }
        
                if (rainCountdown === 300) {
                    let weatherEvent = determineWeatherEvent();
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
        }



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
    let farmCells = document.querySelectorAll(".farm-cell");

    // Apply irrigation effect (turn blue)
    farmCells.forEach(cell => {
        cell.classList.add("irrigated");
    });

    let pipelines = document.querySelectorAll(".pipeline");
    pipelines.forEach(pipeline => {
        let waterFlow = document.createElement("div");
        waterFlow.classList.add("water-flow");
        pipeline.appendChild(waterFlow);
        
        // Pipeline: Remove water flow animation after 1 seconds
        setTimeout(() => {
            waterFlow.remove();
        }, 1000);
    });

    console.log("💦 Irrigation applied to all farm cells.");

    // **Farm Cells: Remove irrigation effect after 2.5 seconds**
    setTimeout(() => {
        farmCells.forEach(cell => {
            cell.classList.remove("irrigated"); 
            cell.classList.add("drying-back"); // class for smooth ease-out
        });
        console.log("⏳ Irrigation effect removed, transitioning back.");
    }, 2500);
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
            targetCell.classList.add("irrigated");
            targetCell.dataset.irrigated = "true";
        }
    }
 // ✅ Clear forecast after rain stops
 setTimeout(() => { forecastText.textContent = ""; }, 10000);
}

});
