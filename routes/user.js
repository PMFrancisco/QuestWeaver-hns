const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");

router.get("/", async (req, res) => {
  res.render("profile", { title: "Profile", user: req.user });
});

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
