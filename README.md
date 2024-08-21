# Neon Maze Runner

Neon Maze Runner is an exciting browser-based game where players navigate through a neon-lit maze, collecting points and power-ups while avoiding enemies.
![image](https://github.com/user-attachments/assets/4995fc7a-1f68-478f-9fee-aac02be2435c)

## Game Logic

### Maze Generation
- The maze is represented by a 2D array (`mazeGrid`).
- Walls are randomly generated with a 30% probability.
- A path from start to finish is always ensured.

### Player Movement
- The player starts at the top-left corner.
- Movement is controlled by arrow keys or touch swipes on mobile.
- The player can't move through walls.

### Collectibles and Power-ups
- Collectibles (coins) are randomly placed in the maze.
- Power-ups provide temporary abilities:
  - Speed: Increases movement speed.
  - Invincibility: Protects from enemies.
  - Time Boost: Adds extra time.
  - Magnet: Attracts nearby collectibles.

### Enemies
- Enemies move randomly through the maze.
- Contact with an enemy reduces the player's lives.
- The number of enemies increases with each level.

### Scoring and Progression
- Players score points by collecting coins and reaching the exit.
- Reaching the exit advances the player to the next level.
- The game becomes progressively harder with each level.

### Time Management
- Players have a limited time to complete each level.
- The time limit decreases as levels progress.

### Lives System
- Players start with 3 lives.
- Lives are lost upon enemy contact or when time runs out.
- The game ends when all lives are lost.

## Key Components

1. **Maze Rendering**: The `renderMaze()` function draws the maze based on the `mazeGrid`.

2. **Player Controls**: `handleKeyPress()` and touch event listeners manage player input.

3. **Game Loop**: `gameInterval` updates the game state, including enemy movement and time countdown.

4. **Collision Detection**: `checkCollisions()` handles interactions between the player, enemies, and collectibles.

5. **Power-up System**: `activatePowerup()` applies temporary effects based on the collected power-up.

6. **Level Progression**: `checkWin()` manages level completion and difficulty increase.

7. **UI Updates**: Functions like `updateScore()`, `updateTimer()`, and `updateLives()` keep the UI current.

8. **Minimap**: `updateMinimap()` provides a small-scale view of the entire maze.

9. **Settings and Tutorial**: Dynamically created UI elements for game customization and instructions.

## Advanced Features

- **Persistent High Score**: Stored in localStorage.
- **Sound Effects**: Various audio cues enhance the gaming experience.
- **Responsive Design**: The game adapts to different screen sizes.
- **Difficulty Settings**: Players can adjust the game's difficulty.

## Implementation Notes

- The game uses vanilla JavaScript without any external libraries.
- DOM manipulation is used for rendering game elements.
- CSS animations create the neon effect for walls and other elements.
- The game logic is modular, allowing for easy expansion and modification.

This README provides an overview of the game's core mechanics and structure, helping developers understand the codebase and potentially contribute to or modify the game.
