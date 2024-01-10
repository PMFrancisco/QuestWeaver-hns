const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const transporter = require("../config/nodemailer");

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

router.get("/:id", async (req, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
    });
    res.render("game", { title: game.name, game });
  } catch (error) {
    res.status(500).send("Error getting the game");
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

    const participant = await prisma.gameParticipant.create({
      data: {
        gameId: gameId,
        userId: userId,
        role: "Player",
        isAccepted: false,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: game.creator.email,
      subject: `New player wants to join: ${game.name}`,
      text: `Hola ${game.creator.firstName},\n\n${req.user.displayName} wants to join to "${game.name}".`,
    };

    await transporter.sendMail(mailOptions);

    res.redirect(`/games/${gameId}`);
  } catch (error) {
    res.status(500).send("Error al unirse a la partida");
  }
});

module.exports = router;
