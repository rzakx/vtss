import Nawigacja from "../Komponenty/Nawigacja";
import { Link } from "react-router-dom";
import { useState, memo, useCallback, useMemo, useEffect } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
import { cn } from "@/lib/utils"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandItem, CommandEmpty, CommandGroup, CommandInput } from "@/components/ui/command";
import IkonyOsiagniecia from "@/SVG/IkonyOsiagniecia";
import { IoIosTrophy } from "react-icons/io";
import { Check, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const obejscieTlo = (c) => { return {backgroundImage: `url('${c}')`} };

export default function MenadzerKont(){
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false, dane: []});
    const [ rangi, setRangi ] = useState({response: false, dane: []});
    const [ stanowiska, setStanowiska ] = useState({response: false, dane: []});
    
    const [ zmianyProfil, setZmianyProfil ] = useState(null);

    const [ podwyzki, setPodwyzki ] = useState({response: false, dane: []});
	const [ sprawdzanaPodwyzka, setSprawdzanaPodwyzka ] = useState(undefined);
    
    const [ urlopy, setUrlopy ] = useState({response: false, dane: []});
	const [ sprawdzanyUrlop, setSprawdzanyUrlop ] = useState(undefined);
    
    const [ grupoweOsiagniecia, setGrupoweOsiagniecia ] = useState(false);

    const dostanPodwyzki = useCallback(async () => {
        await Axios.post(gb.backendIP+"listaPodwyzek").then((r) => {
            setPodwyzki({dane: r.data, response: true});
        });
    }, []);

    const dostanUrlopy = useCallback(async () => {
        await Axios.post(gb.backendIP+"listaUrlopow").then((r) => {
            setUrlopy({dane: r.data, response: true});
        });
    }, []);

    const dostanKonta = useCallback(async () => {
        //i rangi
        await Axios.post(gb.backendIP+"listaUzytkownikow").then(async (r2) => {
            await Axios.post(gb.backendIP+"rangi").then(async (r3) => {
                await Axios.post(gb.backendIP+"stanowiska").then((r4) => {
                    setUzytkownicy({dane: r2.data, response: true});
                    setRangi({dane: r3.data['dane'], response: true});
                    setStanowiska({dane: r4.data['dane'], response: true});
                });
            });
        });
    }, []);

    useEffect(() => {
        if(!podwyzki.response) dostanPodwyzki();
    }, [podwyzki.response, dostanPodwyzki]);

    useEffect(() => {
        if(!urlopy.response) dostanUrlopy();
    }, [urlopy.response, dostanUrlopy]);

    useEffect(() => {
        if(!uzytkownicy.response){
            console.log("dostanKonta")
            dostanKonta();
        }
    }, [uzytkownicy.response, dostanKonta]);

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
				<Toaster richColors />
                <div className="glowna">
					{ ( zmianyProfil === null && sprawdzanaPodwyzka === undefined && sprawdzanyUrlop === undefined ) &&
                    <button
                        onClick={ () => setGrupoweOsiagniecia(x => ({...x, otwarte: true, kierowcy: [], kierowcyOpen: false }) ) }
                        className="absolute bottom-full flex items-center gap-2 right-4 bg-card cursor-pointer hover:bg-accent hover:tracking-wider transition-all font-bold text-sm rounded-t-md border-input border px-3 py-2"
                    >Grupowe osiągnięcia <IoIosTrophy className="inline text-xl" /></button> }
                    <div className="p-2.5 relative [&_h4]:text-center [&_h4]:m-[5px_0_10px] przegladajUzytkownikow" style={{minHeight: '500px'}}>
                    	{ (uzytkownicy.response == true) && <ZwrocKonta uzytkownicy={ uzytkownicy.dane || [] } urlopy={ urlopy.dane || [] } podwyzki={ podwyzki.dane || [] } setZmianyProfil={setZmianyProfil} setSprawdzanaPodwyzka={setSprawdzanaPodwyzka} setSprawdzanyUrlop={setSprawdzanyUrlop} /> }
                    </div>
                    { ( zmianyProfil !== null ) && <ZarzadzajKontem zmianyProfil={zmianyProfil} setZmianyProfil={setZmianyProfil} setUzytkownicy={setUzytkownicy} rangi={ rangi.dane || [] } stanowiska={ stanowiska.dane || [] } /> }
					{ ( sprawdzanaPodwyzka !== undefined ) && <RozpatrzPodwyzke podwyzka={sprawdzanaPodwyzka} setSprawdzanaPodwyzka={setSprawdzanaPodwyzka} setPodwyzki={setPodwyzki} uzytkownicy={ uzytkownicy.dane || [] } stanowiska={stanowiska.dane || []} /> }
                    { ( sprawdzanyUrlop !== undefined ) && <RozpatrzUrlop uzytkownicy={ uzytkownicy.dane || [] } setUrlopy={setUrlopy} urlop={ sprawdzanyUrlop } setSprawdzanyUrlop={setSprawdzanyUrlop} /> }
                </div>
                <OknoGrupoweOsiagniecia otwarte={grupoweOsiagniecia} setOtwarte={setGrupoweOsiagniecia} uzytkownicy={uzytkownicy.dane || [] } />
            </div>
        </>
    );
};

