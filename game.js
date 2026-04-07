


// ================== CANVAS ==================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 30;
const CELL_SIZE = canvas.width / GRID_SIZE;

// ================== ELEMENTS ==================
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const finalScoreEl = document.getElementById("finalScore");

const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");

const startBtn = document.getElementById("startBtn");
const resumeBtn = document.getElementById("resumeBtn");
const overlayRestart = document.getElementById("overlayRestart");

// ================== STATE ==================
let state = {};
let lastTime = 0;
let gameStarted = false;

// ================== INIT ==================
function initGame() {
    state = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 1, y: 0 },
        food: null,
        score: 0,
        speed: 120,
        isGameOver: false,
        isPaused: false
    };

    state.food = randomFood();
}

// ================== GAME LOOP ==================
function gameLoop(time = 0) {
    const delta = time - lastTime;

    if (delta > state.speed) {
        if (!state.isPaused && !state.isGameOver && gameStarted) {
            update();
            render();
        }
        lastTime = time;
    }

    requestAnimationFrame(gameLoop);
}

// ================== UPDATE ==================
function update() {
    const head = {
        x: state.snake[0].x + state.direction.x,
        y: state.snake[0].y + state.direction.y
    };

    if (isCollision(head)) {
        state.isGameOver = true;

        const prevHigh = Number(localStorage.getItem("snakeHighScore")) || 0;
        updateHighScore();
        showOverlay("Game Over", "gameover");
        return;
    }

    state.snake.unshift(head);

    if (head.x === state.food.x && head.y === state.food.y) {
        state.score++;
        scoreEl.innerText = state.score;
        state.food = randomFood();
    } else {
        state.snake.pop();
    }
}

// ================== RENDER ==================
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#22c55e";
    state.snake.forEach((s) => {
        ctx.fillRect(
            s.x * CELL_SIZE,
            s.y * CELL_SIZE,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
        state.food.x * CELL_SIZE,
        state.food.y * CELL_SIZE,
        CELL_SIZE - 2,
        CELL_SIZE - 2
    );
}

// ================== HELPERS ==================
function isCollision(head) {
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= GRID_SIZE ||
        head.y >= GRID_SIZE
    ) return true;

    return state.snake.some(
        s => s.x === head.x && s.y === head.y
    );
}

function randomFood() {
    let food;
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (
        state.snake.some(s => s.x === food.x && s.y === food.y)
    );
    return food;
}

// ================== INPUT ==================
document.addEventListener("keydown", (e) => {
    const d = state.direction;

    if (e.key === "ArrowUp" && d.y === 0)
        state.direction = { x: 0, y: -1 };

    if (e.key === "ArrowDown" && d.y === 0)
        state.direction = { x: 0, y: 1 };

    if (e.key === "ArrowLeft" && d.x === 0)
        state.direction = { x: -1, y: 0 };

    if (e.key === "ArrowRight" && d.x === 0)
        state.direction = { x: 1, y: 0 };
});

// ================== OVERLAY CONTROL ==================
// ================== OVERLAY ==================
function showOverlay(text, type, prevHigh = 0) {
    overlay.classList.remove("hidden");

    // reset UI
    startBtn.classList.add("hidden");
    resumeBtn.classList.add("hidden");
    overlayRestart.classList.add("hidden");
    finalScoreEl.classList.add("hidden");

    if (type === "start") {
        overlayText.innerText = "Snake Game";
        startBtn.classList.remove("hidden");
    }

    if (type === "pause") {
        overlayText.innerText = "Paused";
        resumeBtn.classList.remove("hidden");
        overlayRestart.classList.remove("hidden");
    }

    if (type === "gameover") {
        overlayText.innerText = "Game Over";

        // ✅ Correct comparison
        if (state.score > prevHigh) {
            finalScoreEl.innerText = "🎉 New High Score! " + state.score;
        } else {
            finalScoreEl.innerText = "Your Score: " + state.score;
        }

        finalScoreEl.classList.remove("hidden");
        overlayRestart.classList.remove("hidden");
    }
}
// function showOverlay(text, type) {
//     overlay.classList.remove("hidden");
//     overlayText.innerText = text;

//     // Hide all first
//     startBtn.classList.add("hidden");
//     resumeBtn.classList.add("hidden");
//     overlayRestart.classList.add("hidden");

//     if (type === "start") {
//         startBtn.classList.remove("hidden");
//     }

//     if (type === "pause") {
//         resumeBtn.classList.remove("hidden");
//         overlayRestart.classList.remove("hidden");
//     }

//     if (type === "gameover") {
//         overlayRestart.classList.remove("hidden");
//     }
// }

function hideOverlay() {
    overlay.classList.add("hidden");
}

// ================== HIGH SCORE ==================
function updateHighScore() {
    const high = localStorage.getItem("snakeHighScore") || 0;

    if (state.score > high) {
        localStorage.setItem("snakeHighScore", state.score);
    }

    loadHighScore();
}

function loadHighScore() {
    highScoreEl.innerText =
        localStorage.getItem("snakeHighScore") || 0;
}

// ================== BUTTON EVENTS ==================
startBtn.addEventListener("click", () => {
    gameStarted = true;
    hideOverlay();
});

resumeBtn.addEventListener("click", () => {
    state.isPaused = false;
    hideOverlay();
});

overlayRestart.addEventListener("click", restartGame);

document.getElementById("restartBtn").addEventListener("click", restartGame);

document.getElementById("pauseBtn").addEventListener("click", () => {
    if (!gameStarted) return;

    state.isPaused = true;
    showOverlay("Paused", "pause");
});

// ================== RESTART ==================
function restartGame() {
    initGame();
    scoreEl.innerText = 0;
    gameStarted = true;
    hideOverlay();
}

// ================== START ==================
initGame();
loadHighScore();
render();
showOverlay("Snake Game", "start");
requestAnimationFrame(gameLoop);
