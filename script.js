const gameArea = document.getElementById('game-area');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');

let score = 0;
let timeLeft = 60;
let gameInterval;
let bubbles = [];

function startGame() {
    score = 0;
    timeLeft = 60;
    updateScore();
    updateTimer();
    startButton.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameInterval = setInterval(gameLoop, 1000);
    createBubble();
}

function gameLoop() {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
        endGame();
    } else {
        if (Math.random() < 0.3) {
            createBubble();
        }
    }
}

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const size = Math.random() * 60 + 20;
    const x = Math.random() * (gameArea.clientWidth - size);
    const y = Math.random() * (gameArea.clientHeight - size);
    
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.backgroundColor = getRandomColor();
    
    bubble.addEventListener('click', () => popBubble(bubble));
    
    gameArea.appendChild(bubble);
    bubbles.push(bubble);
    
    animateBubble(bubble);
}

function animateBubble(bubble) {
    const duration = Math.random() * 5000 + 3000;
    const xMove = Math.random() * 200 - 100;
    const yMove = Math.random() * 200 - 100;
    
    bubble.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${xMove}px, ${yMove}px)` }
    ], {
        duration: duration,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
    });
}

function popBubble(bubble) {
    score++;
    updateScore();
    gameArea.removeChild(bubble);
    bubbles = bubbles.filter(b => b !== bubble);
    createPopAnimation(bubble);
    
    if (score % 10 === 0) {
        createSpecialBubble();
    }
}

function createPopAnimation(bubble) {
    const rect = bubble.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = bubble.style.backgroundColor;
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        const xVelocity = Math.cos(angle) * speed;
        const yVelocity = Math.sin(angle) * speed;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${xVelocity}px, ${yVelocity}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => gameArea.removeChild(particle);
        
        gameArea.appendChild(particle);
    }
}

function createSpecialBubble() {
    const specialBubble = document.createElement('div');
    specialBubble.classList.add('bubble', 'special');
    const size = 80;
    const x = Math.random() * (gameArea.clientWidth - size);
    const y = Math.random() * (gameArea.clientHeight - size);
    
    specialBubble.style.width = `${size}px`;
    specialBubble.style.height = `${size}px`;
    specialBubble.style.left = `${x}px`;
    specialBubble.style.top = `${y}px`;
    specialBubble.style.backgroundColor = 'gold';
    specialBubble.style.boxShadow = '0 0 10px gold';
    
    specialBubble.addEventListener('click', () => popSpecialBubble(specialBubble));
    
    gameArea.appendChild(specialBubble);
    bubbles.push(specialBubble);
    
    animateSpecialBubble(specialBubble);
}

function animateSpecialBubble(bubble) {
    bubble.animate([
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(1.2) rotate(360deg)' },
        { transform: 'scale(1) rotate(720deg)' }
    ], {
        duration: 3000,
        iterations: Infinity
    });
}

function popSpecialBubble(bubble) {
    score += 5;
    updateScore();
    gameArea.removeChild(bubble);
    bubbles = bubbles.filter(b => b !== bubble);
    createSpecialPopAnimation(bubble);
    shakeScreen();
}

function createSpecialPopAnimation(bubble) {
    const rect = bubble.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '15px';
        particle.style.height = '15px';
        particle.style.backgroundColor = getRandomColor();
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 100;
        const xVelocity = Math.cos(angle) * speed;
        const yVelocity = Math.sin(angle) * speed;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
            { transform: `translate(${xVelocity}px, ${yVelocity}px) scale(0) rotate(720deg)`, opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => gameArea.removeChild(particle);
        
        gameArea.appendChild(particle);
    }
}

function shakeScreen() {
    gameArea.animate([
        { transform: 'translate(0, 0)' },
        { transform: 'translate(-5px, -5px)' },
        { transform: 'translate(5px, 5px)' },
        { transform: 'translate(-5px, 5px)' },
        { transform: 'translate(5px, -5px)' },
        { transform: 'translate(0, 0)' }
    ], {
        duration: 500,
        iterations: 1
    });
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 50%)`;
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateTimer() {
    timerElement.textContent = timeLeft;
}

function endGame() {
    clearInterval(gameInterval);
    bubbles.forEach(bubble => gameArea.removeChild(bubble));
    bubbles = [];
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);