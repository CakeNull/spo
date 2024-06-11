import * as Redux from './redux.browser.mjs';

let store;

let canvas;
let ctx;

const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

function drawBricks(state) {
  for (let c = 0; c < state.bricks.length; c++) {
    for (let r = 0; r < state.bricks[c].length; r++) {
      const brick = state.bricks[c][r];
      if (brick.active) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawBall(state) {
  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, state.ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(state) {
  ctx.beginPath();
  ctx.rect(state.paddleX, canvas.height - state.paddleHeight, state.paddleWidth, state.paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key.toLowerCase() == "d") {
    store.dispatch({ type: 'RIGHT', payload: true });
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key.toLowerCase() == "a") {
    store.dispatch({ type: 'LEFT', payload: true });
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key.toLowerCase() == "d") {
    store.dispatch({ type: 'RIGHT', payload: false });
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key.toLowerCase() == "a") {
    store.dispatch({ type: 'LEFT', payload: false });
  } else {
    console.log(e.key);
  }
}

function drawScore(state) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Score: ${state.score}`, 8, 20);
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    store.dispatch({ type: 'PADDLE_MOUSE_MOVE', payload: relativeX });
  }
}

function leftButtonDownHandler(event) {
  store.dispatch({ type: 'LEFT', payload: true });
  event.preventDefault();
}

function leftButtonUpHandler(event) {
  store.dispatch({ type: 'LEFT', payload: false });
  event.preventDefault();
}

function rightButtonDownHandler(event) {
  store.dispatch({ type: 'RIGHT', payload: true });
  event.preventDefault();
}

function rightButtonUpHandler(event) {
  store.dispatch({ type: 'RIGHT', payload: false });
  event.preventDefault();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function counter(state, action) {

  // console.log({action, state});

  switch (action.type) {
    case 'TICK':
      return {
        ...state,
        ballX: state.ballX + state.dx,
        ballY: state.ballY + state.dy,
        paddleX: state.rightPressed ? Math.min(state.paddleX + 14, canvas.width - state.paddleWidth)
               : state.leftPressed  ? Math.max(state.paddleX - 7, 0)
               : state.paddleX
      }
    case 'LEFT':
      return {
        ...state,
        leftPressed: action.payload
      };
    case 'RIGHT':
      return {
        ...state,
        rightPressed: action.payload
      };
    case 'PADDLE_MOUSE_MOVE':
      return {
        ...state,
        paddleX: action.payload - state.paddleWidth / 2
      };
    case 'SCORE':
      return {
        ...state,
        score: state.score + 1
      }
    case 'FINISH':
      return {
        ...state,
        active: false
      }
    case 'HORIZONTAL_BOUNCE':
      return {
        ...state,
        dx: -state.dx
      }
    case 'VERTICAL_BOUNCE':
      return {
        ...state,
        dy: -state.dy
      }
    default:
      return state;
  }
}


function tickAction(state) {
  for (let c = 0; c < state.bricks.length; c++) {
    for (let r = 0; r < state.bricks[c].length; r++) {
      const brick = state.bricks[c][r];
      if (brick.active) {
        if (
          state.ballX + state.ballRadius > brick.x &&
          state.ballX - state.ballRadius < brick.x + brickWidth &&
          state.ballY + state.ballRadius > brick.y &&
          state.ballY - state.ballRadius < brick.y + brickHeight
        ) {
          if (state.ballX < brick.x || state.ballX > brick.x + brickWidth) {
            store.dispatch({ type: 'HORIZONTAL_BOUNCE' });
          } else {
            store.dispatch({ type: 'VERTICAL_BOUNCE' });
          }
          brick.active = false;
          if (state.score+1 === brickRowCount * brickColumnCount) {
            store.dispatch({ type: 'FINISH' });
            alert("    S  P  O    ");
            document.location.reload();
          }
          store.dispatch({ type: 'SCORE' });
          return;
        }
      }
    }
  }

  if (0 + state.ballRadius > state.ballX || state.ballX > canvas.width - state.ballRadius) {
    store.dispatch({ type: 'HORIZONTAL_BOUNCE' });
  }

  if (state.ballY < state.ballRadius) {
    store.dispatch({ type: 'VERTICAL_BOUNCE' });
  } else if (state.ballY + state.ballRadius > canvas.height - state.paddleHeight) {
    if (state.ballX > state.paddleX &&
        state.ballX < state.paddleX + state.paddleWidth) {
      store.dispatch({ type: 'VERTICAL_BOUNCE' });
    } else if (state.ballY + state.ballRadius > canvas.height) {
      alert("    N  O  T    S  P  O    ");
      document.location.reload();
    }
  }

  if (state.rightPressed) {
    store.dispatch({ type: 'PADDLE', payload: Math.min(state.paddleX + 14, canvas.width - state.paddleWidth) });
  } else if (state.leftPressed) {
    store.dispatch({ type: 'PADDLE', payload: Math.max(state.paddleX - 14, 0) });
  }

  store.dispatch({ type: 'TICK' });
}

function draw() {
  const state = store.getState();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall(state);
  drawPaddle(state);
  drawBricks(state);
  drawScore(state);

  tickAction(state);

  if (store.getState().active) {
    requestAnimationFrame(draw);
  }
}

function start(c) {
    canvas = c;
    ctx = canvas.getContext("2d");

    const paddleWidth = 75;

    const bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const y = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r] = { x, y, active: true };
      }
    }

    store = Redux.createStore(
      counter,
      {
        paddleX: (canvas.width - paddleWidth) / 2,
        paddleWidth,
        paddleHeight: 10,
        ballRadius: 10,
        ballX: canvas.width / 2 + getRandomInt(canvas.width / 10) - canvas.width / 20,
        ballY: canvas.height / 2 + getRandomInt(canvas.width / 10) - canvas.width / 20,
        leftPressed: false,
        rightPressed: false,
        active: true,
        score: 0,
        dx: 2,
        dy: -2,
        bricks
      }
    )

    draw();
    // store.subscribe(draw);
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