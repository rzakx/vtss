import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FaTrashAlt } from "react-icons/fa";
import Axios from "axios";
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import gb from "@/GlobalVars";
import IkonyOsiagniecia from "@/SVG/IkonyOsiagniecia";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

const Osiagniecia = ({ otwarte, setOtwarte, kierowca, toast }) => {

	const [ mozliwoscDodawania, setMozliwoscDodawania ] = useState({sprawdzone: false, uprawniony: false});
	const [ dodawaneOsiagniecie, setDodawaneOsiagniecie ] = useState({otwarte: false, nazwa: null, opis: null, ikonaPlik: null, ikonaNazwa: null, ikonaBlob: null, dodaj: false});
	const [ usuwaneOsiagniecie, setUsuwaneOsiagniecie ] = useState({dane: undefined, akcja: false});
	const [ customoweOsiagniecia, setCustomoweOsiagniecia ] = useState({sprawdzone: false, odp: []});

	const [typyOsiagniec, setTypyOsiagniec] = useState(undefined);
	const [osiagnieciaUser, setOsiagnieciaUser] = useState(undefined);
	const styl = useMemo(() => (osiagnieciaUser && typyOsiagniec) ? "" : "hidden", [osiagnieciaUser, typyOsiagniec]);

	const wczytajCustomoweOsiagniecia = async () => {
		if(!kierowca) return;
		console.log("Wczytuję customowe osiągnięcia");
		await Axios.post(gb.backendIP+"customoweOsiagniecia/"+kierowca).then((r) => {
			if(r.data['blad']){
				if(toast !== undefined) {
					toast({
						title: "Błąd wczytywania",
						variant: "destructive",
						description: "Wystąpił błąd podczas wczytywania dodatkowych osiągnięć kierowcy. Powód: "+r.data['blad'],
					});
				}
				setCustomoweOsiagniecia({sprawdzone: true, odp: []});
				return;
			}
			setCustomoweOsiagniecia({sprawdzone: true, odp: r.data['odp']});
			return;
		}).catch((er) => {
			console.log("Błąd wczytywania dodatkowych osiągnięć. Powód: ", er);
			if(toast !== undefined){
				toast({
					title: "Błąd wczytywania",
					variant: "destructive",
					description: "Wystąpił błąd podczas wczytywania dodatkowych osiągnięć kierowcy. Powód: "+er.message,
				});
			}
			setCustomoweOsiagniecia({sprawdzone: true, odp: []});
			return;
		})
	};

	const sprawdzMozliwoscDodawania = async () => {
		console.log("Sprawdzam czy uzytkownik moze dodawac customowe osiagniecia.");
		await Axios.post(gb.backendIP+"dodawanieOsiagniecUprawnienie/"+localStorage.getItem("token")).then((r) => {
			setMozliwoscDodawania({sprawdzone: true, uprawniony: r.data['uprawniony'] ? r.data['uprawniony'] : false});
			return;
		}).catch((er) => {
			console.log("Uzytkownik nie jest uprawniony do dodawania osiagniec. Powód: ", er);
			setMozliwoscDodawania({sprawdzone: true, uprawniony: false});
			return;
		});
	};

	const dodajCustomowe = async () => {
		if(!dodawaneOsiagniecie.nazwa){
			console.log("Brak nazwy osiągnięcia.");
			if (toast !== undefined) {
				toast({
					title: "Błąd dodawania",
					variant: "destructive",
					description: "W dodawanym osiągnięciu nieuzupełniono nazwy.",
				});
			}
			setDodawaneOsiagniecie((cs) => ({...cs, dodaj: false}));
			return;
		}
		if(!dodawaneOsiagniecie.opis){
			console.log("Brak opisu dodawanego osiągnięcia.");
			if (toast !== undefined) {
				toast({
					title: "Błąd dodawania",
					variant: "destructive",
					description: "W dodawanym osiągnięciu nieuzupełniono opisu.",
				});
			}
			setDodawaneOsiagniecie((cs) => ({...cs, dodaj: false}));
			return;
		}
		if(dodawaneOsiagniecie.ikonaPlik === null){
			console.log("Brak ikony dodawanego osiągnięcia.");
			if (toast !== undefined) {
				toast({
					title: "Błąd dodawania",
					variant: "destructive",
					description: "W dodawanym osiągnięciu brakuje wybranego obrazu dla ikony.",
				});
			}
			setDodawaneOsiagniecie((cs) => ({...cs, dodaj: false}));
			return;
		}
		console.log("akcja - dodaj customowe osiagniecie", dodawaneOsiagniecie);
		await Axios.post(gb.backendIP+"dodajCustomOsiagniecie/"+localStorage.getItem("token"), {
			osiagnieciaImg: dodawaneOsiagniecie.ikonaPlik,
			kierowca: kierowca,
			nazwa: dodawaneOsiagniecie.nazwa,
			opis: dodawaneOsiagniecie.opis
		}, { headers: { 'Content-Type': 'multipart/form-data'}}).then((r) => {
			if(r.data['blad']){
				if (toast !== undefined) {
					toast({
						title: "Błąd dodawania",
						variant: "destructive",
						description: "Powód:"+r.data['blad'],
					});
				}
				setDodawaneOsiagniecie((cs) => ({...cs, dodaj: false}));
				return;
			}
			if (toast !== undefined) {
				toast({
					title: "Personalne osiągnięcie dodane!",
					className: "bg-green-500 text-green-50",
					description: "Pomyślnie dodano personalne osiągnięcie dla użytkownika "+kierowca+"!",
				});
			}
			setDodawaneOsiagniecie((cs) => ({...cs, otwarte: false, nazwa: null, opis: null, ikonaPlik: null, ikonaNazwa: null, ikonaBlob: null, dodaj: false}));
			setCustomoweOsiagniecia({sprawdzone: false, odp: []});
		}).catch((er) => {
			if (toast !== undefined) {
				toast({
					title: "Błąd dodawania",
					variant: "destructive",
					description: "Powód:"+er.message,
				});
			}
			setDodawaneOsiagniecie((cs) => ({...cs, dodaj: false}));
			return;
		});
	}

	const wczytajTypyOsiagniec = async () => {
		console.log("Wczytuje typy osiagniec");
		await Axios.get(gb.backendIP + "typyOsiagniec").then((r) => {
			if(r.data['blad']){
				if (toast !== undefined) {
					toast({
						title: "Błąd wczytywania",
						variant: "destructive",
						description: "Wystąpił błąd podczas wczytywania kategorii osiągnięć. Powód: "+r.data['blad'],
					});
				}
				setOtwarte(false);
			} else {
				setTypyOsiagniec(r.data.odp);
			}
		}).catch((er) => {
			if (toast !== undefined) {
				toast({
					title: "Błąd wczytywania",
					variant: "destructive",
					description: "Wystąpił błąd podczas wczytywania kategorii osiągnięć. Powód: "+er.message,
				});
			}
			setOtwarte(false);
		});
	};

	const usunCustomowe = async () => {
		await Axios.post(gb.backendIP + "usunCustomoweOsiagniecie/"+localStorage.getItem('token'), {
			...usuwaneOsiagniecie.dane
		}).then((r) => {
			if(r.data['blad']){
				if (toast !== undefined) {
					toast({
						title: "Błąd usuwania",
						variant: "destructive",
						description: "Wystąpił błąd podczas usuwania osiągnięcia. Powód: "+r.data['blad'],
					});
				}
				setUsuwaneOsiagniecie({dane: undefined, akcja: false});
			} else {
				if (toast !== undefined) {
					toast({
						title: "Personalne osiągnięcie usunięte!",
						className: "bg-green-500 text-green-50",
						description: "Pomyślnie usunięto personalne osiągnięcie użytkownika "+kierowca+"!",
					});
				}
				setCustomoweOsiagniecia({sprawdzone: false, odp: []})
				setUsuwaneOsiagniecie({dane: undefined, akcja: false});
			}
		}).catch((er) => {
			if (toast !== undefined) {
				toast({
					title: "Błąd usuwania",
					variant: "destructive",
					description: "Wystąpił błąd podczas usuwania osiągnięcia. Powód: "+er.message,
				});
			}
			setUsuwaneOsiagniecie({dane: undefined, akcja: false});
		});
	};

	const wczytajOsiagniecia = async () => {
		if(!kierowca){
			if (toast !== undefined) {
				toast({
					title: "Błąd wczytywania",
					variant: "destructive",
					description: "Niepoprawna wartość nazwy użytkownika w żądaniu.",
				});
			}
			setOtwarte(false);
			return;
		}
		console.log("Wczytuje osiagniecia uzytkownika");
		await Axios.post(gb.backendIP + "osiagnieciaKierowcy/"+kierowca).then((r) => {
			if(r.data['blad']){
				if (toast !== undefined) {
					toast({
						title: "Błąd wczytywania",
						variant: "destructive",
						description: "Wystąpił błąd podczas wczytywania osiągnięć kierowcy. Powód: "+r.data['blad'],
					});
				}
				setOtwarte(false);
			} else {
				setOsiagnieciaUser(r.data.odp);
			}
		}).catch((er) => {
			if (toast !== undefined) {
				toast({
					title: "Błąd wczytywania",
					variant: "destructive",
					description: "Wystąpił błąd podczas wczytywania osiągnięć kierowcy. Powód: "+er.message,
				});
			}
			setOtwarte(false);
		});
	};

	useEffect(() => {
		if (!otwarte) return;
		if (!typyOsiagniec) {
			wczytajTypyOsiagniec();
			return;
		}
		if (!osiagnieciaUser) wczytajOsiagniecia();
	}, [otwarte, typyOsiagniec, osiagnieciaUser]);
	
	useEffect(() => {
		if (!otwarte) return;
		if(!mozliwoscDodawania.sprawdzone) {
			sprawdzMozliwoscDodawania();
			return;
		}
		if (!customoweOsiagniecia.sprawdzone) wczytajCustomoweOsiagniecia();
	}, [otwarte, mozliwoscDodawania.sprawdzone, customoweOsiagniecia]);

	useEffect(() => {
		if(dodawaneOsiagniecie.dodaj) dodajCustomowe();
		if(usuwaneOsiagniecie.akcja) usunCustomowe();
	}, [dodawaneOsiagniecie.dodaj, usuwaneOsiagniecie.akcja]);

	const kolory = (cel) => {
		if(cel < 1) return "#535353"; // brak
		if(cel < 10) return "#71665d"; //"#A19D94"; // zelazo POTENCJALNIE: #71665d
		if(cel < 30) return "#8B4513"; //"#A0522D"; //"#6b5034"; // braz
		if(cel < 50) return "#D3D3D3"; //"#C0C0C0"; // srebrny
		if(cel < 70) return "#FFD700"; //"#FFD700"; // złoty
		if(cel < 100) return "#FF00FF"; //"#E5E4E2"; // platyna
		else return "#1E90FF"; //"#64cdff"; // diament #64cdff
	};

	const flagi = (nazwa) => {
		// const ats = ["alaska", "arizona", "arkansas", "britishcolumbia", "california", "colorado", "idaho", "iowa", "kanada", "kansas", "missouri", "montana", "nebraska", "nevada", "newmexico", "oklahoma", "oregon", "texas", "utah", "washington", "wyoming"];
		const ats = ["britishcolumbia"];
		const panstwo = nazwa.slice(9).toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c");
		if(ats.includes(panstwo)) return "usa";
		else return panstwo;
	}

	const Osiagniecie = ({typ, uzytkownik}) => {
		return(
			<div className="bg-zinc-800 shadow-xl shadow-zinc-900 ring-1 ring-zinc-700 flex flex-col grow py-2 px-2 rounded-sm hover:-translate-y-2 transition-transform duration-300 ">
				<div className="flex gap-3">
					<div className="relative min-w-20 min-h-20 w-20 h-20">
						<IkonyOsiagniecia nazwa={typ.ikona} fill={kolory(uzytkownik ? (uzytkownik.nabite / typ.wartosc) : 0)} className="drop-shadow-sm drop-shadow-zinc-800" />
						{ uzytkownik ?
						<p className={`absolute bottom-0 right-1 text-[0.75rem] font-bold`} style={{color: kolory(uzytkownik ? (uzytkownik.nabite / typ.wartosc) : 0)}}>
							x{Math.floor(uzytkownik.nabite / typ.wartosc)}
						</p>
						: "" }
						{ typ.nazwa.includes("Dostawca ") ?
						<div className="absolute top-0 left-0 w-11.25 h-6.25 origin-top-left"
						style={{
							backgroundRepeat: 'no-repeat',
							backgroundSize: 'cover',
							backgroundPosition: "center",
							backgroundImage: `url(/img/flagi/${flagi(typ.nazwa)}.png)`,
							transform: 'translate(18px, 25px) rotate(345deg)',
							}} /> : ""}
					</div>
					<div className="grow flex-col flex justify-evenly overflow-hidden overflow-ellipsis whitespace-nowrap">

						<div>
							<h3 className="font-black text-[1rem] text-[#e5c890]" >{typ.nazwa}</h3>
							<p title={ typ.opis ? typ.opis.replace("$wartosc$", typ.wartosc.toLocaleString("pl-PL")) : "Brak opisu"} className="text-[0.75rem] text-[#e64553] font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis">
							{ typ.opis ? typ.opis.replace("$wartosc$", typ.wartosc.toLocaleString("pl-PL")) : "Brak opisu"}
							</p>
						</div>

						<div className="overflow-hidden h-5 w-full rounded-md bg-zinc-700 text-white font-semibold relative text-center flex items-center border border-zinc-400">
							{ uzytkownik ?
							<>
								<div className="absolute top-0 bottom-0 left-0 right-0" style={{background: kolory(uzytkownik ? (uzytkownik.nabite / typ.wartosc) : 0), transform: `translateX(-${ 100 - ( (uzytkownik.nabite % typ.wartosc) / typ.wartosc * 100) }%)`}} />
								<span className="absolute left-0 right-0 text-[0.7rem] text-shadow-[0_0_3px_#000]">{((uzytkownik.nabite % typ.wartosc) / typ.wartosc * 100).toFixed(1)}% ({(uzytkownik.nabite%typ.wartosc).toLocaleString("pl-PL")} / {typ.wartosc.toLocaleString("pl-PL")})</span>
							</>
								: <span className="absolute left-0 right-0 text-[0.7rem] text-shadow-[0_0_3px_#000]">Brak postępów (0 / {typ.wartosc.toLocaleString("pl-PL")})</span>
							}
						</div>
					</div>
				</div>
			</div>
		)
	};

	const OsiagniecieCustomowe = ({dane}) => {
		return(
			<div className="relative group bg-zinc-800 shadow-xl shadow-zinc-900 ring-1 ring-zinc-700 flex flex-col grow py-2 px-2 rounded-sm hover:-translate-y-2 transition-transform duration-300 ">
				{ mozliwoscDodawania.uprawniony
					? 
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<button
								className="ring-1 rounded-md text-zinc-300/60 bg-zinc-900/40 px-2 py-1 text-[0.8rem] absolute top-1.5 right-2 hidden opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-300 cursor-pointer justify-center items-center gap-1 hover:bg-zinc-800 hover:text-red-400"
							>
								<FaTrashAlt /> Usuń
							</button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
								<AlertDialogDescription>
								Czy aby napewno chcesz usunąć osiągniecie o tytule <b className="text-yellow-400">{dane.nazwa}</b> należące do kierowcy <b className="text-blue-400">{kierowca}</b>?
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
								<AlertDialogAction
									className="cursor-pointer"
									onClick={() => setUsuwaneOsiagniecie((u) => ({dane: dane, akcja: true}))}
								>Potwierdź</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					: ""
				}
				<div className="flex gap-3">
					<div className="relative min-w-20 min-h-20 w-20 h-20">
						<img src={dane.ikona} className="w-20 h-20 object-center object-contain" />
					</div>
					<div className="grow flex-col flex justify-evenly overflow-hidden overflow-ellipsis whitespace-nowrap">
						<div>
							<h3 className="font-black text-[1rem] text-[#e5c890]" >{dane.nazwa}</h3>
							<p title={ dane.opis ? dane.opis : "Brak opisu"}
								className="text-[0.75rem] text-[#e64553] font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis"
							>{ dane.opis ? dane.opis : "Brak opisu" }</p>
						</div>
						<span className="text-[0.7rem] text-zinc-400">Personalne osiągnięcie otrzymane {new Date(dane.dataNadania).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}.</span>
					</div>
				</div>
			</div>
		)
	};

	// const OsiagniecieCustomowe = ({dane}) => {
	// 	return(
	// 		<div className="relative group bg-zinc-800 shadow-xl shadow-zinc-900 ring-1 ring-zinc-700 flex flex-col grow py-2 px-2 rounded-sm hover:-translate-y-2 transition-transform duration-300 ">
	// 			{ mozliwoscDodawania.uprawniony
	// 				? <div
	// 					className="ring-1 rounded-md text-zinc-300/60 bg-zinc-900/40 px-2 py-1 text-[0.8rem] absolute top-1.5 right-2 hidden opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-300 cursor-pointer justify-center items-center gap-1 hover:bg-zinc-800 hover:text-red-400"
	// 					onClick={() => setUsuwaneOsiagniecie((u) => ({...u, dane: dane}))}>
	// 					<FaTrashAlt /> Usuń
	// 				</div>
	// 				: ""
	// 			}
	// 			<div className="flex gap-3">
	// 				<div className="relative min-w-20 min-h-20 w-20 h-20">
	// 					<img src={dane.ikona} className="w-20 h-20 object-center object-contain" />
	// 				</div>
	// 				<div className="grow flex-col flex justify-evenly overflow-hidden overflow-ellipsis whitespace-nowrap">
	// 					<div>
	// 						<h3 className="font-black text-[1rem] text-[#e5c890]" >{dane.nazwa}</h3>
	// 						<p title={ dane.opis ? dane.opis : "Brak opisu"}
	// 							className="text-[0.75rem] text-[#e64553] font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis"
	// 						>{ dane.opis ? dane.opis : "Brak opisu" }</p>
	// 					</div>
	// 					<span className="text-[0.7rem] text-zinc-400">Personalne osiągnięcie otrzymane {new Date(dane.dataNadania).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}.</span>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	)
	// };

	const zmianaZdjeciaCustom = (e) => {
		if(e.target.files.length) setDodawaneOsiagniecie((p) => ({...p, ikonaNazwa: e.target.value, ikonaPlik: e.target.files[0], ikonaBlob: URL.createObjectURL(e.target.files[0]) }) );
		else setDodawaneOsiagniecie( (p) => ({...p, ikonaBlob: null, ikonaNazwa: null, ikonaPlik: null}) );
	};

	const wyswietlDodawane = () => {
		return(
			<div className="bg-zinc-800 shadow-xl shadow-zinc-900 ring-1 ring-orange-700 flex flex-col grow py-2 px-2 rounded-sm">
				<div className="flex gap-3">
					<div className="relative min-w-20 min-h-20 w-20 h-20">
						{ dodawaneOsiagniecie.ikonaBlob ?
							<img className="w-20 h-20 rounded-md hover:bg-zinc-950/25 object-center object-contain" src={dodawaneOsiagniecie.ikonaBlob} />
							: <IkonyOsiagniecia nazwa={undefined} fill={"#FFF"} className="drop-shadow-sm drop-shadow-zinc-800" />
						}
						<label className="absolute left-0 top-0 right-0 bottom-0 cursor-pointer" htmlFor="uploadIkona" />
						<input id="uploadIkona" type="file" className="hidden" accept="image/png" onChange={(e) => zmianaZdjeciaCustom(e)} />
					</div>
					<div className="grow flex-col flex justify-evenly overflow-hidden overflow-ellipsis whitespace-nowrap">
						<div>
							<input
								type="text"
								className="block w-full font-black text-[1rem] text-[#e5c890] outline-0 ring-0 border-0 hover:bg-zinc-950/25"
								value={dodawaneOsiagniecie.nazwa || null}
								placeholder="Wprowadź nazwę osiągnięcia"
								onChange={(e) => setDodawaneOsiagniecie((p) => ({...p, nazwa: e.target.value}))}
							/>
							<input
								type="text"
								title={dodawaneOsiagniecie.opis || "Brak opisu"}
								value={dodawaneOsiagniecie.opis || null}
								placeholder="Wprowadź opis osiągnięcia..."
								className="block w-full text-[0.75rem] hover:bg-zinc-950/25 text-[#e64553] font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis outline-0 ring-0 border-0"
								onChange={(e) => setDodawaneOsiagniecie((p) => ({...p, opis: e.target.value}))}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	};

	const zwrocCustomoweOsiagniecia = useCallback(() => {
		if(customoweOsiagniecia.odp.length){
			return customoweOsiagniecia.odp.map((customOs, typIndex) => {
				// console.log(customOs);
				return <OsiagniecieCustomowe key={customOs.nazwa+customOs.id} dane={customOs} />
			})
		} else {
			return null;
		}
	}, [customoweOsiagniecia]);

	const zwrocOsiagniecia = useCallback(() => {
		if(typyOsiagniec && osiagnieciaUser){
			return typyOsiagniec.map((typ, typIndex) => {
				const czyPosiada = osiagnieciaUser.find(x => x.osiagniecie === typ.id);
				return <Osiagniecie key={typ.nazwa} typ={typ} uzytkownik={czyPosiada} />
			})
		} else {
			return null;
		}
	}, [typyOsiagniec, osiagnieciaUser]);

	return (
		<>
		<Dialog open={otwarte} onOpenChange={setOtwarte}>
			<DialogContent className={`max-w-275! h-[75vh] max-h-175 w-95/100 bg-[#212121] ${styl}`}>
				{ mozliwoscDodawania.uprawniony
					? dodawaneOsiagniecie.otwarte
						? <div className="absolute top-full right-5 space-x-3 flex">
							<button
								className="transition-colors disabled:cursor-progress duration-300 hover:text-green-400 bg-zinc-700/95 text-zinc-300 text-sm p-3 rounded-b-lg ring-1 ring-zinc-600 font-bold cursor-pointer"
								onClick={() => setDodawaneOsiagniecie((p) => ({...p, dodaj: true}))}
								disabled={dodawaneOsiagniecie.dodaj}
							>Potwierdź dodawanie</button>
							<button
								className="transition-colors disabled:cursor-progress duration-300 hover:text-red-400 bg-zinc-700/95 text-zinc-300 text-sm p-3 rounded-b-lg ring-1 ring-zinc-600 font-bold cursor-pointer"
								onClick={() => setDodawaneOsiagniecie((p) => ({...p, otwarte: false, nazwa: null, opis: null, ikonaBlob: null, ikonaNazwa: null, ikonaPlik: null}))}
								disabled={dodawaneOsiagniecie.dodaj}
							>Anuluj dodawanie</button>
						</div>
						: <div
							className="absolute transition-colors duration-300 hover:text-yellow-400 bg-zinc-700/95 text-zinc-300 text-sm p-3 top-full right-5 rounded-b-lg ring-1 ring-zinc-600 font-bold cursor-pointer"
							onClick={() => setDodawaneOsiagniecie((p) => ({...p, otwarte: true}))}
						  >Dodaj osiągnięcie</div>
					: ""
				}
				<DialogHeader>
					<DialogTitle>Gablota osiągnięć</DialogTitle>
					<DialogDescription className="relative">
						{ kierowca === localStorage.getItem("login")
							? `Reprezentacja Twoich postępów nad osiągnięciami w różnych kategoriach.`
							: `Reprezentacja postępów kierowcy ${kierowca} nad osiągnięciami w różnych kategoriach.`
						}
					</DialogDescription>
				</DialogHeader>
				<div className="h-full grid grid-cols-2 gap-4 overflow-y-auto p-3 pl-1">
					{ dodawaneOsiagniecie.otwarte && wyswietlDodawane() }
					{ zwrocCustomoweOsiagniecia() }
					{ zwrocOsiagniecia() }

				</div>
			</DialogContent>
		</Dialog>
		</>
	);
};

export default memo(Osiagniecia);
// export default Osiagniecia;