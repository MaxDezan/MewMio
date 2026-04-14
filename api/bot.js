const { verifyKey } = require("discord-interactions");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).end("Method Not Allowed");
    }

    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    const rawBody = JSON.stringify(req.body);

    console.log("Temos Public Key?", !!process.env.DISCORD_PUBLIC_KEY);

    const isValidRequest = verifyKey(
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
        console.log("RECEBEMOS O PING! Devolvendo PONG (1)...");
        return res.send({ type: 1 });
    }

    if (interaction.type === 2) {
        const { name } = interaction.data;

        const username = interaction.member ? interaction.member.user.username : interaction.user.username;

        //Comando insulto
        if (name === "insulto") {
            try {
                const response = await fetch("https://evilinsult.com/generate_insult.php?lang=pt&type=json");
                const data = await response.json();

                return res.send({
                    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                    data: {
                        embeds: [{
                            title: "MewMio diz:",
                            description: `**${username}**, ${data.insult}`,
                            color: 0xff5566,
                        }]
                    }
                });
            } catch (err) {
                console.error(err);
                return res.send({ type: 4, data: { content: "API do insulto caiu." } });
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