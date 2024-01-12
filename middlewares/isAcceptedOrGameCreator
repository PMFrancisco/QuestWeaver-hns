const prisma = require("../prisma");

async function isAcceptedOrGameCreator(req, res, next) {
  try {
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        userId: req.user.id,
        isAccepted: true,
      },
    });

    if (participant) {
      return next();
    }

    const gameId = req.params.id;
    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
    });

    if (game && game.creatorId === req.user.id) {
      return next();
    }

    return res.redirect("/games");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = isAcceptedOrGameCreator;
