let mapImage;
let imageLoaded = false;
let mapX = 0,
  mapY = 0;
let dragging = false;
let dragStartX, dragStartY;
let scaleMap = 1.0;

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

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    dragging = true;
    dragStartX = mouseX - mapX;
    dragStartY = mouseY - mapY;
  }
}

function mouseDragged() {
  if (dragging) {
    mapX = mouseX - dragStartX;
    mapY = mouseY - dragStartY;
  }
}

function mouseReleased() {
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
}
