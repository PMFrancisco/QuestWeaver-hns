const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const transporter = require("../config/nodemailer");

const isGameCreator = require("../middlewares/isGameCreator");

router.get("/", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        creator: true,
      },
    });
    res.render("gameList", { title: "List of games", games });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting the games");
  }
});

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

    const gameUrl = `${req.protocol}://${req.get(
      "host"
    )}/games/acceptPlayer?gameId=${gameId}`;

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
    res.status(500).send("Error al unirse a la partida");
  }
});

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

    res.render("game", {
      title: game.name,
      game,
      acceptedPlayers,
      pendingPlayers,
      isGameCreator,
    });
  } catch (error) {
    res.status(500).send("Error getting the game");
  }
});

module.exports = router;
