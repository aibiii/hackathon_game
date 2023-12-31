import CactiController from "./CactiController.js";
import Ground from "./Ground.js";
import Player from "./Player.js";
import Score from "./Score.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const backgroundImage = new Image();
backgroundImage.src = "images/background.png";

const GAME_SPEED_START = 1; // 1.0
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 80 / 1.5; //58
const PLAYER_HEIGHT = 130 / 1.5; //62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

const cactusImagePaths = [
  "images/cactus_1.png",
  "images/cactus_2.png",
  "images/cactus_3.png",
  "images/cactus_4.png",
  "images/cactus_5.png",
  "images/cactus_6.png",
  "images/cactus_7.png",
  "images/cactus_8.png",
  "images/cactus_9.png",
  "images/cactus_10.png",
  "images/cactus_11.png",
  "images/cactus_12.png",
  "images/cactus_13.png",
  "images/cactus_14.png"
];

const CACTI_CONFIG = [
  { width: 98 / 1.5, height: 100 / 1.5 },
  { width: 98 / 1.5, height: 100 / 1.5 },
  { width: 98 / 1.5, height: 90 / 1.5 },
  { width: 68 / 1.5, height: 60 / 1.5 },
  { width: 68 / 1.5, height: 60 / 1.5 },
  { width: 105 / 1.5, height: 110 / 1.5 }
];

//Game Objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

function getRandomCactusImagePath() {
  const randomIndex = Math.floor(Math.random() * cactusImagePaths.length);
  return cactusImagePaths[randomIndex];
}

const musicPaths = [
  "music/SZA.mp3",
  "music/ASAP.mp3",
  "music/BRUNO.mp3",
  // Add more music paths as needed
];

let currentMusicIndex = 0;

function createSprites() {
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    groundWidthInGame,
    groundHeightInGame,
    GROUND_AND_CACTUS_SPEED,
    scaleRatio
  );

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = getRandomCactusImagePath();
    return {
      image: image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(
    ctx,
    cactiImages,
    scaleRatio,
    GROUND_AND_CACTUS_SPEED
  );

  score = new Score(ctx, scaleRatio);
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}



setScreen();
//Use setTimeout on Safari mobile rotation otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const screenWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth
  );

  //window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "grey";
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText("GAME OVER", x, y);
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", reset, { once: true });
      window.addEventListener("touchstart", reset, { once: true });
    }, 1000);
  }
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  cactiController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
}

function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "grey";
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText("Tap Screen or Press Space To Start", x, y);
}

function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

function clearScreen() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }
  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameOver && !waitingToStart) {
    //Update game objects
    ground.update(gameSpeed, frameTimeDelta);
    cactiController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta);
    updateGameSpeed(frameTimeDelta);
  }

  if (!gameOver && !waitingToStart) {
    showStartGameText();
    window.addEventListener("keyup", function(event) {
      if (event.code === "Space") {
        const jumpSound = document.getElementById("jumpSound");
        jumpSound.currentTime = 0; // Rewind the sound to the beginning
        jumpSound.play();
      
        // Play the current milestone music
        const milestoneMusic = document.getElementById("milestoneMusic");
        milestoneMusic.src = musicPaths[currentMusicIndex];
        milestoneMusic.currentTime = 0; // Rewind the music to the beginning
        milestoneMusic.play();
      
        waitingToStart = false; // Set waitingToStart to false to start the game
      
        // Increment the music index for the next milestone
        currentMusicIndex = (currentMusicIndex + 1) % musicPaths.length;
      }
      
    }, { once: true });
  }
  

  

  if (!gameOver && cactiController.collideWith(player)) {
    gameOver = true;
    setupGameReset();
    score.setHighScore();
  }

  //Draw game objects
  ground.draw();
  cactiController.draw();
  player.draw();
  score.draw();

  if (gameOver) {
    showGameOver();
  }

  if (waitingToStart) {
    showStartGameText();
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

window.addEventListener("keyup", reset, { once: true });
window.addEventListener("touchstart", reset, { once: true });
