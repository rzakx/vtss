const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const https = require("https");
const Axios = require("axios");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const app = express();
const port = 30014;
require('dotenv').config();
//DISCORD BOT
const { ActivityType, EmbedBuilder, Client, Events, Collection, GatewayIntentBits } = require('discord.js');
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
		await inter.reply({embeds: [embed1], ephemeral: true});
	};
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
		.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
		await inter.reply({embeds: [embed2], ephemeral: true});
	}
	if(komenda == "cennik"){
		console.log(dataLog(), `${inter.user.displayName} użył komendy /cennik`);
		const embedzik = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Cennik uprawnień").setColor(0x01F1AD).setImage('https://system.thebossspedition.pl/img/cennik.png');
		await inter.reply({embeds: [embedzik], ephemeral: true});
	}
	if(komenda == "trasy"){
		console.log(dataLog(), `${inter.user.displayName} użył komendy /trasy`);
		db.query(`SELECT
		SUM(CASE WHEN zatwierdz = 0 THEN 1 ELSE 0 END) AS oczekujace,
		SUM(CASE WHEN zatwierdz = 1 THEN 1 ELSE 0 END) AS zatwierdzone,
		SUM(CASE WHEN zatwierdz = 2 AND dozwolpoprawke = 0 THEN 1 ELSE 0 END) AS odrzuconePerm,
		SUM(CASE WHEN zatwierdz = 2 AND dozwolpoprawke = 1 THEN 1 ELSE 0 END) AS odrzuconePopraw
	FROM trasy`, async (er, r) => {
			const embed3 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp()
			.setDescription(`Aktualna statystyka oddanych tras w systemie.`)
			.setColor(0x01F1AD).setTitle("Statystyka tras")
			.addFields({name: "Łączna ilość", value: `${r[0].zatwierdzone + r[0].oczekujace + r[0].odrzuconePerm + r[0].odrzuconePopraw}`, inline: true})
			.addFields({name: "Zatwierdzonych", value: `${r[0].zatwierdzone ? r[0].zatwierdzone : 0}`, inline: true})
			.addFields({name: "Oczekujących", value: `${r[0].oczekujace ? r[0].oczekujace : 0}`, inline: true})
			.addFields({name: "Odrzucone permanentnie", value: `${r[0].odrzuconePerm ? r[0].odrzuconePerm : 0}`, inline: true})
			.addFields({name: "Odrzucone do poprawy", value: `${r[0].odrzuconePopraw ? r[0].odrzuconePopraw : 0}`, inline: true})
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			await inter.reply({embeds: [embed3], ephemeral: true});
		});
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
				db.query(query, danezwrotne[0][1], async (er, r) => {
					//czy znaleziono goscia w bazie
					if(r.length > 0){
						zwrot = {id: r[0]['id'], login: r[0]['login'], discord: r[0]['discord']};
						/* OPIS
						embed4.setDescription(`Stan konta użytkownika 
						${danezwrotne[0][0] ? 
							"<@"+danezwrotne[0][1]+"> - "+zwrot.login
							: (
								zwrot.discord ?
								"<@"+zwrot.discord+"> - "+zwrot.login
								: zwrot.login
							)
						}`) */
						let stankonta = 0;
						// wlasnyzarobek, kary, premie
						db.query("SELECT SUM(`trasy`.`wlasnyzarobek`) as 'zarobek', SUM(`trasy`.`premia`) as 'premie', SUM(`trasy`.`kara`) as 'kary' FROM `trasy` WHERE `trasy`.`kto` = ? AND `trasy`.`zatwierdz` = 1", zwrot.id, (ert, rt) => {
							stankonta = stankonta + rt[0].zarobek + rt[0].premie - rt[0].kary;
							// uprawnienia
							db.query("SELECT SUM(`uprawnienia`.`cena`) as 'c' FROM `uprawnienia` WHERE `kto` = ?", zwrot.id, (eru, ru) => {
								stankonta = stankonta - ru[0].c;
								// winiety
								db.query("SELECT SUM(`kupionewiniety`.`zaile`) as 'c' FROM `kupionewiniety` WHERE `kto` = ?", zwrot.id, (erw, rw) => {
									stankonta = stankonta - rw[0].c;
									// dodawane
									db.query("SELECT SUM(`dodawaniekwoty`.`kwota`) as 'c' FROM `dodawaniekwoty` WHERE `komu` = ?", zwrot.id, async (erd, rd) => {
										stankonta = stankonta + rd[0].c;
										embed4.setDescription(`Stan konta użytkownika\n${danezwrotne[0][0] ? 
											zwrot.login + " <@"+danezwrotne[0][1]+">"
											: (
												zwrot.discord ?
												zwrot.login + " <@"+zwrot.discord+">"
												: zwrot.login
											)
										} wynosi\n${stankonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) }`);
										await inter.reply({embeds: [embed4], ephemeral: true});
									});
								});
							});
						});
					} else {
						//sprobuj druga metoda jak jest
						if(query2){
							db.query(query2, danezwrotne[1][1], async (er2, r2) => {
								if(r2.length > 0){
									zwrot = {id: r2[0]['id'], login: r2[0]['login'], discord: r2[0]['discord']};
									let stankonta = 0;
									// wlasnyzarobek, kary, premie
									db.query("SELECT SUM(`trasy`.`wlasnyzarobek`) as 'zarobek', SUM(`trasy`.`premia`) as 'premie', SUM(`trasy`.`kara`) as 'kary' FROM `trasy` WHERE `trasy`.`kto` = ? AND `trasy`.`zatwierdz` = 1", zwrot.id, (ert, rt) => {
										stankonta = stankonta + rt[0].zarobek + rt[0].premie - rt[0].kary;
										// uprawnienia
										db.query("SELECT SUM(`uprawnienia`.`cena`) as 'c' FROM `uprawnienia` WHERE `kto` = ?", zwrot.id, (eru, ru) => {
											stankonta = stankonta - ru[0].c;
											// winiety
											db.query("SELECT SUM(`kupionewiniety`.`zaile`) as 'c' FROM `kupionewiniety` WHERE `kto` = ?", zwrot.id, (erw, rw) => {
												stankonta = stankonta - rw[0].c;
												// dodawane
												db.query("SELECT SUM(`dodawaniekwoty`.`kwota`) as 'c' FROM `dodawaniekwoty` WHERE `komu` = ?", zwrot.id, async (erd, rd) => {
													stankonta = stankonta + rd[0].c;
													embed4.setDescription(`Stan konta użytkownika\n${danezwrotne[1][0] ? 
														zwrot.login + " <@"+danezwrotne[1][1]+">"
														: (
															zwrot.discord ?
															zwrot.login + " <@"+zwrot.discord+">"
															: zwrot.login
														)
													} wynosi\n${stankonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) }`);
													await inter.reply({embeds: [embed4], ephemeral: true});
												});
											});
										});
									});
								} else {
									//nieznaleziono
									embed4.setDescription(`<@${inter.user.id}>! Podane paremetry nie pokrywają się z żadnym kontem systemowym.`);
									await inter.reply({embeds: [embed4], ephemeral: true});
								}
							})
						} else {
							//nieznaleziono
							embed4.setDescription(`<@${inter.user.id}>! Podane paremetry nie pokrywają się z żadnym kontem systemowym.`);
							await inter.reply({embeds: [embed4], ephemeral: true});
						}
					}
				});
			}
		} else {
			//sprawdz wlasne konto
			db.query("SELECT `id`, `login` FROM `konta` WHERE `discord` = ?", inter.user.id, async (er, r) => {
				if(r.length > 0){
					zwrot = {id: r[0]['id'], login: r[0]['login'], discord: r[0]['discord']};
					let stankonta = 0;
					// wlasnyzarobek, kary, premie
					db.query("SELECT SUM(`trasy`.`wlasnyzarobek`) as 'zarobek', SUM(`trasy`.`premia`) as 'premie', SUM(`trasy`.`kara`) as 'kary' FROM `trasy` WHERE `trasy`.`kto` = ? AND `trasy`.`zatwierdz` = 1", zwrot.id, (ert, rt) => {
						stankonta = stankonta + rt[0].zarobek + rt[0].premie - rt[0].kary;
						// uprawnienia
						db.query("SELECT SUM(`uprawnienia`.`cena`) as 'c' FROM `uprawnienia` WHERE `kto` = ?", zwrot.id, (eru, ru) => {
							stankonta = stankonta - ru[0].c;
							// winiety
							db.query("SELECT SUM(`kupionewiniety`.`zaile`) as 'c' FROM `kupionewiniety` WHERE `kto` = ?", zwrot.id, (erw, rw) => {
								stankonta = stankonta - rw[0].c;
								// dodawane
								db.query("SELECT SUM(`dodawaniekwoty`.`kwota`) as 'c' FROM `dodawaniekwoty` WHERE `komu` = ?", zwrot.id, async (erd, rd) => {
									stankonta = stankonta + rd[0].c;
									embed4.setDescription(`Twój stan konta w systemie wynosi ${stankonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) }`);
									await inter.reply({embeds: [embed4], ephemeral: true});
								});
							});
						});
					});
				} else {
					//nie ma powiazanego konta dc z systemem
					embed4.setDescription(`<@${inter.user.id}>! Twoje konto Discord nie jest powiązane z żadnym kontem systemowym.`);
					await inter.reply({embeds: [embed4], ephemeral: true});
				}
			})
		}

	}
});

const KLUCZ_H = process.env.KLUCZ_H;

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if(file.fieldname === 'awatarImg'){
			cb(null, 'awatary/');
		} else {
			cb(null, 'trasy/');
		}
	},
	filename: (req, file, cb) => {
		if(file.fieldname === 'awatarImg'){
			cb(null, req.params.login + '-' + Date.now() + path.extname(file.originalname));
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
	dateStrings: true,
	charset: 'utf8mb4_general_ci'
});

const smtp = nodemailer.createTransport({
 	host: 'rzak.pl',
 	port: 25,
	ignoreTLS: true,
 	auth: {
 		user: 'no-reply@rzak.pl',
 		pass: process.env.EMAIL_PASS
 	},
 	dkim:{
 		domainName: "rzak.pl",
 		keySelector: process.env.EMAIL_SELECTOR,
 		privateKey: process.env.DKIM
 	}
});

const dataLog = () => {
	return "["+new Date().toLocaleString('pl')+"]";
};

