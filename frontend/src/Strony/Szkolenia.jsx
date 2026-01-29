import { Button } from "@/components/ui/button";
import Nawigacja from "@/Komponenty/Nawigacja";
import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import gb from "../GlobalVars";
import { useNavigate } from "react-router";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import Axios from "axios";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { pl } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar";
import { IoMdAddCircle, IoMdRemoveCircle } from "react-icons/io";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Szkolenia = (props) => {
    let changeNav = useNavigate();  
	const { toast } = useToast();
    const [ zakladka, setZakladka ] = useState("moje");
	const [noweZgloszenie, setNoweZgloszenie] = useState({
		dataRozpoczecia: null,
		uprawnienia: [],
		czyZnizka: false,
		dataPrzypuszczalna: null,
		otwarte: false,
		zatwierdz: false,
	});
    const [ dodawaneUprawnienie, setDodawaneUprawnienie ] = useState({gra: undefined, typ: undefined, uprawnienie: undefined, termin: undefined, dodaj: false});
	const [ dostepneTypySzkolen, setDostepneTypySzkolen ] = useState({
		wczytane: false,
		zawartosc: []
	});
	const [historiaSzkolen, setHistoriaSzkolen] = useState({
		sprawdzone: false,
		blad: undefined,
		zawartosc: [],
	});
    const [ listaUzytkownikow, setListaUzytkownikow ] = useState({wczytane: false, zawartosc: []});
    const [ dostepInstruktora, setDostepInstruktora ] = useState({sprawdzone: false, dostep: false, zgloszenia: []});
    const [ liczbaOczko, setLiczbaOczko ] = useState({liczba: 0, sprawdzone: false});

    const [paginacjaHistoria, setPaginacjaHistoria] = useState(1);
    const [paginacjaInstruktor, setPaginacjaInstruktor] = useState(1);
    const liczbaElementow = 8;
    const dostepnaPaginacja = Math.ceil(historiaSzkolen.zawartosc.length / liczbaElementow);
    const dostepnaPaginacjaInstruktor = Math.ceil(dostepInstruktora.zgloszenia.length / liczbaElementow);
    const historiaSzkolenPaginacja = historiaSzkolen.zawartosc.slice( (paginacjaHistoria - 1) * liczbaElementow, paginacjaHistoria * liczbaElementow );
    const instruktorZawartoscPaginacja = dostepInstruktora.zgloszenia.slice( (paginacjaInstruktor - 1) * liczbaElementow, paginacjaInstruktor * liczbaElementow );


	const wczytajZgloszenia = async () => {
		await Axios.post(
			gb.backendIP +
				"szkolenia/" +
				localStorage.getItem("token") +
				"/historia"
		)
			.then((r) => {
				if (r.data["blad"]) {
					console.log(r.data.blad);
					toast({
						title: "Historia szkoleń",
						variant: "destructive",
						description:
							"Wystąpił błąd podczas wczytywania historii szkoleń. Powód: " +
							r.data["blad"],
					});
					setHistoriaSzkolen({
						sprawdzone: true,
						zawartosc: [],
						blad: "Powód: " + r.data["blad"],
					});
					return;
				}
				setHistoriaSzkolen({
					sprawdzone: true,
					zawartosc: r.data.odp,
					blad: undefined,
				});
			})
			.catch((er) => {
				console.log(er);
				toast({
					title: "Historia szkoleń",
					variant: "destructive",
					description:
						"Wystąpił błąd podczas wczytywania historii szkoleń. Powód: " +
						er.message,
				});
				setHistoriaSzkolen({
					sprawdzone: true,
					zawartosc: [],
					blad: "Powód: " + er.message,
				});
			});
	};

	const wczytajDostepneSzkolenia = async () => {
		// await Axios.get(gb.backendIP+"dostepneTypySzkolen")
        await Axios.post(gb.backendIP+"uprawnienia")
		.then((r) => {
			// if(!r.data['odp']){
            //     toast({
			// 		title: "Dostępne typy szkoleń",
			// 		variant: "destructive",
			// 		description:
			// 			"Wystąpił błąd podczas wczytywania dostępnych typów szkoleń. Powód: " +
			// 			r.data["blad"] || "Nieznane",
			// 	});
			// 	setDostepneTypySzkolen({wczytane: true, zawartosc: []});
			// 	return;
			// }
			setDostepneTypySzkolen({wczytane: true, zawartosc: r.data});
		}).catch((er) => {
			console.log("blad wczytywania dostepnych typow szkolen");
            toast({
				title: "Dostępne typy szkoleń",
				variant: "destructive",
				description:
					"Wystąpił błąd podczas wczytywania dostępnych typów szkoleń. Powód: " +
					er.message,
			});
			setDostepneTypySzkolen({wczytane: true, zawartosc: []});
		})
	};

    const wczytajUzytkownikow = async () => {
		await Axios.post(gb.backendIP+"listaUzytkownikow")
		.then((r) => {
			if(r.data['blad']){
                toast({
					title: "Lista użytkowników",
					variant: "destructive",
					description:
						"Wystąpił błąd podczas wczytywania listy użytkowników. Powód: " +
						r.data["blad"] || "Nieznane",
				});
				setListaUzytkownikow({wczytane: true, zawartosc: []});
				return;
			}
			setListaUzytkownikow({wczytane: true, zawartosc: r.data});
		}).catch((er) => {
            toast({
				title: "Lista użytkowników",
				variant: "destructive",
				description:
					"Wystąpił błąd podczas wczytywania listy użytkowników. Powód: " +
					er.message,
			});
			setListaUzytkownikow({wczytane: true, zawartosc: []});
		})
	};

    const dodajListaUprawnien = () => {
        if(!(dodawaneUprawnienie.gra === 0 || dodawaneUprawnienie.gra === 1)){
            toast({
				title: "Lista uprawnień",
				variant: "destructive",
				description:
					"Niewybrana gra w dodawanym uprawnieniu.",
			});
            setDodawaneUprawnienie((x) => ({...x, dodaj: false}));
            return;
        }
        if(!dodawaneUprawnienie.typ){
            toast({
				title: "Lista uprawnień",
				variant: "destructive",
				description: "Niewybrany typ uprawnienia.",
			});
            setDodawaneUprawnienie((x) => ({...x, dodaj: false}));
            return;
        }
        if(!dodawaneUprawnienie.uprawnienie){
            toast({
				title: "Lista uprawnień",
				variant: "destructive",
				description: "Niewybrane uprawnienie.",
			});
            setDodawaneUprawnienie((x) => ({...x, dodaj: false}));
            return;
        }
        if(!dodawaneUprawnienie.termin){
            toast({
				title: "Lista uprawnień",
				variant: "destructive",
				description: "Niewybrany termin dodawanego uprawnienia.",
			});
            setDodawaneUprawnienie((x) => ({...x, dodaj: false}));
            return;
        }
        setNoweZgloszenie((nw) => ({...nw, uprawnienia: [...noweZgloszenie.uprawnienia, {gra: dodawaneUprawnienie.gra, typ: dodawaneUprawnienie.typ, uprawnienie: dodawaneUprawnienie.uprawnienie, termin: dodawaneUprawnienie.termin}] }));
        setDodawaneUprawnienie({gra: undefined, uprawnienie: undefined, typ: undefined, termin: undefined, dodaj: false});
    };

    const utworzZgloszenie = async () => {
        if(!noweZgloszenie.uprawnienia.length){
            toast({
                title: "Brak wybranych uprawnień",
                variant: "destructive",
                description: "Lista uprawnień jest pusta. Upewnij się co do poprawności wybranych wartości uprawnienia i czy zostało ono dodane do listy."
            });
            setNoweZgloszenie((nw) => ({...nw, zatwierdz: false}));
            return;
        }
        await Axios.post(gb.backendIP+"szkolenia/"+localStorage.getItem("token")+"/noweZgloszenie", {
            listaUprawnien: noweZgloszenie.uprawnienia.map((upr) => ({...upr, termin: new Date(upr.termin).toISOString()})),
            dataPrzypuszczalna: noweZgloszenie.dataPrzypuszczalna ? new Date(noweZgloszenie.dataPrzypuszczalna).toISOString() : null,
            czyZnizka: noweZgloszenie.czyZnizka
        }).then((r) => {
            if(r.data['blad']){
                console.log("Wystapil blad podczas tworzenia nowego zgloszenia szkolenia");
                toast({
                    title: "Błąd tworzenia ticketu",
                    variant: "destructive",
                    description: "Wystąpił błąd podczas tworzenia nowego zgłoszenia szkolenia. Powód: "+r.data['blad']
                });
                setNoweZgloszenie((nw) => ({...nw, zatwierdz: false}));
                return;
            }
            toast({
                title: "Zgłoszenie utworzone",
                variant: "success",
                description: "Pomyślnie utworzono nowe zgłoszenie szkolenia w systemie o numerze #"+r.data.odp+". Oczekuj na przejęcie zgłoszenia przez Instruktora."
            })
            setNoweZgloszenie({
                dataRozpoczecia: null,
                uprawnienia: [],
                czyZnizka: false,
                dataPrzypuszczalna: null,
                otwarte: false,
                zatwierdz: false,
            });
            setHistoriaSzkolen({ sprawdzone: false, zawartosc: []});
        }).catch((er) => {
            console.log("Wystapil blad podczas tworzenia nowego zgloszenia szkolenia", er);
            toast({
                title: "Błąd tworzenia ticketu",
                variant: "destructive",
                description: "Wystąpił błąd podczas tworzenia nowego zgłoszenia szkolenia. Powód: "+er.message
            });
            setNoweZgloszenie((nw) => ({...nw, zatwierdz: false}));
        });
    };

    const sprawdzRoleInstruktora = async () => {
        console.log("spr role instruktor");
        await Axios.post(gb.backendIP+"szkolenia/"+localStorage.getItem("token")+"/instruktor")
        .then((r) => {
            if(r.data['blad']){
                setDostepInstruktora({sprawdzone: true, dostep: false, zgloszenia: []});
                return;
            } else {
                setDostepInstruktora({sprawdzone: true, dostep: true, zgloszenia: r.data.odp});
                return;
            }
        }).catch((er) => {
            console.log(er);
            toast({
                title: "Bład sprawdzenia uprawnień",
                variant: "destructive",
                description: "Wystąpił błąd sieciowy podczas sprawdzenia posiadania roli Instruktora.",
            });
            setDostepInstruktora({sprawdzone: true, dostep: false, zgloszenia: []});
            return;
        });
    };

    const wczytajLiczbeOczko = useCallback(async () => {
        await Axios.post(gb.backendIP+"szkoleniaOczekujace/"+localStorage.getItem("token")).then((r) => {
			if(r.data['liczba']) setLiczbaOczko({sprawdzone: true, liczba: r.data['liczba']});
			else setLiczbaOczko({sprawdzone: true, liczba: 0});
		}).catch((er) => {
			setLiczbaOczko({sprawdzone: true, liczba: 0});
		});
    }, []);

	useEffect(() => {
        if(!listaUzytkownikow.wczytane) wczytajUzytkownikow();
        if(!dostepneTypySzkolen.wczytane) wczytajDostepneSzkolenia();
		if(!historiaSzkolen.sprawdzone) wczytajZgloszenia();
        if(!dostepInstruktora.sprawdzone) sprawdzRoleInstruktora();
	}, [historiaSzkolen, dostepneTypySzkolen, listaUzytkownikow, dostepInstruktora]);

    useEffect(() => {
        if(!dostepInstruktora.dostep) return;
        if(liczbaOczko.sprawdzone) return;
        wczytajLiczbeOczko();
    }, [dostepInstruktora.dostep, liczbaOczko.sprawdzone, wczytajLiczbeOczko])

    useEffect(() => {
        if(dodawaneUprawnienie.dodaj) dodajListaUprawnien();
        if(noweZgloszenie.zatwierdz) utworzZgloszenie();
    }, [dodawaneUprawnienie.dodaj, noweZgloszenie.zatwierdz]);

	// useEffect(() => {
	// 	if(noweZgloszenie.zatwierdz) console.log("Wyslij");
	// }, [noweZgloszenie]);

	const wyswietlFormularzZgloszenia = () => {
		return (
			<Dialog open={noweZgloszenie.otwarte} onOpenChange={(e) => { setNoweZgloszenie((prev) => ({...prev, otwarte: e})) }}>
				<DialogContent className="max-w-7xl! w-fit bg-card overflow-hidden">
					<DialogHeader>
						<DialogTitle>Nowe zgłoszenie szkoleniowe</DialogTitle>
						<DialogDescription>
							Wypełnij niezbędne informacje w formularzu.
						</DialogDescription>
					</DialogHeader>
                    <div className="flex gap-5 mb-5">
                        <div className="space-y-1.5 w-185">
                            <Label>Lista uprawnień (Wybranych: {noweZgloszenie.uprawnienia.length})</Label>
                            { noweZgloszenie.uprawnienia.length
                                ? 
                                <div className="flex w-full space-y-1.5 flex-col">
                                    { noweZgloszenie.uprawnienia.map((dodane, index) => {
                                    return(<div key={"dodaneUpr"+dodane.uprawnienie} className="inline-flex w-full">
                                        <div className="w-21 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{dodane.gra ? "ATS" : "ETS2"}</div>
                                        <div className="w-30 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{dodane.typ}</div>
                                        <div className="w-76.25 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{dostepneTypySzkolen.zawartosc.find(zn => zn.id == dodane.uprawnienie).nazwa}</div>
                                        <div className="w-45.75 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{new Date(dodane.termin).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                                        <Button className="bg-transparent hover:bg-transparent text-white hover:text-red-400 p-0 rounded-none" onClick={() => {
                                            setNoweZgloszenie((nw) => ({
                                                ...nw,
                                                uprawnienia: noweZgloszenie.uprawnienia.filter((xx,xi) => xi !== index)
                                            }))
                                        }}><IoMdRemoveCircle className="scale-140"/></Button>
                                    </div>)
                                    }) }
                                </div>
                            : "" }
                            <div className="inline-flex w-full mt-3">
                                <Select value={dodawaneUprawnienie.gra ?? ""} onValueChange={ (e) => setDodawaneUprawnienie( (up) => ({...up, gra: e, uprawnienie: undefined, termin: undefined}) ) }>
                                    <SelectTrigger className="rounded-none w-21">
                                        <SelectValue placeholder="Gra" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={0}>ETS2</SelectItem>
                                        <SelectItem value={1}>ATS</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={dodawaneUprawnienie.typ ?? ""} onValueChange={ (e) => setDodawaneUprawnienie( (up) => ({...up, typ: e, uprawnienie: undefined, termin: undefined}) ) } disabled={dodawaneUprawnienie.gra === undefined}>
                                    <SelectTrigger className="rounded-none w-30">
                                        <SelectValue placeholder="Rodzaj" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={"Szkolenie"}>Szkolenie</SelectItem>
                                        <SelectItem value={"Licencja"}>Licencja</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={dodawaneUprawnienie.uprawnienie || ""} onValueChange={(e) => setDodawaneUprawnienie((up) => ({...up, uprawnienie: e}))} disabled={dodawaneUprawnienie.typ === undefined}>
                                    <SelectTrigger className="rounded-none w-76.25">
                                        <SelectValue placeholder="Wybierz uprawnienie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            dostepneTypySzkolen.zawartosc.map((ds) => {
                                                if(noweZgloszenie.uprawnienia.find(nw => nw.uprawnienie == ds.id)) return;
                                                if(dodawaneUprawnienie.gra != ds.gra) return;
                                                if(dodawaneUprawnienie.typ != ds.rodzaj) return;
                                                return <SelectItem key={"upr_"+ds.id} value={ds.id}>{ds.nazwa}</SelectItem>;
                                            })
                                        }
                                    </SelectContent>
                                </Select>
                                <Popover>
                                    <PopoverTrigger className="w-45.75" disabled={!dodawaneUprawnienie.uprawnienie}>
                                        <Button variant="outline" className="rounded-none w-full" disabled={!dodawaneUprawnienie.uprawnienie}>
                                            {dodawaneUprawnienie.termin ? new Date(dodawaneUprawnienie.termin).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' }) : "Wybierz ważność"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-fit">
                                        <Calendar
                                            showYearSwitcher={false}
                                            defaultMonth={dodawaneUprawnienie.termin ? new Date(dodawaneUprawnienie.termin) : new Date()}
                                            timeZone="Europe/Warsaw"
                                            mode="single"
                                            locale={pl}
                                            selected={new Date(dodawaneUprawnienie.termin) || undefined} onSelect={(e) => {
                                                let tmp = new Date(e);
                                                tmp.setHours(23, 59, 59, 975);
                                                setDodawaneUprawnienie((z) => ({...z, termin: tmp}) )
										    }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button className="bg-transparent hover:bg-transparent text-white hover:text-green-400 p-0 rounded-none" onClick={() => setDodawaneUprawnienie((dod) => ({...dod, dodaj: true}))}><IoMdAddCircle className="scale-140"/></Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 min-w-sm h-fit">
                            <div className="space-y-1.5">
                                <Label>Kierowca</Label>
                                <Link to={"/profil/"+localStorage.getItem("login")}>
                                    <img className="inline rounded-md align-middle mr-3 w-8.75 h-8.75" src={ localStorage.getItem("awatar")} /> 
                                    { localStorage.getItem("login") }
                                </Link>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Czy chcesz użyć zniżki?</Label>
                                <div className="inline-flex gap-2">
                                    <Checkbox className="cursor-pointer" id="checkboxZnizka" />
                                    <Label className="cursor-pointer" htmlFor="checkboxZnizka"> Użycie zniżki</Label>
                                </div>
                            </div>
                            <div className="space-y-1.5 col-span-2" title="(Opcjonalne) Termin, w którym odpowiada Tobie wykonanie szkolenia.">
                                <Label>Przybliżony termin szkolenia (opcjonalne)</Label>
                                <Popover>
                                    <PopoverTrigger className="w-fit">
                                        <Button variant="outline">
                                            {noweZgloszenie.dataPrzypuszczalna ? new Date(noweZgloszenie.dataPrzypuszczalna).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' }) : "Wybierz odpowiadający Tobie termin"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-fit">
                                        <Calendar
                                            showYearSwitcher={false}
                                            defaultMonth={noweZgloszenie.dataPrzypuszczalna ? new Date(noweZgloszenie.dataPrzypuszczalna) : new Date()}
                                            timeZone="Europe/Warsaw"
                                            mode="single"
                                            locale={pl}
                                            selected={new Date(noweZgloszenie.dataPrzypuszczalna) || undefined} onSelect={(e) => {
                                                let tmp = new Date(e);
                                                tmp.setHours(23, 59, 59, 975);
                                                setNoweZgloszenie((z) => ({...z, dataPrzypuszczalna: tmp}) )
										    }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
					<DialogFooter>
						<DialogClose asChild><Button className="bg-input/50 border text-zinc-50 hover:bg-red-400/80 transition-colors duration-300">Anuluj</Button></DialogClose>
						<Button
                            className="hover:bg-green-400 transition-colors duration-300"
                            onClick={() => setNoweZgloszenie((nw) => ({...nw, zatwierdz: true})) }
                            disabled={noweZgloszenie.zatwierdz}
                        >Utwórz zgłoszenie</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	};

	return (
		<>
			<Nawigacja />
			<Toaster richColors />
			<div className="tlo" />
			<div className="srodekekranu">
                <Tabs value={zakladka} onValueChange={setZakladka} className="max-w-4xl w-full">
                    { dostepInstruktora.dostep ?
                    <TabsList>
                        <TabsTrigger value="moje">Moje zgłoszenia</TabsTrigger>
                        <TabsTrigger value="instruktor" className="relative">
                            Dostęp instruktora
                            { ( liczbaOczko.liczba > 0 ) && <div className="absolute bg-[crimson] rounded-2xl right-1 bottom-full
							text-[0.8rem] w-5 h-5 leading-5 text-center text-white
							translate-2.5 animate-[menuBlink_0.5s]">{liczbaOczko.liczba}</div> }
                        </TabsTrigger>
                    </TabsList>
                    : "" }
                    <TabsContent value="moje">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historia szkoleń</CardTitle>
                                <CardDescription>
                                    Znajdziesz tutaj Twoje zgłoszenia dotyczące szkoleń
                                    oraz możliwość utworzenia nowego.
                                </CardDescription>
                                <CardAction>
                                    <Button
                                        onClick={() =>
                                            setNoweZgloszenie({
                                                dataRozpoczecia: null,
                                                uprawnienia: [],
                                                czyZnizka: false,
                                                dataPrzypuszczalna: null,
                                                otwarte: true,
                                                zatwierdz: false,
                                            })
                                        }
                                    >
                                        Utwórz zgłoszenie
                                    </Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                {historiaSzkolen.blad ? (
                                    <div className="w-full mt-6 text-center text-red-300">
                                        <p>
                                            Wystąpił błąd podczas wczytywania historii
                                            szkoleń.
                                        </p>
                                        <p>{historiaSzkolen.blad}</p>
                                        <Button
                                            variant="link"
                                            onClick={() => wczytajZgloszenia()}
                                        >
                                            Ponów próbę
                                        </Button>
                                    </div>
                                ) : historiaSzkolen.sprawdzone ? (
                                    historiaSzkolen.zawartosc.length ? (
                                        <Table className="w-full overflow-hidden">
                                                    <TableHeader>
                                                        <TableRow className="dark:bg-zinc-800">
                                                            <TableHead>UID</TableHead>
                                                            <TableHead>Data utworzenia</TableHead>
                                                            <TableHead>Instruktor</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {
                                                            historiaSzkolenPaginacja.map((x) => {
                                                                const instruktor = listaUzytkownikow.zawartosc.find(u => u.id === x.instruktor);
                                                                return(<TableRow key={"ticket_"+x.id}>
                                                                    <TableCell>#{x.id.toString()}</TableCell>
                                                                    <TableCell>{new Date(x.dataRozpoczecia).toLocaleString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(x.dataRozpoczecia).toLocaleString('pl-PL', {hour: "2-digit", minute: "2-digit"})}</TableCell>
                                                                    <TableCell>
                                                                        { instruktor
                                                                        ? <Link to={"/profil/"+instruktor.login}>
                                                                            <img className="inline rounded-md align-middle mr-3 w-8.75 h-8.75" src={"/img/" + instruktor.awatar} /> 
                                                                            { instruktor.login }
                                                                            </Link>
                                                                        : x.instruktor ? <span className="text-muted-foreground">Usunięte konto</span> : <span className="text-muted-foreground">Brak</span>
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell><Badge className={x.status === 0 ? "bg-amber-300 text-amber-800" : x.status === 2 ? "bg-green-300 text-green-800" : "bg-red-300 text-red-800"}>{x.status === 0 ? "Oczekujące" : x.status === 2 ? "Zakończone" : "W trakcie"}</Badge></TableCell>
                                                                    <TableCell className="w-fit text-right"><Button variant="link" onClick={() => changeNav("/szkolenie/"+x.id)}>Szczegóły</Button></TableCell>
                                                                </TableRow>)
                                                            })
                                                        }
                                                    </TableBody>
                                                    <TableFooter>
                                                        <TableRow>
                                                            <TableCell colSpan={5}>
                                                                <div className="flex justify-between gap-2 items-center select-none">
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
                                                                        onClick={() => setPaginacjaHistoria((p) => Math.max(p - 1, 1))}
                                                                        disabled={paginacjaHistoria === 1}
                                                                    >Poprzednia</Button>
                                                                    Strona {paginacjaHistoria} z {dostepnaPaginacja}
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
                                                                        onClick={() => setPaginacjaHistoria((p) => Math.min(p + 1, dostepnaPaginacja))}
                                                                        disabled={paginacjaHistoria === dostepnaPaginacja}
                                                                    >Następna</Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableFooter>
                                                </Table>
                                    ) : (
                                        <div className="w-full my-3 text-center text-sm tracking-widest">
                                            Brak historii szkoleń
                                        </div>
                                    )
                                ) : (
                                    <div className="w-full my-3 text-center text-sm tracking-widest">
                                        Trwa wczytywanie historii...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    { dostepInstruktora.dostep ?
                    <TabsContent value="instruktor">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dostępne zgłoszenia</CardTitle>
                                <CardDescription>
                                    Zgłoszenia szkoleń innych kierowców oczekujących na Instruktora oraz zgłoszenia przejęte przez Ciebie.
                                </CardDescription>
                                <CardAction>
                                    <Button disabled={!dostepInstruktora.sprawdzone} onClick={() => {
                                        setDostepInstruktora({sprawdzone: false, dostep: true, zgloszenia: []})
                                        setLiczbaOczko({sprawdzone: false, liczba: 0});
                                    }}>Odśwież</Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                { dostepInstruktora.zgloszenia.length ?
                                <Table className="w-full overflow-hidden">
                                     <TableHeader>
                                        <TableRow className="dark:bg-zinc-800">
                                            <TableHead>UID</TableHead>
                                            <TableHead>Data utworzenia</TableHead>
                                            <TableHead>Kierowca</TableHead>
                                            <TableHead>Instruktor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {
                                            instruktorZawartoscPaginacja.map((x) => {
                                                const kierowca = listaUzytkownikow.zawartosc.find(u => u.id === x.kierowca);
                                                const instruktor = listaUzytkownikow.zawartosc.find(u => u.id === x.instruktor);
                                                return(<TableRow key={"ticket_"+x.id}>
                                                    <TableCell>#{x.id.toString()}</TableCell>
                                                    <TableCell>{new Date(x.dataRozpoczecia).toLocaleString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(x.dataRozpoczecia).toLocaleString('pl-PL', {hour: "2-digit", minute: "2-digit"})}</TableCell>
                                                    <TableCell>{ kierowca
                                                        ? <Link to={"/profil/"+kierowca.login}>
                                                            <img className="inline rounded-md align-middle mr-3 w-8.75 h-8.75" src={"/img/" + kierowca.awatar} /> 
                                                            { kierowca.login }
                                                        </Link>
                                                        : x.kierowca ? <span className="text-muted-foreground">Usunięte konto</span> : <span className="text-muted-foreground">Brak</span>
                                                    } </TableCell>
                                                    <TableCell>{ instruktor
                                                        ? <Link to={"/profil/"+instruktor.login}>
                                                            <img className="inline rounded-md align-middle mr-3 w-8.75 h-8.75" src={"/img/" + instruktor.awatar} /> 
                                                            { instruktor.login }
                                                        </Link>
                                                        : x.instruktor ? <span className="text-muted-foreground">Usunięte konto</span> : <span className="text-muted-foreground">Brak</span>
                                                    } </TableCell>
                                                    <TableCell><Badge className={x.status === 0 ? "bg-amber-300 text-amber-800" : x.status === 2 ? "bg-green-300 text-green-800" : "bg-red-300 text-red-800"}>{x.status === 0 ? "Oczekujące" : x.status === 2 ? "Zakończone" : "W trakcie"}</Badge></TableCell>
                                                    <TableCell className="w-fit text-right"><Button variant="link" onClick={() => changeNav("/szkolenie/"+x.id)}>Szczegóły</Button></TableCell>
                                                </TableRow>)
                                            })
                                        }
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <div className="flex justify-between gap-2 items-center select-none">
                                                    <Button
                                                        variant={"outline"}
                                                        className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
                                                        onClick={() => setPaginacjaInstruktor((p) => Math.max(p - 1, 1))}
                                                        disabled={paginacjaInstruktor === 1}
                                                    >Poprzednia</Button>
                                                    Strona {paginacjaInstruktor} z {dostepnaPaginacjaInstruktor}
                                                    <Button
                                                        variant={"outline"}
                                                        className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
                                                        onClick={() => setPaginacjaInstruktor((p) => Math.min(p + 1, dostepnaPaginacjaInstruktor))}
                                                        disabled={paginacjaInstruktor === dostepnaPaginacjaInstruktor}
                                                    >Następna</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                                : <div className="w-full my-3 text-center text-sm tracking-widest">Brak dostępnych zgłoszeń szkoleń</div>
                                }
                            </CardContent>
                        </Card>
                    </TabsContent>
                    : ""}
                </Tabs>
			</div>
    		{noweZgloszenie.otwarte ? wyswietlFormularzZgloszenia() : ""}
		</>
	);
};

export default Szkolenia;
