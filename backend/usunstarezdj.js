const mysql = require('mysql');
const fs = require("fs");
const path = require("path");
require('dotenv').config();
let tmp = Date.now();
let miesiac = new Date();
miesiac.setMonth(miesiac.getMonth() - 1)
console.log("Teraz", Date.now(), new Date())
console.log("Miesiac wstecz", miesiac.getTime(), miesiac)
const db = mysql.createPool({
         user: process.env.DB_USER,
         host: "localhost",
         password: process.env.DB_PASS,
         database: process.env.DB_NAME,
         port: 3306,
         multipleStatements: true,
         dateStrings: true
});
db.query("SELECT `id`, `zdj` FROM `trasy` WHERE `kiedy` < ? AND `zdj` != ''", [miesiac], (er, r) => {
	let x = 0;
	if(er) console.log(er);
	if(r.length > 0){
		r.forEach((wiersz) => {
			//console.log(`trasa ${wiersz.id} zdjecia: ${wiersz.zdj}`);
			//rozbij zdj
			let zdj = wiersz.zdj.split(" ");
			zdj.map((v) => {
				console.log(v.replace("/img/", ""));
				fs.unlink(v.replace("/img/", "./"), (err) => {
					if(err) {
						console.log("Błąd usuwania zdjęcia", v);
						console.log(err);
					} else {
						x++;
					}
				});
			});
			db.query("UPDATE `trasy` SET `zdj` = '' WHERE `id` = ?", [wiersz.id], (er2, r2) => {
				if(er2){ console.log(er2); }
			});
		});
		console.log("Usunieto", x, "zdjec");
	}
});