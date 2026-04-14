require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const CLIENT_ID = "1438948155981955206";

const commands = [
    new SlashCommandBuilder()
        .setName("insulto")
        .setDescription("MewMio insulta você"),
    new SlashCommandBuilder()
        .setName("piada")
        .setDescription("MewMio conta uma piada ácida"),
    new SlashCommandBuilder()
        .setName("filosofia")
        .setDescription("quotes de sabedoria felina ancestral"),
    new SlashCommandBuilder()
        .setName("gatinho")
        .setDescription("gif aleatório de gatinho")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Iniciando o registro dos comandos...");

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log("Comandos registrados com sucesso!");
    } catch (error) {
        console.error("Erro ao registrar comandos:", error);
    }
})();
