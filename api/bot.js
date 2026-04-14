const { verifyKey } = require("discord-interactions");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).end("Method Not Allowed");
    }

    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    const rawBody = Buffer.from(JSON.stringify(req.body));
    console.log("Temos Public Key?", !!process.env.DISCORD_PUBLIC_KEY);

    const isValidRequest = await verifyKey(
        rawBody,
        signature,
        timestamp,
        process.env.DISCORD_PUBLIC_KEY
    );

    if (!isValidRequest) {
        console.error("❌ Assinatura não bateu.");
        return res.status(401).end("Invalid request signature");
    }

    console.log("✅ Verificação de segurança passou!");

    const interaction = req.body;

    if (interaction.type === 1) {
        console.log("PING recebido! Respondendo PONG...");
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify({ type: 1 }));
    }

    //Comando /insulto
    if (interaction.type === 2) {
        const { name } = interaction.data;

        const username = interaction.member ? interaction.member.user.username : interaction.user.username;

        if (name === "insulto") {
            try {
                const response = await fetch("https://insult.ooo/api/insult");
                const data = await response.json();

                const insultoEN = data.insult || "You are so boring that even a snail would leave you.";

                const traducaoRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(insultoEN)}&langpair=en|pt`);
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
                console.error(err);
                return res.send({
                    type: 4,
                    data: { content: "Até meu xingamento deu erro. Você é um caso perdido." }
                });
            }
        }

        // Comando /piada
        if (name === "piada") {
            try {
                const response = await fetch("https://v2.jokeapi.dev/joke/Dark?type=single");
                const data = await response.json();

                const piadaEN = data.joke || "You are so lucky I can't think of an insult right now.";

                const traducaoRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(insultoEN)}&langpair=en|pt`);
                const traducaoJSON = await traducaoRes.json();
                const piadaPT = traducaoJSON.responseData.translatedText;

                return res.send({
                    type: 4, // InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
                    data: {
                        embeds: [
                            {
                                title: "MewMio diz:",
                                description: `${piadaPT}`,
                                color: 0xff5566,
                            }
                        ]
                    }
                });
            } catch (err) {
                console.error(err);
                return res.send({
                    type: 4,
                    data: { content: "API da piada caiu." }
                });
            }
        }

        // Comando /filosofia
        if (name === "filosofia") {
            try {
                const response = await fetch("https://zenquotes.io/api/random");
                const data = await response.json();

                const fraseEN = data[0].q;
                const autor = data[0].a;

                const traducaoRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(fraseEN)}&langpair=en|pt`);
                const traducaoJSON = await traducaoRes.json();
                const frasePT = traducaoJSON.responseData.translatedText;

                return res.send({
                    type: 4,
                    data: {
                        embeds: [{
                            title: "📜 receba a inteligência",
                            description: `*"${frasePT}"*\n— **${autor}**`,
                            color: 0x9966ff
                        }]
                    }
                });
            } catch (err) {
                console.error(err);
                return res.send({ type: 4, data: { content: "Erro ao buscar filosofia." } });
            }
        }

        // Comando /gatinho
        if (name === "gatinho") {
            try {
                const response = await fetch("https://api.thecatapi.com/v1/images/search?mime_types=gif");
                const data = await response.json();

                if (!data[0] || !data[0].url) {
                    return res.send({ type: 4, data: { content: "Nenhum gatinho encontrado." } });
                }

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
                console.error(err);
                return res.send({ type: 4, data: { content: "Erro ao pegar GIF de gatinho." } });
            }
        }
    }

    return res.status(400).end("Unknown interaction type");
};