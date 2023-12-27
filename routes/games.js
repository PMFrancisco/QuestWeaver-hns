const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const transporter = require('../config/nodemailer');


router.get('/', async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            include: {
                creator: true
            }
        });
        res.render('gameList', { title:"List of games", games });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting the games');
    }
    
})

router.get("/:id",
    async (req, res) => {
        try {
            const game = await prisma.game.findUnique({
                where: { id: req.params.id },
            });
            res.render("game", {title: game.name, game });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error getting the game");
        }
    }
);

router.post('/createGame', async (req, res) => {
    try {
        const { name, description } = req.body;
        const newGame = await prisma.game.create({
            data: {
                name: name,
                description: description,
                creatorId: req.user.id,
            }
        });

        res.redirect('/games/{{req.game.id}}');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating the game');
    }
});

router.post('/joinGame', async (req, res) => {
    const gameId = req.body.gameId;
    const userId = req.user.id;
    console.log("Game ID:", gameId, "User ID:", userId);

    try {
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            console.log("Juego no encontrado con ID:", gameId);
            return res.status(404).send('Juego no encontrado');
        }

        const participant = await prisma.gameParticipant.create({
            data: {
                gameId: gameId,
                userId: userId,
                role: 'Player'
            }
        }); 

        // Configurar el mensaje de correo electrónico
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: game.creatorId.email,
            subject: `Nuevo participante en tu partida: ${game.name}`,
            text: `Hola ${game.creatorId.firstName},\n\n${req.user.displayName} se ha unido a tu partida "${game.name}".`
        };

        // Enviar el correo electrónico
        await transporter.sendMail(mailOptions);

        res.redirect('/some-page');
    } catch (error) {
        console.error("Error en prisma.gameParticipant.create():", error);
        res.status(500).send('Error al unirse a la partida');
    }
});

module.exports = router;