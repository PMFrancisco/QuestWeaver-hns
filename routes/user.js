const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

router.get("/", async (req, res) => {
  res.render("profile", { title: "Profile", user:req.user });
});

router.get('/edit', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        res.render('editProfile', { user: user });
    } catch (error) {
        res.json("Server Error");
    }
});


router.put('/edit', async (req, res) => {
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          displayName: req.body.displayName
        }
      });
      res.redirect('/profile');
    } catch (error) {
      console.error(error);
      res.redirect('/edit');
    }
  });

  
module.exports = router;
