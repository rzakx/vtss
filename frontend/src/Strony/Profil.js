import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
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
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { FaUserCheck, FaUserTimes,FaUserClock, FaRedoAlt, FaPencilAlt, FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
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
		login: null, stanKonta: null, ranga: null, awatar: null, stawka: null
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
	const [ szkoleniaETS, setSzkoleniaETS ] = useState({response: null});
	const [ licencjeETS, setLicencjeETS ] = useState({response: null});
	const [ szkoleniaATS, setSzkoleniaATS ] = useState({response: null});
	const [ licencjeATS, setLicencjeATS ] = useState({response: null});
	const [ winiety, setWiniety ] = useState({response: null, dane: null, wysuniete: false});
	const [ urlop, setUrlop ] = useState({response: false, dane: null});

    const getDane = (dane) =>{
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
				<div className="wysuwanieKomentarzy" onClick={() => {setKomentarze({...komentarze, wysuniete: !komentarze.wysuniete}); setKomunikat(null); setWiniety({...winiety, wysuniete: false}); }}>Notatki {komentarze.wysuniete ? <FaArrowAltCircleDown style={{color: 'crimson'}} /> : <FaArrowAltCircleUp />}</div>
				{ komentarze.wysuniete ?
				<div className={komunikat ? "komentarzeProfilHolder wejscieSmooth zabluruj" : "komentarzeProfilHolder wejscieSmooth"}>
					{ komunikat && <div className="overlay"/>}
					<div className="komentarzeProfil wejscieSmooth">
					{komentarze.dane ? komentarze.dane.map((komentarz) => {
						const kiedy = new Date(komentarz.kiedy);
						return(
							<div className="komentarzProfil" key={"komentarz_"+komentarz.idnotatki}>
								{ (localStorage.typkonta < 3) && <a className="usunKomentarz wejscieSmooth" onClick={() => { usunKomentarz(komentarz.idnotatki, false)}}>Usuń</a>}
								<div className="komentarzNaglowek">
									<a className="komentarzKto" href={"/profil/"+komentarz.kto}>{komentarz.kto}</a>
									<p>{kiedy.toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
								</div>
								<div className="komentarzTresc">{komentarz.tresc}</div>
							</div>
						)
					}) : <p style={{color: 'goldenrod', textShadow: '1px 1px 3px #111', fontWeight: 'bold'}}>Użytkownik {daneProfilu.login} nie posiada na dany moment żadnych notatek!</p>}
					</div>
					<div className="napiszKomentarz wejscieSmooth">
						<textarea type="text" id="dodawanyKomentarz" placeholder="Dodaj nową notatkę..." onChange={(e) => {setDodawanyKomentarz(e.target.value)}} required/>
						<input type="submit" value="Dodaj" onClick={(e) => {
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
			<div className="wysuwanieWiniet" onClick={() => {setWiniety({...winiety, wysuniete: !winiety.wysuniete}); setKomentarze({...komentarze, wysuniete: false}); }}>Winiety {winiety.wysuniete ? <FaArrowAltCircleDown style={{color: 'crimson'}} /> : <FaArrowAltCircleUp />}</div>
			{daneProfilu.login == localStorage.getItem("login") ?
				<Link to={"../winiety"}
					className={winiety.wysuniete ? "odnosnikWiniety" : "odnosnikWiniety odnosnikWinietySchowane"}
				>Zakup <RiShoppingBasket2Fill /></Link>
			: 
			(localStorage.getItem('typkonta') ?
				((parseInt(localStorage.getItem('typkonta')) <= 3 ) ) ?
				<Link to={"../winiety/"+daneProfilu.login}
					className={winiety.wysuniete ? "odnosnikWiniety" : "odnosnikWiniety odnosnikWinietySchowane"}
				>Nadaj <RiShoppingBasket2Fill /></Link>
				: ""
			: "")}
			{ winiety.wysuniete ?
				<div className="winietyProfilHolder wejscieSmooth">
					<div className="winietyProfil wejscieSmooth">
					{winiety.dane ? winiety.dane.map((winieta) => {
						const kiedy = new Date(winieta.termin);
						return(
							<div className="winietaProfil" key={"winieta_"+winieta.idwiniety}>
								<img src={"/img/flagi/"+winieta.flaga+".png"} />
								<div className="winietaDane">
									<span>{winieta.kraj}</span>
									<p>{kiedy.toLocaleString('pl-PL', {day: 'numeric', month: '2-digit', year: 'numeric'})}</p>
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
					<div className="profilUrlop">
						<div>
							<span>Jesteś na urlopie od <b>{new Date(daneUrlop.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneUrlop.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>.</span>
							<br />
							<span>Możesz zakończyć swój Urlop wcześniej klikając w następujący przycisk.</span>
						</div>
						<button onClick={() => zakonczUrlop(daneUrlop.idwniosku) }>Zakończ urlop</button>
					</div>
				);
			} else {
				return(
					<div className="profilUrlop">
						<div>
							<span>Masz zaplanowany Urlop od <b>{new Date(daneUrlop.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneUrlop.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>.</span>
							<br />
							<span>Możesz anulować swój Urlop klikając w następujący przycisk.</span>
						</div>
						<button onClick={() => zakonczUrlop(daneUrlop.idwniosku) }>Anuluj urlop</button>
					</div>
				);
			}
		} else {
			if(trwaAktualnie){
				return(
					<div className="profilUrlop">
						<span>Kierowca jest na urlopie od <b>{new Date(daneUrlop.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneUrlop.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>.</span>
					</div>
				);
			} else {
				return(
					<div className="profilUrlop">
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

    return(
        <>
        <Nawigacja />
        <div className="tlo" />
        <div className="srodekekranu">
			{ !blad &&
			<div className="profilWysuwalne">
                <div className="profilKarta polskiePrawko" title="Polskie prawo jazdy" style={{backgroundImage: `url("/img/prawkoPLprzod.png")`}} onClick={() => setPokazPolskie(true)}></div>
				<div className="profilKarta amerykanskiePrawko" style={{backgroundImage: `url("/img/prawkoUSAprzod.png")`}} onClick={() => setPokazAmerykanskie(true)}></div>
				<div className="profilKarta kartaPaliwowa" title="Karta paliwowa" style={{backgroundImage: `url("/img/kartaPaliwowa.png")`}} onClick={() => setPokazKartePaliwowa(true)}>
					<span>Karta Paliwowa</span>
				</div>
            </div>
			}
            <div className="glowna"  style={{zIndex: 2}}>
                <div className="glownaGora">
					<div className="miniProfil" style={{width: '100%'}}>
						{ blad ? 
						<div className="miniDane">
							<div />
							<div>
								<span>Nie ma takiego użytkownika!</span>
							</div>
							<div><span>Wydaje się, że zbłądziłeś!</span></div>
						</div>
						:
						<>
						<div className="glownaAwatar" style={obejscieTlo("/img/"+daneProfilu.awatar)} />
						<div className="miniDane">
							<div>
								<span>{daneProfilu.login ? daneProfilu.login : "Brak"}</span>
								<span>{daneProfilu.typkontaNazwa ? daneProfilu.typkontaNazwa : "?"}<br /><span style={{fontSize: '0.9rem'}}>{daneProfilu.stanowiskoNazwa ? daneProfilu.stanowiskoNazwa : "?"}</span></span>
							</div>
							<div>
								<span>Stan konta: { daneProfilu.stanKonta ? daneProfilu.stanKonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) : "0,00 zł"} <sup>{daneProfilu.stawka}zł/km</sup></span>
							</div>
							<div>
								<span>Dołączył { daneProfilu.datadolaczenia ? new Date(daneProfilu.datadolaczenia).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'}) : "?"}.</span>
								<span>Główny garaż w {daneProfilu.garaz ? daneProfilu.garaz : "Brak"}.</span>
								<span>Ulubiony truck to {daneProfilu.truck ? daneProfilu.truck : "Brak"}.</span>
								<br />
								<div>
									{ daneProfilu.truckersmp && <a rel="noreferrer" className="odnosnikProfil" href={`${daneProfilu.truckersmp}`} style={obejscieTlo("/img/truckersmp.png")} target="_blank"/>}
									{ daneProfilu.truckbook && <a rel="noreferrer" className="odnosnikProfil" style={obejscieTlo("/img/truckbook.png")} href={`${daneProfilu.truckbook}`} target="_blank"/>}
									{ daneProfilu.worldoftrucks && <a rel="noreferrer" className="odnosnikProfil" style={obejscieTlo("/img/worldoftrucks.png")} href={`${daneProfilu.worldoftrucks}`} target="_blank"/>}
									{ daneProfilu.steam && <a rel="noreferrer" className="odnosnikProfil" style={obejscieTlo("/img/steam.png")} href={`${daneProfilu.steam}`} target="_blank"/>}
								</div>
								{ !daneProfilu.discord && <span style={{color: 'crimson'}}>Brak połączenia z Discordem!</span> }
							</div>
						</div>
						<div className="miniWykresik">
							{ daneProfilu.login && !ktoreWykres && zaladujWykres(1) }
							{ (daneWykres.length > 1) ?
							<>
							<div style={{maxWidth: '500px', width: '100%', height: '200px'}}>
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
							<div className="ktoryWykresWybrany">
								{ daneProfilu.login && ((ktoreWykres === 1) ? <button disabled>Dystans KM</button> : <button onClick={() => {zaladujWykres(1);}}>Dystans KM</button>)}
								{ daneProfilu.login && ((ktoreWykres === 2) ? <button disabled>Spalanie</button> : <button onClick={() => { zaladujWykres(2)}}>Spalanie</button>)}
								{ daneProfilu.login && ((ktoreWykres === 3) ? <button disabled>Zarobek</button> : <button onClick={() => { zaladujWykres(3);}}>Zarobek</button>)}
								
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
				{ ((localStorage.getItem('login') === daneProfilu.login) && !komentarze.wysuniete && !winiety.wysuniete) &&
				<>
					<FaPencilAlt className="edycjaProfilBtn" onClick={() => { setEdycjaProfilu(!edycjaProfilu)}} />
					<div className={edycjaProfilu ? "edycjaProfilu edycjaProfiluWysun":"edycjaProfilu"}>
						{ zmianyProfil.response ?
						<>
						<div className="wejscieSmooth" style={{display: 'flex'}}>
							<div className="edycjaSekcjaAwatar">
								<div className="edycjaSekcjaAwatarWyswietlany wejscieSmooth" style={obejscieTlo(zmianyProfil.awatarBlob ? zmianyProfil.awatarBlob : localStorage.getItem('awatar'))}>
								{ zmianyProfil.awatarBlob && <FaRedoAlt className="awatarCofnij" onClick={() => {setZmianyProfil({...zmianyProfil, awatarPlik: null, plikNazwa: null, awatarBlob: null}); document.getElementById("uploadImage").value = "";}} /> }
								</div>
								<div className="uploadZdjecia">
									<label htmlFor="uploadImage" style={{cursor: "pointer"}} className={zmianyProfil.plikNazwa ? "uploadZdjeciaTak" : "uploadZdjeciaNie"} >{zmianyProfil.plikNazwa ? "Wybrano zdjęcie..." : "Nowe zdjęcie?"}</label>
									<input type="file" id="uploadImage" onChange={(e) => { 
										setZmianyProfil({...zmianyProfil, plikNazwa: e.target.value, awatarPlik: e.target.files[0],awatarBlob: URL.createObjectURL(e.target.files[0])});
									}} accept="image/png, image/jpeg" hidden={true}/>
								</div>
							</div>
							<div>
								<div className="edycjaForm">
									<label>E-mail</label>
									<input type="email" placeholder="Wymagany email" value={zmianyProfil.email} onChange={(e) => setZmianyProfil({...zmianyProfil, email: e.target.value})} required/>
								</div>
								<div className="edycjaForm">
									<label>Nowe hasło</label>
									<input type="password" placeholder="Opcjonalne" onChange={(e) => setZmianyProfil({...zmianyProfil, noweHaslo1: e.target.value})}/>
								</div>
								<div className="edycjaForm">
									<label>Powtórz hasło</label>
									<input type="password" placeholder="Opcjonalne" onChange={(e) => setZmianyProfil({...zmianyProfil, noweHaslo2: e.target.value})}/>
								</div>
							</div>
							<div>
								<div className="edycjaForm">
									<label>TruckersMP</label>
									<input type="url" placeholder="Wymagany link" value={zmianyProfil.truckersmp} onChange={(e) => setZmianyProfil({...zmianyProfil, truckersmp: e.target.value})} required/>
								</div>
								<div className="edycjaForm">
									<label>TruckBook</label>
									<input type="url" placeholder="Wymagany link" value={zmianyProfil.truckbook} onChange={(e) => setZmianyProfil({...zmianyProfil, truckbook: e.target.value})} required/>
								</div>
								<div className="edycjaForm">
									<label>World of Trucks</label>
									<input type="url" placeholder="Wymagany link" value={zmianyProfil.worldoftrucks} onChange={(e) => setZmianyProfil({...zmianyProfil, worldoftrucks: e.target.value})} required/>
								</div>
							</div>
							<div>
								<div className="edycjaForm">
									<label>Steam</label>
									<input type="url" placeholder="Wymagany link" value={zmianyProfil.steam} onChange={(e) => setZmianyProfil({...zmianyProfil, steam: e.target.value})} required/>
								</div>
								<div className="edycjaForm">
									<label>Główny garaż</label>
									<input type="text" placeholder="Lokalizacja" value={zmianyProfil.garaz} onChange={(e) => setZmianyProfil({...zmianyProfil, garaz: e.target.value})}/>
								</div>
								<div className="edycjaForm">
									<label>Ulubiony truck</label>
									<input type="text" placeholder="Marka + Model" value={zmianyProfil.truck} onChange={(e) => setZmianyProfil({...zmianyProfil, truck: e.target.value})}/>
								</div>
							</div>
							{ zmianyProfil.blad && <p>{zmianyProfil.bladTekst}</p>}
						</div>
						<div className="edycjaWybor">
							<button onClick={() => {
								setEdycjaProfilu(!edycjaProfilu);
								setZmianyProfil({response: null});
							}}>
								<FaUserTimes />
								<p>Anuluj</p>
							</button>
							<button onClick={() => {
								setZmianyProfil({response: null});
							}}>
								<FaUserClock />
								<p>Odśwież</p>
							</button>
							<button onClick={() => { zaktualizujProfil() }}>
								<FaUserCheck />
								<p>Zatwierdź</p>
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
			<div className="komunikat wejscieSmooth">
				Czy napewno chcesz usunąć ten komentarz?
				<div>
					<a onClick={() => usunKomentarz(komunikat, true)}>Tak</a>
					<a onClick={() => setKomunikat(null)}>Nie</a>
				</div>
			</div>
			}
			{ pokazPolskie && 
			<div className="licencja">
				<div className="licencjaTlo wejscieSmooth" onClick={() => setPokazPolskie(false) }/>
				{ !szkoleniaETS.response && dostanSzkoleniaETS() }
				{ !licencjeETS.response && dostanLicencjeETS() }
				{ (szkoleniaETS.response && licencjeETS.response) ?
				<div className="polskiePrawkoTyl pokazSmooth" style={obejscieTlo("/img/prawkoPLtyl.jpg")}>
				<table className="prawko-uprawnienia">
					<tbody>
						<tr><th></th><th>Ważność Licencji</th><th>Ważność Szkolenia</th></tr>
						<tr>
							<th>Firanka/Furgon/Izoterma</th>
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
							<th>Niskopodłogowa</th>
							<td>{formatujWaznosc(licencjeETS.niskpodl)}</td>
							<td>{formatujWaznosc(szkoleniaETS.niskpodl)}</td>
						</tr>
						<tr>
							<th>Niskopodwoziowa</th>
							<td>{formatujWaznosc(licencjeETS.niskpodw)}</td>
							<td>{formatujWaznosc(szkoleniaETS.niskpodw)}</td>
						</tr>
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
				<div className="katCE">
				<b title={`Szkolenie: ${new Date(szkoleniaETS.katCE).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Kat C+E: </b>{formatujWaznosc(licencjeETS.katCE, szkoleniaETS.katCE)}
					<br /><br/>
					<b title={`Szkolenie: ${new Date(szkoleniaETS.adr).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>ADR: </b>{ formatujWaznosc(licencjeETS.adr, szkoleniaETS.adr)}
					<br /><br/>
					<b title={`Szkolenie: ${new Date(szkoleniaETS.gab).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Gabaryty: </b> { formatujWaznosc(licencjeETS.gab, szkoleniaETS.gab) }
					<br /><br/>
					<b title={`Szkolenie: ${new Date(szkoleniaETS.dlug).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}`}>Długie zestawy: </b> {formatujWaznosc(licencjeETS.dlug, szkoleniaETS.dlug)}
				</div>
				<div className="prawkoPLLogo" style={obejscieTlo("/img/logoglowna.png")}/>
				</div>
				: <span>Ładuję dane...</span>
				}
			</div>
			}
			{ pokazAmerykanskie && 
			<div className="licencja">
				<div className="licencjaTlo wejscieSmooth" onClick={() => setPokazAmerykanskie(false) }/>
				{ !szkoleniaATS.response ? dostanSzkoleniaATS() : (!licencjeATS.response ? dostanLicencjeATS() : (!szkoleniaETS.response ? dostanSzkoleniaETS() : (!licencjeETS.response && dostanLicencjeETS())))}
				{ (szkoleniaETS.response && licencjeETS.response && szkoleniaATS.response && licencjeATS.response) ?
				<div className="amerykanskiePrawkoTyl pokazSmooth" style={obejscieTlo("/img/usaTyl.png")}>
				<table className="prawko-uprawnieniaUSA">
					<tbody>
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
				<div className="katCEUSA">
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
				<div className="prawkoUSALogo" style={obejscieTlo("/img/logoglowna.png")}/>
				</div>
				: <span>Ładuję dane...</span>
				}
			</div>
			}
			{ pokazKartePaliwowa && 
			<div className="licencja">
				<div className="licencjaTlo wejscieSmooth" onClick={() => setPokazKartePaliwowa(false) }/>
				<div className="kartaPaliwowaTyl pokazSmooth" style={obejscieTlo("/img/kartaPaliwowa.png")}>
					<div className="kartaPaliwowaLogo" style={obejscieTlo("/img/logoglowna.png")}/>
					<div className="kartaPaliwowaTytul">Karta Paliwowa</div>
					<div className="kartaPaliwowaFirma">The Boss Spedition<br/>{daneProfilu.discord && <span>ID {daneProfilu.discord }</span>}</div>
					<div className="kartaPaliwowaKogo">
						Wydatki paliwowe: <b>{(daneKartaPaliwowa.wydane !== undefined) ? (daneKartaPaliwowa.wydane ? daneKartaPaliwowa.wydane : 0).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) : "??? zł"}</b>
						<br />
						Średnie spalanie: <b>{(daneKartaPaliwowa.spalanie !== undefined) ? ((daneKartaPaliwowa.spalanie == "NaN") ? "00.0" : daneKartaPaliwowa.spalanie) : "??"} L / 100 km</b>
						<br />
						Przejechane KM: <b>{(daneKartaPaliwowa.przejechane !== undefined) ? (daneKartaPaliwowa.przejechane ? daneKartaPaliwowa.przejechane : 0) : "??"} km</b>
						<br />
						Oddanych tras: <b>{(daneKartaPaliwowa.trasy !== undefined) ? (daneKartaPaliwowa.trasy ? daneKartaPaliwowa.trasy : 0) : "??"}</b>
						<br />
						Posiadacz: <b>{daneProfilu.login}</b>
					</div>
					<span className="kartaPaliwowaPunkty">{ (daneKartaPaliwowa.punkty !== undefined) ? daneKartaPaliwowa.punkty : "??"} pkt</span>
					{ !daneKartaPaliwowa.response && dostanDaneKartaPaliwowa() }
				</div>
			</div>
			}
        </div>
		{ (!daneProfilu.prevLink || (daneProfilu.prevLink !== window.location.href)) && sprawdzLogin() }
    </>
    );
}