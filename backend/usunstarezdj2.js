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
fs.readdir('./trasy/', (err, files) => {
	const filmoski = [];
	files.forEach(file => {
		db.query("SELECT `id` FROM `trasy` WHERE `zdj` LIKE ?", ["%"+file+"%"], (er, r) => {
			if(r.length > 0){
			} else {
				console.log("ZADNA TRASA NIE MA TEGO ZDJ");
				fs.unlink("./trasy/"+file, (err) => {
					if(err) {
						console.log("Błąd usuwania zdjęcia", file);
                                                console.log(err);
                                        }
                                });
			}
		});
	});
});
