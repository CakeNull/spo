import * as Redux from './redux.browser.mjs';

let canvas;
let ctx;

let paddleX;

let rightPressed = false;
let leftPressed = false;

let ballX,ballY;

let dx = 2;
let dy = -2;

let score = 0;

const paddleHeight = 10;
const paddleWidth = 75;

const ballRadius = 10;

const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function tick() {
  ballX += dx;
  ballY += dy;

  if (ballRadius > ballX || ballX > canvas.width - ballRadius) dx = -dx;

  if (ballY + dy < ballRadius) {
    dy = -dy;
  } else if (ballY + dy > canvas.height - ballRadius) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      alert("    N  O  T    S  P  O    ");
      document.location.reload();
    }
  }

  if (rightPressed) {
    paddleX += 7;
    paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
  } else if (leftPressed) {
    paddleX -= 7;
    paddleX = Math.max(paddleX - 7, 0);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  collisionDetection();
  drawBricks();
  drawScore();

  tick();

  requestAnimationFrame(draw);
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key.toLowerCase() == "d") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key.toLowerCase() == "a") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key.toLowerCase() == "d") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key.toLowerCase() == "a") {
    leftPressed = false;
  } else {
    console.log(e.key);
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            alert("    S  P  O    ");
            document.location.reload();
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function leftButtonDownHandler(event) {
    leftPressed = true;
}

function leftButtonUpHandler(event) {
    leftPressed = false;
}

function rightButtonDownHandler(event) {
    rightPressed = true;
}

function rightButtonUpHandler(event) {
    rightPressed = false;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function start(c) {
    canvas = c;
    ctx = canvas.getContext("2d");

    paddleX = (canvas.width - paddleWidth) / 2;
    
    ballX = canvas.width / 2 + getRandomInt(canvas.width / 10) - canvas.width / 20;
    ballY = canvas.height / 2 + getRandomInt(canvas.width / 10) - canvas.width / 20;

    draw();
}

export {
    start,
    keyDownHandler,
    keyUpHandler,
    mouseMoveHandler,
    leftButtonDownHandler,
    leftButtonUpHandler,
    rightButtonDownHandler,
    rightButtonUpHandler
}