app.post("/wiadomoscGlobalna/:login/:token", (req, res) => {
	db.query("SELECT `discord` as 'dc' FROM `konta` WHERE `discord` IS NOT NULL", async (er, r) => {
		if(er){console.log(er); res.send({blad: "Błąd SQL"}); return; }
		res.send({odp: "Wysłano"});
		if(r.length > 0){
			const embed2 = new EmbedBuilder().setFooter({text: `Wysłał: ${req.params.login}`}).setTimestamp()
			.setTitle("Wiadomość globalna").setDescription(`${req.body.wiadomosc}`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			r.map(async (wiersz) => {
				if(!wiersz.dc) return;
				await dcbot.users.send(wiersz.dc, {embeds: [embed2]}).catch(async (er) => {
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${wiersz.dc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`)
				});
			})
		}
	})
});

app.post("/kontofirmowestan", (req, res) => {
	db.query("SELECT SUM(`suma`) as 's' FROM `kontofirmowe`", (er, r) => {
		if(er){
			res.send({blad: "Błąd SQL"});
			console.log(er);
			return;
		} else {
			res.send({odp: r[0].s});
		}
	});
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
app.get("/typkonta/:token", (req, res) => {
	//dc niepotrzebne
	const token = req.params.token;
	if(token.length == 40){
		db.query("SELECT `konta`.`typkonta`, `konta`.`rangi` as 'stanowisko', `rangi`.`nazwa` as 'stanowiskoN', `typkonta`.`nazwa`, `konta`.`login` FROM `konta`, `typkonta`, `rangi` WHERE `token` = ? AND `typkonta`.`id` = `konta`.`typkonta` AND `rangi`.`id` = `konta`.`rangi`", [token],
		(err, result) => {
			if(result.length > 0){
				res.send({typkonta: result[0]['typkonta'], typkontaNazwa: result[0]['nazwa'], login: result[0]['login'], stanowisko: result[0]['stanowisko'], stanowiskoNazwa: result[0]['stanowiskoN']});
			} else {
				res.send({blad: "Nie ma takiego tokenu"});
			}
		});
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
	db.query("SELECT `id` as 'i', `discord` as 'd' FROM `konta` WHERE `login` = ?", [req.params.komu], (er, r) => {
		if(r.length > 0){
			kierowcaid = r[0].i;
			kierowcadc = r[0].d;
			db.query("INSERT INTO `dodawaniekwoty` (`komu`, `kwota`, `kto`, `powod`) VALUES (?, ?, (SELECT `id` FROM `konta` WHERE `token` = ?), 'Nadanie winiet')", [kierowcaid, req.body.kwota, req.params.token]);
			let odejmowana = -1*parseFloat(req.body.kwota);
			db.query("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?, 'Nadawanie winiet')", [odejmowana]);
		}
	});
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
			await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`)
		});
	}
});

let zaladowanoUprPow = false;
let zaladowanoWinPow = false;
let uprPowiadomienia = [];
let winPowiadomienia = [];

const zaladujUprPow = async () => {
	try {
		uprPowiadomienia = await JSON.parse(fs.readFileSync("waznoscUprawnien.json"));
		zaladowanoUprPow = true;
	} catch {
		console.log("Wystąpił krytyczny błąd załadowania ważności uprawnień");
	}
};

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
	db.query("SELECT `id` as 'i', `discord` as 'd', `login` as 'l' FROM `konta`", (er, r) => {
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
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
	});
};

const sprawdzWinWaznosc = async () => {
	const dzis = Date.now();
	if(!zaladowanoWinPow){
		await zaladujWinPow();
		return;
	}
	console.log(dataLog(), "System sprawdza ważność winiet");
	db.query("SELECT `kupionewiniety`.`id` as 'i', `kupionewiniety`.`kto` as 'k', `kupionewiniety`.`kraj`, MAX(`kupionewiniety`.`dokiedy`) as 'dokiedy', `winiety`.`kraj` as 'p' FROM `kupionewiniety` LEFT JOIN `winiety` ON `kupionewiniety`.`kraj` = `winiety`.`id` GROUP BY `kupionewiniety`.`kto`, `kupionewiniety`.`kraj`", (er, r) => {
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
	});
};

const powiadomWygasniecieUpr = async () => {
	let uzytkownicy = [];
	let zablokowanydc = [];
	db.query("SELECT `id` as 'i', `discord` as 'd', `login` as 'l' FROM `konta`", (er, r) => {
		//przygotuj liste login, dc, id
		r.map((wiersz) => {
			uzytkownicy[wiersz.i] = { login: wiersz.l, discord: wiersz.d};
		});
		uprPowiadomienia.map((w, k) => {
			//console.log("Konto:", k);
			if(uzytkownicy[k] === undefined) return;
			if(!w) return;
			Object.entries(w).map(async (s) => {
				if(s[1]['wygasa7']['minelo']){
					//mija za 7 dni
					if(!s[1]['wygasa7']['powiadomiono']){
						//POWIADOMIC
						const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność uprawnienia")
						.setDescription(`Użytkownikowi [${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 7 dni wygasa uprawnienie.`)
						.setColor(0xFFD500).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
						.addFields({name: "Uprawnienie:", value: `${s[1]['nazwa']} (${s[1]['rodzaj']})`, inline: true})
						.addFields({name: "Typ gry:", value: s[1]['gra'], inline: true})
						.addFields({name: "Data ważności:", value: s[1]['wygasa']});
						await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
						if(uzytkownicy[k].discord && !zablokowanydc.includes(k)){
							embed1.setDescription(`[${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 7 dni wygasa Tobie uprawnienie.`);
							await dcbot.users.send(uzytkownicy[k].discord, {embeds: [embed1]}).catch(async (erdd) => {
								zablokowanydc.push(k);
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
						uprPowiadomienia[k][s[0]]['wygasa7']['powiadomiono'] = true;
					}
				}
				if(s[1]['wygasa3']['minelo']){
					//mija za 3 dni
					if(!s[1]['wygasa3']['powiadomiono']){
						//POWIADOMIC
						const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność uprawnienia")
						.setDescription(`Użytkownikowi [${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 3 dni wygasa uprawnienie.`)
						.setColor(0xFF7700).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
						.addFields({name: "Uprawnienie:", value: `${s[1]['nazwa']} (${s[1]['rodzaj']})`, inline: true})
						.addFields({name: "Typ gry:", value: s[1]['gra'], inline: true})
						.addFields({name: "Data ważności:", value: s[1]['wygasa']});
						await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
						if(uzytkownicy[k].discord && !zablokowanydc.includes(k)){
							embed1.setDescription(`[${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) za 3 dni wygasa Tobie uprawnienie.`);
							await dcbot.users.send(uzytkownicy[k].discord, {embeds: [embed1]}).catch(async (erdd) => {
								zablokowanydc.push(k);
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
						uprPowiadomienia[k][s[0]]['wygasa3']['powiadomiono'] = true;
					}
				}
				if(s[1]['wygaslo']['minelo']){
					//wygaslo
					if(!s[1]['wygaslo']['powiadomiono']){
						//POWIADOMIC
						const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Ważność uprawnienia")
						.setDescription(`Użytkownikowi [${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) wygasło uprawnienie.`)
						.setColor(0xBF0300).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
						.addFields({name: "Uprawnienie:", value: `${s[1]['nazwa']} (${s[1]['rodzaj']})`, inline: true})
						.addFields({name: "Typ gry:", value: s[1]['gra'], inline: true})
						.addFields({name: "Data ważności:", value: s[1]['wygasa']});
						await dcbot.channels.cache.get(process.env.CHANNEL_UPRAWNIENIA).send({embeds: [embed1]});
						if(uzytkownicy[k].discord && !zablokowanydc.includes(k)){
							embed1.setDescription(`[${uzytkownicy[k].login}](https://system.thebossspedition.pl/profil/${uzytkownicy[k].login}) wygasło Twoje uprawnienie.`);
							await dcbot.users.send(uzytkownicy[k].discord, {embeds: [embed1]}).catch(async (erdd) => {
								zablokowanydc.push(k);
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${uzytkownicy[k].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
						uprPowiadomienia[k][s[0]]['wygaslo']['powiadomiono'] = true;
					}
				}
			});
		});
		//zapisz do pliku uprawniena
		try{
			fs.writeFileSync('waznoscUprawnien.json', JSON.stringify(uprPowiadomienia));
			console.log("Zapisano obiekt ważności uprawnień");
		} catch {
			console.log("Wystąpił krytyczny błąd w zapisaniu obiektu JSON ważności uprawnień!");
		}
	});
};

const sprawdzUprWaznosc = async () => {
	const dzis = Date.now();
	if(!zaladowanoUprPow){
		await zaladujUprPow();
		return;
	}
	console.log(dataLog(), "System sprawdza ważność uprawnień");
	db.query("SELECT `uprawnienia`.`id` as 'i', `uprawnienia`.`kto` as 'k', `uprawnienia`.`naco`, MAX(`uprawnienia`.`dokiedy`) as 'dokiedy', `uprawnienia`.`gra` as 'giereczka', `typyuprawnien`.`nazwa` as 'na', `typyuprawnien`.`rodzaj` as 'ro' FROM `uprawnienia` LEFT JOIN `typyuprawnien` ON `uprawnienia`.`naco` = `typyuprawnien`.`id` GROUP BY `uprawnienia`.`kto`, `uprawnienia`.`naco`", (er, r) => {
		r.map((wiersz) => {
			//czy jest konto w obiekcie JSON
			if(!uprPowiadomienia[wiersz.k]){
				uprPowiadomienia[wiersz.k] = {};
			}
			//czy jest juz uprawnienie w obiekcie JSON konta
			if(!uprPowiadomienia[wiersz.k][wiersz.i]){
				uprPowiadomienia[wiersz.k][wiersz.i] = {
					nazwa: wiersz.na,
					rodzaj: wiersz.ro,
					wygasa: new Date(wiersz.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'}),
					gra: (wiersz.giereczka == 1) ? "ATS" : "ETS2",
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
			//teraz sprawdzanie ustawianie wartosci uprawnienia w obiekcie JSON
			let hit = false;
			let wygasa = new Date(wiersz.dokiedy).getTime();
			if(dzis > wygasa && !hit){
				hit = true;
				if(uprPowiadomienia[wiersz.k][wiersz.i].wygaslo.minelo == false){
					uprPowiadomienia[wiersz.k][wiersz.i].wygaslo.minelo = true;
				}
			}
			let za3 = new Date(Date.now());
			za3.setDate(za3.getDate() + 3);
			if(za3 > wygasa && !hit){
				hit = true;
				if(uprPowiadomienia[wiersz.k][wiersz.i].wygasa3.minelo == false){
					uprPowiadomienia[wiersz.k][wiersz.i].wygasa3.minelo = true;
				}
			}
			let za7 = new Date(Date.now());
			za7.setDate(za7.getDate() + 7);
			if(za7 > wygasa && !hit){
				hit = true;
				if(uprPowiadomienia[wiersz.k][wiersz.i].wygasa7.minelo == false){
					uprPowiadomienia[wiersz.k][wiersz.i].wygasa7.minelo = true;
				}
			}
		});
		powiadomWygasniecieUpr();
	});
};

setInterval(async () => {
	await sprawdzUprWaznosc();
	await sprawdzWinWaznosc();
}, 3 * 60 * 60 * 1000); //co X * 60 minut 

app.post("/adminUsunAwatar/:kto/:komu", (req, res) => {
	//dc zrobione
	if(req.params.kto && req.params.komu){
		db.query("UPDATE `konta` SET `awatar` = 'awatary/default.png' WHERE `id` = ?", [req.params.komu], (er, r) => {
			if(er){
				console.log(er);
				res.send({blad: "Blad sql"});
				return;
			}
			if(r.affectedRows > 0){
				db.query("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `id` = ?", [req.params.komu], async (erk, rk) => {
					console.log("["+new Date().toLocaleString('pl')+"]", req.params.kto, "usunął awatar profilu ", rk[0].l);
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Edycja profilu")
					.setDescription(`[${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął awatar użytkownika [${rk[0].l}](https://system.thebossspedition.pl/profil/${rk[0].l}).`)
					.setColor(0x01F1AD)
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
					await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
					if(rk[0].d){
						embed1.setDescription(`[${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął twój awatar profilu.`);
						await dcbot.users.send(rk[0].d, {embeds: [embed1]}).catch(async (erdd) => {
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${rk[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					}
				})
				if(req.body.staryAwatar != 'awatary/default.png'){
					fs.unlink(req.body.staryAwatar, (err) => {if(err) console.log(err)});
				}
				res.send({odp: "OK"});
			} else {
				res.send({odp: "Złe ID?"});
			}
		});
	}
});
app.post("/profilDane/:login/:kto", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	console.log("["+new Date().toLocaleString('pl')+"]", req.params.kto, "odwiedza profil:", login);
	db.query("SELECT `konta`.`login`, `konta`.`typkonta`, `konta`.`kiedydolaczyl`, `konta`.`awatar`, `konta`.`stawka`, `konta`.`garaz`, `konta`.`truck`, `konta`.`discord`, `konta`.`steam`, `konta`.`truckbook`, `konta`.`truckersmp`, `konta`.`worldoftrucks`, `typkonta`.`nazwa` as 'typkontaN', `konta`.`rangi`, `rangi`.`nazwa` as 'stanowiskoN' FROM `konta`, `typkonta`, `rangi` WHERE `login` = ? AND `typkonta`.`id` = `konta`.`typkonta` AND `rangi`.`id` = `konta`.`rangi`", [login],
	(err, result) => {
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
				stanowiskoNazwa: result[0]['stanowiskoN']
		});
		} else {
			res.send({blad: "Nie ma takiego tokenu"});
		}
	});
});

app.post("/rangi", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `typkonta` ORDER BY `id` ASC", (err, result) => {
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
});
app.post("/stanowiska", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `rangi` ORDER BY `id` ASC", (err, result) => {
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
});

app.post("/profilDaneId/:id", (req, res) => {
	//dc niepotrzebne
	const id = req.params.id;
	db.query("SELECT * FROM `konta`, `typkonta` WHERE `konta`.`id` = ? AND `typkonta`.`id` = `konta`.`typkonta`", [id],
	(err, result) => {
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
});
app.post("/listaUzytkownikow/", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT `konta`.`email`, `konta`.`id` as 'kontoid', `konta`.`login`, `konta`.`typkonta`, `konta`.`rangi`, `konta`.`kiedydolaczyl`, `konta`.`awatar`, `konta`.`stawka`, `konta`.`garaz`, `konta`.`truck`, `konta`.`discord`, `konta`.`steam`, `konta`.`truckersmp`, `konta`.`truckbook`, `konta`.`worldoftrucks`, `typkonta`.`nazwa` as 'nazwa', `rangi`.`nazwa` as 'stanowisko' FROM `konta`, `rangi`, `typkonta` WHERE `typkonta`.`id` = `konta`.`typkonta` AND `rangi`.`id` = `konta`.`rangi` ORDER BY `konta`.`typkonta` ASC",
	(err, result) => {
		if(err) console.log(err);
		if(result.length > 0){
			let lista = [];
			result.map((w) => {
				lista.push({
					id: w.kontoid,
					login: w.login,
					typkonta: w.typkonta,
					stanowisko: w.rangi,
					datadolaczenia: w.kiedydolaczyl,
					awatar: w.awatar,
					stawka: w.stawka,
					garaz: w.garaz,
					truck: w.truck,
					discord: w.discord,
					steam: w.steam,
					truckbook: w.truckbook,
					truckersmp: w.truckersmp,
					worldoftrucks: w.worldoftrucks,
					ranga: w.nazwa,
					stanowiskoNazwa: w.stanowisko,
					email: w.email
				});
			});
			res.send(lista);
		} else {
			res.send({blad: "Nie ma takiego tokenu"});
		}
	});
});

//logowanie
app.post("/login", (req, res) => {
	//dc zrobione
	const user = req.body.username;
	const saltToken = user + Date.now().toString();
	const password = req.body.password;
	const haslo = CryptoJS.HmacSHA1(password, KLUCZ_H).toString();
	const dane = req.body.dane;
	db.query(
		"SELECT `login` as 'l',`awatar`,`typkonta`,`discord` as 'd' FROM `konta` WHERE `login` = ? AND `haslo` = ?",
		[user, haslo],
		async (err, result) => {
			if(err){
				console.log(err);
			}
			if(result.length > 0){
				console.log("");
				console.log("["+new Date().toLocaleString('pl')+"]", "Udana próba logowania na konto:", user);
				const tokenik = CryptoJS.HmacSHA1(saltToken, KLUCZ_H).toString();
				db.query(
					"UPDATE `konta` SET `token` = ? WHERE `login` = ?",
					[tokenik, user]
				);
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
						await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${result[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
					});
				};
			} else {
				console.log("["+new Date().toLocaleString('pl')+"]", "Nieudana próba logowania na konto: ", user);
				res.send({blad: "ZLE DANE KURWO"});
			}
		}
	);
});

//etap 1 resetowania hasla
app.post("/reset", (req, res) => {
	//dc zrobione
	const user = req.body.username;
	const saltToken = user + Date.now().toString() + "reset";
	const kodzwrotny = CryptoJS.HmacSHA1(saltToken, KLUCZ_H).toString();
	console.log("");
	console.log("["+new Date().toLocaleString('pl')+"]", "Uzytkownik ", user, " resetuje haslo, jego kodzwrotny: ", kodzwrotny);
	db.query("UPDATE `konta` SET `reset` = ? WHERE `login` = ?", [kodzwrotny, user], (err, result) => {
			if(err){console.error(err)}
			if(result.affectedRows > 0){
				db.query("SELECT `email` as 'e', `discord` as 'd' FROM `konta` WHERE `login` = ?", [user], async (err2, r2) => {
					if(r2[0].d){
						const embed = new EmbedBuilder()
						.setColor(0x0099FF)
						.setTitle('Resetowanie hasła')
						.setDescription('Użytkowniku! Rozpoczęliśmy proces resetowania twojego hasła do systemu! Jeśli to nie ty zażądałeś tego procesu, po prostu zignoruj tą wiadomość.')
						.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
						.addFields({ name: 'Kod zwrotny', value: kodzwrotny })
						.setTimestamp()
						.setFooter({ text: 'System The Boss Spedition'})
						.setColor(0xFF3C00);
						await dcbot.users.send(r2[0].d, {embeds: [embed]}).then(() => {
							res.send({odp: "GITES"});
						}).catch(async() => {
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
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
				});
			} else {
				res.send({blad: "Nie ma takiego użytkownika!"});
			}
		}
	);
});

//etap 2 resetowanie hasla
app.post("/resetcheck", (req, res) => {
	//dc niepotrzebne
	const zwrotny = req.body.kodzik;
	console.log("");
	console.log("["+new Date().toLocaleString('pl')+"]", "Sprawdzanie czy kod zwrotny ", zwrotny, " jest git");
	db.query(
		"SELECT COUNT(*) FROM `konta` WHERE `reset` = ?",
		[zwrotny], (err, result) => {
			if(result.length > 0){
				res.send({odp: "GITES"});
			} else {
				res.send({blad: "Zly kod"});
			}
		}
	);
});

//etap 3 resetowanie hasla
app.post("/resetfinal", (req, res) => {
	//dc zrobione
	const zwrotny = req.body.kodzwrotny;
	console.log("["+new Date().toLocaleString('pl')+"]", "Przywrocono haslo dla osoby o kluczu ", zwrotny);
	const szyfrHaslo = CryptoJS.HmacSHA1(req.body.haslo, KLUCZ_H).toString();
	db.query(
		"UPDATE `konta` SET `haslo` = ?, `reset` = '' WHERE `reset` = ?",
		[szyfrHaslo, zwrotny], (err, result) => {
			if(result.affectedRows > 0){
				res.send({odp: "Zresetowano"});
				db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `haslo` = ?", [szyfrHaslo], async (erk, rk) => {
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
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					};
				});
			} else {
				res.send({blad: "CHUJ"});
			}
		}
	);
});

//navbar licznik
app.get("/sprawdztrasy", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT COUNT(`id`) as 't' FROM `trasy` WHERE `zatwierdz` = 0", (err, result) => {
		if(result.length > 0){
			res.send({ilosc: result[0]['t']});
		} else {
			res.send({ilosc: 0});
		}
	});
});

//navbar licznik
app.get("/sprawdzpodwyzki", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT COUNT(`id`) as 't' FROM `podwyzka` WHERE `ktorozpatrzyl` = 0 AND `wniosek` IS NULL AND `wniosektxt` IS NULL", (err, result) => {
		if(result.length > 0){
			res.send({ilosc: result[0]['t']});
		} else {
			res.send({ilosc: 0});
		}
	});
});
app.get("/sprawdzurlopy", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT COUNT(`id`) as 't' FROM `urlopy` WHERE `status` IS NULL OR `status` = 0", (err, result) => {
		if(result.length > 0){
			res.send({ilosc: result[0]['t']});
		} else {
			res.send({ilosc: 0});
		}
	});
});

//wlasne statystyki na glowna
app.post("/mainOwnStats/:token", (req, res) => {
	//dc niepotrzebne
	const token = req.params.token;
	const currentMonth = new Date().toISOString().split('T')[0].slice(0,-2) + "%";
	if(token.length == 40){
		db.query("SELECT COUNT(`trasy`.`id`) as 'ile', SUM(`trasy`.`przejechane`) as 'km', SUM(`trasy`.`masaladunku`) as 'tony', SUM(`trasy`.`spalanie`) as 'spalanie' FROM `trasy`,`konta` WHERE `trasy`.`kto` = `konta`.`id` AND `konta`.`token` = ? AND `trasy`.`kiedy` LIKE ? AND `trasy`.`zatwierdz` = 1", [token, currentMonth],
		(err, result) => {
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
		});
	}
});

//globalne statystyki na glowna
app.post("/mainGlobalStats", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT COUNT(`trasy`.`id`) as 'ile', SUM(`trasy`.`przejechane`) as 'km', SUM(`trasy`.`spalanie`) as 'spalanie' FROM `trasy` WHERE `trasy`.`zatwierdz` = 1",
	(err, result) => {
		if(result.length > 0){
			db.query("SELECT COUNT(`konta`.`id`) as 'pracownikow' FROM `konta`", (err, result2) => {
				if(result2.length > 0){
					res.send({
						ladunkow: result[0]['ile'],
						pracownikow: result2[0]['pracownikow'],
						przejechanekm: result[0]['km'],
						spalanie: result[0]['spalanie'] * 100 / result[0]['km'],
						response: 1
					});
				}
			});
		}
	});
});

//wlasny zarobek ORAZ PREMIE
app.post("/stankonta/:login/wlasnyzarobek", (req, res) =>{
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT SUM(`wlasnyzarobek`) as 'w', SUM(`premia`) as 'p' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(err){
			console.log(err);
			res.send({odp: 0});
			return;
		}
		if(result.length > 0){
			const wartosc = result[0]['w'] + result[0]['p'];
			res.send({odp: wartosc});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/kary", (req, res) =>{
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT SUM(`kara`) as 'k' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['k']});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/upr", (req, res) =>{
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT SUM(`cena`) as 'u' FROM `uprawnienia` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['u']});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/gesty", (req, res) =>{
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT SUM(`kwota`) as 'k' FROM `dodawaniekwoty` WHERE `komu` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['k']});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/winiety", (req, res) =>{
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT SUM(`zaile`) as 'z' FROM `kupionewiniety` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['z']});
		} else {
			res.send({odp: 0});
		}
	});
});

