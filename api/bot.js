const { InteractionType, InteractionResponseType, verifyKey } = require("discord-interactions");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).end("Method Not Allowed");
    }

    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    const rawBody = JSON.stringify(req.body);

    const isValidRequest = verifyKey(
        rawBody,
        signature,
        timestamp,
        process.env.DISCORD_PUBLIC_KEY
    );

    if (!isValidRequest) {
        return res.status(401).end("Invalid request signature");
    }

    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
        return res.send({
            type: InteractionResponseType.PONG,
        });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        const { name } = interaction.data;

        if (name === "insulto") {
            try {
                const response = await fetch("https://evilinsult.com/generate_insult.php?lang=pt&type=json");
                const data = await response.json();

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [
                            {
                                title: "MewMio diz:",
                                description: `**${interaction.member.user.username}**, ${data.insult}`,
                                color: 0xff5566,
                            }
                        ]
                    }
                });
            } catch (err) {
                console.error(err);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: "API do insulto caiu." }
                });
            }
        }

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
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [
                            {
                                title: "📜 receba a inteligência",
                                description: `*"${frasePT}"*\n— **${autor}**`,
                                color: 0x9966ff
                            }
                        ]
                    }
                });
            } catch (err) {
                console.error(err);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: "Erro ao buscar filosofia." }
                });
            }
        }

        if (name === "gatinho") {
            try {
                const response = await fetch("https://api.thecatapi.com/v1/images/search?mime_types=gif");
                const data = await response.json();

                if (!data[0] || !data[0].url) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: "Nenhum gatinho encontrado." }
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [
                            {
                                title: "mrmmrmrrrrrowwww",
                                image: { url: data[0].url },
                                color: 0xffaacd
                            }
                        ]
                    }
                });
            } catch (err) {
                console.error(err);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: "Erro ao pegar GIF de gatinho." }
                });
            }
        }
    }

    return res.status(400).end("Unknown interaction type");
};
