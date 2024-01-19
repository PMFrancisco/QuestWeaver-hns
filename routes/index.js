const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home page
 *     tags: [HomePage]
 *     description: Renders the home page of the application.
 *     security:
 *       - isAuthenticated: []
 *     responses:
 *       200:
 *         description: Home page rendered.
 */

router.get("/", isAuthenticated, function (req, res, next) {
  res.render("index", { title: "Quest Weaver" });
});
/**
 * @swagger
 * /auth:
 *   use:
 *     summary: Authentication routes
 *     description: Includes routes for authentication (login, register, etc.).
 */

router.use("/auth", require("./auth"));
/**
 * @swagger
 * /profile:
 *   use:
 *     summary: User profile routes
 *     description: Routes related to the user's profile.
 *     security:
 *       - isAuthenticated: []
 */

router.use("/profile", isAuthenticated, require("./user"));
/**
 * @swagger
 * /games:
 *   use:
 *     summary: Game related routes
 *     description: Includes routes for game operations (list, create, join, etc.).
 *     security:
 *       - isAuthenticated: []
 */

router.use("/games", isAuthenticated, require("./games"));
/**
 * @swagger
 * /map:
 *   use:
 *     summary: Map routes
 *     description: Routes for map related operations.
 *     security:
 *       - isAuthenticated: []
 */

router.use("/map", isAuthenticated, require("./maps"));
/**
 * @swagger
 * /gameInfo:
 *   use:
 *     summary: GameInfo routes
 *     description: Routes related to the game information.
 *     security:
 *       - isAuthenticated: []
 */

router.use("/gameInfo", isAuthenticated, require("./gameInfo"));
/**
 * @swagger
 * /admin:
 *   use:
 *     summary: Admin routes
 *     description: Routes for administrative tasks.
 *     security:
 *       - isAdmin: []
 */

router.use("/admin", isAdmin, require("./admin"));

module.exports = router;
