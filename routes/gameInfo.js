const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

/**
 * @swagger
 * tags:
 *   name: GameInfo
 */

/**
 * @swagger
 * /newGameInfo/{gameId}/{categoryId}:
 *   get:
 *     summary: New GameInfo page
 *     tags: [GameInfo]
 *     description: Renders the page for creating new GameInfo.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Category ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: New GameInfo page rendered.
 *       500:
 *         description: Error loading the page.
 */

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

/**
 * @swagger
 * /edit/{gameInfoId}:
 *   get:
 *     summary: Edit GameInfo page
 *     tags: [GameInfo]
 *     description: Renders the edit page for a specific GameInfo.
 *     parameters:
 *       - in: path
 *         name: gameInfoId
 *         required: true
 *         description: GameInfo ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Edit GameInfo page rendered.
 *       404:
 *         description: GameInfo not found.
 *       500:
 *         description: Error retrieving GameInfo for editing.
 */

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

/**
 * @swagger
 * /update/{gameInfoId}:
 *   put:
 *     summary: Update GameInfo
 *     tags: [GameInfo]
 *     description: Updates the information of a specific GameInfo.
 *     parameters:
 *       - in: path
 *         name: gameInfoId
 *         required: true
 *         description: GameInfo ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the GameInfo view.
 *       500:
 *         description: Error updating GameInfo.
 */

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

/**
 * @swagger
 * /delete/{gameInfoId}:
 *   delete:
 *     summary: Delete GameInfo
 *     tags: [GameInfo]
 *     description: Deletes a specific GameInfo entry.
 *     parameters:
 *       - in: path
 *         name: gameInfoId
 *         required: true
 *         description: GameInfo ID.
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to the game info page.
 *       500:
 *         description: Error deleting entry.
 */

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

/**
 * @swagger
 * /view/{gameInfoId}:
 *   get:
 *     summary: View GameInfo
 *     tags: [GameInfo]
 *     description: Renders the view page for a specific GameInfo.
 *     parameters:
 *       - in: path
 *         name: gameInfoId
 *         required: true
 *         description: GameInfo ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: GameInfo view page rendered.
 *       404:
 *         description: Entry not found.
 *       500:
 *         description: Error retrieving GameInfo.
 */

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

/**
 * @swagger
 * /createGameInfo:
 *   post:
 *     summary: Create GameInfo
 *     tags: [GameInfo]
 *     description: Creates a new GameInfo entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *               - gameId
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               gameId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the game info page.
 *       500:
 *         description: Error creating entry.
 */

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

/**
 * @swagger
 * /addCategory:
 *   post:
 *     summary: Add Category
 *     tags: [GameInfo]
 *     description: Creates a new category or subcategory for the game.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - gameId
 *             properties:
 *               categoryName:
 *                 type: string
 *               gameId:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects back to the previous page.
 *       500:
 *         description: Error creating category or subcategory.
 */

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

/**
 * @swagger
 * /deleteCategory/{categoryId}:
 *   delete:
 *     summary: Delete Category
 *     tags: [GameInfo]
 *     description: Deletes a specific category.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Category ID.
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects back to the previous page.
 *       500:
 *         description: Error deleting category.
 */

router.get("/deleteCategory/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.redirect("back");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting category");
  }
});

/**
 * @swagger
 * /{gameId}:
 *   get:
 *     summary: Main GameInfo Wiki
 *     tags: [GameInfo]
 *     description: Renders the main wiki page for a specific game.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Main wiki page rendered.
 *       500:
 *         description: Error loading the wiki.
 */

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
