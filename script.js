document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM fully loaded. Initializing game...");

    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");
    const startBtn = document.getElementById("start-btn");
    const farmGrid = document.getElementById("farm-grid");
    const soilCanvas = document.getElementById("soil-canvas");
    const ctx = soilCanvas.getContext("2d");
    const tractor = document.getElementById("tractor");

    const tillageBtn = document.getElementById("tillage-btn");
    const irrigationBtn = document.getElementById("irrigation-btn");
    const plasticBtn = document.getElementById("plastic-btn");
    const growCropBtn = document.getElementById("grow-crop-btn");

    const gridSize = 7;
    let tractorRow = gridSize - 1;
    let tractorCol = 0;
    let movingRight = true;

    // Start game function
    startBtn.addEventListener("click", function () {
        startScreen.style.display = "none";
        gameContainer.style.display = "flex";
        initializeFarmGrid();
        drawSoilLayers();
    });

    // Initialize Farm Grid (Top-Down View)
    function initializeFarmGrid() {
        farmGrid.innerHTML = "";
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                let cell = document.createElement("div");
                cell.classList.add("farm-cell");
                cell.dataset.row = i;
                cell.dataset.col = j;
                farmGrid.appendChild(cell);
            }
        }
        positionTractor();
    }

    // Position Tractor in Grid
    function positionTractor() {
        tractor.style.top = `${tractorRow * 60}px`;
        tractor.style.left = `${tractorCol * 60}px`;
    }

    // Move Tractor Across Grid (One Full Run)
    function moveTractor() {
        let interval = setInterval(() => {
            if (movingRight) {
                if (tractorCol < gridSize - 1) {
                    tractorCol++;
                } else {
                    tractorRow--;
                    movingRight = false;
                }
            } else {
                if (tractorCol > 0) {
                    tractorCol--;
                } else {
                    tractorRow--;
                    movingRight = true;
                }
            }

            positionTractor();

            if (tractorRow < 0) {
                clearInterval(interval); // Stop movement after full loop
                console.log("🚜 Tillage complete!");
            }
        }, 500);
    }

    // Function to Draw Soil Layers with JPEG Background
    function drawSoilLayers() {
        const img = new Image();
        img.src = "images/soil.jpg";
        img.onload = function () {
            const layerHeight = soilCanvas.height / 3;
            for (let i = 0; i < 3; i++) {
                ctx.drawImage(img, 0, i * layerHeight, soilCanvas.width, layerHeight);
            }
        };
    }

    // Actions - Modify Soil Profile
    tillageBtn.addEventListener("click", function () {
        console.log("🔄 Tillage applied!");
        moveTractor();
    });

    irrigationBtn.addEventListener("click", function () {
        console.log("💧 Irrigation applied!");
    });

    plasticBtn.addEventListener("click", function () {
        console.log("♻️ Plastic mulch applied!");
    });

    growCropBtn.addEventListener("click", function () {
        console.log("🌾 Crops growing!");
    });
});
