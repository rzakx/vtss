import { NavLink } from "react-router-dom";
import {
	RiBarChart2Fill,
	RiLogoutBoxLine,
	RiUser3Fill,
	RiFolderUserFill,
	RiBus2Fill,
	RiSurveyFill,
	RiHome3Fill,
	RiCurrencyFill,
	RiEqualizerFill,
	RiAlertFill,
	RiBankFill,
	RiAlarmFill,
	RiSendPlaneFill,
	RiArticleFill
} from "react-icons/ri";
import { FaGlobeEurope } from "react-icons/fa";
import { ImGoogleDrive } from "react-icons/im";
import Axios from "axios";
import { useState } from "react";
import gb from "../GlobalVars";

export default function Nawigacja() {
	const [sprawdzona, setSprawdzona] = useState(false);
	const [iloscTras, setIloscTras ] = useState(0);
	const [ doPoprawki, setDoPoprawki] = useState({response: false, ile: 0});
	const [iloscPodwyzek, setIloscPodwyzek] = useState(0);
	const [iloscUrlopow, setIloscUrlopow] = useState(0);
	const [typKonta, setTypKonta] = useState(10);
	const [ rekrutacja, setRekrutacja ] = useState({response: false, liczba: 0});

	const sprawdzSesje = () => {
		console.log("Sprawdzam sesje");
		if(localStorage.getItem("token")){
			Axios.get(
				gb.backendIP+"typkonta/" + localStorage.getItem("token")
			).then((res) => {
				if(!res.data['blad']){
					setTypKonta(res.data['typkonta']);
					localStorage.setItem('typkonta', res.data['typkonta']);
					localStorage.setItem('typkontaNazwa', res.data['typkontaNazwa']);
					localStorage.setItem('stanowisko', res.data['stanowisko']);
					localStorage.setItem('stanowiskoNazwa', res.data['stanowiskoNazwa']);
					localStorage.setItem('login', res.data['login']);
					setSprawdzona(true);
				} else {
					localStorage.clear();
					window.location.replace("/zaloguj");
				}
			}).catch(() => {
				localStorage.clear();
				window.location.replace("/zaloguj");
			});
		} else {
			window.location.replace("/zaloguj");
		}
	};

	const dostanRekrutacje = () => {
		Axios.post(gb.backendIP+"rekrutacjaIlosc").then((r) => {
			if(r.data['blad']) setRekrutacja({response: true, liczba: 0});
			else setRekrutacja({response: true, liczba: r.data['liczba']});
		}).catch((er) => {
			console.log(er);
			setRekrutacja({response: true, liczba: 0});
		});
	}

	const szefMenu = () => {
		return (
			<>
				<li>
					<NavLink to="/konta">
						<RiFolderUserFill /> Menadżer kont
						{(iloscPodwyzek || iloscUrlopow) ? <div className="menu-ilosc">{iloscPodwyzek+iloscUrlopow}</div> : ""}
					</NavLink>
				</li>
				<li>
					<NavLink to="/ustawienia">
						<RiEqualizerFill /> Ustawienia
					</NavLink>
				</li>
			</>
		);
	};

	const trasunie = () => {
		Axios.get(
			gb.backendIP+"sprawdztrasy"
		).then((res) => {
			setIloscTras(res.data['ilosc']);
		}).catch(() => {
			setIloscTras("?");
		});
	};

	const podwyzki = () => {
		Axios.get(
			gb.backendIP+"sprawdzpodwyzki"
		).then((res) => {
			setIloscPodwyzek(res.data['ilosc']);
		}).catch(() => {
			setIloscPodwyzek(0);
		});
	};

	const urlopy = () => {
		Axios.get(
			gb.backendIP+"sprawdzurlopy"
		).then((res) => {
			setIloscUrlopow(res.data['ilosc']);
		}).catch(() => {
			setIloscUrlopow(0);
		});
	};

	const nieDlaPodwykonawcy1 = () => {
		return(
			<>
				<li>
					<a target="_blank" href="https://drive.google.com/drive/u/2/folders/1v2fCf_yKuLIDjRx_kYGKCu0lOezeDLC2">
						<ImGoogleDrive /> Dysk Google
					</a>
				</li>
				<li>
					<NavLink to="/profil">
						<RiUser3Fill /> Profil
					</NavLink>
				</li>
			</>
		)
	};
	const nieDlaPodwykonawcy2 = () => {
		return(
			<>
				<li>
					<NavLink to="/podwyzka">
						<RiCurrencyFill /> Podwyżka
					</NavLink>
				</li>
				<li>
					<NavLink to="/urlop">
						<RiAlarmFill /> Urlop
					</NavLink>
				</li>
			</>
		);
	};

	const incydenty = () => {
		return(
			<li>
				<NavLink to="/incydenty">
					<RiAlertFill /> Incydenty
				</NavLink>
			</li>
		);
	};

	const dyspMenu = () => {
		return (
				<>
					<li>
						<NavLink to="/dyspozytornia">
							<RiSurveyFill /> Dyspozytornia
							{iloscTras ? <div className="menu-ilosc">{iloscTras}</div> : ""}
						</NavLink>
					</li>
				</>
		);
	};

	const instruktorMenu = () => {
		return (
				<>
					<li>
						<NavLink to="/uprawnienia">
							<RiBankFill /> Uprawnienia
						</NavLink>
					</li>
				</>
		);
	};

	const nawigacja = () => {
		return(
			<li>
				<NavLink to="/mapa">
					<RiSendPlaneFill /> Nawigacja
				</NavLink>
			</li>
		);
	};

	const rekrutacjaNav = () => {
		if(!rekrutacja.response){
			dostanRekrutacje();
			return;
		}
		if(!rekrutacja.liczba) return;
		return(
			<li>
				<NavLink to="/rekrutacja">
					<RiArticleFill /> Rekrutacja
					<div className="menu-ilosc">{rekrutacja.liczba}</div>
				</NavLink>
			</li>
		)
	}

	const zaladujPoprawki = () => {
		Axios.post(gb.backendIP+"licznikTrasPopraw/"+localStorage.getItem("token")).then((r) => {
			setDoPoprawki({response: true, ile: r.data['odp']});
		}).catch((er) => {
			setDoPoprawki({response: true, ile: 0});
		});
	};

	const wyloguj = () => {
		localStorage.clear();
		sprawdzSesje();
	};

	return (
		<>
		<div className="logofirmy" style={{backgroundImage: `url('/img/logoglowna.png')`}}/>
		<header>
			{!sprawdzona && sprawdzSesje()}
			<nav>
				<ul>
					<li>
						<NavLink to="/">
							<RiHome3Fill /> Główna
						</NavLink>
					</li>
					{sprawdzona && typKonta < 10 && nieDlaPodwykonawcy1()}
					<li>
					<NavLink to="/ranking">
						<RiBarChart2Fill /> Ranking
					</NavLink>
					</li>
					<li>
						<NavLink to="/trasy">
							<RiBus2Fill /> Trasy
							{doPoprawki.response ? (doPoprawki.ile ? <div className="menu-ilosc">{doPoprawki.ile}</div> : "") : zaladujPoprawki()}
						</NavLink>
					</li>
					{sprawdzona && typKonta < 10 && nieDlaPodwykonawcy2()}
					{sprawdzona && 0 <= typKonta && typKonta <= 3 && instruktorMenu()}
					{sprawdzona && 0 <= typKonta && typKonta <= 4 && dyspMenu()}
					{sprawdzona && 0 <= typKonta && typKonta <= 4 && trasunie()}
					{sprawdzona && 0 <= typKonta && typKonta <= 1 && rekrutacjaNav() }
					{sprawdzona && 0 <= typKonta && typKonta <= 2 && szefMenu()}
					{sprawdzona && 0 <= typKonta && typKonta <= 2 && podwyzki()}
					{sprawdzona && 0 <= typKonta && typKonta <= 2 && urlopy()}
				</ul>
				<button onClick={() => wyloguj()}>
					<RiLogoutBoxLine /> Wyloguj
				</button>
			</nav>
		</header>
		</>
	);
}
