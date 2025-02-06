document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");
    const startButton = document.getElementById("start-btn");

    const farmGrid = document.getElementById("farm-grid");
    const applyTillageBtn = document.getElementById("tillage-btn");
    const growCropsBtn = document.getElementById("grow-crop-btn");
    const irrigateFieldBtn = document.getElementById("irrigation-btn");

    let isTillageInProgress = false; // Track tillage status
    let isTillageCompleted = false; // Flag for tillage completion
    let lastRow = 6; // Last row where tractor stopped (starts from bottom-left)
    let lastCol = 0; // Last column where tractor stopped (starts from bottom-left)
    let lastDirection = 'right'; // Direction of tractor movement ('right' or 'left')

    // Start Game
    startButton.addEventListener("click", function () {
        console.log("Game started!");
        startScreen.style.display = "none";
        gameContainer.style.display = "flex";
        createFarmGrid();
    });

    // Create farm grid and pipeline
    function createFarmGrid() {
        farmGrid.innerHTML = "";
        for (let i = 0; i < 7 * 7; i++) {
            let cell = document.createElement("div");
            cell.classList.add("farm-cell");
            cell.dataset.cropCount = 0; // Track the number of crops per cell
            farmGrid.appendChild(cell);
        }
        createPipeline(); // Create pipeline across rows
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

    // Function to grow crops (only on tilled cells)
    function growCrops() {
        let cells = document.querySelectorAll(".farm-cell");

        // Find the first tilled cell
        let tilledCell = Array.from(cells).find(cell => cell.classList.contains("tilled") && parseInt(cell.dataset.cropCount) < 4);

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
                crop.classList.add("crop");

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
            }

            tilledCell.dataset.cropCount = cropCount + 2;

            if (parseInt(tilledCell.dataset.cropCount) >= 4) {
                tilledCell.classList.add("full");
                tilledCell.style.background = "yellow"; // Change color to yellow after 4 crops
            }
        }
    }

    growCropsBtn.addEventListener("click", growCrops);

    // Irrigation Functionality
    function irrigateField() {
        let pipelines = document.querySelectorAll(".pipeline");
        let farmCells = document.querySelectorAll(".farm-cell");

        pipelines.forEach((pipeline, index) => {
            let waterFlow = document.createElement("div");
            waterFlow.classList.add("water-flow");
            pipeline.appendChild(waterFlow);

            let startCellIndex = index * 7;
            for (let i = startCellIndex; i < startCellIndex + 7; i++) {
                let cell = farmCells[i];
                if (!cell.classList.contains("irrigated")) {
                    cell.classList.add("irrigated");
                }
            }
        });
    }

    irrigateFieldBtn.addEventListener("click", irrigateField);
});