//glowna - info oraz limit_km
app.post("/glownaInfo", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `ustawienia` WHERE `nazwa` = 'limit_km' OR `nazwa` = 'informacja'", (err, result) => {
		if(result.length > 0){
			const odp = {};
			result.forEach((element) => {
				if(element['nazwa'] == "informacja"){
					odp.msg = element['wartosc'];
				}
				if(element['nazwa'] == "limit_km"){
					odp.limitkm = element['wartosc'];
				}
			});
			res.send({response: 1, limitkm: odp.limitkm, msg: odp.msg});
		}
	});
});

app.post("/ranking/:miesiac", (req, res) => {
	//dc niepotrzebne
	const miesiac = req.params.miesiac + "-%";
	db.query("SELECT COUNT(`trasy`.`id`) as 'tras', SUM(`trasy`.`przejechane`) as 'przejechane', SUM(`trasy`.`masaladunku`) as 'tonaz', SUM(`trasy`.`zarobek`) as 'zarobek', SUM(`trasy`.`wlasnyzarobek`) as 'wlasnyzarobek', SUM(`trasy`.`spalanie`) as 'spalanie', `konta`.`login` as 'login', `konta`.`awatar` as 'awatar', `trasy`.`kto` as 'id' FROM `trasy`, `konta` WHERE `trasy`.`kto` = `konta`.`id` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto`", [miesiac], (err, result) => {
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
});
app.post("/rankingETS/:miesiac", (req, res) => {
	//dc niepotrzebne
	const miesiac = req.params.miesiac + "-%";
	db.query("SELECT COUNT(`trasy`.`id`) as 'tras', SUM(`trasy`.`przejechane`) as 'przejechane', SUM(`trasy`.`masaladunku`) as 'tonaz', SUM(`trasy`.`zarobek`) as 'zarobek', SUM(`trasy`.`wlasnyzarobek`) as 'wlasnyzarobek', SUM(`trasy`.`spalanie`) as 'spalanie', `konta`.`login` as 'login', `konta`.`awatar` as 'awatar', `trasy`.`kto` as 'id' FROM `trasy`, `konta` WHERE `trasy`.`gra` = 0 AND `trasy`.`kto` = `konta`.`id` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto`", [miesiac], (err, result) => {
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
});
app.post("/rankingATS/:miesiac", (req, res) => {
	//dc niepotrzebne
	const miesiac = req.params.miesiac + "-%";
	db.query("SELECT COUNT(`trasy`.`id`) as 'tras', SUM(`trasy`.`przejechane`) as 'przejechane', SUM(`trasy`.`masaladunku`) as 'tonaz', SUM(`trasy`.`zarobek`) as 'zarobek', SUM(`trasy`.`wlasnyzarobek`) as 'wlasnyzarobek', SUM(`trasy`.`spalanie`) as 'spalanie', `konta`.`login` as 'login', `konta`.`awatar` as 'awatar', `trasy`.`kto` as 'id' FROM `trasy`, `konta` WHERE `trasy`.`gra` = 1 AND `trasy`.`kto` = `konta`.`id` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto`", [miesiac], (err, result) => {
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
});
app.post("/dostepneWiniety/:token", (req, res) => {
	//dc niepotrzebne
	if(!req.params.token){
		res.send({blad: "Nie jestes zalogowany"});
		return;
	}
	let tmp = [];
	db.query("SELECT * FROM `winiety` ORDER BY `kraj` ASC", (er, r) => {
		if(er){
			res.send({response: 1, blad: "Błąd SQL"});
			return;
		}
		if(r.length > 0){
			r.map((wiersz) => {
				tmp.push(wiersz);
			});
			res.send({response: 1, dane: tmp});
		} else {
			res.send({response: 1, dane: null});
		}
	});
});
//top 3 poprzedniego miesiaca
app.post("/lastMonthTop3", (req, res) => {
	//dc niepotrzebne
	const lastMonthObj = new Date();
	lastMonthObj.setMonth(lastMonthObj.getMonth() - 1);
	const lastMonth = lastMonthObj.toISOString().split('T')[0].slice(0,-2) + "%";
	db.query("SELECT SUM(`trasy`.`przejechane`) as 'km', `konta`.`login` as 'login' FROM `trasy`,`konta` WHERE `konta`.`id` = `trasy`.`kto` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto` ORDER BY SUM(`trasy`.`przejechane`) DESC LIMIT 3", [lastMonth], (err, result) => {
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
});

app.post("/ostatnie10tras/:login/dystanskm", (req,res) => {
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT `id`,`przejechane` FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [login], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push({x: trasa.id, y: trasa.przejechane});
			});
			res.send({dane: tmp.reverse()});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/ostatnie10tras/:login/spalanie", (req,res) => {
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT `id`, (`spalanie`*100/`przejechane`) as 'sp' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [login], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push({x: trasa.id, y: trasa.sp});
			});
			res.send({dane: tmp.reverse()});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/ostatnie10tras/:login/zarobki", (req,res) => {
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT `id`,`zarobek` FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [login], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push({x: trasa.id, y: trasa.zarobek});
			});
			res.send({dane: tmp.reverse()});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/komentarze/:login", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	if(!login){
		res.send({blad: 'Nie podano uzytkownika'});
	} else {
		db.query("SELECT `notatkiprofilowe`.`id` as 'idnotatki', `konta`.`login` as 'ktonapisal', `notatkiprofilowe`.`data` as 'kiedy', `notatkiprofilowe`.`tekst` as 'tresc' FROM `notatkiprofilowe`,`konta` WHERE `notatkiprofilowe`.`kto` = `konta`.`id` AND `notatkiprofilowe`.`komu` = (SELECT `konta`.`id` FROM `konta` WHERE `konta`.`login` = ?) GROUP BY `notatkiprofilowe`.`id` ORDER BY `notatkiprofilowe`.`id` DESC", [login], (er, result) => {
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
	}
})
app.post("/dodajKomentarz/:komu/:kto/:token", (req, res) => {
	//dc zrobione
	const komu = req.params.komu;
	const kto = req.params.kto;
	const tokenKto = req.params.token;
	const wiadomosc = req.body.wiadomosc;
	const kiedy = new Date().toISOString().split('T')[0];
	console.log("["+new Date().toLocaleString('pl')+"]", kto, "dodał notatke", komu);
	db.query("INSERT INTO `notatkiprofilowe` (`kto`,`komu`,`data`,`tekst`) VALUES ((SELECT `id` FROM `konta` WHERE `login` = ? AND `token` = ?), (SELECT `id` FROM `konta` WHERE `login` = ?), ?, ?)", [kto, tokenKto, komu, kiedy, wiadomosc], async (er, result) => {
		if(result.affectedRows > 0){
			res.send({odp: 'OK'});
			const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`Użytkownik [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) dodał nową notatkę na profilu użytkownika [${req.params.komu}](https://system.thebossspedition.pl/profil/${req.params.komu})`).setTitle("Nowa notatka").addFields({name: "Treść", value: req.body.wiadomosc}).addFields({name: "ID Notatki", value: `\u200B${result.insertId}`});
			const czanel = dcbot.channels.cache.get(process.env.CHANNEL_NOTATKI);
			await czanel.send({embeds: [embed1]});
			db.query("SELECT `discord` as 'd' FROM `konta` WHERE `login` = ?", [req.params.komu], async (erk, rk) => {
				if(rk.length > 0){
					if(rk[0].d){
						const embed2 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`[${req.params.komu}](https://system.thebossspedition.pl/profil/${req.params.komu}) na twoim profilu pojawiła się\nnowa notatka od użytkownika [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto})`).setTitle("Nowa notatka").addFields({name: "Treść", value: req.body.wiadomosc});
						dcbot.users.send(rk[0].d, {embeds: [embed2]}).catch(async (er) => {
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${rk[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					}
				}
			});
		} else {
			res.send({blad: 'Nie dodano...'});
		}
	})
});
app.post("/usunKomentarz/:kto/:komu/:idkom", (req, res) => {
	//dc zrobione
	const idkom = req.params.idkom;
	console.log(dataLog(), req.params.kto, "usunal", req.params.komu, "komentarz o ID:", idkom);
	let wiadomosc;
	db.query("SELECT `tekst` as 'w' FROM `notatkiprofilowe` WHERE `id` = ?", [idkom], (erw, rw) => {
		if(rw.length > 0){
			wiadomosc = rw[0].w;
		}
		db.query("DELETE FROM `notatkiprofilowe` WHERE `id` = ?", [idkom], async (er, result) => {
			if(result.affectedRows > 0){
				res.send({odp: 'OK'});
				const embed1 = new EmbedBuilder().setColor(0xA50000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`Użytkownik [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął notatkę z profilu użytkownika [${req.params.komu}](https://system.thebossspedition.pl/profil/${req.params.komu})`).setTitle("Usunięcie notatki").addFields({name: "Usuwana treść", value: wiadomosc}).addFields({name: "ID Notatki", value: `\u200B${idkom}`});
				const czanel = dcbot.channels.cache.get(process.env.CHANNEL_NOTATKI);
				await czanel.send({embeds: [embed1]});
				db.query("SELECT `discord` as 'd' FROM `konta` WHERE `login` = ?", [req.params.komu], async (erk, rk) => {
					if(rk.length > 0){
						if(rk[0].d){
							try {
								const embed2 = new EmbedBuilder().setColor(0xA50000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png').setTimestamp().setFooter({ text: 'System The Boss Spedition'}).setDescription(`Na [twoim profilu](https://system.thebossspedition.pl/profil/${req.params.komu}) użytkownik [${req.params.kto}](https://system.thebossspedition.pl/profil/${req.params.kto}) usunął notatkę.`).setTitle("Usunięcie notatki").addFields({name: 'Treść usuniętej notatki:', value: wiadomosc});
								dcbot.users.send(rk[0].d, {embeds: [embed2]}).catch(async (er) => {
									const ogolny = dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY);
									await ogolny.send(`<@${rk[0].d}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
								});
							} catch (er) {
								console.log(er);
							}
						}
					}
				});
			} else {
				res.send({blad: 'Nie usunieto'});
			}
		});
	});
})
app.post("/profilFullDane/:token", async (req, res) => {
	//dc niepotrzebne
	const token = req.params.token;
	db.query("SELECT `email`, `truck`, `garaz`, `truckbook`, `truckersmp`, `worldoftrucks`, `steam` FROM `konta` WHERE `token` = ?", [token], (er, result) => {
		if(result.length > 0){
			res.send({dane: result[0]});
		} else {
			res.send({blad: "Zly token"});
		}
	});
});
app.post("/zaktualizujProfil/:token/:login", upload.single('awatarImg'), (req, res) => {
	//dc zrobione
	const token = req.params.token;
	const login = req.params.login;
	console.log(dataLog(), "Zmiany dla profilu", login);
	db.query("SELECT * FROM `konta` WHERE `token` = ? AND `login` = ?", [token, login], async (er, result) => {
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
				db.query("UPDATE `konta` SET `haslo` = ? WHERE `token` = ?" , [haslo, token]);
				console.log("Zmieniono hasło dla", login);
				embed1.addFields({name: 'Zmieniono hasło.', value: '\u200B'});
				embed2.addFields({name: 'ZMIENIONO HASŁO!', value: '\u200B'});
			}
			if(req.body.truck && (req.body.truck != aktualneDane.truck)){
				db.query("UPDATE `konta` SET `truck` = ? WHERE `token` = ?" , [req.body.truck, token]);
				console.log("Zmiana trucka dla", login, aktualneDane.truck, "->", req.body.truck);
				embed1.addFields({name: 'Ulubiony truck:', value: `${aktualneDane.truck} ➡ ${req.body.truck}`});
				embed2.addFields({name: 'Ulubiony truck:', value: `${aktualneDane.truck} ➡ ${req.body.truck}`});
			}
			if(req.body.garaz && (req.body.garaz != aktualneDane.garaz)){
				db.query("UPDATE `konta` SET `garaz` = ? WHERE `token` = ?" , [req.body.garaz, token]);
				console.log("Zmiana garazu dla", login, aktualneDane.garaz, "->", req.body.garaz);
				embed1.addFields({name: 'Garaż:', value: `${aktualneDane.garaz} ➡ ${req.body.garaz}`});
				embed2.addFields({name: 'Garaż:', value: `${aktualneDane.garaz} ➡ ${req.body.garaz}`});
			}
			if(req.body.steam && (req.body.steam != aktualneDane.steam)){
				db.query("UPDATE `konta` SET `steam` = ? WHERE `token` = ?" , [req.body.steam, token]);
				console.log("Zmiana steama dla", login, aktualneDane.steam, "->", req.body.steam);
				embed1.addFields({name: 'Steam:', value: `${aktualneDane.steam} ➡ ${req.body.steam}`});
				embed2.addFields({name: 'Steam:', value: `${aktualneDane.steam} ➡ ${req.body.steam}`});
			}
			if(req.body.truckersmp && (req.body.truckersmp != aktualneDane.truckersmp)){
				db.query("UPDATE `konta` SET `truckersmp` = ? WHERE `token` = ?" , [req.body.truckersmp, token]);
				console.log("Nowy truckersmp link dla", login, aktualneDane.truckersmp, "->", req.body.truckersmp);
				embed1.addFields({name: 'TruckersMP:', value: `${aktualneDane.truckersmp} ➡ ${req.body.truckersmp}`});
				embed2.addFields({name: 'TruckersMP:', value: `${aktualneDane.truckersmp} ➡ ${req.body.truckersmp}`});
			}
			if(req.body.truckbook && (req.body.truckbook != aktualneDane.truckbook)){
				db.query("UPDATE `konta` SET `truckbook` = ? WHERE `token` = ?" , [req.body.truckbook, token]);
				console.log("Nowy truckbook link dla", login, aktualneDane.truckbook, "->", req.body.truckbook);
				embed1.addFields({name: 'TrucksBook:', value: `${aktualneDane.truckbook} ➡ ${req.body.truckbook}`});
				embed2.addFields({name: 'TrucksBook:', value: `${aktualneDane.truckbook} ➡ ${req.body.truckbook}`});
			}
			if(req.body.worldoftrucks && (req.body.worldoftrucks != aktualneDane.worldoftrucks)){
				db.query("UPDATE `konta` SET `worldoftrucks` = ? WHERE `token` = ?" , [req.body.worldoftrucks, token]);
				console.log("Nowy worldoftrucks link dla", login, aktualneDane.worldoftrucks, "->", req.body.worldoftrucks);
				embed1.addFields({name: 'World of Trucks:', value: `${aktualneDane.worldoftrucks} ➡ ${req.body.worldoftrucks}`});
				embed2.addFields({name: 'World of Trucks:', value: `${aktualneDane.worldoftrucks} ➡ ${req.body.worldoftrucks}`});
			}
			if(req.body.email && (req.body.email != aktualneDane.email)){
				db.query("UPDATE `konta` SET `email` = ? WHERE `token` = ?" , [req.body.email, token]);
				console.log("Zmiana emailu dla", login, aktualneDane.email, "->", req.body.email);
				embed1.addFields({name: 'E-Mail:', value: `${aktualneDane.email} ➡ ${req.body.email}`});
				embed2.addFields({name: 'E-Mail:', value: `${aktualneDane.email} ➡ ${req.body.email}`});
			}
			if(req.file){
				const nowaNazwa = req.file.destination + req.file.filename;
				db.query("UPDATE `konta` SET `awatar` = ? WHERE `token` = ?" , [nowaNazwa, token]);
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
				await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${result[0].discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
			});
			res.send({odp: "OK"});
		} else {
			res.send({blad: "Nie ma takiego uzytkownika!"});
		} 
	});
});
app.post("/licznikTrasPopraw/:token", (req, res) => {
	if(!req.params.token) return;
	db.query("SELECT COUNT(*) as 'd' FROM `trasy` WHERE `zatwierdz` = 2 AND `dozwolpoprawke` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?)", [req.params.token], (er, r) => {
		if(r.length){
			res.send({odp: r[0].d});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/sprawdzUprawnienie/:login/licencjeATS", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 52 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.izo = result[0]['dokiedy'];
		} else {
			tmp.izo = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 66 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.klo = result[0]['dokiedy'];
			} else {
				tmp.klo = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 56 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.chlo = result[0]['dokiedy'];
				} else {
					tmp.chlo = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 58 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.podk = result[0]['dokiedy'];
					} else {
						tmp.podk = "Brak";
					}
					db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 64 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
						if(result.length > 0){
							tmp.cys = result[0]['dokiedy'];
						} else {
							tmp.cys = "Brak";
						}
						db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 68 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
							if(result.length > 0){
								tmp.niskpodl = result[0]['dokiedy'];
							} else {
								tmp.niskpodl = "Brak";
							}
							db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 72 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
								if(result.length > 0){
									tmp.lora = result[0]['dokiedy'];
								} else {
									tmp.lora = "Brak";
								}
								db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 60 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
									if(result.length > 0){
										tmp.plat = result[0]['dokiedy'];
									} else {
										tmp.plat = "Brak";
									}
									db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 70 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
										if(result.length > 0){
											tmp.bydl = result[0]['dokiedy'];
										} else {
											tmp.bydl = "Brak";
										}
										db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 62 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
											if(result.length > 0){
												tmp.wywr = result[0]['dokiedy'];
											} else {
												tmp.wywr = "Brak";
											}
											res.send(tmp);
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/szkoleniaATS", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 53 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.izo = result[0]['dokiedy'];
		} else {
			tmp.izo = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 67 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.klo = result[0]['dokiedy'];
			} else {
				tmp.klo = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 57 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.chlo = result[0]['dokiedy'];
				} else {
					tmp.chlo = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 59 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.podk = result[0]['dokiedy'];
					} else {
						tmp.podk = "Brak";
					}
					db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 65 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
						if(result.length > 0){
							tmp.cys = result[0]['dokiedy'];
						} else {
							tmp.cys = "Brak";
						}
						db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 69 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
							if(result.length > 0){
								tmp.niskpodl = result[0]['dokiedy'];
							} else {
								tmp.niskpodl = "Brak";
							}
							db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 73 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
								if(result.length > 0){
									tmp.lora = result[0]['dokiedy'];
								} else {
									tmp.lora = "Brak";
								}
								db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 61 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
									if(result.length > 0){
										tmp.plat = result[0]['dokiedy'];
									} else {
										tmp.plat = "Brak";
									}
									db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 71 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
										if(result.length > 0){
											tmp.bydl = result[0]['dokiedy'];
										} else {
											tmp.bydl = "Brak";
										}
										db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 63 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
											if(result.length > 0){
												tmp.wywr = result[0]['dokiedy'];
											} else {
												tmp.wywr = "Brak";
											}
											res.send(tmp);
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/licencjeETS", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 4 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.fir = result[0]['dokiedy'];
		} else {
			tmp.fir = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 6 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.klo = result[0]['dokiedy'];
			} else {
				tmp.klo = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 8 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.chlo = result[0]['dokiedy'];
				} else {
					tmp.chlo = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 10 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.podk = result[0]['dokiedy'];
					} else {
						tmp.podk = "Brak";
					}
					db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 12 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
						if(result.length > 0){
							tmp.cys = result[0]['dokiedy'];
						} else {
							tmp.cys = "Brak";
						}
						db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 14 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
							if(result.length > 0){
								tmp.niskpodw = result[0]['dokiedy'];
							} else {
								tmp.niskpodw = "Brak";
							}
							db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 16 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
								if(result.length > 0){
									tmp.niskpodl = result[0]['dokiedy'];
								} else {
									tmp.niskpodl = "Brak";
								}
								db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 18 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
									if(result.length > 0){
										tmp.lora = result[0]['dokiedy'];
									} else {
										tmp.lora = "Brak";
									}
									db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 20 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
										if(result.length > 0){
											tmp.plat = result[0]['dokiedy'];
										} else {
											tmp.plat = "Brak";
										}
										db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 35 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
											if(result.length > 0){
												tmp.katCE = result[0]['dokiedy'];
											} else {
												tmp.katCE = "Brak";
											}
											db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 40 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
												if(result.length > 0){
													tmp.adr = result[0]['dokiedy'];
												} else {
													tmp.adr = "Brak";
												}
												db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 41 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
													if(result.length > 0){
														tmp.gab = result[0]['dokiedy'];
													} else {
														tmp.gab = "Brak";
													}
													db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 42 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
														if(result.length > 0){
															tmp.dlug = result[0]['dokiedy'];
														} else {
															tmp.dlug = "Brak";
														}
														db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 44 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
															if(result.length > 0){
																tmp.bydl = result[0]['dokiedy'];
															} else {
																tmp.bydl = "Brak";
															}
															db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 45 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
																if(result.length > 0){
																	tmp.wywr = result[0]['dokiedy'];
																} else {
																	tmp.wywr = "Brak";
																}
																res.send(tmp);
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/szkoleniaETS", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 5 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.fir = result[0]['dokiedy'];
		} else {
			tmp.fir = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 7 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.klo = result[0]['dokiedy'];
			} else {
				tmp.klo = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 9 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.chlo = result[0]['dokiedy'];
				} else {
					tmp.chlo = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 11 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.podk = result[0]['dokiedy'];
					} else {
						tmp.podk = "Brak";
					}
					db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 13 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
						if(result.length > 0){
							tmp.cys = result[0]['dokiedy'];
						} else {
							tmp.cys = "Brak";
						}
						db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 15 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
							if(result.length > 0){
								tmp.niskpodw = result[0]['dokiedy'];
							} else {
								tmp.niskpodw = "Brak";
							}
							db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 17 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
								if(result.length > 0){
									tmp.niskpodl = result[0]['dokiedy'];
								} else {
									tmp.niskpodl = "Brak";
								}
								db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 19 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
									if(result.length > 0){
										tmp.lora = result[0]['dokiedy'];
									} else {
										tmp.lora = "Brak";
									}
									db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 21 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
										if(result.length > 0){
											tmp.plat = result[0]['dokiedy'];
										} else {
											tmp.plat = "Brak";
										}
										db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 48 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
											if(result.length > 0){
												tmp.katCE = result[0]['dokiedy'];
											} else {
												tmp.katCE = "Brak";
											}
											db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 49 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
												if(result.length > 0){
													tmp.adr = result[0]['dokiedy'];
												} else {
													tmp.adr = "Brak";
												}
												db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 50 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
													if(result.length > 0){
														tmp.gab = result[0]['dokiedy'];
													} else {
														tmp.gab = "Brak";
													}
													db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 51 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
														if(result.length > 0){
															tmp.dlug = result[0]['dokiedy'];
														} else {
															tmp.dlug = "Brak";
														}
														db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 43 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
															if(result.length > 0){
																tmp.bydl = result[0]['dokiedy'];
															} else {
																tmp.bydl = "Brak";
															}
															db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 46 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
																if(result.length > 0){
																	tmp.wywr = result[0]['dokiedy'];
																} else {
																	tmp.wywr = "Brak";
																}
																res.send(tmp);
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienieTrasy", (req, res) => {
	//dc niepotrzebne
	if(!req.body.idosoby || !req.body.idnaczepy || !req.body.kiedy){
		res.send({posiada: false, blad: "Niepelne parametry"});
	} else {
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `kto` = ? AND `naco` = ? AND `odkiedy` <= ? ORDER BY `dokiedy` DESC", [req.body.idosoby, req.body.idnaczepy, req.body.kiedy], (er, r) => {
			if(!er){
				console.log(r[0]);
				if(r.length > 0){
					res.send({posiada: r[0].dokiedy});
				} else {
					res.send({posiada: false});
				}
			} else {
				console.log(er);
				res.send({posiada: false, blad: "cos nie tak z sql"});
			}
		});
	}
});
app.post("/rekrutacjaIlosc", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT COUNT(*) as 'l' FROM `rekrutacja` WHERE `klucz` = 'potwierdzone'", (er, r) => {
		if(er){
			console.log(er);
			res.send({response: true, liczba: 0});
			return;
		}
		res.send({response: true, liczba: r[0].l});
	});
});
app.post("/rekrutacja/:token", (req, res) => {
	//dc niepotrzebne
	if(!req.params.token) return;
	db.query("SELECT * FROM `rekrutacja` WHERE `klucz` = 'potwierdzone'", (er, r) => {
		if(er){
			console.log(er);
			res.send({response: true, dane: null});
			return;
		}
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz) => {
				tmp.push(wiersz);
			})
			res.send({response: true, dane: tmp});
		} else {
			res.send({response: true, dane: null});
		}
	});
});
app.post("/zlozRekrutacje", (req, res) => {
	db.query("INSERT INTO `rekrutacja` (`rekrutacja`.`pseudonim`, `rekrutacja`.`ktopolecil`, `rekrutacja`.`steamid`, `rekrutacja`.`lat`, `rekrutacja`.`godzin`, `rekrutacja`.`email`, `rekrutacja`.`truckbook`, `rekrutacja`.`truckersmp`, `rekrutacja`.`dlaczego`, `rekrutacja`.`klucz`, `rekrutacja`.`discord`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'brak')", [req.body.pseudonim, req.body.ktopolecil, req.body.steamid, req.body.lat, req.body.godzin, req.body.email, req.body.truckbook, req.body.truckersmp, req.body.dlaczego, req.body.md5], async (er, r) => {
		if(er){
			console.log("Błąd rekrutacji", er);
			res.send({blad: "Błąd przyjęcia zgłoszenia"});
			return;
		}
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
	});
});
app.post("/potwierdzRekrutacje", (req, res) => {
	db.query("SELECT `pseudonim`, `discord` FROM `rekrutacja` WHERE `email` = ? AND `klucz` = ?", [req.body.email, req.body.klucz], (er, r) => {
		if(r.length > 0){
			db.query("UPDATE `rekrutacja` SET `klucz`='potwierdzone', `discord` = ? WHERE `email` = ? AND `klucz` = ?", [req.body.discord, req.body.email, req.body.klucz], async (er2, r2) => {
				if(er2){
					console.log(er2);
					res.send({blad: "Błąd SQL"});
					return;
				}
				if(r2.affectedRows > 0){
					res.send({odp: "OK"});
					const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
					.setDescription(`Użytkownik ${r[0].pseudonim}, <@${req.body.discord}> złożył zgłoszenie rekrutacyjne!`)
					.setTitle("Nowe zgłoszenie rekrutacyjne");
					await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
				}
			});
		} else {
			res.send({blad: "Zero wynikow"});
		}
	});
});
app.post("/rekrutacjaOdrzuc/:login/:token", (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token) return;
	db.query("UPDATE `rekrutacja` SET `klucz` = 'odrzucone' WHERE `id` = ?", [req.body.id], async (er, r) => {
		if(er){
			console.log(dataLog(), "Wystąpił błąd z odrzuceniem podania rekrutacyjnego o ID: ", req.body.id);
			res.send({blad: "Błąd SQL"});
			return;
		}
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
					await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
				});
			});
			const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
			.setDescription(`${req.params.login} odrzucił zgłoszenie rekrutacyjne ${req.body.pseudonim}\nE-mail osoby: ${req.body.email}\nDiscord osoby: <@${req.body.discord}>`)
			.setTitle("Odrzucone zgłoszenie rekrutacyjne");
			await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
		}
	});
});
app.post("/rekrutacjaPrzyjmij/:login/:token", (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token) return;
	db.query("UPDATE `rekrutacja` SET `klucz` = 'przyjety' WHERE `id` = ?", [req.body.id], (er, r) => {
		if(er){
			console.log(dataLog(), "Wystąpił błąd z przyjęciem podania rekrutacyjnego o ID", req.body.id);
			res.send({blad: "Błąd SQL"});
			return;
		}
		if(r.affectedRows > 0){
			console.log(dataLog(), `${req.params.login} pomyślnie przyjął podanie rekrutacyjne użytkownika ${req.body.pseudonim}`);
			const generujHaslo = Math.random().toString(36).slice(2, 10);
			const szyfrujHaslo = CryptoJS.HmacSHA1(generujHaslo, KLUCZ_H).toString();
			db.query("INSERT INTO `konta` (`login`, `email`,`haslo`,`typkonta`,`rangi`,`stawka`,`discord`,`steam`,`truckbook`,`truckersmp`) VALUES (?, ?, ?, 10, 13, 0.10, ?, ?, ?, ?)", [req.body.pseudonim, req.body.email, szyfrujHaslo, req.body.discord, "https://steamcommunity.com/profiles/"+req.body.steamid, "https://trucksbook.eu/users/all/0?search="+req.body.truckbook, "https://truckersmp.com/user/"+req.body.truckersmp], async (er2, r2) => {
				if(er2){
					console.log(er2);
					db.query("UPDATE `rekrutacja` SET `klucz` = 'potwierdzone' WHERE `id` = ?", [req.body.id]);
					console.log(dataLog(), `Wystąpił błąd podczas tworzenia konta dla przyjętego kierowcy ${req.body.pseudonim}! Cofam stan podania do ponownego rozpatrzenia.`);
					res.send({blad: er2});
					return;
				}
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
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.discord}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					});
					const embed1 = new EmbedBuilder().setColor(0x00E10F).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.setTimestamp().setFooter({ text: 'System The Boss Spedition'})
					.setDescription(`${req.params.login} zaakceptował zgłoszenie rekrutacyjne ${req.body.pseudonim}\nStworzono nowy profil w systemie z ograniczonym dostępem.`)
					.setTitle("Zaakceptowane zgłoszenie rekrutacyjne");
					await dcbot.channels.cache.get(process.env.CHANNEL_REKRUTACJA).send({embeds: [embed1]});
				}
			});
		}
	});
});
app.post("/profilWiniety/:login", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	const dzis = new Date().toISOString().split('T')[0];
	db.query("SELECT `kupionewiniety`.`id` as 'idwiniety', `kupionewiniety`.`kraj` as 'idkraj', `kupionewiniety`.`dokiedy` as 'dokiedy', `winiety`.`kraj` as 'flaga' FROM `kupionewiniety`, `winiety` WHERE `kupionewiniety`.`kraj` = `winiety`.`id` AND `kupionewiniety`.`dokiedy` >= ? AND `kupionewiniety`.`kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `winiety`.`kraj` ASC", [dzis, login], (er, result) => {
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
});
app.post("/wszystkieWiniety", (req, res) => {
	//dc niepotrzebne
	let tmp = [];
	db.query("SELECT * FROM `winiety` ORDER BY `kraj` ASC", (er, r) => {
		if(er){
			console.log(er);
			res.send({blad: "Blad sql"});
			return;
		}
		if(r.length > 0){
			r.forEach((w) => {
				tmp.push({id: w.id, kraj: w.kraj, cena: w.cena});
			});
			res.send({response: true, dane: tmp});
		} else {
			res.send({response: true, dane: null});
		}
	});
});
app.post("/ustawWiniete/:login", (req, res) => {
	//dc zrobione
	if(!req.params.login) return;
	db.query("SELECT `cena` as 'c' FROM `winiety` WHERE `id` = ?", [req.body.ktora], (erc, rc) => {
		db.query("UPDATE `winiety` SET `cena` = ? WHERE `id` = ?", [req.body.cena, req.body.ktora], (er, r) => {
			if(er){
				console.log(er);
				res.send({blad: 'Blad sql'});
				return;
			}
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
		});
	});
});
app.post("/swojeWiniety/:token", (req, res) => {
	//dc niepotrzebne
	const token = req.params.token;
	db.query("SELECT `kupionewiniety`.`id` as 'idwiniety', `kupionewiniety`.`kraj` as 'idkraj', `kupionewiniety`.`dokiedy` as 'dokiedy', `winiety`.`kraj` as 'flaga' FROM `kupionewiniety`, `winiety` WHERE `kupionewiniety`.`kraj` = `winiety`.`id` AND `kupionewiniety`.`kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) ORDER BY `winiety`.`kraj` ASC", [token], (er, result) => {
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
});
app.post("/czyjesWiniety/:login/:token", (req, res) => {
	//dc niepotrzebne
	const login = req.params.login;
	const token = req.params.token;
	if(!login || !token){
		res.send({blad: "Niepoprawne zapytanie"});
		return;
	}
	db.query("SELECT `kupionewiniety`.`id` as 'idwiniety', `kupionewiniety`.`kraj` as 'idkraj', `kupionewiniety`.`dokiedy` as 'dokiedy', `winiety`.`kraj` as 'flaga' FROM `kupionewiniety`, `winiety` WHERE `kupionewiniety`.`kraj` = `winiety`.`id` AND `kupionewiniety`.`kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `winiety`.`kraj` ASC", [login], (er, result) => {
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
});
app.post("/zakupWinietyNowe/:token", (req, res) => {
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
	db.query("SELECT `id` FROM `konta` WHERE `token` = ?", req.params.token, (er, r) => {
		const id = r[0].id;
		req.body.ktore.map((w) => {
			tmp.push([id, w, dokiedy, req.body.cena]);
		})
		db.query("INSERT INTO `kupionewiniety` (`kto`,`kraj`,`dokiedy`,`zaile`) VALUES ?", [tmp], (er2, r2) => {
			if(er2){
				console.log(er2);
				res.send({blad: "Blad SQL"});
			}
			if(r2.affectedRows > 0){
				console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} zakupił nowe winiety ${req.body.ktore}`);
				res.send({odp: "OK"});
			}
		});
	});
});
app.post("/zakupWinietyWazne/:token", (req, res) => {
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
	db.query("UPDATE `kupionewiniety` SET `dokiedy` = ADDDATE(`dokiedy`, 31), `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) AND `kraj` IN (?) AND `dokiedy` >= ?", [req.body.cena, req.params.token, tmp, dzis], (er2, r2) => {
		if(er2){
			console.log(er2);
			res.send({blad: "Blad SQL"});
		}
		if(r2.affectedRows > 0){
			console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} przedłużył winiety ${req.body.ktore}`);
			res.send({odp: "OK"});
		}
	});
});
app.post("/zakupWinietyWygasle/:token", (req, res) => {
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
	db.query("UPDATE `kupionewiniety` SET `dokiedy` = ?, `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) AND `kraj` IN (?)", [dokiedy, req.body.cena, req.params.token, tmp], (er2, r2) => {
		if(er2){
			console.log(er2);
			res.send({blad: "Blad SQL"});
		}
		if(r2.affectedRows > 0){
			console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} odnowił wygasłe winiety ${req.body.ktore} do ${dokiedy}`);
			res.send({odp: "OK"});
		}
	});
});
app.post("/nadajWinietyNowe/:komu/:token", (req, res) => {
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
	db.query("SELECT `id` FROM `konta` WHERE `login` = ?", req.params.komu, (er, r) => {
		const id = r[0].id;
		req.body.ktore.map((w) => {
			tmp.push([id, w, dokiedy, req.body.cena]);
		})
		db.query("INSERT INTO `kupionewiniety` (`kto`,`kraj`,`dokiedy`,`zaile`) VALUES ?", [tmp], (er2, r2) => {
			if(er2){
				console.log(er2);
				res.send({blad: "Blad SQL"});
			}
			if(r2.affectedRows > 0){
				res.send({odp: "OK"});
			}
		});
	});
});
app.post("/nadajWinietyWazne/:komu/:token", (req, res) => {
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
	db.query("UPDATE `kupionewiniety` SET `dokiedy` = ADDDATE(`dokiedy`, 31), `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) AND `kraj` IN (?) AND `dokiedy` >= ?", [req.body.cena, req.params.komu, tmp, dzis], (er2, r2) => {
		if(er2){
			console.log(er2);
			res.send({blad: "Blad SQL"});
		}
		if(r2.affectedRows > 0){
			res.send({odp: "OK"});
		}
	});
});
app.post("/nadajWinietyWygasle/:komu/:token", (req, res) => {
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
	db.query("UPDATE `kupionewiniety` SET `dokiedy` = ?, `zaile` = `zaile` + ? WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) AND `kraj` IN (?)", [dokiedy, req.body.cena, req.params.komu, tmp], (er2, r2) => {
		if(er2){
			console.log(er2);
			res.send({blad: "Blad SQL"});
		}
		if(r2.affectedRows > 0){
			res.send({odp: "OK"});
		}
	});
});
app.post("/ostatnieTrasy/:token", (req,res) => {
	//dc niepotrzebne
	const token = req.params.token;
	db.query("SELECT * FROM `trasy` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) ORDER BY `id` DESC LIMIT 10", [token], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push(trasa);
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/dyspozytorTrasy", (req,res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `trasy` WHERE `zatwierdz` = 0 ORDER BY `id` ASC", (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push(trasa);
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/rozpatrzenieTrasy/:token/:idtrasy", (req, res) => {
	//dc zrobione
	const idtrasy = req.params.idtrasy;
	const token = req.params.token;
	const k = new Date();
    k.setHours(k.getHours() + 2);
    const dzis = k.toISOString().slice(0, 19).replace("T", " ");
	if(req.body.zatwierdz != 2){
		//zatwierdzanie
		db.query("UPDATE `trasy` SET `premia` = ?, `zatwierdz` = 1, `kara` = ?, `powododrzuc` = '', `wlasnyzarobek` = (SELECT `stawka` FROM `konta` WHERE `id` = ?)*? WHERE `id` = ?", [ req.body.nadawanaPremia ? req.body.nadawanaPremia : 0, req.body.grzywna ? req.body.grzywna : 0, req.body.kto, req.body.przejechane, idtrasy], (er, r) => {
			if(er) console.log(er);
			if(r.affectedRows > 0){
				db.query("INSERT INTO `dysphistoria` (`kto`, `trasa`, `kiedy`, `akcja`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, 1)", [token, idtrasy, dzis]);
				let dyspozytor;
				let kierowca;
				let wlasnyzarobek;
				let dckierowcy;
				db.query("SELECT * FROM `kontofirmowe` WHERE `opis` = ?", [`Trasa ${idtrasy}`], (erkf, rkf) => {
					if(rkf.length > 0){
						rkf.forEach(xx => {
							db.query("DELETE FROM `kontofirmowe` WHERE `id` = ?", xx['id']);
						});
					} 
					db.query("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?-(SELECT `wlasnyzarobek` FROM `trasy` WHERE `id` = ?), ?)", [req.body.dlaFirmy, idtrasy, `Trasa ${idtrasy}`]);
				});
				db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [token], (erd, rd) => {
					dyspozytor = rd[0].l;
					db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `trasy` WHERE `id` = ?)", [idtrasy], (erk, rk) => {
						kierowca = rk[0].l;
						dckierowcy = rk[0].d;
						db.query("SELECT `wlasnyzarobek` as 'w' FROM `trasy` WHERE `id` = ?", [idtrasy], async (ert, rt) => {
							wlasnyzarobek = rt[0].w;
							zarobekfirmydc = (parseFloat(req.body.dlaFirmy) - parseFloat(wlasnyzarobek)).toFixed(2);
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dckierowcy}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						});
					});
				})
				console.log(`[${new Date().toLocaleString('pl')}] ${token} zatwierdził trasę ${idtrasy}, Kara: ${req.body.grzywna}, Premia: ${req.body.nadawanaPremia}`);
				res.send({odp: 'OK'});
			} else {
				res.send({blad: 'Nie zatwierdzono'});
			}
		});
	} else {
		//odrzucanie
		db.query("UPDATE `trasy` SET `zatwierdz` = 2, `powododrzuc` = ?, `dozwolpoprawke` = ? WHERE `id` = ?", [req.body.powod, req.body.dozwolpoprawe, idtrasy], (er, r) => {
			if(er) console.log(er);
			if(r.affectedRows > 0){
				db.query("SELECT * FROM `kontofirmowe` WHERE `opis` = ?", [`Trasa ${idtrasy}`], (erkf, rkf) => {
					if(rkf.length > 0){
						rkf.forEach(xx => {
							db.query("DELETE FROM `kontofirmowe` WHERE `id` = ?", xx['id']);
						});
					}
				});
				db.query("INSERT INTO `dysphistoria` (`kto`, `trasa`, `kiedy`, `akcja`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, 0)", [token, idtrasy, dzis]);
				console.log(`[${new Date().toLocaleString('pl')}] ${token} odrzucił trasę ${idtrasy} z powodem:\n ${req.body.powod}`);
				res.send({odp: 'OK'});
				let dyspozytor;
				let kierowca;
				let dckierowcy;
				db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [token], (erd, rd) => {
					dyspozytor = rd[0].l;
					db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `trasy` WHERE `id` = ?)", [idtrasy], async (erk, rk) => {
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
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${dckierowcy}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					});
				})
			} else {
				res.send({blad: 'Nie odrzucono'});
			}
		});
	}
});
app.post("/kartaPaliwowaDane/:login", (req, res) => {
	//dc niepotrzebne
	if(!req.params.login) {
		res.send({response: true, blad: "Niepoprawny profil"});
		return;
	}
	//spalanie i wydatki
	db.query("SELECT SUM(`paliwo`) as 'wydatki', SUM(`przejechane`) as 'przejechane', SUM(`spalanie`) as 'spalanie', COUNT(*) as 'trasy' FROM `trasy` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) AND `zatwierdz` = 1", [req.params.login], (er, r) => {
		if(er){
			console.log(er);
			res.send({response: true, blad: "Błąd sql"});
		} else {
			if(r.length > 0){
				const wydane = r[0].wydatki;
				const spalanie = (r[0].spalanie*100/r[0].przejechane).toFixed(1);
				const przejechane = r[0].przejechane;
				const trasy = r[0].trasy;
				res.send({response: true, wydane: wydane, spalanie: spalanie, punkty: 0, przejechane: przejechane, trasy: trasy});
			} else {
				res.send({response: true, wydane: 0, spalanie: null, punkty: 0, przejechane: 0, trasy: 0});
			}
		}
	});
});
app.post("/miastaOld", (req, res) => {
	//dc niepotrzebne
	// dyspozytornia z tego korzysta, nie usuwac
	db.query("SELECT `id`, `miasto`, `kraj`,`gra` FROM `miejscowosci` ORDER BY `kraj`, `miasto` ASC", (er, result) => {
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
});
app.post("/miasta", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT `id`, `miasto`, `kraj`,`gra` FROM `miejscowosci` ORDER BY `kraj`, `miasto` ASC", (er, result) => {
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
});
app.post("/dodajMiasto/:login/:token", (req, res) => {
	//dc zrobione
	if(!req.params.token || !req.params.login) return;
	db.query("INSERT INTO `miejscowosci` (`kraj`, `miasto`, `gra`) VALUES (?, ?, ?)", [req.body.kraj, req.body.miasto, ((req.body.gra == 1) ? 1 : 0)], async (er, r) => {
		if(er){
			console.log(er);
			res.send({blad: "Blad SQL"});
			return;
		}
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
	})
});
app.post("/usunMiasto/:login/:token", (req, res) => {
	//dc zrobione
	if(!req.params.token || !req.params.login) return;
	db.query("DELETE FROM `miejscowosci` WHERE `id` = ?", [req.body.id], async (er, r) => {
		if(er){
			console.log(er);
			res.send({blad: "Blad SQL"});
			return;
		}
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
	})
});
app.post("/typyNaczep", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `typyuprawnien` WHERE `id` != 35", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: true});
		}
	})
});
app.post("/promy", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `prompociag`", (er, r) => {
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
});
app.post("/promyTrasy/:idtrasy", (req, res) => {
	//dc niepotrzebne
	const idtrasy = req.params.idtrasy;
	db.query("SELECT * FROM `trasyprompociag` WHERE `idtrasa` = ?", [idtrasy], (er, r) => {
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
});
app.post("/poprawTrase/:id/:token", upload.any('noweZdj'), (req, res) => {
	//dc zrobione
	const token = req.params.token;
	const idtrasy = req.params.id;
	console.log("["+new Date().toLocaleString('pl')+"]","Poprawka trasy o ID:", idtrasy);
	let fotki = req.body.stareZdj;
	if(req.files){
		req.files.map((noweZdj) => {
			fotki = fotki + " /img/trasy/" + noweZdj.filename;
		});
		db.query("UPDATE `trasy` SET `zdj` = ? WHERE `id` = ?", [fotki, idtrasy]);
	}
	db.query("UPDATE `trasy` SET `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?), `kiedy` = ?, `przejechane` = ?, `komentarz` = ?, `od` = ?, `do` = ?, `ladunek` = ?, `masaladunku` = ?, `naczepa` = ?, `paliwo` = ?, `zatwierdz` = 0, `uszkodzenia` = ?, `spalanie` = ?, `typserwera` = ?, `typzlecenia` = ?, `vmax` = ?, `zarobek` = ?, `dozwolpoprawke` = 0, `ladunekADR` = ?, `ladunekDelikatny` = ?, `ladunekGabaryt` = ? WHERE `id` = ?", [token, req.body.kiedy, req.body.przejechane, req.body.komentarz, req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, req.body.ladunekADR, req.body.ladunekDelikatny, req.body.ladunekGabaryt, idtrasy], (er, result) => {
		if(er) console.log(er);
		if(result.affectedRows > 0){
			res.send({odp: 'Gites majonez'});
			db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `token` = ?", [token], async (erk, rk) => {
				let kierowca = rk[0].l;
				const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Poprawienie trasy")
				.setDescription(`Użytkownik [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) wprowadził poprawki do [trasy ${idtrasy}](https://system.thebossspedition.pl/dyspozytornia/${idtrasy})`)
				.setColor(0x01F1AD)
				.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
				await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
			});
		} else {
			res.send({blad: "chujnia"});
		}
	});
});
app.post("/oddajTrase/:token", upload.any('noweZdj'), (req, res) => {
	//dc zrobione
	const token = req.params.token;
	if(req.files){
		console.log("["+new Date().toLocaleString('pl')+"]","Nowa trasa ze zdjeciami");
		let fotki = [];
		req.files.map((noweZdj) => {
			fotki.push("/img/trasy/" + noweZdj.filename);
		});
		db.query("INSERT INTO `trasy` (`wlasnyzarobek`, `kara`, `gra`, `kto`, `kiedy`, `przejechane`, `komentarz`, `od`, `do`, `ladunek`, `masaladunku`, `naczepa`,  `paliwo`,  `powododrzuc`,  `zatwierdz`,  `uszkodzenia`,  `spalanie`,  `typserwera`,  `typzlecenia`,  `vmax`,  `zarobek`,  `dozwolpoprawke`,  `zdj`,  `ladunekADR`,  `ladunekDelikatny`,  `ladunekGabaryt`) VALUES (0,0,?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  '',  0,  ?,  ?,  ?,  ?,  ?,  ?, 0, ?, ?, ?, ?)", [req.body.gra, token, req.body.kiedy, req.body.przejechane, req.body.komentarz, req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, fotki.join(" ") ,(req.body.ladunekADR == 1) ? 1 : 0, (req.body.ladunekDelikatny == 1) ? 1 : 0, (req.body.ladunekGabaryt == 1) ? 1 : 0], (er, result) => {
			if(er) console.log(er);
			if(result.affectedRows > 0){
				res.send({odp: result.insertId});
				db.query("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.od], (ers, rs) => {
					db.query("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.do], (erdo, rdo) => {
						db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], async (erk, rk) => {
							let kierowca = rk[0].l;
							const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowa trasa")
							.setDescription(`[${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) oddał nową [trasę ${result.insertId}](https://system.thebossspedition.pl/dyspozytornia/${result.insertId}).`)
							.setColor(0x01F1AD)
							.addFields({name: "Ładunek:", value: req.body.ladunek})
							.addFields({name: "Rozpoczęcie w:", value: `${rs[0].k}, ${rs[0].m}`})
							.addFields({name: "Zakończenie w:", value: `${rdo[0].k}, ${rdo[0].m}`})
							.addFields({name: "Uszkodzenia:", value: `${req.body.uszkodzenia}%`})
							.addFields({name: '\u200B', value: "Więcej szczegółów w dyspozytorni."})
							.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
							await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
						});
					});	
				});
			} else {
				res.send({blad: "chujnia"});
			}
		});
	} else {
		console.log("["+new Date().toLocaleString('pl')+"]", "Nowa trasa bez zdjec");
		db.query("INSERT INTO `trasy` (`wlasnyzarobek`, `kara`, `gra`, `kto`, `kiedy`, `przejechane`, `komentarz`, `od`, `do`, `ladunek`, `masaladunku`, `naczepa`, `paliwo`, `powododrzuc`, `zatwierdz`, `uszkodzenia`, `spalanie`, `typserwera`, `typzlecenia`, `vmax`, `zarobek`, `dozwolpoprawke`, `zdj`, `ladunekADR`, `ladunekDelikatny`, `ladunekGabaryt`) VALUES (0,0, ?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 0, ?, ?, ?, ?, ?, ?, 0, '')", [req.body.gra, token, req.body.kiedy, req.body.przejechane, req.body.komentarz, req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, (req.body.ladunekADR == 1) ? 1 : 0, (req.body.ladunekDelikatny == 1) ? 1 : 0, (req.body.ladunekGabaryt == 1) ? 1 : 0], (er, result) => {
			if(result.affectedRows > 0){
				res.send({odp: result.insertId});
				db.query("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.od], (ers, rs) => {
					db.query("SELECT `kraj` as 'k', `miasto` as 'm' FROM `miejscowosci` WHERE `id` = ?", [req.body.do], (erdo, rdo) => {
						db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], async (erk, rk) => {
							let kierowca = rk[0].l;
							const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowa trasa")
							.setDescription(`[${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) oddał nową [trasę ${result.insertId}](https://system.thebossspedition.pl/dyspozytornia/${result.insertId}).`)
							.setColor(0x01F1AD)
							.addFields({name: "Ładunek:", value: req.body.ladunek})
							.addFields({name: "Rozpoczęcie w:", value: `${rs[0].k}, ${rs[0].m}`})
							.addFields({name: "Zakończenie w:", value: `${rdo[0].k}, ${rdo[0].m}`})
							.addFields({name: "Uszkodzenia:", value: `${req.body.uszkodzenia}%`})
							.addFields({name: '\u200B', value: "Więcej szczegółów w dyspozytorni."})
							.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
							await dcbot.channels.cache.get(process.env.CHANNEL_TRASY).send({embeds: [embed1]});
						});
					});
				});
			} else {
				res.send({blad: "chujnia"});
			}
		});
	}
	
});
app.post("/updateTrasaPromy/:id", async (req, res) => {
	//dc niepotrzebne?
	const idtrasy = req.params.id;
	db.query("DELETE FROM `trasyprompociag` WHERE `idtrasa` = ?", [idtrasy], (er, r) => {
		if(er) {
			console.log(er);
			res.send({blad: "Nwm"});
		} else {
			if(r.affectedRows > 0){
				console.log("Usunieto", r.affectedRows, "promow dla trasy", idtrasy);
			}
			if(req.body.promy){
				let przygotujSql = [];
				req.body.promy.map((ajdi) => {
					przygotujSql.push([parseInt(idtrasy), parseInt(ajdi)]);
				})
				db.query("INSERT INTO `trasyprompociag` (`idtrasa`,`idprompociag`) VALUES ?", [przygotujSql], (er2, r2) => {
					if(!er2){
						console.log("["+new Date().toLocaleString('pl')+"]","Dodano", req.body.promy, "promy dla", idtrasy);
						res.send({odp: "GIT"});
					} else {
						console.log(er2);
						res.send({odp: "Nwm"});
					}
				});
			} else {
				res.send({odp: "GIT"});		
			}
		}
	});
});
app.post("/dodajProm/:login/:token", (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token || !req.body.dodawane) return;
	db.query("INSERT INTO `prompociag` (`nazwa`, `kategoria`) VALUES ?", [req.body.dodawane], async (er, r) => {
		if(er){
			console.log(er);
			res.send({blad: "Blad SQL"});
			return;
		}
		if(r.affectedRows > 0){
			console.log(dataLog(), req.params.login, "dodał nowy prom", req.body.dodawane);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Nowy prom/pociąg")
			.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) dodał do systemu ${req.body.dodawane.length > 1 ? "nowe promy/pociągi" : "nowy prom/pociąg"}.`)
			.setColor(0x01F1AD)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
			req.body.dodawane.map((promik) => {
				embed1.addFields({name: "Dodano", value: promik[0].replace(" - ", " ➡ ")});
			})
			await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
			res.send({odp: "ok"});
		}
	});
})
app.post("/usunProm/:login/:token", (req, res) => {
	//dc zrobione
	if(!req.params.login || !req.params.token || !req.body.ktore) return;
	db.query("DELETE FROM `prompociag` WHERE `id` = ?", [req.body.ktore], async (er, r) => {
		if(er){
			console.log(er);
			res.send({blad: "Blad sql"});
			return;
		}
		if(r.affectedRows > 0){
			console.log(dataLog(), req.params.login, "usunął prom ID", req.body.ktore, req.body.nazwa);
			const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Usunięty prom/pociąg")
			.setDescription(`Użytkownik [${req.params.login}](https://system.thebossspedition.pl/profil/${req.params.login}) usunął z systemu prom/pociąg.`)
			.setColor(0x7200D5)
			.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
			.addFields({name: "Usuwany", value: `${req.body.nazwa.replace(" - ", " ➡ ")}`});
			await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
			res.send({odp: 'ok'});
		}
	})
})
app.post("/trasaDane/:trasaID", (req, res) => {
	//dc niepotrzebne
	const trasaID = req.params.trasaID;
	db.query("SELECT * FROM `trasy` WHERE `id` = ?", [trasaID], (err, result) => {
		if(result.length > 0){
			res.send({dane: result[0]});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/dyspHistoria/", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `dysphistoria` ORDER BY `id` DESC LIMIT 15", (er, r) => {
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
});
app.post("/uprHistoria", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `uprawnienia` ORDER BY `id` DESC LIMIT 20", (er, r) => {
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
});
app.post("/uprHistoriaFirmowe", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `kontofirmowe` WHERE `opis` LIKE 'Uprawnienie%' ORDER BY `id` DESC LIMIT 10", (er, r) => {
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
})
app.post("/nadajUpr/:token", (req, res) => {
	const idkomu = req.body.komu;
	const uprawnienia = req.body.uprawnienia;
	const k = new Date();
	k.setHours(k.getHours() + 2);
	const odKiedy = k.toISOString().slice(0, 19).replace("T", " ");
	const sqlFormat = [uprawnienia.map((x) => [idkomu, x.upr, x.gra, (req.body.pokrywajacy == 1) ? 0 : x.koszt, odKiedy, x.waznosc, (req.body.pokrywajacy == 1) ? x.koszt : 0])];
	const pokrywajacySql = [uprawnienia.map((x) => [-1*parseFloat(x.koszt), `${parseInt(x.typ) == 1  ? "Licencja" : "Szkolenie"} [${x.gra ? "ATS" : "ETS2"}] ${x.nazwa} dla użytkownika ${req.body.komuLogin}.`])];
	db.query("SELECT `login` as 'l', `discord` as 'dc' FROM `konta` WHERE `token` = ? AND `typkonta` <= 3", [req.params.token], (er, r) => {
		if(r.length > 0){
			db.query("INSERT INTO `uprawnienia` (`kto`, `naco`, `gra`, `cena`, `odkiedy`, `dokiedy`, `cenaFirmy`) VALUES ?", sqlFormat, async (er2, r2) => {
				if(er2){
					console.log(er2);
					res.send({blad: "Błąd SQL nadawania uprawnień"});
					return;
				}
				if(r2.affectedRows > 0){
					console.log("Nadano uprawnienia");
					if(req.body.pokrywajacy == 1){
						db.query("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES ?", pokrywajacySql, async (er3, r3) => {
							if(er3){
								console.log("Błąd SQL nałożenia kosztów na konto firmowe.");
								res.send({blad: "Błąd SQL nałożenia kosztów na konto firmowe."});
								return;
							}
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
										await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.komuDc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
									});
								}

								
								return;
							}
						});
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${req.body.komuDc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
						return;
					}
				}
			});
		} else {
			console.log("Nieuprawniony");
			res.send({blad: "Nieuprawniony."});
			return;
		}
	});
});
app.post("/dodajUpr/:token", (req, res) => {
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
	
	db.query("INSERT INTO `uprawnienia` (`kto`, `naco`, `dokiedy`, `cena`, `odkiedy`, `gra`) VALUES (?, ?, ?, ?, ?, ?)", [idtypa, idupr, dokiedy, (req.body.ktoplaci == 1) ? 0 : cena, odkiedy, gra], (er, r) => {
		if(er) console.log(er);
		if(r.affectedRows > 0){
			if(req.body.ktoplaci == 1){
				db.query("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?, ?)", [-1*req.body.cena, `Uprawnienie ${r.insertId}`]);
			}
			console.log(`[${new Date().toLocaleString('pl')}] ${req.params.token} nadał uprawnienie ID: ${idupr} Kierowcy o ID ${idtypa} za kwotę ${cena} do ${dokiedy}`);
			db.query("SELECT `nazwa` as 'n', `rodzaj` as 'r' FROM `typyuprawnien` WHERE `id` = ?", [idupr], (eru, ru) => {
				let nazwaUpr = ru[0].n;
				let typUpr = ru[0].r;
				db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], async (erd, rd) => {
					let dysp = rd[0].l;
					db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [idtypa], async (erk, rk) => {
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
					});
				});
			});
			res.send({odp: "ok"});
		} else {
			res.send({blad: "nie dodano"});
		}
	});
});
app.post("/usunUprNowe/:id/:login", (req, res) => {
	//dc zrobione
	const idupr = req.params.id;
	db.query("SELECT `gra` as 'g', `dokiedy` as 'd', `kto` as 'k', `naco` as 'n', `cena` as 'c', `cenaFirmy` as 'cf' FROM `uprawnienia` WHERE `id` = ?", [idupr], (ertu, rtu) => {
		let cena = rtu[0].c;
		let dokiedy = new Date(rtu[0].d).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});
		let gra = (rtu[0].g == 1) ? "ATS" : "ETS2";
		db.query("SELECT `nazwa` as 'n', `rodzaj` as 'r' FROM `typyuprawnien` WHERE `id` = ?", [rtu[0].n], (eru, ru) => {
			let nazwaUpr = ru[0].n;
			let typUpr = ru[0].r;
			let dysp = req.params.login;
			db.query("DELETE FROM `uprawnienia` WHERE `id` = ?", [idupr], (er, r) => {
				if(r.affectedRows > 0){
					res.send({odp: 'usunieto'});
				} else {
					res.send({blad: 'nieusunieto'});
				}
			});

			if(rtu[0].cf){
				db.query("INSERT INTO `kontofirmowe` (`suma`, `opis`) VALUES (?, ?)", [rtu[0].cf, `Zwrot za usuwanie uprawnienie ID: ${idupr}`], (erzwrot, rzwrot) => {
					if(erzwrot){
						console.log("Nie udany zwrot dla konta firmowego, kwota: ", rtu[0].cf);
					}
					if(rzwrot.affectedRows > 0){
						db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [rtu[0].k], async (erk, rk) => {
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
									await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
								});
							}
						});
					}
				});
			} else {
				db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [rtu[0].k], async (erk, rk) => {
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
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					}
				});
			}
		});
	});
	
});
app.post("/usunUpr/:id/:login", (req, res) => {
	//dc zrobione
	const idupr = req.params.id;
	db.query("SELECT `gra` as 'g', `dokiedy` as 'd', `kto` as 'k', `naco` as 'n', `cena` as 'c' FROM `uprawnienia` WHERE `id` = ?", [idupr], (ertu, rtu) => {
		let cena = rtu[0].c;
		let dokiedy = new Date(rtu[0].d).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});
		let gra = (rtu[0].g == 1) ? "ATS" : "ETS2";
		db.query("SELECT `nazwa` as 'n', `rodzaj` as 'r' FROM `typyuprawnien` WHERE `id` = ?", [rtu[0].n], (eru, ru) => {
			let nazwaUpr = ru[0].n;
			let typUpr = ru[0].r;
			let dysp = req.params.login;
			db.query("DELETE FROM `uprawnienia` WHERE `id` = ?", [idupr], (er, r) => {
				if(r.affectedRows > 0){
					res.send({odp: 'usunieto'});
				} else {
					res.send({blad: 'nieusunieto'});
				}
			});
			let zaplacilaFirma = false;
			let ileZaplacilaFirma = 0;
			db.query("SELECT * FROM `kontofirmowe` WHERE `opis` = ?", [`Uprawnienie ${idupr}`], (erkf2, rkf2) => {
				if(rkf2.length > 0){
					zaplacilaFirma = true;
					ileZaplacilaFirma = (-1*parseFloat(rkf2[0]['suma'])).toFixed(2);
				}
				db.query("DELETE FROM `kontofirmowe` WHERE `opis` = ?", [`Uprawnienie ${idupr}`]);
				db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = ?", [rtu[0].k], async (erk, rk) => {
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
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					}
				});
			});
		});
	});
	
});
app.post("/uprawnienia", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `typyuprawnien` ORDER BY `nazwa` ASC", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.map((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send(tmp);
		} else {
			res.send(null);
		}
	})
});
app.post("/listaPodwyzek", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `podwyzka` WHERE `wniosek` IS NULL", (er, r) => {
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
});
app.post("/listaUrlopow", (req, res) => {
	//dc niepotrzebne
	db.query("SELECT * FROM `urlopy` WHERE `status` IS NULL OR `status` = 0", (er, r) => {
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
});
app.post("/urlopOdrzuc/:token", (req, res) => {
	//dc zrobione
	db.query("UPDATE `urlopy` SET `status` = 1, `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?",
		[req.params.token, req.body.idwniosku],
		(err, r) => {
			if(r.affectedRows > 0){
				res.send({odp: 'OK'});
				console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, "odrzucil wniosek o Urlop, ID urlopu:", req.body.idwniosku);
				db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], (erd, rd) => {
					db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `urlopy` WHERE `id` = ?)", [req.body.idwniosku], async (erk, rk) => {
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
					});
				});
			} else {
				res.send({blad: 'Nie odrzucono'});
			}
	});
});
app.post("/urlopAkcept/:token", (req, res) => {
	//dc zrobione
	db.query("UPDATE `urlopy` SET `status` = 2, `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?",
		[req.params.token, req.body.idwniosku],
		(err, r) => {
			if(r.affectedRows > 0){
				res.send({odp: 'OK'});
				console.log(`[${new Date().toLocaleString('pl')}] `,req.params.token, "zaakceptowal wniosek o Urlop, ID urlopu:", req.body.idwniosku);
				db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], (erd, rd) => {
					db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `kto` FROM `urlopy` WHERE `id` = ?)", [req.body.idwniosku], async (erk, rk) => {
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
					});
				});
			} else {
				res.send({blad: 'Nie odrzucono'});
			}
	});
});
//wnioski/podwyzka odrzuc akceptuj
app.post("/podwyzkaOdrzuc/:token", (req, res) => {
	//dc zrobione
	const powod = req.body.powod ? req.body.powod : "Nie podano powodu odrzucenia.";
	db.query("UPDATE `podwyzka` SET `wniosek` = 0, `wniosektxt` = ?, `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?",
		[powod, req.params.token, req.body.idwniosku],
		(err, r) => {
			if(r.affectedRows > 0){
				res.send({odp: 'OK'});
				console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, "odrzucil wniosek o ID:", req.body.idwniosku);
				db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], (erd, rd) => {
					db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `ktozlozyl` FROM `podwyzka` WHERE `id` = ?)", [req.body.idwniosku], async (erk, rk) => {
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
								await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
							});
						}
					});
				});
			} else {
				res.send({blad: 'Nie odrzucono'});
			}
	});
});
app.post("/podwyzkaAkcept/:token", (req, res) => {
	//dc zrobione
	console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, " zaakceptowal wniosek o ID: ", req.body.idwniosku);
	db.query("UPDATE `podwyzka` SET `wniosek` = 1, `wniosektxt` = 'Zaakceptowano', `ktorozpatrzyl` = (SELECT `id` FROM `konta` WHERE `token` = ?) WHERE `id` = ?", [req.params.token, req.body.idwniosku], (err, r) => {
		if(r.affectedRows > 0){
			db.query("UPDATE `konta` SET `stawka` = ?, `rangi` = ? WHERE `id` = ?", [req.body.stawka, req.body.rangi, req.body.idwnioskujacego], (er2, r2) => {
				if(r2.affectedRows > 0){
					res.send({odp: 'OK'});
					db.query("SELECT `nazwa` as 'n' FROM `rangi` WHERE `id` = ?", [req.body.rangi], (ers, rs) => {
						db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], (erd, rd) => {
							db.query("SELECT `login` as 'l', `discord` as 'd' FROM `konta` WHERE `id` = (SELECT `ktozlozyl` FROM `podwyzka` WHERE `id` = ?)", [req.body.idwniosku], async (erk, rk) => {
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
										await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
									});
								}
							});
						});
					});
				} else {
					res.send({blad: 'Zaakceptowano wniosek, ale nie zmieniono wartosci dla konta!'});
				}
			});
		} else {
			res.send({blad: "Nie zaakceptowano podwyzki"});
		}
	});
});
app.post("/administrujProfil/:token", (req, res) => {
	//dc zrobione?
	console.log(`[${new Date().toLocaleString('pl')}] `, req.params.token, " zaktualizowal profil o ID: ", req.body.idosoby);
	db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], (erd, rd) => {
		let dysp = rd[0].l;
		db.query("SELECT * FROM `typkonta`", (ert, rt) => {
			db.query("SELECT * FROM `rangi`", (ers, rs) => {
				db.query("SELECT * FROM `konta` WHERE `id` = ?", [req.body.idosoby], async (ero, ro) => {
					db.query("UPDATE `konta` SET `email` = ?, `login` = ?, `stawka` = ?, `garaz` = ?, `truck` = ?, `typkonta` = ?, `kiedydolaczyl` = ?, `steam` = ?, `discord` = ?, `truckersmp` = ?, `truckbook` = ?, `worldoftrucks` = ?, `rangi` = ? WHERE `id` = ?",
					[req.body.email, req.body.login, req.body.stawka, req.body.garaz, req.body.truck, req.body.typkonta, req.body.datadolaczenia, req.body.steam, req.body.discord, req.body.truckersmp, req.body.truckbook, req.body.worldoftrucks, req.body.stanowisko, req.body.idosoby], (err, r) => {
						if(err) console.log(err);
						if(r.affectedRows > 0) {
							res.send({odp: 'Zaktualizowano profil'});
						} else {
							res.send({blad: 'Nie zaktualizowano profilu'});
						}
					});
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
					aktualneDane.typkonta = rt.filter((tk) => tk.id == ro[0].typkonta)[0].nazwa + " (" + rt.filter((tk) => tk.id == ro[0].typkonta)[0].id+")";
					aktualneDane.rangi = rs.filter((tk) => tk.id == ro[0].rangi)[0].nazwa + " (" + rs.filter((tk) => tk.id == ro[0].rangi)[0].id+")";
					zmianaStanowisko = rs.filter((tk) => tk.id == req.body.stanowisko)[0].nazwa + " (" + req.body.stanowisko + ")";
					zmianaTypkonta = rt.filter((tk) => tk.id == req.body.typkonta)[0].nazwa + " (" + req.body.typkonta + ")";
					let finalKierowca = aktualneDane.login;
					let finalKierowcaDC = aktualneDane.discord;
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zmiany profilowe - Administrator")
					.setColor(0xAF0000).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
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
					embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zedytował konto użytkownika [${finalKierowca}](https://system.thebossspedition.pl/profil/${finalKierowca}).`);
					await dcbot.channels.cache.get(process.env.CHANNEL_INNE).send({embeds: [embed1]});
					if(finalKierowcaDC){
						embed1.setDescription(`Użytkownik [${dysp}](https://system.thebossspedition.pl/profil/${dysp}) zedytował [Twoje konto](https://system.thebossspedition.pl/profil/${finalKierowca}).`);
						await dcbot.users.send(finalKierowcaDC, {embeds: [embed1]}).catch(async () => {
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${finalKierowcaDC}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					}
				});
			});
		});
	});
});
//usuwanie konta
app.post("/usunKonto/:token", (req, res) => {
	console.log(`[${new Date().toLocaleString('pl')}] `, "UWAGA!!!", req.params.token, "USUNĄŁ KONTO O ID:", req.body.idosoby);
	//winiety
	db.query("DELETE FROM `kupionewiniety` WHERE `kto` = ?", [req.body.idosoby], (er, r) => {
		//podwyzki
		db.query("DELETE FROM `podwyzka` WHERE `ktozlozyl` = ? OR `ktorozpatrzyl` = ?", [req.body.idosoby, req.body.idosoby], (er2, r2) => {
			//incydenty
			db.query("DELETE FROM `incydenty` WHERE `kto` = ?", [req.body.idosoby], (er3, r3) => {
				//notatkiprofilowe
				db.query("DELETE FROM `notatkiprofilowe` WHERE `kto` = ? OR `komu` = ?", [req.body.idosoby, req.body.idosoby], (er4, r4) => {
					//dysphistoria
					db.query("DELETE FROM `dysphistoria` WHERE `kto` = ?", [req.body.idosoby], (er5, r5) => {
						//dodawaniekwoty
						db.query("DELETE FROM `dodawaniekwoty` WHERE `komu` = ?", [req.body.idosoby], (er6, r6) => {
							//trasy
							db.query("DELETE FROM `trasy` WHERE `kto` = ?", [req.body.idosoby], (er7, r7) => {
								//uprawnienia
								db.query("DELETE FROM `uprawnienia` WHERE `kto` = ?", [req.body.idosoby], async (er8, r8) => {
									//powiadomienie o usunieciu konta
									db.query("SELECT `login` as 'usuwajacy' FROM `konta` WHERE `token` = ?", [req.params.token], (auERR, auR) => {
										db.query("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `id` = ?", [req.body.idosoby], async (erk, rk) => {
										
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
										} catch (er) {
											console.log(`[${new Date().toLocaleString('pl')}] `, `Nie powiadomiono użytkownika ${rk[0].l} / dc: ${rk[0].d} o usunięciu jego konta.`);
										}
										});

										//konto
										db.query("DELETE FROM `konta` WHERE `id` = ?", [req.body.idosoby], (er9, r9) => {
											if(r9.affectedRows > 0){
												res.send({odp: 'USUNIETO KONTO!'});
											} else {
												res.send({blad: 'Wystapil blad krytyczny'});
											}
										});


									});
								});
							});
						});
					});
				});
			});
		});
	});
});

