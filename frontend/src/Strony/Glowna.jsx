import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";

export default function Glowna() {
	const [checkData, setCheckData] = useState(0);
	const [wersjeGry, setWersjeGry ] = useState({'resp': 0, 'tmp': 0, 'ets': 0, 'ats': 0});
	const [stanKonta, setStanKonta] = useState(null);
	const [topka, setTopka] = useState({response: 0, top1: null, top2: null, top3: null});
	const [ownStats, setOwnStats] = useState({'response': 0, 'ladunkow': 0, "przejechanekm": 0, "tony": 0, "spalanie": 0});
	const [mainInfo, setMainInfo] = useState({'response': 0, 'limit_km': 0, 'informacja': null});
	const [globalStats, setGlobalStats] = useState({'response': 0, 'ladunkow': 0, "przejechanekm": 0, "pracownikow": 0, "spalanie": 0});
	document.title = "Główna - The Boss Spedition";
	const poprzedniMiesiac = new Date();
	const tenMiesiac = poprzedniMiesiac.toLocaleString('default', {month: 'long'});
	poprzedniMiesiac.setMonth(poprzedniMiesiac.getMonth()-1);
	const poprzedniMiesiacNazwa = poprzedniMiesiac.toLocaleString('default', {month: 'long'}).toUpperCase();
	const [ kontoFirmowe, setKontoFirmowe ] = useState({response: false, suma: 0});

	const dostanStanFirmy = () => {
        Axios.post(gb.backendIP+"kontofirmowestan").then((r) => {
            if(r.data['blad']){
                console.log(r.data['blad']);
                setKontoFirmowe({response: true, suma: 0});
            } else {
                setKontoFirmowe({response: true, suma: r.data['odp']});
            }
        }).catch((er) => {
            console.log(er);
            setKontoFirmowe({response: true, suma: 0});
        });
    };

	const askForVersions = () => {
		Axios.get(gb.backendIP+"wersjeGry")
		.then((res) => {
			setWersjeGry(res.data);
		}).catch((err) => {
			console.log(err.message);
		});
	};

	const fGlobalStats = () =>{
		Axios.post(gb.backendIP+"mainGlobalStats/")
		.then((res) => {
			if(!res.data['blad']){
				setGlobalStats(res.data);
			}
		})
		.catch((err) => {
			console.error(err);
		});
	};

	//dostan wlasne statystyki
	const fOwnStats = () => {
		Axios.post(gb.backendIP+"mainOwnStats/"+localStorage.getItem('token'))
		.then((res) => {
			if(!res.data['blad']){
				setOwnStats(res.data);
			}
		})
		.catch((err) => {
			console.error(err);
		});
	};

	//dostan wiadomosc i limit km
	const fGetInfo = () =>{
		Axios.post(gb.backendIP+"glownaInfo/")
		.then((res) => {
			if(!res.data['blad']){
				setMainInfo(res.data);
			}
		}).catch((err) => {
			console.error(err);
		})
	};

	//dostan stan konta
	const getStanKonta = () =>{
		let odp = 0;
		Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/wlasnyzarobek").then((res) => {
			odp += res.data['odp'];
			Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/kary").then((res2) => {
				odp -= res2.data['odp'];
				Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/upr").then((res3) => {
					odp -= res3.data['odp'];
					Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/gesty").then((res4) => {
						odp += res4.data['odp'];
						Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/winiety").then((res5) => {
							odp -= res5.data['odp'];
							setStanKonta(odp);
						});
					});
				});
			});
		});
	};

	//dostan top3
	const getTopka = () => {
		Axios.post(gb.backendIP+"lastMonthTop3").then((res) => {
			if(!res.data['blad']){
				setTopka(res.data);
			}
		}).catch((err) => {
			console.error(err);
		});
	};

	const dostanDane = () => {
		if(stanKonta === null) getStanKonta();
		if(!topka.response) getTopka();
		if(!mainInfo.response) fGetInfo();
		if(!ownStats.response) fOwnStats();
		if(!globalStats.response) fGlobalStats();
		if(!wersjeGry.resp) askForVersions();
		setCheckData(true);
	};


	return (
		<>
			<Nawigacja />
			<div className="tlo" />
			<div className="srodekekranu">
				<div className="w-full max-w-[1250px] bg-[#111] shadow-[0_0_20px_5px_#111] relative">
					<div className="flex flex-col p-5 border-b border-[crimson] bg-[#0e0e0e]">
						<h3 className="text-center mb-2.5 text-[#bdbd1a] tracking-[1px]">Ważna informacja</h3>
						<hr className="border-[darkcyan]" />
						<span className="text-center mt-5 text-[#c36c00]">{mainInfo.informacja ? mainInfo.informacja : "Witaj w systemie The Boss Spedition!"}</span>
					</div>
					<div className="h-80 px-12 py-5 flex items-center justify-between">
						<div className="flex">
							<div className="bg-cover bg-center h-[210px] w-[210px] min-w-[210px] mr-7" style={{ backgroundImage: `url(${localStorage.getItem('awatar')})` }} />
							<div className="flex flex-col justify-between grow">
								<div className="flex flex-col">
									<span className="tracking-[1px] text-[#eee] font-bold text-[1.7rem]">Cześć, {localStorage.getItem('login')}!</span>
									<span className="text-[1.3rem] text-[greenyellow] font-bold tracking-[1px] leading-[1.1]">{localStorage.getItem('typkontaNazwa')}<br /><span style={{fontSize: '0.9rem'}}>{localStorage.getItem('stanowiskoNazwa')}</span></span>
								</div>
								<div className="flex flex-col">
									<span className="text-[1.1rem] tracking-[1px] font-semibold">Stan konta: { stanKonta ? stanKonta.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"}) : "0,00 zł"}</span>
								</div>
								<div className="flex flex-col text-[0.9rem] leading-[1.4]">
									<span>Wersja TruckersMP: { wersjeGry.tmp ? wersjeGry.tmp : "Brak"}</span>
									<span>Wersja ETS2: { wersjeGry.ets ? wersjeGry.ets : "Brak"}</span>
									<span>Wersja ATS: { wersjeGry.ats ? wersjeGry.ats : "Brak" }</span>
								</div>
							</div>
						</div>
						<div className="relative w-[450px] h-[230px] bg-center bg-contain bg-no-repeat mt-[90px] text-[#ddd]" style={{ backgroundImage: `url("/img/top3.png")`}}>
							<span className="absolute text-center font-bold left-0 right-0 -top-[70px] tracking-[2px] text-[1.2rem]">TOP 3 - { poprzedniMiesiacNazwa }</span>
							{topka.top1 ? <a className="absolute text-center font-medium left-0 right-0 -top-[25px]" href={`${"/profil/"+topka.top1}`}>{topka.top1}</a> : <span className="absolute text-center font-medium left-0 right-0 -top-[25px]">Brak</span>}
							{topka.top2 ? <a className="absolute text-center font-medium left-[30px] right-[290px] top-5" href={`${"/profil/"+topka.top2}`}>{topka.top2}</a> : <span className="absolute text-center font-medium left-[30px] right-[290px] top-5">Brak</span>}
							{topka.top3 ? <a className="absolute text-center font-medium left-[290px] right-[30px] top-[35px]" href={`${"/profil/"+topka.top3}`}>{topka.top3}</a> : <span className="absolute text-center font-medium left-[290px] right-[30px] top-[35px]">Brak</span>}
						</div>
					</div>
					<div className="flex bg-[#0e0e0e] border-top-[2px_solid_#181818] pt-7 pb-12 justify-around">
						<div className="flex relative flex-col min-w-[250px] max-w-[520px] w-4/5 grow">
							<h2 className="border-b border-gray-500 grow p-4 text-[1rem] font-semibold">Twoja statystyka - miesięczna ({tenMiesiac})</h2>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-red-600"><span>Dostarczone przesyłki</span><span>{ownStats.ladunkow ? ownStats.ladunkow.toLocaleString() : "Brak"}</span></div>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-[#9c27b0]"><span>Limit</span><span>{ownStats.przejechanekm ? ownStats.przejechanekm.toLocaleString() : "0"} km / { localStorage.getItem("typkonta") == 6 ? (15000).toLocaleString("pl-PL") : ( mainInfo.limit_km ? mainInfo.limit_km.toLocaleString("pl-PL") : "???")} km</span></div>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-[#2196f3]"><span>Średnie spalanie</span><span>{ownStats.spalanie ? ownStats.spalanie.toFixed(1).toLocaleString() : "0"} l / 100 km</span></div>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-[#298800]"><span>Dostarczony tonaż</span><span>{ownStats.tony ? ownStats.tony : "Brak"}</span></div>
						</div>
						<div className="flex relative flex-col min-w-[250px] max-w-[520px] w-4/5 grow">
							<h2 className="border-b border-gray-500 grow p-4 text-[1rem] font-semibold">Statystyka firmy - całościowa</h2>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-red-600"><span>Dostarczone przesyłki</span><span>{globalStats.ladunkow ? globalStats.ladunkow.toLocaleString() : "Brak"}</span></div>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-[#9c27b0]"><span>Dystans</span><span>{globalStats.przejechanekm ? globalStats.przejechanekm.toLocaleString() : "0"} km</span></div>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-[#2196f3]"><span>Średnie spalanie</span><span>{globalStats.spalanie ? globalStats.spalanie.toFixed(1).toLocaleString() : "0"} l / 100 km</span></div>
							<div className="grow p-3.5 text-[1rem] inline-flex justify-between border-b border-[#298800]"><span>Wszystkich pracowników</span><span>{globalStats.pracownikow ? globalStats.pracownikow-1 : "0"}</span></div>
							<span className="block absolute right-[5px] top-[5px] text-right text-[0.85rem]">Konto firmowe<br/><b>{kontoFirmowe.response ? kontoFirmowe.suma.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'}) : dostanStanFirmy()}</b></span>
						</div>
					</div>
				</div>
			</div>
			{ !checkData && dostanDane() }
		</>
	);
}
