const express = require("express");
const httpServer = require("node:http");
const cors = require("cors");
const app = express();
const server = httpServer.createServer(app);
const io = require("socket.io")(2139, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});
let pozycja = [];

io.on('connection', (socket) => {
	console.log("nowe polaczenie", socket);
	const clientIp = socket.handshake.address;
    console.log(socket.handshake);
	socket.on("disconnect", () => {
		console.log("ktos sie rozlaczyl");
	});
	socket.on("/", (msg) => {
		console.log("Telemetria:", msg);
	});
	socket.on("pozycja", (msg) => {
		let dane = JSON.parse(msg);
		dane.ip = socket.handshake.address;
		//console.log(dane);
	});
});