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
const highScoreElement = document.getElementById('high-score');

const mazeSize = 12; // Increased maze size
const cellSize = maze.clientWidth / mazeSize;
let mazeGrid = [];
let playerPosition = { x: 0, y: 0 };
let score = 0;
let timeLeft = 90; // Increased starting time
let gameInterval;
let powerupActive = false;
let enemies = [];
let level = 1;
let gameActive = false;
let highScore = 0;
let collectibles = [];
let powerups = [];
let lives = 3;

const powerupTypes = ['speed', 'invincibility', 'timeboost'];

function generateMaze() {
    mazeGrid = [];
    for (let y = 0; y < mazeSize; y++) {
        mazeGrid[y] = [];
        for (let x = 0; x < mazeSize; x++) {
            mazeGrid[y][x] = Math.random() < 0.25 ? 1 : 0; // Adjusted wall probability
        }
    }
    mazeGrid[0][0] = 0;
    mazeGrid[mazeSize - 1][mazeSize - 1] = 0;
    
    let currentX = 0;
    let currentY = 0;
    while (currentX !== mazeSize - 1 || currentY !== mazeSize - 1) {
        if (currentX < mazeSize - 1 && Math.random() < 0.6) {
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
        checkCollectibles();
        checkPowerups();
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
        placeCollectibles();
        placePowerups();
        spawnEnemies();
        displayLevelUpMessage();
        increaseDifficulty();
    }
}

function increaseDifficulty() {
    timeLeft = Math.max(30, 90 - (level * 5)); // Reduce time as levels progress
    enemies = enemies.filter(enemy => Math.random() < 0.7); // Remove some enemies
    spawnEnemies(); // Add new enemies
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
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('highScore', highScore);
    }
}

function updateLevel() {
    levelElement.textContent = level;
}

function updateTimer() {
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        loseLife();
    }
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        endGame();
    } else {
        timeLeft = 90;
        placePlayer();
        displayMessage(`Lives left: ${lives}`, '#f00');
    }
}

function startGame() {
    score = 0;
    timeLeft = 90;
    level = 1;
    lives = 3;
    gameActive = true;
    updateScore();
    updateTimer();
    updateLevel();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    generateMaze();
    renderMaze();
    placePlayer();
    placeCollectibles();
    placePowerups();
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
    const moveSpeed = powerupActive && activePowerup === 'speed' ? 2 : 1;
    switch(e.key) {
        case 'ArrowUp': movePlayer(0, -moveSpeed); break;
        case 'ArrowDown': movePlayer(0, moveSpeed); break;
        case 'ArrowLeft': movePlayer(-moveSpeed, 0); break;
        case 'ArrowRight': movePlayer(moveSpeed, 0); break;
    }
}

function placeCollectibles() {
    collectibles = [];
    for (let i = 0; i < 5; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * mazeSize);
            y = Math.floor(Math.random() * mazeSize);
        } while (mazeGrid[y][x] === 1 || (x === playerPosition.x && y === playerPosition.y));

        const collectible = document.createElement('div');
        collectible.className = 'collectible';
        collectible.style.left = `${x * cellSize + maze.offsetLeft}px`;
        collectible.style.top = `${y * cellSize + maze.offsetTop}px`;
        maze.appendChild(collectible);
        collectibles.push({ x, y, element: collectible });
    }
}

function checkCollectibles() {
    collectibles.forEach((collectible, index) => {
        if (collectible.x === playerPosition.x && collectible.y === playerPosition.y) {
            maze.removeChild(collectible.element);
            collectibles.splice(index, 1);
            score += 5;
            updateScore();
            displayMessage('+5 points!', '#0f0');
        }
    });
}

function placePowerups() {
    powerups = [];
    for (let i = 0; i < 2; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * mazeSize);
            y = Math.floor(Math.random() * mazeSize);
        } while (mazeGrid[y][x] === 1 || (x === playerPosition.x && y === playerPosition.y));

        const powerup = document.createElement('div');
        powerup.className = 'powerup';
        powerup.style.left = `${x * cellSize + maze.offsetLeft}px`;
        powerup.style.top = `${y * cellSize + maze.offsetTop}px`;
        maze.appendChild(powerup);
        powerups.push({ x, y, element: powerup, type: powerupTypes[Math.floor(Math.random() * powerupTypes.length)] });
    }
}

function checkPowerups() {
    powerups.forEach((powerup, index) => {
        if (powerup.x === playerPosition.x && powerup.y === playerPosition.y) {
            activatePowerup(powerup.type);
            maze.removeChild(powerup.element);
            powerups.splice(index, 1);
        }
    });
}

let activePowerup = null;

