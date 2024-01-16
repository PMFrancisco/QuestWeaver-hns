const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

router.get("/new/:gameId", (req, res) => {
  const gameId = req.params.gameId;
  res.render("gameInfo/createGameInfo", { gameId });
});

router.post("/create", async (req, res) => {
  const { title, content, gameId } = req.body;
  try {
    const newGameInfo = await prisma.gameInfo.create({
      data: {
        title,
        content,
        gameId,
      },
    });
    res.redirect("/new/:gameId");
  } catch (error) {
    res.status(500).send("Error creating the wiki entry");
  }
});

router.post("/addCategory", async (req, res) => {
  const { categoryName, gameId, parentId } = req.body;
  try {
    await prisma.category.create({
      data: {
        name: categoryName,
        gameId: gameId,
        parentId: parentId || null,
      },
    });
    res.redirect("back");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating category or subcategory");
  }
});

router.get("/:gameId", async (req, res) => {
  const gameId = req.params.gameId;

  try {
    const categories = await prisma.category.findMany({
      where: { gameId: gameId, parentId: null },
      include: { children: true },
    });
    res.render("gameInfo/mainWiki", { categories, gameId });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading the wiki");
  }
});

module.exports = router;
