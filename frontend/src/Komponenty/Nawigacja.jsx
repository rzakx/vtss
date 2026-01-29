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
	RiArticleFill,
	RiRoadMapFill,
	RiSlideshowFill
} from "react-icons/ri";
import { FaUserGraduate } from "react-icons/fa";
import { ImGoogleDrive } from "react-icons/im";
import Axios from "axios";
import { useState } from "react";
import gb from "../GlobalVars";

export default function Nawigacja() {
	const [ sprawdzona, setSprawdzona ] = useState(false);
	const [ iloscTras, setIloscTras ] = useState(0);
	const [ doPoprawki, setDoPoprawki ] = useState({ response: false, ile: 0 });
	const [ iloscPodwyzek, setIloscPodwyzek ] = useState(0);
	const [ iloscUrlopow, setIloscUrlopow ] = useState(0);
	const [ typKonta, setTypKonta ] = useState(10);
	const [ rekrutacja, setRekrutacja ] = useState({ response: false, liczba: 0 });
	const [ szkolenia, setSzkolenia ] = useState({ response: false, liczba: 0 });

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
	};

	const oczekujaceSzkolenia = () => {
		Axios.post(gb.backendIP+"szkoleniaOczekujace/"+localStorage.getItem("token")).then((r) => {
			if(r.data['liczba']) setSzkolenia({response: true, liczba: r.data['liczba']});
			else setSzkolenia({response: true, liczba: 0});
		}).catch((er) => {
			setSzkolenia({response: true, liczba: 0});
		});
	};

	const szefMenu = () => {
		return (
			<>
				<li>
					<NavLink to="/konta">
						<RiFolderUserFill /> Menadżer kont
						{(iloscPodwyzek || iloscUrlopow) ? <div className="absolute bg-[crimson] rounded-2xl
							text-[0.8rem] w-5 h-5 leading-5 text-center
							translate-2.5 animate-[menuBlink_0.5s]">{iloscPodwyzek+iloscUrlopow}</div> : ""}
					</NavLink>
				</li>
				<li>
					<NavLink to="/statystyka">
						<RiSlideshowFill /> Statystyka
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
							{iloscTras ? <div className="absolute bg-[crimson] rounded-2xl
							text-[0.8rem] w-5 h-5 leading-5 text-center
							translate-2.5 animate-[menuBlink_0.5s]">{iloscTras}</div> : ""}
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
					<div className="absolute bg-[crimson] rounded-2xl
							text-[0.8rem] w-5 h-5 leading-5 text-center
							translate-2.5 animate-[menuBlink_0.5s]"
					>{rekrutacja.liczba}</div>
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
		<div className="bg-contain bg-center fixed z-1 top-2.5 right-2.5 w-25 h-25 bg-no-repeat" style={{backgroundImage: `url('/img/logoglowna.png')`}}/>
		<header className="fixed z-10 left-0 top-0 w-15 max-2xl:w-13.5 h-dvh bg-[#181818] text-[#bbb] transition-all duration-700 border-r border-r-[#333]
		shadow-[0_0_10px_1px_#161616] hover:w-50">
			{!sprawdzona && sprawdzSesje()}
			<nav className="w-full h-full flex flex-col justify-between overflow-hidden
			[&_li]:list-none
			[&_li]:w-50
			[&_li]:decoration-0
			[&_li]:overflow-hidden
			[&_li]:border-b
			[&_li]:border-b-[#333]
			
			[&_li_a]:flex
			[&_li_a]:items-center
			[&_li_a]:py-3.75
			max-2xl:[&_li_a]:py-3
			[&_li_a]:px-5
			[&_li_a]:relative
			[&_li_a]:w-full
			[&_li_a]:decoration-0
			[&_li_a]:overflow-hidden
			[&_li_a]:font-medium
			[&_li_a]:text-[1rem]
			max-2xl:[&_li_a]:text-sm!
			[&_li_a]:transition-all
			[&_li_a]:duration-300
			[&_li_a]:tracking-[-1px]
			[&_li_a]:text-inherit
			
			[&_button]:flex
			[&_button]:items-center
			[&_button]:py-3.75
			max-2xl:[&_button]:py-3
			[&_button]:px-5
			[&_button]:w-50
			[&_button]:bg-transparent
			[&_button]:outline-0
			[&_button]:border-0
			[&_button]:border-t
			[&_button]:border-t-[#333]
			[&_button]:decoration-0
			[&_button]:overflow-hidden
			[&_button]:font-medium
			[&_button]:text-[1rem]
			max-2xl:[&_button]:text-sm!
			[&_button]:transition-all
			[&_button]:duration-300
			[&_button]:tracking-[-1px]
			[&_button]:text-inherit
			

			[&_ul_li_a.active]:text-white

			[&_button:hover]:bg-[#161616]
			[&_button:hover]:text-[#ffe000]
			[&_button:hover]:shadow-[inset_0_0_5px_1px_#040404]
			[&_button:hover]:cursor-pointer
			[&_li_a:hover]:bg-[#161616]
			[&_li_a:hover]:text-[#ffe000]
			[&_li_a:hover]:shadow-[inset_0_0_5px_1px_#040404]
			[&_li_a:hover]:cursor-pointer

			[&_button_svg]:w-15
			max-2xl:[&_button_svg]:w-13.5
			[&_button_svg]:text-center
			[&_button_svg]:text-[1.6rem]
			[&_button_svg]:-ml-5
			[&_button_svg]:inline
			[&_li_svg]:inline
			[&_li_svg]:w-15
			max-2xl:[&_li_svg]:w-13.5
			[&_li_svg]:text-center
			[&_li_svg]:text-[1.6rem]
			[&_li_svg]:-ml-5
			max-2xl:[&_li_svg]:text-[1.4rem]

			[&_li_a:hover_svg]:text-[#ffe000]
			[&_li_a.active:hover_svg]:text-inherit
			">
				<ul className="p-0 w-full overflow-x-hidden [&::-webkit-scrollbar]:w-0.5! [&::-webkit-scrollbar-thumb]:bg-zinc-300! [&::-webkit-scrollbar-track]:bg-zinc-500! [::-webkit-scrollbar-track]:shadow-none! [&::-webkit-scrollbar-thumb]:shadow-none!">
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
							{doPoprawki.response ? (doPoprawki.ile ?
							<div className="absolute bg-[crimson] rounded-2xl
							text-[0.8rem] w-5 h-5 leading-5 text-center
							translate-2.5 animate-[menuBlink_0.5s]">{doPoprawki.ile}</div> : "") : zaladujPoprawki()}
						</NavLink>
					</li>
					{sprawdzona && typKonta < 10 && nieDlaPodwykonawcy2()}
					<li>
						<NavLink to="/urlop">
							<RiAlarmFill /> Urlop
						</NavLink>
					</li>
					<li>
						<NavLink to="/mapa">
							<RiRoadMapFill /> Nawigacja
						</NavLink>
					</li>
					<li>
						<NavLink to="/szkolenia">
							<FaUserGraduate /> Szkolenia
							{ szkolenia.response ? szkolenia.liczba ? <div className="absolute bg-[crimson] rounded-2xl
							text-[0.8rem] w-5 h-5 leading-5 text-center
							translate-2.5 animate-[menuBlink_0.5s]">{szkolenia.liczba}</div> : "" : oczekujaceSzkolenia() }
						</NavLink>
					</li>
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