function activatePowerup(type) {
    powerupActive = true;
    activePowerup = type;
    powerupIndicator.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} active!`;
    powerupIndicator.classList.remove('hidden');
    player.classList.add(type);

    switch (type) {
        case 'speed':
            // Speed boost handled in movePlayer function
            break;
        case 'invincibility':
            player.style.boxShadow = '0 0 20px #ff0, 0 0 40px #ff0';
            break;
        case 'timeboost':
            timeLeft += 15;
            updateTimer();
            break;
    }

    setTimeout(() => {
        powerupActive = false;
        activePowerup = null;
        powerupIndicator.classList.add('hidden');
        player.classList.remove(type);
        player.style.boxShadow = '0 0 10px #f0f, 0 0 20px #f0f';
    }, 10000);
}

function spawnEnemies() {
    enemies.forEach(enemy => maze.removeChild(enemy.element));
    enemies = [];
    const numEnemies = Math.min(level + 2, 8);
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
            if (powerupActive && activePowerup === 'invincibility') {
                // Remove the enemy
                maze.removeChild(enemy.element);
                enemies = enemies.filter(e => e !== enemy);
                score += 5;
                updateScore();
                displayMessage('+5 points!', '#0f0');
            } else {
                loseLife();
            }
        }
    });
}

function displayMessage(text, color) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'absolute';
    message.style.top = '20%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '24px';
    message.style.color = color;
    message.style.textShadow = `0 0 10px ${color}`;
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.removeChild(message);
    }, 1500);
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

highScoreElement.textContent = highScore;

// Add touch controls for mobile devices
let touchStartX = 0;
let touchStartY = 0;

maze.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

maze.addEventListener('touchend', function(e) {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        movePlayer(dx > 0 ? 1 : -1, 0);
    } else {
        movePlayer(0, dy > 0 ? 1 : -1);
    }
}, false);

// Add a pause function
let isPaused = false;
const pauseButton = document.createElement('button');
pauseButton.textContent = 'Pause';
pauseButton.style.position = 'absolute';
pauseButton.style.top = '10px';
pauseButton.style.left = '50%';
pauseButton.style.transform = 'translateX(-50%)';
document.body.appendChild(pauseButton);

pauseButton.addEventListener('click', togglePause);

function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    if (isPaused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(() => {
            timeLeft--;
            updateTimer();
            moveEnemies();
        }, 1000);
    }
}

// Add sound effects
const collectSound = new Audio('collect.mp3');
const powerupSound = new Audio('powerup.mp3');
const enemyHitSound = new Audio('enemy-hit.mp3');
const levelUpSound = new Audio('level-up.mp3');

function playSoundEffect(sound) {
    sound.currentTime = 0;
    sound.play();
}

// Modify relevant functions to include sound effects
function checkCollectibles() {
    collectibles.forEach((collectible, index) => {
        if (collectible.x === playerPosition.x && collectible.y === playerPosition.y) {
            maze.removeChild(collectible.element);
            collectibles.splice(index, 1);
            score += 5;
            updateScore();
            displayMessage('+5 points!', '#0f0');
            playSoundEffect(collectSound);
        }
    });
}


function checkCollisions() {
    enemies.forEach(enemy => {
        if (enemy.x === playerPosition.x && enemy.y === playerPosition.y) {
            if (powerupActive && activePowerup === 'invincibility') {
                maze.removeChild(enemy.element);
                enemies = enemies.filter(e => e !== enemy);
                score += 5;
                updateScore();
                displayMessage('+5 points!', '#0f0');
                playSoundEffect(enemyHitSound);
            } else {
                loseLife();
                playSoundEffect(enemyHitSound);
            }
        }
    });
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
        placeCollectibles();
        placePowerups();
        spawnEnemies();
        displayLevelUpMessage();
        increaseDifficulty();
        playSoundEffect(levelUpSound);
    }
}

// Add a minimap
const minimap = document.createElement('div');
minimap.id = 'minimap';
minimap.style.position = 'absolute';
minimap.style.top = '10px';
minimap.style.right = '10px';
minimap.style.width = '100px';
minimap.style.height = '100px';
minimap.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
minimap.style.border = '2px solid #0ff';
document.body.appendChild(minimap);

function updateMinimap() {
    minimap.innerHTML = '';
    const cellSize = 100 / mazeSize;
    
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            const cell = document.createElement('div');
            cell.style.position = 'absolute';
            cell.style.left = `${x * cellSize}px`;
            cell.style.top = `${y * cellSize}px`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            
            if (x === playerPosition.x && y === playerPosition.y) {
                cell.style.backgroundColor = '#f0f';
            } else if (mazeGrid[y][x] === 1) {
                cell.style.backgroundColor = '#0ff';
            }
            
            minimap.appendChild(cell);
        }
    }
}

// Modify the movePlayer function to update the minimap
function movePlayer(dx, dy) {
    if (!gameActive || isPaused) return;
    
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && mazeGrid[newY][newX] === 0) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        updatePlayerPosition();
        checkCollisions();
        checkCollectibles();
        checkPowerups();
        checkWin();
        updateMinimap();
    }
}

// Add a tutorial screen
const tutorialScreen = document.createElement('div');
tutorialScreen.id = 'tutorial-screen';
tutorialScreen.style.position = 'absolute';
tutorialScreen.style.top = '0';
tutorialScreen.style.left = '0';
tutorialScreen.style.width = '100%';
tutorialScreen.style.height = '100%';
tutorialScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
tutorialScreen.style.display = 'flex';
tutorialScreen.style.flexDirection = 'column';
tutorialScreen.style.justifyContent = 'center';
tutorialScreen.style.alignItems = 'center';
tutorialScreen.style.color = '#fff';
tutorialScreen.style.zIndex = '100';
tutorialScreen.innerHTML = `
    <h2>How to Play</h2>
    <p>Use arrow keys or swipe to move</p>
    <p>Collect coins for points</p>
    <p>Grab power-ups for special abilities</p>
    <p>Avoid enemies and reach the exit</p>
    <button id="close-tutorial">Start Game</button>
`;
document.body.appendChild(tutorialScreen);

document.getElementById('close-tutorial').addEventListener('click', () => {
    tutorialScreen.style.display = 'none';
    startGame();
});

// Modify the startGame function to show the tutorial first
startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    tutorialScreen.style.display = 'flex';
});

// Call these functions to set up the game
renderMaze();
animateWalls();
updateMinimap();