const OknoGrupoweOsiagniecia = memo(({otwarte, setOtwarte, uzytkownicy}) => {
	const [ kierowcyOpen, setKierowcyOpen ] = useState(false);
	const [ kierowcy, setKierowcy ] = useState([]);
	const [ oddawanie, setOddawanie ] = useState(false);
	const [ nazwa, setNazwa ] = useState("");
	const [ opis, setOpis ] = useState("");
	const [ obraz, setObraz ] = useState({ikonaBlob: undefined, ikonaNazwa: undefined, ikonaPlik: undefined });
	const [ potwierdz, setPotwierdz ] = useState(false);

	const wstepneSprawdzenie = (e) => {
		if(oddawanie) return;
		if(e){
			if(!nazwa){
				toast.error("Brakująca zawartość", { description: "W dodawanym osiągnięciu brakuje tytułu."});
				return;
			}
			if(!opis){
				toast.error("Brakująca zawartość", { description: "W dodawanym osiągnięciu brakuje opisu."});
				return;
			}
			if(obraz.ikonaPlik === undefined){
				toast.error("Brakująca zawartość", { description: "W dodawanym osiągnięciu brakuje ikonki."});
				return;
			}
			if(!kierowcy.length){
				toast.error("Brakująca zawartość", { description: "Nie wybrano żadnych kierowców, którzy otrzymaliby dodawane osiągnięcie."});
				return;
			}
		}
		setPotwierdz(e);
	};

	const nadajOsiagniecie = async () => {
		setOddawanie(true);
		await Axios.post(gb.backendIP+"dodajGrupoweOsiagniecie/"+localStorage.getItem("token"), {
			osiagnieciaImg: obraz.ikonaPlik, kierowcy: kierowcy, nazwa: nazwa, opis: opis
		}, { headers: { 'Content-Type': 'multipart/form-data'}}).then((r) => {
			if(r.data['blad']){
				toast.warning("Błąd nadawania osiągnięcia", {
					description: `${r.data['blad']} Osiągnięcia nieotrzymali: ${r.data['nieotrzymali'].map(id => {
						let znajdzLogin = uzytkownicy.find(uz => uz.id.toString() == id);
						if(znajdzLogin === undefined) return "Nieznany";
						return znajdzLogin.login;
					}).join(", ") }`,
					duration: 45_000
				})
				setKierowcy(r.data['nieotrzymali']);
			} else {
				toast.success("Pomyślnie nadano osiągnięcia", { description: `${kierowcy.length} wybranych kierowców otrzymało osiągnięcie.` });
				setKierowcy([]);
				setNazwa("");
				setOpis("");
				URL.revokeObjectURL(obraz.ikonaBlob);
				setObraz({ikonaBlob: undefined, ikonaNazwa: undefined, ikonaPlik: undefined });
			}
		}).catch((er) => {
			toast.error("Błąd nadawania osiągnięcia", {
				description: `Wystąpił błąd zapytania. Powód: ${er.message}`,
				duration: 10_000
			});
		}).finally(() => {
			setOddawanie(false);
		})
	};

    return(
	    <Dialog open={otwarte} onOpenChange={(e) => (kierowcyOpen == false && oddawanie == false) && setOtwarte(e) }>
            <DialogContent className={`max-w-275! w-95/100 bg-[#212121]`}>
                <div className="absolute top-full right-5 space-x-3 flex">
					<AlertDialog open={potwierdz} onOpenChange={(e) => wstepneSprawdzenie(e) } >
						<AlertDialogTrigger asChild>
							<button
								className="transition-colors disabled:cursor-progress duration-300 hover:text-green-400 bg-zinc-700/95 text-zinc-300 text-sm p-3 rounded-b-lg ring-1 ring-zinc-600 font-bold cursor-pointer"
								disabled={oddawanie}
							>Potwierdź dodawanie</button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
								<AlertDialogDescription>Czy aby napewno chcesz dodać osiągnięcie o tytule <span className="text-[#e5c890] font-bold">{nazwa}</span> dla <span className="text-[#e64553] font-bold">{kierowcy.length} wybranych</span> użytkowników? W razie pomyłki będziesz musiał ręcznie usuwać nadane osiągnięcie przez profil kierowców.</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel onClick={() => setPotwierdz(false)}>Anuluj</AlertDialogCancel>
								<AlertDialogAction asChild>
									<Button variant="secondary" disabled={oddawanie} onClick={() => nadajOsiagniecie()}>{oddawanie ? "Trwa oddawanie" : "Potwierdź"}</Button>
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
                    <button
                    	className="transition-colors disabled:cursor-progress duration-300 hover:text-red-400 bg-zinc-700/95 text-zinc-300 text-sm p-3 rounded-b-lg ring-1 ring-zinc-600 font-bold cursor-pointer"
                        onClick={() => setOtwarte(false) }
                        disabled={oddawanie}
                    >Anuluj dodawanie</button>
                </div>
				<DialogHeader>
					<DialogTitle>Dodawanie grupowych osiągnięć</DialogTitle>
					<DialogDescription className="relative">
						Możliwość dodawania customowych osiągnięć dla kilku kierowców jednocześnie.
					</DialogDescription>
				</DialogHeader>
				<div className="h-full flex gap-4 overflow-y-auto p-3 pl-1">
					<div className="bg-zinc-800 w-1/2 shadow-xl shadow-zinc-900 ring-1 ring-orange-700 flex flex-col py-2 px-2 rounded-sm relative mt-2 h-fit">
						<h3 className="text-sm font-bold absolute bottom-full left-0 pb-1">Osiągnięcie:</h3>
						<div className="flex gap-3">
							<div className="relative min-w-20 min-h-20 w-20 h-20">
								{ obraz.ikonaBlob
									? <img className="w-20 h-20 rounded-md hover:bg-zinc-950/25 object-center object-contain" src={obraz.ikonaBlob} />
									: <IkonyOsiagniecia nazwa={undefined} fill={"#FFF"} className="drop-shadow-sm drop-shadow-zinc-800" />
								}
								<label className="absolute left-0 top-0 right-0 bottom-0 cursor-pointer" htmlFor="uploadIkona" />
								<input
									id="uploadIkona" type="file"
									className="hidden" accept="image/png"
									onChange={(e) => {
										if(e.target.files.length) setObraz((p) => ({...p, ikonaNazwa: e.target.value, ikonaPlik: e.target.files[0], ikonaBlob: URL.createObjectURL(e.target.files[0]) }) );
										else setObraz( (p) => {
											if(p.ikonaBlob !== undefined){
												URL.revokeObjectURL(p.ikonaBlob);
											}
											return {...p, ikonaBlob: undefined, ikonaNazwa: undefined, ikonaPlik: undefined}
										});
									}}
								/>
							</div>
							<div className="grow flex-col flex justify-evenly overflow-hidden overflow-ellipsis whitespace-nowrap">
								<div>
									<input
										type="text"
										className="block w-full font-black text-[1rem] text-[#e5c890] outline-0 ring-0 border-0 hover:bg-zinc-950/25"
										value={nazwa ?? ""}
										placeholder="Wprowadź nazwę osiągnięcia"
										onChange={(e) => setNazwa(e.target.value) }
										disabled={oddawanie}
									/>
									<input
										type="text"
										title={opis || "Brak opisu"}
										value={opis ?? ""}
										placeholder="Wprowadź opis osiągnięcia..."
										className="block w-full text-[0.75rem] hover:bg-zinc-950/25 text-[#e64553] font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis outline-0 ring-0 border-0"
										onChange={(e) => setOpis(e.target.value) }
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-2 relative grow basis-0">
						<h3 className="text-sm font-bold absolute bottom-full left-0 pb-1">Odbiorcy ({kierowcy.length} wybranych):</h3>
						{ !kierowcy.length
							? <p className="text-card-foreground italic text-sm">Brak wybranych kierowców.</p>
							: <div className=" w-full flex gap-2 flex-wrap">
								{ kierowcy.map(wybrany => {
									const infokierowcy = uzytkownicy.find(uz => uz.id.toString() == wybrany);
									return <div
										key={`wybrany_${wybrany}`}
										className="px-2 py-1 rounded-md bg-secondary text-base font-bold tracking-wide border-input border"
									>
										<img src={"https://system.thebossspedition.pl/img/"+infokierowcy.awatar} className="inline w-6 h-6 mr-2" />
										{ infokierowcy.login }
									</div>
								}) }
							</div>
						}
						<Popover open={kierowcyOpen} onOpenChange={ (e) => setKierowcyOpen(e) }>
							<PopoverTrigger asChild>
								<Button variant="outline" role="combobox" className="justify-between flex-1 min-w-0 mt-2" disabled={oddawanie}>
									<span className="truncate">Wybierz kierowców</span>
									<ChevronsUpDown className="opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full">
								<Command>
									<CommandInput placeholder="Wyszukaj po nazwie" />
									<CommandList onWheel={(e) => e.stopPropagation() }>
										<CommandEmpty>Nie znaleziono kierowcy.</CommandEmpty>
										<CommandGroup>
											{
												(uzytkownicy.length > 0) && uzytkownicy.map(w => {
													return <CommandItem
														key={`grupoweOsiagniecia_${w.login}`}
														value={w.id.toString()}
														keywords={[w.login]}
														onSelect={ (val) => {
															setKierowcy(x => {
																let aktWybrani = [...x];
																if(aktWybrani.includes(val)){
																	aktWybrani = aktWybrani.filter(a => a !== val);
																} else {
																	aktWybrani.push(val);
																}
																return aktWybrani
															});
														}}
													>{w.login} <Check className={cn("ml-auto", kierowcy.includes(w.id.toString()) ? "opacity-100" : "opacity-0")} />
													</CommandItem>
												})
											}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>
                </div>
        	</DialogContent>
    	</Dialog>
    );
});

