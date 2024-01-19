const express = require("express");
const prisma = require("../prisma");
const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Admin
 */

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Admin dashboard
 *     tags: [Admin]
 *     description: Renders the admin dashboard.
 *     responses:
 *       200:
 *         description: Admin dashboard page rendered.
 */

router.get("/", (req, res) => {
  res.render("admin/admin");
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     description: Retrieves and renders a list of all users.
 *     responses:
 *       200:
 *         description: Users list rendered.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.render("admin/adminUsers", { users });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /admin/users/edit/{id}:
 *   get:
 *     summary: Edit user page
 *     tags: [Admin]
 *     description: Renders the edit user page for a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Edit user page rendered.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /admin/users/edit/{id}:
 *   post:
 *     summary: Edit user
 *     tags: [Admin]
 *     description: Updates a user's information.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - isAdmin
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       302:
 *         description: Redirects to the users list.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /admin/users/edit/{id}/updateProfilePicture:
 *   post:
 *     summary: Update user's profile picture
 *     tags: [Admin]
 *     description: Updates the profile picture of a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       302:
 *         description: Redirects to the edit user page.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /admin/users/delete/{id}:
 *   get:
 *     summary: Delete user
 *     tags: [Admin]
 *     description: Deletes a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID.
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to the users list.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /admin/games:
 *   get:
 *     summary: List all games
 *     tags: [Admin]
 *     description: Retrieves and renders a list of all games.
 *     responses:
 *       200:
 *         description: Games list rendered.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/games", async (req, res) => {
  try {
    const games = await prisma.game.findMany();
    res.render("admin/adminGames", { games });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /admin/games/edit/{id}:
 *   get:
 *     summary: Edit game page
 *     tags: [Admin]
 *     description: Renders the edit game page for a specific game.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Edit game page rendered.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /admin/games/edit/{id}:
 *   post:
 *     summary: Edit game
 *     tags: [Admin]
 *     description: Updates a game's information.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
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
 *         description: Redirects to the games list.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /admin/games/delete/{id}:
 *   get:
 *     summary: Delete game
 *     tags: [Admin]
 *     description: Deletes a specific game.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to the games list.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /admin/tokens:
 *   get:
 *     summary: List all tokens
 *     tags: [Admin]
 *     description: Retrieves and renders a list of all tokens.
 *     responses:
 *       200:
 *         description: Tokens list rendered.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/tokens", async (req, res) => {
  try {
    const tokens = await prisma.token.findMany();
    res.render("admin/adminTokens", { tokens });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /admin/tokens/create:
 *   post:
 *     summary: Create a new token
 *     tags: [Admin]
 *     description: Creates a new token with an image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - tokenImage
 *             properties:
 *               name:
 *                 type: string
 *               tokenImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       302:
 *         description: Redirects to the tokens list.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/tokens/create", upload.single("tokenImage"), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);

    await prisma.token.create({
      data: {
        name: req.body.name,
        imageUrl: cldRes.secure_url,
        isCustom: false,
      },
    });
    res.redirect("/admin/tokens");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/error");
  }
});

/**
 * @swagger
 * /admin/tokens/delete/{id}:
 *   get:
 *     summary: Delete token
 *     tags: [Admin]
 *     description: Deletes a specific token.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Token ID.
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to the tokens list.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/tokens/delete/:id", async (req, res) => {
  const tokenId = req.params.id;
  try {
    await prisma.token.delete({ where: { id: tokenId } });
    res.redirect("/admin/tokens");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
