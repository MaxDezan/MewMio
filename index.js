require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName("insulto")
        .setDescription("MewMio insulta você"),

    new SlashCommandBuilder()
        .setName("filosofia")
        .setDescription("quotes de sabedoria felina ancestral"),

    new SlashCommandBuilder()
        .setName("gatinho")
        .setDescription("gif aleatório de gatinho")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("clientReady", async () => {
    console.log(`😼 MewMio online como: ${client.user.tag}`);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log("Comandos registrados!");
    } catch (err) {
        console.error(err);
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "insulto") {
        try {
            const res = await fetch("https://evilinsult.com/generate_insult.php?lang=pt&type=json");
            const data = await res.json();

            if (!data || !data.insult)
                return interaction.reply("Erro ao buscar insulto.");

            return interaction.reply({
                embeds: [
                    {
                        title: "MewMio diz:",
                        description: `**${interaction.user.username}**, ${data.insult}`,
                        color: 0xff5566,
                        thumbnail: { url: client.user.displayAvatarURL() }
                    }
                ]
            });
        } catch (err) {
            console.error(err);
            return interaction.reply("API do insulto caiu.");
        }
    }

    if (interaction.commandName === "filosofia") {
        const res = await fetch("https://zenquotes.io/api/random");
        const data = await res.json();

        const fraseEN = data[0].q;
        const autor = data[0].a;

        const traducaoRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(fraseEN)}&langpair=en|pt`);
        const traducaoJSON = await traducaoRes.json();
        const frasePT = traducaoJSON.responseData.translatedText;

        return interaction.reply({
            embeds: [
                {
                    title: "📜 receba a inteligência",
                    description: `*"${frasePT}"*\n— **${autor}**`,
                    color: 0x9966ff
                }
            ]
        });
    }



    if (interaction.commandName === "gatinho") {
        try {
            const res = await fetch(
                "https://api.thecatapi.com/v1/images/search?mime_types=gif"
            );
            const data = await res.json();

            if (!data[0] || !data[0].url)
                return interaction.reply("Nenhum gatinho encontrado.");

            return interaction.reply({
                embeds: [
                    {
                        title: "mrmmrmrrrrrowwww",
                        image: { url: data[0].url },
                        color: 0xffaacd
                    }
                ]
            });
        } catch (err) {
            console.error(err);
            return interaction.reply("Erro ao pegar GIF de gatinho.");
        }
    }

});

client.login(process.env.TOKEN);