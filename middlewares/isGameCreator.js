const prisma = require("../prisma");

async function isGameCreator(req, res, next) {
  const gameId = req.params.id || req.body.gameId;
  const userId = req.user.id;

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
  });

  if (game && game.creatorId === userId) {
    return next();
  }
  return res.redirect("/games");
}

module.exports = isGameCreator;
