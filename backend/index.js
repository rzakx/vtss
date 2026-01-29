import express from "express";
import mysql from 'mysql2/promise';
import fs, { stat, unlink } from "node:fs";
import path from "node:path";
import multer from "multer";
import Axios from "axios";
import cors from "cors";
import CryptoJS from "crypto-js";
// const CryptoJS = require("crypto-js");
// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer";
const app = express();
const port = 30014;
import dotenv from "dotenv";
dotenv.config();
//TELEMETRIA INIT
// const zlib = require("zlib");
import zlib from "node:zlib";
import { Server } from "socket.io";
import { ActivityType, EmbedBuilder, Client, Events, Collection, GatewayIntentBits, MessageFlags } from 'discord.js';
const io = new Server(2139, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	}
});

const KLUCZ_H = process.env.KLUCZ_H;

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if(file.fieldname === 'awatarImg'){
			cb(null, 'awatary/');
		} else if(file.fieldname === 'osiagnieciaImg'){
			cb(null, 'osiagniecia/');
		} else if(file.fieldname === 'zdjMiesiacaImg'){
			cb(null, 'zdjmiesiaca/');
		} else {
			cb(null, 'trasy/');
		}
	},
	filename: (req, file, cb) => {
		if(file.fieldname === 'awatarImg'){
			cb(null, req.params.login + '-' + Date.now() + path.extname(file.originalname));
		} else if(file.fieldname === 'osiagnieciaImg'){
			cb(null, 'osiagniecieImg-' + Date.now() + path.extname(file.originalname));
		} else if(file.fieldname === 'zdjMiesiacaImg'){
			cb(null, 'zdjMiesiaca-' + Date.now() + path.extname(file.originalname));
		} else {
			cb(null, 'zdjTrasy-' + Date.now() + path.extname(file.originalname));
		}
	}
});
const upload = multer({storage: storage});
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
	user: process.env.DB_USER,
	host: "localhost",
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: 3306,
	multipleStatements: true,
	// dateStrings: true,
	decimalNumbers: true,
	charset: 'utf8mb4_general_ci'
});

let stawkiPanstwaTelemetria = [
	{ name: "Albania", stawka: 1.774 },
	{ name: "Austria", stawka: 1.534 },
	{ name: "Belgium", stawka: 1.635 },
	{ name: "Bosnia-Herzegovina", stawka: 1.232 },
	{ name: "Bulgaria", stawka: 1.282 },
	{ name: "Croatia", stawka: 1.553 },
	{ name: "Czech", stawka: 1.420 },
	{ name: "Denmark", stawka: 1.710 },
	{ name: "Estonia", stawka: 1.471 },
	{ name: "Finland", stawka: 1.669 },
	{ name: "France", stawka: 1.609 },
	{ name: "Germany", stawka: 1.561 },
	{ name: "Hungary", stawka: 1.536 },
	{ name: "Italy", stawka: 1.679 },
	{ name: "Kosovo", stawka: 1.400 },
	{ name: "Latvia", stawka: 1.584 },
	{ name: "Lithuania", stawka: 1.389 },
	{ name: "Luxembourg", stawka: 1.411 },
	{ name: "Macedonia", stawka: 1.130 },
	{ name: "Montenegro", stawka: 1.410 },
	{ name: "Netherlands", stawka: 1.682 },
	{ name: "Norway", stawka: 1.646 },
	{ name: "Poland", stawka: 1.501 },
	{ name: "Portugal", stawka: 1.531 },
	{ name: "Romania", stawka: 1.447 },
	{ name: "Russia", stawka: 0.673 },
	{ name: "Serbia", stawka: 1.658 },
	{ name: "Slovakia", stawka: 1.459 },
	{ name: "Slovenia", stawka: 1.519 },
	{ name: "Spain", stawka: 1.411 },
	{ name: "Sweden", stawka: 1.519 },
	{ name: "Switzerland", stawka: 2.015 },
	{ name: "Turkey", stawka: 1.152 },
	{ name: "uk", stawka: 1.724 },
	{ name: "Aland", stawka: 1.980 },
	{ name: "Andorra", stawka: 1.271 },
	{ name: "Armenia", stawka: 1.211 },
	{ name: "Azerbaidjan", stawka: 0.531 },
	{ name: "Belarus", stawka: 0.673 },
	{ name: "Cyprus", stawka: 1.479 },
	{ name: "Faroe Islands", stawka: 1.347 },
	{ name: "Georgia", stawka: 1.105 },
	{ name: "Greece", stawka: 1.564 },
	{ name: "Greenland", stawka: 1.010 },
	{ name: "Guernsey", stawka: 1.880 },
	{ name: "Iceland", stawka: 2.041 },
	{ name: "Ireland", stawka: 1.010 },
	{ name: "Isle of Man", stawka: 1.880 },
	{ name: "Jersey", stawka: 1.940 },
	{ name: "Liechtenstein", stawka: 2.068 },
	{ name: "Malta", stawka: 1.210 },
	{ name: "Moldova", stawka: 1.048 },
	{ name: "Monaco", stawka: 2.110 },
	{ name: "Northern Ireland", stawka: 1.700 },
	{ name: "San Marino", stawka: 1.545 },
	{ name: "Svalbard", stawka: 1.646 },
	{ name: "Ukraine", stawka: 1.212 },
	{ name: "Egypt", stawka: 0.214 },
	{ name: "Iraq", stawka: 0.420 },
	{ name: "Israel", stawka: 1.768 },
	{ name: "Jordan", stawka: 0.886 },
	{ name: "Lebanon", stawka: 0.632 },
	{ name: "Libya", stawka: 0.028 },
	{ name: "Saudi Arabia", stawka: 0.277 },
	{ name: "Syria", stawka: 3.690 },
	{ name: "westbank", stawka: 1.768 }
];

let stawkiPanstwaTelemetriaATS = [
	{ name: "Arkansas", stawka: 0.893 },
	{ name: "Arizona", stawka: 0.975 },
	{ name: "California", stawka: 1.310 },
	{ name: "Colorado", stawka: 0.916 },
	{ name: "Idaho", stawka: 0.961 },
	{ name: "Kansas", stawka: 0.893 },
	{ name: "Montana", stawka: 0.985 },
	{ name: "Nebraska", stawka: 0.901 },
	{ name: "Nevada", stawka: 1.001 },
	{ name: "New Mexico", stawka: 0.922 },
	{ name: "Oklahoma", stawka: 0.837 },
	{ name: "Oregon", stawka: 1.043 },
	{ name: "Texas", stawka: 0.853 },
	{ name: "Utah", stawka: 0.927 },
	{ name: "Washington", stawka: 1.181 },
	{ name: "Wyoming", stawka: 0.951 },
]

let miastaTelemetria, overlayeTelemetria;
let miastaTelemetriaATS, overlayeTelemetriaATS;
let miastaTelemetriaPROMODS, overlayeTelemetriaPROMODS;
const wczytajInfoTelemetria = async () => {
	//stawki paliwowe ETS2
	try {
		const [rst] = await db.query("SELECT id, name, stawka FROM stawkiPaliwowe WHERE gra = 0");
		stawkiPanstwaTelemetria = [];
		rst.forEach(s => stawkiPanstwaTelemetria.push({id: s.id, name: s.name, stawka: s.stawka}));
		console.log("Wczytano stawki paliwowe ETS2");
	} catch(erst){
		console.log("BŁĄD WCZYTYWANIA STAWEK PALIWOWYCH DLA ETS2");
		return;
	}

	//stawki paliwowe ATS
	try {
		const [rst2] = await db.query("SELECT id, name, stawka FROM stawkiPaliwowe WHERE gra = 1");
		stawkiPanstwaTelemetriaATS = [];
		rst2.forEach(s => stawkiPanstwaTelemetriaATS.push({id: s.id, name: s.name, stawka: s.stawka}));
		console.log("Wczytano stawki paliwowe ATS");
	} catch(erst2){
		console.log("BŁĄD WCZYTYWANIA STAWEK PALIWOWYCH DLA ATS");
		return;
	}

	const miastaReq = await fetch("https://thebossspedition.pl/MAPA/Cities.json"); //require("./Cities.json");
	const overlayeReq = await fetch("https://thebossspedition.pl/MAPA/Overlays.json"); //require("./Overlays.json");
    miastaTelemetria = await miastaReq.json();
    overlayeTelemetria = await overlayeReq.json();

	const miastaReqATS = await fetch("https://thebossspedition.pl/MAPAATS/Cities.json"); //require("./Cities.json");
	const overlayeReqATS = await fetch("https://thebossspedition.pl/MAPAATS/Overlays.json"); //require("./Overlays.json");
    miastaTelemetriaATS = await miastaReqATS.json();
    overlayeTelemetriaATS = await overlayeReqATS.json();

	const miastaReqPRO = await fetch("https://thebossspedition.pl/PROMODS/Cities.json"); //require("./Cities.json");
	const overlayeReqPRO = await fetch("https://thebossspedition.pl/PROMODS/Overlays.json"); //require("./Overlays.json");
    miastaTelemetriaPROMODS = await miastaReqPRO.json();
    overlayeTelemetriaPROMODS = await overlayeReqPRO.json();
};
wczytajInfoTelemetria();

const generujKodRekrutacja = () => {
	const znaki = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let kodZwrotny = '';
	for (let i = 0; i < 8; i++) {
		kodZwrotny += znaki.charAt(Math.floor(Math.random() * znaki.length));
	}
	return kodZwrotny;
}

//DISCORD BOT
// const { ActivityType, EmbedBuilder, Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const dcbot = new Client({ intents: [GatewayIntentBits.Guilds] });
dcbot.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	dcbot.user.setActivity('/pomoc', { type: ActivityType.Watching});
});
dcbot.login(process.env.DISCORD_TOKEN);
dcbot.on('interactionCreate', async(inter) => {
	if(!inter.isCommand()) return;
	const komenda = inter.commandName;
	if(komenda == "mojeid"){
		console.log(dataLog(), `${inter.user.displayName} użył komendy /mojeid`);
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp()
		.setTitle("Twoje ID")
		.setColor(0x01F1AD)
		.addFields({name: "Użytkownik", value: `<@${inter.user.id}>`})
		.addFields({name: "Discord ID", value: inter.user.id})
		.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await inter.reply({embeds: [embed1], flags: MessageFlags.Ephemeral});
	};
	if(komenda == "rekrutacja"){
		const idDiscord = inter.user.id;
		let kodZwrotny, sprawdzKod;
		do {
			kodZwrotny = generujKodRekrutacja();
			[ sprawdzKod ] = await db.query("SELECT 1 FROM rekrutacja WHERE klucz = ?", [kodZwrotny]);
		} while( sprawdzKod.length > 0 );

		const embedRekru = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp()
		.setTitle("Weryfikacja rekrutacji")
		.setColor(0x01F1AD)
		.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		try {
			await db.execute("INSERT INTO rekrutacja (klucz, discord) VALUES (?, ?)", [kodZwrotny, idDiscord]);
			embedRekru.setDescription(`Twój kod weryfikacyjny dla zgłoszenia rekrutacyjnego:\n## ${kodZwrotny.toUpperCase()}`)
		} catch(er){
			console.log("REKRU ", er);
			embedRekru.setDescription(`Wystąpił błąd podczas generowania kodu zwrotnego. Spróbuj ponownie lub skontaktuj się z administracją.`)
		}
		await inter.reply({embeds: [embedRekru], flags: MessageFlags.Ephemeral});
	}
	if(komenda == "pomoc"){
		console.log(dataLog(), `${inter.user.displayName} użył komendy /pomoc`);
		const embed2 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp()
		.setTitle("Dostępna lista komend")
		.setColor(0x01F1AD)
		.addFields({name: "Wyświetl listę dostępnych komend", value: "/pomoc"})
		.addFields({name: "Wyświetl swój Discord ID", value: "/mojeid"})
		.addFields({name: "Wyświetl swój stan konta w systemie", value: "/konto"})
		.addFields({name: "Wyświetl stan konta osoby ### w systemie", value: "/konto ###"})
		.addFields({name: "Wyświetl aktualną statystykę tras w systemie", value: "/trasy"})
		.addFields({name: "Wygeneruj kod zwrotny dla zgłoszenia rekrutacyjnego", value: "/rekrutacja"})
		.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await inter.reply({embeds: [embed2], flags: MessageFlags.Ephemeral});
	}
	if(komenda == "cennik"){
		console.log(dataLog(), `${inter.user.displayName} użył komendy /cennik`);
		const embedzik = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Cennik uprawnień").setColor(0x01F1AD).setImage('https://system.thebossspedition.pl/img/cennik.png');
		await inter.reply({embeds: [embedzik], flags: MessageFlags.Ephemeral});
	}
	if(komenda == "trasy"){
		console.log(dataLog(), `${inter.user.displayName} użył komendy /trasy`);
		let embedData = {
			zatwierdzone: 0,
			oczekujace: 0,
			odrzuconePerm: 0,
			odrzuconePopraw: 0
		};
		try {
			const [r] = await db.execute(`SELECT
			SUM(CASE WHEN zatwierdz = 0 THEN 1 ELSE 0 END) AS oczekujace,
			SUM(CASE WHEN zatwierdz = 1 THEN 1 ELSE 0 END) AS zatwierdzone,
			SUM(CASE WHEN zatwierdz = 2 AND dozwolpoprawke = 0 THEN 1 ELSE 0 END) AS odrzuconePerm,
			SUM(CASE WHEN zatwierdz = 2 AND dozwolpoprawke = 1 THEN 1 ELSE 0 END) AS odrzuconePopraw
			FROM trasy`);
			embedData = {...embedData, ...r[0]};
		} catch(er) {
			console.log(er);
		} finally {
			const embed3 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp()
			.setDescription(`Aktualna statystyka oddanych tras w systemie.`)
			.setColor(0x01F1AD).setTitle("Statystyka tras")
			.addFields({name: "Łączna ilość", value: Number(embedData.zatwierdzone)+Number(embedData.oczekujace)+Number(embedData.odrzuconePerm)+Number(embedData.odrzuconePopraw), inline: true})
			.addFields({name: "Zatwierdzonych", value: embedData.zatwierdzone, inline: true})
			.addFields({name: "Oczekujących", value: embedData.oczekujace, inline: true})
			.addFields({name: "Odrzucone permanentnie", value: embedData.odrzuconePerm, inline: true})
			.addFields({name: "Odrzucone do poprawy", value: embedData.odrzuconePopraw, inline: true})
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			await inter.reply({embeds: [embed3], flags: MessageFlags.Ephemeral});
		};
	}
	if(komenda == "konto"){
		console.log(dataLog(), `${inter.user.displayName} użył komendy /konto`);
		const embed4 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp()
		.setColor(0x01F1AD).setTitle("Stan konta profilu")
		.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');

		let danezwrotne = [];
		if(inter.options.data.length){
			//jesli podane parametry aka czyjes konto
			inter.options.data.map((opcje) => {
				if(opcje.name == "discord"){
					kogo = opcje.value;
					danezwrotne.push([true, opcje.value]);
				}
				if(opcje.name == "login"){
					kogo = opcje.value;
					danezwrotne.push([false, opcje.value]);
				}
			})
			let query;
			let query2;
			if(danezwrotne.length > 0){
				// czyjes konto
				if(danezwrotne[0][0]) query = "SELECT `id`, `login`, `discord` FROM `konta` WHERE `discord` = ?";
				else query = "SELECT `id`, `login`, `discord` FROM `konta` WHERE `login` = ?";
				if(danezwrotne.length > 1){
					if(danezwrotne[1][0]) query2 = "SELECT `id`, `login`, `discord` FROM `konta` WHERE `discord` = ?";
					else query2 = "SELECT `id`, `login`, `discord` FROM `konta` WHERE `login` = ?";
				}
				let zwrot;
				const [r] = await db.execute(query, danezwrotne[0][1]);
				//czy znaleziono goscia w bazie
				if(r.length > 0){
					zwrot = {id: r[0]['id'], login: r[0]['login'], discord: r[0]['discord']};
					let stankonta = 0;
                    try {
                        // wlasnyzarobek, kary, premie
                        const [rt] = await db.execute("SELECT SUM(`trasy`.`wlasnyzarobek`) as 'zarobek', SUM(`trasy`.`premia`) as 'premie', SUM(`trasy`.`kara`) as 'kary' FROM `trasy` WHERE `trasy`.`kto` = ? AND `trasy`.`zatwierdz` = 1", [zwrot.id]);
                        stankonta = stankonta + rt[0].zarobek + rt[0].premie - rt[0].kary;
                        // uprawnienia
                        const [ru] = await db.execute("SELECT SUM(`uprawnienia`.`cena`) as 'c' FROM `uprawnienia` WHERE `kto` = ?", [zwrot.id]);
                        stankonta = stankonta - ru[0].c;
                        // winiety
                        const [rw] = await db.execute("SELECT SUM(`kupionewiniety`.`zaile`) as 'c' FROM `kupionewiniety` WHERE `kto` = ?", [zwrot.id]);
                        stankonta = stankonta - rw[0].c;
                        // dodawane
                        const [rd] = await db.execute("SELECT SUM(`dodawaniekwoty`.`kwota`) as 'c' FROM `dodawaniekwoty` WHERE `komu` = ?", [zwrot.id]);
                        stankonta = stankonta + rd[0].c;
                    } finally {
                        embed4.setDescription(`Stan konta użytkownika\n${danezwrotne[0][0] ? 
                            zwrot.login + " <@"+danezwrotne[0][1]+">"
                            : ( zwrot.discord ? zwrot.login + " <@"+zwrot.discord+">" : zwrot.login )
                        } wynosi\n${stankonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) }`);
                        await inter.reply({embeds: [embed4], flags: MessageFlags.Ephemeral});
                    }
				} else {
					//sprobuj druga metoda jak jest
					if(query2){
                        const [r2] = await db.execute(query2, danezwrotne[1][1]);
                        if(r2.length > 0){
                            zwrot = {id: r2[0]['id'], login: r2[0]['login'], discord: r2[0]['discord']};
                            let stankonta = 0;
                            try {
                                // wlasnyzarobek, kary, premie
                                const [rt] = await db.execute("SELECT SUM(`trasy`.`wlasnyzarobek`) as 'zarobek', SUM(`trasy`.`premia`) as 'premie', SUM(`trasy`.`kara`) as 'kary' FROM `trasy` WHERE `trasy`.`kto` = ? AND `trasy`.`zatwierdz` = 1", [zwrot.id]);
                                stankonta = stankonta + rt[0].zarobek + rt[0].premie - rt[0].kary;
                                // uprawnienia
                                const [ru] = await db.execute("SELECT SUM(`uprawnienia`.`cena`) as 'c' FROM `uprawnienia` WHERE `kto` = ?", [zwrot.id]);
                                stankonta = stankonta - ru[0].c;
                                // winiety
                                const [rw] = await db.execute("SELECT SUM(`kupionewiniety`.`zaile`) as 'c' FROM `kupionewiniety` WHERE `kto` = ?", [zwrot.id]);
                                stankonta = stankonta - rw[0].c;
                                // dodawane
                                const [rd] = await db.execute("SELECT SUM(`dodawaniekwoty`.`kwota`) as 'c' FROM `dodawaniekwoty` WHERE `komu` = ?", [zwrot.id]);
                                stankonta = stankonta + rd[0].c;
                            } finally {
                                embed4.setDescription(`Stan konta użytkownika\n${danezwrotne[1][0] ? 
                                    zwrot.login + " <@"+danezwrotne[1][1]+">"
                                    : (
                                        zwrot.discord ?
                                        zwrot.login + " <@"+zwrot.discord+">"
                                        : zwrot.login
                                    )
                                } wynosi\n${stankonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) }`);
                                await inter.reply({embeds: [embed4], flags: MessageFlags.Ephemeral});
                            }                                
                        } else {
                            //nieznaleziono
                            embed4.setDescription(`<@${inter.user.id}>! Podane paremetry nie pokrywają się z żadnym kontem systemowym.`);
                            await inter.reply({embeds: [embed4], flags: MessageFlags.Ephemeral});
                        }
					} else {
						//nieznaleziono
						embed4.setDescription(`<@${inter.user.id}>! Podane paremetry nie pokrywają się z żadnym kontem systemowym.`);
						await inter.reply({embeds: [embed4], flags: MessageFlags.Ephemeral});
					}
				}
			}
		} else {
			//sprawdz wlasne konto
			const [r] = await db.execute("SELECT `id`, `login` FROM `konta` WHERE `discord` = ?", [inter.user.id]);
			if(r.length > 0){
				let zwrot = {id: r[0]['id'], login: r[0]['login'], discord: r[0]['discord']};
				let stankonta = 0;
				//wlasnyzarobek, kary, premie
				try {
					const [rt] = await db.execute("SELECT SUM(`trasy`.`wlasnyzarobek`) as 'zarobek', SUM(`trasy`.`premia`) as 'premie', SUM(`trasy`.`kara`) as 'kary' FROM `trasy` WHERE `trasy`.`kto` = ? AND `trasy`.`zatwierdz` = 1", [zwrot.id]);
					stankonta = stankonta + rt[0].zarobek + rt[0].premie - rt[0].kary;
					const [ru] = await db.execute("SELECT SUM(`uprawnienia`.`cena`) as 'c' FROM `uprawnienia` WHERE `kto` = ?", [zwrot.id]);
					stankonta = stankonta - ru[0].c;
					const [rw] = await db.execute("SELECT SUM(`kupionewiniety`.`zaile`) as 'c' FROM `kupionewiniety` WHERE `kto` = ?", [zwrot.id]);
					stankonta = stankonta - rw[0].c;
					const [rd] = await db.execute("SELECT SUM(`dodawaniekwoty`.`kwota`) as 'c' FROM `dodawaniekwoty` WHERE `komu` = ?", [zwrot.id]);
					stankonta = stankonta + rd[0].c;
				} finally {
					embed4.setDescription(`Twój stan konta w systemie wynosi ${stankonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) }`);
					await inter.reply({embeds: [embed4], flags: MessageFlags.Ephemeral});
				}
			} else {
				embed4.setDescription(`<@${inter.user.id}>! Twoje konto Discord nie jest powiązane z żadnym kontem systemowym.`);
				await inter.reply({embeds: [embed4], flags: MessageFlags.Ephemeral});
			}
		}
	}
});

const smtp = nodemailer.createTransport({
	host: 'thebossspedition.pl',
	port: 25,
	ignoreTLS: true,
	auth: {
		user: 'no-reply@thebossspedition.pl',
		pass: process.env.EMAIL_PASS
	},
	dkim: {
		domainName: "thebossspedition.pl",
		keySelector: "420",
		privateKey: process.env.DKIM
	}
});

const dataLog = () => {
	return "["+new Date().toLocaleString('pl')+"]";
};

app.get("/statystykiGlowna", async (req, res) => {
	try {
		const [trasy] = await db.query("SELECT COUNT(*) as ile, SUM(przejechane) as suma FROM trasy WHERE trasy.zatwierdz = 1");
		const [aktywniKierowcy] = await db.query("SELECT COUNT(*) as k FROM konta WHERE login NOT IN ('sotiio', 'testowe')");
		res.send({checked: true, przejechane: trasy[0].suma, ladunkow: trasy[0].ile, kierowcow: aktywniKierowcy[0].k});
	} catch(er) {
		res.send({checked: true, przejechane: 7_634_333, ladunkow: 3287, kierowcow: 8})
	}
});

app.get("/kierowcyGlowna", async (req, res) => {
	const [dane] = await db.query(`SELECT
			konta.login as 'login',
			konta.awatar as 'awatar',
			konta.kiedydolaczyl as 'dolaczyl',
			typkonta.nazwa as 'typkonta',
			rangi.nazwa as 'stanowisko',
			(SELECT COUNT(*) FROM trasy WHERE trasy.kto = konta.id AND trasy.zatwierdz = 1) as 'iloscTras',
			(SELECT SUM(trasy.przejechane) FROM trasy WHERE trasy.kto = konta.id AND trasy.zatwierdz = 1) as 'przejechaneKm',
			(SELECT SUM(trasy.masaladunku) FROM trasy WHERE trasy.kto = konta.id AND trasy.zatwierdz = 1) as 'ileTon'
		FROM konta
		JOIN typkonta ON typkonta.id = konta.typkonta
		JOIN rangi ON rangi.id = konta.rangi 
		WHERE konta.login NOT IN ('sotiio', 'testowe') ORDER BY konta.typkonta ASC`);
	res.send(dane);
});

