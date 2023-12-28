const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");

router.get("/:id", async (req, res) => {
    try {
      const gameId = req.params.id;
      res.render("maps", { game: { id: gameId } });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  });



/* router.get("/game/:id", async (req, res) => {
  const { gameId } = req.params.id;

  try {
    const maps = await prisma.map.findUnique({
      where: { gameId: gameId },
    });
    res.json(maps);
  } catch (error) {
    res.status(500).send("Error al recuperar los mapas");
  }
}); */

async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res.secure_url;
  }

router.post(
  "/uploadMap",
  upload.single("mapImage"),
  async (req, res) => {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const mapUrl = await handleUpload(dataURI);

      const gameId = req.body.gameId;
    
      const newMap = await prisma.map.create({
        data: {
          name: "Map Name",
          mapData: {
            backgroundImageUrl: mapUrl,
            tokens: [],
          },
          gameId: gameId,
        },
      });

      res.redirect(`/map/${gameId}`); 
    } catch (error) {
      console.error(error);
      res.redirect("/error");
    }
  }
);

module.exports = router;
