import { useEffect, useRef, useState, memo } from 'react';
import { io } from "socket.io-client";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector, Vector as VectorSource, XYZ } from 'ol/source';
import { Projection, fromLonLat } from 'ol/proj';
import { Fill, Stroke, Style, Text, Circle, Icon } from 'ol/style';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import TileGrid from 'ol/tilegrid/TileGrid';
import { DragRotateAndZoom } from 'ol/interaction';
import { Control } from 'ol/control';
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

const game_coord_to_pixels = (xx, yy) => {
	const xtot = TileMapInfo.x2 - TileMapInfo.x1;
	const ytot = TileMapInfo.y2 - TileMapInfo.y1;
	const xrel = (xx - TileMapInfo.x1) / xtot;
	const yrel = (yy - TileMapInfo.y1) / ytot;
	return [xrel * TileMapInfo.MAX_X, TileMapInfo.MAX_Y - (yrel * TileMapInfo.MAX_Y)];
};


export default function MapaETS(props){
	const instancjaPromods = useRef(null);
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
			socket.emit("poprosPozycje");
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
		//zdecyduj ktora mape wyswietlac
		

		const dostanMiasta = async () => {
			const dane = await fetch("https://thebossspedition.pl/MAPA/Cities.json");
			const parseDane = await dane.json();
			setMiasta(parseDane);
		};
		if(!miasta.length){
			dostanMiasta();
			return;
		}
		
		const dostanPanstwa = async () => {
			const dane = await fetch("https://thebossspedition.pl/MAPA/Countries.json");
			const parseDane = await dane.json();
			setPanstwa(parseDane);
		}
		if(!panstwa.length) {
			dostanPanstwa();
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
			const scale = Math.min(1, Math.max(0, 1.0 / Math.log2(res + 1) - 0.015));
			const tekst = nazwa;
			const fillT = new Fill();
			fillT.setColor("#ff8a0066");
			const strokeT = new Stroke();
			strokeT.setColor("#00000066");
			strokeT.setWidth(2);

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
					maxZoom: 9,
					minZoom: 0,
					wrapX: false,
					projection: projection,
					url: `https://thebossspedition.pl/MAPA/Tiles/{z}/{x}/{y}.png?v=153`,
					tilePixelRatio: 1,
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

		instancjaPromods.current = map;

		const graczeVectorLayer = new VectorLayer({
            source: new VectorSource(),
            style: (feature, resolution) => {
				const scale = Math.min(1, Math.max(0.2, 1.0 / Math.log2(resolution + 1) - 0.015));
				//console.log(scale, resolution);
                const fillT = new Fill({ color: "#00ffff66" });
                const strokeT = new Stroke({ color: "#00000066", width: 2 });
                return new Style({
                    // image: new Circle({
                    //     fill: new Fill({
                    //         color: 'rgba(20,255,20,1)',
                    //     }),
                    //     stroke: new Stroke({
                    //         color: '#3399CC',
                    //         width: 1.25,
                    //     }),
                    //     radius: 5,
                    // }),
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
	}, [miasta, panstwa, awatary]);

	// aktualizacja pozycji graczy
	useEffect(() => {
		if (graczeLayer) {
            const features = gracze.map((gracz) => {
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
			if(znajdz.pozycja && instancjaPromods.current){
				instancjaPromods.current.getView().setCenter(game_coord_to_pixels(znajdz.pozycja.positionX, znajdz.pozycja.positionZ));
			}
		}
	}, [gracze, graczeLayer]);

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
				<div className="naviIkonkiGlowne">
					<IkonkaTruck title={ciezarowka == null ? `Kierowca nie prowadzi aktualnie żadnego pojazdu.` : uszkodzeniaTruckString} style={ciezarowka == null ? {opacity: 0.2} : null} wypelnienie={sredniaTruck} />
					<IkonkaNaczepa title={naczepa == null ? `Kierowca nie posiada aktualnie żadnej naczepy.` : uszkodzeniaNaczepaString} style={naczepa == null ? {opacity: 0.2} : null} wypelnienie={sredniaNaczepa} />
				</div>

				<div className='naviDaneContainer' style={{alignItems: 'flex-start', justifyContent: 'space-around', gap: "10px", marginBottom: "30px", marginLeft: '-10px', marginRight: '-10px'}}>
					<div>
                        <span>Ciężarówka</span>
						{ ciezarowka == null ? <div className='naviMaleNapisy'><p>Brak</p></div> :
						<div className='naviMarkaModel'>
							{logoMarka ? <img className='naviLogoTruck' src={`/img/marki/${logoMarka}`} /> : ""}
							<div className='naviMaleNapisy naviMarkaModel' style={{width: 'min-content', textWrap: 'nowrap'}}>
                                <p>{ciezarowka.marka}</p>
                                <p>{ciezarowka.model}</p>
							</div>
						</div> }
					</div>
					<div className='naviMaleNapisy'>
                        <span>Naczepa</span>
						{ naczepa == null ? <p>Brak</p> : 
						<>
							{naczepa.marka || naczepa.model ? <p>{naczepa.marka ? naczepa.marka.toUpperCase() : ""} {naczepa.model ? naczepa.model : ""}</p> : ""}
							<p style={{textWrap: 'nowrap'}}>{spolszczonyTypNaczepy} {spolszczonyTypLancucha}</p>
							<p>{praca == null ? "Brak załadunku" : <>{praca.ladunek} {Math.round(praca.masa/1000)} t</>}</p>
						</> }
					</div>
				</div>

				<div className='naviDaneContainer' style={{flexDirection: "column", marginBottom: "50px"}}>
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
		<div className='naviDaneContainer' style={{width: "100%", marginBottom: "30px"}}>
			<div className='naviWspolrzedne'>
				<b>Pozycja X:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.positionX ? Number(tmpObj.pozycja.positionX).toFixed(0) : "Nieznane"}
			</div>
			<div className='naviWspolrzedne'>
				<b>Pozycja Y:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.positionZ ? Number(tmpObj.pozycja.positionZ).toFixed(0) : "Nieznane"}
			</div>
			<div className='naviWspolrzedne'>
				<b>Rotacja:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.heading ? `${360 - Number(tmpObj.pozycja.heading).toFixed(0)}°` : "Nieznane"}
			</div>
		</div>
		<div style={{display: 'flex', width: '100%', gap: 20}}>
			<button className="naviSledz" style={podazaj ? {background: "green"} : null} onClick={() => handlePodazaj()}>{podazaj ? "Przestań śledzić" : "Śledź na mapie"}</button>
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
				if(znajdz.pozycja && instancjaPromods.current){
					instancjaPromods.current.getView().setCenter(game_coord_to_pixels(znajdz.pozycja.positionX, znajdz.pozycja.positionZ));
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

	const StatusIndicator = ({kiedy}) => {
		const teraz = Date.now();
		const val = new Date(kiedy).getTime();
		let kolor = "chartreuse";
		let info = "W trasie";
// .winietyWytlumaczenie .niedlugoWinieta { background: orange; }
// .winietyWytlumaczenie .wygaslaWinieta { background: crimson; }
		if((val + 1000 * 60) < teraz){
			kolor = "orange";
			info = "Na przerwie";
		}
		if((val + 1000 * 60 * 5) < teraz){
			kolor = "crimson";
			info = "Niedostępny";
		}
		return <div title={info} style={{borderRadius: '100%', marginLeft: '6px', width: '14px', height: '14px', background: kolor}} />
	};

	return(<div className='mapaContainer'>
		<div ref={mapRef} style={{ flexGrow: 1, height: '100vh' }} />
		<div className="naviPanel">
			<div className='naviUstawieniaPrzycisk' onClick={() => setUstawieniaOtwarte(!ustawieniaOtwarte)} >{ustawieniaOtwarte ? <MdClose /> : <IoMdKey /> }</div>
			<div className='naviUstawienia' style={ustawieniaOtwarte ? null : {transform: `translateY(-120%)`}}>
				<p onClick={() => setWygenerujToken(Date.now())}>Unieważnij aktualny oraz wygeneruj nowy token do telemetrii.</p>
				<br />
				<p onClick={() => window.open('https://thebossspedition.pl/MAPA/telemetria.dll', '_blank')}>Pobierz telemetrię w wersji v{aktualnaWersjaDll}.</p>
				
			</div>
			<h3>Lista kierowców</h3>
			<div className='naviPanelKierowcy' style={{maxHeight: `${wybrany ? "" : "unset"}`}}>
				{ gracze.map((gracz, klucz) => {
					return <div key={`${gracz.login}}`} style={(gracz.login === wybrany) ? {background: "#FFC107",
						color: "#111"} : null} className="naviPanelKierowca" onClick={() => { setWybrany(gracz.login); setPodazaj(false); }}>
						<img src={awatary.dane.find(aw => aw.login === gracz.login) ? "/img/"+awatary.dane.find(aw => aw.login === gracz.login).awatar : "/img/awatary/default.png"} />
						<span>{gracz.login}</span>
						<StatusIndicator kiedy={gracz.kiedy} />
					</div>
				}) }
			</div>
			{ wybrany ?
			<div className="naviPanelInformacje">
				<h3>Kierowca {wybrany}</h3>
				<p className='naviZnacznikCzasowy'>Dane z { new Date(gracze.find(v => v.login === wybrany).kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', hour: "2-digit", minute: "2-digit", second: "2-digit"})}</p>
				<InformacjeWybranegoPoczatek ciezarowka={gracze.find(v => v.login === wybrany).ciezarowka || null} praca={gracze.find(v => v.login === wybrany).praca || null} naczepa={gracze.find(v => v.login === wybrany).naczepa || null} uszkodzenia={gracze.find(v => v.login === wybrany).uszkodzenia || null} />
				<div className='naviDaneContainer' style={{flexDirection: "column"}}>
					<span style={{marginBottom: "10px"}}>Telemetria</span>
					<div className='naviDaneContainer liczniki'>
						<Licznik min={0} max={180} cur={parseInt(gracze.find(v => v.login == wybrany).pozycja?.speed*3600/1000 || 0) } jednostka={"km/h"} tytul={"Prędkość"} />
						<Licznik min={0} max={gracze.find(v => v.login == wybrany).ciezarowka?.maxObroty || 2400} cur={parseInt(gracze.find(v => v.login == wybrany).pozycja?.rpm || 0)} jednostka={"obr"} tytul={"Obroty"} />
						<Licznik style={{width: '80px', height: '80px', marginTop: "20px"}} min={0} max={ gracze.find(v => v.login == wybrany).ciezarowka?.maxPaliwo || 1000} cur={parseInt(gracze.find(v => v.login == wybrany).pozycja?.fuel || 0)} jednostka={"l"} tytul={"Paliwo"} odwrocKolory={true}/>
					</div>
				</div>
				<InformacjeWybranegoKoncowka />
			</div> : "" }
            
		</div>
		{ (wyswietlRejestracje > -1) ? <div className={`naviRejestracja ${(wyswietlRejestracje ? "" : "wyjscieSmooth")}`}>
		{
			(ostatniaWersjaDll === null) ?
			<div className='naviInstrukcja'>
				<h2>Jesteś niezarejestrowany w systemie telemetrii.</h2>
				<h3>Aby dokonać rejestracji, wykonaj poniższe kroki:</h3>
				<ol>
					<li>Pobierz plik DLL telemetrii.<br /><button onClick={() => window.open('https://thebossspedition.pl/MAPA/telemetria.dll', '_blank')}>Pobierz</button></li>
					<li>Wygeneruj i pobierz klucz identyfikacyjny dla telemetrii.<br /><button onClick={() => setWygenerujToken(Date.now())}>Wygeneruj</button></li>
					<li>Umieść oba pobrane pliki w katalogu z grą ETS2 <b>`\bin\win_x64\plugins\`</b>.<br /><button onClick={() => zamknijRejestracje(0)}>Zrobione</button></li>
				</ol>
			</div> : ((aktualnaWersjaDll > ostatniaWersjaDll) ?
			<div className='naviInstrukcja'>
				<h2>Dostępna jest nowa wersja telemetrii.</h2>
				<p>Korzystasz z wersji <b>v{ostatniaWersjaDll}</b>, ale aktualna dostępna wersja to <b>v{aktualnaWersjaDll}</b>. Aby zaktualizować wersję wykonaj poniższe kroki:</p>
				<ol>
					<li>Pobierz <b>nowy</b> plik DLL telemetrii.<br /><button onClick={() => window.open('https://thebossspedition.pl/MAPA/telemetria.dll', '_blank')}>Pobierz</button></li>
					<li>Wygeneruj i pobierz <b>nowy</b> klucz identyfikacyjny dla telemetrii.<br /><button onClick={() => setWygenerujToken(Date.now())}>Wygeneruj</button></li>
					<li>Umieść oba pobrane pliki w katalogu z grą ETS2 <b>`\bin\win_x64\plugins\`</b>.<br /><button onClick={() => zamknijRejestracje(0)}>Zrobione</button></li>
				</ol>
			</div> : zamknijRejestracje(-1) )
		}
		<p onClick={() => zamknijRejestracje(0)}>Tylko oglądam</p>
		</div> : "" }
		<a ref={pobierak} style={{display: "none"}} />
	</div>)
};