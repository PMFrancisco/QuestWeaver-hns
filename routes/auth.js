const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma");
/**
 * @swagger
 * tags:
 *   name: Auth
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Registers a new user by saving their details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - displayName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name.
 *               lastName:
 *                 type: string
 *                 description: User's last name.
 *               displayName:
 *                 type: string
 *                 description: User's display name.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       400:
 *         description: Invalid request parameters.
 *       500:
 *         description: Server error.
 */

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        displayName: req.body.displayName,
        email: req.body.email,
        password: hashedPassword,
      },
    });
    res.redirect("/auth/login-page");
  } catch (error) {
    res.redirect("/auth/register-page");
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticates a user and starts a session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *     responses:
 *       302:
 *         description: Redirects to the homepage on successful login.
 *       401:
 *         description: Authentication failed.
 */

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login-page",
    failureFlash: true,
  })
);

/**
 * @swagger
 * /auth/login-page:
 *   get:
 *     summary: Login page
 *     tags: [Auth] 
 *     description: Renders the login page.
 *     responses:
 *       200:
 *         description: Login page rendered.
 */

router.get("/login-page", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

/**
 * @swagger
 * /auth/register-page:
 *   get:
 *     summary: Registration page
 *     tags: [Auth]
 *     description: Renders the registration page.
 *     responses:
 *       200:
 *         description: Registration page rendered.
 */

router.get("/register-page", (req, res) => {
  res.render("register", { error: req.flash("error") });
});

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google Authentication
 *     tags: [Auth] 
 *     description: Initiates authentication using Google account.
 *     responses:
 *       302:
 *         description: Redirects to Google authentication.
 */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google Auth Callback
 *     tags: [Auth] 
 *     description: Callback route for Google authentication.
 *     responses:
 *       302:
 *         description: Redirects to profile page on success or login page on failure.
 */

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: User logout
 *     tags: [Auth]
 *     description: Logs out the current user.
 *     responses:
 *       302:
 *         description: Redirects to the homepage.
 */

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