app.post("/wiadomoscGlobalna/:login/:token", async (req, res) => {
	try {
		const [r] = await db.query("SELECT `discord` as 'dc' FROM `konta` WHERE `discord` IS NOT NULL");
		res.send({odp: "Wysłano"});
		if(r.length > 0){
			const embed2 = new EmbedBuilder().setFooter({text: `Wysłał: ${req.params.login}`}).setTimestamp()
			.setTitle("Wiadomość globalna").setDescription(`${req.body.wiadomosc}`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			r.map(async (wiersz) => {
				if(!wiersz.dc) return;
				await dcbot.users.send(wiersz.dc, {embeds: [embed2]}).catch(async (er) => {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${wiersz.dc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`)
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			})
		}
	} catch(er) {
		console.log(er);
		res.send({blad: "Błąd SQL"});
		return;
	}

});

app.post("/kontofirmowestan", async (req, res) => {
	try {
		const [r] = await db.query("SELECT SUM(`suma`) as 's' FROM `kontofirmowe`");
		res.send({odp: r[0].s});
	} catch(er) {
		res.send({blad: "Błąd SQL"});
		console.log(er);
		return;
	}
});

app.get("/wersjeGry", (req, res) => {
	//dc niepotrzebne
	Axios.get("https://api.truckersmp.com/v2/version").then((resp) => {
		res.send({
			'resp': 1,
			'tmp': resp.data['name'] + ' ' + resp.data['stage'],
			'ets': resp.data['supported_game_version'],
			'ats': resp.data['supported_ats_game_version']
		});
	}).catch((err) => {
		res.send({blad: 'Nieudane'});
	});
});

//sprawdzenie sesji
app.get("/typkonta/:token", async (req, res) => {
	//dc niepotrzebne
	const token = req.params.token;
	if(token.length == 40){
		const [result] = await db.execute("SELECT `konta`.`typkonta`, `konta`.`rangi` as 'stanowisko', `rangi`.`nazwa` as 'stanowiskoN', `typkonta`.`nazwa`, `konta`.`login` FROM `konta`, `typkonta`, `rangi` WHERE `token` = ? AND `typkonta`.`id` = `konta`.`typkonta` AND `rangi`.`id` = `konta`.`rangi`", [token]);
		if(result.length > 0){
			res.send({typkonta: result[0]['typkonta'], typkontaNazwa: result[0]['nazwa'], login: result[0]['login'], stanowisko: result[0]['stanowisko'], stanowiskoNazwa: result[0]['stanowiskoN']});
		} else {
			res.send({blad: "Nie ma takiego tokenu"});
		}
	} else {
		res.send({blad: "Niepoprawny token"});
	}
});
app.post("/zakupWinietDC/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.token) return;
	const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zakup winiet")
	.setDescription(req.body.wiadomosc)
	.setColor(0x01F1AD)
	.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
	await dcbot.channels.cache.get(process.env.CHANNEL_WINIETY).send({embeds: [embed1]}).then(() => {
		res.send({odp: "OK"});
	}).catch(() => {
		res.send({odp: "Mehh"});
	});	
});
app.post("/nadanieWinietFinal/:komu/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.token || !req.params.komu) return;
	let kierowcaid;
	let kierowcadc;
	const [r] = await db.execute("SELECT `id` as 'i', `discord` as 'd' FROM `konta` WHERE `login` = ?", [req.params.komu]);
	if(r.length > 0){
		kierowcaid = r[0].i;
		kierowcadc = r[0].d;
		await db.execute("INSERT INTO `dodawaniekwoty` (`komu`, `kwota`, `kto`, `powod`) VALUES (?, ?, (SELECT `id` FROM `konta` WHERE `token` = ?), 'Nadanie winiet')", [kierowcaid, req.body.kwota, req.params.token]);
		let odejmowana = -1*parseFloat(req.body.kwota);
		await db.execute("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?, 'Nadawanie winiet')", [odejmowana]);
	}
	const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nadanie winiet")
	.setDescription(req.body.wiadomosc)
	.setColor(0x01F1AD)
	.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
	//channel winiety
	await dcbot.channels.cache.get(process.env.CHANNEL_WINIETY).send({embeds: [embed1]}).then(() => {
		res.send({odp: "OK"});
	}).catch(() => {
		res.send({odp: "Mehh"});
	});
	//powiadomienie pw
	if(kierowcadc){
		await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async (er) => {
			try {
				await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`)
			} catch(erdc){
				console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
			}
		});
	}
});

let zaladowanoUprPow = false;
let zaladowanoWinPow = false;
let winPowiadomienia = [];

const zaladujWinPow = async () => {
	try {
		winPowiadomienia = await JSON.parse(fs.readFileSync("waznoscWiniet.json"));
		zaladowanoWinPow = true;
	} catch {
		console.log("Wystąpił krytyczny błąd załadowania ważności uprawnień");
	}
};

const powiadomWygasniecieWin = async () => {
	let uzytkownicy = [];
	let zablokowanydc = [];
	const [r] = await db.query("SELECT `id` as 'i', `discord` as 'd', `login` as 'l' FROM `konta`");
	//przygotuj liste login, dc, id
	r.map((wiersz) => {
		uzytkownicy[wiersz.i] = { login: wiersz.l, discord: wiersz.d};
	});
	winPowiadomienia.map((w, k) => {
		//console.log("Konto:", k);
		if(uzytkownicy[k] === undefined) return;
		if(!w) return;
		Object.entries(w).map(async (s) => {
			if(s[1]['wygasa7']['minelo']){
				//mija za 7 dni
				if(!s[1]['wygasa7']['powiadomiono']){
					//POWIADOMIC
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność winiety")
					.setDescription(`Użytkownikowi [${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 7 dni wygasa winieta.`)
					.setColor(0xFFD500).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.addFields({name: "Państwo:", value: `${s[1]['p']}`, inline: true})
					.addFields({name: "Data ważności:", value: s[1]['wygasa'], inline: true});
					await dcbot.channels.cache.get(process.env.CHANNEL_WINIETY).send({embeds: [embed1]});
					if(uzytkownicy[k].discord && !zablokowanydc.includes(k)){
						embed1.setDescription(`[${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 7 dni wygasa Tobie winieta.`);
						await dcbot.users.send(uzytkownicy[k].discord, {embeds: [embed1]}).catch(async (erdd) => {
							zablokowanydc.push(k);
							try {
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							} catch(erdc){
								console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
							}
						});
					}
					winPowiadomienia[k][s[0]]['wygasa7']['powiadomiono'] = true;
				}
			}
			if(s[1]['wygasa3']['minelo']){
				//mija za 3 dni
				if(!s[1]['wygasa3']['powiadomiono']){
					//POWIADOMIC
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność winiety")
					.setDescription(`Użytkownikowi [${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 3 dni wygasa winieta.`)
					.setColor(0xFF7700).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.addFields({name: "Państwo:", value: `${s[1]['p']}`, inline: true})
					.addFields({name: "Data ważności:", value: s[1]['wygasa'], inline: true});
					await dcbot.channels.cache.get(process.env.CHANNEL_WINIETY).send({embeds: [embed1]});
					if(uzytkownicy[k].discord && !zablokowanydc.includes(k)){
						embed1.setDescription(`[${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 3 dni wygasa Tobie winieta.`);
						await dcbot.users.send(uzytkownicy[k].discord, {embeds: [embed1]}).catch(async (erdd) => {
							zablokowanydc.push(k);
							try {
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							} catch(erdc){
								console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
							}
						});
					}
					winPowiadomienia[k][s[0]]['wygasa3']['powiadomiono'] = true;
				}
			}
			if(s[1]['wygaslo']['minelo']){
				//wygaslo
				if(!s[1]['wygaslo']['powiadomiono']){
					//POWIADOMIC
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność winiety")
					.setDescription(`Użytkownikowi [${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) wygasła winieta.`)
					.setColor(0xBF0300).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.addFields({name: "Państwo:", value: `${s[1]['p']}`, inline: true})
					.addFields({name: "Data ważności:", value: s[1]['wygasa'], inline: true});
					await dcbot.channels.cache.get(process.env.CHANNEL_WINIETY).send({embeds: [embed1]});
					if(uzytkownicy[k].discord && !zablokowanydc.includes(k)){
						embed1.setDescription(`[${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) twoja winieta wygasła.`);
						await dcbot.users.send(uzytkownicy[k].discord, {embeds: [embed1]}).catch(async (erdd) => {
							zablokowanydc.push(k);
							try {
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							} catch(erdc){
								console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
							}
						});
					}
					winPowiadomienia[k][s[0]]['wygaslo']['powiadomiono'] = true;
				}
			}
		});
	});
	//zapisz do pliku winiety
	try{
		fs.writeFileSync('waznoscWiniet.json', JSON.stringify(winPowiadomienia));
		console.log("Zapisano obiekt ważności winiet");
	} catch {
		console.log("Wystąpił krytyczny błąd w zapisaniu obiektu JSON ważności winiet!");
	}
};

const sprawdzWinWaznosc = async () => {
	const dzis = Date.now();
	if(!zaladowanoWinPow){
		await zaladujWinPow();
		return;
	}
	console.log(dataLog(), "System sprawdza ważność winiet");
	const [r] = await db.query("SELECT `kupionewiniety`.`id` as 'i', `kupionewiniety`.`kto` as 'k', `kupionewiniety`.`kraj`, MAX(`kupionewiniety`.`dokiedy`) as 'dokiedy', `winiety`.`kraj` as 'p' FROM `kupionewiniety` LEFT JOIN `winiety` ON `kupionewiniety`.`kraj` = `winiety`.`id` GROUP BY `kupionewiniety`.`kto`, `kupionewiniety`.`kraj`");
	r.map((wiersz) => {
		//czy jest konto w obiekcie JSON
		if(!winPowiadomienia[wiersz.k]){
			winPowiadomienia[wiersz.k] = {};
		}
		//czy jest juz uprawnienie w obiekcie JSON konta
		if(!winPowiadomienia[wiersz.k][wiersz.i]){
			winPowiadomienia[wiersz.k][wiersz.i] = {
				p: wiersz.p,
				wygasa: new Date(wiersz.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'}),
				wygasa7: {
					minelo: false,
					powiadomiono: false
				},
				wygasa3: {
					minelo: false,
					powiadomiono: false
				},
				wygaslo: {
					minelo: false,
					powiadomiono: false
				}
			};
		} else {
			if(winPowiadomienia[wiersz.k][wiersz.i]['wygasa'] != new Date(wiersz.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})){
				winPowiadomienia[wiersz.k][wiersz.i] = {
					p: wiersz.p,
					wygasa: new Date(wiersz.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'}),
					wygasa7: {
						minelo: false,
						powiadomiono: false
					},
					wygasa3: {
						minelo: false,
						powiadomiono: false
					},
					wygaslo: {
						minelo: false,
						powiadomiono: false
					}
				};
			}
		}
		//teraz sprawdzanie ustawianie wartosci uprawnienia w obiekcie JSON
		let hit = false;
		let wygasa = new Date(wiersz.dokiedy).getTime();
		if(dzis > wygasa && !hit){
			hit = true;
			if(winPowiadomienia[wiersz.k][wiersz.i].wygaslo.minelo == false){
				winPowiadomienia[wiersz.k][wiersz.i].wygaslo.minelo = true;
			}
		}
		let za3 = new Date(Date.now());
		za3.setDate(za3.getDate() + 3);
		if(za3 > wygasa && !hit){
			hit = true;
			if(winPowiadomienia[wiersz.k][wiersz.i].wygasa3.minelo == false){
				winPowiadomienia[wiersz.k][wiersz.i].wygasa3.minelo = true;
			}
		}
		let za7 = new Date(Date.now());
		za7.setDate(za7.getDate() + 7);
		if(za7 > wygasa && !hit){
			hit = true;
			if(winPowiadomienia[wiersz.k][wiersz.i].wygasa7.minelo == false){
				winPowiadomienia[wiersz.k][wiersz.i].wygasa7.minelo = true;
			}
		}
	});
	powiadomWygasniecieWin();
};

let noweUprWaznosc = [];
const noweWyslijUprPowiadomienia = async () => {
	let uzytkownicy = [];
	let zablokowanydc = [];

	const wyslijDC = async (login, nazwa, rodzaj, gra, data, discordid) => {
		if(!discordid) return;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność uprawnienia")
		.setDescription(`Użytkownikowi [${login}](https://system.thebossspedition.pl/profil/${login}) wygasło uprawnienie.`)
		.setColor(0xBF0300).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
		.addFields({name: "Uprawnienie:", value: `${nazwa} (${rodzaj})`, inline: true})
		.addFields({name: "Typ gry:", value: gra ? "ATS": "ETS2", inline: true})
		.addFields({name: "Data ważności:", value: new Date(data).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})});
		await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
		if(!zablokowanydc.includes(discordid)){
			embed1.setDescription(`[${login}](https://system.thebossspedition.pl/profil/${login}) wygasło Twoje uprawnienie.`);
			await dcbot.users.send(discordid, {embeds: [embed1]}).catch(async (erdd) => {
				zablokowanydc.push(discordid);
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${discordid}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	};

	const wyslijDC3 = async (login, nazwa, rodzaj, gra, data, discordid) => {
		if(!discordid) return;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność uprawnienia")
		.setDescription(`Użytkownikowi [${login}](https://system.thebossspedition.pl/profil/${login}) za 3 dni wygasa uprawnienie.`)
		.setColor(0xFF7700).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
		.addFields({name: "Uprawnienie:", value: `${nazwa} (${rodzaj})`, inline: true})
		.addFields({name: "Typ gry:", value: gra ? "ATS": "ETS2", inline: true})
		.addFields({name: "Data ważności:", value: new Date(data).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})});
		await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
		if(!zablokowanydc.includes(discordid)){
			embed1.setDescription(`[${login}](https://system.thebossspedition.pl/profil/${login}) za 3 dni wygasa Tobie uprawnienie.`);
			await dcbot.users.send(discordid, {embeds: [embed1]}).catch(async (erdd) => {
				zablokowanydc.push(discordid);
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${discordid}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	};

	const wyslijDC7 = async (login, nazwa, rodzaj, gra, data, discordid) => {
		if(!discordid) return;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność uprawnienia")
		.setDescription(`Użytkownikowi [${login}](https://system.thebossspedition.pl/profil/${login}) za 7 dni wygasa uprawnienie.`)
		.setColor(0xFFD500).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
		.addFields({name: "Uprawnienie:", value: `${nazwa} (${rodzaj})`, inline: true})
		.addFields({name: "Typ gry:", value: gra ? "ATS": "ETS2", inline: true})
		.addFields({name: "Data ważności:", value: new Date(data).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})});
		await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
		if(!zablokowanydc.includes(discordid)){
			embed1.setDescription(`[${login}](https://system.thebossspedition.pl/profil/${login}) za 7 dni wygasa Tobie uprawnienie.`);
			await dcbot.users.send(discordid, {embeds: [embed1]}).catch(async (erdd) => {
				zablokowanydc.push(discordid);
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${discordid}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	};

	const [r] = await db.query("SELECT `id` as 'i', `discord` as 'd', `login` as 'l' FROM `konta`");
	//przygotuj liste login, dc, id
	r.map((wiersz) => {
		uzytkownicy[wiersz.i] = { login: wiersz.l, discord: wiersz.d};
	});
	noweUprWaznosc.map((kierowca, index) => {
		Object.entries(kierowca).forEach(async (v, i) => {
			if(!i) return;
			//v[1] to obiekt uprawnienia v[0], v[0] to nazwa np.: upr89
			//sprawdz czy wygaslo juz
			if(v[1].oznaczenia.dni0.wygaslo){
				if(v[1].oznaczenia.dni0.powiadomiono) return;
				noweUprWaznosc[index][v[0]].oznaczenia.dni0.powiadomiono = true;
				wyslijDC(uzytkownicy[noweUprWaznosc[index].kierowca_id].login, v[1].nazwa, v[1].typ, v[1].gra, v[1].waznosc, uzytkownicy[noweUprWaznosc[index].kierowca_id].discord);
			} else {
				if(v[1].oznaczenia.dni3.wygaslo){
					if(v[1].oznaczenia.dni3.powiadomiono) return;
					noweUprWaznosc[index][v[0]].oznaczenia.dni3.powiadomiono = true;
					wyslijDC3(uzytkownicy[noweUprWaznosc[index].kierowca_id].login, v[1].nazwa, v[1].typ, v[1].gra, v[1].waznosc, uzytkownicy[noweUprWaznosc[index].kierowca_id].discord);
				} else {
					if(v[1].oznaczenia.dni7.wygaslo){
						if(v[1].oznaczenia.dni7.powiadomiono) return;
						noweUprWaznosc[index][v[0]].oznaczenia.dni7.powiadomiono = true;
						wyslijDC7(uzytkownicy[noweUprWaznosc[index].kierowca_id].login, v[1].nazwa, v[1].typ, v[1].gra, v[1].waznosc, uzytkownicy[noweUprWaznosc[index].kierowca_id].discord);
					}
					return;
				}
			}
		})
	});
	try{
		fs.writeFileSync('waznoscUprawnien.json', JSON.stringify(noweUprWaznosc, null, 2));
		console.log("Zapisano obiekt ważności uprawnień");
	} catch {
		console.log("Wystąpił krytyczny błąd w zapisaniu obiektu JSON ważności uprawnień!");
	}
};

const noweSprawdzUprWaznosc = async () => {
	if(!zaladowanoUprPow){
		try {
			noweUprWaznosc = JSON.parse(fs.readFileSync("waznoscUprawnien.json"));
			zaladowanoUprPow = true;
		} catch {
			console.log("Wystąpił krytyczny błąd załadowania ważności uprawnień");
		}
	}
	//zrobic zapis do JSONa, zeby nie bylo tak ze tego samego dnia jak backend sie zresetuje to wysle znow te same powiadomienia
	console.log(dataLog(), "System sprawdza ważność uprawnień");
	const [r] = await db.query("SELECT `uprawnienia`.`id` as 'i', `uprawnienia`.`kto` as 'k', `uprawnienia`.`naco`, MAX(`uprawnienia`.`dokiedy`) as 'dokiedy', `uprawnienia`.`gra` as 'giereczka', `typyuprawnien`.`nazwa` as 'na', `typyuprawnien`.`rodzaj` as 'ro' FROM `uprawnienia` LEFT JOIN `typyuprawnien` ON `uprawnienia`.`naco` = `typyuprawnien`.`id` GROUP BY `uprawnienia`.`kto`, `uprawnienia`.`naco`");
	r.map((wiersz) => {
		//znajdz noweUprWaznosc kierowca_id === wiersz.k, jak nie ma to dodaj {}, jak jest to edytuj
		let za3 = new Date();
		za3.setDate(za3.getDate() + 3);
		let za7 = new Date();
		za7.setDate(za7.getDate() + 7);
		const arrPos = noweUprWaznosc.findIndex(v => v.kierowca_id == wiersz.k);
		if(arrPos != -1){
			//jest kierowca, czy jest upr###
			if(noweUprWaznosc[arrPos]['upr'+wiersz.naco]){
				//jest upr###
				//sprawdz czy nadane_id jest nowsze, jak tak to zresetuj oznaczenia
				if(wiersz.i > noweUprWaznosc[arrPos]['upr'+wiersz.naco].nadane_id){
					//zresetuj oznaczenia i sprawdz
					noweUprWaznosc[arrPos]['upr'+wiersz.naco].nadane_id = wiersz.i;
					noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia = {
						dni0: {
							wygaslo: (Date.now() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
							powiadomiono: false,
						},
						dni3: {
							wygaslo: (za3.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
							powiadomiono: (Date.now() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
						},
						dni7: {
							wygaslo: (za7.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
							powiadomiono: (za3.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
						}
					}
					return;
				} else {
					// te same id upr, po prostu sprawdz waznosci i ustaw odpowiednie
					//juz wygaslo WCZESNIEJ, wiec skip all
					if(noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni0.wygaslo) return;
					else {
						//jesli nie wygaslo WCZESNIEJ to czy TERAZ wygaslo
						if(Date.now() >= new Date(wiersz.dokiedy).getTime()){
							noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni0 = {wygaslo: true, powiadomiono: false};
							noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni3 = {wygaslo: true, powiadomiono: true};
							noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni7 = {wygaslo: true, powiadomiono: true};
							return;
						} else {
							// wygasa za 3 dni, ale juz bylo sprawdzoen to pomin
							if(noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni3.wygaslo) return;
							else {
								//wygasa za 3 dni ale nie oznaczone
								if(za3.getTime() >= new Date(wiersz.dokiedy).getTime()){
									noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni0 = {wygaslo: false, powiadomiono: false};
									noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni3 = {wygaslo: true, powiadomiono: false};
									noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni7 = {wygaslo: true, powiadomiono: true};
									return;
								} else {
									// wygasa za 7 dni, ale juz bylo sprawdzoen to pomin
									if(noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni7.wygaslo) return;
									else {
										//wygasa za 7 dni ale nie oznaczone
										if(za7.getTime() >= new Date(wiersz.dokiedy).getTime()){
											noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni0 = {wygaslo: false, powiadomiono: false};
											noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni3 = {wygaslo: false, powiadomiono: false};
											noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni7 = {wygaslo: true, powiadomiono: false};
											return;
										} else {
											noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni0 = {wygaslo: false, powiadomiono: false};
											noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni3 = {wygaslo: false, powiadomiono: false};
											noweUprWaznosc[arrPos]['upr'+wiersz.naco].oznaczenia.dni7 = {wygaslo: false, powiadomiono: false};
											return;
										}
									}
								}
							}
						}
					}
				}
			} else {
				// nie ma
				noweUprWaznosc[arrPos]['upr'+wiersz.naco] = {
					nazwa: wiersz.na,
					typ: wiersz.ro,
					waznosc: wiersz.dokiedy,
					nadane_id: wiersz.i,
					gra: wiersz.giereczka,
					oznaczenia: {
						dni0: {
							wygaslo: (Date.now() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
							powiadomiono: false,
						},
						dni3: {
							wygaslo: (za3.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
							powiadomiono: (Date.now() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
						},
						dni7: {
							wygaslo: (za7.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
							powiadomiono: (za3.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
						}
					}
				};
				return;
			}
		} else {
			let tmpObj = { kierowca_id: wiersz.k};
			tmpObj['upr'+wiersz.naco] = {
				nazwa: wiersz.na,
				typ: wiersz.ro,
				waznosc: wiersz.dokiedy,
				gra: wiersz.giereczka,
				nadane_id: wiersz.i,
				oznaczenia: {
					dni0: {
						wygaslo: (Date.now() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
						powiadomiono: false,
					},
					dni3: {
						wygaslo: (za3.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
						powiadomiono: (Date.now() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
					},
					dni7: {
						wygaslo: (za7.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
						powiadomiono: (za3.getTime() >= new Date(wiersz.dokiedy).getTime()) ? true : false,
					}
				}
			};
			noweUprWaznosc.push(tmpObj);
			return;
		}
	});
	noweWyslijUprPowiadomienia();
};

setInterval(async () => {
	await noweSprawdzUprWaznosc();
	// await sprawdzWinWaznosc();
}, 3 * 60 * 60 * 1000); //co X godzin 3 * 60 * 60 * 1000

app.post("/adminUsunAwatar/:kto/:komu", async (req, res) => {
	//dc zrobione
	if(req.params.kto && req.params.komu){
		try {
			const [r] = await db.execute("UPDATE `konta` SET `awatar` = 'awatary/default.png' WHERE `id` = ?", [req.params.komu]);
			if(r.affectedRows > 0){
				const [rk] = await db.execute("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `id` = ?", [req.params.komu]);
				console.log("["+new Date().toLocaleString('pl')+"]", req.params.kto, "usunął awatar profilu ", rk[0].l);
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Edycja profilu")
				.setDescription(`[${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął awatar użytkownika [${rk[0].l}](https://system.thebossspedition.pl/profil/${rk[0].l}).`)
				.setColor(0x01F1AD)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
				await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
				if(rk[0].d){
					embed1.setDescription(`[${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął twój awatar profilu.`);
					await dcbot.users.send(rk[0].d, {embeds: [embed1]}).catch(async (erdd) => {
						try {
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${rk[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						} catch(erdc){
							console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
						}
					});
				}
				if(req.body.staryAwatar != 'awatary/default.png'){
					fs.unlink(req.body.staryAwatar, (err) => {if(err) console.log(err)});
				}
				res.send({odp: "OK"});
			} else {
				res.send({odp: "Złe ID?"});
			}
		} catch(er) {
			console.log(er);
			res.send({blad: "Blad sql"});
			return;
		}
	}
});

app.post("/profilDane/:login/:kto", async (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	console.log("["+new Date().toLocaleString('pl')+"]", req.params.kto, "odwiedza profil:", login);
	const [result] = await db.execute("SELECT `konta`.`login`, `konta`.`typkonta`, `konta`.`kiedydolaczyl`, `konta`.`awatar`, `konta`.`stawka`, `konta`.`garaz`, `konta`.`truck`, `konta`.`discord`, `konta`.`steam`, `konta`.`truckbook`, `konta`.`truckersmp`, `konta`.`worldoftrucks`, `konta`.`dostepATS`, `typkonta`.`nazwa` as 'typkontaN', `konta`.`rangi`, `rangi`.`nazwa` as 'stanowiskoN' FROM `konta`, `typkonta`, `rangi` WHERE `login` = ? AND `typkonta`.`id` = `konta`.`typkonta` AND `rangi`.`id` = `konta`.`rangi`", [login]);
	if(result.length > 0){
		res.send({
			login: result[0]['login'],
			typkonta: result[0]['typkonta'],
			datadolaczenia: result[0]['kiedydolaczyl'],
			awatar: result[0]['awatar'],
			stawka: result[0]['stawka'],
			garaz: result[0]['garaz'],
			truck: result[0]['truck'],
			discord: result[0]['discord'],
			steam: result[0]['steam'],
			truckbook: result[0]['truckbook'],
			truckersmp: result[0]['truckersmp'],
			worldoftrucks: result[0]['worldoftrucks'],
			typkontaNazwa: result[0]['typkontaN'],
			stanowisko: result[0]['rangi'],
			stanowiskoNazwa: result[0]['stanowiskoN'],
			dostepATS: result[0]['dostepATS']
		});
	} else {
		res.send({blad: "Nie ma takiego tokenu"});
	}
});

app.post("/rangi", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT * FROM `typkonta` ORDER BY `id` ASC");
	if(result.length > 0){
		let tmp = [];
		result.map((ranga) => {
			tmp[ranga.id] = ranga.nazwa;
		});
		res.send({dane: tmp});
	} else {
		res.send({odp: 'Blad zczytania rang'});
	}
});

app.post("/stanowiska", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT * FROM `rangi` ORDER BY `id` ASC");
	if(result.length > 0){
		let tmp = [];
		result.map((stanowisko) => {
			tmp[stanowisko.id] = stanowisko.nazwa;
		});
		res.send({dane: tmp});
	} else {
		res.send({odp: 'Blad zczytania rang'});
	}
});

app.post("/profilDaneId/:id", async (req, res) => {
	//dc niepotrzebne
	const id = req.params.id;
	const [result] = await db.query("SELECT * FROM `konta`, `typkonta` WHERE `konta`.`id` = ? AND `typkonta`.`id` = `konta`.`typkonta`", [id]);
	if(result.length > 0){
		res.send({
			login: result[0]['login'],
			typkonta: result[0]['typkonta'],
			datadolaczenia: result[0]['kiedydolaczyl'],
			awatar: result[0]['awatar'],
			stawka: result[0]['stawka'],
			garaz: result[0]['garaz'],
			truck: result[0]['truck'],
			discord: result[0]['discord'],
			steam: result[0]['steam'],
			truckbook: result[0]['truckbook'],
			truckersmp: result[0]['truckersmp'],
			worldoftrucks: result[0]['worldoftrucks'],
			ranga: result[0]['nazwa']
		});
	} else {
		res.send({blad: "Nie ma takiego tokenu"});
	}
});

app.post("/listaUzytkownikow/", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT `konta`.`email`, `konta`.`dostepATS`, `konta`.`id` as 'kontoid', `konta`.`login`, `konta`.`typkonta`, `konta`.`rangi`, `konta`.`kiedydolaczyl`, `konta`.`awatar`, `konta`.`stawka`, `konta`.`garaz`, `konta`.`truck`, `konta`.`discord`, `konta`.`steam`, `konta`.`truckersmp`, `konta`.`truckbook`, `konta`.`worldoftrucks`, `typkonta`.`nazwa` as 'nazwa', `rangi`.`nazwa` as 'stanowisko' FROM `konta`, `rangi`, `typkonta` WHERE `typkonta`.`id` = `konta`.`typkonta` AND `rangi`.`id` = `konta`.`rangi` ORDER BY `konta`.`typkonta` ASC");
	if(result.length > 0){
		let lista = [];
		result.map((w) => {
			lista.push({
				id: w.kontoid,
				login: w.login,
				typkonta: Number(w.typkonta),
				stanowisko: w.rangi,
				datadolaczenia: w.kiedydolaczyl,
				awatar: w.awatar,
				stawka: Number(w.stawka),
				garaz: w.garaz,
				truck: w.truck,
				discord: w.discord,
				steam: w.steam,
				truckbook: w.truckbook,
				truckersmp: w.truckersmp,
				worldoftrucks: w.worldoftrucks,
				ranga: w.nazwa,
				stanowiskoNazwa: w.stanowisko,
				email: w.email,
				dostepATS: w.dostepATS ? true : false
			});
		});
		res.send(lista);
	} else {
		res.send({blad: "Nie ma takiego tokenu"});
	}
});

//logowanie
app.post("/login", async (req, res) => {
	//dc zrobione
	const user = req.body.username;
	const saltToken = user + Date.now().toString();
	const password = req.body.password;
	const haslo = CryptoJS.HmacSHA1(password, KLUCZ_H).toString();
	console.log(haslo);
	const dane = req.body.dane;
	try {
		const [result] = await db.execute("SELECT `login` as 'l',`awatar`,`typkonta`,`discord` as 'd' FROM `konta` WHERE `login` = ? AND `haslo` = ?", [user, haslo]);
		if(result.length > 0){
			console.log("");
			console.log("["+new Date().toLocaleString('pl')+"]", "Udana próba logowania na konto:", user);
			const tokenik = CryptoJS.HmacSHA1(saltToken, KLUCZ_H).toString();
			await db.execute("UPDATE `konta` SET `token` = ? WHERE `login` = ?", [tokenik, user]);
			res.send({
				login: user,
				awatar: result[0]['awatar'],
				token: tokenik
			});
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Logowanie")
			.setDescription(`[${result[0].l}](https://system.thebossspedition.pl/profil/${result[0].l}) zalogował się do systemu.`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
			if(result[0].d){
				embed1.setDescription(`Zalogowano się na twoje konto w systemie.`)
				.addFields({name: "Aplikacja", value: dane})
				.addFields({name: "Adres IP", value: `${req.headers['x-forwarded-for'].split(".")[0]}.${req.headers['x-forwarded-for'].split(".")[1]}.${req.headers['x-forwarded-for'].split(".")[2]}.***`});
				await dcbot.users.send(result[0].d, {embeds: [embed1]}).catch(async (erdd) => {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${result[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			};
		} else {
			console.log("["+new Date().toLocaleString('pl')+"]", "Nieudana próba logowania na konto: ", user);
			res.send({blad: "ZLE DANE KURWO"});
		}
	} catch(err) {
		console.log(err);
		res.send({blad: "Wystąpił błąd..."});
	}
});

//etap 1 resetowania hasla
app.post("/reset", async (req, res) => {
	//dc zrobione
	const user = req.body.username;
	const saltToken = user + Date.now().toString() + "reset";
	const kodzwrotny = CryptoJS.HmacSHA1(saltToken, KLUCZ_H).toString();
	console.log("");
	console.log("["+new Date().toLocaleString('pl')+"]", "Uzytkownik ", user, " resetuje haslo, jego kodzwrotny: ", kodzwrotny);
	try {
		const [result] = await db.execute("UPDATE `konta` SET `reset` = ? WHERE `login` = ?", [kodzwrotny, user]);
		if(result.affectedRows > 0){
			const [r2] = await db.execute("SELECT `email` as 'e', `discord` as 'd' FROM `konta` WHERE `login` = ?", [user]);
			if(r2[0].d){
				const embed = new EmbedBuilder().setColor(0x0099FF).setTitle('Resetowanie hasła').setDescription('Użytkowniku! Rozpoczęliśmy proces resetowania twojego hasła do systemu! Jeśli to nie ty zażądałeś tego procesu, po prostu zignoruj tą wiadomość.').setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').addFields({ name: 'Kod zwrotny', value: kodzwrotny }).setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setColor(0xFF3C00);
				await dcbot.users.send(r2[0].d, {embeds: [embed]}).then(() => res.send({odp: "GITES"}) ).catch(async() => {
					try{
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${r2[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
					await smtp.sendMail({
						from: 'no-reply@thebossspedition.pl',
						to: r2[0].e,
						subject: 'Resetowanie hasła - The Boss Spedition',
						html: "<h1>Użytkowniku! Rozpoczęliśmy proces resetowania twojego hasła do systemu!</h1><br>Twój kod: <b>"+kodzwrotny+"</b><br><br><p>Jeśli to nie ty zażądałeś tego procesu, po prostu zignoruj tą wiadomość."
					}).then((r) => {
						res.send({odp: "GITES"});
					}).catch(async (er) => {
						res.send({blad: "Błąd podczas wysyłania maila."});
					});
				});
			} else {
				await smtp.sendMail({
					from: 'no-reply@thebossspedition.pl',
					to: r2[0].e,
					subject: 'Resetowanie hasła - The Boss Spedition',
					html: "<h1>Użytkowniku! Rozpoczęliśmy proces resetowania twojego hasła do systemu!</h1><br>Twój kod: <b>"+kodzwrotny+"</b><br><br><p>Jeśli to nie ty zażądałeś tego procesu, po prostu zignoruj tą wiadomość."
				}).then((r) => {
					res.send({odp: "GITES"});
				}).catch(async (er) => {
					res.send({blad: "Błąd podczas wysyłania maila."});
				});
			}
		} else {
			res.send({blad: "Nie ma takiego użytkownika!"});
		}
	} catch(err) {
		console.log(err);
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
});

//etap 2 resetowanie hasla
app.post("/resetcheck", async (req, res) => {
	//dc niepotrzebne
	const zwrotny = req.body.kodzik;
	console.log("");
	console.log("["+new Date().toLocaleString('pl')+"]", "Sprawdzanie czy kod zwrotny ", zwrotny, " jest git");
	const [result] = await db.execute("SELECT COUNT(*) FROM `konta` WHERE `reset` = ?", [zwrotny]);
	(result.length > 0) ? res.send({odp: "GITES"}) : res.send({blad: "Zly kod"})
});

//etap 3 resetowanie hasla
app.post("/resetfinal", async (req, res) => {
	//dc zrobione
	const zwrotny = req.body.kodzwrotny;
	console.log("["+new Date().toLocaleString('pl')+"]", "Przywrocono haslo dla osoby o kluczu ", zwrotny);
	const szyfrHaslo = CryptoJS.HmacSHA1(req.body.haslo, KLUCZ_H).toString();
	const [result] = await db.execute("UPDATE `konta` SET `haslo` = ?, `reset` = '' WHERE `reset` = ?", [szyfrHaslo, zwrotny]);
	if(result.affectedRows > 0){
		res.send({odp: "Zresetowano"});
		const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `haslo` = ?", [szyfrHaslo]);
		kierowca = rk[0].l;
		kierowcadc = rk[0].d;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zresetowano hasło")
			.setDescription(`Zresetowano hasło użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
		if(kierowcadc){
			embed1.setDescription(`[${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) zresetowano hasło do twojego konta!`);
			await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async (erdd) => {
				try{
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	} else {
		res.send({blad: "CHUJ"});
	}
});

//navbar licznik
app.get("/sprawdztrasy", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT COUNT(`id`) as 't' FROM `trasy` WHERE `zatwierdz` = 0");
	if(result.length > 0){
		res.send({ilosc: result[0]['t']});
	} else {
		res.send({ilosc: 0});
	}
});

//navbar licznik
app.get("/sprawdzpodwyzki", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT COUNT(`id`) as 't' FROM `podwyzka` WHERE `ktorozpatrzyl` = 0 AND `wniosek` IS NULL AND `wniosektxt` IS NULL");
	if(result.length > 0){
		res.send({ilosc: result[0]['t']});
	} else {
		res.send({ilosc: 0});
	}
});

app.get("/sprawdzurlopy", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT COUNT(`id`) as 't' FROM `urlopy` WHERE `status` IS NULL OR `status` = 0");
	if(result.length > 0){
		res.send({ilosc: result[0]['t']});
	} else {
		res.send({ilosc: 0});
	}
});

//wlasne statystyki na glowna
app.post("/mainOwnStats/:token", async (req, res) => {
	//dc niepotrzebne
	const token = req.params.token;
	const currentMonth = new Date().toISOString().split('T')[0].slice(0,-2) + "%";
	if(token.length == 40){
		const [result] = await db.execute("SELECT COUNT(`trasy`.`id`) as 'ile', SUM(`trasy`.`przejechane`) as 'km', SUM(`trasy`.`masaladunku`) as 'tony', SUM(`trasy`.`spalanie`) as 'spalanie' FROM `trasy`,`konta` WHERE `trasy`.`kto` = `konta`.`id` AND `konta`.`token` = ? AND `trasy`.`kiedy` LIKE ? AND `trasy`.`zatwierdz` = 1", [token, currentMonth]);
		if(result.length > 0){
			res.send({
				ladunkow: result[0]['ile'],
				tony: result[0]['tony'],
				przejechanekm: result[0]['km'],
				spalanie: result[0]['spalanie'] * 100 / result[0]['km'],
				response: 1
			});
		} else {
			res.send({blad: "Nie ma takiego tokenu"});
		}
	} else {
		res.send({blad: "Niepoprawny token"});
	}
});

//globalne statystyki na glowna
app.post("/mainGlobalStats", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT COUNT(`trasy`.`id`) as 'ile', SUM(`trasy`.`przejechane`) as 'km', SUM(`trasy`.`spalanie`) as 'spalanie' FROM `trasy` WHERE `trasy`.`zatwierdz` = 1");
	const [result2] = await db.query("SELECT COUNT(`konta`.`id`) as 'pracownikow' FROM `konta`");
	res.send({
		ladunkow: result[0]['ile'] ?? 0,
		pracownikow: result2[0]['pracownikow'] ?? 0,
		przejechanekm: result[0]['km'] ?? 0,
		spalanie: result[0]['spalanie'] ? (result[0]['spalanie'] * 100 / result[0]['km']) : 0,
		response: 1
	});
});

//wlasny zarobek ORAZ PREMIE
app.post("/stankonta/:login/wlasnyzarobek", async (req, res) =>{
	//dc niepotrzebne
	const login = req.params.login;
	try {
		const [result] = await db.execute("SELECT SUM(`wlasnyzarobek`) as 'w', SUM(`premia`) as 'p' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login]);
		res.send({
			odp: result.length > 0
				? (result[0]['w'] + result[0]['p'])
				: 0
		})
	} catch(err) {
		console.log(err);
		res.send({odp: 0});
		return;
	}
});

app.post("/stankonta/:login/kary", async (req, res) =>{
	//dc niepotrzebne
	const [result] = await db.execute("SELECT SUM(`kara`) as 'k' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [req.params.login]);
	res.send({odp: result.length > 0 ? result[0]['k'] : 0});
});

app.post("/stankonta/:login/upr", async (req, res) =>{
	//dc niepotrzebne
	const [result] = await db.execute("SELECT SUM(`cena`) as 'u' FROM `uprawnienia` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [req.params.login]);
	res.send({odp: result.length > 0 ? result[0]['u'] : 0})
});

app.post("/stankonta/:login/gesty", async (req, res) =>{
	//dc niepotrzebne
	const [result] = await db.execute("SELECT SUM(`kwota`) as 'k' FROM `dodawaniekwoty` WHERE `komu` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [req.params.login]);
	if(result.length > 0){
		res.send({odp: result[0]['k']});
	} else {
		res.send({odp: 0});
	}
});

app.post("/stankonta/:login/winiety", async (req, res) =>{
	//dc niepotrzebne
	const [result] = await db.execute("SELECT SUM(`zaile`) as 'z' FROM `kupionewiniety` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [req.params.login]);
	if(result.length > 0){
		res.send({odp: result[0]['z']});
	} else {
		res.send({odp: 0});
	}
});

//glowna - info oraz limit_km
app.post("/glownaInfo", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT * FROM `ustawienia` WHERE `nazwa` = 'limit_km' OR `nazwa` = 'informacja'");
	if(result.length > 0){
		const odp = {};
		result.forEach((element) => {
			odp[element.nazwa] = element.wartosc; 
			// if(element['nazwa'] == "informacja"){
			// 	odp.msg = element['wartosc'];
			// }
			// if(element['nazwa'] == "limit_km"){
			// 	odp.limitkm = element['wartosc'];
			// }
		});
		res.send({response: 1, ...odp}); //limitkm: odp.limitkm, msg: odp.msg
	}
});

app.post("/ranking/:miesiac", async (req, res) => {
	//dc niepotrzebne
	const miesiac = req.params.miesiac + "-%";
	const [result] = await db.execute("SELECT COUNT(`trasy`.`id`) as 'tras', SUM(`trasy`.`przejechane`) as 'przejechane', SUM(`trasy`.`masaladunku`) as 'tonaz', SUM(`trasy`.`zarobek`) as 'zarobek', SUM(`trasy`.`wlasnyzarobek`) as 'wlasnyzarobek', SUM(`trasy`.`spalanie`) as 'spalanie', `konta`.`login` as 'login', `konta`.`awatar` as 'awatar', `trasy`.`kto` as 'id' FROM `trasy`, `konta` WHERE `trasy`.`kto` = `konta`.`id` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto`", [miesiac]);
	if(result.length > 0){
		let dane = [];
		result.forEach((rekord) => {
			if(rekord.login){
				let tmpDane = {
					id: rekord.id,
					login: rekord.login,
					awatar: rekord.awatar,
					tras: rekord.tras,
					przejechane: rekord.przejechane,
					tonaz: rekord.tonaz,
					spalanie: rekord.spalanie * 100 / rekord.przejechane,
					zarobek: rekord.zarobek,
					wlasnyzarobek: rekord.wlasnyzarobek
				};
				dane.push(tmpDane);
			}
		});
		res.send({dane: dane});
	} else {
		res.send({blad: 'Brak danych!'});
	}
});

app.post("/rankingETS/:miesiac", async (req, res) => {
	//dc niepotrzebne
	const miesiac = req.params.miesiac + "-%";
	const [result] = await db.execute("SELECT COUNT(`trasy`.`id`) as 'tras', SUM(`trasy`.`przejechane`) as 'przejechane', SUM(`trasy`.`masaladunku`) as 'tonaz', SUM(`trasy`.`zarobek`) as 'zarobek', SUM(`trasy`.`wlasnyzarobek`) as 'wlasnyzarobek', SUM(`trasy`.`spalanie`) as 'spalanie', `konta`.`login` as 'login', `konta`.`awatar` as 'awatar', `trasy`.`kto` as 'id' FROM `trasy`, `konta` WHERE `trasy`.`gra` = 0 AND `trasy`.`kto` = `konta`.`id` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto`", [miesiac]);
	if(result.length > 0){
		let dane = [];
		result.forEach((rekord) => {
			if(rekord.login){
				let tmpDane = {
					id: rekord.id,
					login: rekord.login,
					awatar: rekord.awatar,
					tras: rekord.tras,
					przejechane: rekord.przejechane,
					tonaz: rekord.tonaz,
					spalanie: rekord.spalanie * 100 / rekord.przejechane,
					zarobek: rekord.zarobek,
					wlasnyzarobek: rekord.wlasnyzarobek
				};
				dane.push(tmpDane);
			}
		});
		res.send({dane: dane});
	} else {
		res.send({blad: 'Brak danych!'});
	}
});

app.post("/rankingATS/:miesiac", async (req, res) => {
	//dc niepotrzebne
	const miesiac = req.params.miesiac + "-%";
	const [result] = await db.execute("SELECT COUNT(`trasy`.`id`) as 'tras', SUM(`trasy`.`przejechane`) as 'przejechane', SUM(`trasy`.`masaladunku`) as 'tonaz', SUM(`trasy`.`zarobek`) as 'zarobek', SUM(`trasy`.`wlasnyzarobek`) as 'wlasnyzarobek', SUM(`trasy`.`spalanie`) as 'spalanie', `konta`.`login` as 'login', `konta`.`awatar` as 'awatar', `trasy`.`kto` as 'id' FROM `trasy`, `konta` WHERE `trasy`.`gra` = 1 AND `trasy`.`kto` = `konta`.`id` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto`", [miesiac]);
	if(result.length > 0){
		let dane = [];
		result.forEach((rekord) => {
			if(rekord.login){
				let tmpDane = {
					id: rekord.id,
					login: rekord.login,
					awatar: rekord.awatar,
					tras: rekord.tras,
					przejechane: rekord.przejechane,
					tonaz: rekord.tonaz,
					spalanie: rekord.spalanie * 100 / rekord.przejechane,
					zarobek: rekord.zarobek,
					wlasnyzarobek: rekord.wlasnyzarobek
				};
				dane.push(tmpDane);
			}
		});
		res.send({dane: dane});
	} else {
		res.send({blad: 'Brak danych!'});
	}
});

app.post("/dostepneWiniety/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	let tmp = [];
	try {
		const [r] = await db.query("SELECT * FROM `winiety` ORDER BY `kraj` ASC");
		if(r.length > 0){
			r.map((wiersz) => {
				tmp.push(wiersz);
			});
			res.send({response: 1, dane: tmp});
		} else {
			res.send({response: 1, dane: null});
		}
	} catch(er) {
		res.send({response: 1, blad: "Błąd SQL"});
		return;
	}
});

//top 3 poprzedniego miesiaca
app.post("/lastMonthTop3", async (req, res) => {
	//dc niepotrzebne
	const lastMonthObj = new Date();
	lastMonthObj.setMonth(lastMonthObj.getMonth() - 1);
	const lastMonth = lastMonthObj.toISOString().split('T')[0].slice(0,-2) + "%";
	const [result] = await db.execute("SELECT SUM(`trasy`.`przejechane`) as 'km', `konta`.`login` as 'login' FROM `trasy`,`konta` WHERE `konta`.`id` = `trasy`.`kto` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto` ORDER BY SUM(`trasy`.`przejechane`) DESC LIMIT 3", [lastMonth]);
	if(result.length > 0){
		if(result.length == 1)
			res.send({response: 1, top1: result[0]['login']});
		if(result.length == 2)
			res.send({response: 1, top1: result[0]['login'], top2: result[1]['login']});
		if(result.length == 3)
			res.send({response: 1, top1: result[0]['login'], top2: result[1]['login'], top3: result[2]['login']});
	} else {
		res.send({response: 1});
	}
});

app.post("/ostatnie10tras/:login/dystanskm", async (req,res) => {
	//dc niepotrzebne
	const [result] = await db.execute("SELECT `id`,`przejechane` FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [req.params.login]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((trasa) => {
			tmp.push({x: trasa.id, y: trasa.przejechane});
		});
		res.send({dane: tmp.reverse()});
	} else {
		res.send({blad: "Brak danych"});
	}
});

app.post("/ostatnie10tras/:login/spalanie", async (req,res) => {
	//dc niepotrzebne
	const [result] = await db.execute("SELECT `id`, (`spalanie`*100/`przejechane`) as 'sp' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [req.params.login]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((trasa) => {
			tmp.push({x: trasa.id, y: trasa.sp});
		});
		res.send({dane: tmp.reverse()});
	} else {
		res.send({blad: "Brak danych"});
	}
});

app.post("/ostatnie10tras/:login/zarobki", async (req,res) => {
	//dc niepotrzebne
	const [result] = await db.execute("SELECT `id`,`zarobek` FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [req.params.login]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((trasa) => {
			tmp.push({x: trasa.id, y: trasa.zarobek});
		});
		res.send({dane: tmp.reverse()});
	} else {
		res.send({blad: "Brak danych"});
	}
});

app.post("/komentarze/:login", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.login){
		res.send({blad: 'Nie podano uzytkownika'});
		return;
	}
	const [result] = await db.execute("SELECT `notatkiprofilowe`.`id` as 'idnotatki', `konta`.`login` as 'ktonapisal', `notatkiprofilowe`.`data` as 'kiedy', `notatkiprofilowe`.`tekst` as 'tresc' FROM `notatkiprofilowe`,`konta` WHERE `notatkiprofilowe`.`kto` = `konta`.`id` AND `notatkiprofilowe`.`komu` = (SELECT `konta`.`id` FROM `konta` WHERE `konta`.`login` = ?) GROUP BY `notatkiprofilowe`.`id` ORDER BY `notatkiprofilowe`.`id` DESC", [req.params.login]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((rekord) => {
			tmp.push({idnotatki: rekord.idnotatki, kto: rekord.ktonapisal, kiedy: rekord.kiedy, tresc: rekord.tresc})
		});
		res.send({response: 1, dane: tmp});
	} else {
		res.send({response: 1});
	}
});

app.post("/dodajKomentarz/:komu/:kto/:token", async (req, res) => {
	//dc zrobione
	const komu = req.params.komu;
	const kto = req.params.kto;
	const tokenKto = req.params.token;
	const wiadomosc = req.body.wiadomosc;
	const kiedy = new Date().toISOString().split('T')[0];
	console.log("["+new Date().toLocaleString('pl')+"]", kto, "dodał notatke", komu);
	const [result] = await db.execute("INSERT INTO `notatkiprofilowe` (`kto`,`komu`,`data`,`tekst`) VALUES ((SELECT `id` FROM `konta` WHERE `login` = ? AND `token` = ?), (SELECT `id` FROM `konta` WHERE `login` = ?), ?, ?)", [kto, tokenKto, komu, kiedy, wiadomosc]);
	if(result.affectedRows > 0){
		res.send({odp: 'OK'});
		const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`Użytkownik [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) dodał nową notatkę na profilu użytkownika [${req.params.komu}](https://system.thebossspedition.pl/profil/${req.params.komu})`).setTitle("Nowa notatka").addFields({name: "Treść", value: req.body.wiadomosc}).addFields({name: "ID Notatki", value: `\u200B${result.insertId}`});
		const czanel = dcbot.channels.cache.get(process.env.CHANNEL_NOTATKI);
		await czanel.send({embeds: [embed1]});
		const [rk] = await db.execute("SELECT `discord` as 'd' FROM `konta` WHERE `login` = ?", [req.params.komu]);
		if(rk.length > 0 && rk[0].d){
			const embed2 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`[${req.params.komu}](https://system.thebossspedition.pl/profil/${req.params.komu}) na twoim profilu pojawiła się\nnowa notatka od użytkownika [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto})`).setTitle("Nowa notatka").addFields({name: "Treść", value: req.body.wiadomosc});
			dcbot.users.send(rk[0].d, {embeds: [embed2]}).catch(async (er) => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${rk[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	} else {
		res.send({blad: 'Nie dodano...'});
	}
});

app.post("/usunKomentarz/:kto/:komu/:idkom", async (req, res) => {
	//dc zrobione
	const idkom = req.params.idkom;
	console.log(dataLog(), req.params.kto, "usunal", req.params.komu, "komentarz o ID:", idkom);
	let wiadomosc;
	const [rw] = await db.execute("SELECT `tekst` as 'w' FROM `notatkiprofilowe` WHERE `id` = ?", [idkom]);
	if(rw.length > 0){
		wiadomosc = rw[0].w;
	}
	const [result] = await db.execute("DELETE FROM `notatkiprofilowe` WHERE `id` = ?", [idkom]);
	if(result.affectedRows > 0){
		res.send({odp: 'OK'});
		const embed1 = new EmbedBuilder().setColor(0xA50000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`Użytkownik [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął notatkę z profilu użytkownika [${req.params.komu}](https://system.thebossspedition.pl/profil/${req.params.komu})`).setTitle("Usunięcie notatki").addFields({name: "Usuwana treść", value: wiadomosc}).addFields({name: "ID Notatki", value: `\u200B${idkom}`});
		const czanel = dcbot.channels.cache.get(process.env.CHANNEL_NOTATKI);
		await czanel.send({embeds: [embed1]});
		const [rk] = await db.execute("SELECT `discord` as 'd' FROM `konta` WHERE `login` = ?", [req.params.komu]);
		if(rk.length > 0 && rk[0].d){
			try {
				const embed2 = new EmbedBuilder().setColor(0xA50000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`Na [twoim profilu](https://system.thebossspedition.pl/profil/${req.params.komu}) użytkownik [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął notatkę.`).setTitle("Usunięcie notatki").addFields({name: 'Treść usuniętej notatki:', value: wiadomosc});
				dcbot.users.send(rk[0].d, {embeds: [embed2]}).catch(async (er) => {
					try {
						const ogolny = dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY);
						await ogolny.send(`<@${rk[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			} catch (er) {
				console.log(er);
			}
		}
	} else {
		res.send({blad: 'Nie usunieto'});
	}
});

app.post("/profilFullDane/:token", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.execute("SELECT `email`, `truck`, `garaz`, `truckbook`, `truckersmp`, `worldoftrucks`, `steam` FROM `konta` WHERE `token` = ?", [req.params.token]);
	if(result.length > 0){
		res.send({dane: result[0]});
	} else {
		res.send({blad: "Zly token"});
	}
});

app.post("/zaktualizujProfil/:token/:login", upload.single('awatarImg'), async (req, res) => {
	//dc zrobione
	const token = req.params.token;
	const login = req.params.login;
	console.log(dataLog(), "Zmiany dla profilu", login);
	const [result] = await db.execute("SELECT * FROM `konta` WHERE `token` = ? AND `login` = ?", [token, login]);
	if(result.length > 0){
		let aktualneDane = {};
		aktualneDane.login = result[0].login;
		aktualneDane.awatar = result[0].awatar;
		aktualneDane.email = result[0].email;
		aktualneDane.garaz = result[0].garaz;
		aktualneDane.truck = result[0].truck;
		aktualneDane.steam = result[0].steam;
		aktualneDane.truckbook = result[0].truckbook;
		aktualneDane.truckersmp = result[0].truckersmp;
		aktualneDane.worldoftrucks = result[0].worldoftrucks;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zmiany profilowe - Użytkownik")
			.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) zaktualizował swój profil.`).setColor(0x7500A5)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		const embed2 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zmiany profilowe - Użytkownik")
			.setDescription(`Dokonano zmian na [twoim profilu](https://system.thebossspedition.pl).`).setColor(0x7500A5)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			
		if(req.body.noweHaslo1 && req.body.noweHaslo2 && (req.body.noweHaslo1 == req.body.noweHaslo2)){
			const haslo = CryptoJS.HmacSHA1(req.body.noweHaslo1, KLUCZ_H).toString();
			await db.execute("UPDATE `konta` SET `haslo` = ? WHERE `token` = ?" , [haslo, token]);
			console.log("Zmieniono hasło dla", login);
			embed1.addFields({name: 'Zmieniono hasło.', value: '\u200B'});
			embed2.addFields({name: 'ZMIENIONO HASŁO!', value: '\u200B'});
		}
		if(req.body.truck && (req.body.truck != aktualneDane.truck)){
			await db.execute("UPDATE `konta` SET `truck` = ? WHERE `token` = ?" , [req.body.truck, token]);
			console.log("Zmiana trucka dla", login, aktualneDane.truck, "->", req.body.truck);
			embed1.addFields({name: 'Ulubiony truck:', value: `${aktualneDane.truck} ➡ ${req.body.truck}`});
			embed2.addFields({name: 'Ulubiony truck:', value: `${aktualneDane.truck} ➡ ${req.body.truck}`});
		}
		if(req.body.garaz && (req.body.garaz != aktualneDane.garaz)){
			await db.execute("UPDATE `konta` SET `garaz` = ? WHERE `token` = ?" , [req.body.garaz, token]);
			console.log("Zmiana garazu dla", login, aktualneDane.garaz, "->", req.body.garaz);
			embed1.addFields({name: 'Garaż:', value: `${aktualneDane.garaz} ➡ ${req.body.garaz}`});
			embed2.addFields({name: 'Garaż:', value: `${aktualneDane.garaz} ➡ ${req.body.garaz}`});
		}
		if(req.body.steam && (req.body.steam != aktualneDane.steam)){
			await db.execute("UPDATE `konta` SET `steam` = ? WHERE `token` = ?" , [req.body.steam, token]);
			console.log("Zmiana steama dla", login, aktualneDane.steam, "->", req.body.steam);
			embed1.addFields({name: 'Steam:', value: `${aktualneDane.steam} ➡ ${req.body.steam}`});
			embed2.addFields({name: 'Steam:', value: `${aktualneDane.steam} ➡ ${req.body.steam}`});
		}
		if(req.body.truckersmp && (req.body.truckersmp != aktualneDane.truckersmp)){
			await db.execute("UPDATE `konta` SET `truckersmp` = ? WHERE `token` = ?" , [req.body.truckersmp, token]);
			console.log("Nowy truckersmp link dla", login, aktualneDane.truckersmp, "->", req.body.truckersmp);
			embed1.addFields({name: 'TruckersMP:', value: `${aktualneDane.truckersmp} ➡ ${req.body.truckersmp}`});
			embed2.addFields({name: 'TruckersMP:', value: `${aktualneDane.truckersmp} ➡ ${req.body.truckersmp}`});
		}
		if(req.body.truckbook && (req.body.truckbook != aktualneDane.truckbook)){
			await db.execute("UPDATE `konta` SET `truckbook` = ? WHERE `token` = ?" , [req.body.truckbook, token]);
			console.log("Nowy truckbook link dla", login, aktualneDane.truckbook, "->", req.body.truckbook);
			embed1.addFields({name: 'TrucksBook:', value: `${aktualneDane.truckbook} ➡ ${req.body.truckbook}`});
			embed2.addFields({name: 'TrucksBook:', value: `${aktualneDane.truckbook} ➡ ${req.body.truckbook}`});
		}
		if(req.body.worldoftrucks && (req.body.worldoftrucks != aktualneDane.worldoftrucks)){
			await db.execute("UPDATE `konta` SET `worldoftrucks` = ? WHERE `token` = ?" , [req.body.worldoftrucks, token]);
			console.log("Nowy worldoftrucks link dla", login, aktualneDane.worldoftrucks, "->", req.body.worldoftrucks);
			embed1.addFields({name: 'World of Trucks:', value: `${aktualneDane.worldoftrucks} ➡ ${req.body.worldoftrucks}`});
			embed2.addFields({name: 'World of Trucks:', value: `${aktualneDane.worldoftrucks} ➡ ${req.body.worldoftrucks}`});
		}
		if(req.body.email && (req.body.email != aktualneDane.email)){
			await db.execute("UPDATE `konta` SET `email` = ? WHERE `token` = ?" , [req.body.email, token]);
			console.log("Zmiana emailu dla", login, aktualneDane.email, "->", req.body.email);
			embed1.addFields({name: 'E-Mail:', value: `${aktualneDane.email} ➡ ${req.body.email}`});
			embed2.addFields({name: 'E-Mail:', value: `${aktualneDane.email} ➡ ${req.body.email}`});
		}
		if(req.file){
			const nowaNazwa = req.file.destination + req.file.filename;
			await db.execute("UPDATE `konta` SET `awatar` = ? WHERE `token` = ?" , [nowaNazwa, token]);
			console.log("Zmieniono awatar dla", login, nowaNazwa);
			embed1.addFields({name: 'Nowy awatar:', value: '\u200B'}).setImage('https://system.thebossspedition.pl/img/'+nowaNazwa);
			embed2.addFields({name: 'Nowy awatar:', value: '\u200B'}).setImage('https://system.thebossspedition.pl/img/'+nowaNazwa);
			// usunac stary awatar jesli nie jest placeholderem
			if(aktualneDane.awatar != 'awatary/default.png'){
				fs.unlink(aktualneDane.awatar, (err) => {if(err) console.log(err)});
			}
		}
		await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
		await dcbot.users.send(result[0].discord, {embeds: [embed2]}).catch(async (er) => {
			try {
				await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${result[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
			} catch(erdc){
				console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
			}
		});
		res.send({odp: "OK"});
	} else {
		res.send({blad: "Nie ma takiego uzytkownika!"});
	}
});

app.post("/licznikTrasPopraw/:token", async (req, res) => {
	if(!req.params.token) return;
	const [r] = await db.execute("SELECT COUNT(*) as 'd' FROM `trasy` WHERE `zatwierdz` = 2 AND `dozwolpoprawke` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?)", [req.params.token]);
	if(r.length){
		res.send({odp: r[0].d});
	} else {
		res.send({odp: 0});
	}
});

app.post("/sprawdzUprawnienie/:login/licencjeATS", async (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	let tmp = {response: 1};
	
	const [izo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 52 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.izo = izo.length > 0 ? izo[0]['dokiedy'] : "Brak";
	const [klo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 66 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.klo = klo.length > 0 ? klo[0]['dokiedy'] : "Brak";
	const [chlo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 56 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.chlo = chlo.length > 0 ? chlo[0]['dokiedy'] : "Brak";
	const [podk] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 58 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.podk = podk.length > 0 ? podk[0]['dokiedy'] : "Brak";
	const [cys] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 64 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.cys = cys.length > 0 ? cys[0]['dokiedy'] : "Brak";
	const [niskpodl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 68 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.niskpodl = niskpodl.length > 0 ? niskpodl[0]['dokiedy'] : "Brak";
	const [lora] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 72 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.lora = lora.length > 0 ? lora[0]['dokiedy'] : "Brak";
	const [plat] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 60 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.plat = plat.length > 0 ? plat[0]['dokiedy'] : "Brak";
	const [bydl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 70 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.bydl = bydl.length > 0 ? bydl[0]['dokiedy'] : "Brak";
	const [wywr] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 62 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.wywr = wywr.length > 0 ? wywr[0]['dokiedy'] : "Brak";

	res.send(tmp);
});

app.post("/sprawdzUprawnienie/:login/szkoleniaATS", async (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	let tmp = {response: 1};
	const [izo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 53 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.izo = izo.length > 0 ? izo[0]['dokiedy'] : "Brak";
	const [klo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 67 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.klo = klo.length > 0 ? klo[0]['dokiedy'] : "Brak";
	const [chlo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 57 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.chlo = chlo.length > 0 ? chlo[0]['dokiedy'] : "Brak";
	const [podk] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 59 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.podk = podk.length > 0 ? podk[0]['dokiedy'] : "Brak";
	const [cys] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 65 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.cys = cys.length > 0 ? cys[0]['dokiedy'] : "Brak";
	const [niskpodl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 69 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.niskpodl = niskpodl.length > 0 ? niskpodl[0]['dokiedy'] : "Brak";
	const [lora] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 73 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.lora = lora.length > 0 ? lora[0]['dokiedy'] : "Brak";
	const [plat] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 61 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.plat = plat.length > 0 ? plat[0]['dokiedy'] : "Brak";
	const [bydl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 71 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.bydl = bydl.length > 0 ? bydl[0]['dokiedy'] : "Brak";
	const [wywr] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 63 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.wywr = wywr.length > 0 ? wywr[0]['dokiedy'] : "Brak";
	res.send(tmp);
});

app.post("/sprawdzUprawnienie/:login/licencjeETS", async (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	let tmp = {response: 1};
	const [fir] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 4 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.fir = fir.length > 0 ? fir[0]['dokiedy'] : "Brak";
	const [klo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 6 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.klo = klo.length > 0 ? klo[0]['dokiedy'] : "Brak";
	const [chlo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 8 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.chlo = chlo.length > 0 ? chlo[0]['dokiedy'] : "Brak";
	const [podk] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 10 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.podk = podk.length > 0 ? podk[0]['dokiedy'] : "Brak";
	const [cys] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 12 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.cys = cys.length > 0 ? cys[0]['dokiedy'] : "Brak";
	const [niskpodw] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 14 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.niskpodw = niskpodw.length > 0 ? niskpodw[0]['dokiedy'] : "Brak";
	// const [niskpodl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 16 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	// tmp.niskpodl = niskpodl.length > 0 ? niskpodl[0]['dokiedy'] : "Brak";
	const [lora] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 18 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.lora = lora.length > 0 ? lora[0]['dokiedy'] : "Brak";
	const [plat] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 20 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.plat = plat.length > 0 ? plat[0]['dokiedy'] : "Brak";
	const [katCE] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 35 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.katCE = katCE.length > 0 ? katCE[0]['dokiedy'] : "Brak";
	const [adr] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 40 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.adr = adr.length > 0 ? adr[0]['dokiedy'] : "Brak";
	const [gab] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 41 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.gab = gab.length > 0 ? gab[0]['dokiedy'] : "Brak";
	const [dlug] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 42 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.dlug = dlug.length > 0 ? dlug[0]['dokiedy'] : "Brak";
	const [bydl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 44 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.bydl = bydl.length > 0 ? bydl[0]['dokiedy'] : "Brak";
	const [wywr] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 45 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.wywr = wywr.length > 0 ? wywr[0]['dokiedy'] : "Brak";
	res.send(tmp);
});

app.post("/sprawdzUprawnienie/:login/szkoleniaETS", async (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	let tmp = {response: 1};
	const [fir] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 5 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.fir = fir.length > 0 ? fir[0]['dokiedy'] : "Brak";
	const [klo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 7 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.klo = klo.length > 0 ? klo[0]['dokiedy'] : "Brak";
	const [chlo] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 9 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.chlo = chlo.length > 0 ? chlo[0]['dokiedy'] : "Brak";
	const [podk] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 11 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.podk = podk.length > 0 ? podk[0]['dokiedy'] : "Brak";
	const [cys] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 13 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.cys = cys.length > 0 ? cys[0]['dokiedy'] : "Brak";
	const [niskpodw] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 15 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.niskpodw = niskpodw.length > 0 ? niskpodw[0]['dokiedy'] : "Brak";
	// const [niskpodl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 17 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	// tmp.niskpodl = niskpodl.length > 0 ? niskpodl[0]['dokiedy'] : "Brak";
	const [lora] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 19 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.lora = lora.length > 0 ? lora[0]['dokiedy'] : "Brak";
	const [plat] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 21 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.plat = plat.length > 0 ? plat[0]['dokiedy'] : "Brak";
	const [katCE] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 48 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.katCE = katCE.length > 0 ? katCE[0]['dokiedy'] : "Brak";
	const [adr] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 49 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.adr = adr.length > 0 ? adr[0]['dokiedy'] : "Brak";
	const [gab] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 50 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.gab = gab.length > 0 ? gab[0]['dokiedy'] : "Brak";
	const [dlug] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 51 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.dlug = dlug.length > 0 ? dlug[0]['dokiedy'] : "Brak";
	const [bydl] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 43 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.bydl = bydl.length > 0 ? bydl[0]['dokiedy'] : "Brak";
	const [wywr] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 46 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login]);
	tmp.wywr = wywr.length > 0 ? wywr[0]['dokiedy'] : "Brak";
	res.send(tmp);
});

app.post("/sprawdzUprawnienieTrasy", async (req, res) => {
	//dc niepotrzebne
	if(!req.body.idosoby || !req.body.idnaczepy || !req.body.kiedy){
		res.send({posiada: false, blad: "Niepelne parametry"});
	} else {
		try {
			const [r] = await db.execute("SELECT `dokiedy` FROM `uprawnienia` WHERE `kto` = ? AND `naco` = ? AND `odkiedy` <= ? ORDER BY `dokiedy` DESC", [req.body.idosoby, req.body.idnaczepy, req.body.kiedy]);
			if(r.length > 0){
				res.send({posiada: r[0].dokiedy});
			} else {
				res.send({posiada: false});
			}
		} catch(er){
			console.log(er);
			res.send({posiada: false, blad: "Wystąpił błąd SQL"});
		}
	}
});

app.post("/rekrutacjaIlosc", async (req, res) => {
	//dc niepotrzebne
	try {
		const [r] = await db.query("SELECT COUNT(*) as 'l' FROM `rekrutacja` WHERE `status` = 3");
		res.send({response: true, liczba: r[0].l});
	} catch(er) {
		console.log(er);
		res.send({response: true, liczba: 0});
		return;
	}
});

app.post("/rekrutacja/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token) return;
	try {
		const [r] = await db.query("SELECT * FROM `rekrutacja` WHERE `status` != 0 ORDER BY CASE WHEN status = 3 THEN 1 ELSE 2 END, id DESC");
		res.send({dane: r});
	} catch(er) {
		console.log(er);
		res.send({dane: []});
		return;
	}
});

app.post("/szkoleniaOczekujace/:token", async (req, res) => {
	if(!req.params.token) return;
	const [ kierowca ] = await db.execute("SELECT id, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(!kierowca.length){
		res.send({blad: "Nieautoryzowany dostęp."});
		return;
	}
	if(kierowca[0].typkonta > 3){
		res.send({response: true, liczba: 0});
		return;
	}
	// oczekujace, nie przejete przez nikogo
	const [ oczekujace ] = await db.query("SELECT COUNT(*) as 'ile' FROM `szkolenieTicket` WHERE `status` = 0");
	// przejete przez ziutka, w trakcie
	const [ przejete ] = await db.query("SELECT COUNT(*) as 'ile' FROM `szkolenieTicket` WHERE `status` = 1 AND `instruktor` = (SELECT `id` FROM `konta` WHERE `token` = ?)", [req.params.token]);
	res.send({response: true, liczba: (oczekujace[0].ile + przejete[0].ile) });
	return;
});

app.post("/zlozRekrutacje", async (req, res) => {
	const kodZwrotny = req.body.kodDiscord;
	if(!kodZwrotny) {
		res.send({blad: "Brak kodu weryfikacyjnego!"});
		return;
	}
	if(kodZwrotny.length != 8){
		res.send({blad: "Niepoprawna długość kodu weryfikacyjnego!"});
		return;
	}
	if(!req.body.email) {
		res.send({blad: "Nieuzupełniono adresu e-mail!"});
		return;
	}
	if(req.body.email.length < 6 || req.body.email.length > 60){
		res.send({blad: "Niepoprawna długość adresu e-mail!"});
		return;
	}
	if(!req.body.pseudonim) {
		res.send({blad: "Nieuzupełniony pseudonim!"});
		return;
	}
	if(req.body.pseudonim.length < 3 || req.body.pseudonim.length > 30){
		res.send({blad: "Niepoprawna długość pseudonimu!"});
		return;
	}
	if(!req.body.wiek) {
		res.send({blad: "Nieuzupełniony wiek!"});
		return;
	}
	if(req.body.wiek < 13){
		res.send({blad: "Twój wiek jest nieodpowiedni..."});
		return;
	}
	const [ znajdz ] = await db.query("SELECT discord FROM rekrutacja WHERE klucz = ?", [kodZwrotny]);
	if(!znajdz.length) {
		res.send({blad: "Niepoprawny kod weryfikacyjny!"});
		return;
	}
	try {
		const [rekruUpdate] = await db.execute("UPDATE rekrutacja SET steamid = ?, lat = ?, godzin = ?, email = ?, truckbook = ?, truckersmp = ?, dlaczego = ?, pseudonim = ?, ktopolecil = ?, podwykonawca = ?, status = 3 WHERE klucz = ?",
			[req.body.steam, req.body.wiek, req.body.godziny, req.body.email, req.body.truckbook || null, req.body.tmp || null, req.body.uzasadnienie, req.body.pseudonim, req.body.polecone || null, req.body.podwykonawca ? 1 : 0, kodZwrotny]);
		if(rekruUpdate.affectedRows) {
			res.send({odp: true});
			const embedRekruOdp = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp()
				.setTitle("Zgłoszenie rekrutacyjne")
				.setDescription("Twoje zgłoszenie rekrutacyjne zostało pomyślnie złożone w systemie. Oczekuj cierpliwie na rozpatrzenie przez zarząd spedycji! Decyzję o odrzuceniu lub przyjęciu Twojego zgłoszenia otrzymasz w wiadomości prywatnej od systemowego bota lub członka zarządu.")
				.setColor(0x01F1AD)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			try {
				dcbot.users.send(znajdz[0].discord, {embeds: [embedRekruOdp]});
			} catch(erdc) {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${znajdz[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc2){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc2);
				}
			}
			try {
				const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
					.setDescription(`Użytkownik ${req.body.pseudonim}, <@${znajdz[0].discord}> złożył zgłoszenie rekrutacyjne!`)
					.setTitle("Nowe zgłoszenie rekrutacyjne");
				await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
			} catch(errekru){
				console.log("bład powiadomioenia o zlozeniu rekrutacji w logach rekrutacji");
				console.log(errekru);
			}
		} else {
			res.send({blad: "Wystąpił błąd! Spróbuj ponownie!"});
		}
	} catch(er) {
		console.log("[BLAD REKRUTACJA]: ", er);
		res.send({blad: "Wystąpił błąd bazy danych! Spróbuj ponownie."});
	}
});

app.post("/STAREzlozRekrutacje", async (req, res) => {
	try {
		const [r] = await db.execute("INSERT INTO `rekrutacja` (`rekrutacja`.`pseudonim`, `rekrutacja`.`ktopolecil`, `rekrutacja`.`steamid`, `rekrutacja`.`lat`, `rekrutacja`.`godzin`, `rekrutacja`.`email`, `rekrutacja`.`truckbook`, `rekrutacja`.`truckersmp`, `rekrutacja`.`dlaczego`, `rekrutacja`.`klucz`, `rekrutacja`.`discord`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'brak')", [req.body.pseudonim, req.body.ktopolecil, req.body.steamid, req.body.lat, req.body.godzin, req.body.email, req.body.truckbook, req.body.truckersmp, req.body.dlaczego, req.body.md5]);
		if(r.affectedRows > 0){
			await smtp.sendMail({
				from: 'no-reply@thebossspedition.pl',
				to: req.body.email,
				subject: 'The Boss Spedition - Zgłoszenie rekrutacyjne',
				html: `<b>${req.body.pseudonim}!</b><br>Przyjęto twoje zgłoszenie rekrutacyjne w wirtualnej spedycji The Boss Spedition<br>Wejdź w poniższy link, aby potwierdzić swoje zgłoszenie:<br><a href='https://thebossspedition.pl/potwierdz.php?v=${req.body.md5}'>https://thebossspedition.pl/potwierdz.php?v=${req.body.md5}</a>`
			}).then((rm) => {
				console.log(dataLog(), `${req.body.pseudonim} złożył podanie rekrutacyjne.`);
				res.send({odp: "OK"});
			}).catch(async (erm) => {
				res.send({blad: "Niepowiadomiono"});;
			});
		}
	} catch(er) {
		console.log("Błąd rekrutacji", er);
		res.send({blad: "Błąd przyjęcia zgłoszenia"});
		return;
	}
});

app.post("/potwierdzRekrutacje", async (req, res) => {
	const [r] = await db.execute("SELECT `pseudonim`, `discord` FROM `rekrutacja` WHERE `email` = ? AND `klucz` = ?", [req.body.email, req.body.klucz]);
	if(r.length > 0){
		try {
			
		} catch(er2) {
			console.log(er2);
			res.send({blad: "Błąd SQL"});
			return;
		}
		const [r2] = await db.execute("UPDATE `rekrutacja` SET `klucz`='potwierdzone', `discord` = ? WHERE `email` = ? AND `klucz` = ?", [req.body.discord, req.body.email, req.body.klucz]);
		if(r2.affectedRows > 0){
			res.send({odp: "OK"});
			const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
			.setDescription(`Użytkownik ${r[0].pseudonim}, <@${req.body.discord}> złożył zgłoszenie rekrutacyjne!`)
			.setTitle("Nowe zgłoszenie rekrutacyjne");
			await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
		}
	} else {
		res.send({blad: "Zero wynikow"});
	}
});

app.post("/rekrutacjaOdrzuc/:login/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token) return;
	try {
		const [r] = await db.execute("UPDATE `rekrutacja` SET `klucz` = 'odrzucone' WHERE `id` = ?", [req.body.id]);
		if(r.affectedRows > 0){
			console.log(dataLog(), `${req.params.login} odrzucił zgłoszenie rekrutacyjne użytkownika ${req.body.pseudonim} ${req.body.email}`);
			//powiadom email
			smtp.sendMail({
				from: 'no-reply@thebossspedition.pl',
				to: req.body.email,
				subject: 'Odrzucone zgłoszenie - The Boss Spedition',
				html: `<b>${req.body.pseudonim}!</b><br>Jest nam niezmiernie przykro poinformować, iż twoje zgłoszenie rekrutacyjne zostało odrzucone.<br>Finalną decyzję podjął: <b>${req.params.login}</b>`
			}).then((rm) => {
				res.send({odp: "OK"});
			}).catch((erm) => {
				const embed2 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
				.setDescription(`${req.body.pseudonim}! Jest nam niezmiernie przykro poinformować, iż twoje zgłoszenie rekrutacyjne zostało odrzucone.\nFinalną decyzję podjął ${req.params.login}`)
				.setTitle("Odrzucone zgłoszenie rekrutacyjne");
				dcbot.users.send(req.body.discord, {embeds: [embed2]})
				.then(() => {
					res.send({odp: "Prawie OK", blad: `Podanie odrzucone, ale wystąpił błąd z poinformowaniem osoby poprzez e-mail. System poinformował osobę przez platformę Discord.`});
				}).catch(async (er) => {
					res.send({odp: "Prawie OK", blad: `Podanie odrzucone, ale wystąpił błąd z poinformowaniem osoby poprzez e-mail oraz Discord. Jego email: ${req.body.email} , Discord ID: <@${req.body.discord}>`});
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			});
			const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
				.setDescription(`${req.params.login} odrzucił zgłoszenie rekrutacyjne ${req.body.pseudonim}\nE-mail osoby: ${req.body.email}\nDiscord osoby: <@${req.body.discord}>`)
				.setTitle("Odrzucone zgłoszenie rekrutacyjne");
			await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
		}
	} catch(er) {
		console.log(dataLog(), "Wystąpił błąd z odrzuceniem podania rekrutacyjnego o ID: ", req.body.id);
		res.send({blad: "Błąd SQL"});
		return;
	}
});

app.post("/rekrutacjaDecyzja/:token", async (req, res) => {
	if(!req.params.token) {
		res.send({blad: "Nieuprawniony"});
		return;
	}
	const [ decydujacy ] = await db.query("SELECT login, discord, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(!decydujacy.length){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	if(decydujacy[0].typkonta < 1 || decydujacy[0].typkonta > 2){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	if(!req.body.id){
		res.send({blad: "Brak identyfikatora zgłoszenia."});
		return;
	}
	const [daneZgloszenia ] = await db.query("SELECT * FROM rekrutacja WHERE id = ?", [req.body.id]);
	if(!daneZgloszenia.length){
		res.send({blad: "Zgloszenie nie istnieje."});
		return;
	}
	if(req.body.decyzja == "odrzuc") {
		const embed2 = new EmbedBuilder().setColor(0xFFA2A2).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
			.setDescription(`${daneZgloszenia[0].pseudonim}! Jest nam niezmiernie przykro poinformować, iż twoje zgłoszenie rekrutacyjne zostało odrzucone.\nFinalną decyzję podjął ${decydujacy[0].login}`)
			.setTitle("Odrzucone zgłoszenie rekrutacyjne");
		try {
			const embed1 = new EmbedBuilder().setColor(0xFFA2A2).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
				.setDescription(`${decydujacy[0].login} odrzucił zgłoszenie rekrutacyjne #${req.body.id} użytkownika ${daneZgloszenia[0].pseudonim} <@${daneZgloszenia[0].discord}>`)
				.setTitle("Odrzucone zgłoszenie rekrutacyjne");
			await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
		} catch(logerr) {
			console.log("Niepowiadomiono w logach...")
		}
		try {
			await db.execute("UPDATE rekrutacja SET status = 2 WHERE id = ?", [req.body.id]);
			try {
				dcbot.users.send(daneZgloszenia[0].discord, { embeds: [embed2] });
				res.send({odp: true});
				return;
			} catch(erdc) {
				res.send({odp: true, blad: "Odrzucono zgłoszenie, ale wystąpił błąd poinformowania osoby na Discordzie."});
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${daneZgloszenia[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					return;
				} catch(erdc2) {
					console.log("Blad poinformowania o odrzuceniu, zablokowane dmy i brak dostepu do CHANNEL_OGOLNY.");
					return;
				}
			}
		} catch(erdb) {
			res.send({odp: false, blad: "Wystąpił błąd bazy danych podczas odrzucenia zgłoszenia."});
			return;
		}
	} else if(req.body.decyzja == "zaakceptuj") {
		const generujHaslo = Math.random().toString(36).slice(2, 10);
		const szyfrujHaslo = CryptoJS.HmacSHA1(generujHaslo, KLUCZ_H).toString();

		try {
			await db.execute("INSERT INTO konta (login, email, haslo, typkonta, rangi, stawka, discord, steam, truckbook, truckersmp) VALUES (?, ?, ?, ?, 13, 0.10, ?, ?, ?, ?)", [daneZgloszenia[0].pseudonim, daneZgloszenia[0].email, szyfrujHaslo, daneZgloszenia[0].podwykonawca ? 10 : 6, daneZgloszenia[0].discord, daneZgloszenia[0].steamid ? "https://steamcommunity.com/profiles/"+daneZgloszenia[0].steamid : null, daneZgloszenia[0].truckbook ? "https://trucksbook.eu/users/all/0?search="+daneZgloszenia[0].truckbook : null, daneZgloszenia[0].truckersmp ? "https://truckersmp.com/user/"+daneZgloszenia[0].truckersmp : null]);
			await db.execute("UPDATE rekrutacja SET status = 1 WHERE id = ?", [req.body.id]);

			// powiadomienie na logach
			try {
				const embed1 = new EmbedBuilder().setColor(0x7BF1A8).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
					.setDescription(`${decydujacy[0].login} zaakceptował zgłoszenie rekrutacyjne #${req.body.id} użytkownika ${daneZgloszenia[0].pseudonim}\nStworzono nowy profil w systemie.`)
					.setTitle("Zaakceptowane zgłoszenie rekrutacyjne");
				await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
			} catch(logdc) {
				console.log("Niepowiadomiono o akceptacji zgloszenia rekru w logach rekru.");
			}

			// powiadomienie prywatne
			try {
				const embed2 = new EmbedBuilder().setColor(0x7BF1A8).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
					.setDescription(`${daneZgloszenia[0].pseudonim}! Jest nam miło poinformować, iż twoje zgłoszenie rekrutacyjne zostało zaakceptowane!\nFinalną decyzję podjął ${decydujacy[0].login}. Teraz możesz zalogować się do systemu!`)
					.addFields({name: "Twój login:", value: daneZgloszenia[0].pseudonim, inline: true})
					.addFields({name: "Tymczasowe hasło:", value: generujHaslo, inline: true})
					.addFields({name: "UWAGA!", value: `Hasło możesz zmienić poprzez "Resetuj hasło" przed zalogowaniem lub po zalogowaniu wchodząc na [swój profil](https://system.thebossspedition.pl/profil/). Twoje konto posiada również ograniczony dostęp w systemie do momentu przydzielenia Tobie większych uprawnień. Jeśli nie wiesz, jak korzystać z Systemu, skorzystaj z tego poradnika: https://youtu.be/3Z1mRzcO1Fo`, inline: false})
					.setTitle("Zaakceptowane zgłoszenie rekrutacyjne");
				await dcbot.users.send(daneZgloszenia[0].discord, {embeds: [embed2]})
				res.send({odp: true});
			} catch(erdc) {
				console.log("[BLAD TWORZENIA KONTA REKRU]");
				console.log("LOGIN: ", daneZgloszenia[0].pseudonim);
				console.log("TYMCZASOWE HASLO: ", generujHaslo);
				res.send({odp: true, blad: `Zaakceptowano zgłoszenie, ale wystąpił błąd podczas wysyłania tymczasowych danych do logowania na system w Discord DM. Login: ${daneZgloszenia[0].pseudonim} Haslo: ${generujHaslo}`})
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${daneZgloszenia[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					return;
				} catch(erdc2) {
					console.log("Blad poinformowania o akceptacji rekrutacji, zablokowane dmy i brak dostepu do CHANNEL_OGOLNY.");
					return;
				}
			}

		} catch(erak) {
			console.log("Wystąpił błąd podczas tworzenia konta dla rekrutanta.", erak);
			res.send({odp: false, blad: "Wystąpił błąd podczas tworzenia konta w systemie dla tej osoby."});
			return;
		}

	} else {
		res.send({blad: "Niepoprawne zapytanie."});
		return;
	}
});

app.post("/rekrutacjaPrzyjmij/:login/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token) return;
	try {
		const [r] = await db.execute("UPDATE `rekrutacja` SET `klucz` = 'przyjety' WHERE `id` = ?", [req.body.id]);
		if(r.affectedRows > 0){
			console.log(dataLog(), `${req.params.login} pomyślnie przyjął podanie rekrutacyjne użytkownika ${req.body.pseudonim}`);
			const generujHaslo = Math.random().toString(36).slice(2, 10);
			const szyfrujHaslo = CryptoJS.HmacSHA1(generujHaslo, KLUCZ_H).toString();
			try {
				const [r2] = await db.execute("INSERT INTO `konta` (`login`, `email`,`haslo`,`typkonta`,`rangi`,`stawka`,`discord`,`steam`,`truckbook`,`truckersmp`) VALUES (?, ?, ?, 10, 13, 0.10, ?, ?, ?, ?)", [req.body.pseudonim, req.body.email, szyfrujHaslo, req.body.discord, "https://steamcommunity.com/profiles/"+req.body.steamid, "https://trucksbook.eu/users/all/0?search="+req.body.truckbook, "https://truckersmp.com/user/"+req.body.truckersmp]);
				if(r2.affectedRows > 0){
					console.log(dataLog(), `Pomyślnie stworzono konto dla nowego użytkownika ${req.body.pseudonim}`);
					await smtp.sendMail({
						from: 'no-reply@thebossspedition.pl',
						to: req.body.email,
						subject: 'Przyjęte zgłoszenie - The Boss Spedition',
						html: `<b>${req.body.pseudonim}!</b><br>Jest nam miło poinformować, iż twoje zgłoszenie rekrutacyjne zostało zaakceptowane!<br>Finalną decyzję podjął: <b>${req.params.login}</b><br><br>Twoje dane logowania do systemu:<br>Login: <b>${req.body.pseudonim}</b><br>Tymczasowe hasło: <b>${generujHaslo}</b><br><b>Hasło możesz zmienić edytując swój profil w systemie lub rozpoczynając proces resetowania hasła przed zalogowaniem! Twoje konto posiada również ograniczony dostęp w systemie do momentu przydzielenia Tobie większych uprawnień. Jeśli nie wiesz, jak korzystać z Systemu, skorzystaj z tego poradnika: <a href="https://youtu.be/3Z1mRzcO1Fo">https://youtu.be/3Z1mRzcO1Fo</a><br>Powodzenia!</b>`
					}).then((rm) => {
						console.log(dataLog(), `Poinformowano użytkownika ${req.body.pseudonim} przyjętego w rekrutacji mailowo.`);
						res.send({odp: "OK"});
					}).catch(async (erm) => {
						const embed2 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
							.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
							.setDescription(`${req.body.pseudonim}! Jest nam miło poinformować, iż twoje zgłoszenie rekrutacyjne zostało zaakceptowane!\nFinalną decyzję podjął ${req.params.login}. Teraz możesz zalogować się do systemu!`)
							.addFields({name: "Twój login:", value: req.body.pseudonim, inline: true})
							.addFields({name: "Tymczasowe hasło:", value: generujHaslo, inline: true})
							.addFields({name: "UWAGA!", value: `Hasło możesz zmienić poprzez "Resetuj hasło" przed zalogowaniem lub po zalogowaniu wchodząc na [swój profil](https://system.thebossspedition.pl/profil/). Twoje konto posiada również ograniczony dostęp w systemie do momentu przydzielenia Tobie większych uprawnień. Jeśli nie wiesz, jak korzystać z Systemu, skorzystaj z tego poradnika: https://youtu.be/3Z1mRzcO1Fo`, inline: false})
							.setTitle("Zaakceptowane zgłoszenie rekrutacyjne");
						await dcbot.users.send(req.body.discord, {embeds: [embed2]})
						.then(() => {
							console.log(dataLog(), `Poinformowano użytkownika ${req.body.pseudonim} przyjętego w rekrutacji na discordzie.`);
							res.send({odp: "Prawie OK", blad: `Pomyślnie stworzono konto dla nowego użytkownika ${req.body.pseudonim}. Wystąpił błąd z poinformowaniem go poprzez e-mail o pozytywnym rozpatrzeniu rekrutacji, natomiast poinformowano go przez platformę Discord.`});
						}).catch(async () => {
							console.log(dataLog(), `Ale wystąpił błąd z poinformowaniem go poprzez e-mail i discord o pozytywnym rozpatrzeniu rekrutacji! Jego email: ${req.body.email}, Login konta: ${req.body.pseudonim}, Tymczasowe hasło: ${generujHaslo}`);
							res.send({odp: "Prawie OK", blad: `Pomyślnie stworzono konto dla nowego użytkownika ${req.body.pseudonim} ale wystąpił błąd z poinformowaniem go poprzez e-mail lub Discord o pozytywnym rozpatrzeniu rekrutacji! Jego email: ${req.body.email}, Login do konta: ${req.body.pseudonim}, Tymczasowe hasło: ${generujHaslo}`});
							try {
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							} catch(erdc){
								console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
							}
						});
					});
					const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
						.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
						.setDescription(`${req.params.login} zaakceptował zgłoszenie rekrutacyjne ${req.body.pseudonim}\nStworzono nowy profil w systemie z ograniczonym dostępem.`)
						.setTitle("Zaakceptowane zgłoszenie rekrutacyjne");
					await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
				}
			} catch(er2) {
				console.log(er2);
				await db.execute("UPDATE `rekrutacja` SET `klucz` = 'potwierdzone' WHERE `id` = ?", [req.body.id]);
				console.log(dataLog(), `Wystąpił błąd podczas tworzenia konta dla przyjętego kierowcy ${req.body.pseudonim}! Cofam stan podania do ponownego rozpatrzenia.`);
				res.send({blad: er2});
				return;
			}
		}
	} catch(er) {
		console.log(dataLog(), "Wystąpił błąd z przyjęciem podania rekrutacyjnego o ID", req.body.id);
		res.send({blad: "Błąd SQL"});
		return;
	}
});

app.post("/profilWiniety/:login", async (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	const dzis = new Date().toISOString().split('T')[0];
	const [result] = await db.execute("SELECT `kupionewiniety`.`id` as 'idwiniety', `kupionewiniety`.`kraj` as 'idkraj', `kupionewiniety`.`dokiedy` as 'dokiedy', `winiety`.`kraj` as 'flaga' FROM `kupionewiniety`, `winiety` WHERE `kupionewiniety`.`kraj` = `winiety`.`id` AND `kupionewiniety`.`dokiedy` >= ? AND `kupionewiniety`.`kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `winiety`.`kraj` ASC", [dzis, login]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((rekord) => {
			tmp.push({idwiniety: rekord.idwiniety, kraj: rekord.flaga, termin: rekord.dokiedy, flaga: rekord.flaga.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")});
		});
		res.send({response: 1, dane: tmp});
	} else {
		res.send({blad: "Brak"});
	}
});

app.post("/wszystkieWiniety", async (req, res) => {
	//dc niepotrzebne
	let tmp = [];
	try {
		const [r] = await db.query("SELECT * FROM `winiety` ORDER BY `kraj` ASC");
		if(r.length > 0){
			r.forEach((w) => {
				tmp.push({id: w.id, kraj: w.kraj, cena: w.cena});
			});
			res.send({response: true, dane: tmp});
		} else {
			res.send({response: true, dane: null});
		}
	} catch(er) {
		console.log(er);
		res.send({blad: "Blad sql"});
		return;
	}
});

app.post("/ustawWiniete/:login", async (req, res) => {
	//dc zrobione
	if(!req.params.login) return;
	const [rc] = await db.execute("SELECT `cena` as 'c' FROM `winiety` WHERE `id` = ?", [req.body.ktora]);
	try {
		const [r] = await db.execute("UPDATE `winiety` SET `cena` = ? WHERE `id` = ?", [req.body.cena, req.body.ktora]);
		if(r.affectedRows > 0){
			console.log(`${req.params.login} zmienił cene winiety ${req.body.kraj} na ${req.body.cena}`);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zmiany ceny Winiety")
				.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) zmienił cenę winiety.`).setColor(0xFF9950)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Państwo", value: req.body.kraj, inline: true})
				.addFields({name: "Stara cena", value: `${rc[0].c} zł`, inline: true})
				.addFields({name: 'Nowa cena', value: `${req.body.cena} zł`, inline: true});
			dcbot.channels.cache.get(process.env.CHANNEL_WINIETY).send({embeds: [embed1]});
			res.send({odp: 'OK'});
		}
	} catch(er) {
		console.log(er);
		res.send({blad: 'Blad sql'});
		return;
	}
});

app.post("/swojeWiniety/:token", async (req, res) => {
	//dc niepotrzebne
	const token = req.params.token;
	const [result] = await db.execute("SELECT `kupionewiniety`.`id` as 'idwiniety', `kupionewiniety`.`kraj` as 'idkraj', `kupionewiniety`.`dokiedy` as 'dokiedy', `winiety`.`kraj` as 'flaga' FROM `kupionewiniety`, `winiety` WHERE `kupionewiniety`.`kraj` = `winiety`.`id` AND `kupionewiniety`.`kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) ORDER BY `winiety`.`kraj` ASC", [token]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((rekord) => {
			tmp.push({idwiniety: rekord.idwiniety, kraj: rekord.idkraj, termin: rekord.dokiedy});
		});
		res.send({response: 1, dane: tmp});
	} else {
		res.send({blad: "Brak"});
	}
});

app.post("/czyjesWiniety/:login/:token", async (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	const token = req.params.token;
	if(!login || !token){
		res.send({blad: "Niepoprawne zapytanie"});
		return;
	}
	const [result] = await db.execute("SELECT `kupionewiniety`.`id` as 'idwiniety', `kupionewiniety`.`kraj` as 'idkraj', `kupionewiniety`.`dokiedy` as 'dokiedy', `winiety`.`kraj` as 'flaga' FROM `kupionewiniety`, `winiety` WHERE `kupionewiniety`.`kraj` = `winiety`.`id` AND `kupionewiniety`.`kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `winiety`.`kraj` ASC", [login]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((rekord) => {
			tmp.push({idwiniety: rekord.idwiniety, kraj: rekord.idkraj, termin: rekord.dokiedy});
		});
		res.send({response: 1, dane: tmp});
	} else {
		res.send({blad: "Brak"});
	}
});

app.post("/zakupWinietyNowe/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	if(req.body.ktore.length < 1){
		res.send({odp: 'OK'});
		return;
	}
	let dzis = new Date();
	dzis.setMonth(dzis.getMonth() + 1);
	const dokiedy = dzis.toISOString().split('T')[0];
	let tmp = [];
	const [r] = await db.execute("SELECT `id` FROM `konta` WHERE `token` = ?", [req.params.token]);
	const id = r[0].id;
	req.body.ktore.map((w) => {
		tmp.push([id, w, dokiedy, req.body.cena]);
	})
	try {
		const [r2] = await db.execute("INSERT INTO `kupionewiniety` (`kto`,`kraj`,`dokiedy`,`zaile`) VALUES ?", [tmp]);
		if(r2.affectedRows > 0){
			console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} zakupił nowe winiety ${req.body.ktore}`);
			res.send({odp: "OK"});
		}
	} catch(er2) {
		console.log(er2);
		res.send({blad: "Blad SQL"});
	}
});

app.post("/zakupWinietyWazne/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	if(req.body.ktore.length < 1){
		res.send({odp: 'OK'});
		return;
	}
	const dzis = new Date().toISOString().split('T')[0];
	let tmp = [];
	req.body.ktore.map((w) => tmp.push(parseInt(w)));
	try {
		const [r2] = await db.execute("UPDATE `kupionewiniety` SET `dokiedy` = ADDDATE(`dokiedy`, 31), `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) AND `kraj` IN (?) AND `dokiedy` >= ?", [req.body.cena, req.params.token, tmp, dzis]);
		if(r2.affectedRows > 0){
			console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} przedłużył winiety ${req.body.ktore}`);
			res.send({odp: "OK"});
		}
	} catch(er2) {
		console.log(er2);
		res.send({blad: "Blad SQL"});
	}
});

app.post("/zakupWinietyWygasle/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	if(req.body.ktore.length < 1){
		res.send({odp: 'OK'});
		return;
	}
	let dzis = new Date();
	dzis.setMonth(dzis.getMonth() + 1);
	const dokiedy = dzis.toISOString().split('T')[0];
	let tmp = [];
	req.body.ktore.map((w) => tmp.push(parseInt(w)));
	try {
		const [r2] = await db.execute("UPDATE `kupionewiniety` SET `dokiedy` = ?, `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) AND `kraj` IN (?)", [dokiedy, req.body.cena, req.params.token, tmp]);
		if(r2.affectedRows > 0){
			console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} odnowił wygasłe winiety ${req.body.ktore} do ${dokiedy}`);
			res.send({odp: "OK"});
		}
	} catch(er2){
		console.log(er2);
		res.send({blad: "Blad SQL"});
	}
});

app.post("/nadajWinietyNowe/:komu/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token || !req.params.komu){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	if(req.body.ktore.length < 1){
		res.send({odp: 'OK'});
		return;
	}
	let dzis = new Date();
	dzis.setMonth(dzis.getMonth() + 1);
	const dokiedy = dzis.toISOString().split('T')[0];
	let tmp = [];
	const [r] = await db.execute("SELECT `id` FROM `konta` WHERE `login` = ?", req.params.komu);
	const id = r[0].id;
	req.body.ktore.map((w) => {
		tmp.push([id, w, dokiedy, req.body.cena]);
	})
	try {
		const [r2] = await db.execute("INSERT INTO `kupionewiniety` (`kto`,`kraj`,`dokiedy`,`zaile`) VALUES ?", [tmp]);
		if(r2.affectedRows > 0){
			res.send({odp: "OK"});
		}
	} catch(er2) {
		console.log(er2);
		res.send({blad: "Blad SQL"});
	}
});

app.post("/nadajWinietyWazne/:komu/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token || !req.params.komu){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	if(req.body.ktore.length < 1){
		res.send({odp: 'OK'});
		return;
	}
	const dzis = new Date().toISOString().split('T')[0];
	let tmp = [];
	req.body.ktore.map((w) => tmp.push(parseInt(w)));
	try {
		const [r2] = await db.execute("UPDATE `kupionewiniety` SET `dokiedy` = ADDDATE(`dokiedy`, 31), `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) AND `kraj` IN (?) AND `dokiedy` >= ?", [req.body.cena, req.params.komu, tmp, dzis]);
		if(r2.affectedRows > 0){
			res.send({odp: "OK"});
		}
	} catch(er2) {
		console.log(er2);
		res.send({blad: "Blad SQL"});
	}
});

app.post("/nadajWinietyWygasle/:komu/:token", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.token || !req.params.komu){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	if(req.body.ktore.length < 1){
		res.send({odp: 'OK'});
		return;
	}
	let dzis = new Date();
	dzis.setMonth(dzis.getMonth() + 1);
	const dokiedy = dzis.toISOString().split('T')[0];
	let tmp = [];
	req.body.ktore.map((w) => tmp.push(parseInt(w)));
	try{
		const [r2] = await db.execute("UPDATE `kupionewiniety` SET `dokiedy` = ?, `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) AND `kraj` IN (?)", [dokiedy, req.body.cena, req.params.komu, tmp]);
		if(r2.affectedRows > 0){
			res.send({odp: "OK"});
		}
	} catch(er2){
		console.log(er2);
		res.send({blad: "Blad SQL"});
	}
});

app.post("/ostatnieTrasy/:token", async (req,res) => {
	//dc niepotrzebne
	const [result] = await db.execute("SELECT * FROM `trasy` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) ORDER BY `id` DESC LIMIT 1000", [req.params.token]);
	if(result.length > 0){
		let tmp = [];
		result.forEach((trasa) => {
			tmp.push({...trasa, kiedy: new Date(trasa.kiedy).toISOString()});
		});
		res.send({dane: tmp});
	} else {
		res.send({blad: "Brak danych"});
	}
});

app.post("/dyspozytorTrasy", async (req,res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT * FROM `trasy` WHERE `zatwierdz` = 0 ORDER BY `id` ASC");
	if(result.length > 0){
		let tmp = [];
		result.forEach((trasa) => {
			tmp.push(trasa);
		});
		res.send({dane: tmp});
	} else {
		res.send({blad: "Brak danych"});
	}
});

const osiagnieciaPoziomy = (poziom) => {
	if(poziom < 1) return {nazwa: "Brak", kolor: 0x535353 };
	if(poziom < 10) return {nazwa: "Żelazo", kolor: 0x71665D };
	if(poziom < 30) return {nazwa: "Brąz", kolor: 0xA0522D };
	if(poziom < 50) return {nazwa: "Srebro", kolor: 0x708090 };
	if(poziom < 70) return {nazwa: "Złoto", kolor: 0xFFD700 };
	if(poziom < 100) return {nazwa: "Platyna", kolor: 0xFF00FF };
	else return {nazwa: "Diament", kolor: 0x1E90FF };
};

const sqlOsiagniecia = async (kierowcaId, osiagniecieId, wartosc) => {
	try {
		const [osiagniecieInfo] = await db.execute("SELECT * FROM typyOsiagniec WHERE id = ?", [osiagniecieId]);
		const [aktualnyProgress] = await db.execute("SELECT * FROM osiagniecia WHERE kierowca = ? AND osiagniecie = ?", [kierowcaId, osiagniecieId]);

		if(aktualnyProgress.length){
			// istnieje, zaktualizowac
			await db.execute("UPDATE osiagniecia SET nabite = nabite + ? WHERE id = ?", [wartosc, aktualnyProgress[0].id]);
			
			let poprzedniPoziom = Math.floor(aktualnyProgress[0].nabite / osiagniecieInfo[0].wartosc);
			let nowyPoziom = Math.floor((aktualnyProgress[0].nabite + wartosc) / osiagniecieInfo[0].wartosc);
			let poprzedniTekst = `Poziom ${poprzedniPoziom} (${osiagnieciaPoziomy(poprzedniPoziom).nazwa})`;
			let nowyTekst = `Poziom ${nowyPoziom} (${osiagnieciaPoziomy(nowyPoziom).nazwa})`;
			// nabite / wymagane = poziom, nabite + wartosc / wymagane
			//sprawdzic czy zmienil sie poziom
			if(poprzedniPoziom != nowyPoziom){
				const [discordKierowcy] = await db.execute("SELECT discord, login FROM konta WHERE id = ?", [kierowcaId]);
				if(!discordKierowcy.length) return;
				if(osiagniecieInfo[0].wartosc > 1){
					poprzedniTekst = poprzedniTekst + `\n-# ${(aktualnyProgress[0].nabite % osiagniecieInfo[0].wartosc).toLocaleString("pl-PL")} / ${osiagniecieInfo[0].wartosc.toLocaleString("pl-PL")} (${((aktualnyProgress[0].nabite % osiagniecieInfo[0].wartosc) / osiagniecieInfo[0].wartosc * 100).toFixed(1)}%)`;
					nowyTekst = nowyTekst + `\n-# ${((aktualnyProgress[0].nabite+wartosc) % osiagniecieInfo[0].wartosc).toLocaleString("pl-PL")} / ${osiagniecieInfo[0].wartosc.toLocaleString("pl-PL")} (${(((aktualnyProgress[0].nabite+wartosc) % osiagniecieInfo[0].wartosc) / osiagniecieInfo[0].wartosc * 100).toFixed(1)}%)`;
				}
				//wyslij powiadomienie dc

				const embed = new EmbedBuilder().setColor(osiagnieciaPoziomy(nowyPoziom).kolor).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
					.setDescription(`**${osiagniecieInfo[0].nazwa}**\n-# ${osiagniecieInfo[0].opis.replace("$wartosc$", osiagniecieInfo[0].wartosc)}`)
					.addFields({name: "Poprzednio:", value: poprzedniTekst, inline: true})
					.addFields({name: "Aktualnie:", value: nowyTekst, inline: true})
					.setTitle("Aktualizacja postępu osiągnięcia");

				if(discordKierowcy[0].discord){
					await dcbot.users.send(discordKierowcy[0].discord, {embeds: [embed]}).catch(async (erdc) => {
						console.log( `Wystąpił błąd z poinformowaniem kierowcy o postepie osiagniecia`, erdc);
						try {
							await dcbot.channels.cache.get(process.env.CHANNEL_OSIAGNIECIA).send(`<@${discordKierowcy[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						} catch(erdc2){
							console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc2);
						}
					});
				}
				embed.addFields({name: "Kierowca", value: `[${discordKierowcy[0].login}](https://system.thebossspedition.pl/profil/${discordKierowcy[0].login})`, inline: false});
				await dcbot.channels.cache.get(process.env.CHANNEL_OSIAGNIECIA).send({embeds: [embed]});
			}
		} else {
			await db.execute("INSERT INTO osiagniecia (kierowca, osiagniecie, nabite) VALUES (?, ?, ?)", [kierowcaId, osiagniecieId, wartosc]);
		}
		// const [wykonaj] = await db.execute("INSERT INTO osiagniecia (kierowca, osiagniecie, nabite) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nabite = nabite + ?", [kierowcaId, osiagniecieId, wartosc, wartosc]);
		console.log("Zaktualizowano osiagniecie ", osiagniecieInfo[0].nazwa, "o wartosc ", wartosc, "dla kierowcy", kierowcaId);
		return true;
	} catch(er){
		console.log(er);
		console.log("Wystapil blad z aktualizacja osiagniecia id: ", osiagniecieId," dla kierowcy o id: ", kierowcaId);
		return false;
	}
};

const powiazaniaNaczep = [
	{ idOsiag: 16, akceptowaneIdNaczep: [8, 9, 56, 57] },
	{ idOsiag: 17, akceptowaneIdNaczep: [18, 19, 72, 73] },
	{ idOsiag: 18, akceptowaneIdNaczep: [45, 46, 62, 63] },
	{ idOsiag: 19, akceptowaneIdNaczep: [14, 15, 16, 17, 68, 69] },
	{ idOsiag: 20, akceptowaneIdNaczep: [12, 13, 64, 65] },
	{ idOsiag: 21, akceptowaneIdNaczep: [6, 7, 66, 67] },
	{ idOsiag: 22, akceptowaneIdNaczep: [4, 5, 52, 53] },
	{ idOsiag: 23, akceptowaneIdNaczep: [10, 11, 58, 59] },
	{ idOsiag: 24, akceptowaneIdNaczep: [43, 44, 70, 71] },
	{ idOsiag: 25, akceptowaneIdNaczep: [20, 21, 60, 61] },
];

const zaktualizujOsiagniecia = async (idKierowcy, idTrasy) => {
	// otrzymaj wartosci z danej trasy
	const [trasa] = await db.execute("SELECT * FROM trasy WHERE id = ?", [idTrasy]);
	if(trasa.length < 1) return;
	// typy osiagniec i ich warunek spelnienia
	// podroznik id 3
	await sqlOsiagniecia(idKierowcy, 3, trasa[0].przejechane);
	//instrybutor id 4 - zrobione w telemetri socket.on paliwo
	// pilny kierowca id 5
	await sqlOsiagniecia(idKierowcy, 5, 1);
	// zaangazowany pracownik id 6
	await sqlOsiagniecia(idKierowcy, 6, trasa[0].masaladunku);
	//ekolog id 7
	if(trasa[0].spalanie*100/trasa[0].przejechane <= 28) await sqlOsiagniecia(idKierowcy, 7, 1);
	// perfekcjonista id 8
	if(trasa[0].uszkodzenia === 0) await sqlOsiagniecia(idKierowcy, 8, 1);
	//stary czlowiek i morze id 9
	try { 
		const [promyPociagi] = await db.execute("SELECT idprompociag FROM trasyprompociag WHERE idtrasa = ?", [idTrasy]);
		if(promyPociagi.length) await sqlOsiagniecia(idKierowcy, 9, promyPociagi.length);
	} catch(er) {
		console.log(er);
		console.log("Wystapil blad aktualizacji osiagniecia Stary człowiek i Morze dla kierowcy", idKierowcy, "na podstawie trasy iD:", idTrasy);
	}
	// zarobas id 10
	await sqlOsiagniecia(idKierowcy, 10, trasa[0].wlasnyzarobek);
	// pracownik miesiaca id 11
	try {
		const [zarobekFirmy] = await db.execute("SELECT suma FROM kontofirmowe WHERE opis = CONCAT('Trasa ', ?)", [idTrasy]);
		if(!zarobekFirmy.length) console.log("Wystapil blad aktualizacji osiagniecia Pracownik miesiaca dla kierowcy ", idKierowcy, " na podstawie trasy iD: ", idTrasy, "Powód: NIE ZNALEZIONO SUMY W kontofirmowe");
		else{
			if(zarobekFirmy[0].suma > 0) await sqlOsiagniecia(idKierowcy, 11, zarobekFirmy[0].suma);
			else console.log("Nie zaktualizowano osiagniecia Pracownik miesiaca bo zarobek firmy byl na minus");
		}
	} catch(er) {
		console.log(er);
		console.log("Wystapil blad aktualizacji osiagniecia Pracownik miesiąca dla kierowcy", idKierowcy, "na podstawie trasy iD:", idTrasy);
	}


	// ladunki specjalne 12, 13, 14
	if(trasa[0].ladunekADR)	await sqlOsiagniecia(idKierowcy, 12, 1); //ADR
	if(trasa[0].ladunekGabaryt) await sqlOsiagniecia(idKierowcy, 13, 1); //gabaryt
	if(trasa[0].ladunekDelikatny) await sqlOsiagniecia(idKierowcy, 14, 1); //delikatny
	
	// polityk id 15 (niegotowe ze wzgledu na brak funkcjonowania trackingu zlecen + mandatow na podstawie telemetrii)
	
	// dostawca id 26 - 86 ets, 118 - 138 ats
	try {
		const [idOsiagnieciaDostawca] = await db.execute("SELECT id FROM typyOsiagniec WHERE nazwa = CONCAT('Dostawca ', (SELECT kraj FROM miejscowosci WHERE id = ?))", [trasa[0].do]);
		if(idOsiagnieciaDostawca.length) await sqlOsiagniecia(idKierowcy, idOsiagnieciaDostawca[0].id, 1);
	} catch(er) {
		console.log(er);
		console.log("Wystapil blad aktualizacji osiagniecia DOSTAWCA dla kierowcy ", idKierowcy, " na podstawie trasy iD: ", idTrasy);
	}

	if(trasa[0].gra === 0){
		// ets id 1
		await sqlOsiagniecia(idKierowcy, 1, 1);
	} else {
		// ats id 2 osiagniecie 
		await sqlOsiagniecia(idKierowcy, 2, 1);
	}


	// powiazania typ naczep
	powiazaniaNaczep.forEach(async naczepaOsiagniecie => {
		if(naczepaOsiagniecie.akceptowaneIdNaczep.includes(trasa[0].naczepa)){
			await sqlOsiagniecia(idKierowcy, naczepaOsiagniecie.idOsiag, 1);
		}
	});

	return;
};

app.post("/rozpatrzenieTrasy/:token/:idtrasy", async (req, res) => {
	//dc zrobione
	const idtrasy = req.params.idtrasy;
	const token = req.params.token;
	const k = new Date();
    k.setHours(k.getHours() + 2);
    const dzis = k.toISOString().slice(0, 19).replace("T", " ");
	if(req.body.zatwierdz != 2){
		//zatwierdzanie
		const [r] = await db.execute("UPDATE `trasy` SET `premia` = ?, `zatwierdz` = 1, `kara` = ?, `powododrzuc` = '', `wlasnyzarobek` = (SELECT `stawka` FROM `konta` WHERE `id` = ?)*? WHERE `id` = ?", [ req.body.nadawanaPremia ? req.body.nadawanaPremia : 0, req.body.grzywna ? req.body.grzywna : 0, req.body.kto, req.body.przejechane, idtrasy]);
		if(r.affectedRows > 0){
			await db.execute("INSERT INTO `dysphistoria` (`kto`, `trasa`, `kiedy`, `akcja`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, 1)", [token, idtrasy, dzis]);
			let dyspozytor;
			let kierowca;
			let wlasnyzarobek;
			let dckierowcy;
			const [rkf] = await db.execute("SELECT * FROM `kontofirmowe` WHERE `opis` = ?", [`Trasa ${idtrasy}`]);
			if(rkf.length > 0){
				rkf.forEach(async xx => {
					await db.execute("DELETE FROM `kontofirmowe` WHERE `id` = ?", [xx['id']]);
				});
			}
			await db.execute("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?-(SELECT `wlasnyzarobek` FROM `trasy` WHERE `id` = ?), ?)", [req.body.dlaFirmy, idtrasy, `Trasa ${idtrasy}`]);
			const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [token]);
			dyspozytor = rd[0].l;
			const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `trasy` WHERE `id` = ?)", [idtrasy]);
			kierowca = rk[0].l;
			dckierowcy = rk[0].d;
			const [rt] = await db.execute("SELECT `wlasnyzarobek` as 'w' FROM `trasy` WHERE `id` = ?", [idtrasy]);
			wlasnyzarobek = rt[0].w;
			let zarobekfirmydc = (parseFloat(req.body.dlaFirmy) - parseFloat(wlasnyzarobek)).toFixed(2);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zaakceptowanie trasy")
				.setDescription(`Użytkownik [${dyspozytor}](https://system.thebossspedition.pl/profil/${dyspozytor}) zaakceptował [trasę ${idtrasy}](https://system.thebossspedition.pl/dyspozytornia/${idtrasy}) użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`).setColor(0x1FFF35)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Premia", value: `${req.body.nadawanaPremia ? req.body.nadawanaPremia : 0} zł`, inline: true})
				.addFields({name: "Kara", value: `${req.body.grzywna ? req.body.grzywna : 0} zł`, inline: true})
				.addFields({name: 'Zarobek za km', value: `${wlasnyzarobek} zł`, inline: true})
				.addFields({name: 'Zarobek kierowcy', value: `${(parseFloat(wlasnyzarobek) + (req.body.nadawanaPremia ? parseFloat(req.body.nadawanaPremia) : 0) - (req.body.grzywna ? parseFloat(req.body.grzywna) : 0)).toFixed(2)} zł`})
				.addFields({name: 'Zarobek firmy', value: `${(zarobekfirmydc > 0) ? "+"+zarobekfirmydc+" zł" : zarobekfirmydc+" zł"}`});
			await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
			embed1.setDescription(`Użytkownik [${dyspozytor}](https://system.thebossspedition.pl/profil/${dyspozytor}) zaakceptował twoją trasę o ID ${idtrasy}.`);
			await dcbot.users.send(dckierowcy, {embeds: [embed1]}).catch(async (er) => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dckierowcy}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
			console.log(`[${new Date().toLocaleString('pl')}] ${token} zatwierdził trasę ${idtrasy}, Kara: ${req.body.grzywna}, Premia: ${req.body.nadawanaPremia}`);
			res.send({odp: 'OK'});
			zaktualizujOsiagniecia(req.body.kto, idtrasy);
		} else {
			res.send({blad: "Nie zatwierdzono"});
		}
	} else {
		//odrzucanie
		const [r] = await db.execute("UPDATE `trasy` SET `zatwierdz` = 2, `powododrzuc` = ?, `dozwolpoprawke` = ? WHERE `id` = ?", [req.body.powod, req.body.dozwolpoprawe, idtrasy]);
		if(r.affectedRows > 0){
			const [rkf] = await db.execute("SELECT * FROM `kontofirmowe` WHERE `opis` = ?", [`Trasa ${idtrasy}`]);
			if(rkf.length > 0){
				rkf.forEach(async xx => {
					await db.execute("DELETE FROM `kontofirmowe` WHERE `id` = ?", xx['id']);
				});
			}
			await db.execute("INSERT INTO `dysphistoria` (`kto`, `trasa`, `kiedy`, `akcja`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, 0)", [token, idtrasy, dzis]);
			console.log(`[${new Date().toLocaleString('pl')}] ${token} odrzucił trasę ${idtrasy} z powodem:\n ${req.body.powod}`);
			res.send({odp: 'OK'});
			let dyspozytor;
			let kierowca;
			let dckierowcy;
			const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [token]);
			dyspozytor = rd[0].l;
			const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `trasy` WHERE `id` = ?)", [idtrasy]);
			kierowca = rk[0].l;
			dckierowcy = rk[0].d;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Odrzucenie trasy")
				.setDescription(`Użytkownik [${dyspozytor}](https://system.thebossspedition.pl/profil/${dyspozytor}) odrzucił [trasę ${idtrasy}](https://system.thebossspedition.pl/dyspozytornia/${idtrasy}) użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`)
				.setColor((req.body.dozwolpoprawe == 1) ? 0xF37F03 : 0xF30303)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Możliwość poprawy", value: `${(req.body.dozwolpoprawe == 1) ? "Tak" : "Nie"}`})
				.addFields({name: 'Powód', value: `${req.body.powod ? req.body.powod : "Nie podano."}`})
			await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
			embed1.setDescription(`Użytkownik [${dyspozytor}](https://system.thebossspedition.pl/profil/${dyspozytor}) odrzucił twoją trasę o ID ${idtrasy}.`);
			await dcbot.users.send(dckierowcy, {embeds: [embed1]}).catch(async (er) => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dckierowcy}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		} else {
			res.send({blad: 'Nie odrzucono'});
		}
	}
});

app.get("/dostepATS/:login", async (req, res) => {
	if(!req.params.login) {
		res.send({response: true, blad: "Niepoprawny profil"});
		return;
	}
	const [r] = await db.execute("SELECT dostepATS FROM `konta` WHERE `login` = ?", [req.params.login]);
	if(r.length > 0){
		res.send({dostep: r[0].dostepATS === 1 ? true : false});
		return;
	} else {
		res.send({blad: "Nieznaleziono profilu o takim loginie."});
		return;
	};
});

app.post("/kartaPaliwowaDane/:login", async (req, res) => {
	//dc niepotrzebne
	if(!req.params.login) {
		res.send({response: true, blad: "Niepoprawny profil"});
		return;
	}
	//spalanie i wydatki
	try {
		const [r] = await db.execute("SELECT SUM(`paliwo`) as 'wydatki', SUM(`przejechane`) as 'przejechane', SUM(`spalanie`) as 'spalanie', COUNT(*) as 'trasy' FROM `trasy` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) AND `zatwierdz` = 1", [req.params.login]);
		if(r.length > 0){
			const wydane = r[0].wydatki;
			const spalanie = (r[0].spalanie*100/r[0].przejechane).toFixed(1);
			const przejechane = r[0].przejechane;
			const trasy = r[0].trasy;
			res.send({response: true, wydane: wydane, spalanie: spalanie, punkty: 0, przejechane: przejechane, trasy: trasy});
		} else {
			res.send({response: true, wydane: 0, spalanie: null, punkty: 0, przejechane: 0, trasy: 0});
		}
	} catch(er){
		console.log(er);
		res.send({response: true, blad: "Błąd sql"});
	}
});

app.post("/kartaPaliwowa/:login", async (req, res) => {
	if(!req.params.login){
		res.send({response: true, blad: "Niepoprawny profil"});
		return;
	}
	try {
		const [r] = await db.execute("SELECT SUM(`kwota`) as 'k', SUM(`litry`) as 'l' FROM `telemetriaPaliwo` WHERE `kierowca_id` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [req.params.login]);
		const wydane = r[0].k || 0;
		const punkty = r[0].l ? parseInt(r[0].l * 0.01) : 0;
		res.send({response: true, wydane: wydane, punkty: punkty});
		return;
	} catch(er){
		console.log(er);
		res.send({response: true, blad: "Błąd SQL"});
		return;
	}
});

app.post("/miastaOld", async (req, res) => {
	//dc niepotrzebne
	// dyspozytornia z tego korzysta, nie usuwac
	const [result] = await db.query("SELECT `id`, `miasto`, `kraj`,`gra` FROM `miejscowosci` ORDER BY `kraj`, `miasto` ASC");
	if(result.length > 0){
		let tmp = [];
		result.forEach((wiersz) => {
			tmp[wiersz.id] = [wiersz.kraj, wiersz.miasto, wiersz.gra, wiersz.id];
		});
		res.send({dane: tmp});
	} else {
		res.send({blad: 'ERROR'});
	}
});

app.post("/miasta", async (req, res) => {
	//dc niepotrzebne
	const [result] = await db.query("SELECT `id`, `miasto`, `kraj`,`gra` FROM `miejscowosci` ORDER BY `kraj`, `miasto` ASC");
	if(result.length > 0){
		let tmp = [];
		result.forEach((wiersz) => {
			tmp.push({kraj: wiersz.kraj, miasto: wiersz.miasto, gra: wiersz.gra, id: wiersz.id});
		});
		res.send({dane: tmp});
	} else {
		res.send({blad: 'ERROR'});
	}
});

app.post("/dodajMiasto/:login/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.token || !req.params.login) return;
	try {
		const [r] = await db.execute("INSERT INTO `miejscowosci` (`kraj`, `miasto`, `gra`) VALUES (?, ?, ?)", [req.body.kraj, req.body.miasto, ((req.body.gra == 1) ? 1 : 0)]);
		if(r.affectedRows > 0){
			console.log(dataLog(), req.params.login, "dodał nową miejscowość:", (req.body.gra == 1) ? "[ATS]" : "[ETS2]", req.body.kraj, "-", req.body.miasto);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowa miejscowość")
				.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) dodał do systemu nową miejscowość.`)
				.setColor(0x01F1AD)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Gra", value: `${(req.body.gra == 1) ? "ATS" : "ETS2"}`, inline: true})
				.addFields({name: `${(req.body.gra == 1) ? "Region" : "Kraj"}`, value: `${req.body.kraj}`, inline: true})
				.addFields({name: 'Miejscowość', value: `${req.body.miasto}`, inline: true});
			await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
			res.send({odp: 'OK'});
		}
	} catch(er) {
		console.log(er);
		res.send({blad: "Blad SQL"});
		return;
	}
});

app.post("/usunMiasto/:login/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.token || !req.params.login) return;
	try {
		const [r] = await db.execute("DELETE FROM `miejscowosci` WHERE `id` = ?", [req.body.id]);
		if(r.affectedRows > 0){
			console.log(dataLog(), req.params.login, "usunął miejscowość:", (req.body.gra == 1) ? "[ATS]" : "[ETS2]", req.body.kraj, "-", req.body.miasto);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Usunięta miejscowość")
				.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) usunął z systemu miejscowość.`)
				.setColor(0x7200D5)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Gra", value: `${(req.body.gra == 1) ? "ATS" : "ETS2"}`, inline: true})
				.addFields({name: `${(req.body.gra == 1) ? "Region" : "Kraj"}`, value: `${req.body.kraj}`, inline: true})
				.addFields({name: 'Miejscowość', value: `${req.body.miasto}`, inline: true});
			await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
			res.send({odp: 'OK'});
		}
	} catch(er) {
		console.log(er);
		res.send({blad: "Blad SQL"});
		return;
	}
});

app.post("/typyNaczep", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `typyuprawnien` WHERE `id` != 35");
	if(r.length > 0){
		let tmp = [];
		r.forEach((wiersz) => {
			tmp.push({...wiersz});
		});
		res.send({dane: tmp});
	} else {
		res.send({blad: true});
	}
});

app.post("/promy", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `prompociag`");
	if(r.length > 0){
		let tmp = [];
		r.forEach((wiersz => {
			tmp.push({...wiersz});
		}));
		res.send({dane: tmp});
	} else {
		res.send({dane: null});
	}
});

app.post("/promyTrasy/:idtrasy", async (req, res) => {
	//dc niepotrzebne
	const idtrasy = req.params.idtrasy;
	const [r] = await db.execute("SELECT * FROM `trasyprompociag` WHERE `idtrasa` = ?", [idtrasy]);
	if(r.length > 0){
		let tmp = [];
		r.forEach((wiersz => {
			tmp.push(wiersz.idprompociag);
		}));
		res.send({dane: {promy: tmp, ile: r.length}});
	} else {
		res.send({dane: {promy: null, ile: 0}});
	}
});

app.post("/poprawTrase/:id/:token", upload.any('noweZdj'), async (req, res) => {
	//dc zrobione
	const token = req.params.token;
	const idtrasy = req.params.id;
	console.log("["+new Date().toLocaleString('pl')+"]","Poprawka trasy o ID:", idtrasy);
	let fotki = req.body.stareZdj;
	let zlaczFinalne = fotki.split(" ");

	if(req.files.length){
		req.files.map((noweZdj) => {
			fotki = fotki + " /img/trasy/" + noweZdj.filename;
			zlaczFinalne.push("/img/trasy/"+noweZdj.filename);
		});
	}
	await db.execute("UPDATE `trasy` SET `zdj` = ? WHERE `id` = ?", [zlaczFinalne.join(" "), idtrasy]);
	try {
		const [result] = await db.execute("UPDATE `trasy` SET `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?), `kiedy` = ?, `przejechane` = ?, `komentarz` = ?, `od` = ?, `do` = ?, `ladunek` = ?, `masaladunku` = ?, `naczepa` = ?, `paliwo` = ?, `zatwierdz` = 0, `uszkodzenia` = ?, `spalanie` = ?, `typserwera` = ?, `typzlecenia` = ?, `vmax` = ?, `zarobek` = ?, `dozwolpoprawke` = 0, `ladunekADR` = ?, `ladunekDelikatny` = ?, `ladunekGabaryt` = ?, `ladunekTandem` = ? WHERE `id` = ?", [token, new Date(req.body.kiedy), req.body.przejechane, req.body.komentarz, req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, req.body.ladunekADR, req.body.ladunekDelikatny, req.body.ladunekGabaryt, (req.body.ladunekTandem == 1) ? 1 : 0, idtrasy]);
		if(result.affectedRows > 0){
			res.send({odp: 'Gites majonez'});
			const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `token` = ?", [token]);
			let kierowca = rk[0].l;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Poprawienie trasy")
				.setDescription(`Użytkownik [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) wprowadził poprawki do [trasy ${idtrasy}](https://system.thebossspedition.pl/dyspozytornia/${idtrasy})`)
				.setColor(0x01F1AD)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
		} else {
			res.send({blad: "Wystąpił nieznany błąd"});
		}
	} catch(er) {
		console.log(er);
	}
});

app.post("/oddajTrase/:token", upload.any('noweZdj'), async (req, res) => {
	//dc zrobione
	const token = req.params.token;
	console.log(req.files);
	if(req.files.length){
		console.log("["+new Date().toLocaleString('pl')+"]","Nowa trasa ze zdjeciami");
		let fotki = [];
		req.files.map((noweZdj) => {
			fotki.push("/img/trasy/" + noweZdj.filename);
		});
		try {
			console.log(req.body);
			const [result] = await db.execute("INSERT INTO `trasy` (`wlasnyzarobek`, `kara`, `gra`, `kto`, `kiedy`, `przejechane`, `komentarz`, `od`, `do`, `ladunek`, `masaladunku`, `naczepa`,  `paliwo`,  `powododrzuc`,  `zatwierdz`,  `uszkodzenia`,  `spalanie`,  `typserwera`,  `typzlecenia`,  `vmax`,  `zarobek`,  `dozwolpoprawke`,  `zdj`,  `ladunekADR`,  `ladunekDelikatny`,  `ladunekGabaryt`, `ladunekTandem`) VALUES (0,0,?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  '',  0,  ?,  ?,  ?,  ?,  ?,  ?, 0, ?, ?, ?, ?, ?)", [req.body.gra, token, new Date(req.body.kiedy), req.body.przejechane, req.body.komentarz ?? "", req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, fotki.join(" ") ,(req.body.ladunekADR == 1) ? 1 : 0, (req.body.ladunekDelikatny == 1) ? 1 : 0, (req.body.ladunekGabaryt == 1) ? 1 : 0, (req.body.ladunekTandem == 1) ? 1 : 0]);
			if(result.affectedRows > 0){
				res.send({odp: result.insertId});
				const [rs] = await db.execute("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.od]);
				const [rdo] = await db.execute("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.do]);
				const [rk] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
				let kierowca = rk[0].l;
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowa trasa")
					.setDescription(`[${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) oddał nową [trasę ${result.insertId}](https://system.thebossspedition.pl/dyspozytornia/${result.insertId}).`).setColor(0x01F1AD)
					.addFields({name: "Ładunek:", value: req.body.ladunek})
					.addFields({name: "Rozpoczęcie w:", value: `${rs[0].k}, ${rs[0].m}`})
					.addFields({name: "Zakończenie w:", value: `${rdo[0].k}, ${rdo[0].m}`})
					.addFields({name: "Uszkodzenia:", value: `${req.body.uszkodzenia}%`})
					.addFields({name: '\u200B', value: "Więcej szczegółów w dyspozytorni."})
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
				await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
			} else {
				res.send({blad: "Niedodano..."});
			}
		} catch(er){
			console.log(er);
		}
	} else {
		console.log("["+new Date().toLocaleString('pl')+"]", "Nowa trasa bez zdjec");
		const [result] = await db.execute("INSERT INTO `trasy` (`wlasnyzarobek`, `kara`, `gra`, `kto`, `kiedy`, `przejechane`, `komentarz`, `od`, `do`, `ladunek`, `masaladunku`, `naczepa`, `paliwo`, `powododrzuc`, `zatwierdz`, `uszkodzenia`, `spalanie`, `typserwera`, `typzlecenia`, `vmax`, `zarobek`, `dozwolpoprawke`, `zdj`, `ladunekADR`, `ladunekDelikatny`, `ladunekGabaryt`, `ladunekTandem`) VALUES (0,0, ?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 0, ?, ?, ?, ?, ?, ?, 0, '', ?, ?, ?, ?)", [req.body.gra, token, new Date(req.body.kiedy), req.body.przejechane, req.body.komentarz ?? "", req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, (req.body.ladunekADR == 1) ? 1 : 0, (req.body.ladunekDelikatny == 1) ? 1 : 0, (req.body.ladunekGabaryt == 1) ? 1 : 0, (req.body.ladunekTandem == 1) ? 1 : 0]);
		if(result.affectedRows > 0){
			res.send({odp: result.insertId});
			const [rs] = await db.execute("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.od]);
			const [rdo] = await db.execute("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.do]);
			const [rk] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
			let kierowca = rk[0].l;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowa trasa")
				.setDescription(`[${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) oddał nową [trasę ${result.insertId}](https://system.thebossspedition.pl/dyspozytornia/${result.insertId}).`).setColor(0x01F1AD)
				.addFields({name: "Ładunek:", value: req.body.ladunek})
				.addFields({name: "Rozpoczęcie w:", value: `${rs[0].k}, ${rs[0].m}`})
				.addFields({name: "Zakończenie w:", value: `${rdo[0].k}, ${rdo[0].m}`})
				.addFields({name: "Uszkodzenia:", value: `${req.body.uszkodzenia}%`})
				.addFields({name: '\u200B', value: "Więcej szczegółów w dyspozytorni."})
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
		} else {
			res.send({blad: "Niedodano..."});
		}
	}
});

app.post("/updateTrasaPromy/:id", async (req, res) => {
	//dc niepotrzebne?
	const idtrasy = req.params.id;
	try {
		const [r] = await db.execute("DELETE FROM `trasyprompociag` WHERE `idtrasa` = ?", [idtrasy]);
		if(r.affectedRows > 0){
			console.log("Usunieto", r.affectedRows, "promow dla trasy", idtrasy);
		}
		if(req.body.promy){
			let przygotujSql = [];
			try {
				req.body.promy.map(async (ajdi) => {
					przygotujSql.push([parseInt(idtrasy), parseInt(ajdi)]);
					await db.execute("INSERT INTO `trasyprompociag` (`idtrasa`,`idprompociag`) VALUES (?, ?)", [idtrasy, ajdi]);
					console.log("["+new Date().toLocaleString('pl')+"]","Dodano prom", ajdi, "dla trasy", idtrasy);
				})
				res.send({odp: "GIT"});
			} catch(er2) {
				console.log(er2);
				res.send({odp: "Wystąpił błąd bazy #2"});
			}
		} else {
			res.send({odp: "GIT"});		
		}
	} catch(er) {
		console.log(er);
		res.send({blad: "Wystąpił błąd bazy"});
	}
});

app.post("/dodajProm/:login/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token || !req.body.dodawane) return;
	try {
		const [r] = await db.query("INSERT INTO `prompociag` (`nazwa`, `kategoria`) VALUES ?", [req.body.dodawane]);
		if(r.affectedRows > 0){
			console.log(dataLog(), req.params.login, "dodał nowy prom", req.body.dodawane);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowy prom/pociąg")
				.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) dodał do systemu ${req.body.dodawane.length > 1 ? "nowe promy/pociągi" : "nowy prom/pociąg"}.`)
				.setColor(0x01F1AD).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			req.body.dodawane.map((promik) => {
				embed1.addFields({name: "Dodano", value: promik[0].replace(" - ", " ➡ ")});
			})
			await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
			res.send({odp: "ok"});
		}
	} catch(er) {
		console.log(er);
		res.send({blad: "Blad SQL"});
		return;
	}
});

app.post("/usunProm/:login/:token", async (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token || !req.body.ktore) return;
	try {
		const [r] = await db.execute("DELETE FROM `prompociag` WHERE `id` = ?", [req.body.ktore]);
		if(r.affectedRows > 0){
			console.log(dataLog(), req.params.login, "usunął prom ID", req.body.ktore, req.body.nazwa);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Usunięty prom/pociąg")
				.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) usunął z systemu prom/pociąg.`)
				.setColor(0x7200D5).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Usuwany", value: `${req.body.nazwa.replace(" - ", " ➡ ")}`});
			await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
			res.send({odp: 'ok'});
		}
	} catch(er){
		console.log(er);
		res.send({blad: "Blad sql"});
		return;
	}
});

app.post("/trasaDane/:trasaID", async (req, res) => {
	//dc niepotrzebne
	const trasaID = req.params.trasaID;
	const [result] = await db.execute("SELECT * FROM `trasy` WHERE `id` = ?", [trasaID]);
	if(result.length > 0){
		res.send({dane: result[0]});
	} else {
		res.send({blad: "Brak danych"});
	}
});

app.get("/noweDyspozytornia/:token/:trasaID", async (req, res) => {
	if(!req.params.token){
		res.send({blad: "Nieautoryzowany dostęp."});
		return;
	}
	if(!req.params.trasaID){
		res.send({blad: "Brakujący parametr: trasaID"});
		return;
	}
	const [ dyspozytor ] = await db.execute("SELECT login FROM konta WHERE typkonta <= 4 AND token = ?", [req.params.token]);
	if(!dyspozytor.length){
		res.send({blad: "Nieuprawniony."});
		return;
	}
	const [ daneTrasy ] = await db.execute("SELECT trasy.*, skad.kraj as 'skadKraj', skad.miasto as 'skadMiasto', dokad.kraj as 'dokadKraj', dokad.miasto as 'dokadMiasto' FROM trasy LEFT JOIN miejscowosci skad ON trasy.od = skad.id LEFT JOIN miejscowosci dokad ON trasy.do = dokad.id WHERE trasy.id = ?;", [req.params.trasaID]);
	if(!daneTrasy.length){
		res.send({blad: "Brak trasy o podanym identyfikatorze."});
		return;
	}
	let resObj = {
		...daneTrasy[0],
		kierowca: {
			id: daneTrasy[0].kto
		}
	};
	// resObj.daneTrasy.kiedy = new Date(resObj.daneTrasy.kiedy).toISOString();
	const [ daneKierowcy ] = await db.execute("SELECT login, awatar, stawka, rangi FROM konta WHERE id = ?", [daneTrasy[0].kto]);
	if(daneKierowcy.length){
		resObj.kierowca.login = daneKierowcy[0].login;
		resObj.kierowca.awatar = daneKierowcy[0].awatar;
		resObj.kierowca.stawka = daneKierowcy[0].stawka;
		resObj.kierowca.stanowisko = daneKierowcy[0].rangi;
	}
	const [ sprawdzPromy ] = await db.execute("SELECT a.idprompociag as 'id', b.nazwa FROM trasyprompociag a LEFT JOIN prompociag b ON a.idprompociag = b.id WHERE a.idtrasa = ?", [req.params.trasaID]);
	if(sprawdzPromy.length){
		resObj.promy = sprawdzPromy;
	} else {
		resObj.promy = [];
	}
	const [ uprawnienie] = await db.execute("SELECT b.naczepa, a.nazwa, CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as 'wazne' FROM (SELECT naczepa, kto, kiedy FROM trasy WHERE id = ?) b LEFT JOIN typyuprawnien a ON b.naczepa = a.id LEFT JOIN uprawnienia c ON b.naczepa = c.naco AND b.kto = c.kto AND c.odkiedy < b.kiedy AND c.dokiedy > b.kiedy ORDER BY c.id DESC LIMIT 1;", [req.params.trasaID]);
	resObj.uprawnienie = { id: uprawnienie[0].naczepa, nazwa: uprawnienie[0].nazwa ?? "Usunięte uprawnienie", wazne: uprawnienie[0].wazne == 1 ? true : false };
	const [ waznoscUprawnienia ] = await db.execute("SELECT dokiedy FROM `uprawnienia` WHERE kto = ? AND naco = ? AND odkiedy < ? ORDER BY dokiedy DESC LIMIT 1;", [resObj.kierowca.id, resObj.uprawnienie.id, resObj.kiedy]);
	resObj.uprawnienie.wygasa = waznoscUprawnienia.length ? waznoscUprawnienia[0].dokiedy : undefined;

	res.send(resObj);
})

app.post("/dyspHistoria/", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `dysphistoria` ORDER BY `id` DESC LIMIT 800");
	if(r.length > 0){
		let tmp = [];
		r.map((wiersz) => {
			tmp.push({...wiersz});
		});
		res.send({dane: tmp});
	} else {
		res.send({dane: null});
	}
});

app.post("/uprHistoria", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `uprawnienia` ORDER BY `id` DESC LIMIT 20");
	if(r.length > 0){
		let tmp = [];
		r.map((wiersz) => {
			tmp.push({...wiersz});
		});
		res.send({dane: tmp});
	} else {
		res.send({dane: null});
	}
});

app.post("/uprHistoriaFirmowe", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `kontofirmowe` WHERE `opis` LIKE 'Uprawnienie%' ORDER BY `id` DESC LIMIT 10");
	if(r.length > 0){
		let tmp = [];
		r.map((wiersz) => {
			tmp.push({...wiersz});
		});
		res.send({dane: tmp});
	} else {
		res.send({dane: null});
	}
});

app.post("/nadajUpr/:token", async (req, res) => {
	const idkomu = req.body.komu;
	const uprawnienia = req.body.uprawnienia;
	const k = new Date();
	k.setHours(k.getHours() + 2);
	const odKiedy = k.toISOString().slice(0, 19).replace("T", " ");
	const [r] = await db.execute("SELECT `id` as 'i', `login` as 'l', `discord` as 'dc' FROM `konta` WHERE `token` = ? AND `typkonta` <= 3", [req.params.token]);
	if(r.length > 0){
		const sqlFormat = [uprawnienia.map((x) => [r[0].i, idkomu, x.upr, x.gra, (req.body.pokrywajacy == 1) ? 0 : x.koszt, odKiedy, x.waznosc, (req.body.pokrywajacy == 1) ? x.koszt : 0])];
		const pokrywajacySql = [uprawnienia.map((x) => [-1*parseFloat(x.koszt), `${parseInt(x.typ) == 1  ? "Licencja" : "Szkolenie"} [${x.gra ? "ATS" : "ETS2"}] ${x.nazwa} dla użytkownika ${req.body.komuLogin}.`])];
		try {
			const [r2] = await db.query("INSERT INTO `uprawnienia` (`instruktor`, `kto`, `naco`, `gra`, `cena`, `odkiedy`, `dokiedy`, `cenaFirmy`) VALUES ?", sqlFormat);
			if(r2.affectedRows > 0){
				console.log("Nadano uprawnienia");
				if(req.body.pokrywajacy == 1){
					try {
						const [r3] = await db.query("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES ?", pokrywajacySql);
						if(r3.affectedRows > 0){
							console.log("Pomyślnie obciążono konto firmowe.");
							res.send({odp: "Nadano uprawnienia i obciążono konto firmowe"});
							const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nadane uprawnienia")
									.setDescription(`Użytkownik [${r[0].l}](https://system.thebossspedition.pl/profil/${r[0].l}) nadał użytkownikowi [${req.body.komuLogin}](https://system.thebossspedition.pl/profil/${req.body.komuLogin}) następujące uprawnienia:`).setColor(0x01F1AD).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
							uprawnienia.map(x => embed1.addFields({
								name: `(${parseInt(x.typ) == 0  ? "Szkolenie" : "Licencja"} ${x.gra ? "ATS" : "ETS2"}) ${x.nazwa}`,
								value: `Ważność: ${new Date(x.waznosc).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} | Koszt: ${parseFloat(x.koszt).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}`
							}));
							embed1.addFields({name: "Pokrywający koszta:", value: `${req.body.pokrywajacy == 1 ? "Firma" : "Kierowca"}`});
							await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
							// powiadomienia DC priv - pokrywajacy kierowca
							if(req.body.komuDc){
								embed1.setDescription(`Użytkownik [${r[0].l}](https://system.thebossspedition.pl/profil/${r[0].l}) nadał Tobie następujące uprawnienia:`);
								await dcbot.users.send(req.body.komuDc, {embeds: [embed1]}).catch(async () => {
									try {
										await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.komuDc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
									} catch(erdc){
										console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
									}
								});
							}
							return;
						}
					} catch(er3) {
						console.log("Błąd SQL nałożenia kosztów na konto firmowe.");
						res.send({blad: "Błąd SQL nałożenia kosztów na konto firmowe."});
						return;
					}
				} else {
					res.send({odp:"Nadano"});
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nadane uprawnienia")
						.setDescription(`Użytkownik [${r[0].l}](https://system.thebossspedition.pl/profil/${r[0].l}) nadał użytkownikowi [${req.body.komuLogin}](https://system.thebossspedition.pl/profil/${req.body.komuLogin}) następujące uprawnienia:`).setColor(0x01F1AD).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
					uprawnienia.map(x => embed1.addFields({
						name: `(${parseInt(x.typ) == 0  ? "Szkolenie" : "Licencja"} ${x.gra ? "ATS" : "ETS2"}) ${x.nazwa}`,
						value: `Ważność: ${new Date(x.waznosc).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} | Koszt: ${parseFloat(x.koszt).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}`
					}));
					embed1.addFields({name: "Pokrywający koszta:", value: `${req.body.pokrywajacy == 1 ? "Firma" : "Kierowca"}`});
					await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
						// powiadomienia DC priv - pokrywajacy kierowca
					if(req.body.komuDc){
						embed1.setDescription(`Użytkownik [${r[0].l}](https://system.thebossspedition.pl/profil/${r[0].l}) nadał Tobie następujące uprawnienia:`);
						await dcbot.users.send(req.body.komuDc, {embeds: [embed1]}).catch(async () => {
							try {
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.komuDc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							} catch(erdc){
								console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
							}
						});
					}
					return;
				}
			}
		} catch(er2) {
			console.log(er2);
			res.send({blad: "Błąd SQL nadawania uprawnień"});
			return;
		}
	} else {
		console.log("Nieuprawniony");
		res.send({blad: "Nieuprawniony."});
		return;
	}
});

app.post("/dodajUpr/:token", async (req, res) => {
	//dc zrobione
	const idtypa = req.body.kto;
	const idupr = req.body.naco;
	const dokiedy = req.body.dokiedy;
	const cena = req.body.cena;
	const pokrywajacy = req.body.pokrywajacy;
	const k = new Date();
	const gra = req.body.gra;
    k.setHours(k.getHours() + 2);
    const odkiedy = k.toISOString().slice(0, 19).replace("T", " ");
	try {
		const [r] = await db.execute("INSERT INTO `uprawnienia` (`kto`, `naco`, `dokiedy`, `cena`, `odkiedy`, `gra`) VALUES (?, ?, ?, ?, ?, ?)", [idtypa, idupr, dokiedy, (req.body.ktoplaci == 1) ? 0 : cena, odkiedy, gra]);
		if(r.affectedRows > 0){
			if(req.body.ktoplaci == 1){
				await db.execute("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?, ?)", [-1*req.body.cena, `Uprawnienie ${r.insertId}`]);
			}
			console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} nadał uprawnienie ID: ${idupr} Kierowcy o ID ${idtypa} za kwotę ${cena} do ${dokiedy}`);
			const [ru] = await db.execute("SELECT `nazwa` as 'n', `rodzaj` as 'r' FROM `typyuprawnien` WHERE `id` = ?", [idupr]);
			let nazwaUpr = ru[0].n;
			let typUpr = ru[0].r;
			const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
			let dysp = rd[0].l;
			const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [idtypa]);
			let kierowca = rk[0].l;
			let kierowcadc = rk[0].d;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nadane uprawnienie")
				.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) nadał użytkownikowi [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) uprawnienie.`)
				.setColor(0x01F1AD).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Koszt:", value: `${parseFloat(cena).toFixed(2)} zł`, inline: true})
				.addFields({name: "Pokrywający:", value: `${req.body.ktoplaci ? "Firma" : "Kierowca"}`, inline: true})
				.addFields({name: "Gra:", value: `${(gra == 1) ? "ATS": "ETS2"}`})
				.addFields({name: "Uprawnienie:", value: `${nazwaUpr} (${typUpr})`})
				.addFields({name: "Termin uprawnienia:", value: `${new Date(dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`});
			await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
			if(kierowcadc){
				embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) nadał Tobie uprawnienie.`);
				await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			}
			res.send({odp: "ok"});
		} else {
			res.send({blad: "nie dodano"});
		}
	} catch(er) {
		console.log(er);
	}
});

app.post("/usunUprNowe/:id/:login", async (req, res) => {
	//dc zrobione
	const idupr = req.params.id;
	const [rtu] = await db.execute("SELECT `gra` as 'g', `dokiedy` as 'd', `kto` as 'k', `naco` as 'n', `cena` as 'c', `cenaFirmy` as 'cf' FROM `uprawnienia` WHERE `id` = ?", [idupr]);
	let cena = rtu[0].c;
	let dokiedy = new Date(rtu[0].d).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});
	let gra = (rtu[0].g == 1) ? "ATS" : "ETS2";
	const [ru] = await db.execute("SELECT `nazwa` as 'n', `rodzaj` as 'r' FROM `typyuprawnien` WHERE `id` = ?", [rtu[0].n]);
	let nazwaUpr = ru[0].n;
	let typUpr = ru[0].r;
	let dysp = req.params.login;
	const [r] = await db.execute("DELETE FROM `uprawnienia` WHERE `id` = ?", [idupr]);
	if(r.affectedRows > 0){
		res.send({odp: 'usunieto'});
	} else {
		res.send({blad: 'nieusunieto'});
	}
	if(rtu[0].cf){
		try {
			const [rzwrot] = await db.execute("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?, ?)", [rtu[0].cf, `Zwrot za usuwanie uprawnienie ID: ${idupr}`]);
			if(rzwrot.affectedRows > 0){
				const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [rtu[0].k]);
				let kierowca = rk[0].l;
				let kierowcadc = rk[0].d;
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Usunięte uprawnienie")
					.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) cofnął użytkownikowi [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) nadane uprawnienie.`)
					.setColor(0x01F1AD).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.addFields({name: "Zwrócony koszt:", value: `${parseFloat(rtu[0].cf).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})} dla firmy`, inline: true})
					.addFields({name: "Typ:", value: `${typUpr} ${gra}`})
					.addFields({name: "Uprawnienie:", value: `${nazwaUpr}`})
					.addFields({name: "Termin uprawnienia:", value: `${dokiedy}`});
				await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
				if(kierowcadc){
					embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) cofnął nadane Tobie uprawnienie.`);
					await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
						try {
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						} catch(erdc){
							console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
						}
					});
				}
			}
		} catch(erzwrot){
			console.log("Nie udany zwrot dla konta firmowego, kwota: ", rtu[0].cf);
		}
	} else {
		const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [rtu[0].k]);
		let kierowca = rk[0].l;
		let kierowcadc = rk[0].d;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Usunięte uprawnienie")
			.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) cofnął użytkownikowi [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) nadane uprawnienie.`)
			.setColor(0x01F1AD).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.addFields({name: "Zwrócony koszt:", value: `${parseFloat(cena).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})} dla kierowcy`, inline: true})
			.addFields({name: "Typ:", value: `${typUpr} ${gra}`})
			.addFields({name: "Uprawnienie:", value: `${nazwaUpr}`})
			.addFields({name: "Termin uprawnienia:", value: `${dokiedy}`});
		await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
		if(kierowcadc){
			embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) cofnął nadane Tobie uprawnienie.`);
			await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	}
});

app.post("/usunUpr/:id/:login", async (req, res) => {
	//dc zrobione
	const idupr = req.params.id;
	const [rtu] = await db.execute("SELECT `gra` as 'g', `dokiedy` as 'd', `kto` as 'k', `naco` as 'n', `cena` as 'c' FROM `uprawnienia` WHERE `id` = ?", [idupr]);
	let cena = rtu[0].c;
	let dokiedy = new Date(rtu[0].d).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});
	let gra = (rtu[0].g == 1) ? "ATS" : "ETS2";
	const [ru] = await db.execute("SELECT `nazwa` as 'n', `rodzaj` as 'r' FROM `typyuprawnien` WHERE `id` = ?", [rtu[0].n]);
	let nazwaUpr = ru[0].n;
	let typUpr = ru[0].r;
	let dysp = req.params.login;
	const [r] = await db.execute("DELETE FROM `uprawnienia` WHERE `id` = ?", [idupr]);
	if(r.affectedRows > 0){
		res.send({odp: 'usunieto'});
	} else {
		res.send({blad: 'nieusunieto'});
	}

	let zaplacilaFirma = false;
	let ileZaplacilaFirma = 0;
	const [rkf2] = await db.execute("SELECT * FROM `kontofirmowe` WHERE `opis` = ?", [`Uprawnienie ${idupr}`]);
	if(rkf2.length > 0){
		zaplacilaFirma = true;
		ileZaplacilaFirma = (-1*parseFloat(rkf2[0]['suma'])).toFixed(2);
	}
	await db.execute("DELETE FROM `kontofirmowe` WHERE `opis` = ?", [`Uprawnienie ${idupr}`]);
	const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [rtu[0].k]);
	let kierowca = rk[0].l;
	let kierowcadc = rk[0].d;
	const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Usunięte uprawnienie")
		.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) cofnął użytkownikowi [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) nadane uprawnienie.`)
		.setColor(0x01F1AD).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
		.addFields({name: "Zwrócony koszt:", value: `${zaplacilaFirma ? ileZaplacilaFirma+" zł dla firmy" : parseFloat(cena).toFixed(2)+" zł dla kierowcy"}`, inline: true})
		.addFields({name: "Gra:", value: `${gra}`})
		.addFields({name: "Uprawnienie:", value: `${nazwaUpr} (${typUpr})`})
		.addFields({name: "Termin uprawnienia:", value: `${dokiedy}`});
	await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
	if(kierowcadc){
		embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) cofnął nadane Tobie uprawnienie.`);
		await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
			try {
				await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
			} catch(erdc){
				console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
			}
		});
	}
});

app.post("/uprawnienia", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `typyuprawnien` ORDER BY `nazwa` ASC");
	if(r.length > 0){
		let tmp = [];
		r.map((wiersz) => {
			tmp.push({...wiersz});
		});
		res.send(tmp);
	} else {
		res.send(null);
	}
});

app.post("/listaPodwyzek", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `podwyzka` WHERE `wniosek` IS NULL");
	if(r.length > 0){
		let tmp = [];
		r.map(wiersz => {
			tmp.push({...wiersz});
		});
		res.send(tmp);
	} else {
		res.send(null);
	}
});

app.post("/listaUrlopow", async (req, res) => {
	//dc niepotrzebne
	const [r] = await db.query("SELECT * FROM `urlopy` WHERE `status` IS NULL OR `status` = 0");
	if(r.length > 0){
		let tmp = [];
		r.map(wiersz => {
			tmp.push({...wiersz});
		});
		res.send(tmp);
	} else {
		res.send(null);
	}
});

app.post("/urlopOdrzuc/:token", async (req, res) => {
	//dc zrobione
	const [r] = await db.execute("UPDATE `urlopy` SET `status` = 1, `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?", [req.params.token, req.body.idwniosku]);
	if(r.affectedRows > 0){
		res.send({odp: 'OK'});
		console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, "odrzucil wniosek o Urlop, ID urlopu:", req.body.idwniosku);
		const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
		const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `urlopy` WHERE `id` = ?)", [req.body.idwniosku]);
		let kierowca = rk[0].l;
		let kierowcadc = rk[0].d;
		let dysp = rd[0].l;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Odrzucony urlop")
			.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) odrzucił wniosek o urlop użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`)
			.setColor(0xAF0000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await dcbot.channels.cache.get(process.env.CHANNEL_URLOPY).send({embeds: [embed1]});
		if(kierowcadc){
			embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) odrzucił Twój wniosek o urlop.`);
			await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	} else {
		res.send({blad: 'Nie odrzucono'});
	}
});

app.post("/urlopAkcept/:token", async (req, res) => {
	//dc zrobione
	const [r] = await db.execute("UPDATE `urlopy` SET `status` = 2, `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?", [req.params.token, req.body.idwniosku]);
	if(r.affectedRows > 0){
		res.send({odp: 'OK'});
		console.log(`[${new Date().toLocaleString('pl')}] `,req.params.token, "zaakceptowal wniosek o Urlop, ID urlopu:", req.body.idwniosku);
		const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
		const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `urlopy` WHERE `id` = ?)", [req.body.idwniosku]);
		let kierowca = rk[0].l;
		let kierowcadc = rk[0].d;
		let dysp = rd[0].l;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zaakceptowany urlop")
			.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zaakceptował wniosek o urlop użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`)
			.setColor(0x00AF20).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await dcbot.channels.cache.get(process.env.CHANNEL_URLOPY).send({embeds: [embed1]});
		if(kierowcadc){
			embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zaakceptował Twój wniosek o urlop. Miłego wypoczynku!`);
			await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	} else {
		res.send({blad: 'Nie odrzucono'});
	}
});

//wnioski/podwyzka odrzuc akceptuj
app.post("/podwyzkaOdrzuc/:token", async (req, res) => {
	//dc zrobione
	const powod = req.body.powod ? req.body.powod : "Nie podano powodu odrzucenia.";
	const [r] = await db.execute("UPDATE `podwyzka` SET `wniosek` = 0, `wniosektxt` = ?, `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?", [powod, req.params.token, req.body.idwniosku]);
	if(r.affectedRows > 0){
		res.send({odp: 'OK'});
		console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, "odrzucil wniosek o ID:", req.body.idwniosku);
		const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
		const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `ktozlozyl` FROM `podwyzka` WHERE `id` = ?)", [req.body.idwniosku]);
		let kierowca = rk[0].l;
		let kierowcadc = rk[0].d;
		let dysp = rd[0].l;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Odrzucona podwyżka")
			.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) odrzucił wniosek o podwyżkę użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`)
			.setColor(0xAF0000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.addFields({name: "Powód:", value: powod});
		await dcbot.channels.cache.get(process.env.CHANNEL_PODWYZKI).send({embeds: [embed1]});
		if(kierowcadc){
			embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) odrzucił Twój wniosek o podwyżkę.`);
			await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	} else {
		res.send({blad: 'Nie odrzucono'});
	}
});

app.post("/podwyzkaAkcept/:token", async (req, res) => {
	//dc zrobione
	console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, " zaakceptowal wniosek o ID: ", req.body.idwniosku);
	const [r] = await db.execute("UPDATE `podwyzka` SET `wniosek` = 1, `wniosektxt` = 'Zaakceptowano', `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?", [req.params.token, req.body.idwniosku]);
	if(r.affectedRows > 0){
		const [r2] = await db.execute("UPDATE `konta` SET `stawka` = ?, `rangi` = ? WHERE `id` = ?", [req.body.stawka, req.body.rangi, req.body.idwnioskujacego]);
		if(r2.affectedRows > 0){
			res.send({odp: 'OK'});
			const [rs] = await db.execute("SELECT `nazwa` as 'n' FROM `rangi` WHERE `id` = ?", [req.body.rangi]);
			const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
			const [rk] = await db.execute("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `ktozlozyl` FROM `podwyzka` WHERE `id` = ?)", [req.body.idwniosku]);
			let kierowca = rk[0].l;
			let kierowcadc = rk[0].d;
			let dysp = rd[0].l;
			let ranga = rs[0].n;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zaakceptowana podwyżka")
				.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zaakceptował wniosek o podwyżkę użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`)
				.setColor(0x00AF20).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Nowa stawka:", value: `${parseFloat(req.body.stawka).toFixed(2)} zł / km`, inline: true})
				.addFields({name: "Nowe stanowisko:", value: `${ranga} (${req.body.rangi})`, inline: true});
			await dcbot.channels.cache.get(process.env.CHANNEL_PODWYZKI).send({embeds: [embed1]});
			if(kierowcadc){
				embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zaakceptował Twój wniosek o podwyżkę.`);
				await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async () => {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			}
		} else {
			res.send({blad: 'Zaakceptowano wniosek, ale nie zmieniono wartosci dla konta!'});
		}
	} else {
		res.send({blad: "Nie zaakceptowano podwyzki"});
	}
});

app.post("/administrujProfil/:token", async (req, res) => {
	//dc zrobione?
	console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, " zaktualizowal profil o ID: ", req.body.idosoby);
	console.log(req.body);
	const [rd] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
	let dysp = rd[0].l;
	const [rt] = await db.query("SELECT * FROM `typkonta`");
	const [rs] = await db.query("SELECT * FROM `rangi`");
	const [ro] = await db.execute("SELECT * FROM `konta` WHERE `id` = ?", [req.body.idosoby]);
	try {
		const [r] = await db.execute("UPDATE `konta` SET `email` = ?, `login` = ?, `stawka` = ?, `garaz` = ?, `truck` = ?, `typkonta` = ?, `kiedydolaczyl` = ?, `steam` = ?, `discord` = ?, `truckersmp` = ?, `truckbook` = ?, `worldoftrucks` = ?, `rangi` = ?, `dostepATS` = ? WHERE `id` = ?",
						[req.body.email, req.body.login, req.body.stawka, req.body.garaz, req.body.truck, req.body.typkonta, req.body.datadolaczenia, req.body.steam, req.body.discord, req.body.truckersmp, req.body.truckbook, req.body.worldoftrucks, req.body.stanowisko, (req.body.dostepATS ? 1 : 0), req.body.idosoby]);
		if(r.affectedRows > 0) {
			res.send({odp: 'Zaktualizowano profil'});
		} else {
			res.send({blad: 'Nie zaktualizowano profilu'});
		}
	} catch(err){ console.log(err) }

	let aktualneDane = {};
	aktualneDane.login = ro[0].login;
	aktualneDane.stawka = ro[0].stawka;
	aktualneDane.email = ro[0].email;
	aktualneDane.discord = ro[0].discord;
	aktualneDane.garaz = ro[0].garaz;
	aktualneDane.truck = ro[0].truck;
	aktualneDane.steam = ro[0].steam;
	aktualneDane.truckersmp = ro[0].truckersmp;
	aktualneDane.truckbook = ro[0].truckbook;
	aktualneDane.worldoftrucks = ro[0].worldoftrucks;
	aktualneDane.kiedydolaczyl = ro[0].kiedydolaczyl;
	aktualneDane.dostepATS = ro[0].dostepATS ? true : false;
	aktualneDane.typkonta = rt.filter((tk) => tk.id == ro[0].typkonta)[0].nazwa + " (" + rt.filter((tk) => tk.id == ro[0].typkonta)[0].id+")";
	aktualneDane.rangi = rs.filter((tk) => tk.id == ro[0].rangi)[0].nazwa + " (" + rs.filter((tk) => tk.id == ro[0].rangi)[0].id+")";
	let zmianaStanowisko = rs.filter((tk) => tk.id == req.body.stanowisko)[0].nazwa + " (" + req.body.stanowisko + ")";
	let zmianaTypkonta = rt.filter((tk) => tk.id == req.body.typkonta)[0].nazwa + " (" + req.body.typkonta + ")";
	let finalKierowca = aktualneDane.login;
	let finalKierowcaDC = aktualneDane.discord;
	const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zmiany profilowe - Administrator").setColor(0xAF0000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
	if(req.body.login != aktualneDane.login){
		finalKierowca = req.body.login;
		embed1.addFields({name: 'Login:', value: `${aktualneDane.login} ➡ ${req.body.login}`});
	}
	if(req.body.email != aktualneDane.email){
		embed1.addFields({name: 'E-mail:', value: `${aktualneDane.email} ➡ ${req.body.email}`});
	}
	if(zmianaTypkonta != aktualneDane.typkonta){
		embed1.addFields({name: 'Typ konta:', value: `${aktualneDane.typkonta} ➡ ${zmianaTypkonta}`});
	}
	if(zmianaStanowisko != aktualneDane.rangi){
		embed1.addFields({name: 'Stanowisko:', value: `${aktualneDane.rangi} ➡ ${zmianaStanowisko}`});
	}
	if(req.body.stawka != aktualneDane.stawka){
		embed1.addFields({name: 'Stawka za kilometr:', value: `${aktualneDane.stawka} zł/km ➡ ${req.body.stawka} zł/km`});
	}
	if(req.body.discord != aktualneDane.discord){
		finalKierowcaDC = req.body.discord;
		embed1.addFields({name: 'Discord:', value: `<@${aktualneDane.discord}> ➡ <@${req.body.discord}>`});
	}
	if(req.body.steam != aktualneDane.steam){
		embed1.addFields({name: 'Profil Steam:', value: `${aktualneDane.steam} ➡ ${req.body.steam}`});
	}
	if(req.body.truckersmp != aktualneDane.truckersmp){
		embed1.addFields({name: 'Profil TruckersMP:', value: `${aktualneDane.truckersmp} ➡ ${req.body.truckersmp}`});
	}
	if(req.body.truckbook != aktualneDane.truckbook){
		embed1.addFields({name: 'Profil TrucksBook:', value: `${aktualneDane.truckbook} ➡ ${req.body.truckbook}`});
	}
	if(req.body.worldoftrucks != aktualneDane.worldoftrucks){
		embed1.addFields({name: 'Profil World of Trucks:', value: `${aktualneDane.worldoftrucks} ➡ ${req.body.worldoftrucks}`});
	}
	if(req.body.garaz != aktualneDane.garaz){
		embed1.addFields({name: 'Garaż:', value: `${aktualneDane.garaz} ➡ ${req.body.garaz}`});
	}
	if(req.body.truck != aktualneDane.truck){
		embed1.addFields({name: 'Pojazd:', value: `${aktualneDane.truck} ➡ ${req.body.truck}`});
	}
	console.log(req.body.dostepATS, aktualneDane.dostepATS);
	console.log(req.body.dostepATS != aktualneDane.dostepATS);
	if(req.body.dostepATS != aktualneDane.dostepATS){
		embed1.addFields({name: 'Dostęp ATS:', value: `${aktualneDane.dostepATS ? "TAK" : "NIE" } ➡ ${req.body.dostepATS ? "TAK" : "NIE"}`});
	}
	embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zedytował konto użytkownika [${finalKierowca}](https://system.thebossspedition.pl/profil/${finalKierowca}).`);
	await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
	if(finalKierowcaDC){
		embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zedytował [Twoje konto](https://system.thebossspedition.pl/profil/${finalKierowca}).`);
		await dcbot.users.send(finalKierowcaDC, {embeds: [embed1]}).catch(async () => {
			try {
				await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${finalKierowcaDC}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
			} catch(erdc){
				console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
			}
		});
	}
});

//usuwanie konta
app.post("/usunKonto/:token", async (req, res) => {
	console.log(`[${new Date().toLocaleString('pl')}] `, "UWAGA!!!", req.params.token, "USUNĄŁ KONTO O ID:", req.body.idosoby);
	//powiazanie telemetria
	try {
		await db.execute("DELETE FROM `telemetriaPowiazania` WHERE `uzytkownik` = (SELECT `login` FROM `konta` WHERE `id` = ?)", [req.body.idosoby]);
	} catch(er){
		console.log("Błąd usunięcia konta: telemetriaPowiazania");
		console.log(er);
	}
	//winiety
	try {
		await db.execute("DELETE FROM `kupionewiniety` WHERE `kto` = ?", [req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: kupioneWiniety");
		console.log(er);
	}
	//podwyzki
	try {
		await db.execute("DELETE FROM `podwyzka` WHERE `ktozlozyl` = ? OR `ktorozpatrzyl` = ?", [req.body.idosoby, req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: podwyzki");
		console.log(er);
	}
	//incydenty
	try {
		await db.execute("DELETE FROM `incydenty` WHERE `kto` = ?", [req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: incydenty");
		console.log(er);
	}
	//notatkiprofilowe
	try {
		await db.execute("DELETE FROM `notatkiprofilowe` WHERE `kto` = ? OR `komu` = ?", [req.body.idosoby, req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: notatkiprofilowe");
		console.log(er);
	}
	//dysphistoria
	try {
		await db.execute("DELETE FROM `dysphistoria` WHERE `kto` = ?", [req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: dysphistoria");
		console.log(er);
	}
	//dodawaniekwoty
	try {
		await db.execute("DELETE FROM `dodawaniekwoty` WHERE `komu` = ?", [req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: dodawaniekwoty");
		console.log(er);
	}
	//trasy
	try {
		await db.execute("DELETE FROM `trasy` WHERE `kto` = ?", [req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: trasy");
		console.log(er);
	}
	//uprawnienia
	try {
		await db.execute("DELETE FROM `uprawnienia` WHERE `kto` = ?", [req.body.idosoby]);
	} catch(er) {
		console.log("Błąd usunięcia konta: uprawnienia");
		console.log(er);
	}
	//powiadomienie o usunieciu konta
	try {
		const [auR] = await db.execute("SELECT `login` as 'usuwajacy' FROM `konta` WHERE `token` = ?", [req.params.token]);
		const [rk] = await db.execute("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `id` = ?", [req.body.idosoby]);
		telemetriaPowiazania = telemetriaPowiazania.filter(v => v.login !== rk[0].l);
		telemetriaInformacje = telemetriaInformacje.filter(v => v.login !== rk[0].l);
		const embed1 = new EmbedBuilder().setColor(0xA50000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp()
			.setFooter({ text: 'System The Boss Spedition'})
			.setDescription(`Użytkownik [${auR[0]['usuwajacy']}](https://system.thebossspedition.pl/profil/${auR[0]['usuwajacy']}) usunął konto użytkownika <@${rk[0].d}> [${rk[0].l}](https://system.thebossspedition.pl/profil/${rk[0].l})`).setTitle("Usunięcie konta");
		const czanel = dcbot.channels.cache.get(process.env.CHANNEL_INNE);
		await czanel.send({embeds: [embed1]});
		try {
			const embed2 = new EmbedBuilder().setColor(0xA50000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp()
				.setFooter({ text: 'System The Boss Spedition'})
				.setDescription(`Twoje konto w systemie The Boss Spedition zostało usunięte. Czynność przeprowadził użytkownik [${auR[0].usuwajacy}](https://system.thebossspedition.pl/profil/${auR[0].usuwajacy})`).setTitle("Usunięcie konta");
			await dcbot.users.send(kierowcadc, {embeds: [embed2]}).catch(async () => {
				console.log(`[${new Date().toLocaleString('pl')}] `, `Nie powiadomiono użytkownika ${rk[0].l} / dc: ${rk[0].d} o usunięciu jego konta.`);
			});
		} catch (er2) {
			console.log(`[${new Date().toLocaleString('pl')}] `, `Nie powiadomiono użytkownika ${rk[0].l} / dc: ${rk[0].d} o usunięciu jego konta.`);
			console.log(er2);
		}
	} catch(er) {
		console.log("Błąd wysłania powiadomienia o usunięciu konta");
		console.log(er);
	}
	//konto
	const [usun] = await db.execute("DELETE FROM `konta` WHERE `id` = ?", [req.body.idosoby]);
	if(usun.affectedRows > 0){
		res.send({odp: 'USUNIETO KONTO!'});
	} else {
		res.send({blad: 'Wystapil blad krytyczny'});
	}
});

//wnioski zloz dane init
app.post("/twojeAktDaneWniosek/:token", async (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		const [r] = await db.execute("SELECT `id`,`rangi`,`stawka` FROM `konta` WHERE `token` = ?", [req.params.token]);
		if(r.length > 0){
			res.send({idosoby: Number(r[0]['id']), aktstawka: Number(r[0]['stawka']), aktstanowisko: r[0]['rangi']});
		} else {
			res.send({blad: 'Nie znaleziono danych dla profilu o takim tokenie!'});
		}
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});

//wnioski zlozone juz
app.post("/historiaPodwyzek/:token", async (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		const [r] = await db.execute("SELECT * FROM `podwyzka` WHERE `ktozlozyl` = (SELECT `id` FROM `konta` WHERE `token` = ?)", [req.params.token]);
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz) => {
				tmp.push({
					idwniosku: Number(wiersz.id),
					kiedy: wiersz.kiedy,
					aktstanowisko: wiersz.aktstanowisko,
					nowestanowisko: wiersz.nowestanowisko,
					aktstawka: Number(wiersz.aktstawka),
					nowastawka: Number(wiersz.nowastawka),
					powod: wiersz.wniosektxt,
					status: wiersz.wniosek
				});
			})
			res.send({dane: tmp});
		} else {
			res.send({odp: "Brak zlozonych podwyzek"});
		}
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});

//historia zlozonych urlopow - urlopy
app.post("/historiaUrlopow/:token", async (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		const [r] = await db.execute("SELECT `urlopy`.`kto`, `urlopy`.`id`, `urlopy`.`odkiedy`, `urlopy`.`dokiedy`, `urlopy`.`status`, `konta`.`login`, `konta`.`awatar` FROM `urlopy` LEFT JOIN `konta` ON `urlopy`.`ktorozpatrzyl` = `konta`.`id` WHERE `urlopy`.`kto` = (SELECT `id` FROM `konta` WHERE `token` = ?)", [req.params.token]);
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz) => {
				tmp.push({
					idwniosku: wiersz.id,
					odkiedy: wiersz.odkiedy,
					dokiedy: wiersz.dokiedy,
					status: wiersz.status,
					ktorozpatrzyl: wiersz.login,
					awatarRozpatrzyl: wiersz.awatar
				});
			})
			res.send({dane: tmp});
		} else {
			res.send({dane: null});
		}
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});

app.post("/urlopyUzytkownika/:token/:czyje", async (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		const [r] = await db.execute("SELECT `urlopy`.`id`, `urlopy`.`odkiedy`, `urlopy`.`dokiedy` FROM `urlopy` WHERE `urlopy`.`status` = 2 AND `urlopy`.`kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [req.params.czyje]);
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz) => {
				tmp.push({
					idwniosku: wiersz.id,
					odkiedy: wiersz.odkiedy,
					dokiedy: wiersz.dokiedy
				});
			})
			res.send({dane: tmp});
		} else {
			res.send({odp: "Brak urlopow"});
		}
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});

//skladanie urlopu
app.post("/zlozUrlop/:token", async (req, res) => {
	//dc zrobione
	if(req.params.token && req.body.odkiedy && req.body.dokiedy && req.body.powod){
		const [r] = await db.execute("INSERT INTO `urlopy` (`kto`,`odkiedy`, `dokiedy`, `komentarz`, `status`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, ?, ?)", [req.params.token, req.body.odkiedy, req.body.dokiedy, req.body.powod, 0]);
		if(r.affectedRows > 0){
			console.log(req.params.token, "złożył wniosek o urlop!, ID wniosku:", r.insertId);
			res.send({odp: "Zlozono wniosek!"});
			const [rk] = await db.execute("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
			let kierowca = rk[0].l;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Złożenie wniosku o urlop")
				.setDescription(`Użytkownik [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) złożył wniosek o urlop.`)
				.setColor(0x007BFF).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Data rozpoczęcia:", value: `${new Date(req.body.odkiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`})
				.addFields({name: "Data zakończenia:", value: `${new Date(req.body.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`})
				.addFields({name: "Uzasadnienie:", value: req.body.powod});
			await dcbot.channels.cache.get(process.env.CHANNEL_URLOPY).send({embeds: [embed1]});
		} else {
			res.send({blad: "Nie zlozono wniosku!"});
		}
	} else {
		res.send({blad: "Niezalogowany lub niewypelniono poprawnie formularzu"});
	}
});

//zakoncz urlop samemu
app.post("/zakonczUrlop/:token", async (req, res) => {
	//dc zrobione
	if(req.params.token){
		const [r] = await db.execute("UPDATE `urlopy` SET `status` = ? WHERE `id` = ?", [3, req.body.ktory]);
		if(r.affectedRows > 0){
			console.log(req.params.token, "anulował swój urlop!, ID urlopu:", r.insertId);
			res.send({odp: "Anulowano!"});
			const [rk] = await db.execute("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
			let kierowca = rk[0].l;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zakończenie urlopu")
				.setDescription(`Użytkownik [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) zakończył ręcznie swój urlop.`)
				.setColor(0xFF8400)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			await dcbot.channels.cache.get(process.env.CHANNEL_URLOPY).send({embeds: [embed1]});
		} else {
			res.send({blad: "Nieanulowano urlopu!"});
		}
	} else {
		res.send({blad: "Niezalogowany lub niewypelniono poprawnie formularzu"});
	}
});

//skladanie wniosku
app.post("/zlozWniosek/:token", async (req, res) => {
	//dc zrobione
	if(req.params.token && req.body.aktstawka && req.body.nowastawka && req.body.aktstanowisko && req.body.nowestanowisko && req.body.powod){
		const [r] = await db.execute("INSERT INTO `podwyzka` (`ktozlozyl`,`ktorozpatrzyl`, `aktstawka`, `nowastawka`, `aktstanowisko`, `nowestanowisko`, `powod`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), 0, ?, ?, ?, ?, ?)", [req.params.token, req.body.aktstawka, req.body.nowastawka, req.body.aktstanowisko, req.body.nowestanowisko, req.body.powod]);
		if(r.affectedRows > 0){
			console.log(req.params.token, "złożył wniosek o podwyzke!, ID wniosku:", r.insertId);
			res.send({odp: "Zlozono wniosek!"});
			const [rk] = await db.execute("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
			let kierowca = rk[0].l;
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Złożono wniosek o podwyżkę")
				.setDescription(`Użytkownik [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) złożył wniosek o podwyżkę.`)
				.setColor(0x01F1AD)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				.addFields({name: "Aktualna stawka:", value: `${parseFloat(req.body.aktstawka).toFixed(2)} zł`, inline: true})
				.addFields({name: 'Aktualne stanowisko:', value: req.body.aktstanowiskoN, inline: true})
				.addFields({name: "Uzasadnienie:", value: req.body.powod, inline: false})
				.addFields({name: "Wnioskowana stawka:", value: `${parseFloat(req.body.nowastawka).toFixed(2)} zł`, inline: true})
				.addFields({name: "Wnioskowane stanowisko:", value: req.body.nowestanowiskoN, inline: true});
			await dcbot.channels.cache.get(process.env.CHANNEL_PODWYZKI).send({embeds: [embed1]});
		} else {
			res.send({blad: "Nie zlozono wniosku!"});
		}
	} else {
		res.send({blad: "Niezalogowany lub niewypelniono poprawnie formularzu"});
	}
});

//ustaw limit km
app.post("/ustawLimit/:login", async (req, res) => {
	//dc zrobione
	const [r] = await db.execute("UPDATE `ustawienia` SET `wartosc` = ? WHERE `nazwa` = 'limit_km'", [req.body.limit]);
	if(r.affectedRows > 0){
		res.send({odp: 'OK'});
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowy limit km")
			.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) ustawił nowy limit kilometrów.`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.addFields({name: "Wartość:", value: `${(req.body.limit)} km`});
		await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
	} else {
		res.send({blad: 'Nie ustawiono'});
	}
});

//ustaw powitalna wiadomosc
app.post("/ustawPowitalna/:login", async (req, res) => {
	//dc zrobione
	const [r] = await db.execute("UPDATE `ustawienia` SET `wartosc` = ? WHERE `nazwa` = 'informacja'", [req.body.tresc]);
	if(r.affectedRows > 0){
		res.send({odp: 'OK'});
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Wiadomość powitalna")
			.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) ustawił nową wiadomość powitalną (strona główna).`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.addFields({name: "Treść:", value: `${(req.body.tresc)}`});
		await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
	} else {
		res.send({blad: 'Nie ustawiono'});
	}
});

//dodawanie/odejmowanie kwoty
app.post("/dodajKwote/:token", async (req, res) => {
	//dc zrobione
	const [r] = await db.execute("INSERT INTO `dodawaniekwoty` (`komu`, `kwota`, `kto`, `powod`) VALUES (?, ?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?)", [req.body.komu, req.body.kwota, req.params.token, req.body.powod ? req.body.powod : "Brak powodu"]);
	if(r.affectedRows > 0){
		try {
			await db.execute("INSERT INTO `kontofirmowe` (`suma`,`opis`) VALUES (?, ?)", [-1*req.body.kwota, "Nadanie kwoty pieniężnej dla kierowcy "+req.body.komu]);
		} catch(erf){
			console.log("Nie odjęto kwoty z konta firmowego przy dodawaniu pieniędzy dla kierowcy, ", req.body.kwota);
			console.log(erf);
		}
		res.send({odp: 'OK'});
		let nadal;
		let kierowca;
		let kierowcadc;
		const [rn] = await db.execute("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token]);
		const [rk] = await db.execute("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `id` = ?", [req.body.komu]);
		nadal = rn[0].l;
		kierowca = rk[0].l;
		kierowcadc = rk[0].d;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle((req.body.kwota > 0) ? "Dodanie kwoty" : "Odjemowanie kwoty")
			.setDescription(`Użytkownik [${nadal}](https://system.thebossspedition.pl/profil/${nadal}) ${(req.body.kwota > 0) ? "dodał pieniądze do" : "odjął pieniądze ze"} stanu konta użytkownika [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}).`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.addFields({name: "Operacja na koncie:", value: `${(parseFloat(req.body.kwota) > 0) ? "+" : ""}${parseFloat(req.body.kwota).toFixed(2)} zł`})
			.addFields({name: "Powód:", value: `${(req.body.powod ? req.body.powod : "Nie podano.")}`});
		await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
		if(kierowcadc){
			embed1.setDescription(`Użytkownik [${nadal}](https://system.thebossspedition.pl/profil/${nadal}) ${(req.body.kwota > 0) ? "dodał pieniądze na twoje konto." : "odjął pieniądze z twojego konta."}`)
			await dcbot.users.send(kierowcadc, {embeds: [embed1]}).catch(async (erdd) => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
		}
	} else {
		res.send({blad: 'Nie ustawiono'});
	}
});

//TELEMETRIA

app.post("/tokenTelemetria/:token", async (req, res) => {
	try {
		const [r] = await db.execute("SELECT `login`, `discord` FROM `konta` WHERE `token` = ?", [req.params.token]);
		if(r.length > 0){
			//wygeneruj token
			const saltToken = r['login'] + Date.now().toString();
			const tokenik = CryptoJS.HmacSHA1(saltToken, KLUCZ_H).toString();
			const [r2] = await db.execute("SELECT `uzytkownik` FROM `telemetriaPowiazania` WHERE `uzytkownik` = ?", [r[0]['login']]);
			// znajdz w telemetriaPowiazania czy istnieje juz login
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Wygenerowanie tokenu telemetrii")
				.setDescription(`Użytkownik [${r[0]['login']}](https://system.thebossspedition.pl/profil/${r[0]['login']}) wygenerował token uwierzytelniania swojego konta w systemowej telemetrii w wersji v${process.env.WERSJA_TELEMETRI}.`)
				.setColor(0x01F1AD)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			if(!r2.length){
				// jesli nie to dodaj
				try {
					await db.execute("INSERT INTO `telemetriaPowiazania` (`uzytkownik`, `token`, `wersja`) VALUES (?, ?, ?)", [r[0]['login'], tokenik, process.env.WERSJA_TELEMETRI]);
					telemetriaPowiazania.push({login: r[0].login, token: tokenik});
					await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
				} catch(er3) {
					console.log("błąd", er3);
				}
			} else {
				// jesli ta to update
				try {
					await db.execute("UPDATE `telemetriaPowiazania` SET `wersja` = ?, `token` = ? WHERE `uzytkownik` = ?", [process.env.WERSJA_TELEMETRI, tokenik, r[0]['login']]);
					const znajdzPoprzedni = telemetriaPowiazania.findIndex(v => v.login == r[0].login);
					if(znajdzPoprzedni == -1){
						telemetriaPowiazania.push({login: r[0].login, token: tokenik});
					} else {
						telemetriaPowiazania[znajdzPoprzedni].token = tokenik;
					}
					console.log(telemetriaPowiazania);
					await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
				} catch(er3) {
					console.log("błąd", er3);
				}
			}
			res.send({odp: tokenik});
		} else {
			res.send({blad: "Brak autoryzacji"});
			return;
		}
	} catch(er) {
		console.log("Błąd tokenTelemetria", er);
		res.send({blad: "Wystąpił jakiś błąd..."});
		return;
	}
});

app.post("/sprawdzWersjeTelemetria/:token", async (req, res) => {
	try {
		const [r] = await db.execute("SELECT `wersja` FROM `telemetriaPowiazania` WHERE `uzytkownik` = (SELECT `login` FROM `konta` WHERE `token` = ?)", [req.params.token]);
		if(!r.length){
			res.send({
				aktualna: process.env.WERSJA_TELEMETRI,
				ostatnia: null
			});
			return;
		} else {
			res.send({
				aktualna: process.env.WERSJA_TELEMETRI,
				ostatnia: r[0]['wersja']
			});
			return;
		}
	} catch(er) {
		console.log("błąd sprawdzWersjeTelemetria", er);
		res.send({blad: "Błąd bazy danych"});
		return;
	}
});

app.post("/dostanAwatary/", async (req, res) => {
	let tmp = [];
	const [r] = await db.query("SELECT login, awatar FROM konta");
	r.forEach(v => {
		tmp.push({login: v['login'], awatar: v['awatar']});
	})
	res.send(tmp);
});

app.post("/stawkiPaliwowe/", async (req, res) => {
	let tmp = [];
	const [r] = await db.query("SELECT * FROM stawkiPaliwowe");
	r.forEach(v => {
		tmp.push({id: v.id, gra: v.gra, name: v.name, stawka: v.stawka});
	});
	res.send(tmp);
});

app.post("/aktualizujStawkePaliwa/:token/", async (req, res) => {
	if(!req.params.token || (req.body.id === undefined)) {
		res.send({blad: "Brak uprawnień lub identyfikatora"});
		return;
	}
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [r] = await db.execute("UPDATE `stawkiPaliwowe` SET `stawka` = ? WHERE `id` = ?", [req.body.nowaStawka, req.body.id]);
		if(r.affectedRows > 0){
			if(req.body.gra == 1){
				const znajdzId = stawkiPanstwaTelemetriaATS.findIndex(z => z.id === req.body.id);
				if(znajdzId == -1){
					stawkiPanstwaTelemetriaATS.push({id: req.body.id, name: req.body.name, stawka: req.body.nowaStawka});
				} else {
					stawkiPanstwaTelemetriaATS[znajdzId].stawka = req.body.nowaStawka;
				}
			} else {
				const znajdzId = stawkiPanstwaTelemetria.findIndex(z => z.id === req.body.id);
				if(znajdzId == -1){
					stawkiPanstwaTelemetria.push({id: req.body.id, name: req.body.name, stawka: req.body.nowaStawka});
				} else {
					stawkiPanstwaTelemetria[znajdzId].stawka = req.body.nowaStawka;
				}
			}
			res.send({odp: "Pomyślnie zmieniono stawkę paliwa dla "+req.body.name});
		}
	} catch(er) {
		res.send({blad: "Wystąpił błąd SQL!"});
		return;
	}
});

const statystykaUprawniony = async (token) => {
	try {
		const [rk] = await db.execute("SELECT COUNT(*) as 'i' FROM konta WHERE token = ? AND typkonta <= 2", [token]);
		if(rk[0].i <= 0){
			return false;
		} else {
			return true;
		}
	} catch(er) {
		return false;
	}
};

app.post("/statystykakontofirmowe/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	} else {
		try {
			const [r] = await db.execute("SELECT * FROM `kontofirmowe` WHERE `kiedy` >= ? AND `kiedy` <= ?", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
			try {
				const [r2] = await db.execute("SELECT SUM(`suma`) as 's' FROM `kontofirmowe` WHERE `kiedy` < ?", [new Date(req.body.czasOd)]);
				res.send({odp: {dane: r, suma: r2[0].s } });
			} catch(er2) {
				res.send({blad: "Wystąpił błąd SQL!"});
				return;
			}
		} catch(er) {
			res.send({blad: "Wystąpił błąd SQL!"});
			return;
		}
	}
});

app.post("/statystykakadradyspozytor/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	} else {
		try {
			const [rd] = await db.execute("SELECT `kto`, COUNT(CASE WHEN `akcja` > 0 THEN 1 END) as 'zatwierdzone', COUNT(CASE WHEN `akcja` <= 0 THEN 1 END) as 'odrzucone' FROM `dysphistoria` WHERE `kiedy` >= ? AND `kiedy` <= ? GROUP BY `kto`", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
			let tmp = []; // zatwierdzone per despozytor
			rd.forEach(dysp => {
				tmp.push({kto: dysp.kto, zatwierdzone: dysp.zatwierdzone, odrzucone: dysp.odrzucone, razem: dysp.zatwierdzone + dysp.odrzucone});
			});
			res.send({odp: tmp});
		} catch(er2) {
			res.send({blad: "Wystąpił błąd SQL!"});
			return;
		}
	}
});

app.post("/statystykakadrainstruktor/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [rb] = await db.execute("SELECT instruktor, SUM(CASE WHEN gra = 1 THEN 1 END) as 'ats', SUM(CASE WHEN gra = 0 THEN 1 END) as 'ets' FROM `uprawnienia` WHERE odkiedy >= ? AND odkiedy <= ? GROUP BY instruktor", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		res.send({odp: rb});
	} catch(erb) {
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
});

app.post("/statystykaKierowcySpalanie/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [rt] = await db.execute("SELECT MIN(G.sp) as 'min', AVG(G.sp) as 'avg', MAX(G.sp) as 'max', G.kto FROM (SELECT spalanie*100/przejechane as 'sp', kto, id FROM trasy WHERE kiedy >= ? AND kiedy <= ? AND zatwierdz = 1 GROUP BY kto, id) as G GROUP BY kto", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		res.send({odp: rt});
	} catch(ert){
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
});

app.post("/statystykaKierowcyPredkosc/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [rt] = await db.execute("SELECT MIN(vmax) as 'min', AVG(vmax) as 'avg', MAX(vmax) as 'max', kto FROM trasy WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ? GROUP BY kto", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		res.send({odp: rt});
	} catch(ert) {
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
});

app.post("/statystykaKierowcyPrzejechane/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [rt] = await db.execute("SELECT kto, SUM(przejechane) as 'km', SUM(masaladunku) as 'tony' FROM trasy WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ? GROUP BY kto", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		res.send({odp: rt});
	} catch(ert) {
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
});

app.post("/statystykaKierowcyUszkodzenia/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [r] = await db.execute("SELECT `konta`.`login`, SUM(CASE WHEN uszkodzenia >= 1 THEN 1 ELSE 0 END) as 'powyzej', SUM(CASE WHEN uszkodzenia < 1 THEN 1 ELSE 0 END) as 'ponizej' FROM `trasy` JOIN `konta` ON `trasy`.`kto` = `konta`.`id` WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ? GROUP BY `kto`", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		res.send({odp: r});
	} catch(er) {
		res.send({blad: "Wystąpił błąd SQL"});
	}
});

app.post("/statystykaKierowcyZarobki/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [rt] = await db.execute("SELECT kto, SUM(wlasnyzarobek) as 'zarobek', SUM(premia) as 'premia', SUM(kara) as 'kara' FROM `trasy` WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ? GROUP BY kto", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		try {
			const [ru] = await db.execute("SELECT `kto`, SUM(`uprawnienia`.`cena`) as 'c' FROM `uprawnienia` WHERE odkiedy >= ? AND odkiedy <= ? GROUP BY kto", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
			try {
				const [rd] = await db.execute("SELECT `komu` as 'kto', SUM(`dodawaniekwoty`.`kwota`) as 'c' FROM `dodawaniekwoty` WHERE kiedy >= ? AND kiedy <= ? GROUP BY `komu`", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
				let tmp = [];
				rt.forEach(x => {
					tmp.push({kierowca: x.kto, wlasnyzarobek: x.zarobek, premia: x.premia, kara: x.kara });
				});
				ru.forEach(x => {
					//sprawdz czy jest w tmp
					const sprawdz = tmp.findIndex(y => y.kierowca === x.kto);
					if(sprawdz !== -1){
						tmp[sprawdz].uprawnienia = x.c;
					} else {
						tmp.push({kierowca: x.kto, wlasnyzarobek: 0, premia: 0, kara: 0, uprawnienia: x.c});
					}
				});
				rd.forEach(x => {
					//sprawdz czy jest w tmp
					const sprawdz = tmp.findIndex(y => y.kierowca === x.kto);
					if(sprawdz !== -1){
						tmp[sprawdz].gesty = x.c;
					} else {
						tmp.push({kierowca: x.kto, wlasnyzarobek: 0, premia: 0, kara: 0, uprawnienia: 0, gesty: x.c});
					}
				});
				for(let x = 0; x < tmp.length; x++){
					if(tmp[x].wlasnyzarobek === undefined) tmp[x].wlasnyzarobek = 0;
					if(tmp[x].premia === undefined) tmp[x].premia = 0;
					if(tmp[x].gesty === undefined) tmp[x].gesty = 0;
					if(tmp[x].kara === undefined) tmp[x].kara = 0;
					if(tmp[x].uprawnienia === undefined) tmp[x].uprawnienia = 0;
					//DODAĆ WINIETY
					tmp[x].razem = tmp[x].wlasnyzarobek + tmp[x].premia + tmp[x].gesty - tmp[x].kara - tmp[x].uprawnienia;
				}
				tmp = tmp.filter(x => x.kierowca !== 1);
				res.send({odp: tmp});
				return;
			} catch(erd){
				res.send({blad: "Wystąpił błąd SQL odczytu przelewów Firma -> Kierowca."});
				return;
			}
		} catch(eru) {
			res.send({blad: "Wystąpił bład SQL odczytu kosztów uprawnień."});
			return;
		}
	} catch(ert) {
		res.send({blad: "Wystąpił błąd SQL odczytu zarobków i kar z tras."});
		return;
	}
});

app.post("/statystykaLogistykaPromy/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try {
		const [rp] = await db.execute("SELECT COUNT(idprompociag) as 'ile' FROM trasyprompociag WHERE idtrasa IN (SELECT id FROM `trasy` WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ?)", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		try { 
			const [ru] = await db.execute("SELECT COUNT(g.szmeks) as 'unikalnych' FROM (SELECT idprompociag as 'szmeks' FROM trasyprompociag WHERE idtrasa IN (SELECT id FROM `trasy` WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ?) GROUP BY idprompociag) g", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
			try {
				const [rp2] = await db.execute("SELECT prompociag.nazwa as 'nazwa', COUNT(idprompociag) as 'ile' FROM trasyprompociag LEFT JOIN prompociag ON trasyprompociag.idprompociag = prompociag.id WHERE idtrasa IN (SELECT id FROM `trasy` WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ?) GROUP BY idprompociag ORDER BY ile DESC, prompociag.nazwa ASC LIMIT 10", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
				res.send({zestaw: rp2, razem: rp[0].ile, unikalnych: ru[0].unikalnych});
			} catch(erp2) {
				res.send({blad: "Wystąpił błąd SQL"});
				return;
			}
		} catch(eru) {
			res.send({blad: "Wystąpił błąd SQL"});
			return;
		}
	} catch(erp) {
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
});

app.post("/statystykaLogistykaWiele/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	try{
		const [r] = await db.execute("SELECT trasy.gra, typyuprawnien.nazwa, COUNT(*) AS liczba_wystapien FROM trasy LEFT JOIN typyuprawnien ON trasy.naczepa = typyuprawnien.id WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ? GROUP BY naczepa, trasy.gra	ORDER BY gra ASC, liczba_wystapien DESC", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		res.send({odp: r});
	} catch(er){
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
	// jakie naczepy byly stosowane w jakiej grze i ile razy wystepowaly
	/* SELECT trasy.gra, naczepa, typyuprawnien.nazwa, COUNT(*) AS liczba_wystapien FROM trasy LEFT JOIN typyuprawnien ON trasy.naczepa = typyuprawnien.id
	WHERE zatwierdz = 1 AND kiedy >= "2025-04-01" GROUP BY naczepa, trasy.gra
	ORDER BY gra ASC, liczba_wystapien DESC */

	// ile tras ETS2: odp.filter(x => x.gra === 0).reduce((prev, curr) => prev + curr.liczba_wystapien, 0)
	// ile tras ATS: odp.filter(x => x.gra === 1).reduce((prev, curr) => prev + curr.liczba_wystapien, 0)
	// ile unikalnych naczep ETS2: odp.filter(x => x.gra === 0).length
	// ile unikalnych naczep ATS: odp.filter(x => x.gra === 1).length
});

app.post("/statystykaLogistykaPanstwa/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;			
	}
	try {
		const [rd] = await db.execute("SELECT g.kraj, SUM(g.ile) as 'ile' FROM (SELECT trasy.od, miejscowosci.kraj, COUNT(*) as 'ile' FROM trasy JOIN miejscowosci ON trasy.od = miejscowosci.id WHERE trasy.gra = ? AND trasy.zatwierdz = 1 AND trasy.kiedy >= ? AND trasy.kiedy <= ? GROUP BY trasy.od) g GROUP BY g.kraj", [req.body.gra ? 1 : 0, new Date(req.body.czasOd), new Date(req.body.czasDo)]);
		try {
			const [rc] = await db.execute("SELECT g.kraj, SUM(g.ile) as 'ile' FROM (SELECT trasy.do, miejscowosci.kraj, COUNT(*) as 'ile' FROM trasy JOIN miejscowosci ON trasy.do = miejscowosci.id WHERE trasy.gra = ? AND trasy.zatwierdz = 1 AND trasy.kiedy >= ? AND trasy.kiedy <= ? GROUP BY trasy.do) g GROUP BY g.kraj", [req.body.gra ? 1 : 0, new Date(req.body.czasOd), new Date(req.body.czasDo)]);
			let tmp = [];
			rd.forEach(x => {
				tmp.push({kraj: x.kraj, od: x.ile, do: 0});
			});
			rc.forEach(x => {
				const sprawdz = tmp.findIndex(y => y.kraj === x.kraj);
				if(sprawdz !== -1){
					tmp[sprawdz].do = x.ile;
				} else {
					tmp.push({kraj: x.kraj, od: 0, do: x.ile});
				}
			});
			res.send({odp: tmp});
		} catch(erc) {
			res.send({blad: "Wystąpił błąd SQL"});
			return;
		}
	} catch(erd) {
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
	// SELECT g.kraj, SUM(g.ile) as 'ile' FROM (SELECT trasy.od, miejscowosci.kraj, COUNT(*) as 'ile' FROM trasy JOIN miejscowosci ON trasy.od = miejscowosci.id WHERE trasy.gra = 0 AND trasy.zatwierdz = 1 AND trasy.kiedy >= "2025-05-01" GROUP BY trasy.od) g GROUP BY g.kraj
});

app.post("/statystykaLogistykaSpecjalne/:token", async (req, res) => {
	if(!statystykaUprawniony(req.params.token)){
		res.send({blad: "Nieuprawniony"});
		return;
	}
	const [r] = await db.execute("SELECT SUM(ladunekADR) as 'adr', SUM(ladunekDelikatny) as 'delikatny', SUM(ladunekGabaryt) as 'gabaryt' FROM `trasy` WHERE zatwierdz = 1 AND kiedy >= ? AND kiedy <= ?", [new Date(req.body.czasOd), new Date(req.body.czasDo)]);
	res.send({odp: [{nazwa: "ADR", wartosc: r[0].adr}, {nazwa: "Delikatny", wartosc: r[0].delikatny}, {nazwa: "Gabaryt", wartosc: r[0].gabaryt}]});
});

app.get("/typyOsiagniec", async (req, res) => {
	const [r] = await db.query("SELECT * FROM typyOsiagniec");
	res.send({odp: r});
});

app.post("/osiagnieciaKierowcy/:kierowca", async (req, res) => {
	if(!req.params.kierowca) {
		res.send({blad: "Brak podanej nazwy użytkownika"});
		return;
	}
	try {
		const [r] = await db.execute("SELECT * FROM osiagniecia WHERE kierowca = (SELECT id FROM konta WHERE login = ?)", [req.params.kierowca]);
		res.send({odp: r });
	} catch(er){
		res.send({blad: "Wystąpił błąd SQL"});
		return;
	}
});

app.post("/dodawanieOsiagniecUprawnienie/:token", async (req, res) => {
	const [r] = await db.execute("SELECT COUNT(*) as i FROM konta WHERE token = ? AND typkonta <= 2", [req.params.token]);
	if(r[0].i){
		res.send({uprawniony: true});
	} else {
		res.send({uprawniony: false});
	}
	return;
});

app.post("/customoweOsiagniecia/:kierowca", async (req, res) => {
	try {
		const [r] = await db.execute("SELECT * FROM customOsiagniecia WHERE komu = (SELECT id FROM konta WHERE login = ?)", [req.params.kierowca]);
		res.send({odp: r});
		return;
	} catch(er) {
		res.send({blad: "Wystąpił błąd bazy danych.", odp: []});
		return;
	}
});

app.post("/dodajCustomOsiagniecie/:token", upload.single('osiagnieciaImg'), async (req, res) => {
	const [r] = await db.execute("SELECT login FROM konta WHERE token = ? AND typkonta <= 2", [req.params.token]);
	if(r.length < 1){
		res.send({blad: "Nieuprawniony."});
		return;
	}
	if(!req.body.kierowca) {
		res.send({blad: "Niewybrany odbiorca tworzonego osiągnięcia."});
		return;
	}
	if(!req.body.nazwa){
		res.send({blad: "Nieuzupełniona nazwa osiągnięcia."});
		return;
	}
	if(!req.body.opis){
		res.send({blad: "Nieuzupełniony opis osiągnięcia."});
		return;
	}
	// ikona
	if(!req.file){
		res.send({blad: "Niewybrane zdjęcie dla ikony osiągnięcia."});
		return;
	}
	const zdjPath = "/img/osiagniecia/" + req.file.filename;
	try {
		const [komudc] = await db.execute("SELECT discord FROM konta WHERE login = ?", [req.body.kierowca]);
		const [r2] = await db.execute("INSERT INTO customOsiagniecia (komu, nazwa, opis, ikona) VALUES ((SELECT id FROM konta WHERE login = ?), ?, ?, ?)", [req.body.kierowca, req.body.nazwa, req.body.opis, zdjPath]);
		if(r2.affectedRows){
			res.send({odp: "Dodano."});
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Dodanie osiągnięcia")
				.setDescription(`Użytkownik [${r[0].login}](https://system.thebossspedition.pl/profil/${r[0].login}) dodał personalne osiągnięcie użytkownikowi [${req.body.kierowca}](https://system.thebossspedition.pl/profil/${req.body.kierowca}).`)
				.setColor(0x03FF03)
				.addFields({name: "Nazwa:", value: req.body.nazwa})
				.addFields({name: "Opis:", value: req.body.opis})
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			await dcbot.channels.cache.get(process.env.CHANNEL_OSIAGNIECIA).send({embeds: [embed1]});
			embed1.setDescription(`Użytkownik [${r[0].login}](https://system.thebossspedition.pl/profil/${r[0].login}) dodał Tobie personalne osiągnięcie.`);
			await dcbot.users.send(komudc[0].discord, {embeds: [embed1]}).catch(async (er) => {
				try {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dckierowcy}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				} catch(erdc){
					console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
				}
			});
			return;
		} else {
			res.send({blad: "Wystąpił błąd bazy. Niedodano."});
			return;
		}
	} catch(er2) {
		res.send({blad: er2.message});
		return;
	}
});

app.get("/ostatnie3Podwyzki/:target", async (req, res) => {
	if(req.params.target === undefined){
		res.send({blad: "Niewskazano użytkownika."});
		return;
	}
	const [r] = await db.execute("SELECT * FROM podwyzka WHERE `ktozlozyl` = ? AND wniosek IS NOT NULL ORDER BY kiedy DESC LIMIT 3", [req.params.target]);
	if(r.length > 0){
		let tmp = [];
		r.forEach(w => {
			tmp.push(w);
		})
		res.send(tmp);
	} else {
		res.send([]);
	}
});

app.post("/usunCustomoweOsiagniecie/:token", async (req, res) => {
	const [r] = await db.execute("SELECT login FROM konta WHERE token = ? AND typkonta <= 2", [req.params.token]);
	if(r.length < 1){
		res.send({blad: "Nieuprawniony."});
		return;
	}
	const [komu] = await db.execute("SELECT login, discord FROM konta WHERE id = ?", [req.body.komu]);
	const [r2] = await db.execute("DELETE FROM customOsiagniecia WHERE id = ? AND komu = ?", [req.body.id, req.body.komu]);
	if(r2.affectedRows > 0){
		res.send({odp: "Usunięto."});
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Usunięcie osiągnięcia")
			.setDescription(`Użytkownik [${r[0].login}](https://system.thebossspedition.pl/profil/${r[0].login}) usunął personalne osiągnięcie użytkownika [${komu[0].login}](https://system.thebossspedition.pl/profil/${komu[0].login}).`)
			.setColor(0xF30303)
			.addFields({name: "Nazwa:", value: req.body.nazwa})
			.addFields({name: "Opis:", value: req.body.opis})
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
		await dcbot.channels.cache.get(process.env.CHANNEL_OSIAGNIECIA).send({embeds: [embed1]});
		embed1.setDescription(`Użytkownik [${r[0].login}](https://system.thebossspedition.pl/profil/${r[0].login}) usunął Twoje personalne osiągnięcie.`);
		await dcbot.users.send(komu[0].discord, {embeds: [embed1]}).catch(async (er) => {
			try {
				await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${komu[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
			} catch(erdc){
				console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
			}
		});
		return;
	}
	res.send({blad: "Wystąpił błąd bazy danych."});
});

app.post("/dodajGrupoweOsiagniecie/:token", upload.single('osiagnieciaImg'), async (req, res) => {
	const [r] = await db.execute("SELECT login FROM konta WHERE token = ? AND typkonta <= 2", [req.params.token]);
	if(r.length < 1){
		res.send({blad: "Nieuprawniony."});
		return;
	}
	if(req.body.kierowcy === undefined) {
		res.send({blad: "Niewybrani odbiorcy tworzonego osiągnięcia."});
		return;
	}
	if(!req.body.kierowcy.length) {
		res.send({blad: "Niewybrani odbiorcy tworzonego osiągnięcia."});
		return;
	}
	if(!req.body.nazwa){
		res.send({blad: "Nieuzupełniona nazwa osiągnięcia."});
		return;
	}
	if(!req.body.opis){
		res.send({blad: "Nieuzupełniony opis osiągnięcia."});
		return;
	}
	// ikona
	if(!req.file){
		res.send({blad: "Niewybrane zdjęcie dla ikony osiągnięcia."});
		return;
	}
	const zdjPath = "/img/osiagniecia/" + req.file.filename;
	let iluDodano = 0;
	let komuNienadano = [];
	try {
		for( const kierowcaID of req.body.kierowcy) {
			const [komu] = await db.execute("SELECT login, discord FROM konta WHERE id = ?", [kierowcaID]);
			const [r2] = await db.execute("INSERT INTO customOsiagniecia (komu, nazwa, opis, ikona) VALUES (?, ?, ?, ?)", [kierowcaID, req.body.nazwa, req.body.opis, zdjPath]);
			if(r2.affectedRows){
				iluDodano = iluDodano + 1;
				// res.send({odp: "Dodano."});
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Dodanie osiągnięcia")
					.setDescription(`Użytkownik [${r[0].login}](https://system.thebossspedition.pl/profil/${r[0].login}) dodał personalne osiągnięcie użytkownikowi [${komu[0].login}](https://system.thebossspedition.pl/profil/${komu[0].login}).`)
					.setColor(0x03FF03)
					.addFields({name: "Nazwa:", value: req.body.nazwa})
					.addFields({name: "Opis:", value: req.body.opis})
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
				await dcbot.channels.cache.get(process.env.CHANNEL_OSIAGNIECIA).send({embeds: [embed1]});
				embed1.setDescription(`Użytkownik [${r[0].login}](https://system.thebossspedition.pl/profil/${r[0].login}) dodał Tobie personalne osiągnięcie.`);
				try {
					await dcbot.users.send(komu[0].discord, {embeds: [embed1]});
				} catch(erdd) {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${komu[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				} 
			} else {
				komuNienadano.push(kierowcaID);
			}
		};

		console.log(iluDodano, req.body.kierowcy.length);
		console.log((iluDodano == req.body.kierowcy.length))
		if(iluDodano == req.body.kierowcy.length){
			console.log("Pomyslnie")
			res.send({odp: "Pomyślnie nadano grupowe osiągnięcie."});
			return;
		} else {
			console.log("Czesciowo 1")
			res.send({
				blad: "Częściowe nadanie osiągnięć.",
				nieotrzymali: komuNienadano
			});
		}
	} catch(er2) {
		console.log("Grupowe osiagniecia:", er2.message);
		console.log("Nienadano: ", komuNienadano);
		res.send({
			blad: "Częsciowe nadanie osiągnięć.",
			nieotrzymali: komuNienadano
		});
		return;
	}
});

app.post("/szkolenia/:token/historia", async (req, res) => {
	const [kierowca] = await db.execute("SELECT id FROM konta WHERE token = ?", [req.params.token]);
	if(!kierowca.length){
		res.send({blad: "Sesja logowania wygasła. Odśwież stronę."});
		return;
	}
	const [ historia ] = await db.execute("SELECT * FROM szkolenieTicket WHERE kierowca = ? ORDER BY dataRozpoczecia DESC", [kierowca[0].id]);
	res.send({odp: historia});
	return;
});

app.get("/dostepneTypySzkolen", async (req, res) => {
	const [dostepne] = await db.execute("SELECT * FROM `typyuprawnien` WHERE rodzaj = 'Szkolenie' ORDER BY `id` ASC");
	res.send({odp: dostepne});
});

app.post("/szkolenia/:token/instruktor", async (req, res) => {
	const [ kierowca ] = await db.execute("SELECT id, login, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(!kierowca.length){
		res.send({blad: "Nieuprawniony dostęp. Odśwież stronę."});
		return;
	}
	if(kierowca[0].typkonta <= 3 && kierowca[0].typkonta >= 1){
		const [ dostepneZgloszenia ] = await db.execute("SELECT * FROM szkolenieTicket WHERE kierowca != ? ORDER BY CASE WHEN instruktor = ? AND status = 1 THEN 1 WHEN instruktor IS NOT NULL AND status = 1 THEN 3 WHEN instruktor IS NULL THEN 2 WHEN instruktor IS NOT NULL AND status = 2 THEN 4 ELSE 5 END, dataRozpoczecia ASC", [kierowca[0].id, kierowca[0].id]);
		if(dostepneZgloszenia.length){
			res.send({odp: dostepneZgloszenia});
			return;
		} else {
			res.send({odp: []});
			return;
		}
	}
	// instruktor widzi tylko to oczekujace lub przejete przez niego
	// if(kierowca[0].typkonta == 3){
	// 	const [ dostepneZgloszenia ] = await db.execute("SELECT * FROM szkolenieTicket WHERE kierowca != ? AND (instruktor IS NULL OR instruktor = ?) ORDER BY CASE WHEN instruktor IS NOT NULL AND status = 1 THEN 1 WHEN instruktor IS NULL THEN 2 WHEN instruktor IS NOT NULL AND status = 2 THEN 3 ELSE 4 END, dataRozpoczecia ASC", [kierowca[0].id, kierowca[0].id]);
	// 	if(dostepneZgloszenia.length){
	// 		res.send({odp: dostepneZgloszenia});
	// 		return;
	// 	} else {
	// 		res.send({odp: []});
	// 		return;
	// 	}
	// }
	res.send({blad: "Brak uprawnień instruktora."});
	return;
});

app.post("/szkolenia/:token/noweZgloszenie", async (req, res) => {
	const [ kierowca ] = await db.execute("SELECT id, login, discord FROM konta WHERE token = ?", [req.params.token]);
	if(!kierowca.length){
		res.send({blad: "Nieuprawniony dostęp. Odśwież stronę."});
		return;
	}
	const [ dodaj ] = await db.execute("INSERT INTO szkolenieTicket (status, kierowca, dataPrzypuszczalna, czyZnizka) VALUES (0, ?, ?, ?)", [kierowca[0].id, req.body.dataPrzypuszczalna ? new Date(req.body.dataPrzypuszczalna) : null, req.body.czyZnizka ? 1 : 0]);
	if(dodaj.affectedRows){
		// bulk insert lista uprawnien
		const bulkSql = "INSERT INTO szkolenieTicketUprawnienia (idTicketu, idUprawnienia, termin) VALUES "+req.body.listaUprawnien.map(upr => "(?, ?, ?)").join(", ");
		const bulkData = req.body.listaUprawnien.map(upr => ([dodaj.insertId, upr.uprawnienie, new Date(upr.termin)])).flat();
		try{
			const [ dodajUpr ] = await db.execute(bulkSql, bulkData);
			if(dodajUpr.affectedRows){
				res.send({odp: dodaj.insertId});
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Zgłoszenie szkolenia`)
					.setDescription(`Użytkownik [${kierowca[0].login}](https://system.thebossspedition.pl/profil/${kierowca[0].login}) utworzył nowe zgłoszenie [szkolenia #${dodaj.insertId}](https://system.thebossspedition.pl/szkolenie/${dodaj.insertId}).`)
					.setColor(0x01F10C)
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
				await dcbot.channels.cache.get(process.env.CHANNEL_SZKOLENIA).send({embeds: [embed1]});
				return;
			} else {
				res.send({blad: "Wystąpił błąd podczas zapisu listy uprawnień."});
				return;
			}
		}catch(err){
			console.log(err);
			res.send({blad: "Wystąpił błąd podczas zapisu listy uprawnień."});
			return;
		}
		return;
	} else {
		res.send({blad: "Wystąpił błąd bazy danych."});
		return;
	}
});

app.post("/szkolenieCzat/:token/:szkolenieId", async (req, res) => {
	let instruktor = false;
	const [ uzytkownik ] = await db.execute("SELECT id, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(uzytkownik.length){
		if(uzytkownik[0].typkonta <= 3) instruktor = true;
	} else {
		res.send({blad: "Niepoprawna sesja użytkownika."});
		return;
	}
	try {
		const [ szkolenie ] = await db.execute("SELECT * FROM szkolenieTicket WHERE id = ?", [req.params.szkolenieId]);
		if(szkolenie.length){
			let dostep = false;
			if(szkolenie[0].kierowca == uzytkownik[0].id) dostep = true;
			if(instruktor) dostep = true;
			// if(szkolenie[0].instruktor == uzytkownik[0].id && instruktor) dostep = true;
			// if(instruktor && uzytkownik[0].id != 3) dostep = true;
			if(!dostep){
				res.send({blad: "Nie jesteś uprawniony do odczytu historii wiadomości tego czatu."});
				return;
			}
			const [ historiaCzatu ] = await db.execute("SELECT * FROM szkolenieTicketCzat WHERE idTicketu = ? ORDER BY dataWyslania ASC", [req.params.szkolenieId]);
			res.send({odp: historiaCzatu});
		} else {
			res.send({blad: "Niepoprawny identyfikator zgłoszenia szkolenia."});
			return;
		}
	} catch(er) {
		console.log("Wystąpił błąd podczas sprawdzania historii wiadomości czatu szkolenia.", er);
		res.send({blad: "Wystąpił błąd bazy danych."});
		return;
	}
});

app.post("/szkolenieZakoncz/:token/:szkolenieId", async (req, res) => {
	const [ uzytkownik ] = await db.execute("SELECT id, typkonta, login FROM konta WHERE token = ?", [req.params.token]);
	if(!uzytkownik.length){
		res.send({blad: "Niepoprawna sesja użytkownika."});
		return;
	}
	const [ instruktorSzkolenia ] = await db.execute("SELECT kierowca, instruktor FROM szkolenieTicket WHERE id = ?", [req.params.szkolenieId]);
	if(!instruktorSzkolenia.length){
		res.send({blad: "Niepoprawny identyfikator zgłoszenia szkolenia."});
		return;
	}
	if(instruktorSzkolenia[0].kierowca === uzytkownik[0].id){
		try {
			const [ zamknij ] = await db.execute("DELETE FROM szkolenieTicket WHERE id = ?", [req.params.szkolenieId]);
			if(zamknij.affectedRows){
				res.send({odp: "Anulowano zgłoszenie."});
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Zgłoszenie szkolenia`)
					.setDescription(`Użytkownik [${uzytkownik[0].login}](https://system.thebossspedition.pl/profil/${uzytkownik[0].login}) anulował szkolenie #${req.params.szkolenieId}.`)
					.setColor(0xFF1E1E)
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
				await dcbot.channels.cache.get(process.env.CHANNEL_SZKOLENIA).send({embeds: [embed1]});
			} else {
				res.send({blad: "Wystąpił błąd bazy danych."});
			}
			await db.execute("DELETE FROM szkolenieTicketUprawnienia WHERE idTicketu = ?", [req.params.szkolenieId]);
		} catch(err){
			res.send({blad: "Wystąpił błąd bazy danych."});
		}
		return;
	}
	// if(instruktorSzkolenia[0].instruktor === uzytkownik[0].id){
	if(uzytkownik[0].typkonta <= 3){
		try {
			const [ zamknij ] = await db.execute("UPDATE szkolenieTicket SET status = 2, dataZakonczenia = ? WHERE id = ?", [new Date(), req.params.szkolenieId]);
			if(zamknij.affectedRows){
				res.send({odp: "Zamknięto zgłoszenie."});
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Zgłoszenie szkolenia`)
					.setDescription(`Użytkownik [${uzytkownik[0].login}](https://system.thebossspedition.pl/profil/${uzytkownik[0].login}) zakończył [szkolenie #${req.params.szkolenieId}](https://system.thebossspedition.pl/szkolenie/${req.params.szkolenieId}).`)
					.setColor(0xFF1E1E)
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
				await dcbot.channels.cache.get(process.env.CHANNEL_SZKOLENIA).send({embeds: [embed1]});
				const [dckierowcy] = await db.execute("SELECT discord, login FROM konta WHERE id = ?", [instruktorSzkolenia[0].kierowca]);
				if(!dckierowcy.length) return;
				if(!dckierowcy[0].discord) return;
				await dcbot.users.send(dckierowcy[0].discord, {embeds: [embed1]}).catch(async (er) => {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dckierowcy[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			} else {
				res.send({blad: "Wystąpił błąd bazy danych."});
			}
		} catch(err){
			res.send({blad: "Wystąpił błąd bazy danych."});
		}
		return;
	}
	res.send({blad: "Nie jesteś uprawniony do przeprowadzenia tej akcji."});
	return;
});

app.post("/szkoleniePrzejmij/:token/:szkolenieId", async (req, res) => {
	const [ uzytkownik ] = await db.execute("SELECT id, login, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(!uzytkownik.length){
		res.send({blad: "Niepoprawna sesja użytkownika."});
		return;
	}
	if(!(uzytkownik[0].typkonta >= 1 && uzytkownik[0].typkonta <= 3)){
		res.send({blad: "Nie jesteś uprawniony do tej akcji."});
		return;
	}
	const [ instruktorSzkolenia ] = await db.execute("SELECT instruktor, kierowca FROM szkolenieTicket WHERE id = ?", [req.params.szkolenieId]);
	if(!instruktorSzkolenia.length){
		res.send({blad: "Niepoprawny identyfikator zgłoszenia szkolenia."});
		return;
	}
	if(instruktorSzkolenia[0].instruktor === null){
		try {
			const [ zamknij ] = await db.execute("UPDATE szkolenieTicket SET status = 1, instruktor = ? WHERE id = ?", [uzytkownik[0].id, req.params.szkolenieId]);
			if(zamknij.affectedRows){
				res.send({odp: "Przejęto zgłoszenie."});
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Zgłoszenie szkolenia`)
					.setDescription(`Użytkownik [${uzytkownik[0].login}](https://system.thebossspedition.pl/profil/${uzytkownik[0].login}) przejął rolę Instruktora [szkolenia #${req.params.szkolenieId}](https://system.thebossspedition.pl/szkolenie/${req.params.szkolenieId}).`)
					.setColor(0x01F1AD)
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
				await dcbot.channels.cache.get(process.env.CHANNEL_SZKOLENIA).send({embeds: [embed1]});
				const [dckierowcy] = await db.execute("SELECT discord, login FROM konta WHERE id = ?", [instruktorSzkolenia[0].kierowca]);
				if(!dckierowcy.length) return;
				if(!dckierowcy[0].discord) return;
				await dcbot.users.send(dckierowcy[0].discord, {embeds: [embed1]}).catch(async (er) => {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dckierowcy[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			} else {
				res.send({blad: "Wystąpił błąd bazy danych."});
			}
		} catch(err){
			res.send({blad: "Wystąpił błąd bazy danych."});
		}
		return;
	} else {
		res.send({blad: "Zgłoszenie dotyczące szkolenia posiada już instruktora."});
		return;
	}
});

app.post("/zmienStatusUprSzkolenie/:szkolenieId/:token", async (req, res) => {
	if(!req.params.token){
		res.send({blad: "Brak tokenu użytkownika."});
		return;
	}
	if(!req.params.szkolenieId){
		res.send({blad: "Brak identyfikatora szkolenia."});
		return;
	}
	const [ instruktor ] = await db.execute("SELECT id, typkonta, login FROM konta WHERE token = ?", [req.params.token]);
	if(instruktor.length){
		if(!(instruktor[0].typkonta <= 3)){
			res.send({blad: "Nie posiadasz rangi instruktora."});
			return;
		}
	} else {
		res.send({blad: "Niepoprawna sesja użytkownika."});
		return;
	}
	const [ aktualizuj ] = await db.execute("UPDATE `szkolenieTicketUprawnienia` SET `nadane` = ? WHERE `idTicketu` = ? AND `id` = ?", [(req.body.nadane == true) ? 1 : 0, req.params.szkolenieId, req.body.idupr]);
	if(aktualizuj.affectedRows > 0){
		res.send({odp: "Status uprawnienia został zmieniony."});
		// powiadomienie
		const [ uprawnienie ] = await db.execute("SELECT nazwa, rodzaj, gra FROM typyuprawnien WHERE id = (SELECT idUprawnienia FROM szkolenieTicketUprawnienia WHERE id = ?)", [req.body.idupr]);
		if(!uprawnienie.length) return;
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Zgłoszenie szkolenia`)
			.setDescription(`Użytkownik [${instruktor[0].login}](https://system.thebossspedition.pl/profil/${instruktor[0].login}) zmienił status uprawnienia:\n**[${uprawnienie[0].rodzaj}] ${uprawnienie[0].gra ? "ATS" : "ETS2"} - ${uprawnienie[0].nazwa}**\nw [szkoleniu #${req.params.szkolenieId}](https://system.thebossspedition.pl/szkolenie/${req.params.szkolenieId}) na **${req.body.nadane ? "Nadane" : "Oczekujące"}**.`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await dcbot.channels.cache.get(process.env.CHANNEL_SZKOLENIA).send({embeds: [embed1]});

		const [ odbiorca ] = await db.execute("SELECT login, discord FROM konta WHERE (SELECT kierowca FROM szkolenieTicket WHERE id = ?)", [req.params.szkolenieId]);
		if(!odbiorca.length) return;
		if(!odbiorca[0].discord) return;
		await dcbot.users.send(odbiorca[0].discord, {embeds: [embed1]}).catch(async (er) => {
			try {
				await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${odbiorca[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
			} catch(erdc){
				console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
			}
		});
		return;
	} else {
		res.send({blad: "Baza nie zaktualizowała żadnego rekordu."});
		return;
	}
});

app.post("/szkolenie/:token/:szkolenieId", async (req, res) => {
	let instruktor = false;
	let wlascicielSzkolenia = false;
	let czySzkolenieMaInstruktora = false;
	let czyUzytkownikJestInstruktoremSzkolenia = false;
	const [ uzytkownik ] = await db.execute("SELECT id, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(uzytkownik.length){
		if(uzytkownik[0].typkonta <= 3) instruktor = true;
	} else {
		res.send({blad: "Niepoprawna sesja użytkownika."});
		return;
	}
	try {
		const [ szkolenie ] = await db.execute("SELECT * FROM szkolenieTicket WHERE id = ?", [req.params.szkolenieId]);
		if(szkolenie.length){
			const [ uprawnieniaSzkolenia ] = await db.execute("SELECT * FROM szkolenieTicketUprawnienia WHERE idTicketu = ?", [req.params.szkolenieId]);
			if(szkolenie[0].kierowca == uzytkownik[0].id) wlascicielSzkolenia = true;
			if(szkolenie[0].instruktor) czySzkolenieMaInstruktora = true;
			if(szkolenie[0].instruktor == uzytkownik[0].id && instruktor) czyUzytkownikJestInstruktoremSzkolenia = true;
			if(wlascicielSzkolenia){
				res.send({dostep: true, rolaInstruktora: false, informacje: szkolenie[0], uprawnienia: uprawnieniaSzkolenia});
				return;
			} else {
				if(instruktor){
					if(czySzkolenieMaInstruktora){
						if(czyUzytkownikJestInstruktoremSzkolenia){
							res.send({dostep: true, rolaInstruktora: true, informacje: szkolenie[0], uprawnienia: uprawnieniaSzkolenia});
							return;
						} else {
							res.send({dostep: true, rolaInstruktora: true, informacje: szkolenie[0], uprawnienia: uprawnieniaSzkolenia});
							// if(uzytkownik[0].typkonta != 3){
							// 	res.send({dostep: true, rolaInstruktora: false, informacje: szkolenie[0], uprawnienia: uprawnieniaSzkolenia});
							// } else {
							// 	res.send({dostep: false, rolaInstruktora: true, informacje: undefined, uprawnienia: undefined, blad: "Zgłoszenie przejęte przez innego Instruktora."});
							// }
							return;
						}
					} else {
						res.send({dostep: true, rolaInstruktora: true, informacje: szkolenie[0], uprawnienia: uprawnieniaSzkolenia});
						return;
					}
				} else {
					res.send({dostep: false, rolaInstruktora: false, informacje: undefined, uprawnienia: undefined, blad: "Nie jesteś właścicielem zgłoszenia lub nie posiadasz uprawnień Instruktora."});
					return;
				}
			}
		} else {
			res.send({dostep: false, rolaInstruktora: false, informacje: undefined, uprawnienia: undefined, blad: "Niepoprawny identyfikator zgłoszenia szkolenia."});
			return;
		}
	} catch(er) {
		console.log("Wystąpił błąd podczas sprawdzania uprawnień do odczytu zgłoszenia szkolenia.", er);
		res.send({dostep: false, rolaInstruktora: false, informacje: undefined, uprawnienia: undefined, blad: "Wystąpił błąd bazy danych."});
		return;
	}
});

app.get("/zdjecieMiesiaca", async (req, res) => {
	const [dane] = await db.execute("SELECT nazwa, wartosc FROM ustawienia WHERE nazwa IN (?, ?, ?, ?)", ["zdjMiesiacaPlik", "zdjMiesiacaAutor", "zdjMiesiacaOpis", "zdjMiesiacaData"]);
	const odp = dane.reduce((row, value) => {
			row[value.nazwa] = !value.wartosc ? undefined : value.wartosc
			return row
		}, {})
	if(odp.zdjMiesiacaAutor){
		const [ autorInfo ] = await db.execute("SELECT id, login, awatar FROM konta WHERE id = ?", [ odp.zdjMiesiacaAutor ]);
		if(autorInfo.length){
			odp['autor'] = {
				'id': autorInfo[0].id,
				'login': autorInfo[0].login,
				'awatar': autorInfo[0].awatar
			}
		}
	}
	res.send(odp);
});

app.delete("/zdjecieMiesiaca/:token", async (req, res) => {
	// od 2 rangi w dol
	if(!req.params.token){
		res.status(400).json({error: "Nieautoryzowany"});
		return;
	}
	const [ uprCheck ] = await db.execute("SELECT login, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(!uprCheck.length){
		res.status(403).json({error: "Nieuprawniony"});
		return;
	}
	const [ aktualneZdj ] = await db.execute("SELECT nazwa, wartosc FROM ustawienia WHERE nazwa IN (?, ?, ?, ?)", ["zdjMiesiacaPlik", "zdjMiesiacaAutor", "zdjMiesiacaOpis", "zdjMiesiacaData"]);
	const aktZdj = aktualneZdj.reduce((row, value) => {
		row[value.nazwa] = !value.wartosc ? undefined : value.wartosc
		return row
	}, {});
	if(aktZdj.zdjMiesiacaPlik){
		unlink(aktZdj.zdjMiesiacaPlik, (err) => { console.log("bład usuwania zdjęcia miesiąca...", err)});
	}
	const [ usuwanie ] = await db.execute("UPDATE ustawienia SET wartosc = '' WHERE nazwa IN (?, ?, ?, ?)", ["zdjMiesiacaPlik", "zdjMiesiacaAutor", "zdjMiesiacaOpis", "zdjMiesiacaData"]);
	if(usuwanie.affectedRows){
		res.status(200).json({odp: "Pomyślnie usunięto zdjęcie miesiąca."});
		return;
	} else {
		res.status(500).json({error: "Wystąpił błąd bazy danych."});
		return;
	}
});

app.post("/zdjecieMiesiaca/:token", upload.single("zdjMiesiacaImg"), async (req, res) => {
	if(!req.params.token){
		res.status(400).json({error: "Nieautoryzowany"});
		return;
	}
	const [ uprCheck ] = await db.execute("SELECT login, typkonta FROM konta WHERE token = ?", [req.params.token]);
	if(!uprCheck.length){
		res.status(403).json({error: "Nieuprawniony"});
		return;
	}
	if(!req.file){
		res.status(400).json({error: "Brak przesłanego zdjęcia"});
		return;
	}
	const [ aktualneZdj ] = await db.execute("SELECT nazwa, wartosc FROM ustawienia WHERE nazwa IN (?, ?, ?, ?)", ["zdjMiesiacaPlik", "zdjMiesiacaAutor", "zdjMiesiacaOpis", "zdjMiesiacaData"]);
	const aktZdj = aktualneZdj.reduce((row, value) => {	
		row[value.nazwa] = !value.wartosc ? undefined : value.wartosc
		return row
	}, {});
	const nowyPath = req.file.destination + req.file.filename;
	const [ zmienZdj ] = await db.execute("UPDATE ustawienia SET wartosc = ? WHERE nazwa = 'zdjMiesiacaPlik'", [nowyPath]);
	if(!zmienZdj.affectedRows){
		res.status(500).json({error: "Nieustawiono ścieżki zdjęcia w bazie."});
		return;
	}
	//usun poprzedni
	if(aktZdj.zdjMiesiacaPlik){
		unlink(aktZdj.zdjMiesiacaPlik, (err) => { console.log("bład usuwania zdjęcia miesiąca...", err)});
	}
	const [ zmienDate ] = await db.execute("UPDATE ustawienia SET wartosc = ? WHERE nazwa = 'zdjMiesiacaData'", [ req.body.month ]);
	if(!zmienDate.affectedRows){
		res.status(500).json({error: "Błąd ustawienia daty zdjęcia w bazie."});
		return;
	}
	const [ zmienOpis ] = await db.execute("UPDATE ustawienia SET wartosc = ? WHERE nazwa = 'zdjMiesiacaOpis'", [ req.body.description ?? "" ]);
	if(!zmienOpis.affectedRows){
		res.status(500).json({error: "Błąd ustawienia opisu zdjęcia w bazie."});
		return;
	}
	const [ zmienAutora ] = await db.execute("UPDATE ustawienia SET wartosc = ? WHERE nazwa = 'zdjMiesiacaAutor'", [ req.body.author ]);
	if(!zmienAutora.affectedRows){
		res.status(500).json({error: "Błąd ustawienia autora zdjęcia w bazie."});
		return;
	}
	res.status(200).json({odp: "Pomyślnie ustawiono zdjęcie miesiąca."});
})

let telemetriaPowiazania = [
	// {
	// 	login: "sotiio",
	// 	token: "xxx"
	// }
];
try {
	const [r] = await db.query("SELECT * FROM `telemetriaPowiazania`");
	if(r.length > 0){
		r.forEach(v => {
			telemetriaPowiazania.push({login: v['uzytkownik'], token: v['token']});
		});
		console.log("Pomyślnie załadowano telemetriaPowiazania: ", telemetriaPowiazania.length);
	};
} catch(er){
	console.log("Błąd wczytania telemetriaPowiazania");
	console.log(er);
}

const powiazanieTelemetria = (token) => {
	const tmp = telemetriaPowiazania.find(v => v.token == token);
	if(tmp === undefined){
		return false;
	} else {
		return tmp.login;
	}
};
let telemetriaInformacje = [];
try {
	const [r] = await db.query("SELECT * FROM `telemetriaInformacje`");
	if(r.length > 0){
		r.forEach(v => {
			let tmpObj = {};
			tmpObj.login = v['login'];
			tmpObj.kiedy = v['kiedy'];
			if(v['ciezarowka']){
				tmpObj.ciezarowka = JSON.parse(zlib.inflateRawSync(Buffer.from(v['ciezarowka'], 'base64')).toString())
			}
			if(v['naczepa']){
				tmpObj.naczepa = JSON.parse(zlib.inflateRawSync(Buffer.from(v['naczepa'], 'base64')).toString())
			}
			if(v['praca']){
				tmpObj.praca = JSON.parse(zlib.inflateRawSync(Buffer.from(v['praca'], 'base64')).toString())
			}
			if(v['pozycja']){
				tmpObj.pozycja = JSON.parse(zlib.inflateRawSync(Buffer.from(v['pozycja'], 'base64')).toString())
			}
			telemetriaInformacje.push(tmpObj);
		});
		console.log("Wczytano telemetriaInformacje: ", r.length);
	};
} catch(er) {
	console.log("BŁĄD WCZYTANIA telemetriaInformacje");
	console.log(er);
}

const zapiszTelemetrieBaza = async () => {
	await db.execute("TRUNCATE TABLE `telemetriaInformacje`");
	telemetriaInformacje.map(async kierowca => {
		try {
			await db.execute("INSERT INTO `telemetriaInformacje` (`login`, `ciezarowka`, `naczepa`, `pozycja`, `praca`, `kiedy`) VALUES (?, ?, ?, ?, ?, ?)", [
				kierowca.login,
				kierowca.ciezarowka ? zlib.deflateRawSync(JSON.stringify(kierowca.ciezarowka)).toString('base64') : null,
				kierowca.naczepa ? zlib.deflateRawSync(JSON.stringify(kierowca.naczepa)).toString('base64') : null,
				kierowca.pozycja ? zlib.deflateRawSync(JSON.stringify(kierowca.pozycja)).toString('base64') : null,
				kierowca.praca ? zlib.deflateRawSync(JSON.stringify(kierowca.praca)).toString('base64') : null,
				kierowca.kiedy ? new Date(kierowca.kiedy) : null
			]);
		} catch(er) {
			console.log("BŁĄD ZAPISANIA telemetriaInformacje kierowcy", kierowca);
			console.log(er);
			return;
		}
	});
	return;
};

const indexDaneTelemetria = (login) => {
	const tmp = telemetriaInformacje.findIndex(v => v.login == login);
	return tmp;
};

const zapiszTelemetriaInne = async (token, typ, kwota, akcja) => {
	try {
		const [r] = await db.execute("SELECT `id`, `login`, `discord` FROM `konta` WHERE `login` = (SELECT `uzytkownik` FROM `telemetriaPowiazania` WHERE `token` = ?) ", [token]);
		if(r.length > 0){
			try{
				const [r2] = await db.execute("INSERT INTO `telemetriaPozostale` (kto, typ, kwota, kiedy, custom) VALUES (?, ?, ?, ?, ?)", [r[0].id, typ, kwota, new Date(), akcja]);
				if(r2.affectedRows > 0){
					//gyt
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Zdarzenie - ${typ}`)
						.setDescription(`Użytkownik [${r[0]['login']}](https://system.thebossspedition.pl/profil/${r[0]['login']}) ${akcja}`)
						.setColor(0x01F1AD)
						.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
					await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
				}
			} catch(er2) {
				console.log(`Błąd zapisu ${typ} dla ${r[0].login}. Powód: ${er2.message}`);
				return;
			}
		} else {
			console.log(`BŁAD ZAPISU ${typ} - Nieznany uzytkownik ?`);
			return;
		}
	} catch(er) {
		console.log(`BŁAD ZAPISU ${typ} - Nieznany uzytkownik ?`);
		console.log(er);
		return;
	}
}

/* Tymczasowe: KTO JEDZIE NA JAKIEJ MAPIE
{ login: "a", gra: "ATS", promods: false} */
let infoModyfikacje = [];
try {
	const [r] = await db.query("SELECT * FROM `telemetriaModyfikacje`");
	if(r.length > 0){
		r.forEach(v => {
			let tmpObj = {};
			tmpObj.login = v['login'];
			tmpObj.gra = v['gra'];
			tmpObj.promods = v['promods'];
			infoModyfikacje.push(tmpObj);
		});
		console.log("Wczytano telemetriaModyfikacje: ", r.length);
	};
} catch(er) {
	console.log("BŁĄD WCZYTANIA telemetriaModyfikacje");
	console.log(er);
}
const zapiszTelemetrieModyfikacje = async () => {
	await db.execute("TRUNCATE TABLE `telemetriaModyfikacje`");
	infoModyfikacje.map(async kierowca => {
		try {
			await db.execute("INSERT INTO `telemetriaModyfikacje` (`login`, `gra`, `promods`) VALUES (?, ?, ?)",	[
				kierowca.login,
				kierowca.gra,
				kierowca.promods
			]);
		} catch(er) {
			console.log("BŁĄD ZAPISANIA telemetriaModyfikacje kierowcy", kierowca);
			console.log(er);
			return;
		}
	});
	return;
};

const zwrocTypGry = (login) => {
	const tmp = infoModyfikacje.find(v => v.login == login);
	if(tmp === undefined){
		return "ETS2";
	} else {
		if(tmp.gra == "ATS"){
			return "ATS";
		} else {
			if(tmp.promods){
				return "PROMODS";
			} else {
				return "ETS2";
			}
		}
	}
};

setInterval(async () => {
	await zapiszTelemetrieBaza();
	await zapiszTelemetrieModyfikacje();
}, 2 * 60 * 60 * 1000); //co 2h: 2 * 60 * 60 * 1000, co 30sec 30 * 1000

let aktywniUzytkownicyCzatu = [];
/* {
	idCzatu: "szkolenie_15",
	uzytkownicy: [
		{ login: "sotiio", id: 1, socketId: "xxx"},
		{}
	]
} */

io.on('connection', (socket) => {
	console.log("socket: nowe polaczenie");

	socket.on("disconnect", () => {
		console.log("socket: ktos sie rozlaczyl, socketId:", socket.id);
		aktywniUzytkownicyCzatu.forEach(czat => {
			czat.uzytkownicy = czat.uzytkownicy.filter(uczestnik => uczestnik.socketId !== socket.id);
		});
	});

	socket.on("czatSzkolenieDolacz", async (msg) => {
		console.log("dolaczenie do szkolenie_"+msg.szkolenieId.toString())
		socket.join("szkolenie_"+msg.szkolenieId.toString());
		const znajdzRoom = aktywniUzytkownicyCzatu.findIndex(x => x.idCzatu === "szkolenie_"+msg.szkolenieId.toString());
		const [ daneUzytkownika ] = await db.execute("SELECT id, login, discord FROM konta WHERE token = ?", [msg.token]);
		if(!daneUzytkownika.length) return;
		if(znajdzRoom === -1){
			aktywniUzytkownicyCzatu.push({
				idCzatu: "szkolenie_"+msg.szkolenieId.toString(),
				uzytkownicy: [{login: daneUzytkownika[0].login, id: daneUzytkownika[0].id, discord: daneUzytkownika[0].discord, socketId: socket.id}]
			});
		} else {
			const znajdzUser = aktywniUzytkownicyCzatu[znajdzRoom].uzytkownicy.findIndex(x => x.id === daneUzytkownika[0].id);
			if(znajdzUser === -1){
				aktywniUzytkownicyCzatu[znajdzRoom].uzytkownicy.push({login: daneUzytkownika[0].login, id: daneUzytkownika[0].id, discord: daneUzytkownika[0].discord, socketId: socket.id})
			}  else {
				aktywniUzytkownicyCzatu[znajdzRoom].uzytkownicy[znajdzUser] = {login: daneUzytkownika[0].login, id: daneUzytkownika[0].id, discord: daneUzytkownika[0].discord, socketId: socket.id};
			}
		}
	});

	socket.on("czatSzkolenieWyslij", async (msg) => {
		const [ idUzytkownika ] = await db.execute("SELECT id, login FROM konta WHERE token = ?", [msg.token]);
		if(!idUzytkownika.length) return;
		const dataWiadomosci = new Date();
		io.to("szkolenie_"+msg.szkolenieId.toString()).emit("czatSzkolenieOdbierz", {
			login: idUzytkownika[0].login,
			uzytkownik: idUzytkownika[0].id,
			dataWyslania: dataWiadomosci,
			wiadomosc: msg.wiadomosc
		});
		await db.execute("INSERT INTO szkolenieTicketCzat (idTicketu, uzytkownik, wiadomosc, dataWyslania) VALUES (?, ?, ?, ?)", [msg.szkolenieId, idUzytkownika[0].id, msg.wiadomosc, dataWiadomosci]);
		const [ uczestnicySzkolenia ] = await db.execute("SELECT kierowca, instruktor FROM szkolenieTicket WHERE id = ?", [msg.szkolenieId]);
		let ktorePole = "kierowca";
		// wybierz kierowce / instruktor gdzie id tej osoby jest inne niz twoje.
		if(uczestnicySzkolenia[0].kierowca === idUzytkownika[0].id) ktorePole = "instruktor";
		const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Zgłoszenie szkolenia`)
			.setDescription(`Użytkownik [${idUzytkownika[0].login}](https://system.thebossspedition.pl/profil/${idUzytkownika[0].login}) wysłał wiadomość w zgłoszeniu [szkolenia #${msg.szkolenieId}](https://system.thebossspedition.pl/szkolenie/${msg.szkolenieId}).\n-# Treść:\n${msg.wiadomosc}\n-# ${new Date(dataWiadomosci).toLocaleString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "numeric", month: "long"})}`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await dcbot.channels.cache.get(process.env.CHANNEL_SZKOLENIA).send({embeds: [embed1]});
		// zrobic powiadomienie DC do DRUGIEJ osoby
		const znajdzCzat = aktywniUzytkownicyCzatu.find(czat => czat.idCzatu === "szkolenie_"+msg.szkolenieId.toString());
		if(znajdzCzat !== undefined){
			const znajdzDrugiego = znajdzCzat.uzytkownicy.find(user => user.id === uczestnicySzkolenia[0][ktorePole]);
			if(znajdzDrugiego === undefined){
				// sprawdz czy ma DC i wyslij wiadomosc dc
				const [dcosoby] = await db.execute("SELECT login, discord FROM konta WHERE id = ?", [uczestnicySzkolenia[0][ktorePole]]);
				if(!dcosoby.length) return;
				if(!dcosoby[0].discord) return;
				await dcbot.users.send(dcosoby[0].discord, {embeds: [embed1]}).catch(async (er) => {
					try {
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dcosoby[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					} catch(erdc){
						console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
					}
				});
			}
			// else {
			// 	console.log("Drugi uczestnik czatu szkolenie_XX jest aktywny", znajdzDrugiego);
			// }
		}
	});

	socket.on("/", (msg) => {
		console.log("Telemetria:", msg);
	});

	socket.on("poprosModyfikacje", (msg) => {
		socket.emit("otrzymajModyfikacje", infoModyfikacje);
	})

	socket.on("modyfikacje", async (msg) => {
		const tmpDane = JSON.parse(msg);
		const tmpLogin = powiazanieTelemetria(tmpDane.token);
		if(!tmpLogin) return;
		const tmpIndex = infoModyfikacje.findIndex(v => v.login === tmpLogin);
		if(tmpIndex === -1){
			infoModyfikacje.push({login: tmpLogin, promods: tmpDane.promods, gra: tmpDane.gra});
		} else {
			infoModyfikacje[tmpIndex].promods = tmpDane.promods;
			infoModyfikacje[tmpIndex].gra = tmpDane.gra;
		}
		io.emit("otrzymajModyfikacje", infoModyfikacje);
		if(tmpDane.blad){
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle(`Odczyt modyfikacji`)
				.setDescription(`Wystąpił błąd podczas odczytu modyfikacji gry u kierowcy [${tmpLogin}](https://system.thebossspedition.pl/profil/${tmpLogin}).\nPowód: **${tmpDane.blad}**`)
				.setColor(0xFF0000)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
			const [r] = await db.execute("SELECT discord FROM konta WHERE login = ?", [tmpLogin]);
			if(r.length > 0){
				if(r[0].discord){
					embed1.setDescription(`Wystąpił błąd podczas odczytu modyfikacji gry Euro Truck Simulator 2.\nPowód: **${tmpDane.blad}**`)
					await dcbot.users.send(r[0].discord, {embeds: [embed1]}).catch(async (erdd) => {
						try {
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${r[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						} catch(erdc){
							console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
						}
					});
				}
			}
		}
		console.log(tmpDane);
	})

	socket.on("pozycja", (msg) => {
		const tmpDane = JSON.parse(msg);
		const tmpLogin = powiazanieTelemetria(tmpDane.token);
		if(!tmpLogin) return;
		let tmpObj = {
			positionX: tmpDane.positionX,
			positionY: tmpDane.positionY,
			positionZ: tmpDane.positionZ,
			heading: tmpDane.heading,
			pitch: tmpDane.pitch,
			roll: tmpDane.roll,
			silnikWlaczony: tmpDane.silnikWlaczony,
			speed: tmpDane.speed,
			rpm: tmpDane.rpm,
			gear: tmpDane.gear,
			fuelavg: tmpDane.fuelavg,
			fuel: tmpDane.fuel
		};
		const tmpIndex = indexDaneTelemetria(tmpLogin);
		if(tmpIndex === -1){
			telemetriaInformacje.push({login: tmpLogin, kiedy: Date.now(), pozycja: tmpObj});
		} else {
			telemetriaInformacje[tmpIndex].pozycja = tmpObj;
			telemetriaInformacje[tmpIndex].kiedy = Date.now();
		}
		// console.log(telemetriaInformacje);
		io.emit("otrzymajPozycje", telemetriaInformacje);
	});

	socket.on("mandat", (msg) => {
		//PRZESTARZAŁE, TO POPRAWNE JEST W EVENTACH
		let tmpKierowca = powiazanieTelemetria(msg.token);
		if(!tmpKierowca) return;
		let tmpObj = {
			'pozycjaX': msg.pozycjaX,
			'pozycjaY': msg.pozycjaZ,
			'typ': null,
			'kwota': null,
			'kto': tmpKierowca
		};
		console.log(msg);
		//powiadomiene DC: CHANNEL_TELEMETRIA

		//jesli to jest mandat za predkosc lub czerwone swiatla lub unikanie wagi - opoznione powiadomienie w systemie

		//powiadomienie DC: pw
	});

	socket.on("paliwo", async (msg) => {
		const tmpObj = JSON.parse(msg);
		const tmpKierowca = powiazanieTelemetria(tmpObj.token);
		if(!tmpKierowca) return;
		let istotneDane = {
			'pozycjaX': Number(tmpObj.pozycjaX),
			'pozycjaY': Number(tmpObj.pozycjaZ),
			'litry': Number(Number(tmpObj.litry) + 0.35).toFixed(2),
			'kraj': null,
			'znizka': false,
			'kwota': null,
			'kto': tmpKierowca,
			'kiedy': Date.now()
		};
		const marginesBledu = {
			'garaz': 50,
			'stacja': 25
		};

		const gra = zwrocTypGry(tmpKierowca);

		let najblizsze = {odleglosc: null, kraj: null, miasto: null};
		let najblizszyGaraz = null;
		let najblizszaStacja = null;

		if(gra == "ETS2"){
			miastaTelemetria.map((miasto) => {
				 const odl = Math.pow(((Math.pow(miasto.X - istotneDane.pozycjaX, 2) + Math.pow(miasto.Y - istotneDane.pozycjaY, 2))), 0.5);
				 if(najblizsze.odleglosc === null || odl < najblizsze.odleglosc){
					 najblizsze.odleglosc = odl;
					 najblizsze.kraj = miasto.Country.toLowerCase();
					istotneDane.kraj = miasto.Country;
					 najblizsze.miasto = miasto.Name;
				 }
			});
		}
		if(gra == "ATS"){
			miastaTelemetriaATS.map((miasto) => {
				const odl = Math.pow(((Math.pow(miasto.X - istotneDane.pozycjaX, 2) + Math.pow(miasto.Y - istotneDane.pozycjaY, 2))), 0.5);
				if(najblizsze.odleglosc === null || odl < najblizsze.odleglosc){
					najblizsze.odleglosc = odl;
					najblizsze.kraj = miasto.Country.toLowerCase();
				   istotneDane.kraj = miasto.Country;
					najblizsze.miasto = miasto.Name;
				}
		   });
		}
		if(gra == "PROMODS"){
			miastaTelemetriaPROMODS.map((miasto) => {
				const odl = Math.pow(((Math.pow(miasto.X - istotneDane.pozycjaX, 2) + Math.pow(miasto.Y - istotneDane.pozycjaY, 2))), 0.5);
				if(najblizsze.odleglosc === null || odl < najblizsze.odleglosc){
					najblizsze.odleglosc = odl;
					najblizsze.kraj = miasto.Country.toLowerCase();
				   istotneDane.kraj = miasto.Country;
					najblizsze.miasto = miasto.Name;
				}
		   });
		}
		
		let znajdzStawke;
		if(gra == "ATS"){
			znajdzStawke = stawkiPanstwaTelemetriaATS.find((v) => v.name.toLowerCase() == najblizsze.kraj);
		} else {
			znajdzStawke = stawkiPanstwaTelemetria.find((v) => v.name.toLowerCase() == najblizsze.kraj);
		} 
		istotneDane.kwota = Number(istotneDane.litry) * Number(znajdzStawke ? znajdzStawke.stawka : 2);
		istotneDane.kwota = Number(istotneDane.kwota).toFixed(2);
		
		if(gra == "ETS2"){
			overlayeTelemetria.map((ikonka) => {
				if(ikonka.Type === "Fuel"){
					const odl = Math.pow(((Math.pow(ikonka.X - istotneDane.pozycjaX, 2) + Math.pow(ikonka.Y - istotneDane.pozycjaY, 2))), 0.5);
					if(najblizszaStacja === null || odl < najblizszaStacja){
						najblizszaStacja = odl;
					}
				}
				if(ikonka.Type === "Garage"){
					const odl = Math.pow(((Math.pow(ikonka.X - istotneDane.pozycjaX, 2) + Math.pow(ikonka.Y - istotneDane.pozycjaY, 2))), 0.5);
					if(najblizszyGaraz === null || odl < najblizszyGaraz){
						najblizszyGaraz = odl;
					}
				}	
			});
		}

		if(gra == "ATS"){
			overlayeTelemetriaATS.map((ikonka) => {
				if(ikonka.Type === "Fuel"){
					const odl = Math.pow(((Math.pow(ikonka.X - istotneDane.pozycjaX, 2) + Math.pow(ikonka.Y - istotneDane.pozycjaY, 2))), 0.5);
					if(najblizszaStacja === null || odl < najblizszaStacja){
						najblizszaStacja = odl;
					}
				}
				if(ikonka.Type === "Garage"){
					const odl = Math.pow(((Math.pow(ikonka.X - istotneDane.pozycjaX, 2) + Math.pow(ikonka.Y - istotneDane.pozycjaY, 2))), 0.5);
					if(najblizszyGaraz === null || odl < najblizszyGaraz){
						najblizszyGaraz = odl;
					}
				}	
			});
		}

		if(gra == "PROMODS"){
			overlayeTelemetriaPROMODS.map((ikonka) => {
				if(ikonka.Type === "Fuel"){
					const odl = Math.pow(((Math.pow(ikonka.X - istotneDane.pozycjaX, 2) + Math.pow(ikonka.Y - istotneDane.pozycjaY, 2))), 0.5);
					if(najblizszaStacja === null || odl < najblizszaStacja){
						najblizszaStacja = odl;
					}
				}
				if(ikonka.Type === "Garage"){
					const odl = Math.pow(((Math.pow(ikonka.X - istotneDane.pozycjaX, 2) + Math.pow(ikonka.Y - istotneDane.pozycjaY, 2))), 0.5);
					if(najblizszyGaraz === null || odl < najblizszyGaraz){
						najblizszyGaraz = odl;
					}
				}	
			});
		}

		if(najblizszaStacja <= Number(marginesBledu.stacja) && najblizszyGaraz <= Number(marginesBledu.garaz)){
			istotneDane.znizka = true;
			istotneDane.kwota = Number(istotneDane.kwota * 0.85).toFixed(2);
		}

		// zapisz do bazy danych
		try {
			const [r] = await db.execute("SELECT `id`, `login`, `discord` FROM `konta` WHERE `login` = (SELECT `uzytkownik` FROM `telemetriaPowiazania` WHERE `token` = ?) ", [tmpObj.token]);
			if(r.length > 0){
				try {
					const [r2] = await db.execute("INSERT INTO `telemetriaPaliwo` (`kierowca_id`, `pozycjaX`, `pozycjaY`, `litry`, `kwota`, `znizka`, `kraj`, `miasto`, `kiedy`, `gra`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [r[0].id, istotneDane.pozycjaX, istotneDane.pozycjaY, istotneDane.litry, istotneDane.kwota, istotneDane.znizka, najblizsze.kraj, najblizsze.miasto, new Date(istotneDane.kiedy), gra]);
					if(r2.affectedRows > 0) {
						console.log("Dodano zatankowane paliwo do bazy danych");
						const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Tankowanie paliwa")
							.setDescription(`Użytkownik [${r[0]['login']}](https://system.thebossspedition.pl/profil/${r[0]['login']}) zatankował ${istotneDane.litry} l za kwotę ${istotneDane.kwota} zł`)
							.addFields({name: "Najbliższe miasto według pozycji:", value: `${najblizsze.miasto}, ${najblizsze.kraj} (Odl: ${parseInt(najblizsze.odleglosc)})`, inline: true})
							.addFields({name: 'Uwzględniona zniżka:', value: `${istotneDane.znizka ? "Tak" : "Nie"}, (Odl. do garażu: ${parseInt(najblizszyGaraz)})`, inline: true})
							.addFields({name: "Stawka za litr:", value: znajdzStawke ? `${znajdzStawke.stawka} zł` : "2,00 zł (Domyślna wartość)", inline: true})
							.addFields({name: "Gra:", value: gra, inline: true})
							.setColor(0x01F1AD)
							.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
						await dcbot.channels.cache.get(process.env.CHANNEL_PALIWO).send({embeds: [embed1]});
						if(r[0].discord){
							embed1.setDescription(`Zatankowano ${istotneDane.litry} l za kwotę ${istotneDane.kwota} zł`)
							await dcbot.users.send(r[0].discord, {embeds: [embed1]}).catch(async (erdd) => {
								try {
									await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${r[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
								} catch(erdc){
									console.log("NIEUDANE POINFORMOWANIE DISCORD", erdc);
								}
							});
						}
						//return;
					}
					// osiagniecie instrybutor id 4 tankowanie paliwa
					await sqlOsiagniecia(r[0].id, 4, parseFloat(istotneDane.litry));
					return;
				} catch(er2) {
					console.log("WYSTĄPIŁ BŁĄD Z ZAPISANIEM ZATANKOWANEGO PALIWA!");
					console.log(istotneDane);
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Tankowanie paliwa - Błąd zapisu")
						.setDescription(JSON.stringify(istotneDane)+"\r\n"+er2.sqlMessage)
						.setColor(0xFF0000)
						.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
					await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
					console.log(er2);
					return;
				}
			} else {
				console.log("BŁAD ZAPISU TANKOWANEGO PALIWA - Nie moge znalezc ID z tabeli konta dla ", tmpKierowca);
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Tankowanie paliwa - Błąd zapisu")
						.setDescription(`Użytkownik ${tmpKierowca} zatankował ${istotneDane.litry} l za kwotę ${istotneDane.kwota} zł, ale nie można odnaleźć identyfikatora kierowcy w bazie danych. Wygenerowanie nowego tokenu telemetrii przez użytkownika powinno rozwiązać ten problem.`)
						.setColor(0xFF0000)
						.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
						await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
				return;
			}
		} catch(er) {
			console.log("BŁAD ZAPISU TANKOWANEGO PALIWA - Nieznany uzytkownik ?");
			console.log(er);
			return;
		}
	});

	socket.on("event", async (msg) => {
		let tmpObj = {
			...JSON.parse(msg),
			kiedy: Date.now()
		};
		const tmpKierowca = powiazanieTelemetria(tmpObj.token);
		if(!tmpKierowca) return;
		//mandaty
		if(tmpObj.typ == "player.fined"){
			let wiadomosc = `Kierowca ${tmpKierowca} otrzymał mandat w wysokości ${tmpObj['fine.amount']} zł za `;
			let tmpTyp = "Nieznany";
			switch(tmpObj['fine.offence']){
				case 'crash':
					wiadomosc = wiadomosc + "Kolizję";
					tmpTyp = "Kolizja";
					break;
				case 'avoid_sleeping':
					wiadomosc = wiadomosc + "Unikanie snu";
					tmpTyp = "Unikanie snu";
					break;
				case 'wrong_way':
					wiadomosc = wiadomosc + "Jazdę pod prąd";
					tmpTyp = "Jazda pod prąd";
					break;
				case 'speeding_camera':
					wiadomosc = wiadomosc + "Przekroczenie prędkości (Fotoradar)";
					tmpTyp = "Przekroczenie prędkości (Fotoradar)";
					break;
				case 'no_lights':
					wiadomosc = wiadomosc + "Brak włączonych świateł";
					tmpTyp = "Brak włączonych świateł";
					break;
				case 'red_signal':
					wiadomosc = wiadomosc + "Przejazd na czerwonym świetle";
					tmpTyp = "Przejazd na czerwonym świetle";
					break;
				case 'speeding':
					wiadomosc = wiadomosc + "Przekroczenie prędkości (Policja)";
					tmpTyp = "Przekroczenie prędkości (Policja)";
					break;
				case 'avoid_weighing':
					wiadomosc = wiadomosc + "Unikanie pomiaru wagi";
					tmpTyp = "Unikanie pomiaru wagi";
					break;
				case 'illegal_trailer':
					wiadomosc = wiadomosc + "Nielegalną naczepę";
					tmpTyp = "Nielegalna naczepa";
					break;
				case 'avoid_inspection':
					wiadomosc = wiadomosc + "Unikanie inspekcji";
					tmpTyp = "Unikanie inspekcji pojazdu";
					break;
				case 'illegal_border_crossing':
					wiadomosc = wiadomosc + "Nielegalne przekroczenie granicy";
					tmpTyp = "Nielegalne przekroczenie granicy";
					break;
				case 'hard_shoulder_violation':
					wiadomosc = wiadomosc + "Naruszenie awaryjnego pasa jezdni";
					tmpTyp = "Naruszenie awaryjnego pasa jezdni";
					break;
				case 'damaged_vehicle_usage':
					wiadomosc = wiadomosc + "Niesprawny pojazd";
					tmpTyp = "Niesprawny pojazd";
					break;
				case 'generic':
					wiadomosc = wiadomosc + "Nieznany typ mandatu";
					tmpTyp = "Nieznany typ mandatu";
					break;
				default:
					console.log(tmpObj);
					wiadomosc = wiadomosc + "Nieznany typ mandatu";
					tmpTyp = "Nieznany typ mandatu";
					break;
			}
			console.log(wiadomosc);
			try {
				const [r] = await db.execute("SELECT `id`, `login`, `discord` FROM `konta` WHERE `login` = (SELECT `uzytkownik` FROM `telemetriaPowiazania` WHERE `token` = ?) ", [tmpObj.token]);
				if(r.length > 0){
					try {
						const [r2] = await db.execute("INSERT INTO `telemetriaMandaty` (`kto`, `typ`, `kwota`, `kiedy`) VALUES (?, ?, ?, ?)", [r[0].id, tmpTyp, tmpObj['fine.amount'], new Date(tmpObj.kiedy)]);
						if(r2.affectedRows > 0) {
							const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Mandat")
							.setDescription(`Użytkownik [${r[0]['login']}](https://system.thebossspedition.pl/profil/${r[0]['login']}) otrzymał mandat.`)
							.addFields({name: "Powód:", value: tmpTyp, inline: true})
							.addFields({name: 'Kwota:', value: `${parseFloat(tmpObj['fine.amount']).toFixed(2)} zł`, inline: true})
							.setColor(0xFF21AD)
							.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
							await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
							return;
						}
					} catch(er2){
						console.log("WYSTĄPIŁ BŁĄD Z ZAPISANIEM MANDATU!");
						const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Mandat - Błąd zapisu")
							.setDescription(er2.sqlMessage).setColor(0xFF0000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
						await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
						console.log(er2);
						return;
					}
				} else {
					console.log("BŁAD ZAPISU MANDATU - Nie moge znalezc ID z tabeli konta dla ", tmpKierowca);
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Mandat - Błąd zapisu")
							.setDescription(`Użytkownik ${tmpKierowca} otrzymał mandat z powodu ${tmpTyp} na kwotę ${parseFloat(tmpObj['fine.amount']).toFixed(2)} zł, ale nie można odnaleźć identyfikatora kierowcy w bazie danych, żeby zapisać zdarzenie. Wygenerowanie nowego tokenu telemetrii przez użytkownika powinno rozwiązać ten problem.`)
							.setColor(0xFF0000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
					await dcbot.channels.cache.get(process.env.CHANNEL_TELEMETRIA).send({embeds: [embed1]});
					return;
				}
			} catch(er) {
				console.log("BŁAD ZAPISU MANDATU - Nieznany uzytkownik ?");
				console.log(er);
			}
			return;
		}
		if(tmpObj.typ == "player.tollgate.paid"){
			let wiadomosc = `zapłacił kwotę ${tmpObj['pay.amount']} zł za płatny odcinek drogi.`;
			zapiszTelemetriaInne(tmpObj.token, "Bramka płatnicza", tmpObj['pay.amount'], wiadomosc);
			return;
		}
		if(tmpObj.typ == "player.use.ferry"){
			let wiadomosc = `zapłacił kwotę ${tmpObj['pay.amount']} zł za prom z miejscowości ${tmpObj['source.name']} do miejscowości ${tmpObj['target.name']}.`;
			console.log(wiadomosc);
			zapiszTelemetriaInne(tmpObj.token, "Prom", tmpObj['pay.amount'], wiadomosc);
			return;
		}
		if(tmpObj.typ == "player.use.train"){
			let wiadomosc = `zapłacił kwotę ${tmpObj['pay.amount']} zł za pociąg z miejscowości ${tmpObj['source.name']} do miejscowości ${tmpObj['target.name']}.`;
			console.log(wiadomosc);
			zapiszTelemetriaInne(tmpObj.token, "Pociąg", tmpObj['pay.amount'], wiadomosc);
			return;
		}

		const tmpIndex = indexDaneTelemetria(tmpKierowca);
		if(tmpObj.typ == "job.delivered"){
			let wiadomosc = `dostarczył ładunek. Przejechał ${tmpObj['distance.km']} km\nAutomatyczne parkowanie: ${tmpObj['auto.park.used'] ? "TAK" : "NIE"}\nWynagrodzenie: ${tmpObj.revenue} zł`;
			console.log(wiadomosc);
			zapiszTelemetriaInne(tmpObj.token, "Dostarczenie ładunku", tmpObj.revenue, wiadomosc);
		} else {
			if(tmpObj.typ == "job.cancelled"){
				let wiadomosc = `anulował zlecenie i otrzymał grzywnę w wysokości ${tmpObj['cancel.penalty']} zł`;
				zapiszTelemetriaInne(tmpObj.token, "Anulowanie zlecenia", tmpObj['cancel.penalty'], wiadomosc);
				console.log(wiadomosc);
			} else {
				console.log("NIEZNANY TYP EVENTU", tmpObj);
			}
		}
		if(tmpIndex !== -1){
			telemetriaInformacje[tmpIndex].praca = null;
			telemetriaInformacje[tmpIndex].kiedy = Date.now();
			io.emit("otrzymajPozycje", telemetriaInformacje);
		}
	});

	socket.on("ciezarowka", (msg) => {
		const tmpDane = JSON.parse(msg);
		const tmpKierowca = powiazanieTelemetria(tmpDane.token);
		if(!tmpKierowca) return;
		if(tmpDane.brand) {
			let tmpObj = {
				marka: tmpDane.brand,
				model: tmpDane.name,
				maxObroty: tmpDane['rpm.limit'],
				maxPaliwa: tmpDane['fuel.capacity'],
				rejestracja: tmpDane['license.plate'],
				liczbaKol: tmpDane['wheels.count']
			};
			// console.log("Ciezarowka:", tmpKierowca, tmpObj);
			const tmpIndex = indexDaneTelemetria(tmpKierowca);
			if(tmpIndex == -1){
				//nieistnieje, dodaj
				telemetriaInformacje.push({login: tmpKierowca, kiedy: Date.now(), ciezarowka: tmpObj});
			} else {
				telemetriaInformacje[tmpIndex].ciezarowka = tmpObj;
				telemetriaInformacje[tmpIndex].kiedy = Date.now();
			}
		} else {
			const tmpIndex = indexDaneTelemetria(tmpKierowca);
			if(tmpIndex == -1){
				//nieistnieje, dodaj
				telemetriaInformacje.push({login: tmpKierowca, kiedy: Date.now(), ciezarowka: null});
			} else {
				telemetriaInformacje[tmpIndex].ciezarowka = null;
				telemetriaInformacje[tmpIndex].kiedy = Date.now();
			}
			// console.log("Ciezarowka: ", tmpKierowca, "Brak");
		}
		io.emit("otrzymajPozycje", telemetriaInformacje);
	});

	socket.on("naczepa", (msg) => {
		const tmpDane = JSON.parse(msg);
		const tmpKierowca = powiazanieTelemetria(tmpDane.token);
		if(!tmpKierowca) return;
		if(tmpDane['body.type']){
			let tmpObj = {
				typNaczepy: tmpDane['body.type'],
				typLancucha: tmpDane['chain.type'],
				liczbaKol: tmpDane['wheels.count'],
				rejestracja: tmpDane['license.plate'],
				kraj: tmpDane['license.plate.country'],
				marka: tmpDane['brand_id'],
				model: tmpDane['name']
			}
			const tmpIndex = indexDaneTelemetria(tmpKierowca);
			if(tmpIndex == -1){
				//nieistnieje, dodaj
				telemetriaInformacje.push({login: tmpKierowca, kiedy: Date.now(), naczepa: tmpObj});
			} else {
				telemetriaInformacje[tmpIndex].naczepa = tmpObj;
				telemetriaInformacje[tmpIndex].kiedy = Date.now();
			}
			
			// console.log("Naczepa:", tmpKierowca, tmpObj);
		} else {
			const tmpIndex = indexDaneTelemetria(tmpKierowca);
			if(tmpIndex == -1){
				//nieistnieje, dodaj
				telemetriaInformacje.push({login: tmpKierowca, kiedy: Date.now(), naczepa: null});
			} else {
				telemetriaInformacje[tmpIndex].naczepa = null;
				telemetriaInformacje[tmpIndex].kiedy = Date.now();
			}
			// console.log("Naczepa:", tmpKierowca, "Brak");
		}
		io.emit("otrzymajPozycje", telemetriaInformacje);
	});

	socket.on("uszkodzenia", (msg) => {
		const tmpDane = JSON.parse(msg);
		const tmpKierowca = powiazanieTelemetria(tmpDane.token);
		if(!tmpKierowca) return;
		const istotne = (({ token, ...o }) => o)(tmpDane);
		// console.log(istotne);
		const tmpIndex = indexDaneTelemetria(tmpKierowca);
		if(tmpIndex == -1){
			telemetriaInformacje.push({login: tmpKierowca, kiedy: Date.now(), uszkodzenia: istotne});
		} else {
			telemetriaInformacje[tmpIndex].uszkodzenia = istotne;
		}
		io.emit("otrzymajPozycje", telemetriaInformacje);
	})

	socket.on("praca", (msg) => {
		const tmpDane = JSON.parse(msg);
		const tmpKierowca = powiazanieTelemetria(tmpDane.token);
		if(!tmpKierowca) return;
		if(tmpDane.cargo){
			console.log(tmpDane);
			let tmpObj = {
				ladunek: tmpDane.cargo,
				masa: tmpDane['cargo.mass'],
				skad: tmpDane['source.city.id'],
				skadFirma: tmpDane['source.company'],
				dokad: tmpDane['destination.city.id'],
				dokadFirma: tmpDane['destination.company'],
				wynagrodzenie: tmpDane.income,
				market: tmpDane['job.market'],
				specjalne: tmpDane['is.special.job']
			}
			// console.log("Praca:", tmpKierowca, tmpObj);
			const tmpIndex = indexDaneTelemetria(tmpKierowca);
			if(tmpIndex == -1){
				//nieistnieje, dodaj
				telemetriaInformacje.push({login: tmpKierowca, kiedy: Date.now(), praca: tmpObj});
			} else {
				telemetriaInformacje[tmpIndex].praca = tmpObj;
				telemetriaInformacje[tmpIndex].kiedy = Date.now();
			}
		} else {
			const tmpIndex = indexDaneTelemetria(tmpKierowca);
			if(tmpIndex == -1){
				//nieistnieje, dodaj
				telemetriaInformacje.push({login: tmpKierowca, kiedy: Date.now(), praca: null});
			} else {
				telemetriaInformacje[tmpIndex].praca = null;
				telemetriaInformacje[tmpIndex].kiedy = Date.now();
			}
			// console.log("Praca:", tmpKierowca, "Brak");
		}
		io.emit("otrzymajPozycje", telemetriaInformacje);
	});

	socket.on("poprosPozycje", (msg) => {
		socket.emit("otrzymajPozycje", telemetriaInformacje);
	});
});

app.listen(port, () => {
		console.log(`Aplikacja serwerowa zostala uruchomiona na http://localhost:${port}`);
});