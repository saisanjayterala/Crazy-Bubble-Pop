const maze = document.getElementById('maze');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const powerupIndicator = document.getElementById('powerup-indicator');
const levelElement = document.getElementById('level');

const mazeSize = 10;
const cellSize = maze.clientWidth / mazeSize;
let mazeGrid = [];
let playerPosition = { x: 0, y: 0 };
let score = 0;
let timeLeft = 60;
let gameInterval;
let powerupActive = false;
let enemies = [];
let level = 1;
let gameActive = false;

function generateMaze() {
    mazeGrid = [];
    for (let y = 0; y < mazeSize; y++) {
        mazeGrid[y] = [];
        for (let x = 0; x < mazeSize; x++) {
            mazeGrid[y][x] = Math.random() < 0.3 ? 1 : 0;
        }
    }
    mazeGrid[0][0] = 0; // Ensure start is clear
    mazeGrid[mazeSize - 1][mazeSize - 1] = 0; // Ensure end is clear
    
    // Create a path from start to end
    let currentX = 0;
    let currentY = 0;
    while (currentX !== mazeSize - 1 || currentY !== mazeSize - 1) {
        if (currentX < mazeSize - 1 && Math.random() < 0.5) {
            currentX++;
        } else if (currentY < mazeSize - 1) {
            currentY++;
        }
        mazeGrid[currentY][currentX] = 0;
    }
}

function renderMaze() {
    maze.innerHTML = '';
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (mazeGrid[y][x] === 1) {
                const wall = document.createElement('div');
                wall.className = 'wall';
                wall.style.width = `${cellSize}px`;
                wall.style.height = `${cellSize}px`;
                wall.style.left = `${x * cellSize}px`;
                wall.style.top = `${y * cellSize}px`;
                maze.appendChild(wall);
            }
        }
    }
}

function placePlayer() {
    playerPosition = { x: 0, y: 0 };
    updatePlayerPosition();
}

function updatePlayerPosition() {
    player.style.left = `${playerPosition.x * cellSize + maze.offsetLeft}px`;
    player.style.top = `${playerPosition.y * cellSize + maze.offsetTop}px`;
}

function movePlayer(dx, dy) {
    if (!gameActive) return;
    
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && mazeGrid[newY][newX] === 0) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        updatePlayerPosition();
        checkCollisions();
        checkWin();
    }
}

function checkWin() {
    if (playerPosition.x === mazeSize - 1 && playerPosition.y === mazeSize - 1) {
        score += 10 * level;
        level++;
        updateScore();
        updateLevel();
        generateMaze();
        renderMaze();
        placePlayer();
        placePowerup();
        spawnEnemies();
        displayLevelUpMessage();
    }
}

function displayLevelUpMessage() {
    const message = document.createElement('div');
    message.textContent = `Level ${level}!`;
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '48px';
    message.style.color = '#0ff';
    message.style.textShadow = '0 0 10px #0ff';
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.removeChild(message);
    }, 2000);
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateLevel() {
    levelElement.textContent = level;
}

function updateTimer() {
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

function startGame() {
    score = 0;
    timeLeft = 60;
    level = 1;
    gameActive = true;
    updateScore();
    updateTimer();
    updateLevel();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    generateMaze();
    renderMaze();
    placePlayer();
    placePowerup();
    spawnEnemies();
    gameInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        moveEnemies();
    }, 1000);
    document.addEventListener('keydown', handleKeyPress);
}

function endGame() {
    clearInterval(gameInterval);
    document.removeEventListener('keydown', handleKeyPress);
    gameActive = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
}

function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
}

function placePowerup() {
    const existingPowerup = document.querySelector('.powerup');
    if (existingPowerup) {
        maze.removeChild(existingPowerup);
    }

    const powerup = document.createElement('div');
    powerup.className = 'powerup';
    let x, y;
    do {
        x = Math.floor(Math.random() * mazeSize);
        y = Math.floor(Math.random() * mazeSize);
    } while (mazeGrid[y][x] === 1 || (x === playerPosition.x && y === playerPosition.y));

    powerup.style.left = `${x * cellSize + maze.offsetLeft}px`;
    powerup.style.top = `${y * cellSize + maze.offsetTop}px`;
    maze.appendChild(powerup);

    powerup.addEventListener('click', () => {
        activatePowerup();
        maze.removeChild(powerup);
    });
}

function activatePowerup() {
    powerupActive = true;
    powerupIndicator.classList.remove('hidden');
    player.style.boxShadow = '0 0 20px #ff0, 0 0 40px #ff0';
    setTimeout(() => {
        powerupActive = false;
        powerupIndicator.classList.add('hidden');
        player.style.boxShadow = '0 0 10px #f0f, 0 0 20px #f0f';
    }, 5000);
}

function spawnEnemies() {
    enemies.forEach(enemy => maze.removeChild(enemy.element));
    enemies = [];
    const numEnemies = Math.min(level, 5);
    for (let i = 0; i < numEnemies; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * mazeSize);
            y = Math.floor(Math.random() * mazeSize);
        } while (mazeGrid[y][x] === 1 || (x === playerPosition.x && y === playerPosition.y));

        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.width = `${cellSize * 0.8}px`;
        enemy.style.height = `${cellSize * 0.8}px`;
        enemy.style.left = `${x * cellSize + maze.offsetLeft + cellSize * 0.1}px`;
        enemy.style.top = `${y * cellSize + maze.offsetTop + cellSize * 0.1}px`;
        maze.appendChild(enemy);

        enemies.push({ x, y, element: enemy });
    }
}

function moveEnemies() {
    enemies.forEach(enemy => {
        const directions = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 }
        ];

        const validMoves = directions.filter(dir => {
            const newX = enemy.x + dir.dx;
            const newY = enemy.y + dir.dy;
            return newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && mazeGrid[newY][newX] === 0;
        });

        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            enemy.x += move.dx;
            enemy.y += move.dy;

            enemy.element.style.left = `${enemy.x * cellSize + maze.offsetLeft + cellSize * 0.1}px`;
            enemy.element.style.top = `${enemy.y * cellSize + maze.offsetTop + cellSize * 0.1}px`;
        }
    });

    checkCollisions();
}

function checkCollisions() {
    enemies.forEach(enemy => {
        if (enemy.x === playerPosition.x && enemy.y === playerPosition.y) {
            if (powerupActive) {
                // Remove the enemy
                maze.removeChild(enemy.element);
                enemies = enemies.filter(e => e !== enemy);
                score += 5;
                updateScore();
            } else {
                endGame();
            }
        }
    });
}

function animateWalls() {
    const walls = document.querySelectorAll('.wall');
    walls.forEach(wall => {
        wall.animate([
            { boxShadow: '0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff' },
            { boxShadow: '0 0 15px #0ff, 0 0 25px #0ff, 0 0 35px #0ff' },
            { boxShadow: '0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff' }
        ], {
            duration: 2000,
            iterations: Infinity
        });
    });
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initial setup
maze.style.width = `${mazeSize * cellSize}px`;
maze.style.height = `${mazeSize * cellSize}px`;

// Call animateWalls after rendering the maze
renderMaze();
animateWalls();