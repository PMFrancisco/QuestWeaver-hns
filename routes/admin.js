const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");

router.get("/", (req, res) => {
  res.render("admin/admin");
});

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.render("admin/adminUsers", { users });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/users/edit/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
      res.render("admin/adminEditUser", { user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/users/edit/:id", async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email, isAdmin } = req.body;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, email, isAdmin: isAdmin === "on" },
    });
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/users/edit/:id/updateProfilePicture",
  upload.single("profileImage"),
  async (req, res) => {
    const userId = req.params.id;
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);

      await prisma.user.update({
        where: { id: userId },
        data: { profileImage: cldRes.secure_url },
      });

      res.redirect(`/admin/users/edit/${userId}`);
    } catch (error) {
      console.error(error);
      res.redirect("/admin/error");
    }
  }
);

router.get("/users/delete/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/games", async (req, res) => {
  try {
    const games = await prisma.game.findMany();
    res.render("admin/adminGames", { games });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/games/edit/:id", async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    res.render("admin/adminEditGame", { game });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/games/edit/:id", async (req, res) => {
  const gameId = req.params.id;
  const { name, description } = req.body;
  try {
    await prisma.game.update({
      where: { id: gameId },
      data: { name, description },
    });
    res.redirect("/admin/games");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/games/delete/:id", async (req, res) => {
  const gameId = req.params.id;
  try {
    await prisma.game.delete({ where: { id: gameId } });
    res.redirect("/admin/games");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
