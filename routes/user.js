const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const multer = require("multer");

const storage = new multer.memoryStorage();
const upload = multer({
  storage,
});

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res.secure_url;
}

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
        data: { profileImage: cldRes },
      });

      res.redirect("/profile");
    } catch (error) {
      res.redirect("/error");
    }
  }
);

module.exports = router;
