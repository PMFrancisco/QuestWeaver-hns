const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

router.get("/newGameInfo/:gameId/:categoryId", async (req, res) => {
  const { gameId, categoryId } = req.params;
  try {
    // Amplía esta consulta para incluir los GameInfos si son necesarios
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            gameInfos: true // Incluye los GameInfo para las subcategorías
          }
        },
        gameInfos: true // Incluye los GameInfo para las categorías principales
      }
    });

    // Si necesitas detalles adicionales del juego o la categoría específica, añádelos aquí
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      // Incluye relaciones adicionales si son necesarias
    });

    // Si es necesario, obtén detalles adicionales de la categoría específica
    const categoryDetails = await prisma.category.findUnique({
      where: { id: categoryId },
      // Incluye relaciones adicionales si son necesarias
    });

    res.render("gameInfo/createGameInfo", {
      categories,
      game,
      categoryDetails, // Añade esto si necesitas detalles específicos de la categoría
      gameId,
      categoryId
    });
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