//wnioski zloz dane init
app.post("/twojeAktDaneWniosek/:token", (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		db.query("SELECT `id`,`rangi`,`stawka` FROM `konta` WHERE `token` = ?", [req.params.token], (err, r) => {
			if(r.length > 0){
				res.send({idosoby: r[0]['id'], aktstawka: r[0]['stawka'], aktstanowisko: r[0]['rangi']});
			} else {
				res.send({blad: 'Nie znaleziono danych dla profilu o takim tokenie!'});
			}
		});
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});
//wnioski zlozone juz
app.post("/historiaPodwyzek/:token", (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		db.query("SELECT * FROM `podwyzka` WHERE `ktozlozyl` = (SELECT `id` FROM `konta` WHERE `token` = ?)", [req.params.token], (err, r) => {
			if(r.length > 0){
				let tmp = [];
				r.forEach((wiersz) => {
					tmp.push({
						idwniosku: wiersz.id,
						kiedy: wiersz.kiedy,
						aktstanowisko: wiersz.aktstanowisko,
						nowestanowisko: wiersz.nowestanowisko,
						aktstawka: wiersz.aktstawka,
						nowastawka: wiersz.nowastawka,
						powod: wiersz.wniosektxt,
						status: wiersz.wniosek
					});
				})
				res.send({dane: tmp});
			} else {
				res.send({odp: "Brak zlozonych podwyzek"});
			}
		})
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});
//historia zlozonych urlopow - urlopy
app.post("/historiaUrlopow/:token", (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		db.query("SELECT `urlopy`.`kto`, `urlopy`.`id`, `urlopy`.`odkiedy`, `urlopy`.`dokiedy`, `urlopy`.`status`, `konta`.`login`, `konta`.`awatar` FROM `urlopy` LEFT JOIN `konta` ON `urlopy`.`ktorozpatrzyl` = `konta`.`id` WHERE `urlopy`.`kto` = (SELECT `id` FROM `konta` WHERE `token` = ?)", [req.params.token], (err, r) => {
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
		})
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});

