const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

router.get("/newGameInfo/:gameId/:categoryId", async (req, res) => {
  const { gameId, categoryId } = req.params;
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
    });
    res.render("gameInfo/createGameInfo", { categories, gameId, categoryId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the page");
  }
});

router.post("/createGameInfo", async (req, res) => {
  const { title, content, categoryId, gameId } = req.body;
  try {
    await prisma.gameInfo.create({
      data: {
        title: title,
        content: content,
        categoryId: categoryId,
        gameId: gameId,
      },
    });
    res.redirect(`/gameInfo/${gameId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating GameInfo");
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
      include: {
        children: {
          include: {
            gameInfos: true,
          },
        },
        gameInfos: true,
      },
    });

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    res.render("gameInfo/mainWiki", { categories, gameId, game });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading the wiki");
  }
});

module.exports = router;
