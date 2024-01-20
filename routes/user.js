const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");

/**
 * @swagger
 * tags:
 *   name: User
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: View user profile
 *     tags: [User]
 *     description: Renders the user's profile page.
 *     responses:
 *       200:
 *         description: Profile page rendered.
 */

router.get("/", async (req, res) => {
  res.render("profile", { title: "Profile", user: req.user });
});

/**
 * @swagger
 * /profile/edit:
 *   get:
 *     summary: Edit user profile page
 *     tags: [User]
 *     description: Renders the page for editing the user's profile.
 *     responses:
 *       200:
 *         description: Edit profile page rendered.
 *       500:
 *         description: Server Error.
 */

router.get("/edit", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    res.render("editProfile", { user: user });
  } catch (error) {
    res.json("Server Error");
  }
});
/**
 * @swagger
 * /profile/edit:
 *   put:
 *     summary: Edit user profile
 *     tags: [User]
 *     description: Updates the user's profile information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - displayName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the profile page.
 *       500:
 *         description: Internal Server Error.
 */

router.put("/edit", async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        displayName: req.body.displayName,
      },
    });
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.redirect("/edit");
  }
});
/**
 * @swagger
 * /profile/updateProfilePicture:
 *   put:
 *     summary: Update profile picture
 *     tags: [User]
 *     description: Uploads and updates the user's profile picture.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profileImage
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       302:
 *         description: Redirects to the profile page.
 *       500:
 *         description: Internal Server Error.
 */

router.post(
  "/updateProfilePicture",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { profileImage: cldRes.secure_url },
      });

      res.redirect("/profile");
    } catch (error) {
      console.log(error);
      res.redirect("/error");
    }
  }
);

module.exports = router;