const ZwrocKonta = memo(({uzytkownicy, urlopy, podwyzki, setZmianyProfil, setSprawdzanaPodwyzka, setSprawdzanyUrlop}) => {
    if(!uzytkownicy.length) return;
    return (
        <>
            <table className="w-full border-collapse [&_tr_th]:border-b [&_tr_th]:border-b-[goldenrod]
            [&_tr_th]:p-[10px_15px] [&_tr_th]:text-left [&_tr_th]:align-middle [&_tr_th]:transition-all [&_tr_th]:duration-300
            [&_tr_td]:p-[10px_15px] [&_tr_td]:text-left [&_tr_td]:align-middle [&_tr_td]:transition-all [&_tr_td]:duration-300
            [&_tr_td:first-child]:text-center [&_tr_th:first-child]:text-center [&_tr_th:nth-child(2)]:text-center
            [&_tr:nth-child(odd)_td]:bg-[#121212] [&_tr:nth-child(even)_td]:bg-[#161616]
            [&_tr:hover_td]:bg-[#1c1c1c] [&_tr:hover_td]:text-[#ddd] [&_td_b]:font-medium [&_td_b]:text-white [&_td_b]:text-[0.85rem]
            wejscieSmooth zarzadzanieKontami">
            <tbody>
                <tr><th>#</th><th>Kierowca</th><th>Dołączył</th><th>Typ konta</th><th>Stanowisko</th><th>Stawka</th><th>Akcja</th></tr>
                { uzytkownicy.map((user) => {
                    const czyPodwyzka = (podwyzki.length > 0) ? podwyzki.find(tmp => tmp.ktozlozyl === user.id) : undefined;
                    const czyUrlop = (urlopy.length > 0) ? urlopy.find(tmp => tmp.kto === user.id) : undefined;
                    return (
                        <tr key={"user_" + user.id}>
                            <td>{user.id}</td>
                            <td>
                                <Link to={"../profil/"+user.login}>
                                    <img className="inline rounded-[50%] align-middle mr-5 w-11.25 h-11.25" src={"/img/" + user.awatar} /> 
                                    {user.login}
                                </Link>
                            </td>
                            <td>{new Date(user.datadolaczenia).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</td>
                            <td>{user.ranga}</td>
                            <td>{user.stanowiskoNazwa}</td>
                            <td>{user.stawka.toFixed(2)} zł / km</td>
                            <td className="ostatniaKolumnaKonta">
                                <a onClick={() => setZmianyProfil(user) }>Zarządzaj</a>
                                { (czyPodwyzka !== undefined) && <><br /><a className="menadzerOdnosnikPodwyzka" onClick={() => setSprawdzanaPodwyzka(czyPodwyzka) } >Podwyżka</a></> }
                                { (czyUrlop !== undefined) && <><br /><a className="menadzerOdnosnikUrlop" onClick={() => setSprawdzanyUrlop(czyUrlop) } >Urlop</a></> }
                            </td>
                        </tr>
                    );
                }) }
            </tbody>
            </table>
        </>
    );
});

const ZarzadzajKontem = memo(({zmianyProfil, setZmianyProfil, setUzytkownicy, rangi, stanowiska}) => {
    const [ usunAwatar, setUsunAwatar ] = useState(0);
	const [ usuwanie, setUsuwanie ] = useState(false);

	const zaktualizujProfil = useCallback((idosoby) => {
        const czas = new Date(zmianyProfil.datadolaczenia).toISOString();
        Axios.post(gb.backendIP+"/administrujProfil/"+localStorage.getItem('token'), {
            idosoby: idosoby,
            login: zmianyProfil.login,
            stawka: zmianyProfil.stawka,
            garaz: zmianyProfil.garaz,
            truck: zmianyProfil.truck,
            typkonta: zmianyProfil.typkonta,
            stanowisko: zmianyProfil.stanowisko,
            steam: zmianyProfil.steam,
            truckbook: zmianyProfil.truckbook,
            truckersmp: zmianyProfil.truckersmp,
            worldoftrucks: zmianyProfil.worldoftrucks,
            discord: zmianyProfil.discord,
            email: zmianyProfil.email,
            datadolaczenia: czas,
            dostepATS: zmianyProfil.dostepATS
        }).then((r) => {
            console.log(r.data);
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
            setZmianyProfil(null);
        }).catch(() => {
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
            setZmianyProfil(null);
        });
    }, [zmianyProfil]);

	const potwierdzenieUsuwania = useCallback(async (idosoby) => {
        console.log("Usuwam profil", zmianyProfil.login);
        await Axios.post(gb.backendIP+"/usunKonto/"+localStorage.getItem('token'), {idosoby: idosoby}).then((r) => {
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
        }).catch(() => setUzytkownicy({response: false, zarzadzaj: false, wniosek: false}));
    }, []);

    return(
        <div className="administrowanieKonta wejscieSmooth">
            <div className="menadzerRozpatrzTytul"><span style={{color: 'dodgerblue'}}>Zarządzanie Kontem</span></div>
            <div className="administrowanieKol">
                <span>Awatar:</span>
                <div className="administrowanieKontaAwatar" style={obejscieTlo('/img/'+zmianyProfil.awatar)} />
                <button className="admAwatar" onClick={() => setUsunAwatar(1)}>Usuń awatar</button>
                { (usunAwatar == 1) && <div style={{marginTop:"-5px", gap: '5px', display: 'flex'}}>
                    <button className="admAwatar" style={{background: '#b8860b', flexGrow: 1}} onClick={() => setUsunAwatar(0)}>Anuluj</button>
                    <button className="admAwatar" style={{background: '#dc143c', flexGrow: 1}} onClick={() => {
                        Axios.post(gb.backendIP+"adminUsunAwatar/"+localStorage.getItem("login")+"/"+zmianyProfil.id, {staryAwatar: zmianyProfil.awatar});
                        setZmianyProfil(x => ({...x, awatar: "awatary/default.png"}));
                        setUsunAwatar(0);
                        setUzytkownicy(x => {
                            let gagatki = [...x.dane];
                            let glupieID;
                            gagatki.find((tmp, k) => {
                                if(tmp.id === zmianyProfil.id){
                                    glupieID = k;
                                }
                            });
                            gagatki[glupieID]['awatar'] = "awatary/default.png";
                            return {...x, dane: gagatki}
                        });
                    }}>Potwierdź</button>
                </div> }
            </div>
            <div className="administrowanieKol">
               <div>
                    <span>Login:</span>
                    <input type="text" value={zmianyProfil.login} onChange={(e) => setZmianyProfil(x => ({...x, login: e.target.value}) ) }/>
                </div>
                <div>
                    <span>Dołączył dnia:</span>
                    <input type="datetime-local" value={zmianyProfil.datadolaczenia} onChange={(e) => setZmianyProfil(x => ({...x, datadolaczenia: e.target.value}) ) }/>
                </div>
                <div>
                    <span>Typ konta:</span>
                    <select value={zmianyProfil.typkonta} onChange={(e) => setZmianyProfil(x => ({...x, typkonta: e.target.value}) ) }>
                        {rangi.map((ranga, idr) => {
                            if(ranga) return <option key={`typkonta_${idr}`} value={idr}>{ranga}</option>
                        })}
                    </select>
                 </div>
                <div>
                    <span>Stanowisko:</span>
                    <select value={zmianyProfil.stanowisko} onChange={(e) => setZmianyProfil(x => ({...x, stanowisko: e.target.value}) ) }>
                        {stanowiska.map((stanowisko, idr) => {
                            if(stanowisko) return <option key={`stanowisko_${idr}`} value={idr}>{stanowisko}</option>
                        })}
                    </select>
                </div>
                <div>
                    <span>Stawka za km:</span>
                    <input type="number" step={0.01} value={zmianyProfil.stawka} min={0} onChange={(e) => setZmianyProfil(x => ({...x, stawka: e.target.value}) ) }/>
                </div>
            </div>
            <div className="administrowanieKol">
                <div>
                    <span>Garaż:</span>
                    <input type="text" value={zmianyProfil.garaz} onChange={(e) => setZmianyProfil(x => ({...x, garaz: e.target.value}) ) } />
                </div>
                <div>
                    <span>Pojazd:</span>
                    <input type="text" value={zmianyProfil.truck} onChange={(e) => setZmianyProfil(x => ({...x, truck: e.target.value}) ) } />
                </div>
                <div>
                    <span>Discord ID:</span>
                    <input type="number" step={1} value={zmianyProfil.discord} onChange={(e) => setZmianyProfil(x => ({...x, discord: e.target.value}) ) } />
                </div>
                <div>
                    <span>E-mail:</span>
                    <input type="text" value={zmianyProfil.email} onChange={(e) => setZmianyProfil(x => ({...x, email: e.target.value}) ) } />
                </div>
                <div>
                    <span>Steam:</span>
                    <input type="url" value={zmianyProfil.steam} onChange={(e) => setZmianyProfil(x => ({...x, steam: e.target.value}) ) } />
                </div>
            </div>
            <div className="administrowanieKol">
                <div>
                    <span>TruckBook:</span>
                    <input type="url" value={zmianyProfil.truckbook} onChange={(e) => setZmianyProfil(x => ({...x, truckbook: e.target.value}) ) } />
                </div>
                <div>
                    <span>TruckersMP:</span>
                    <input type="url" value={zmianyProfil.truckersmp} onChange={(e) => setZmianyProfil(x => ({...x, truckersmp: e.target.value}) ) } />
                </div>
                <div>
                    <span>World of Trucks:</span>
                    <input type="url" value={zmianyProfil.worldoftrucks} onChange={(e) => setZmianyProfil(x => ({...x, worldoftrucks: e.target.value}) ) } />
                </div>
                <div>
                    <span>Dostęp ATS:</span>
                    <select value={(zmianyProfil.dostepATS == true) ? "tak" : "nie"} onChange={(e) => setZmianyProfil({...zmianyProfil, dostepATS: e.target.value === "tak" ? true : false}) }>
                        <option value={"nie"}>NIE</option>
                        <option value={"tak"}>TAK</option>
                    </select>
                </div>
            </div>
            <div className="administrowanieOpcje">
                <button onClick={() => setZmianyProfil(null) }>Anuluj</button>
                <button onClick={() => setUsuwanie(true) }>Usuń konto</button>
                <button onClick={() => zaktualizujProfil(zmianyProfil.id)}>Zapisz zmiany</button>
            </div>
            { usuwanie &&
            <div className="potwierdzenieUsuwania wejscieSmooth">
                <span>Czy napewno chcesz usunąć konto <b>{zmianyProfil.login}</b>?</span>
                <div>
                    <button onClick={() => setUsuwanie(false) }>Anuluj</button>
					<button onClick={() => potwierdzenieUsuwania(zmianyProfil.id)}>Potwierdź</button>
                </div>
            </div>
            }
        </div>
    )
});

const RozpatrzUrlop = memo(({urlop, setSprawdzanyUrlop, setUrlopy, uzytkownicy}) => {
	const [ odrzuc, setOdrzuc ] = useState(false);

    if(uzytkownicy === undefined || !uzytkownicy.length) return;
    const kierowca = uzytkownicy.find(u => u.id === urlop.kto);
    if(kierowca === undefined) return;

	useEffect(() => {
		if(!urlop.id) return;
		setOdrzuc(false);
	}, [urlop.id])

    const wniosekDecyzja = useCallback(async (idwniosku, czyAkcept) => {
        if(czyAkcept) {
            await Axios.post(gb.backendIP+"urlopAkcept/"+localStorage.getItem('token'), {
                idwniosku: idwniosku
            }).then((r) => {
                if(r.data['blad']){
                    toast.error("Wystąpił błąd", { description: "Nie zatwierdzono urlopu. Powód: "+r.data['blad']})
                } else {
                    toast.success("Zatwierdzono urlop");
                    setSprawdzanyUrlop(undefined);
                }
            }).catch((er) => {
                toast.error("Wystąpił błąd", { description: "Nie zatwierdzono urlopu. Powód: "+er.message})
            });
        } else {
            await Axios.post(gb.backendIP+"urlopOdrzuc/"+localStorage.getItem('token'), {
                idwniosku: idwniosku
            }).then((r) => {
                if(r.data['blad']){
                    toast.error("Wystąpił błąd", { description: "Nie odrzucono urlopu. Powód: "+r.data['blad']})
                } else {
                    toast.success("Odrzucono urlop");
                    setSprawdzanyUrlop(undefined);
                }
            }).catch((er) => {
                toast.error("Wystąpił błąd", { description: "Nie odrzucono urlopu. Powód: "+er.message})
            });
        }
        setUrlopy({response: false, dane: null});
    }, [])

    return(
        <div className="administrowanieKonta wejscieSmooth">
            <div className="menadzerRozpatrzTytul"><span style={{color: 'crimson'}}>Rozpatrzenie Urlopu</span></div>
            <div className="administrowanieKol">
                <div>
                    <span>ID wniosku: <b>{urlop.id}</b></span>
                </div>
                <div>
                    <span>Wnioskujący:</span>
                    <input type="text" value={ kierowca.login } disabled/>
                </div>
                <div>
                    <span>Od kiedy:</span>
                    <input type="text" value={new Date(urlop.odkiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} disabled />
                </div>
                <div>
                    <span>Do kiedy:</span>
                    <input type="text" value={new Date(urlop.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} disabled />
                </div>
            </div>
            <div className="administrowanieKol">
                <div>
                    <span>Powód:</span><br />
                    <textarea style={{height: '210px', width: '500px'}} value={urlop.komentarz} disabled/>
                </div>
            </div>
            <div className="administrowanieOpcje">
                <button onClick={() => setSprawdzanyUrlop(undefined) }>Cofnij</button>
                <button onClick={() => setOdrzuc(true) }>Odrzuć</button>
                <button onClick={() => wniosekDecyzja(urlop.id, true)}>Zaakceptuj</button>
            </div>
            { (odrzuc === true) && <div className="potwierdzenieUsuwania wejscieSmooth">
                <span>Czy napewno chcesz odrzucić wniosek o Urlop?</span>
                <div className="space-x-2">
                    <Button onClick={() => setOdrzuc(false) }>Anuluj</Button>
                    <Button onClick={() => wniosekDecyzja(urlop.id, false)}>Odrzuć wniosek</Button>
                </div>
            </div> }
        </div>
    );
});

const RozpatrzPodwyzke = memo(({podwyzka, setPodwyzki, setSprawdzanaPodwyzka, uzytkownicy, stanowiska}) => {
	const [ historiaPodwyzek, setHistoriaPodwyzek ] = useState([]);
	const [ powod, setPowod ] = useState("");
	const [ odrzuc, setOdrzuc ] = useState(false);

    const wczytajHistoriePodwyzek = useCallback(async (idkierowcy) => {
        await Axios.get(gb.backendIP+"ostatnie3Podwyzki/"+idkierowcy).then((r) => {
            setHistoriaPodwyzek(r.data);
        }).catch((er) => {
            setHistoriaPodwyzek([]);
        })
    }, []);

	const kierowca = useMemo(() => uzytkownicy.find(u => u.id === podwyzka.ktozlozyl), [uzytkownicy, podwyzka.ktozlozyl]);
	if(kierowca === undefined) return;

	useEffect(() => {
		if(podwyzka.ktozlozyl !== undefined){
			wczytajHistoriePodwyzek(podwyzka.ktozlozyl);
			setOdrzuc(false);
			setPowod("");
		}
	}, [podwyzka, wczytajHistoriePodwyzek]);

	const wniosekDecyzja = useCallback(async (idwniosku, czyAkcept) => {
        if(czyAkcept) {
            await Axios.post(gb.backendIP+"podwyzkaAkcept/"+localStorage.getItem('token'), {
                idwniosku: idwniosku,
                idwnioskujacego: podwyzka.ktozlozyl,
                stawka: podwyzka.nowastawka,
                rangi: podwyzka.nowestanowisko
            }).then((r) => {
                if(r.data['blad']){
                    toast.error("Wystąpił błąd", { description: "Nie zatwierdzono podwyżki. Powód: "+r.data['blad']})
                } else {
                    toast.success("Zatwierdzono podwyżkę");
                    setSprawdzanaPodwyzka(undefined);
                }
            }).catch((er) => {
                toast.error("Wystąpił błąd", { description: "Nie zatwierdzono podwyżki. Powód: "+er.message})
            });
        } else {
            await Axios.post(gb.backendIP+"podwyzkaOdrzuc/"+localStorage.getItem('token'), {
                idwniosku: idwniosku,
                powod: powod
            }).then((r) => {
                if(r.data['blad']){
                    toast.error("Wystąpił błąd", { description: "Nie odrzucono podwyżki. Powód: "+r.data['blad']})
                } else {
                    toast.success("Odrzucono podwyżkę");
                    setSprawdzanaPodwyzka(undefined);
                }
            }).catch((er) => {
                toast.error("Wystąpił błąd", { description: "Nie odrzucono podwyżki. Powód: "+er.message})
            });
        }
        setHistoriaPodwyzek([]);
        setPodwyzki({response: false, dane: null});
    }, [powod, podwyzka.ktozlozyl, podwyzka.nowastawka, podwyzka.nowestanowisko]);

    const aktStanowisko = kierowca.stanowisko;
    const aktstanowiskoN = stanowiska[aktStanowisko] + " (" + aktStanowisko + ")";
    const nowestanowisko = stanowiska[podwyzka.nowestanowisko] + " (" + podwyzka.nowestanowisko + ")";

    return(
        <div className="administrowanieKonta flex-col wejscieSmooth">
            <div className="menadzerRozpatrzTytul"><span style={{color: 'goldenrod'}}>Rozpatrzenie Podwyżki</span></div>
            <div className="flex gap-5">
                <div className="administrowanieKol">
                    <div>
                        <span>ID wniosku: <b>{podwyzka.id}</b></span>
                    </div>
                    <div>
                        <span>Wnioskujący:</span>
                        <input type="text" value={kierowca.login} disabled/>
                    </div>
                    <div>
                        <span>Data złożenia:</span>
                        <input type="text" value={new Date(podwyzka.kiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} disabled />
                    </div>
                    <div>
                        <span>Aktualne stanowisko:</span>
                        <input type="text" value={aktstanowiskoN} disabled />
                    </div>
                    <div>
                        <span>Aktualna stawka:</span>
                        <input type="text" value={podwyzka.aktstawka.toFixed(2)+" zł/km"} disabled />
                    </div>
                </div>
                <div className="administrowanieKol">
                    <div>
                        <span>Wnioskowane stanowisko:</span>
                        <input type="text" value={nowestanowisko} disabled />
                    </div>
                    <div>
                        <span>Wnioskowana stawka:</span>
                        <input type="text" value={podwyzka.nowastawka.toFixed(2)+" zł/km"} disabled />
                    </div>
                    <div>
                        <span>Powód:</span><br />
                        <textarea value={podwyzka.powod} disabled/>
                    </div>
                </div>
            </div>
            <div className="flex flex-col py-2 px-4">
                <h3 className="text-center text-sm font-bold">Historia ostatnich podwyżek (max 3)</h3>
                { !historiaPodwyzek.length ? <p>Brak rekordów.</p>
                : <table className="mt-2 bg-card rounded-lg border-collapse text-center">
                    <thead>
                        <tr className="[&_th]:px-3 [&_th]:py-1"><th>ID</th><th>Kiedy</th><th>Akt. stanowisko</th><th>Nowe stanowisko</th><th>Akt. stawka</th><th>Nowa stawka</th><th>Decyzja</th></tr>
                    </thead>
                    <tbody>
                        {
                        historiaPodwyzek.map(wiersz => {
                            const stareStanowisko = stanowiska[wiersz.aktstanowisko] || "Nieznane";
                            const noweStanowisko = stanowiska[wiersz.nowestanowisko] || "Nieznane";
                            let decyzja;
                            let decyzjakolor = 'text-foreground';
                            switch(wiersz.wniosek){
                                case 1:
                                    decyzja = "Zaakceptowane";
                                    decyzjakolor = 'text-green-500';
                                    break;
                                case 0:
                                    decyzja = "Odrzucone";
                                    decyzjakolor = 'text-red-400';
                                    break;
                                default:
                                    decyzja = "Nieznane";
                                    break;
                            }
                            return <tr key={`historiaPodwyzek_${wiersz.id}`} className="[&_td]:py-2 [&_td]:px-3 text-sm">
                                <td>#{wiersz.id}</td>
                                <td>{ new Date(wiersz.kiedy).toLocaleString("pl-PL", { day: "numeric", month: "short", year: "numeric" }) }</td>
                                <td>{ `${stareStanowisko} (${wiersz.aktstanowisko})` }</td>
                                <td>{ `${noweStanowisko} (${wiersz.nowestanowisko})` }</td>
                                <td>{ wiersz.aktstawka.toFixed(2) } zł / km</td>
                                <td>{ wiersz.nowastawka.toFixed(2) } zł / km</td>
                            	<td className={decyzjakolor}>{ decyzja }</td>
                            </tr>
                        })
                        }
                    </tbody>
                </table>
                }
            </div>
            <div className="administrowanieOpcje">
                <button onClick={() => setSprawdzanaPodwyzka(undefined) }>Cofnij</button>
                <button onClick={() => setOdrzuc(true) }>Odrzuć</button>
                <button onClick={() => wniosekDecyzja(podwyzka.id, true)}>Zaakceptuj</button>
            </div>
            {odrzuc && <div className="potwierdzenieUsuwania wejscieSmooth">
                <span>Podaj powód odrzucenia wniosku.</span>
                <textarea value={powod ?? ""} onChange={(e) => setPowod(e.target.value) } />
                <div className="flex gap-5 ">
                    <button
						className="bg-green-500 text-foreground rounded-md px-3 py-2 transition-all cursor-pointer font-bold"
						onClick={() => setOdrzuc(false) }
					>Anuluj</button>
                    <button
						className="bg-destructive px-3 py-2 text-foreground rounded-md transition-all cursor-pointer font-bold"
						onClick={() => wniosekDecyzja(podwyzka.id, false)}
					>Odrzuć wniosek</button>
                </div>
            </div>
            }
        </div>
    );
});