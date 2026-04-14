const { verifyKey } = require("discord-interactions");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).end("Method Not Allowed");
    }

    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    const rawBody = Buffer.from(JSON.stringify(req.body));

    const isValidRequest = await verifyKey(
        rawBody,
        signature,
        timestamp,
        process.env.DISCORD_PUBLIC_KEY
    );

    if (!isValidRequest) {
        return res.status(401).end("Invalid request signature");
    }

    const interaction = req.body;

    if (interaction.type === 1) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify({ type: 1 }));
    }

    if (interaction.type === 2) {
        const { name } = interaction.data;
        const username = interaction.member ? interaction.member.user.username : interaction.user.username;

        // --- COMANDO /INSULTO (Insulto Direto) ---
        if (name === "insulto") {
            try {
                const response = await fetch("https://v2.jokeapi.dev/joke/Pun,Miscellaneous,Dark?type=single&blacklistFlags=religious,political,racist,sexist");
                const data = await response.json();
                const insultoEN = data.joke || "You are as useful as a screen door on a submarine.";

                const traducaoRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(insultoEN)}&langpair=en|pt-BR`);
                const traducaoJSON = await traducaoRes.json();
                const insultoPT = traducaoJSON.responseData.translatedText;

                return res.send({
                    type: 4,
                    data: {
                        embeds: [{
                            title: "MewMio diz:",
                            description: `**${username}**, ${insultoPT}`,
                            color: 0xff0000,
                        }]
                    }
                });
            } catch (err) {
                return res.send({ type: 4, data: { content: "Até meu xingamento deu erro nessa porra." } });
            }
        }

        // --- COMANDO /PIADA (JokeAPI Dark) ---
        if (name === "piada") {
            try {
                const response = await fetch("https://v2.jokeapi.dev/joke/Dark?type=single");
                const data = await response.json();
                const piadaEN = data.joke || "You´re slower than every snail in the world";

                const traducaoRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(piadaEN)}&langpair=en|pt-BR`);
                const traducaoJSON = await traducaoRes.json();
                const piadaPT = traducaoJSON.responseData.translatedText;

                return res.send({
                    type: 4,
                    data: {
                        embeds: [{
                            title: "MewMio diz:",
                            description: piadaPT,
                            color: 0xff5566,
                        }]
                    }
                });
            } catch (err) {
                return res.send({ type: 4, data: { content: "A API de piadas contou uma tão ruim que quebrou." } });
            }
        }

        // --- COMANDO /FILOSOFIA ---
        if (name === "filosofia") {
            try {
                const response = await fetch("https://zenquotes.io/api/random");
                const data = await response.json();
                const fraseEN = data[0].q;
                const autor = data[0].a;

                const traducaoRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(fraseEN)}&langpair=en|pt-BR`);
                const traducaoJSON = await traducaoRes.json();
                const frasePT = traducaoJSON.responseData.translatedText;

                return res.send({
                    type: 4,
                    data: {
                        embeds: [{
                            title: "📜 Receba a inteligência:",
                            description: `*"${frasePT}"*\n— **${autor}**`,
                            color: 0x9966ff
                        }]
                    }
                });
            } catch (err) {
                return res.send({ type: 4, data: { content: "Erro ao buscar filosofia." } });
            }
        }

        // --- COMANDO /GATINHO ---
        if (name === "gatinho") {
            try {
                const response = await fetch("https://api.thecatapi.com/v1/images/search?mime_types=gif");
                const data = await response.json();
                if (!data[0] || !data[0].url) return res.send({ type: 4, data: { content: "Gatos fugiram." } });

                return res.send({
                    type: 4,
                    data: {
                        embeds: [{
                            title: "mrmmrmrrrrrowwww",
                            image: { url: data[0].url },
                            color: 0xffaacd
                        }]
                    }
                });
            } catch (err) {
                return res.send({ type: 4, data: { content: "Erro ao pegar gatinho." } });
            }
        }
    }

    return res.status(400).end("Unknown interaction type");
};