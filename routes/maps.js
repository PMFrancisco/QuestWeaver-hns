const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");
const isGameCreator = require("../middlewares/isGameCreator");
const isAcceptedOrGameCreator = require("../middlewares/isAcceptedOrGameCreator");

/**
 * @swagger
 * tags:
 *   name: Maps
 */

/**
 * @swagger
 * /map/{id}:
 *   get:
 *     summary: View game map
 *     tags: [Maps]
 *     description: Renders the game map along with tokens.
 *     security:
 *       - isAcceptedOrGameCreator: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game map page rendered.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/:id", isAcceptedOrGameCreator, async (req, res) => {
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
      res.render("games/maps", {
        mapUrl: map.mapData.backgroundImageUrl,
        game: { id: gameId },
        tokens: tokens,
      });
    } else {
      res.render("games/maps", {
        mapUrl: null,
        game: { id: gameId },
        tokens: [],
      });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /map/getMapData/{gameId}:
 *   get:
 *     summary: Get map data
 *     tags: [Maps]
 *     description: Retrieves the map data for a specific game.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Map data retrieved.
 *       404:
 *         description: No map data found for this game.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /map/getTokens/{gameId}:
 *   get:
 *     summary: Get game tokens
 *     tags: [Maps]
 *     description: Retrieves the tokens for a specific game.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tokens retrieved.
 *       404:
 *         description: No tokens found for this game.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /map/uploadMap:
 *   post:
 *     summary: Upload game map
 *     tags: [Maps]
 *     description: Uploads a map image for a specific game.
 *     security:
 *       - isGameCreator: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - mapImage
 *               - gameId
 *             properties:
 *               mapImage:
 *                 type: string
 *                 format: binary
 *               gameId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the map page.
 *       500:
 *         description: Internal Server Error.
 */

router.post(
  "/uploadMap",
  upload.single("mapImage"),
  async (req, res) => {
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

      res.redirect(`back`);
    } catch (error) {
      res.redirect("/error");
    }
  }
);

/**
 * @swagger
 * /map/uploadToken:
 *   post:
 *     summary: Upload game token
 *     tags: [Maps]
 *     description: Uploads a custom token image for a specific game.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - tokenImage
 *               - gameId
 *             properties:
 *               tokenImage:
 *                 type: string
 *                 format: binary
 *               gameId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the map page.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /map/saveMapStatus:
 *   put:
 *     summary: Save map status
 *     tags: [Maps]
 *     description: Saves the current state of the map and tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - mapData
 *             properties:
 *               gameId:
 *                 type: string
 *               mapData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Map status updated successfully.
 *       404:
 *         description: Map not found.
 *       500:
 *         description: Internal Server Error.
 */

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
