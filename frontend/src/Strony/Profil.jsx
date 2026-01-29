import Nawigacja from "../Komponenty/Nawigacja";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	Label
} from "recharts";
import Osiagniecia from "@/Komponenty/Osiagniecia";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { FaUserCheck, FaUserTimes,FaUserClock, FaRedoAlt, FaPencilAlt, FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
import { IoIosTrophy } from "react-icons/io";
export default function Profil(props){
	const obejscieTlo = (c) => { return {backgroundImage: `url('${c}')`}};
    const { loginP} = useParams();
	if(loginP){
		document.title = "The Boss Spedition - "+loginP;
		if(loginP === localStorage.getItem('login')) { window.location.href = "/profil/"; }
	} else {
		document.title = "The Boss Spedition - Mój Profil";
	}
	const [ blad, setBlad ] = useState(null);
	const [ daneWykres, setDaneWykres ] = useState([]);
	const [ ktoreWykres, setKtoreWykres ] = useState(0);
    const [ daneProfilu, setDaneProfilu ] = useState({prevLink: null,
		gotowe: null, steam: null, datadolaczenia: null, truckbook: null,
		truckersmp: null, typkonta: null, discord: null, garaz: null, truck: null,
		login: null, stanKonta: null, ranga: null, awatar: null, stawka: null, dostepATS: null
	});
	const [ komunikat, setKomunikat ] = useState(null);
	const [ komentarze, setKomentarze ] = useState({response: null, dane: null, wysuniete: false});
	const [ dodawanyKomentarz, setDodawanyKomentarz ] = useState("");
	const [ edycjaProfilu, setEdycjaProfilu ] = useState(false);
	const [ zmianyProfil, setZmianyProfil ] = useState({response: null});
	const [ pokazPolskie, setPokazPolskie ] = useState(false);
	const [ pokazAmerykanskie, setPokazAmerykanskie ] = useState(false);
	const [ pokazKartePaliwowa, setPokazKartePaliwowa] = useState(false);
	const [ daneKartaPaliwowa, setDaneKartaPaliwowa ] = useState({response: null, punkty: null, przejechane: null, trasy: null});
	const [ telemetriaPaliwo, setTelemetriaPaliwo ] = useState({response: null, punkty: 0, wydatki: 0});
	const [ szkoleniaETS, setSzkoleniaETS ] = useState({response: null});
	const [ licencjeETS, setLicencjeETS ] = useState({response: null});
	const [ szkoleniaATS, setSzkoleniaATS ] = useState({response: null});
	const [ licencjeATS, setLicencjeATS ] = useState({response: null});
	const [ winiety, setWiniety ] = useState({response: null, dane: null, wysuniete: false});
	const [ urlop, setUrlop ] = useState({response: false, dane: null});
	const [ pokazOsiagniecia, setPokazOsiagniecia] = useState(false);
	const { toast } = useToast();

	const getDane = async (dane) => {
		try {
			const login = dane.login;
			const localLogin = localStorage.getItem("login");
	
			// Pobranie danych profilu
			const profilRes = await Axios.post(`${gb.backendIP}profilDane/${login}/${localLogin}`);
			if (profilRes.data['blad']) {
				setBlad(profilRes.data['blad']);
				return;
			}
	
			if (login === localLogin) {
				localStorage.setItem('awatar', `img/${profilRes.data['awatar']}`);
			}
	
			// Pobranie stanu konta równolegle
			const [zarobek, kary, upr, gesty, winiety] = await Promise.all([
				Axios.post(`${gb.backendIP}stankonta/${login}/wlasnyzarobek`),
				Axios.post(`${gb.backendIP}stankonta/${login}/kary`),
				Axios.post(`${gb.backendIP}stankonta/${login}/upr`),
				Axios.post(`${gb.backendIP}stankonta/${login}/gesty`),
				Axios.post(`${gb.backendIP}stankonta/${login}/winiety`),
			]);
	
			// Obliczenie stanu konta
			const stanKonta =
				zarobek.data['odp'] -
				kary.data['odp'] -
				upr.data['odp'] +
				gesty.data['odp'] -
				winiety.data['odp'];
	
			// Aktualizacja stanu
			setDaneProfilu({ ...dane, ...profilRes.data, stanKonta });
			setKtoreWykres(0);
			setKomentarze({ response: null, dane: null, wysuniete: false });
			setWiniety({ response: null, dane: null, wysuniete: false });
			setDodawanyKomentarz("");
			setSzkoleniaETS({ response: null, Poj: null, Pod: null, HTC: null, BD: null });
			setLicencjeETS({ response: null, Poj: null, Pod: null, HTC: null, BD: null });
			setSzkoleniaATS({ response: null, Poj: null, Pod: null, HTC: null, BD: null });
			setLicencjeATS({ response: null });
			setDaneKartaPaliwowa({response: false, wydane: null, punkty: null, spalanie: null, przejechane: null, trasy: null});
			setTelemetriaPaliwo({response: false, wydane: 0, punkty: 0});
		} catch (error) {
			console.error("Błąd podczas pobierania danych profilu:", error);
			setBlad("Wystąpił błąd przy pobieraniu danych.");
		}
	};

    const getDaneSTARE = (dane) =>{
		let zwrot = {};
		Axios.post(gb.backendIP+"profilDane/"+dane.login+"/"+localStorage.getItem("login")).then((res) => {
			if(!res.data['blad']){
				zwrot = res.data;
				if(dane.login === localStorage.getItem('login')){
					localStorage.setItem('awatar', "img/"+res.data['awatar']);
				}
			} else {
				setBlad(res.data['blad']);
			}
		});
		let odp = 0;
		Axios.post(gb.backendIP+"stankonta/"+dane.login+"/wlasnyzarobek").then((res) => {
			odp += res.data['odp'];
			Axios.post(gb.backendIP+"stankonta/"+dane.login+"/kary").then((res2) => {
				odp -= res2.data['odp'];
				Axios.post(gb.backendIP+"stankonta/"+dane.login+"/upr").then((res3) => {
					odp -= res3.data['odp'];
					Axios.post(gb.backendIP+"stankonta/"+dane.login+"/gesty").then((res4) => {
						odp += res4.data['odp'];
						Axios.post(gb.backendIP+"stankonta/"+dane.login+"/winiety").then((res5) => {
							odp -= res5.data['odp'];
							setDaneProfilu({...dane, ...zwrot, stanKonta: odp});
							setKtoreWykres(0);
							setKomentarze({response: null, dane: null, wysuniete: false});
							setWiniety({response: null, dane: null, wysuniete: false});
							setDodawanyKomentarz("");
							setSzkoleniaETS({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setLicencjeETS({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setSzkoleniaATS({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setLicencjeATS({response: null});
						});
					});
				});
			});
		});
		// Axios.post(gb.backendIP+"kartaPaliwowaDane/"+daneProfilu.login).then((r) => {
		// 	setDaneKartaPaliwowa({response: true, ...r.data});
		// }).catch((er) => {
		// 	console.log(er);
		// 	setDaneKartaPaliwowa({response: true, wydane: null, punkty: null, spalanie: null, przejechane: null, trasy: null});
		// });
		// Axios.post(gb.backendIP+"kartaPaliwowa/"+daneProfilu.login).then((r) => {
		// 	setTelemetriaPaliwo({response: true, ...r.data});
		// }).catch((er) => {
		// 	console.log(er);
		// 	setTelemetriaPaliwo({response: true, wydane: 0, punkty: 0});
		// });
	};

	const sprawdzLogin = () => {
		const tempDane = {...daneProfilu, gotowe: 1, prevLink: window.location.href};
		if(!loginP){
			tempDane.login = localStorage.getItem('login');
			tempDane.awatar = localStorage.getItem('awatar');
			tempDane.typkontaNazwa = localStorage.getItem('typkontaNazwa');
			tempDane.stanowiskoNazwa = localStorage.getItem('stanowiskoNazwa');
        } else {
			tempDane.login = loginP;
        }
		getDane(tempDane);
	}

	const zaladujWykres = (ktore) => {
		if(ktore === 1){
			Axios.post(gb.backendIP+"ostatnie10tras/"+daneProfilu.login+"/dystanskm").then((res) => {
				if(!res.data['blad']){
					setDaneWykres(res.data['dane']);
				}
			}).catch((err) => console.log(err));
		}
		if(ktore === 2){
			Axios.post(gb.backendIP+"ostatnie10tras/"+daneProfilu.login+"/spalanie").then((res) => {
				if(!res.data['blad']){
					setDaneWykres(res.data['dane']);
				}
			}).catch((err) => console.log(err));
		}
		if(ktore === 3){
			Axios.post(gb.backendIP+"ostatnie10tras/"+daneProfilu.login+"/zarobki").then((res) => {
				if(!res.data['blad']){
					setDaneWykres(res.data['dane']);
				}
			}).catch((err) => console.log(err));
		}
		setKtoreWykres(ktore);
	}

	const dostanKomentarze = () => {
		Axios.post(gb.backendIP+"komentarze/"+daneProfilu.login).then((res) => {
			if(!res.data['blad']){
				setKomentarze({...komentarze, response: 1, dane: res.data['dane']});
			} else {
				setKomentarze({...komentarze, response: 1, dane: null});
			}
		}).catch((er) => console.log(er));
	};
	const dodajKomentarz = () => {
		if(dodawanyKomentarz && dodawanyKomentarz.length > 5 && dodawanyKomentarz.length < 300){
			Axios.post(gb.backendIP+"dodajKomentarz/"+daneProfilu.login+"/"+localStorage.getItem('login')+"/"+localStorage.getItem('token'), {
				wiadomosc: dodawanyKomentarz
			}).then((res) => {
				if(res.data['odp'] === "OK"){
					console.log("Dodano komentarz");
					dostanKomentarze();
				}
			})
			setDodawanyKomentarz("");
			document.getElementById("dodawanyKomentarz").value = "";
		}
	};
	const usunKomentarz = (ktory, potwierdzenie) => {
		if(!potwierdzenie){
			setKomunikat(ktory);
		} else {
			setKomunikat(null);
			Axios.post(gb.backendIP+"usunKomentarz/"+localStorage.getItem('login')+"/"+daneProfilu.login+"/"+ktory).then((res) => {
				dostanKomentarze();
			}).catch((er) => console.log(er));
		}
	};
	const zwrocKomentarze = () => {
			return(
				<>
				<div className="hover:bg-[#eee] hover:text-[#1c1c1c] flex gap-2 items-center cursor-pointer [&_svg]:ml-1.25 [&_svg]:align-middle absolute top-full left-5 py-2.5 px-3.75 bg-[#141414] text-[#eee] transition-all duration-300 shadow-[0_0_20px_4px_#111]" onClick={() => {setKomentarze({...komentarze, wysuniete: !komentarze.wysuniete}); setKomunikat(null); setWiniety({...winiety, wysuniete: false}); }}>Notatki {komentarze.wysuniete ? <FaArrowAltCircleDown style={{color: 'crimson'}} /> : <FaArrowAltCircleUp />}</div>
				{ komentarze.wysuniete ?
				<div className={komunikat ? "absolute left-0 right-0 bottom-0 top-0 bg-[#141414] p-2.5 wejscieSmooth blur-xs" : "absolute left-0 right-0 bottom-0 top-0 bg-[#141414] p-2.5 wejscieSmooth"}>
					{ komunikat && <div className="overlay"/>}
					<div className="overflow-y-auto h-[calc(100%-70px)] bg-[#222] p-2.5 mb-2.5 wejscieSmooth">
					{komentarze.dane ? komentarze.dane.map((komentarz) => {
						const kiedy = new Date(komentarz.kiedy);
						return(
							<div className="last:mb-1.25 relative flex text-white grow p-2.5 bg-[#1c1c1c] mb-3.75 flex-col" key={"komentarz_"+komentarz.idnotatki}>
								{ (localStorage.typkonta <= 3) && <a className="text-[gray] absolute right-5 text-[0.8rem] wejscieSmooth" onClick={() => { usunKomentarz(komentarz.idnotatki, false)}}>Usuń</a>}
								<div className="text-[0.85rem] text-[gray] flex">
									<a className="mr-2.5" href={"/profil/"+komentarz.kto}>{komentarz.kto}</a>
									<p>{kiedy.toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
								</div>
								<div className="text-[0.95rem] mt-1.25">{komentarz.tresc}</div>
							</div>
						)
					}) : <p style={{color: 'goldenrod', textShadow: '1px 1px 3px #111', fontWeight: 'bold'}}>Użytkownik {daneProfilu.login} nie posiada na dany moment żadnych notatek!</p>}
					</div>
					<div className="h-15 w-full relative wejscieSmooth">
						<textarea 
						className="focus:outline-0 focus:border-[dodgerblue] w-full h-full p-2.5 pr-25 text-[1rem] font-bold text-[#ccc] bg-[#ffffff0f] border border-[goldenrod] resize-none overflow-y-hidden transition-colors duration-300"
						type="text" id="dodawanyKomentarz" placeholder="Dodaj nową notatkę..." onChange={(e) => {setDodawanyKomentarz(e.target.value)}} required/>
						<input
						className="hover:bg-[goldenrod] hover:text-[#eee] text-zinc-800 cursor-pointer font-bold absolute right-0 h-full align-middle py-2.5 px-5 border border-[goldenrod] bg-[#ddd] text-[1rem] transition-all duration-300"
						type="submit" value="Dodaj" onClick={(e) => {
							e.preventDefault();
							dodajKomentarz();
						}}/>
					</div>
				</div>
				: ""
				}
				</>
			)
	};

	const zwrocWiniety = () => {
		return(
			<>
			<div className="hover:bg-[#eee] hover:text-[#1c1c1c] flex gap-2 items-center cursor-pointer absolute top-full left-45 py-2.5 px-3.75 bg-[#141414] text-[#eee] transition-all duration-300 shadow-[0_0_20px_4px_#111]" onClick={() => {setWiniety({...winiety, wysuniete: !winiety.wysuniete}); setKomentarze({...komentarze, wysuniete: false}); }}>Winiety {winiety.wysuniete ? <FaArrowAltCircleDown style={{color: 'crimson'}} /> : <FaArrowAltCircleUp />}</div>
			{daneProfilu.login == localStorage.getItem("login") ?
				<Link to={"../winiety"}
					className={winiety.wysuniete ? "[&_svg]:text-[1.1rem] z-2 flex gap-2 items-center absolute top-full left-74 py-2.5 px-3.75 bg-[#222] text-[#eee] cursor-pointer transition-all duration-300 hover:bg-[#444] hover:text-[#111]"
						: "[&_svg]:text-[1.1rem] flex gap-2 items-center absolute top-full left-74 py-2.5 bg-[#222] text-[#eee] cursor-pointer transition-all duration-300 hover:bg-[#444] hover:text-[#111] w-0 px-0 overflow-hidden"}
				>Zakup <RiShoppingBasket2Fill /></Link>
			: 
			(localStorage.getItem('typkonta') ?
				((parseInt(localStorage.getItem('typkonta')) <= 3 ) ) ?
				<Link to={"../winiety/"+daneProfilu.login}
				className={winiety.wysuniete ? "flex gap-2 items-center [&_svg]:text-[1.1rem] z-2 absolute top-full left-74 py-2.5 px-3.75 bg-[#222] text-[#eee] cursor-pointer transition-all duration-300 hover:bg-[#444] hover:text-[#111]"
					: "[&_svg]:text-[1.1rem] flex gap-2 items-center absolute top-full left-74 py-2.5 bg-[#222] text-[#eee] cursor-pointer transition-all duration-300 hover:bg-[#444] hover:text-[#111] w-0 px-0 overflow-hidden"}
				>Nadaj <RiShoppingBasket2Fill /></Link>
				: ""
			: "")}
			{ winiety.wysuniete ?
				<div className="absolute left-0 right-0 bottom-0 top-0 bg-[#141414] p-2.5 wejscieSmooth">
					<div className="align-baseline flex-wrap gap-3.75 flex-row flex mb-0 h-full p-2.5 bg-[#222] overflow-y-auto wejscieSmooth">
					{winiety.dane ? winiety.dane.map((winieta) => {
						const kiedy = new Date(winieta.termin);
						return(
							<div className="relative flex text-white grow p-2.5 bg-[#1c1c1c] mb-3.75 flex-row w-fit max-w-[320px] h-20" key={"winieta_"+winieta.idwiniety}>
								<img className="mr-2.5 w-25 h-15 shadow-[0_0_6px_0_#000]" src={"/img/flagi/"+winieta.flaga+".png"} />
								<div className="flex grow flex-col items-center justify-center">
									<span>{winieta.kraj}</span>
									<p className="mt-1.25 text-[0.8rem]">{kiedy.toLocaleString('pl-PL', {day: 'numeric', month: '2-digit', year: 'numeric'})}</p>
								</div>
							</div>
						)
					}) : <p style={{color: 'goldenrod', textShadow: '1px 1px 3px #111', fontWeight: 'bold'}}>Użytkownik {daneProfilu.login} nie posiada na dany moment żadnych winiet!</p>}
					</div>
				</div>
				: ""
				}
			</>
		);
	};

	const dostanWiniety = () => {
		Axios.post(gb.backendIP+"profilWiniety/"+daneProfilu.login).then((res) => {
			if(!res.data['blad']){
				setWiniety({...winiety, response: 1, dane: res.data['dane']});
			} else {
				setWiniety({...winiety, response: 1, dane: null});
			}
		}).catch((er) => console.log(er));
	};

	const getDaneEdycja = () => {
		Axios.post(gb.backendIP+"profilFullDane/"+localStorage.getItem('token')).then((res) => {
			if(res.data['blad']){
				localStorage.clear();
				window.location.href = "";
			}
			if(res.data['dane']){
				const tmp = res.data['dane'];
				setZmianyProfil({...zmianyProfil, ...tmp, response: 1});
			}
		}).catch((er) => { console.log(er); setZmianyProfil({response: 1}); })
	};

	const zaktualizujProfil = () => {
		Axios.post(gb.backendIP+"zaktualizujProfil/"+localStorage.getItem('token')+"/"+localStorage.getItem('login'), {
			awatarImg: zmianyProfil.awatarPlik,
			email: zmianyProfil.email,
			truckbook: zmianyProfil.truckbook,
			truckersmp: zmianyProfil.truckersmp,
			worldoftrucks: zmianyProfil.worldoftrucks,
			steam: zmianyProfil.steam,
			garaz: zmianyProfil.garaz,
			truck: zmianyProfil.truck,
			noweHaslo1: zmianyProfil.noweHaslo1,
			noweHaslo2: zmianyProfil.noweHaslo2
		}, { headers: { 'Content-Type': 'multipart/form-data'}}).then((res) => {
			if(res.data['odp']){
				sprawdzLogin();
				setEdycjaProfilu(false);
				setZmianyProfil({response: null});
				setKtoreWykres(0);
				setDaneWykres([]);
			} else {
				console.log("Cos sie odjebalo");
			}
		}).catch((er) => console.log("Blad zmiana profilu:", er));
	};

	const dostanLicencjeETS = () => { Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/licencjeETS").then((res) => { setLicencjeETS(res.data);}); }
	const dostanSzkoleniaETS = () => { Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/szkoleniaETS").then((res) => { setSzkoleniaETS(res.data)}); }
	const dostanLicencjeATS = () => { Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/licencjeATS").then((res) => { setLicencjeATS(res.data);}); }
	const dostanSzkoleniaATS = () => { Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/szkoleniaATS").then((res) => { setSzkoleniaATS(res.data)}); }

	const formatujWaznosc = (i, ...arg) => {
		if(i === "Brak"){
			if(arg.length){
				if(arg[0] === "Brak"){
					return <span title="Szkolenie: Brak">Brak</span>
				} else {
					return <span title={`Szkolenie: ${new Date(arg[0]).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Brak</span>
				}
			} else {
				return <span title={arg.length ? `Szkolenie: ${new Date(arg[0]).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}` : null}>Brak</span>
			}
		}
		if(Date.now() > new Date(i).getTime() ){
			return <span title={arg.length ? `Szkolenie: ${new Date(arg[0]).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}` : null} style={{color: '#f00', fontWeight: 500}}>{new Date(i).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
		} else {
			return <span title={arg.length ? `Szkolenie: ${new Date(arg[0]).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}` : null} style={{fontWeight: 500}}>{new Date(i).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
		}
	};

	const dostanUrlopy = () => {
		if(!daneProfilu.login) return;
		Axios.post(gb.backendIP+"urlopyUzytkownika/"+localStorage.getItem("token")+"/"+daneProfilu.login).then((r) => {
			setUrlop({response: true, ...r.data});
		}).catch((er) => setUrlop({response: true, dane: null}));
	};

	const wyswietlUrlop = () => {
		let daneUrlop;
		let trwaAktualnie;
		urlop.dane && urlop.dane.map((wiersz) => {
			//jesli dzis NIE jest pozniej od zakonczenia
			if(!(Date.now() > new Date(wiersz.dokiedy).getTime())){
				daneUrlop = wiersz;
				if((Date.now() >= new Date(wiersz.odkiedy).getTime())){
					trwaAktualnie = true;
				} else {
					trwaAktualnie = false;
				}
			}
		});
		//czy wyswietla swoj wlasny profil
		if(!daneUrlop) return;
		if(daneProfilu.login == localStorage.getItem("login")){
			//tak
			if(trwaAktualnie){
				return(
					<div className="p-5 flex items-center gap-5 absolute top-full text-right max-w-7/10 right-0 bg-[#0c0c0c] rounded-b-4xl italic text-[orange]">
						<div>
							<span>Jesteś na urlopie od <b>{new Date(daneUrlop.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneUrlop.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>.</span>
							<br />
							<span>Możesz zakończyć swój Urlop wcześniej klikając w następujący przycisk.</span>
						</div>
						<button className="hover:tracking-[2px] hover:text-[#ddd] mt-2.5 py-2 px-2.5 outline-0 border-0 bg-[crimson] font-semibold text-[0.9rem] text-[#111] text-shadow-[0_0_3px_#222] shadow-[0_0_10px_1px_#111] cursor-pointer transition-all duration-300" onClick={() => zakonczUrlop(daneUrlop.idwniosku) }>Zakończ urlop</button>
					</div>
				);
			} else {
				return(
					<div className="p-5 flex items-center gap-5 absolute top-full text-right max-w-7/10 right-0 bg-[#0c0c0c] rounded-b-4xl italic text-[orange]">
						<div>
							<span>Masz zaplanowany Urlop od <b>{new Date(daneUrlop.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneUrlop.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>.</span>
							<br />
							<span>Możesz anulować swój Urlop klikając w następujący przycisk.</span>
						</div>
						<button className="hover:tracking-[2px] hover:text-[#ddd] mt-2.5 py-2 px-2.5 outline-0 border-0 bg-[crimson] font-semibold text-[0.9rem] text-[#111] text-shadow-[0_0_3px_#222] shadow-[0_0_10px_1px_#111] cursor-pointer transition-all duration-300" onClick={() => zakonczUrlop(daneUrlop.idwniosku) }>Anuluj urlop</button>
					</div>
				);
			}
		} else {
			if(trwaAktualnie){
				return(
					<div className="p-5 flex items-center gap-5 absolute top-full text-right max-w-7/10 right-0 bg-[#0c0c0c] rounded-b-4xl italic text-[orange]">
						<span>Kierowca jest na urlopie od <b>{new Date(daneUrlop.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneUrlop.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>.</span>
					</div>
				);
			} else {
				return(
					<div className="p-5 flex items-center gap-5 absolute top-full text-right max-w-7/10 right-0 bg-[#0c0c0c] rounded-b-4xl italic text-[orange]">
						<span>Kierowca ma zaplanowany Urlop od <b>{new Date(daneUrlop.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneUrlop.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>.</span>
					</div>
				);
			}
		}
	};

	const zakonczUrlop = (idwniosku) => {
		Axios.post(gb.backendIP+"zakonczUrlop/"+localStorage.getItem('token'), {
            ktory: idwniosku
        }).then((r) => {
            if(!r.data['blad']) {
                console.log("Pomyslnie zakonczono urlop");
                setUrlop({response: false, dane: null});
            }
        }).catch((er) => console.log(er));
	};

	const dostanDaneKartaPaliwowa = () => {
		Axios.post(gb.backendIP+"kartaPaliwowaDane/"+daneProfilu.login).then((r) => {
			setDaneKartaPaliwowa({response: true, ...r.data});
		}).catch((er) => {
			console.log(er);
			setDaneKartaPaliwowa({response: true, wydane: null, punkty: null, spalanie: null, przejechane: null, trasy: null});
		});
	};
	const dostanTelemetriaPaliwo = () => {
		Axios.post(gb.backendIP+"kartaPaliwowa/"+daneProfilu.login).then((r) => {
			setTelemetriaPaliwo({response: true, ...r.data});
		}).catch((er) => {
			console.log(er);
			setTelemetriaPaliwo({response: true, wydane: 0, punkty: 0});
		});
	};

    return(
        <>
        <Nawigacja />
		<Toaster richColors />
        <div className="tlo" />
        <div className="srodekekranu">
			{ !blad &&
			<div className="z-1 h-15 flex rounded-t-4xl justify-evenly w-full max-w-312.5 bg-[#181818] shadow-[0_0_20px_5px_rgba(17,17,17,0.88)] border-b border-white">
                <div className="w-66.75 h-41.75 bg-cover bg-center translate-y-7.5 shadow-[0_0_20px_5px_#111] cursor-pointer hover:translate-y-3.75 transition-transform duration-300" title="Polskie prawo jazdy" style={{backgroundImage: `url("/img/prawkoPLprzod.png")`}} onClick={() => setPokazPolskie(true)}></div>
				{ (daneProfilu.dostepATS == true) && <div className="w-66.75 h-41.75 bg-cover bg-center translate-y-7.5 shadow-[0_0_20px_5px_#111] cursor-pointer hover:translate-y-3.75 transition-transform duration-300" style={{backgroundImage: `url("/img/prawkoUSAprzod.png")`}} onClick={() => setPokazAmerykanskie(true)}></div> }
				{
					daneProfilu.typkonta < 10 &&
					<div className="relative w-66.75 h-41.75 bg-cover bg-center translate-y-7.5 shadow-[0_0_20px_5px_#111] cursor-pointer hover:translate-y-3.75 transition-transform duration-300" title="Karta paliwowa" style={{backgroundImage: `url("/img/kartaPaliwowa.png")`}} onClick={() => setPokazKartePaliwowa(true)}>
						<span className="top-2 left-4 text-[0.85rem] absolute font-bold italic tracking-[3px] text-[#ffe000] w-[70%] border-b-2 border-[crimson] pb-1.75">Karta Paliwowa</span>
					</div>
				}
            </div>
			}
            <div className="w-full max-w-312.5 bg-[#111] shadow-[0_0_20px_5px_#111] relative"  style={{zIndex: 2}}>
                <div className="h-80 px-12 py-5 flex items-center justify-between">
					<div className="flex" style={{width: '100%'}}>
						{ blad ? 
						<div className="flex flex-col justify-between grow">
							<div />
							<div>
								<span>Nie ma takiego użytkownika!</span>
							</div>
							<div><span>Wydaje się, że zbłądziłeś!</span></div>
						</div>
						:
						<>
						<div className="bg-cover bg-center h-52.5 w-52.5 min-w-52.5 mr-7" style={obejscieTlo("/img/"+daneProfilu.awatar)} />
						<div className="flex flex-col justify-between grow">
							<div className="flex flex-col">
								<span className="tracking-[1px] text-[#eee] font-bold text-[1.7rem]">{daneProfilu.login ? daneProfilu.login : "Brak"}</span>
								<span className="text-[1.3rem] text-[greenyellow] font-bold tracking-[1px] leading-[1.1]">{daneProfilu.typkontaNazwa ? daneProfilu.typkontaNazwa : "?"}<br /><span style={{fontSize: '0.9rem'}}>{daneProfilu.stanowiskoNazwa ? daneProfilu.stanowiskoNazwa : "?"}</span></span>
							</div>
							<div className="flex flex-col">
								<span className="text-[1.1rem] tracking-[1px] font-semibold">Stan konta: { daneProfilu.stanKonta ? daneProfilu.stanKonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) : "0,00 zł"} <sup>{daneProfilu.stawka}zł/km</sup></span>
							</div>
							<div className="flex flex-col text-[0.9rem] leading-[1.4]">
								<span>Dołączył { daneProfilu.datadolaczenia ? new Date(daneProfilu.datadolaczenia).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'}) : "?"}.</span>
								<span>Główny garaż w {daneProfilu.garaz ? daneProfilu.garaz : "Brak"}.</span>
								<span>Ulubiony truck to {daneProfilu.truck ? daneProfilu.truck : "Brak"}.</span>
								<br />
								<div className="flex">
									{ daneProfilu.truckersmp && <a rel="noreferrer" className="mr-3.5 h-10 w-10 block bg-cover bg-center" href={`${daneProfilu.truckersmp}`} style={obejscieTlo("/img/truckersmp.png")} target="_blank"/>}
									{ daneProfilu.truckbook && <a rel="noreferrer" className="mr-3.5 h-10 w-10 block bg-cover bg-center" style={obejscieTlo("/img/truckbook.png")} href={`${daneProfilu.truckbook}`} target="_blank"/>}
									{ daneProfilu.worldoftrucks && <a rel="noreferrer" className="mr-3.5 h-10 w-10 block bg-cover bg-center" style={obejscieTlo("/img/worldoftrucks.png")} href={`${daneProfilu.worldoftrucks}`} target="_blank"/>}
									{ daneProfilu.steam && <a rel="noreferrer" className="h-10 w-10 block bg-cover bg-center" style={obejscieTlo("/img/steam.png")} href={`${daneProfilu.steam}`} target="_blank"/>}
								</div>
								{ !daneProfilu.discord && <span style={{color: 'crimson'}}>Brak połączenia z Discordem!</span> }
							</div>
						</div>
						<div className="flex grow flex-col -mb-3.5 relative [&::before]:absolute [&::before]:block before:top-0 [&::before]:content-['Statystyka_ostatnich_tras'] [&::before]:left-0 [&::before]:right-0 [&::before]:text-center">
							{ daneProfilu.login && !ktoreWykres && zaladujWykres(1) }
							{ (daneWykres.length > 1) ?
							<>
							<div className="max-w-125 w-full h-50">
							<ResponsiveContainer>
								<AreaChart data={daneWykres} margin={{top: 30, left: 10, right: 30, bottom: 20}}>
									<defs>
										<linearGradient id="throttleColor" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#6a0000" stopOpacity={0.9}/>
										<stop offset="95%" stopColor="#6a0000" stopOpacity={0.3}/>
										</linearGradient>
									</defs>
									<XAxis dataKey="x" allowDecimals={true}>
										<Label value="ID trasy" position="insideBottom" dy={20} style={{fill: 'white', textAnchor: 'middle'}}/>
									</XAxis>
									<YAxis dataKey="y" allowDecimals={true}>
										<Label value="Wartość"
										 dy={-30} position="insideTopLeft"
										style={{fill: 'white'}}/>
									</YAxis>

									{ (ktoreWykres === 1) && <Area
										name="Dystans"
										unit=" km"
										type="monotone"
										dataKey="y"
										strokeWidth={2} stroke="#6a0000" fill="url(#throttleColor)"
									/> }
									{ (ktoreWykres === 2) && <Area
										name="Spalanie"
										unit=" l / 100 km"
										type="monotone"
										dataKey="y"
										strokeWidth={2} stroke="#6a0000" fill="url(#throttleColor)"
									/> }
									{ (ktoreWykres === 3) && <Area
										name="Zarobek"
										unit=" zł"
										type="monotone"
										dataKey="y"
										strokeWidth={2} stroke="#6a0000" fill="url(#throttleColor)"
									/> }
									{ (ktoreWykres === 2) ? <Tooltip formatter={(v) => v.toFixed(1)}/> : <Tooltip /> }
									<CartesianGrid stroke="#ccc3" strokeDasharray="3 3"/>
								</AreaChart>
							</ResponsiveContainer>
							</div>
							{/* .ktoryWykresWybrany { margin-top: 20px; margin-bottom: -20px; text-align: center;}
.ktoryWykresWybrany button { background: #eee; outline: none; border: none; padding: 8px; margin: 0 15px; cursor: pointer; transition: background, letter-spacing 0.4s ease;}
.ktoryWykresWybrany button:hover { background: #aaa; letter-spacing: 1px;}
.ktoryWykresWybrany button:disabled { background: #373; color: #ddd; cursor: not-allowed; letter-spacing: normal;} */}
							<div className="mt-5 -mb-5 text-center text-[0.85rem] font-normal">
								{ daneProfilu.login && ((ktoreWykres === 1) ? <button className="bg-[#373] text-zinc-100 outline-0 border-0 p-2 mx-3.5 cursor-not-allowed hover:tracking-[1px] hover:bg-[#aaa] transition-all" disabled>Dystans KM</button> : <button className="bg-[#eee] text-zinc-800 outline-0 border-0 p-2 mx-3.5 cursor-pointer hover:tracking-[1px] hover:bg-[#aaa] transition-all" onClick={() => {zaladujWykres(1);}}>Dystans KM</button>)}
								{ daneProfilu.login && ((ktoreWykres === 2) ? <button className="bg-[#373] text-zinc-100 outline-0 border-0 p-2 mx-3.5 cursor-not-allowed hover:tracking-[1px] hover:bg-[#aaa] transition-all" disabled>Spalanie</button> : <button className="bg-[#eee] text-zinc-800 outline-0 border-0 p-2 mx-3.5 cursor-pointer hover:tracking-[1px] hover:bg-[#aaa] transition-all" onClick={() => { zaladujWykres(2)}}>Spalanie</button>)}
								{ daneProfilu.login && ((ktoreWykres === 3) ? <button className="bg-[#373] text-zinc-100 outline-0 border-0 p-2 mx-3.5 cursor-not-allowed hover:tracking-[1px] hover:bg-[#aaa] transition-all" disabled>Zarobek</button> : <button className="bg-[#eee] text-zinc-800 outline-0 border-0 p-2 mx-3.5 cursor-pointer hover:tracking-[1px] hover:bg-[#aaa] transition-all" onClick={() => { zaladujWykres(3);}}>Zarobek</button>)}
								
							</div>
							</>
							: <span>Użytkownik nie posiada co najmniej 2<br/>oddanych i zatwierdzonych tras 😥</span>}
						</div>
						</>
						}
					</div>
                </div>
				{ daneProfilu.login && (komentarze.response ? zwrocKomentarze() : dostanKomentarze())}
				{ daneProfilu.login && komentarze.response && (winiety.response ? zwrocWiniety() : dostanWiniety())}
				{ (daneProfilu.login && komentarze.response && winiety.response) && (!urlop.response ? dostanUrlopy() : wyswietlUrlop() ) }
				<div className="hover:bg-[#eee] hover:text-[#1c1c1c] flex gap-2 items-center cursor-pointer [&_svg]:ml-1.25 [&_svg]:align-middle absolute top-full left-85 py-2.5 px-3.75 bg-[#141414] text-[#eee] transition-all duration-300 shadow-[0_0_20px_4px_#111]" onClick={() => setPokazOsiagniecia(true)}>Osiągnięcia <IoIosTrophy className="scale-[1.3] -ml-px" /></div>
				<Osiagniecia otwarte={pokazOsiagniecia} setOtwarte={setPokazOsiagniecia} kierowca={daneProfilu.login} toast={toast} />
				{ ((localStorage.getItem('login') === daneProfilu.login) && !komentarze.wysuniete && !winiety.wysuniete) &&
				<>
					<FaPencilAlt className="absolute z-20 top-0 left-0 p-2.5 h-10 w-10 rounded-br-4xl cursor-pointer transition-all duration-300 text-[#555] bg-[#111]
					hover:text-white hover:bg-[#181818] hover:rounder-br-[15px]
					" onClick={() => { setEdycjaProfilu(!edycjaProfilu)}} />
					<div className={edycjaProfilu ? "flex flex-col absolute z-3 overflow-hidden left-0 top-0 -bottom-15 right-0 bg-[#0c0c0c] p-5 pl-12.5 transition-all duration-[0.4s]" : "flex flex-col absolute z-3 overflow-hidden left-0 top-0 bottom-full right-full bg-[#181818] transition-all duration-[0.4s]"}>
						{ zmianyProfil.response ?
						<>
						<div className="wejscieSmooth" style={{display: 'flex'}}>
							<div className="flex mr-5 flex-col w-57.5 p-3.5 rounded-2xl">
								<div className="group relative rounded-[10px] shadow-[0_0_20px_3px_#000] w-50 h-50 bg-white bg-cover bg-center wejscieSmooth" style={obejscieTlo(zmianyProfil.awatarBlob ? zmianyProfil.awatarBlob : localStorage.getItem('awatar'))}>
								{ zmianyProfil.awatarBlob && <FaRedoAlt className="group-hover:text-[goldenrod] group-hover:hover:text-[crimson] absolute right-0 bottom-0 w-10 h-10 cursor-pointer p-2.5 text-[#eee] transition-colors duration-300" onClick={() => {setZmianyProfil({...zmianyProfil, awatarPlik: null, plikNazwa: null, awatarBlob: null}); document.getElementById("uploadImage").value = "";}} /> }
								</div>
								<div>
									<label htmlFor="uploadImage" style={{cursor: "pointer"}} className={zmianyProfil.plikNazwa ? "text-center text-white mt-3.5 w-full block p-2.5 rounded-[10px] text-[0.9rem] cursor-pointer font-bold transition-all duration-300 bg-[#066c06] hover:tracking-[1px]" : "text-center text-white mt-3.5 w-full block p-2.5 rounded-[10px] text-[0.9rem] cursor-pointer font-bold transition-all duration-300 bg-[goldenrod] hover:tracking-[1px]"} >{zmianyProfil.plikNazwa ? "Wybrano zdjęcie..." : "Nowe zdjęcie?"}</label>
									<input type="file" id="uploadImage" onChange={(e) => { 
										setZmianyProfil({...zmianyProfil, plikNazwa: e.target.value, awatarPlik: e.target.files[0],awatarBlob: URL.createObjectURL(e.target.files[0])});
									}} accept="image/png, image/jpeg" hidden={true}/>
								</div>
							</div>
							<div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>E-mail</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300"
									type="email" placeholder="Wymagany email" value={zmianyProfil.email} onChange={(e) => setZmianyProfil({...zmianyProfil, email: e.target.value})} required/>
								</div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>Nowe hasło</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="password" placeholder="Opcjonalne" onChange={(e) => setZmianyProfil({...zmianyProfil, noweHaslo1: e.target.value})}/>
								</div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>Powtórz hasło</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="password" placeholder="Opcjonalne" onChange={(e) => setZmianyProfil({...zmianyProfil, noweHaslo2: e.target.value})}/>
								</div>
							</div>
							<div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>TruckersMP</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="url" placeholder="Wymagany link" value={zmianyProfil.truckersmp} onChange={(e) => setZmianyProfil({...zmianyProfil, truckersmp: e.target.value})} required/>
								</div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>TruckBook</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="url" placeholder="Wymagany link" value={zmianyProfil.truckbook} onChange={(e) => setZmianyProfil({...zmianyProfil, truckbook: e.target.value})} required/>
								</div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>World of Trucks</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="url" placeholder="Wymagany link" value={zmianyProfil.worldoftrucks} onChange={(e) => setZmianyProfil({...zmianyProfil, worldoftrucks: e.target.value})} required/>
								</div>
							</div>
							<div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>Steam</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="url" placeholder="Wymagany link" value={zmianyProfil.steam} onChange={(e) => setZmianyProfil({...zmianyProfil, steam: e.target.value})} required/>
								</div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>Główny garaż</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="text" placeholder="Lokalizacja" value={zmianyProfil.garaz} onChange={(e) => setZmianyProfil({...zmianyProfil, garaz: e.target.value})}/>
								</div>
								<div className="py-2.5 px-5 rounded-2xl text-[#eee] font-bold text-[1.1rem] flex flex-col text-shadow-[1px_1px_3px_#000] leading-none">
									<label>Ulubiony truck</label>
									<input className="text-zinc-800 font-medium invalid:placeholder:text-white invalid:border-[crimson] invalid:bg-[#e98888] invalid:text-white bg-zinc-100 text-shadow-[1px_1px_3px_#444] border-2 border-transparent p-2.5 outline-0 mt-2.5 text-[0.9rem] w-fit shadow-[0_0_20px_3px_#000] rounded-[5px] transition-all duration-300" type="text" placeholder="Marka + Model" value={zmianyProfil.truck} onChange={(e) => setZmianyProfil({...zmianyProfil, truck: e.target.value})}/>
								</div>
							</div>
							{ zmianyProfil.blad && <p>{zmianyProfil.bladTekst}</p>}
						</div>
						<div className="flex justify-end mt-5">
							<button
							className="hover:text-[#eee] hover:tracking-[1px] p-2.5 outline-0 border-transparent cursor-pointer mx-3.5 flex items-center transition-all duration-300 bg-[crimson] text-[#181818]"
							onClick={() => {
								setEdycjaProfilu(!edycjaProfilu);
								setZmianyProfil({response: null});
							}}>
								<FaUserTimes className="text-[1.1rem] w-7.5 pr-2 border-r" />
								<p className="ml-2.5 font-bold text-[0.8rem] leading-none">Anuluj</p>
							</button>
							<button
							className="hover:text-[#eee] hover:tracking-[1px] p-2.5 outline-0 border-transparent cursor-pointer mx-3.5 flex items-center transition-all duration-300 bg-[orangered] text-[#181818]"
							onClick={() => {
								setZmianyProfil({response: null});
							}}>
								<FaUserClock className="text-[1.1rem] w-7.5 pr-2 border-r" />
								<p className="ml-2.5 font-bold text-[0.8rem] leading-none">Odśwież</p>
							</button>
							<button
							className="hover:text-[#eee] hover:tracking-[1px] p-2.5 outline-0 border-transparent cursor-pointer mx-3.5 flex items-center transition-all duration-300 bg-[#066c06] text-[#181818]"
							onClick={() => { zaktualizujProfil() }}>
								<FaUserCheck className="text-[1.1rem] w-7.5 pr-2 border-r" />
								<p className="ml-2.5 font-bold text-[0.8rem] leading-none">Zatwierdź</p>
							</button>
						</div>
						</>
						: getDaneEdycja()
						}
					</div>
				</>
				}
			</div>
			{ komunikat && 
			<div className="flex z-50 fixed self-center p-7.5 bg-[#0c0c0c] text-white text-[1.2rem] font-bold flex-col shadow-[0_0_20px_3px_#111] wejscieSmooth">
				Czy napewno chcesz usunąć ten komentarz?
				<div className="flex justify-around mt-5">
					<a className="text-[#2f2]" onClick={() => usunKomentarz(komunikat, true)}>Tak</a>
					<a className="text-[crimson]" onClick={() => setKomunikat(null)}>Nie</a>
				</div>
			</div>
			}
			{ pokazPolskie &&
			<div className="z-4 fixed flex w-full h-dvh pl-15 justify-center items-center">
				<div className="fixed cursor-pointer left-0 right-0 top-0 bottom-0 bg-[#000000c4] wejscieSmooth" onClick={() => setPokazPolskie(false) }/>
				{ !szkoleniaETS.response && dostanSzkoleniaETS() }
				{ !licencjeETS.response && dostanLicencjeETS() }
				{ (szkoleniaETS.response && licencjeETS.response) ?
				<div className="z-5 border-2 border-[#ff7d7d] bg-center bg-no-repeat w-216.25 h-136.25 rounded-[30px] p-2.5 relative pokazSmooth" style={obejscieTlo("/img/prawkoPLtyl.jpg")}>
				<table className="leading-[1.3] text-shadow-[1px_1px_10px_#222] border-hidden border-collapse absolute left-63.75 top-16.25 width-[calc(100%_-_280px)] m-0">
					<tbody className="[&_>tr>td]:p-1.75
					[&_>tr>td]:text-left
					[&_>tr>td]:bg-transparent
					[&_>tr>td]:text-black
					[&_>tr>td]:text-[1rem]
					[&_>tr>td]:border
					[&_>tr>td]:border-black
					[&>tr>td]:font-medium

					[&_>tr>th]:p-1.75
					[&_>tr>th]:text-left
					[&_>tr>th]:bg-transparent
					[&_>tr>th]:text-black
					[&_>tr>th]:text-[1rem]
					[&_>tr>th]:border
					[&_>tr>th]:border-black
					[&>tr>th]:font-semibold">
						<tr><th></th><th>Ważność Licencji</th><th>Ważność Szkolenia</th></tr>
						<tr>
							<th className="">Firanka/Furgon/Izoterma</th>
							<td>{formatujWaznosc(licencjeETS.fir )}</td>
							<td>{formatujWaznosc(szkoleniaETS.fir)}</td>
						</tr>
						<tr><th>Chłodnia</th>
							<td>{formatujWaznosc(licencjeETS.chlo)}</td>
							<td>{formatujWaznosc(szkoleniaETS.chlo)}</td>
						</tr>
						<tr><th>Podkontenerowa</th>
							<td>{formatujWaznosc(licencjeETS.podk)}</td>
							<td>{formatujWaznosc(szkoleniaETS.podk)}</td>
						</tr>
						<tr>
							<th>Platforma</th>
							<td>{formatujWaznosc(licencjeETS.plat)}</td>
							<td>{formatujWaznosc(szkoleniaETS.plat)}</td>
						</tr>
						<tr>
							<th>Niskopodwoziowa<br />Niskopodłogowa</th>
							<td>{formatujWaznosc(licencjeETS.niskpodw)}</td>
							<td>{formatujWaznosc(szkoleniaETS.niskpodw)}</td>
						</tr>
						{/* <tr>
							<th>Niskopodwoziowa</th>
							<td>{formatujWaznosc(licencjeETS.niskpodw)}</td>
							<td>{formatujWaznosc(szkoleniaETS.niskpodw)}</td>
						</tr> */}
						<tr>
							<th>Cysterna/Cement</th>
							<td>{formatujWaznosc(licencjeETS.cys)}</td>
							<td>{formatujWaznosc(szkoleniaETS.cys)}</td>
						</tr>
						<tr>
							<th>Wywrotka</th>
							<td>{formatujWaznosc(licencjeETS.wywr)}</td>
							<td>{formatujWaznosc(szkoleniaETS.wywr)}</td>
						</tr>
						<tr>
							<th>Do przewozu bydła</th>
							<td>{formatujWaznosc(licencjeETS.bydl)}</td>
							<td>{formatujWaznosc(szkoleniaETS.bydl)}</td>
						</tr>
						<tr>
							<th>Lora</th>
							<td>{formatujWaznosc(licencjeETS.lora)}</td>
							<td>{formatujWaznosc(szkoleniaETS.lora)}</td>
						</tr>
						<tr>
							<th>Kłonicowa</th>
							<td>{formatujWaznosc(licencjeETS.klo)}</td>
							<td>{formatujWaznosc(szkoleniaETS.klo)}</td>
						</tr>
					</tbody>
				</table>
				<div className="absolute left-5 top-47.5 text-black text-shadow-[1px_1px_10px_#222]">
				<b title={`Szkolenie: ${new Date(szkoleniaETS.katCE).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Kat C+E: </b><br />{formatujWaznosc(licencjeETS.katCE, szkoleniaETS.katCE)}
					<br />
					<b title={`Szkolenie: ${new Date(szkoleniaETS.adr).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>ADR: </b><br />{ formatujWaznosc(licencjeETS.adr, szkoleniaETS.adr)}
					<br />
					<b title={`Szkolenie: ${new Date(szkoleniaETS.gab).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Gabaryty: </b> <br />{ formatujWaznosc(licencjeETS.gab, szkoleniaETS.gab) }
					<br />
					<b title={`Szkolenie: ${new Date(szkoleniaETS.dlug).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Długie zestawy: </b> <br />{formatujWaznosc(licencjeETS.dlug, szkoleniaETS.dlug)}
				</div>
				<div className="absolute left-13.75 bottom-7.5 w-30 h-30 bg-contain bg-no-repeat bg-center" style={obejscieTlo("/img/logoglowna.png")}/>
				</div>
				: <span>Ładuję dane...</span>
				}
			</div>
			}
			{ pokazAmerykanskie && 
			<div className="z-4 fixed flex w-full h-dvh pl-15 justify-center items-center">
				<div className="fixed cursor-pointer left-0 right-0 top-0 bottom-0 bg-[#000000c4] wejscieSmooth" onClick={() => setPokazAmerykanskie(false) }/>
				{ !szkoleniaATS.response ? dostanSzkoleniaATS() : (!licencjeATS.response ? dostanLicencjeATS() : (!szkoleniaETS.response ? dostanSzkoleniaETS() : (!licencjeETS.response && dostanLicencjeETS())))}
				{ (szkoleniaETS.response && licencjeETS.response && szkoleniaATS.response && licencjeATS.response) ?
				<div className="z-5 border-2 border-[#bdfcff] bg-center bg-no-repeat w-216.25 h-136.25 rounded-[30px] p-2.5 relative pokazSmooth" style={obejscieTlo("/img/usaTyl.png")}>
				<table className="leading-[1.3] text-shadow-[1px_1px_10px_#222] border-hidden border-collapse absolute left-10 top-27.5 width-[calc(100%_-_280px)] m-0">
					<tbody className="[&_>tr>td]:p-1.75
					[&_>tr>td]:text-left
					[&_>tr>td]:bg-transparent
					[&_>tr>td]:text-black
					[&_>tr>td]:text-[1rem]
					[&_>tr>td]:border
					[&_>tr>td]:border-black
					[&>tr>td]:font-medium

					[&_>tr>th]:p-1.75
					[&_>tr>th]:text-left
					[&_>tr>th]:bg-transparent
					[&_>tr>th]:text-black
					[&_>tr>th]:text-[1rem]
					[&_>tr>th]:border
					[&_>tr>th]:border-black
					[&>tr>th]:font-semibold">
						<tr><th></th><th>Ważność Licencji</th><th>Ważność Szkolenia</th></tr>
						<tr>
							<th>Plandeka/Izoterma</th>
							<td>{formatujWaznosc(licencjeATS.izo )}</td>
							<td>{formatujWaznosc(szkoleniaATS.izo)}</td>
						</tr>
						<tr><th>Chłodnia</th>
							<td>{formatujWaznosc(licencjeATS.chlo)}</td>
							<td>{formatujWaznosc(szkoleniaATS.chlo)}</td>
						</tr>
						<tr><th>Podkontenerowa</th>
							<td>{formatujWaznosc(licencjeATS.podk)}</td>
							<td>{formatujWaznosc(szkoleniaATS.podk)}</td>
						</tr>
						<tr>
							<th>Platforma</th>
							<td>{formatujWaznosc(licencjeATS.plat)}</td>
							<td>{formatujWaznosc(szkoleniaATS.plat)}</td>
						</tr>
						<tr>
							<th>Niskopodwoziowa</th>
							<td>{formatujWaznosc(licencjeATS.niskpodl)}</td>
							<td>{formatujWaznosc(szkoleniaATS.niskpodl)}</td>
						</tr>
						<tr>
							<th>Cysterna</th>
							<td>{formatujWaznosc(licencjeATS.cys)}</td>
							<td>{formatujWaznosc(szkoleniaATS.cys)}</td>
						</tr>
						<tr>
							<th>Wywrotka</th>
							<td>{formatujWaznosc(licencjeATS.wywr)}</td>
							<td>{formatujWaznosc(szkoleniaATS.wywr)}</td>
						</tr>
						<tr>
							<th>Do przewozu bydła</th>
							<td>{formatujWaznosc(licencjeATS.bydl)}</td>
							<td>{formatujWaznosc(szkoleniaATS.bydl)}</td>
						</tr>
						<tr>
							<th>Lora</th>
							<td>{formatujWaznosc(licencjeATS.lora)}</td>
							<td>{formatujWaznosc(szkoleniaATS.lora)}</td>
						</tr>
						<tr>
							<th>Kłonicowa</th>
							<td>{formatujWaznosc(licencjeATS.klo)}</td>
							<td>{formatujWaznosc(szkoleniaATS.klo)}</td>
						</tr>
					</tbody>
				</table>
				<div className="absolute right-17.5 top-30 text-black text-shadow-[1px_1px_10px_#222] leading-[1.2]">
					<b title={`Szkolenie: ${new Date(szkoleniaETS.katCE).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Kat C+E: </b><br/>{formatujWaznosc(licencjeETS.katCE, szkoleniaETS.katCE)}
					<br /><br/>
					<b title={`Szkolenie: ${ new Date(szkoleniaETS.adr).toLocaleString('pl-PL', {
						day: "numeric",
						month: "long",
						year: "numeric"
					})}`}>ADR: </b><br />{ formatujWaznosc(licencjeETS.adr, szkoleniaETS.adr)}
					<br /><br/>
					<b title={`Szkolenie: ${new Date(szkoleniaETS.gab).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Gabaryty:<br /></b> { formatujWaznosc(licencjeETS.gab, szkoleniaETS.gab) }
					<br /><br/>
					<b title={`Szkolenie: ${new Date(szkoleniaETS.dlug).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Długie zestawy:<br /></b> {formatujWaznosc(licencjeETS.dlug, szkoleniaETS.dlug)}
				</div>
				<div className="absolute right-11.25 bottom-11.25 w-30 h-30 bg-contain bg-no-repeat bg-center" style={obejscieTlo("/img/logoglowna.png")}/>
				</div>
				: <span>Ładuję dane...</span>
				}
			</div>
			}
			{ pokazKartePaliwowa && 
			<div className="z-4 fixed flex w-full h-dvh pl-15 justify-center items-center">
				<div className="fixed cursor-pointer left-0 right-0 top-0 bottom-0 bg-[#000000c4] wejscieSmooth" onClick={() => setPokazKartePaliwowa(false) }/>
				<div className="z-5 border-2 border-[#001f74] bg-center bg-no-repeat w-210 h-132.5 rounded-[30px] p-2.5 relative shadow-[0_0_40px_15px_#000] pokazSmooth" style={obejscieTlo("/img/kartaPaliwowa.png")}>
					<div className="absolute right-8.75 top-8.75 w-35 h-35 bg-contain bg-no-repeat bg-center" style={obejscieTlo("/img/logoglowna.png")}/>
					<div className="absolute left-6.25 top-6.25 font-bold text-[#ffe000] text-[2.5rem] tracking-[3px] p-[0_10px_15px_20px] w-152.5 italic border-b-4 border-[crimson]">Karta Paliwowa</div>
					<div className="absolute tracking-[0.5px] bottom-7.5 left-7.5 text-[1.7rem] text-[#ddd] font-semibold leading-[0.65]">The Boss Spedition<br/>{daneProfilu.discord && <span className="ml-1.25 text-[0.65rem]">ID {daneProfilu.discord }</span>}</div>
					<div className="absolute left-10 top-27.5 font-medium leading-[1.8] text-[1.5rem] italic text-[#13c5b4] tracking-[1px]">
						Wydatki paliwowe: <b className="text-white">{(daneKartaPaliwowa.wydane !== undefined) ? (daneKartaPaliwowa.wydane ? daneKartaPaliwowa.wydane : 0).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) : "??? zł"}</b>
						<br />
						Średnie spalanie: <b className="text-white">{(daneKartaPaliwowa.spalanie !== undefined) ? ((daneKartaPaliwowa.spalanie == "NaN") ? "00.0" : daneKartaPaliwowa.spalanie) : "??"} L / 100 km</b>
						<br />
						Przejechane KM: <b className="text-white">{(daneKartaPaliwowa.przejechane !== undefined) ? (daneKartaPaliwowa.przejechane ? daneKartaPaliwowa.przejechane : 0) : "??"} km</b>
						<br />
						Oddanych tras: <b className="text-white">{(daneKartaPaliwowa.trasy !== undefined) ? (daneKartaPaliwowa.trasy ? daneKartaPaliwowa.trasy : 0) : "??"}</b>
						<br />
						Posiadacz: <b className="text-white">{daneProfilu.login}</b>
					</div>
					<span className="absolute right-2.5 bottom-50.75 text-[#111] font-bold w-55 text-center italic text-[1.5rem]">{ (telemetriaPaliwo.punkty !== undefined) ? telemetriaPaliwo.punkty : "??"} pkt</span>
					{ !daneKartaPaliwowa.response && dostanDaneKartaPaliwowa() }
					{ !telemetriaPaliwo.response && dostanTelemetriaPaliwo() }
				</div>
			</div>
			}
        </div>
		{ (!daneProfilu.prevLink || (daneProfilu.prevLink !== window.location.href)) && sprawdzLogin() }
    </>
    );
}