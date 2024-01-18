const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

router.get("/newGameInfo/:gameId/:categoryId", async (req, res) => {
  const { gameId, categoryId } = req.params;
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
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

    res.render("gameInfo/createGameInfo", {
      categories,
      game,
      gameId,
      categoryId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the page");
  }
});

router.get("/edit/:gameInfoId", async (req, res) => {
  const gameInfoId = req.params.gameInfoId;

  try {
    const gameInfo = await prisma.gameInfo.findUnique({
      where: { id: gameInfoId },
    });

    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            gameInfos: true,
          },
        },
        gameInfos: true,
      },
    });

    if (!gameInfo) {
      res.status(404).send("GameInfo not found");
      return;
    }

    res.render("gameInfo/editGameInfo", { gameInfo, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving GameInfo for editing");
  }
});



router.post("/update/:gameInfoId", async (req, res) => {
  const gameInfoId = req.params.gameInfoId;
  const { title, content } = req.body;

  try {
    await prisma.gameInfo.update({
      where: { id: gameInfoId },
      data: { title, content },
    });

    res.redirect(`/gameinfo/view/${gameInfoId}`); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating GameInfo");
  }
});


router.get("/delete/:gameInfoId", async (req, res) => {
  const gameInfoId = req.params.gameInfoId;

  try {
    const gameInfo = await prisma.gameInfo.findUnique({
      where: { id: gameInfoId },
      include: {
        category: true, 
      },
    }); 

    const gameId = gameInfo.category.gameId;

    await prisma.gameInfo.delete({
      where: { id: gameInfoId },
    });

    res.redirect(`/gameInfo/${gameId}`); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting entry");
  }
});





router.get("/view/:gameInfoId", async (req, res) => {
  const gameInfoId = req.params.gameInfoId;

  try {
    const gameInfo = await prisma.gameInfo.findUnique({
      where: { id: gameInfoId },
    });

    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            gameInfos: true,
          },
        },
        gameInfos: true,
      },
    });

    if (!gameInfo) {
      res.status(404).send("Entry not found");
      return;
    }

    res.render("gameInfo/viewGameInfo", { gameInfo, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving GameInfo");
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
    res.status(500).send("Error creating entry");
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

router.get("/deleteCategory/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.redirect('back');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar la categoría");
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
