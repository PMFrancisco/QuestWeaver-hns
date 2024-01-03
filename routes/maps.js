const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");

router.get("/:id", async (req, res) => {
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
    console.error(error);
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
    console.error(error);
    res.redirect("/error");
  }
});

module.exports = router;
