const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");
const isAccepted = require("../middlewares/isAccepted");

router.get("/:id", isAccepted, async (req, res) => {
  try {
    const gameId = req.params.id;

    const map = await prisma.map.findFirst({
      where: { gameId: gameId },
      select: { mapData: true },
    });

    const tokens = await prisma.token.findMany({
      where: { OR: [{ isCustom: false }, { gameId: gameId }] },
    });

    if (map) {
      res.render("maps", {
        mapUrl: map.mapData.backgroundImageUrl,
        game: { id: gameId },
        tokens: tokens,
      });
    } else {
      res.render("maps", { mapUrl: null, game: { id: gameId }, tokens: [] });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getMapData/:gameId", async (req, res) => {
  const gameId = req.params.gameId;

  try {
    const map = await prisma.map.findFirst({
      where: { gameId: gameId },
      select: { mapData: true },
    });

    if (map && map.mapData) {
      res.json({ mapData: map.mapData });
    } else {
      res.status(404).send("No map data found for this game");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getTokens/:gameId", async (req, res) => {
  const gameId = req.params.gameId;

  try {
    const map = await prisma.map.findFirst({
      where: { gameId: gameId },
      select: { mapData: true },
    });

    if (map && map.mapData && map.mapData.tokens) {
      res.json(map.mapData.tokens);
    } else {
      res.status(404).send("No tokens found for this game");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/uploadMap", upload.single("mapImage"), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);
    const mapUrl = cldRes.secure_url;

    const gameId = req.body.gameId;

    const existingMap = await prisma.map.findFirst({
      where: { gameId: gameId },
    });

    if (existingMap) {
      await prisma.map.update({
        where: { id: existingMap.id },
        data: {
          mapData: {
            ...existingMap.mapData,
            backgroundImageUrl: mapUrl,
          },
        },
      });
    } else {
      await prisma.map.create({
        data: {
          name: "Map Name",
          mapData: {
            backgroundImageUrl: mapUrl,
            tokens: [],
          },
          gameId: gameId,
        },
      });
    }

    res.redirect(`/map/${gameId}`);
  } catch (error) {
    res.redirect("/error");
  }
});

router.post("/uploadToken", upload.single("tokenImage"), async (req, res) => {
  const gameId = req.body.gameId;

  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);

    await prisma.token.create({
      data: {
        name: req.body.name,
        imageUrl: cldRes.secure_url,
        isCustom: true,
        gameId: gameId,
      },
    });
    res.redirect(`/map/${gameId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/saveMapStatus", async (req, res) => {
  try {
    const { gameId, mapData } = req.body;

    const existingMap = await prisma.map.findFirst({
      where: { gameId: gameId },
    });

    if (existingMap) {
      await prisma.map.update({
        where: { id: existingMap.id },
        data: {
          mapData: {
            ...existingMap.mapData,
            ...mapData,
          },
        },
      });
      res.json({ message: "Tokens and map data updated successfully" });
    } else {
      res.status(404).json({ message: "Map not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
