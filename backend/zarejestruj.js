const { REST, Routes } = require('discord.js');
require('dotenv').config();
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const commands = [
    {
        name: 'mojeid',
        description: 'Wyświetl swój Discord ID'
    },
	{
		name: 'pomoc',
		description: 'Wyświetla listę dostępnych komend'
	},
	{
		name: 'konto',
		description: 'Wyświetla twój stan konta w systemie',
		options: [
			{
				name: "discord",
				description: "Wyświetla stan konta w systemie osoby o podanym koncie Discord (tylko dla administracji)",
				type: 6
			},
			{
				name: 'login',
				description: "Wyświetla stan konta w systemie osoby o podanym loginie (tylko dla administracji)",
				type: 3
			}
		]
	},
	{
		name: 'trasy',
		description: 'Wyświetla aktualną statystykę tras w systemie'
	},
	{
		name: "cennik",
		description: "Wyświetla cennik uprawnień w systemie"
	}
];

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			//Routes.applicationGuildCommands(process.env.DISCORD_APPID, process.env.DISCORD_SERVERID),
			Routes.applicationCommands(process.env.DISCORD_APPID),
			{ body: commands },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();