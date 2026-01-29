import { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react';
import { io } from "socket.io-client";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector, Vector as VectorSource, XYZ } from 'ol/source';
import { Projection } from 'ol/proj';
import { Fill, Stroke, Style, Text, Icon } from 'ol/style';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import TileGrid from 'ol/tilegrid/TileGrid';
import Axios from 'axios';
import { MdClose } from 'react-icons/md';
import { IoMdKey } from "react-icons/io";
import IkonkaTruck from '../SVG/IkonkaTruck';
import IkonkaNaczepa from "../SVG/IkonkaNaczepa";
import gb from "../GlobalVars";
import Licznik from '../Komponenty/Licznik';

// const TileMapInfo = {
// 	//"x1": -135110.156,
// 	//"x2": 205684.1,
// 	//"y1": -197653.719,
// 	//"y2": 143140.531,
// 	"x1": -94621.8047,
// 	"x2": 79370.13,
// 	"y1": -75054.61,
// 	"y2": 98937.33,
// 	"minZoom": 0,
// 	"maxZoom": 9,
// 	'MAX_X': 2*131072,
// 	//rozmiar kafelka * 256, czyli 256 * 256 // * 2 bo 9 level = 512 elementow
// 	'MAX_Y': 2*131072,
// };

const StatusIndicator = ({kiedy}) => {
	const teraz = Date.now();
	const val = new Date(kiedy).getTime();
	let kolor = "chartreuse";
	let info = "W trasie";
	if((val + 1000 * 60) < teraz){
		kolor = "orange";
		info = "Na przerwie";
	}
	if((val + 1000 * 60 * 5) < teraz){
		kolor = "crimson";
		info = "Niedostępny";
	}
	return <div title={info} style={{borderRadius: '100%', margin: '0 6px', width: '10px', height: '10px', background: kolor}} />
};

const StatusGry = ({gra, wybrany}) => {
	let kolory = {background: '#37acad'};
	if(gra == "ATS") kolory = {background: '#d73c5a'};
	if(gra == "PROMODS") kolory = {background: '#8718d9'};
	if(wybrany) kolory = { background: '#63615f'}
	return <p style={kolory}>{gra}</p>
}

const ATS_URL = {url: "https://thebossspedition.pl/MAPAATS/", v: "1.57a"};
const PROMODS_URL = {url: "https://thebossspedition.pl/PROMODS/", v: "1.53p"};
const ETS_URL = {url: "https://thebossspedition.pl/MAPA/", v: "1.57a"};

