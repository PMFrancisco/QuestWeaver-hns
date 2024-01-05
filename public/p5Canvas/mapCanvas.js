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

function setup() {
  let canvas = createCanvas(boardWidth, boardHeight);
  canvas.parent("game-board");
  background(127);
  loadMapData(gameId);
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
  saveMapStatus();
  dragging = false;
}

function mouseWheel(event) {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    let prevScale = scaleMap;
    scaleMap += event.delta * -0.001;
    scaleMap = constrain(scaleMap, 0.5, 3);

    let scaleFactor = scaleMap / prevScale;

    tokens.forEach((token) => {
      token.x =
        (token.x + token.anchorX - mapX) * scaleFactor + mapX - token.anchorX;
      token.y =
        (token.y + token.anchorY - mapY) * scaleFactor + mapY - token.anchorY;
    });

    return false;
  }
}

function keyPressed() {
  let prevScale = scaleMap;

  if (key === "+") {
    scaleMap = constrain(scaleMap + 0.1, 0.5, 3);
  } else if (key === "-") {
    scaleMap = constrain(scaleMap - 0.1, 0.5, 3);
  }

  let scaleFactor = scaleMap / prevScale;

  tokens.forEach((token) => {
    token.x =
      (token.x + token.anchorX - mapX) * scaleFactor + mapX - token.anchorX;
    token.y =
      (token.y + token.anchorY - mapY) * scaleFactor + mapY - token.anchorY;
  });
}

function doubleClicked() {
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (
      mouseX > token.x &&
      mouseX < token.x + token.w &&
      mouseY > token.y &&
      mouseY < token.y + token.h
    ) {
      tokens.splice(i, 1);
      saveMapStatus();
      break;
    }
  }
}

function generateUniqueId() {
  return "token-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function addToken(imageUrl) {
  loadImage(imageUrl, (img) => {
    const aspectRatio = img.width / img.height;
    const newHeight = 50;
    const newWidth = newHeight * aspectRatio;

    tokens.push({
      id: generateUniqueId(),
      img: img,
      imageUrl: imageUrl,
      x: width / 2 - newWidth / 2,
      y: height / 2 - newHeight / 2,
      w: newWidth,
      h: newHeight,
      anchorX: newWidth / 2,
      anchorY: newHeight / 2,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
    });
    saveMapStatus();
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

function getTokensData() {
  const data = tokens.map((token) => {
    return {
      id: token.id,
      x: token.x,
      y: token.y,
      w: token.w,
      h: token.h,
      imageUrl: token.imageUrl,
    };
  });
  console.log("Datos de tokens:", data);
  return data;
}

function saveMapStatus() {
  console.log("Guardando tokens");
  const tokensData = getTokensData();

  const mapData = {
    backgroundImageUrl: mapUrl,
    tokens: tokensData,
    mapPosition: { x: mapX, y: mapY },
    mapScale: scaleMap,
  };

  fetch("/map/saveMapStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gameId, mapData }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function loadTokens(gameId) {
  fetch("/map/getTokens/" + gameId)
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudieron cargar los tokens");
      }
      return response.json();
    })
    .then((tokensData) => {
      createTokensFromData(tokensData);
    })
    .catch((error) => console.error("Error al cargar tokens:", error));
}

function loadMapData(gameId) {
  fetch(`/map/getMapData/${gameId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo cargar los datos del mapa");
      }
      return response.json();
    })
    .then((data) => {
      const { mapData } = data;

      if (mapData) {
        mapX = mapData.mapPosition.x;
        mapY = mapData.mapPosition.y;
        scaleMap = mapData.mapScale;
        mapImage = loadImage(mapData.backgroundImageUrl, () => {
          imageLoaded = true;
        });
      }
    })
    .catch((error) =>
      console.error("Error al cargar los datos del mapa:", error)
    );
}

function createTokensFromData(tokensData) {
  tokensData.forEach((tokenData) => {
    loadImage(tokenData.imageUrl, (img) => {
      tokens.push({
        id: tokenData.id,
        img: img,
        imageUrl: tokenData.imageUrl,
        x: tokenData.x,
        y: tokenData.y,
        w: tokenData.w,
        h: tokenData.h,
        anchorX: tokenData.w / 2,
        anchorY: tokenData.h / 2,
        dragging: false,
        offsetX: 0,
        offsetY: 0,
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadTokens(gameId);
});
