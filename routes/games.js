const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const transporter = require("../config/nodemailer");

const isGameCreator = require("../middlewares/isGameCreator");

/**
 * @swagger
 * tags:
 *   name: Games
 */

/**
 * @swagger
 * /games:
 *   get:
 *     summary: List all games
 *     tags: [Games]
 *     description: Retrieves and renders a list of all games.
 *     responses:
 *       200:
 *         description: Games list page rendered.
 *       500:
 *         description: Error getting the games.
 */

router.get("/", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        creator: true,
        participants: true,
      },
    });

    res.render("games/gameList", {
      title: "List of games",
      games,
      userId: req.user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting the games");
  }
});

/**
 * @swagger
 * /games/createGame:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     description: Creates a new game and redirects to the game page.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the newly created game page.
 *       500:
 *         description: Error creating the game.
 */

router.post("/createGame", async (req, res) => {
  try {
    const { name, description } = req.body;
    const newGame = await prisma.game.create({
      data: {
        name: name,
        description: description,
        creatorId: req.user.id,
      },
    });

    res.redirect(`/games/${newGame.id}`);
  } catch (error) {
    res.status(500).send("Error creating the game");
  }
});

/**
 * @swagger
 * /games/joinGame:
 *   post:
 *     summary: Join a game
 *     tags: [Games]
 *     description: Joins a user to a game and sends an email notification to the game creator.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *             properties:
 *               gameId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the game page.
 *       500:
 *         description: Error joining the game.
 */

router.post("/joinGame", async (req, res) => {
  const gameId = req.body.gameId;
  const userId = req.user.id;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { creator: true },
    });

    await prisma.gameParticipant.create({
      data: {
        gameId: gameId,
        userId: userId,
        role: "Player",
        isAccepted: false,
      },
    });

    const gameUrl = `${req.protocol}://questweaver.onrender.com/games/${gameId}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: game.creator.email,
      subject: `New player wants to join: ${game.name}`,
      html: `Hello ${game.creator.firstName},<br><br>${req.user.displayName} wants to join <a href="${gameUrl}">${game.name}</a>.`,
    };

    await transporter.sendMail(mailOptions);

    res.redirect(`/games/${gameId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error joining the game");
  }
});

/**
 * @swagger
 * /games/acceptPlayer:
 *   put:
 *     summary: Accept a player in a game
 *     tags: [Games]
 *     description: Accepts a player's request to join a game.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - userId
 *             properties:
 *               gameId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the game page.
 *       500:
 *         description: Error updating player status.
 */

router.post("/acceptPlayer", isGameCreator, async (req, res) => {
  const { gameId, userId } = req.body;

  try {
    await prisma.gameParticipant.updateMany({
      where: {
        gameId: gameId,
        userId: userId,
        isAccepted: false,
      },
      data: {
        isAccepted: true,
      },
    });

    res.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating player status");
  }
});

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: View game
 *     tags: [Games]
 *     description: Renders the page for a specific game.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game page rendered.
 *       500:
 *         description: Error getting the game.
 */

router.get("/:id", async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.id;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    const isGameCreator = game.creatorId === userId;

    const acceptedPlayers = game.participants.filter((data) => data.isAccepted);
    const pendingPlayers = isGameCreator
      ? game.participants.filter((data) => !data.isAccepted)
      : [];

    res.render("games/game", {
      title: game.name,
      game,
      acceptedPlayers,
      pendingPlayers,
      isGameCreator,
      user: req.user,
    });
  } catch (error) {
    res.status(500).send("Error getting the game");
  }
});

module.exports = router;
