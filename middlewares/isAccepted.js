const prisma = require("../prisma");

async function isAccepted(req, res, next) {
  const participant = await prisma.gameParticipant.findFirst({
    where: {
      userId: req.user.id,
      isAccepted: true,
    },
  });

  if (participant) {
    return next();
  }
  return res.redirect("/games");
}

module.exports = isAccepted;