export default function MapaETS(props){
	const instancjaMapy = useRef(null);
	const mapRef = useRef(null);
	const [miasta, setMiasta] = useState([]);
	const [panstwa, setPanstwa] = useState([]);
	const [gracze, setGracze] = useState([]);
	const [awatary, setAwatary] = useState({odp: false, dane: []});
	//const [panelSchowany, setPanelSchowany] = useState(false);
	const [wybrany, setWybrany] = useState(false);
	const [graczeLayer, setGraczeLayer] = useState(null);
	const socketRef = useRef(null);
    const pobierak = useRef(null);
	const [ostatniaWersjaDll, setOstatniaWersjaDll] = useState(null);
	const [aktualnaWersjaDll, setAktualnaWersjaDll] = useState(null);
	const [wyswietlRejestracje, setWyswietlRejestracje] = useState(-1);
	const [wygenerujToken, setWygenerujToken] = useState(false);
	const [ podazaj, setPodazaj ] = useState(false);
	const [ ustawieniaOtwarte, setUstawieniaOtwarte ] = useState(false);
	const [ modyfikacjeETS, setModyfikacjeETS ] = useState([]);
	const [TileMapInfo, setTileMapInfo] = useState({
		x1: 0, x2: 0,
		y1: 0, y2: 0,
		minZoom: 0, maxZoom: 9,
		MAX_X: 2*131072, MAX_Y: 2*131072,
		loaded: false
	});
	const [ ktoryTypMapy, setKtoryTypMapy ] = useState("ETS2");
	const poprzedniTypMapy = useRef(null);
	const [rozwinWyborMapy, setRozwinWyborMapy] = useState(false);

	const game_coord_to_pixels = useCallback((xx, yy) => {
		const xtot = TileMapInfo.x2 - TileMapInfo.x1;
		const ytot = TileMapInfo.y2 - TileMapInfo.y1;
		const xrel = (xx - TileMapInfo.x1) / xtot;
		const yrel = (yy - TileMapInfo.y1) / ytot;
		return [xrel * TileMapInfo.MAX_X, TileMapInfo.MAX_Y - (yrel * TileMapInfo.MAX_Y)];
	}, [TileMapInfo]);

    const pobierzTokenDLL = (cos) => {
        if(!pobierak.current) return;
        pobierak.current.setAttribute('href', 'data:application/octet-stream;charset=utf-8,'+encodeURIComponent(cos));
        pobierak.current.setAttribute('download', 'TOKEN_BOSS_DLL');
        console.log(pobierak.current);
        pobierak.current.click();
    }

	//socket
	useEffect(() => {
		if(aktualnaWersjaDll === null){
			Axios.post(gb.backendIP+"sprawdzWersjeTelemetria/"+localStorage.getItem("token"))
			.then((r) => {
				let akt = parseFloat(r.data['aktualna']);
				let ost = r.data['ostatnia'] ? parseFloat(r.data['ostatnia']) : null;
				if(!ost || akt > ost) {
					setWyswietlRejestracje(1);
				}
				setAktualnaWersjaDll(akt);
				setOstatniaWersjaDll(ost);
			}).catch((er) => {
				console.log("Błąd odczytania aktualnej wersji telemetrii");
			});
		}
		socketRef.current = io("https://telemetria.thebossspedition.pl");
		const socket = socketRef.current;
		const socketOnConnect = (e) => {
			console.log("Połączono z backendem, socket, prosze o pozycje");
			socket.emit("poprosPozycje"); //info telemetryczne
			socket.emit("poprosModyfikacje"); //info kto na jakiej mapie
		}
		const socketOtrzymajPozycje = (e) => {
			console.log("Otrzymane pozycje: ", e);
			setGracze(e);
		}
		const socketOnDisconnect = (e) => {
			console.log("Rozłączono socket!");
		}

		const socketOtrzymajModyfikacje = (e) => {
			console.log("Promods", e);
			setModyfikacjeETS(e);
		}

		socket.on("connect", socketOnConnect);
		socket.on("otrzymajPozycje", socketOtrzymajPozycje);
		socket.on("otrzymajModyfikacje", socketOtrzymajModyfikacje);
		socket.on("disconnect", socketOnDisconnect);
		return () => {
			socket.off("connect", socketOnConnect);
			socket.off("otrzymajPozycje", socketOtrzymajPozycje);
			socket.off("otrzymajModyfikacje", socketOtrzymajModyfikacje);
			socket.off("disconnect", socketOnDisconnect);
		};
	}, [])

	//mapa
	useEffect(() => {
		const temp_url = ktoryTypMapy == "ETS2" ? ETS_URL : (ktoryTypMapy == "ATS" ? ATS_URL : PROMODS_URL);

		const zmienneDaneMapy = async () => {
			const dane = await fetch(temp_url.url+"TileMapInfo.json");
			const parseDane = await dane.json();
			
			const daneMiasta = await fetch(temp_url.url+"Cities.json");
			const parseDaneMiasta = await daneMiasta.json();
			
			const danePanstwa = await fetch(temp_url.url+"Countries.json");
			const parseDanePanstwa = await danePanstwa.json();
			
			poprzedniTypMapy.current = ktoryTypMapy;
			setTileMapInfo(prev => ({...prev, ...parseDane}));
			setMiasta(parseDaneMiasta);
			setPanstwa(parseDanePanstwa);
		};

		if(ktoryTypMapy != poprzedniTypMapy.current){
			zmienneDaneMapy();
			return;
		}

		const dostanAwatary = async () => {
			Axios.post(gb.backendIP+"dostanAwatary/").then((r) => {
				if(!r.data['blad']) {
					setAwatary({dane: r.data, odp: true});
				}
			}).catch((er) => {
				console.log(er);
				setAwatary({dane: [], odp: true});
			});
		}
		if(!awatary.odp){
			dostanAwatary();
			return;
		}

		const projection = new Projection({
			code: "Funbit",
			units: "pixels",
			extent: [0, 0, TileMapInfo.MAX_X, TileMapInfo.MAX_Y],
			worldExtent: [0, 0, TileMapInfo.MAX_X, TileMapInfo.MAX_Y]
		});

		const customTile = new TileGrid({
			extent: [0, 0, TileMapInfo.MAX_X, TileMapInfo.MAX_Y],
			minZoom: 0,
			origin: [0, TileMapInfo.MAX_Y],
			tileSize: [512, 512],
			resolutions: (() => {
				const resolutions = [];
				for (let z = 0; z <= 9; ++z) {
				resolutions[z] = Math.pow(2, 9 - z);
				}
				return resolutions;
			})(),
		});

		const mapaTekst = (res, nazwa) => {
			// console.log(res, nazwa);
			const scale = Math.min(0.7, Math.max(0, 1.2 / Math.log2(res + 1) - 0.015));
			const tekst = nazwa;
			const fillT = new Fill();
			let opacityHex = 'cc';
			if (scale < 0.28) {
				const opacityValue = Math.round(((scale - 0.15) / (0.28 - 0.15)) * (0xcc - 0x8d) + 0x8d);
        		opacityHex = opacityValue.toString(16).padStart(2, '0');
			}
			fillT.setColor("#d8ff00"+opacityHex);
			const strokeT = new Stroke();
			strokeT.setColor("#000000"+opacityHex);
			strokeT.setWidth(8);

			return [new Style({
				text: new Text({
					text: tekst,
					font: 'bold 48pt "Montserrat"',
					textAlign: 'center',
					fill: fillT,
					stroke: strokeT,
					scale: scale,
					offsetY: 96 * scale
				})
			})]
		};

		const widok = new View({
			projection: projection,
			extent: [0, 0, TileMapInfo.MAX_X, TileMapInfo.MAX_Y],
			//center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
			center: [TileMapInfo.MAX_X/2, TileMapInfo.MAX_Y/2],
			minZoom: 2,
			maxZoom: 10,
			constrainResolution: false,
			zoom: 3
		});
		widok.on('change:resolution', function() {
			var zoom = widok.getZoom();
			console.log('Aktualny poziom zoomu:', zoom);
		  });

		const map = new Map({
			target: mapRef.current,
			layers: [
				new TileLayer({
					// MAPA GŁÓWNA
					source: new XYZ({
					tileSize: [512, 512],
					tilePixelRatio: window.devicePixelRatio || 1,
					maxZoom: 9,
					minZoom: 0,
					wrapX: false,
					projection: projection,
					// interpolate: false,
					// imageSmoothingEnabled: true,
					url: `${temp_url.url}Tiles/{z}/{x}/{y}.png?v=${temp_url.v}`,
					tileGrid: customTile
					}),
				}),
				new VectorLayer({
					source: new Vector({
						features: miasta.map((city) => {
							const koordy = game_coord_to_pixels(city.X, city.Y);
							const tempFeature = new Feature(city);
							tempFeature.setGeometry(new Point(koordy));
							tempFeature.setStyle((feature, resolution) => mapaTekst(resolution, city.LocalizedNames.pl_pl || city.Name));
							return tempFeature;
						})
					}),
				})
			],
			view: widok,
			// interactions: [
			// 	new DragRotateAndZoom(),
			// ],
		});

		instancjaMapy.current = map;

		const graczeVectorLayer = new VectorLayer({
            source: new VectorSource(),
            style: (feature, resolution) => {
				// const scale = Math.min(0.3, Math.max(0.1, 1.0 / Math.log2(resolution + 1) - 0.015)) * 2;
				let scale;

				if (resolution >= 32) {
					scale = 0.3;
				} else if (resolution <= 8) {
					scale = 0.5;
				} else {
					// Interpolacja liniowa w przypadku resolution między 32 a 8
					scale = 0.4;
				}

                const fillT = new Fill({ color: "#00ffffbb" });
                const strokeT = new Stroke({ color: "#000000", width: 6 });
                return new Style({
					image: new Icon({
						src: "https://thebossspedition.pl/MAPA/kursorMapa.png",
						scale: scale,
						rotation: (feature.get("pozycja")?.heading * -Math.PI / 180) || 0,
						rotateWithView: true,
					}),
                    text: new Text({
                        text: feature.get('login'),
                        font: 'bold 48pt "Nunito"',
                        textAlign: 'center',
                        fill: fillT,
                        stroke: strokeT,
                        scale: scale,
                        offsetY: -72 * scale
                    })
                });
            }
        });

		setGraczeLayer(graczeVectorLayer);
        map.addLayer(graczeVectorLayer);

		return () => {
			map.setTarget(null);
		};
	}, [miasta, panstwa, awatary, ktoryTypMapy]);

	
	const odczytModyfikacji = useMemo(() => {
		const modyfikacjeMap = new window.Map(modyfikacjeETS.map(x => [x.login, x]));
		return (login) => modyfikacjeMap.get(login);
	}, [modyfikacjeETS]);

	// aktualizacja pozycji graczy
	useEffect(() => {
		if (graczeLayer) {
            const features = gracze.map((gracz) => {
				// const tempGra = modyfikacjeETS.find(x => x.login == gracz.login);
				const tempGra = odczytModyfikacji(gracz.login);
				// console.log(gracz.login, tempGra);
				// console.log(modyfikacjeETS)
				if(ktoryTypMapy == "ETS2"){
					if(tempGra !== undefined){
						if(tempGra.promods) return;
						if(tempGra.gra !== undefined){
							if(tempGra.gra != "ETS2") return;
						}
					}
				}
				if(ktoryTypMapy == "PROMODS"){
					if(tempGra === undefined) return;
					if(tempGra.gra == "ATS") return;
					if(tempGra.promods === false) return;
				}

				if(ktoryTypMapy == "ATS"){
					if(tempGra == undefined) return;
					if(tempGra.gra != "ATS") return;
				}

				if(gracz.pozycja === undefined || gracz.pozycja === null) return;
                const koordy = game_coord_to_pixels(gracz.pozycja.positionX, gracz.pozycja.positionZ);
                const tempFeature = new Feature(gracz);
                tempFeature.setGeometry(new Point(koordy));
                return tempFeature;
            });
			const featuresFix = features.filter(e => e !== undefined);
            graczeLayer.getSource().clear();
            graczeLayer.getSource().addFeatures(featuresFix);
        }
		if(wybrany && podazaj){
			const znajdz = gracze.find(v => v.login === wybrany);
			if(znajdz === undefined) return;
			if(znajdz.pozycja && instancjaMapy.current){
				instancjaMapy.current.getView().setCenter(game_coord_to_pixels(znajdz.pozycja.positionX, znajdz.pozycja.positionZ));
			}
		}
	}, [gracze, graczeLayer, modyfikacjeETS, ktoryTypMapy]);

	const InformacjeWybranegoPoczatek = memo(({ciezarowka, naczepa, praca, uszkodzenia}) => {
		let logoMarka;
		if(ciezarowka){
			switch(ciezarowka.marka){
				case 'Mercedes-Benz':
					logoMarka = "MERCEDES.webp";
					break;
				case 'Scania':
					logoMarka = "SCANIA.webp";
					break;
				case 'Renault Trucks':
					logoMarka = "RENAULT.webp";
					break;
				case 'DAF':
					logoMarka = "DAF.webp";
					break;
				case 'Iveco':
					logoMarka = "IVECO.webp";
					break;
				case 'Volvo':
					logoMarka = "VOLVO.webp";
					break;
				case 'MAN':
					logoMarka = 'MAN.webp';
					break;
			}
		}
		let spolszczonyTypNaczepy;
		if(naczepa){
			switch (naczepa.typNaczepy) {
				case "curtainside":
					spolszczonyTypNaczepy = "Firanka";
					break;
				case 'dryvan':
					spolszczonyTypNaczepy = "Furgon";
					break;
				case 'refrigerated':
					spolszczonyTypNaczepy = "Chłodnia";
					break;
				case 'insulated':
					spolszczonyTypNaczepy = "Izoterma";
					break;
				case "container":
					spolszczonyTypNaczepy = "Podkontenerowa";
					break;
				case "log":
					spolszczonyTypNaczepy = "Kłonicowa";
					break;
				case "flatbed":
					spolszczonyTypNaczepy = "Platforma";
					break;
				case 'fueltank': //zwykla
					spolszczonyTypNaczepy = "Cysterna";
					break;
				case "foodtank": //spozywcza
					spolszczonyTypNaczepy = "Cysterna spożywcza";
					break;
				case "chemtank": //chemiczna
					spolszczonyTypNaczepy = "Cysterna chemiczna";
					break;
				case "gastank": //gazowa
					spolszczonyTypNaczepy = "Cysterna gazowa";
					break;
				case "dumper":
					spolszczonyTypNaczepy = "Wywrotka";
					break;
				case 'lowboy':
					spolszczonyTypNaczepy = "Niskopodw.";
					break;
				case 'lowbed':
					spolszczonyTypNaczepy = "Niskopodł.";
					break;
				case 'silo':
					spolszczonyTypNaczepy = "Silos";
					break;
				case 'livestock':
					spolszczonyTypNaczepy = "Zwierzęca";
					break;
				case '_car_ns2moos':
					spolszczonyTypNaczepy = "Lora";
					break;
				case '_car_itcait':
					spolszczonyTypNaczepy = "Lora";
					break;
				default:
					spolszczonyTypNaczepy = naczepa.typNaczepy;
					break;
			}
		}
		let spolszczonyTypLancucha;
		if(naczepa){
			switch(naczepa.typLancucha){
				case 'single':
					spolszczonyTypLancucha = "pojedyncza";
					break;
				case 'double':
					spolszczonyTypLancucha = "podwójna";
					break;
				case 'hct':
					spolszczonyTypLancucha = "HCT";
					break;
				case 'b-double':
					spolszczonyTypLancucha = "B-Double";
					break;
				default:
					spolszczonyTypLancucha = naczepa.typLancucha;
					break;
			}
		}

		let sredniaNaczepa = 0;
		let sredniaTruck = 0;
		let uszkodzeniaNaczepaString = "Uszkodzenia naczepy: Nieznane";
		let uszkodzeniaTruckString = "Uszkodzenia ciężarówki: Nieznane";
		if(uszkodzenia){
			sredniaTruck = Math.round((Number(uszkodzenia.truckKabina) + Number(uszkodzenia.truckKola) + Number(uszkodzenia.truckNadwozie) + Number(uszkodzenia.truckSilnik) + Number(uszkodzenia.truckSkrzynia)) * 100 / 5);
			uszkodzeniaTruckString = `Uszkodzenia ciężarówki\r\nŚrednia ogólna: ${sredniaTruck}%\r\n	Silnik: ${Math.round(uszkodzenia.truckSilnik*100)}%\r\n	Skrzynia biegów: ${Math.round(uszkodzenia.truckSkrzynia*100)}%\r\n	Kabina: ${Math.round(uszkodzenia.truckKabina*100)}%\r\n	Podwozie: ${Math.round(uszkodzenia.truckNadwozie*100)}%\r\n	Koła: ${Math.round(uszkodzenia.truckKola*100)}%`;
			sredniaNaczepa = Math.round((Number(uszkodzenia.naczepaKola) + Number(uszkodzenia.naczepaNadwozie) + Number(uszkodzenia.naczepaStruktura)) * 100 / 3);
			uszkodzeniaNaczepaString = `Uszkodzenia naczepy\r\nŚrednia ogólna: ${sredniaNaczepa}%\r\n	Struktura: ${Math.round(uszkodzenia.naczepaStruktura*100)}%\r\n	Podwozie: ${Math.round(uszkodzenia.naczepaNadwozie*100)}%\r\n	Koła: ${Math.round(uszkodzenia.naczepaKola*100)}%\r\nŁadunek: ${praca == null ? "Brak załadunku" : `${Math.round(uszkodzenia.naczepaLadunek*100)}%`}`;
		}

		return(
			<>
				<div className="flex w-full h-25 mb-6.25 [&_svg]:h-25 [&_svg]:z-3 [&_svg]:drop-shadow-[3px_3px_5px_#0c0c0c] [&_svg:nth-child(even)]:z-2 [&_svg:nth-child(even)]:ml-[-15%]">
					<IkonkaTruck title={ciezarowka == null ? `Kierowca nie prowadzi aktualnie żadnego pojazdu.` : uszkodzeniaTruckString} style={ciezarowka == null ? {opacity: 0.2} : null} wypelnienie={sredniaTruck} />
					<IkonkaNaczepa title={naczepa == null ? `Kierowca nie posiada aktualnie żadnej naczepy.` : uszkodzeniaNaczepaString} style={naczepa == null ? {opacity: 0.2} : null} wypelnienie={sredniaNaczepa} />
				</div>
				<div
				className='flex
				[&_span]:text-center [&_span]:block [&_span]:font-bold [&_span]:tracking-[1px] [&_span]:text-shadow-[1px_1px_3px_#0c0c0c]
				items-start justify-around gap-2.5 mb-7.5 -ml-2.5 -mr-2.5'>
					<div>
                        <span>Ciężarówka</span>
						{ ciezarowka == null ? <div className='[&_p]:text-[0.85rem] [&_p]:text-center [&_p]:max-w-50'><p>Brak</p></div> :
						<div className='flex flex-wrap justify-center gap-1.25 items-center'>
							{logoMarka ? <img className='max-h-12.5 p-1.25 rounded-[5px] inline' src={`/img/marki/${logoMarka}`} /> : ""}
							<div className='[&_p]:text-[0.85rem] [&_p]:text-center [&_p]:max-w-50 flex flex-wrap justify-center gap-1.25 items-center w-min text-nowrap'>
                                <p>{ciezarowka.marka}</p>
                                <p>{ciezarowka.model}</p>
							</div>
						</div> }
					</div>
					<div className='[&_p]:text-[0.85rem] [&_p]:text-center [&_p]:max-w-50'>
                        <span>Naczepa</span>
						{ naczepa == null ? <p>Brak</p> : 
						<>
							{naczepa.marka || naczepa.model ? <p>{naczepa.marka ? naczepa.marka.toUpperCase() : ""} {naczepa.model ? naczepa.model : ""}</p> : ""}
							<p style={{textWrap: 'nowrap'}}>{spolszczonyTypNaczepy} {spolszczonyTypLancucha}</p>
							<p>{praca == null ? "Brak załadunku" : <>{praca.ladunek} {Math.round(praca.masa/1000)} t</>}</p>
						</> }
					</div>
				</div>

				<div className='flex items-center justify-center flex-col mb-12.5
				[&_span]:text-center [&_span]:block [&_span]:font-bold [&_span]:tracking-[1px] [&_span]:text-shadow-[1px_1px_3px_#0c0c0c]'>
					<span>Aktualne zlecenie:</span>
					{ praca == null ? <p>Brak</p> :
					<>
						<p style={{textWrap: "pretty", textAlign: "center"}}>Skąd: {znajdzKrajMiasta(praca?.skad)}, {polskaNazwaMiasto(praca?.skad)}, {praca?.skadFirma}</p>
						<p style={{textWrap: "pretty", textAlign: "center"}}>Dokąd: {znajdzKrajMiasta(praca?.dokad)}, {polskaNazwaMiasto(praca?.dokad)}, {praca?.dokadFirma}</p>
					</> }
				</div>
			</>
		)
	});

	const InformacjeWybranegoKoncowka = () => {
		const tmpObj = [...gracze].find(v => v.login === wybrany);
		if(!tmpObj) return;
		return(
		<>
		<div className='flex items-center justify-center w-full mb-7.5
			[&_span]:text-center [&_span]:block [&_span]:font-bold [&_span]:tracking-[1px] [&_span]:text-shadow-[1px_1px_3px_#0c0c0c]'>
			<div className='grow text-center text-[1rem]'>
				<b>Pozycja X:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.positionX ? Number(tmpObj.pozycja.positionX).toFixed(0) : "Nieznane"}
			</div>
			<div className='grow text-center text-[1rem]'>
				<b>Pozycja Y:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.positionZ ? Number(tmpObj.pozycja.positionZ).toFixed(0) : "Nieznane"}
			</div>
			<div className='grow text-center text-[1rem]'>
				<b>Rotacja:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.heading ? `${360 - Number(tmpObj.pozycja.heading).toFixed(0)}°` : "Nieznane"}
			</div>
		</div>
		<div className='flex w-full gap-5'>
			<button className={`${podazaj ? 'bg-[green]' : 'bg-[orangered]'}`} onClick={() => handlePodazaj()}>{podazaj ? "Przestań śledzić" : "Śledź na mapie"}</button>
			<button onClick={() => {setWybrany(null); setPodazaj(false); }}>Zamknij</button>
		</div>
		</>);
	};

	const polskaNazwaMiasto = (org) => {
		if(!org) return;
		const znajdz = miasta.find(v => {
			return v.Name.toLowerCase() == org ? true : (
				v.LocalizedNames.pl_pl ? 
					v.LocalizedNames.pl_pl.toLowerCase() == org ? true : false
				: false
			)
		});
		if(znajdz === undefined){
			return org[0].toUpperCase() + org.slice(1);
		} else {
			return znajdz.LocalizedNames.pl_pl || znajdz.LocalizedNames.en_gb || znajdz.Name;
		}
	};

	const znajdzKrajMiasta = (org) => {
		if(!org) return;
		const znajdz = miasta.find(v => {
			return v.Name.toLowerCase() == org ? true : (v.LocalizedNames.pl_pl ? v.LocalizedNames.pl_pl.toLowerCase() == org ? true : false : false)
		});
		if(znajdz === undefined){
			return "Nieznane";
		} else {
			let innyZapisPanstw = [
				{skrot: "uk", pelne: "Wielka Brytania"}
			];

			const znajdzKraj = panstwa.find(v => (v.LocalizedNames?.en_gb?.toLowerCase() || v.Name.toLowerCase()) == znajdz.Country.replace("\r   population", "").toLowerCase() );
			if(znajdzKraj === undefined){
				const znajdzKrajInne = innyZapisPanstw.find(x => x.skrot == znajdz.Country.toLowerCase());
				if(znajdzKrajInne === undefined){
					return "Nieznane";
				} else {
					return znajdzKrajInne.pelne;
				}
			} else {
				return znajdzKraj.LocalizedNames.pl_pl || znajdzKraj.LocalizedNames.en_gb || znajdzKraj.Name;
			}
		}
	}
  
	const zamknijRejestracje = (val) => {
		setWyswietlRejestracje(val);
		if(val === 0) {
			const tmp = setTimeout(() => zamknijRejestracje(-1), 600);
			// clearTimeout(tmp);
		}
	};

	const handlePodazaj = () => {
		if(podazaj){
			setPodazaj(false);
		} else {
			const znajdz = gracze.find(v => v.login === wybrany);
			if(znajdz){
				if(znajdz.pozycja && instancjaMapy.current){
					instancjaMapy.current.getView().setCenter(game_coord_to_pixels(znajdz.pozycja.positionX, znajdz.pozycja.positionZ));
				}
			}
			setPodazaj(true);
		}
	}

	useEffect(() => {
		if(wygenerujToken){
			Axios.post(gb.backendIP+"tokenTelemetria/"+localStorage.getItem("token"))
			.then((r) => {
				if(r.data['odp']){
					pobierzTokenDLL(r.data['odp']);
				} else {
					console.log(r.data['blad']);
				}
			}).catch((er) => {
				console.log("Błąd podczas generowania tokenu telemetrii");
			});
			setWygenerujToken(false);
		}
	}, [wygenerujToken]);

	return(<div className='flex w-full h-full pl-15 bg-[#484e66]'>
		<div className='fixed left-25 top-2.5 z-4'>
			<div className="relative py-2.5 px-3.75 font-bold text-left select-none cursor-pointer text-[1rem] bg-white text-[#666] min-w-[unset] rounded-xl">
				<div className='h-6.25 flex items-center' onClick={() => setRozwinWyborMapy(!rozwinWyborMapy)}>Mapa: {ktoryTypMapy}</div>
				<div className="uprawnieniaNadawanieGoraRozwijane" style={{display: rozwinWyborMapy ? "flex" : "none", gap: '5px', flexDirection: 'column', marginTop: '5px'}}>
					<div style={{padding: "6px 8px", textShadow: "none", letterSpacing: "1px", borderRadius: 6, textAlign: 'center', background: ktoryTypMapy == "ETS2" ? "#ff7c7c" : "#fff"}} onClick={() => { setRozwinWyborMapy(false); setKtoryTypMapy("ETS2");}}>ETS2</div>
					<div style={{padding: "6px 8px", textShadow: "none", letterSpacing: "1px", borderRadius: 6, textAlign: 'center', background: ktoryTypMapy == "PROMODS" ? "#ff7c7c" : "#fff"}} onClick={() => { setRozwinWyborMapy(false); setKtoryTypMapy("PROMODS");}}>PROMODS</div>
					<div style={{padding: "6px 8px", textShadow: "none", letterSpacing: "1px", borderRadius: 6, textAlign: 'center', background: ktoryTypMapy == "ATS" ? "#ff7c7c" : "#fff"}} onClick={() => { setRozwinWyborMapy(false); setKtoryTypMapy("ATS");}}>ATS</div>
				</div>
			</div>
		</div>
		<div ref={mapRef} style={{ flexGrow: 1, height: '100vh' }} />
		<div className="**:font-['Nunito',sans-serif] relative z-5 h-dvh w-100 p-[30px_25px_10px] text-[#eee] text-[1.2rem] bg-[#1e1e1e] shadow-[0_0_10px_0_#161616] transition-all duration-300">
			<div className='absolute top-2.5 right-5 text-[1.8rem] cursor-pointer z-2 transition-all duration-300
			drop-shadow-[2px_4px_6px_black] hover:text-[goldenrod] hover:scale-[1.3]'
			onClick={() => setUstawieniaOtwarte(!ustawieniaOtwarte)} >{ustawieniaOtwarte ? <MdClose /> : <IoMdKey /> }</div>
			<div className='absolute left-0 top-0 right-0 p-[60px_30px_10px] bg-[#2024369e] backdrop-blur-[10px] border-b border-white text-center transition-transform duration-500
			[&_p]:cursor-pointer [&_p]:text-white [&_p]:text-[1rem] [&_p]:font-bold [&_p]:tracking-[1px] [&_p]:transition-all [&_p]:duration-300 [&_p]:text-shadow-[1px_1px_3px_#000]
			[&_p]:hover:scale-110 [&_p]:hover:text-[goldenrod] [&_span]:-mt-2.5 [&_span]:text-[0.85rem] [&_span]:font-extrabold [&_span]:text-[crimson] [&_span]:block' 
			style={ustawieniaOtwarte ? null : {transform: `translateY(-120%)`}}>
				<p onClick={() => setWygenerujToken(Date.now())}>Unieważnij aktualny oraz wygeneruj nowy token do telemetrii.</p>
				<br />
				<p onClick={() => window.open('https://thebossspedition.pl/MAPA/telemetria.dll', '_blank')}>Pobierz telemetrię w wersji v{aktualnaWersjaDll}.</p>
				<br />
				<p onClick={() => window.open('https://thebossspedition.pl/MAPA/SII_Decrypt.exe', '_blank')}>Pobierz program SII_Decrypt.</p>
				<br />
				<span>Pliki powinny znajdować się w katalogu gry `bin\win_x64\plugins\`</span>
			</div>
			<h3>Lista kierowców</h3>
			<div className='flex max-h-25.75 flex-col gap-1.25 m-[5px_0_10px] bg-[#1c1c1c] p-1.25 overflow-auto rounded-[7px]' style={{maxHeight: `${wybrany ? "" : "unset"}`}}>
				{ gracze.map((gracz, klucz) => {
					const tempGra = modyfikacjeETS.find(x => x.login == gracz.login);
					let mapa = "ETS2";
					if(tempGra !== undefined) {
						if(tempGra.gra == "ATS"){
							mapa = "ATS";
						} else {
							if(tempGra.promods){
								mapa = "PROMODS";
							} else {
								mapa = "ETS2";
							}
						}
					}

					return <div key={`${gracz.login}}`} style={(gracz.login === wybrany) ? {background: "#FFC107", color: "#111"} : null}
						className="p-0.75 pr-2 bg-[#2c2c2c] cursor-pointer transition-all duration-300 flex items-center grow
						shadow-[0_0_4px_0_#111] tracking-[1px] font-bold rounded-lg text-shadow-[0_0_8px_#000] hover:bg-[#444]
						[&_img]:inline [&_img]:align-middle [&_img]:mr-2.5 [&_img]:w-9.5 [&_img]:h-9.5 [&_img]:shadow-[0_0_3px_0_#555] [&_img]:rounded-[6px]
						[&_span]:grow [&_span]:flex [&_span]:items-center
						[&_p]:py-1 [&_p]:px-1.5 [&_p]:text-[0.65rem] [&_p]:rounded-xl [&_p]:min-w-12.5
						[&_p]:text-center [&_p]:font-black [&_p]:tracking-[2px] [&_p]:text-white [&_p]:transition-colors [&_p]:duration-300"
						onClick={() => { setWybrany(gracz.login); setPodazaj(false); setKtoryTypMapy(mapa); }}>
						<img src={awatary.dane.find(aw => aw.login === gracz.login) ? "/img/"+awatary.dane.find(aw => aw.login === gracz.login).awatar : "/img/awatary/default.png"} />
						<span>{gracz.login} <StatusIndicator kiedy={gracz.kiedy} /></span>
						<StatusGry gra={mapa} wybrany={(gracz.login === wybrany)}/>
					</div>
				}) }
			</div>
			{ wybrany ?
			<div className="[&_button]:p-2.5 [&_button]:text-[0.9rem] [&_button]:tracking-[1px] [&_button]:outline-0 [&_button]:bg-[crimson] [&_button]:grow
			[&_button]:cursor-pointer [&_button]:uppercase [&_button]:font-extrabold [&_button]:border [&_button]:rounded-none [&_button]:text-[#ddd]
			[&_button]:text-shadow-[1px_1px_3px_#111] [&_button]:transition-all [&_button]:duration-300
			[&_button]:hover:tracking-[3px] [&_button]:hover:bg-[dodgerblue]">
				<h3>Kierowca {wybrany}</h3>
				<p className='uppercase text-[0.75rem] font-extrabold text-[#6d7d89] text-shadow-[0_0_3px_#121212] mb-5'>Dane z { new Date(gracze.find(v => v.login === wybrany).kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', hour: "2-digit", minute: "2-digit", second: "2-digit"})}</p>
				<InformacjeWybranegoPoczatek ciezarowka={gracze.find(v => v.login === wybrany).ciezarowka || null} praca={gracze.find(v => v.login === wybrany).praca || null} naczepa={gracze.find(v => v.login === wybrany).naczepa || null} uszkodzenia={gracze.find(v => v.login === wybrany).uszkodzenia || null} />
				<div className='flex items-center justify-center flex-col
				[&_span]:text-center [&_span]:block [&_span]:font-bold [&_span]:tracking-[1px] [&_span]:text-shadow-[1px_1px_3px_#0c0c0c]'>
					<span className='mb-2.5'>Telemetria</span>
					<div className='flex items-center w-full justify-between [&_span]:text-center [&_span]:block [&_span]:font-bold
									[&_span]:tracking-[1px] [&_span]:text-shadow-[1px_1px_3px_#0c0c0c]'>
						<Licznik min={0} max={180} cur={parseInt(gracze.find(v => v.login == wybrany).pozycja?.speed*3600/1000 || 0) } jednostka={"km/h"} tytul={"Prędkość"} />
						<Licznik min={0} max={gracze.find(v => v.login == wybrany).ciezarowka?.maxObroty || 2400} cur={parseInt(gracze.find(v => v.login == wybrany).pozycja?.rpm || 0)} jednostka={"obr"} tytul={"Obroty"} />
						<Licznik style={{width: '80px', height: '80px', marginTop: "20px"}} min={0} max={ gracze.find(v => v.login == wybrany).ciezarowka?.maxPaliwo || 1000} cur={parseInt(gracze.find(v => v.login == wybrany).pozycja?.fuel || 0)} jednostka={"l"} tytul={"Paliwo"} odwrocKolory={true}/>
					</div>
				</div>
				<InformacjeWybranegoKoncowka />
			</div> : "" }
            
		</div>
		{ (wyswietlRejestracje > -1) ? <div className={`fixed bg-[#050e18a3] top-0 left-15 bottom-0 right-0
			z-5 backdrop-blur-[14px] flex items-center justify-center text-[#eee] font-['Nunito',sans-serif]
			tracking-[1px] flex-col gap-25
			[&_>_p]:underline [&_>_p]:cursor-pointer [&_>_p]:transition-all [&_>_p]:duration-300
			[&_>_p:hover]:tracking-[3px] ${(wyswietlRejestracje ? "" : "wyjscieSmooth")}`}>
		{
			(ostatniaWersjaDll === null) ?
			<div className='text-center max-w-182.5 gap-5 flex flex-col text-shadow-[1px_1px_3px_#000] [&_button]:leading-[1.2]
			[&_button]:w-fit [&_button]:my-0 [&_button]:mx-auto [&_button]:py-2 [&_button]:px-3.5 [&_button]:text-[0.7rem]
			[&_button]:uppercase [&_button]:font-bold [&_button]:cursor-pointer [&_button]:bg-[#3f6e8b] [&_button]:text-[#eee]
			[&_button]:border [&_button]:border-[#eee] [&_button]:tracking-[1px] [&_button]:text-shadow-[1px_1px_3px_#111]
			[&_button]:transition-all [&_button]:duration-300 [&_button]:hover:tracking-[4px] [&_button]:hover:bg-[#1f591c]
			
			[&_ol]:text-left [&_ol]:leading-11.25 [&_ol]:p-5 [&_ol]:pl-10 [&_ol]:bg-[#0000004d] [&_ol]:shadow-[inset_0_0_10px_0_#111] [&_ol]:border [&_ol]:border-[#1111]'>
				<h2 className='font-bold text-[1.5em]'>Jesteś niezarejestrowany w systemie telemetrii.</h2>
				<h3 className='font-bold text-[1.17em]'>Aby dokonać rejestracji, wykonaj poniższe kroki:</h3>
				<ol className='list-decimal'>
					<li>Pobierz plik DLL telemetrii.<br /><button onClick={() => window.open('https://thebossspedition.pl/MAPA/telemetria.dll', '_blank')}>Pobierz</button></li>
					<li>Pobierz program SII_Decrypt.<br /><button onClick={() => window.open('https://thebossspedition.pl/MAPA/SII_Decrypt.exe', '_blank')}>Pobierz</button></li>
					<li>Wygeneruj i pobierz klucz identyfikacyjny dla telemetrii.<br /><button onClick={() => setWygenerujToken(Date.now())}>Wygeneruj</button></li>
					<li>Umieść pobrane pliki w katalogu z grą <b>`\bin\win_x64\plugins\`</b>.<br /><button onClick={() => zamknijRejestracje(0)}>Zrobione</button></li>
				</ol>
				<p>Jeśli posiadasz ETS2 oraz ATS, możesz <b>skopiować pliki</b> do obu gier. Każdorazowe generowanie nowego klucza unieważnia poprzedni klucz. Pamiętaj również o poprawnym nazewnictwie plików - brak dopisków typu "(1)".</p>
			</div> : ((aktualnaWersjaDll > ostatniaWersjaDll) ?
			<div className='text-center max-w-182.5 gap-5 flex flex-col text-shadow-[1px_1px_3px_#000] [&_button]:leading-[1.2]
			[&_button]:w-fit [&_button]:my-0 [&_button]:mx-auto [&_button]:py-2 [&_button]:px-3.5 [&_button]:text-[0.7rem]
			[&_button]:uppercase [&_button]:font-bold [&_button]:cursor-pointer [&_button]:bg-[#3f6e8b] [&_button]:text-[#eee]
			[&_button]:border [&_button]:border-[#eee] [&_button]:tracking-[1px] [&_button]:text-shadow-[1px_1px_3px_#111]
			[&_button]:transition-all [&_button]:duration-300 [&_button]:hover:tracking-[4px] [&_button]:hover:bg-[#1f591c]
			
			[&_ol]:text-left [&_ol]:leading-11.25 [&_ol]:p-5 [&_ol]:pl-10 [&_ol]:bg-[#0000004d] [&_ol]:shadow-[inset_0_0_10px_0_#111] [&_ol]:border [&_ol]:border-[#1111]'>
				<h2 className='font-bold text-[1.5em]'>Dostępna jest nowa wersja telemetrii.</h2>
				<p>Korzystasz z wersji <b>v{ostatniaWersjaDll}</b>, ale aktualna dostępna wersja to <b>v{aktualnaWersjaDll}</b>. Aby zaktualizować wersję wykonaj poniższe kroki:</p>
				<ol className='list-decimal'>
					<li>Pobierz <b>nowy</b> plik DLL telemetrii.<br /><button onClick={() => window.open('https://thebossspedition.pl/MAPA/telemetria.dll', '_blank')}>Pobierz</button></li>
					<li>Pobierz program SII_Decrypt.<br /><button onClick={() => window.open('https://thebossspedition.pl/MAPA/SII_Decrypt.exe', '_blank')}>Pobierz</button></li>
					<li>Wygeneruj i pobierz <b>nowy</b> klucz identyfikacyjny dla telemetrii.<br /><button onClick={() => setWygenerujToken(Date.now())}>Wygeneruj</button></li>
					<li>Umieść pobrane pliki w katalogu z grą <b>`\bin\win_x64\plugins\`</b>.<br /><button onClick={() => zamknijRejestracje(0)}>Zrobione</button></li>
				</ol>
				<p>Jeśli posiadasz ETS2 oraz ATS, możesz <b>skopiować pliki</b> do obu gier. Każdorazowe generowanie nowego klucza unieważnia poprzedni klucz. Pamiętaj również o poprawnym nazewnictwie plików - brak dopisków typu "(1)".</p>
			</div> : zamknijRejestracje(-1) )
		}
		<p onClick={() => zamknijRejestracje(0)}>Tylko oglądam</p>
		</div> : "" }
		<a ref={pobierak} style={{display: "none"}} />
	</div>)
};