let mapImage;
let imageLoaded = false;
let mapX = 0,
  mapY = 0;
let dragging = false;
let dragStartX, dragStartY;
let scaleMap = 1.0;

let tokens = [];

const board = document.getElementById("game-board");
const boardWidth = board.offsetWidth;
const boardHeight = board.offsetHeight;

function preload() {
  mapImage = loadImage(mapUrl, () => {
    imageLoaded = true;
    mapX = (boardWidth - mapImage.width) / 2;
    mapY = (boardHeight - mapImage.height) / 2;
  });
}

function drawTokenImage(imageUrl) {
  loadImage(imageUrl, (img) => {
    currentTokenImage = img;
  });
}

function mousePressed() {
  let onToken = false;

  for (let token of tokens) {
    if (
      mouseX > token.x &&
      mouseX < token.x + token.w &&
      mouseY > token.y &&
      mouseY < token.y + token.h
    ) {
      token.dragging = true;
      token.offsetX = mouseX - token.x;
      token.offsetY = mouseY - token.y;
      onToken = true;
      break;
    }
  }

  if (
    !onToken &&
    mouseX > 0 &&
    mouseX < width &&
    mouseY > 0 &&
    mouseY < height
  ) {
    dragging = true;
    dragStartX = mouseX;
    dragStartY = mouseY;
  }
}

function mouseDragged() {
  if (dragging) {
    let dx = mouseX - dragStartX;
    let dy = mouseY - dragStartY;
    dragStartX = mouseX;
    dragStartY = mouseY;

    tokens.forEach((token) => {
      token.x += dx;
      token.y += dy;
    });

    mapX += dx;
    mapY += dy;
  } else {
    for (let token of tokens) {
      if (token.dragging) {
        token.x = mouseX - token.offsetX;
        token.y = mouseY - token.offsetY;
        return;
      }
    }
  }
}

function mouseReleased() {
  tokens.forEach((token) => (token.dragging = false));
  dragging = false;
}

function mouseWheel(event) {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    scaleMap += event.delta * -0.001;
    scaleMap = constrain(scaleMap, 0.5, 3);

    return false;
  }
}

function keyPressed() {
  if (key === "+") {
    scaleMap = constrain(scaleMap + 0.1, 0.5, 3);
  } else if (key === "-") {
    scaleMap = constrain(scaleMap - 0.1, 0.5, 3);
  }
}

function setup() {
  let canvas = createCanvas(boardWidth, boardHeight);
  canvas.parent("game-board");
  background(127);
}

function draw() {
  background(127);
  if (imageLoaded) {
    push();
    translate(mapX, mapY);
    scale(scaleMap);
    image(mapImage, 0, 0);
    pop();
  }

  tokens.forEach((token) => {
    image(token.img, token.x, token.y, token.w, token.h);
  });
}
function addToken(imageUrl) {
  loadImage(imageUrl, (img) => {
    const aspectRatio = img.width / img.height;
    const newHeight = 50;
    const newWidth = newHeight * aspectRatio;

    tokens.push({
      img: img,
      x: width / 2 - newWidth / 2,
      y: height / 2 - newHeight / 2,
      w: newWidth,
      h: newHeight,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const tokenButtons = document.querySelectorAll(".tokenButton");
  tokenButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const imageUrl = this.getAttribute("tokenImageUrl");
      addToken(imageUrl);
    });
  });
});