app.post("/urlopyUzytkownika/:token/:czyje", (req, res) => {
	//dc niepotrzebne
	if(req.params.token){
		db.query("SELECT `urlopy`.`id`, `urlopy`.`odkiedy`, `urlopy`.`dokiedy` FROM `urlopy` WHERE `urlopy`.`status` = 2 AND `urlopy`.`kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [req.params.czyje], (err, r) => {
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
		})
	} else {
		res.send({blad: "Jestes niezalogowany gagatku..."});
	}
});
//skladanie urlopu
app.post("/zlozUrlop/:token", (req, res) => {
	//dc zrobione
	if(req.params.token && req.body.odkiedy && req.body.dokiedy && req.body.powod){
		db.query("INSERT INTO `urlopy` (`kto`,`odkiedy`, `dokiedy`, `komentarz`, `status`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, ?, ?)", [req.params.token, req.body.odkiedy, req.body.dokiedy, req.body.powod, 0], (err, r) => {
			if(err) console.log(err);
			if(r.affectedRows > 0){
				console.log(req.params.token, "złożył wniosek o urlop!, ID wniosku:", r.insertId);
				res.send({odp: "Zlozono wniosek!"});
				db.query("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], async (erk, rk) => {
					let kierowca = rk[0].l;
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Złożenie wniosku o urlop")
					.setDescription(`Użytkownik [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) złożył wniosek o urlop.`)
					.setColor(0x007BFF).setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png')
					.addFields({name: "Data rozpoczęcia:", value: `${new Date(req.body.odkiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`})
					.addFields({name: "Data zakończenia:", value: `${new Date(req.body.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`})
					.addFields({name: "Uzasadnienie:", value: req.body.powod});
					await dcbot.channels.cache.get(process.env.CHANNEL_URLOPY).send({embeds: [embed1]});
				});
			} else {
				res.send({blad: "Nie zlozono wniosku!"});
			}
		});
	} else {
		res.send({blad: "Niezalogowany lub niewypelniono poprawnie formularzu"});
	}
});
//zakoncz urlop samemu
app.post("/zakonczUrlop/:token", (req, res) => {
	//dc zrobione
	if(req.params.token){
		db.query("UPDATE `urlopy` SET `status` = ? WHERE `id` = ?", [3, req.body.ktory], (err, r) => {
			if(err) console.log(err);
			if(r.affectedRows > 0){
				console.log(req.params.token, "anulował swój urlop!, ID urlopu:", r.insertId);
				res.send({odp: "Anulowano!"});
				db.query("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], async (erk, rk) => {
					let kierowca = rk[0].l;
					const embed1 = new EmbedBuilder().setFooter({text: "System The Boss Spedition"}).setTimestamp().setTitle("Zakończenie urlopu")
					.setDescription(`Użytkownik [${kierowca}](https://system.thebossspedition.pl/profil/${kierowca}) zakończył ręcznie swój urlop.`)
					.setColor(0xFF8400)
					.setThumbnail('https://system.thebossspedition.pl/img/logoglowna3.png');
					await dcbot.channels.cache.get(process.env.CHANNEL_URLOPY).send({embeds: [embed1]});
				});
			} else {
				res.send({blad: "Nieanulowano urlopu!"});
			}
		});
	} else {
		res.send({blad: "Niezalogowany lub niewypelniono poprawnie formularzu"});
	}
});
//skladanie wniosku
app.post("/zlozWniosek/:token", (req, res) => {
	//dc zrobione
	if(req.params.token && req.body.aktstawka && req.body.nowastawka && req.body.aktstanowisko && req.body.nowestanowisko && req.body.powod){
		db.query("INSERT INTO `podwyzka` (`ktozlozyl`,`ktorozpatrzyl`, `aktstawka`, `nowastawka`, `aktstanowisko`, `nowestanowisko`, `powod`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), 0, ?, ?, ?, ?, ?)", [req.params.token, req.body.aktstawka, req.body.nowastawka, req.body.aktstanowisko, req.body.nowestanowisko, req.body.powod], (err, r) => {
			if(err) console.log(err);
			if(r.affectedRows > 0){
				console.log(req.params.token, "złożył wniosek o podwyzke!, ID wniosku:", r.insertId);
				res.send({odp: "Zlozono wniosek!"});
				db.query("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], async (erk, rk) => {
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
				});
			} else {
				res.send({blad: "Nie zlozono wniosku!"});
			}
		});
	} else {
		res.send({blad: "Niezalogowany lub niewypelniono poprawnie formularzu"});
	}
});
//ustaw limit km
app.post("/ustawLimit/:login", (req, res) => {
	//dc zrobione
	db.query("UPDATE `ustawienia` SET `wartosc` = ? WHERE `nazwa` = 'limit_km'", [req.body.limit], async (err, r) => {
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
});
//ustaw powitalna wiadomosc
app.post("/ustawPowitalna/:login", (req, res) => {
	//dc zrobione
	db.query("UPDATE `ustawienia` SET `wartosc` = ? WHERE `nazwa` = 'informacja'", [req.body.tresc], async (err, r) => {
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
});
//dodawanie/odejmowanie kwoty
app.post("/dodajKwote/:token", (req, res) => {
	//dc zrobione
	db.query("INSERT INTO `dodawaniekwoty` (`komu`, `kwota`, `kto`, `powod`) VALUES (?, ?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?)", [req.body.komu, req.body.kwota, req.params.token, req.body.powod ? req.body.powod : "Brak powodu"], (err, r) => {
		if(err) console.log(err);
		if(r.affectedRows > 0){
			db.query("INSERT INTO `kontofirmowe` (`suma`,`opis`) VALUES (?, ?)", [-1*req.body.kwota, "Nadanie kwoty pieniężnej dla kierowcy "+req.body.komu], (erf, rf) => {
				if(erf){
					console.log("Nie odjęto kwoty z konta firmowego przy dodawaniu pieniędzy dla kierowcy, ", req.body.kwota);
					console.log(erf);
				}
			});
			res.send({odp: 'OK'});
			let nadal;
			let kierowca;
			let kierowcadc;
			db.query("SELECT `login` as 'l' FROM `konta` WHERE `token` = ?", [req.params.token], (ern, rn) => {
				db.query("SELECT `discord` as 'd', `login` as 'l' FROM `konta` WHERE `id` = ?", [req.body.komu], async (erk, rk) => {
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
							await dcbot.channels.cache.get(process.env.CHANNEL_OGOLNY).send(`<@${kierowcadc}> czy mógłbyś odblokować prywatne wiadomości? Miałem Ci coś przekazać... :confused:`);
						});
					};
				});
			});
		} else {
			res.send({blad: 'Nie ustawiono'});
		}
	});
});

app.listen(port, () => {
		console.log(`Aplikacja serwerowa zostala uruchomiona na http://localhost:${port}`);
});