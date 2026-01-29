import Nawigacja from "../Komponenty/Nawigacja";
import { useEffect, useMemo, useState, useCallback, memo, useRef } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FaExpand, FaUserClock, FaTrash } from "react-icons/fa";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar";
import { pl } from "react-day-picker/locale";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, ChevronDownIcon } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea";

const WIERSZE_PER_STRONA = 10;
const NoweTrasy = () => {
	const [ dostepATS, setDostepATS ] = useState(undefined);
	const [ zaladowanePromy, setZaladowanePromy ] = useState(false);
	const [ promy, setPromy ] = useState([]);

	const [ zaladowaneNaczepy, setZaladowaneNaczepy ] = useState(false);
	const [ naczepy, setNaczepy ] = useState([]);

	const [ zaladowaneMiasta, setZaladowaneMiasta ] = useState(false);
	const [ miasta, setMiasta ] = useState([]);
	const miastaPerWybor = useMemo(() => {
		// użycie: miastaPerWybor.get(gra).get(kraj);
		const map = new Map();
		const miastaETS = miasta.filter(x => x.gra !== 1);
		const panstwaETS = [...new Set(miastaETS.map(x => x.kraj))];
		const miastaATS = miasta.filter(x => x.gra === 1);
		const panstwaATS = [...new Set(miastaATS.map(x => x.kraj))];
		const rozbicieETS = new Map();
		for(const kraj of panstwaETS){
			rozbicieETS.set(
				kraj,
				miastaETS.filter(x => x.kraj === kraj).sort((a, b) => a.miasto.toLowerCase() < b.miasto.toLowerCase() )
			)
		}
		map.set(0, rozbicieETS);
		const rozbicieATS = new Map();
		for(const kraj of panstwaATS){
			rozbicieATS.set(
				kraj,
				miastaATS.filter(x => x.kraj === kraj).sort((a, b) => a.miasto.toLowerCase() < b.miasto.toLowerCase() )
			)
		}
		map.set(0, rozbicieETS);
		map.set(1, rozbicieATS);
		return map;
	}, [miasta])

	const [ zaladowaneTrasy, setZaladowaneTrasy ] = useState(false);
	const [ ostatnieTrasy, setOstatnieTrasy ] = useState([]);
	
	const [ zaladowaneUrlopy, setZaladowaneUrlopy ] = useState(false);
	const [ urlopy, setUrlopy ] = useState([]);
	
	const [ przetwarzanie, setPrzetwarzanie ] = useState(false);
	const [ daneTrasy, setDaneTrasy ] = useState({ gra: undefined });
	const [ otwartyModal, setOtwartyModal ] = useState(false);
	const [ podglad, setPodglad ] = useState(undefined);
	const blockToast = useRef(false);
	
	const [ paginacjaStrona, setPaginacjaStrona ] = useState(1);
	const dostepneStrony = useMemo(() => {
		if(!ostatnieTrasy.length) return 0;
		return Math.max(1, Math.ceil(ostatnieTrasy.length / WIERSZE_PER_STRONA));
	}, [ ostatnieTrasy.length ]);

	const paginacjaTrasy = useMemo(() => {
		if(!ostatnieTrasy.length) return [];
		return [...ostatnieTrasy].slice((paginacjaStrona - 1) * WIERSZE_PER_STRONA, paginacjaStrona * WIERSZE_PER_STRONA);
	}, [ostatnieTrasy, paginacjaStrona]);

	// paginacja fix
	useEffect(() => {
		if(!dostepneStrony && paginacjaStrona) {
			setPaginacjaStrona(0);
			return;
		}
		if(dostepneStrony && paginacjaStrona < 1) setPaginacjaStrona(1);
		if(paginacjaStrona > dostepneStrony) setPaginacjaStrona(dostepneStrony);
	}, [paginacjaStrona, dostepneStrony]);

	const sprawdzDostepATS = useCallback(async () => {
		await Axios.get(gb.backendIP+"dostepATS/"+localStorage.getItem("login")).then((res) => {
			if(!res.data['dostep']){
				setDostepATS(false);
			} else {
				setDostepATS(true);
			}
		}).catch((er) => {
			setDostepATS(true);
		});
	}, []);

	useEffect(() => {
		if(dostepATS === undefined) sprawdzDostepATS();
	}, [dostepATS]);

	const wczytajTrasy = useCallback(async () => {
		await Axios.post(gb.backendIP+"ostatnieTrasy/"+localStorage.getItem('token')).then((res) => {
			if(res.data['dane']){
				setOstatnieTrasy(res.data['dane']);
				!blockToast.current && toast.success("Wczytano historię tras", {
					duration: 3_000,
                	description: "Pomyślnie załadowano historię Twoich raportów z tras."
				});
			} else {
				setOstatnieTrasy([]);
				toast.error("Błąd historii tras", {
					duration: 8_000,
					description: "Wystąpił błąd podczas wczytywania histori tras. Powód: "+(res.data['blad'] ?? "Nieznany")
				});
			}
		}).catch((er) => {
			setOstatnieTrasy([]);
			toast.error("Błąd historii tras", {
				duration: 8_000,
                description: "Wystąpił błąd podczas wczytywania histori tras. "+er.message
			});
		}).finally(() => { setZaladowaneTrasy(true) });
		blockToast.current = false;
	}, [toast]);

	const wczytajMiasta = useCallback(async () => {
		await Axios.post(gb.backendIP+"miasta").then((r) => {
			if(r.data['dane']){
				setMiasta(r.data['dane']);
			} else {
				setMiasta([]);
				toast.error("Błąd wczytywania", {
					duration: 8_000,
					description: "Wystąpił błąd podczas wczytywania miejscowości. Powód: "+(r.data['blad'] ?? "Nieznany")
				});
			}
		}).catch((er) => {
			setMiasta([]);
			toast.error("Błąd wczytywania", {
				duration: 8_000,
				description: "Wystąpił błąd podczas wczytywania miejscowości. Powód: "+er.message
			});
		}).finally(() => setZaladowaneMiasta(true));
	}, [toast]);

	const wczytajPromy = useCallback(async () => {
		await Axios.post(gb.backendIP+"promy").then((r) => {
			if(r.data['dane']){
				setPromy(r.data['dane'].sort((a, b) => a.nazwa.localeCompare(b.nazwa)));
			} else {
				setPromy([]);
				toast.error("Błąd wczytywania", {
					duration: 8_000,
					description: "Wystąpił błąd podczas wczytywania promów i pociągów. Powód: "+(r.data['blad'] ?? "Nieznany")
				});
			}
		}).catch((er) => {
			setPromy([]);
			toast.error("Błąd wczytywania", {
				duration: 8_000,
				description: "Wystąpił błąd podczas wczytywania promów i pociągów. Powód: "+er.message
			});
		}).finally(() => setZaladowanePromy(true));
	}, [toast]);

	const wczytajNaczepy = useCallback(async () => {
		await Axios.post(gb.backendIP+"typyNaczep").then((r) => {
			if(r.data['dane']){
				setNaczepy(r.data['dane']);
			} else {
				setNaczepy([]);
				toast.error("Błąd wczytywania", {
					duration: 8_000,
					description: "Wystąpił błąd podczas wczytywania dostępnych typów naczep. Powód: "+(r.data['blad'] ?? "Nieznany")
				});
			}
		}).catch((er) => {
			setNaczepy([]);
			toast.error("Błąd wczytywania", {
				duration: 8_000,
				description: "Wystąpił błąd podczas wczytywania dostępnych typów naczep. Powód: "+er.message
			});
		}).finally(() => setZaladowaneNaczepy(true));
	}, [toast]);

	const wczytajUrlopy = useCallback(async () => {
		await Axios.post(gb.backendIP+"historiaUrlopow/"+localStorage.getItem('token'))
		.then((r) => {
			if(r.data['dane'] !== undefined){
				setUrlopy(r.data['dane'] ?? []);
			} else {
				toast.error("Błąd wczytywania", {
					duration: 8_000,
					description: "Wystąpił błąd podczas sprawdzania historii urlopów. Powód: "+(r.data['blad'] ?? "Nieznany")
				});
			}
		}).catch((er) => {
			setUrlopy([]);
			toast.error("Błąd wczytywania", {
				duration: 8_000,
				description: "Wystąpił błąd podczas sprawdzania historii urlopów. Powód: "+er.message
			});
		}).finally(() => setZaladowaneUrlopy(true));
	}, [toast]);

	const aktywnyUrlop = useMemo(() => {
		if(!urlopy.length) return null;
		const teraz = Date.now();
		urlopy.forEach(u => {
			let odkiedy = new Date(u.odkiedy).getTime();
			let dokiedy = new Date(u.dokiedy);
			dokiedy.setDate(dokiedy.getDate() + 1);
			if(teraz >= odkiedy && teraz <= dokiedy){
				return u;
			}
		});
		return null
	}, [urlopy]);

	useEffect(() => {
		if(!zaladowaneMiasta) {
			wczytajMiasta();
			return;
		}
		if(!zaladowaneNaczepy) {
			wczytajNaczepy();
			return;
		}
		if(!zaladowanePromy) {
			wczytajPromy();
			return;
		}
		if(!zaladowaneUrlopy) {
			wczytajUrlopy();
			return;
		}
	}, [wczytajMiasta, wczytajNaczepy, wczytajPromy, wczytajUrlopy, zaladowaneMiasta, zaladowaneNaczepy, zaladowanePromy, zaladowaneUrlopy]);

	useEffect(() => {
		if(!zaladowaneTrasy && zaladowaneUrlopy && miasta.length && promy.length && naczepy.length) wczytajTrasy();
	}, [miasta.length, naczepy.length, promy.length, wczytajTrasy, zaladowaneTrasy, zaladowaneUrlopy]);

	const zakonczUrlop = useCallback(async (daneUrlop) => {
		setPrzetwarzanie(true);
		await Axios.post(gb.backendIP+"zakonczUrlop/"+localStorage.getItem('token'), {
            ktory: daneUrlop.idwniosku
        }).then((r) => {
            if(!r.data['blad']) {
                toast({
					title: "Zakończono urlop",
					variant: "success",
					duration: 8_000,
					description: "Pomyślnie zakończono urlop. Możesz już oddawać i edytować trasy."
				});
            } else {
				toast({
					title: "Wystąpił błąd",
					variant: "destructive",
					duration: 8_000,
					description: "Wystąpił błąd podczas zmiany statusu urlopu. Powód: "+(r.data['blad'] ?? "Nieznany")
				});
			}
        }).catch((er) => {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				duration: 8_000,
				description: "Wystąpił błąd podczas zmiany statusu urlopu. Powód: "+er.message
			});
		});
		setZaladowaneUrlopy(false);
		setPrzetwarzanie(false);
	}, [toast]);

	const oddajTrase = useCallback(async (dane) => {
		if(!dane.kiedy) {
			toast.error("Nieuzupełnione dane", { description: "Brak daty oddania raportu."});
            return;
        }
        if(dane.zatwierdz == 0 && (new Date(dane.kiedy).getTime() < (Date.now() - 25 * 60 * 60 * 1000))) {
			toast.error("Wystąpił błąd", { description: "Data raportu może być maksymalnie do 25 godzin wstecz!"});
            return;
        }
        if(dane.typserwera === undefined) {
            // ustawKomunikat("Nie wybrano typu serwera!");
			toast.error("Nieuzupełnione dane", { description: "Nie wybrano typu serwera!"});
            return;
        }
        if(dane.typzlecenia === undefined) {
            // ustawKomunikat("Nie wybrano typu zlecenia!");
			toast.error("Nieuzupełnione dane", { description: "Nie wybrano typu zlecenia!"});
            return;
        }
        if(dane.ladunek === undefined) {
            // ustawKomunikat("Nie uzupełniono ładunku!");
			toast.error("Nieuzupełnione dane", { description: "Brak zawartości ładunku!"});
            return;
        }
        if(dane.naczepa === undefined) {
            // ustawKomunikat("Nie wybrano typu naczepy!");
			toast.error("Nieuzupełnione dane", { description: "Nie wybrano typu naczepy!"});
            return;
        }
        if(dane.od === undefined) {
            // ustawKomunikat("Nie wybrano miejsca rozpoczęcia trasy!");
			toast.error("Nieuzupełnione dane", { description: "Nie wybrano miejsca rozpoczęcia trasy!"});
            return;
        }
        if(dane.do === undefined) {
            // ustawKomunikat("Nie wybrano miejsca zakończenia trasy!");
			toast.error("Nieuzupełnione dane", { description: "Nie wybrano miejsca zakończenia trasy!"});
            return;
        }
        if(dane.masaladunku === undefined) {
            // ustawKomunikat("Nie wypełniono masy ładunku!");
			toast.error("Nieuzupełnione dane", { description: "Nie wypełniono masy ładunku!"});
            return;
        }
        if(dane.uszkodzenia === undefined) {
            // ustawKomunikat("Nie uzupełniono uszkodzeń!");
			toast.error("Nieuzupełnione dane", { description: "Brak określonych uszkodzeń!"});
            return;
        }
        if(dane.spalanie === undefined) {
            // ustawKomunikat("Nie uzupełniono ilości wykorzystanego paliwa!");
			toast.error("Nieuzupełnione dane", { description: "Nie uzupełniono ilości wykorzystanego paliwa!"});
            return;
        }
		if(dane.zarobek === undefined) {
            // ustawKomunikat("Nie uzupełniono zarobku całkowitego!");
			toast.error("Nieuzupełnione dane", { description: "Nie uzupełniono zarobku całkowitego!"});
            return;
        }
        if(!(Number(dane.zarobek) > 0)) {
            // ustawKomunikat("Nie uzupełniono zarobku całkowitego!");
			toast.error("Nieuzupełnione dane", { description: "Nie uzupełniono zarobku całkowitego!"});
            return;
        }
        if(dane.przejechane === undefined) {
            // ustawKomunikat("Nie uzupełniono pokonanego dystansu!");
			toast.error("Nieuzupełnione dane", { description: "Nie uzupełniono pokonanego dystansu!"});
            return;
        }
        if(dane.vmax === undefined) {
            // ustawKomunikat("Nie uzupełniono prędkości maksymalnej!");
			toast.error("Nieuzupełnione dane", { description: "Nie uzupełniono prędkości maksymalnej!"});
            return;
        }
		if(dane.paliwo === undefined) {
            // ustawKomunikat("Nie uzupełniono kosztu tankowanego paliwa!");
			toast.error("Nieuzupełnione dane", { description: "Nie uzupełniono kosztu tankowanego paliwa!"});
            return;
        }
		setPrzetwarzanie(true);
		if(dane.id){
			// poprawka
			console.log("poprawka");
			const czas = new Date(dane.kiedy).toISOString();
			await Axios.post(gb.backendIP+"poprawTrase/"+dane.id+"/"+localStorage.getItem('token'), {
				kiedy: czas,
				typserwera: dane.typserwera,
				typzlecenia: dane.typzlecenia,
				ladunek: dane.ladunek,
				naczepa: dane.naczepa,
				od: dane.od,
				do: dane.do,
				masaladunku: dane.masaladunku,
				uszkodzenia: dane.uszkodzenia,
				spalanie: dane.spalanie,
				paliwo: dane.paliwo,
				przejechane: dane.przejechane,
				vmax: dane.vmax,
				zarobek: dane.zarobek,
				komentarz: dane.komentarz,
				noweZdj: dane.noweZdj,
				stareZdj: dane.zdj ?? "",
				ladunekADR: dane.ladunekADR,
				ladunekGabaryt: dane.ladunekGabaryt,
				ladunekDelikatny: dane.ladunekDelikatny,
				ladunekTandem: dane.ladunekTandem
			}, { headers: { 'Content-Type': 'multipart/form-data'}}).then( async (res) => {
				if(res.data['odp']){
					await Axios.post(gb.backendIP+"updateTrasaPromy/"+dane.id, {
						promy: dane.promy
					}).then((res2) => {
						if(res2.data['odp']){
							toast.success("Edycja trasy", { description: "Zmiany w trasie zostały pomyślnie zapisane." });
						} else {
							toast.warning("Częściowy zapis", { description: "Zmiany w trasie zostały zapisane z wyjątkiem promów. Powód: " + (res2.data['blad'] ?? "Nieznany") });
						}
					}).catch(er2 => {
						toast.warning("częsciowy zapis", { description: "Zmiany w trasie zostały zapisane z wyjątkiem promów. Powód: " + (er2.message ?? "Nieznany") });
					});
				} else {
					toast.error("Wystąpił błąd", { description: "Trasa nie została poprawiona. Powód: " + (res.data['blad'] ?? "Nieznany") });
				}
			}).catch(er => {
				toast.error("Wystąpił błąd", { description: "Trasa nie została poprawiona. Powód: " + (er.message ?? "Nieznany") });
			}).finally(() => {
				blockToast.current = true;
				setDaneTrasy({ gra: undefined });
				setOtwartyModal(false);
				setZaladowaneTrasy(false);
			});
		} else {
			// nowa trasa
			console.log("nowa trasa");
			const czas = new Date(dane.kiedy).toISOString();
       		await Axios.post(gb.backendIP+"oddajTrase/"+localStorage.getItem('token'), {
				kiedy: czas,
				gra: dane.gra,
				typserwera: dane.typserwera,
				typzlecenia: dane.typzlecenia,
				ladunek: dane.ladunek,
				naczepa: dane.naczepa,
				od: dane.od,
				do: dane.do,
				masaladunku: dane.masaladunku,
				uszkodzenia: dane.uszkodzenia,
				spalanie: dane.spalanie,
				paliwo: dane.paliwo,
				przejechane: dane.przejechane,
				vmax: dane.vmax,
				zarobek: dane.zarobek,
				komentarz: dane.komentarz,
				noweZdj: dane.noweZdj,
				ladunekADR: dane.ladunekADR,
				ladunekGabaryt: dane.ladunekGabaryt,
				ladunekDelikatny: dane.ladunekDelikatny,
				ladunekTandem: dane.ladunekTandem
			}, { headers: { 'Content-Type': 'multipart/form-data'}}).then( async (res) => {
				if(res.data['odp']){
					await Axios.post(gb.backendIP+"updateTrasaPromy/"+res.data['odp'], {
						promy: dane.promy
					}).then((res2) => {
						if(res2.data['odp']){
							toast.success("Zapisano trasę", { description: "Nowy raport z trasy został pomyślnie zapisany." });
						} else {
							toast.warning("Częściowy zapis", { description: "Nowy raport został zapisany z wyjątkiem informacji o promach. Powód: "+(res2.data['blad'] ?? "Nieznany") });
						}
					}).catch((er2) => {
						toast.warning("Częściowy zapis", { description: "Nowy raport został zapisany z wyjątkiem informacji o promach. Powód: "+(er2.message ?? "Nieznany") });
					});
				} else {
					toast.error("Wystąpił błąd", { description: "Nowy raport z trasy nie został zapisany. Powód: "+(res.data['blad'] ?? "Nieznany") });
				}
			}).catch((er) => {
				toast.error("Wystąpił błąd", { description: "Nowy raport z trasy nie został zapisany. Powód: "+(er.message ?? "Nieznany") });
			}).finally(() => {
				blockToast.current = true;
				setDaneTrasy({ gra: undefined });
				setOtwartyModal(false);
				setZaladowaneTrasy(false);
			});
		}
		setPrzetwarzanie(false);
	}, [toast]);

	return (
		<>
			<Nawigacja />
			<div className="tlo" />
			<div className="srodekekranu">
				<Toaster richColors />
				<Card className="w-full max-w-7xl">
					<CardHeader>
						<CardTitle>Twoje ostatnie trasy</CardTitle>
						<CardDescription>
							To miejsce w którym możesz sprawdzić historię Twoich
							oddanych raportów z tras oraz możliwość przejścia do
							tworzenia nowego raportu lub edycji aktywnego
							raportu zgłoszonego do poprawy.
						</CardDescription>
						<CardAction className="flex flex-col gap-2">
							{
								aktywnyUrlop
									? <AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="secondary" className="font-bold tracking-wider" disabled={przetwarzanie}>Zakończ urlop <FaUserClock className="inline w-auto! h-full!" /></Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
												<AlertDialogDescription>Ta czynność jest nieodwracalna. Czy aby napewno chcesz zakończyć swój urlop?</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Anuluj</AlertDialogCancel>
												<AlertDialogAction onClick={() => zakonczUrlop(aktywnyUrlop)}>Potwierdź</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
									: <>
										<Button
											disabled={!zaladowaneMiasta || !zaladowaneNaczepy || !zaladowaneUrlopy}
											onClick={ () => {
												setDaneTrasy({ gra: 0 });
												setOtwartyModal(true);
											}}
										>Oddaj trase ETS <img className="w-7.5 h-7.5 inline" src={"/img/trasaets.png"} /></Button>
										{ dostepATS === true && <Button
											variant="secondary"
											disabled={!zaladowaneMiasta || !zaladowaneNaczepy || !zaladowaneUrlopy}
											onClick={ () => {
												setDaneTrasy({ gra: 1 })
												setOtwartyModal(true);
											}}
										>Oddaj trase ATS <img className="w-7.5 h-7.5 inline" src={"/img/trasaats.png"} /></Button> }
									</>
							}
						</CardAction>
					</CardHeader>
					<CardContent className="-mt-2">
						{ aktywnyUrlop &&
						<p className="leading-relaxed tracking-wide text-center mb-4 px-4 text-sm py-2 bg-orange-500/60 text-orange-200 rounded-lg">
							<b>Kierowco</b>
							, jako iż jesteś na Urlopie od <b>{new Date().toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date().toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>
							, możesz <b>jedynie przeglądać</b> swoje Trasy.<br />
							Jeśli chcesz edytować lub oddać nową trasę zakończ swój aktualny urlop!
						</p>
						}
						<Table>
							<TableHeader>
								<TableRow className="bg-muted!">
									<TableHead className="w-13 text-center">ID</TableHead>
									<TableHead className="w-18 text-center">Gra</TableHead>
									<TableHead className="w-55 text-center">Data</TableHead>
									<TableHead className="text-center">Lokalizacja</TableHead>
									<TableHead className="text-center">Ładunek</TableHead>
									<TableHead className="text-center w-27">Status</TableHead>
									<TableHead className="text-center w-25">Akcja</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{
									zaladowaneMiasta
										? miasta.length
											? zaladowaneNaczepy
												? naczepy.length
													? zaladowanePromy
														? zaladowaneTrasy
															? zaladowaneUrlopy
																? paginacjaTrasy.length
																	? paginacjaTrasy.map((trasa) => {
																		let statusTekst;
																		let akcjaTekst;
																		let badgeStyle;
																		switch(trasa.zatwierdz){
																			case 0:
																				statusTekst = "Oczekująca";
																				badgeStyle = "bg-blue-500 text-blue-100";
																				akcjaTekst = "Szczegóły";
																				if(new Date(trasa.kiedy).getTime() < ( Date.now() + 25 * 3600 * 1000)) akcjaTekst = "Edytuj";
																				break;
																			case 1:
																				statusTekst = "Zatwierdzona";
																				badgeStyle = "bg-green-500 text-green-100";
																				akcjaTekst = "Szczegóły";
																				break;
																			case 2:
																				if(trasa.dozwolpoprawke){
																					statusTekst = "Do poprawy";
																					badgeStyle = "bg-yellow-500 text-yellow-100";
																					akcjaTekst = "Edytuj";
																				} else {
																					statusTekst = "Odrzucona";
																					badgeStyle = "bg-red-500 text-red-100";
																					akcjaTekst = "Szczegóły";
																				}
																				break;
																		}
																		if(aktywnyUrlop) akcjaTekst = "Szczegóły";

																		let skad = miasta.find((w) => w.id === trasa.od) || null;
											                            let dokad = miasta.find((w) => w.id === trasa.do) || null;


																		return(
																			<TableRow key={`trasa_${trasa.id}`}>
																				<TableCell className="w-13 text-center">{trasa.id}</TableCell>
																				<TableCell className="w-18 text-center">{ trasa.gra ? <img className="min-w-12 min-h-12 w-12 h-12 inline" src={"/img/trasaats.png"} /> : <img className="min-w-12 min-h-12 w-12 h-12 inline" src={"/img/trasaets.png"} /> }</TableCell>
																				<TableCell className="w-55 text-center">{ new Date(trasa.kiedy).toLocaleString("pl-PL", { hour: "2-digit", minute: "2-digit" }) } - { new Date(trasa.kiedy).toLocaleString("pl-PL", { day: "numeric", month: "long" }) }</TableCell>
																				<TableCell className="text-center">
																					<div className="flex items-center gap-2">
																						{skad && (trasa.gra ? <img className="w-6 h-4 inline" title={skad.kraj} src="/img/flagi/usa.png" /> : <img title={skad.kraj} className="w-6 h-4 inline" src={"/img/flagi/"+skad.kraj.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> )}
																						<b>{skad ? skad.miasto : "Nieznane"}</b>
																						<HiArrowNarrowRight className="inline min-w-4.5 h-auto -ml-0.5" />
																						{dokad && (trasa.gra ? <img className="w-6 h-4 inline" title={dokad.kraj} src="/img/flagi/usa.png" /> : <img title={dokad.kraj} className="w-6 h-4 inline" src={"/img/flagi/"+dokad.kraj.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> )}
																						<b>{dokad ? dokad.miasto : "Nieznane"}</b>
																					</div>
																				</TableCell>
																				<TableCell className="text-center">{ trasa.ladunek }</TableCell>
																				<TableCell className="text-center w-27"><Badge className={`${badgeStyle} font-bold tracking-wide`}>{ statusTekst }</Badge></TableCell>
																				<TableCell className="text-center w-25">
																					<Button variant="outline" className="w-full" size="sm" onClick={() => {
																						setDaneTrasy({ ...trasa, krajOd: skad.kraj, krajDo: dokad.kraj });
																						setOtwartyModal(true);
																					}}>{akcjaTekst}</Button>
																				</TableCell>
																			</TableRow>
																		)
																	})
																	: <TableRow><TableCell colSpan={7} className="text-center py-20"><span>Kierowco!<br/>Nie masz w systemie oddanej żadnej trasy!<br/>Może wypadałoby to zmienić?</span></TableCell></TableRow>
																: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie Twojej historii tras...</span></TableCell></TableRow>
															: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie historii urlopów...</span></TableCell></TableRow>
														: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie promów i pociągów...</span></TableCell></TableRow>
													: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Baza danych typów naczep jest pusta...</span></TableCell></TableRow>
												: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie dostępnych typów naczep...</span></TableCell></TableRow>
											: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Baza danych miejscowości jest pusta...</span></TableCell></TableRow>
										: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie miejscowości...</span></TableCell></TableRow>
								}
							</TableBody>
							<TableFooter>
								<TableRow className="bg-accent!">
									<TableCell colSpan={7}>
										<div className="flex justify-between gap-2 items-center select-none">
											<Button
												variant={"outline"}
												className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
												onClick={() => setPaginacjaStrona( (p) => p - 1 ) }
												disabled={ paginacjaStrona <= 1 }
											>Poprzednia</Button>
											<p className="text-center">
												Strona {paginacjaStrona} z {dostepneStrony}
												<br />
												<Button disabled={!zaladowaneTrasy} onClick={() => setZaladowaneTrasy(false)} className="h-fit text-xs opacity-80 hover:text-blue-400 transition-colors duration-300" variant="link" size="sm">Odśwież dane</Button>
											</p>
											<Button
												variant={"outline"}
												className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
												onClick={ () => setPaginacjaStrona( (p) => p + 1 ) }
												disabled={ paginacjaStrona >= dostepneStrony }
											>Następna</Button>
										</div>
									</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					</CardContent>
				</Card>
				<EdytorTrasy
					daneTrasy={daneTrasy} przetwarzanie={przetwarzanie}
					podglad={podglad} setPodglad={setPodglad}
					otwartyModal={otwartyModal} setOtwartyModal={setOtwartyModal}
					aktywnyUrlop={aktywnyUrlop} typyNaczep={naczepy}
					miasta={miastaPerWybor} promy={promy}
					oddajTrase={oddajTrase}
				/>
				{ podglad &&
				<div className="z-100 fixed inset-0 pointer-events-auto! bg-black/80 p-10 pl-25 flex items-center justify-center cursor-zoom-out" onClick={() => setPodglad(undefined) }>
					<img src={podglad} className="rounded-lg max-w-95/100 max-h-95/100 object-contain object-center animate-[wejscieSmooth_.4s_ease]" />
				</div>
				}
			</div>
		</>
	);
};
export default NoweTrasy;

const EdytorTrasy = memo(({daneTrasy, podglad, setPodglad, otwartyModal, setOtwartyModal, przetwarzanie, oddajTrase, aktywnyUrlop, typyNaczep, miasta, promy}) => {
	const [ dane, setDane ] = useState(daneTrasy);
	const [ komentarzDebounce, setKomentarzDebounce ] = useState("");
	useEffect(() => {
		setDane(daneTrasy);
		setKomentarzDebounce(daneTrasy.komentarz ?? "");
	}, [daneTrasy]);

	useEffect(() => {
		const opoznienie = setTimeout(() => {
			setDane(x => ({...x, komentarz: komentarzDebounce}));
		}, 600);
		return () => clearTimeout(opoznienie);
	}, [komentarzDebounce]);

	const mozliwoscEdycji = useMemo(() => {
		if(aktywnyUrlop) return false;
		if(!dane.id) return true;
		if(dane.zatwierdz === 2 && dane.dozwolpoprawke === 1) return true;
		if(dane.zatwierdz === 0 && ( new Date(dane.kiedy).getTime() + 25 * 3600 * 1000 > Date.now() )) return true;
		return false;
	}, [aktywnyUrlop, dane.id, dane.zatwierdz, dane.dozwolpoprawke, dane.kiedy]);

	const dostepnePanstwa = useMemo(() => {
		if(dane.gra === undefined) return [];
		const wybrane = miasta.get(dane.gra);
		return wybrane ? [...wybrane.keys()].sort((a, b) => a.localeCompare(b)) : [];
	}, [dane.gra, miasta]);

	const wczytajPromyTrasy = useCallback(async () => {
		await Axios.post(gb.backendIP+"promyTrasy/"+dane.id).then((res) => {
			console.log(res.data['dane']);
            setDane(x => ({...x, liczbapromow: res.data['dane'].ile, promy: res.data['dane'].promy}));
        });
	}, [dane.id]);

	useEffect(() => {
		if(!dane.id) {
			if(dane.promy || dane.liczbapromow) setDane(x => ({...x, liczbapromow: undefined, promy: undefined}));
			return;
		}
		wczytajPromyTrasy();
	}, [dane.id]);

	const dostepneMiasta = useCallback((kraj) => {
		if(!kraj || dane.gra === undefined) return [];
		return miasta.get(dane.gra)?.get(kraj) || [];
	}, [dane.gra, miasta]);

	const zmianaLiczbyPromow = useCallback((ile) => {
		setDane(x => {
			const tmpPromy = [];
			for(let i = 0; i<ile; i++){
				tmpPromy[i] = x.promy?.[i] ?? null;
			}
			return {...x, liczbapromow: ile, promy: tmpPromy}
		})
    }, []);

	const wyborPromow = useMemo(() => {
		return promy.map((dostepnePromy) => (<SelectItem key={`wyborprom_${dostepnePromy.id}`} value={dostepnePromy.id}>{dostepnePromy.nazwa}</SelectItem>))
	}, [promy]);

	return(
		<Dialog open={otwartyModal} onOpenChange={ (e) => {
			if(przetwarzanie) return;
			if(podglad) return;
			setOtwartyModal(e);
		}}>
			<DialogContent className="max-w-400! w-95/100">
				<DialogHeader>
					<DialogTitle>{ dane.id === undefined ? `Oddawanie nowej trasy ${dane.gra ? "ATS" : "ETS2"}` : `Szczegóły trasy #${dane.id}`}</DialogTitle>
					<DialogDescription>
						<OpisNaglowka
							id={dane.id} zatwierdz={dane.zatwierdz} kiedy={dane.kiedy} kara={dane.kara}
							dozwolpoprawke={dane.dozwolpoprawke} powododrzuc={dane.powododrzuc} wlasnyzarobek={dane.wlasnyzarobek}
						/>
					</DialogDescription>
				</DialogHeader>
				<div className="p-4 flex flex-col gap-4">
					<div className="grid grid-cols-4 gap-4 [&>div]:space-y-2 [&_>_div_*]:disabled:opacity-100">
						<div>
							<Label htmlFor="kiedy">Data raportu</Label>
							<Popover modal={true}>
								<PopoverTrigger asChild>
									<Button
										id="kiedy"
										className="w-full justify-between aria-invalid:border-destructive! disabled:cursor-not-allowed not-disabled:cursor-pointer"
										aria-invalid={dane.kiedy === undefined || isNaN(new Date(dane.kiedy).getTime())}
										variant="outline"
										disabled={!mozliwoscEdycji}
									>
										{ dane.kiedy ? `${new Date(dane.kiedy).toLocaleString("pl-PL", { day: "numeric", month: "long", year: "numeric"})} - ${new Date(dane.kiedy).toLocaleString("pl-PL", {hour: "2-digit", minute: "2-digit"})}` : "Wybierz datę i godzinę"}
										<ChevronDownIcon />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-1">
									<div className="flex flex-col gap-1">
										<Calendar defaultMonth={dane.kiedy ? new Date(dane.kiedy) : new Date()} locale={pl} mode="single" disabled={{after: new Date()}} selected={dane.kiedy} onSelect={(e) => {
											// sprawdz czy juz wczesniej byla wybrana data, jak tak to wyciagnij ta sama godzine
											if(e === undefined) return;
											let prevDate = new Date(dane.kiedy);
											let tmpDate = new Date(e);
											if(dane.kiedy !== undefined && !isNaN(prevDate.getTime()) ){
												tmpDate.setHours(prevDate.getHours());
												tmpDate.setMinutes(prevDate.getMinutes());
											}
											setDane(x => ({...x, kiedy: tmpDate }))
										}} />
										<div className="flex gap-1 items-center">
											<Input
												type="time"
												placeholder="Wybierz datę"
												className="disabled:pointer-events-auto"
												title={(dane.kiedy === undefined || isNaN(new Date(dane.kiedy).getTime())) ? "Wpierw wybierz datę" : "Wybierz czas dnia"}
												disabled={(dane.kiedy === undefined || isNaN(new Date(dane.kiedy).getTime()))}
												value={ ( dane.kiedy === undefined || isNaN(new Date(dane.kiedy).getTime()) ) ? undefined : `${new Date(dane.kiedy).getHours().toString().padStart(2, "0")}:${new Date(dane.kiedy).getMinutes().toString().padStart(2, "0")}`}
												onChange={(e) => {
													let splitTime = e.target.value.split(":");
													let hh = splitTime[0];
													let mm = splitTime[1];
													let tmpDate = new Date(dane.kiedy);
													tmpDate.setHours(hh);
													tmpDate.setMinutes(mm);
													setDane(x => ({...x, kiedy: tmpDate}));
												}}
											/>
											<Button className="grow" variant="outline" onClick={() => setDane(x => ({...x, kiedy: new Date()}))}>Aktualna</Button>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>
						<div>
							<Label htmlFor="typserwera">Typ serwera</Label>
							<Select value={dane.typserwera !== undefined ? dane.typserwera.toString() : ""} onValueChange={ (e) => setDane( x => ({...x, typserwera: e }) ) } disabled={!mozliwoscEdycji}>
								<SelectTrigger id="typserwera" className="w-full" aria-invalid={dane.typserwera === undefined}>
									<SelectValue placeholder="Niewybrano" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Singleplayer</SelectItem>
									<SelectItem value="1">Multiplayer</SelectItem>
									<SelectItem value="2">TruckersMP</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="typzlecenia">Typ zlecenia</Label>
							<Select value={dane.typzlecenia !== undefined ? dane.typzlecenia.toString() : ""} onValueChange={ (e) => setDane( x => ({...x, typzlecenia: e }) ) } disabled={!mozliwoscEdycji}>
								<SelectTrigger id="typzlecenia" className="w-full" aria-invalid={dane.typzlecenia === undefined}>
									<SelectValue placeholder="Niewybrano" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Zlecenie z gry</SelectItem>
									<SelectItem value="1">Zlecenie generowane przez gracza</SelectItem>
									<SelectItem value="2">World of Trucks</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="gra">Gra</Label>
							<Input type="text" id="gra" placeholder="Nieznana gra?" value={dane.gra ? "American Truck Simulator" : "Euro Truck Simulator 2"} disabled />
						</div>
						<div>
							<Label htmlFor="ladunek">Ładunek</Label>
							<Input type="text" id="ladunek" aria-invalid={!dane.ladunek} placeholder="Brak ładunku" value={dane.ladunek ?? ""} onChange={(e) => setDane(x => ({...x, ladunek: e.target.value}))} required disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="typnaczepy">Typ naczepy</Label>
							<Select value={dane.naczepa ? dane.naczepa : ""} onValueChange={ (e) => setDane( x => ({...x, naczepa: e }) ) } disabled={!mozliwoscEdycji}>
								<SelectTrigger id="typnaczepy" className="w-full" aria-invalid={!dane.naczepa}>
									<SelectValue placeholder="Niewybrano" />
								</SelectTrigger>
								<SelectContent>
									{ typyNaczep.map((wiersz) => {
                                        if((wiersz.rodzaj == 'Licencja') && (wiersz.gra == dane.gra)){
                                        	if(!(["Kat. C+E", "ADR", "Gabaryty", "Długie zestawy"].includes(wiersz.nazwa))){
                                        		return <SelectItem key={`naczepa_${wiersz.id}`} value={wiersz.id}>{wiersz.nazwa}</SelectItem>
                                        	}
                                        }
                                    }) }
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="rozptrasy">Rozpoczęcie trasy</Label>
							<div className="flex gap-1 w-full">
								<Popover open={dane.krajOdOkno} onOpenChange={ (e) => setDane( x => ({...x, krajOdOkno: e}) ) }>
									<PopoverTrigger asChild>
										<Button id="rozptrasy" variant="outline" role="combobox" className={`${dane.krajOd === undefined && "border-destructive!"} justify-between flex-1 min-w-0`} disabled={!mozliwoscEdycji}>
											<div className="flex items-center gap-2 min-w-0">
												{ !dane.krajOd ? "" : dane.gra ? <img className="w-6 h-4 inline" title={dane.krajOd} src="/img/flagi/usa.png" /> : <img title={dane.krajOd} className="w-6 h-4 inline" src={"/img/flagi/"+dane.krajOd.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> }
												<span className="truncate">{ dane.krajOd ?? "Wybierz kraj"}</span>
											</div>
											<ChevronsUpDown className="opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-full">
										<Command>
											<CommandInput placeholder="Wybierz kraj" />
											<CommandList onWheel={(e) => e.stopPropagation() }>
												<CommandEmpty>Nie znaleziono frazy.</CommandEmpty>
												<CommandGroup>
													{
														dostepnePanstwa.map(w => {
															return <CommandItem
																key={`krajOd_${w}`}
																value={w}
																onSelect={(val) => {
																	setDane(x => ({...x, krajOd: x.krajOd === val ? undefined : val, od: undefined, krajOdOkno: false}) )
																}}
															>{dane.gra ? <img className="w-6 h-4 inline" title={w} src="/img/flagi/usa.png" /> : <img title={w} className="w-6 h-4 inline" src={"/img/flagi/"+w.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> } {w} <Check className={cn("ml-auto", w == dane.krajOd ? "opacity-100" : "opacity-0")} />
															</CommandItem>
														})
													}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								{
									(dane.krajOd !== undefined) && <Popover open={dane.odOkno} onOpenChange={ (e) => setDane( x => ({...x, odOkno: e}) ) }>
									<PopoverTrigger asChild><Button variant="outline" role="combobox" className={`${dane.od === undefined && "border-destructive!"} justify-between`} disabled={!mozliwoscEdycji}>
										<span className="truncate">{ dane.od ? dostepneMiasta(dane.krajOd).find(x => x.id.toString() === dane.od.toString())?.miasto ?? "Nieznane miasto" : "Wybierz miasto" }</span>
										<ChevronsUpDown className="opacity-50" /></Button></PopoverTrigger>
									<PopoverContent className="w-full">
										<Command>
											<CommandInput placeholder="Wybierz miejscowość" />
											<CommandList onWheel={(e) => e.stopPropagation() }>
												<CommandEmpty>Nie znaleziono frazy.</CommandEmpty>
												<CommandGroup>
													{
														dostepneMiasta(dane.krajOd).map(w => {
															return <CommandItem
																key={`skad_${w.id}`}
																value={w.id.toString()}
																keywords={[w.miasto]}
																onSelect={(value) => {
																	setDane(x => ({...x, od: x.od === value ? undefined : value, odOkno: false}) )
																}}
															>{w.miasto} <Check className={cn("ml-auto", w.id.toString() === dane.od ? "opacity-100" : "opacity-0")} />
															</CommandItem>
														})
													}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								}
							</div>
						</div>
						<div>
							<Label htmlFor="zaktrasy">Zakończenie trasy</Label>
							<div className="flex gap-1 w-full">
								<Popover open={dane.krajDoOkno} onOpenChange={ (e) => setDane( x => ({...x, krajDoOkno: e}) ) }>
									<PopoverTrigger asChild><Button id="zaktrasy" variant="outline" role="combobox" className={`${dane.krajDo === undefined && "border-destructive!"} justify-between flex-1 min-w-0`} disabled={!mozliwoscEdycji}>
										<div className="flex items-center gap-2 min-w-0">
											{ !dane.krajDo ? "" : dane.gra ? <img className="w-6 h-4 inline" title={dane.krajDo} src="/img/flagi/usa.png" /> : <img title={dane.krajDo} className="w-6 h-4 inline" src={"/img/flagi/"+dane.krajDo.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> }
											<span className="truncate">{ dane.krajDo ?? "Wybierz kraj"}</span>
										</div>
										<ChevronsUpDown className="opacity-50" /></Button></PopoverTrigger>
									<PopoverContent className="w-full">
										<Command>
											<CommandInput placeholder="Wybierz kraj" />
											<CommandList onWheel={(e) => e.stopPropagation() }>
												<CommandEmpty>Nie znaleziono frazy.</CommandEmpty>
												<CommandGroup>
													{
														dostepnePanstwa.map(w => {
															return <CommandItem
																key={`krajDo_${w}`}
																value={w}
																onSelect={(val) => {
																	setDane(x => ({...x, krajDo: x.krajDo === val ? undefined : val, do: undefined, krajDoOkno: false}) )
																}}
															>{dane.gra ? <img className="w-6 h-4 inline" title={w} src="/img/flagi/usa.png" /> : <img title={w} className="w-6 h-4 inline" src={"/img/flagi/"+w.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> } {w} <Check className={cn("ml-auto", w == dane.krajDo ? "opacity-100" : "opacity-0")} />
															</CommandItem>
														})
													}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								{
									(dane.krajDo !== undefined) && <Popover open={dane.doOkno} onOpenChange={ (e) => setDane( x => ({...x, doOkno: e}) ) }>
									<PopoverTrigger asChild><Button variant="outline" role="combobox" className={`${dane.do === undefined && "border-destructive!"} justify-between`} disabled={!mozliwoscEdycji}>
										<span className="truncate">{ dane.do ? dostepneMiasta(dane.krajDo).find(x => x.id.toString() === dane.do.toString())?.miasto ?? "Nieznane miasto" : "Wybierz miasto" }</span>
										<ChevronsUpDown className="opacity-50" /></Button></PopoverTrigger>
									<PopoverContent className="w-full">
										<Command>
											<CommandInput placeholder="Wybierz miejscowość" />
											<CommandList onWheel={(e) => e.stopPropagation() }>
												<CommandEmpty>Nie znaleziono frazy.</CommandEmpty>
												<CommandGroup>
													{
														dostepneMiasta(dane.krajDo).map(w => {
															return <CommandItem
																key={`dokad_${w.id}`}
																value={w.id.toString()}
																keywords={[w.miasto]}
																onSelect={(value) => {
																	console.log(value);
																	setDane(x => ({...x, do: x.do === value ? undefined : value, doOkno: false}) )
																}}
															>{w.miasto} <Check className={cn("ml-auto", w.id.toString() === dane.do ? "opacity-100" : "opacity-0" )} />
															</CommandItem>
														})
													}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								}
							</div>
						</div>
						<div>
							<Label htmlFor="masal">Masa ładunku (tony)</Label>
							<Input type="number" id="masal" step="0.1" placeholder="Podaj wartość" value={dane.masaladunku} onChange={ (e) => setDane(x => ({...x, masaladunku: e.target.value})) } aria-invalid={!dane.masaladunku} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="uszk">Uszkodzenia</Label>
							<Input type="number" id="uszk" step="0.1" placeholder="Podaj wartość" value={dane.uszkodzenia} onChange={ (e) => setDane(x => ({...x, uszkodzenia: e.target.value})) } aria-invalid={dane.uszkodzenia === undefined} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="paliwo">Wykorzystane paliwo (litry)</Label>
							<Input type="number" id="paliwo" step="0.1" placeholder="Podaj wartość" value={dane.spalanie} onChange={ (e) => setDane(x => ({...x, spalanie: e.target.value})) } aria-invalid={!dane.spalanie} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="zarobekzlecenie">Zarobek na zleceniu</Label>
							<Input type="number" step="0.1" id="zarobekzlecenie" placeholder="Podaj wartość" value={dane.zarobek} onChange={ (e) => setDane(x => ({...x, zarobek: e.target.value})) } aria-invalid={!dane.zarobek} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="pokonanydystans">Pokonany dystans</Label>
							<Input type="number" step="0.1" id="pokonanydystans" placeholder="Podaj wartość" value={dane.przejechane} onChange={ (e) => setDane(x => ({...x, przejechane: e.target.value})) } aria-invalid={!dane.przejechane} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="vmax">Prędkość maksymalna (km/h)</Label>
							<Input type="number" id="vmax" step="0.1" placeholder="Podaj wartość" value={dane.vmax} onChange={ (e) => setDane(x => ({...x, vmax: e.target.value})) } aria-invalid={!dane.vmax} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="kosztapaliwa">Koszt tankowanego paliwa</Label>
							<Input type="number" step="0.1" id="kosztapaliwa" placeholder="Podaj wartość" value={dane.paliwo} onChange={ (e) => setDane(x => ({...x, paliwo: e.target.value})) } aria-invalid={dane.paliwo === undefined} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="ilepromow">Liczba promów</Label>
							<Input type="number" id="ilepromow" step="1" min="0" max="5" value={dane.liczbapromow ?? 0} onChange={(e) => zmianaLiczbyPromow(e.target.value)} disabled={!mozliwoscEdycji} />
						</div>
						<div>
							<Label htmlFor="czyADR">Ładunek ADR</Label>
							<Select value={dane.ladunekADR !== undefined ? dane.ladunekADR.toString() : "0"} onValueChange={ (e) => setDane( x => ({...x, ladunekADR: e }) ) } disabled={!mozliwoscEdycji}>
								<SelectTrigger id="czyADR" className="w-full">
									<SelectValue placeholder="Niewybrano" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Nie</SelectItem>
									<SelectItem value="1">Tak</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="czyDelikatny">Ładunek delikatny</Label>
							<Select value={dane.ladunekDelikatny !== undefined ? dane.ladunekDelikatny.toString() : "0"} onValueChange={ (e) => setDane( x => ({...x, ladunekDelikatny: e }) ) } disabled={!mozliwoscEdycji}>
								<SelectTrigger id="czyDelikatny" className="w-full">
									<SelectValue placeholder="Niewybrano" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Nie</SelectItem>
									<SelectItem value="1">Tak</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="czyGabaryt">Ładunek gabarytowy</Label>
							<Select value={dane.ladunekGabaryt !== undefined ? dane.ladunekGabaryt.toString() : "0"} onValueChange={ (e) => setDane( x => ({...x, ladunekGabaryt: e }) ) } disabled={!mozliwoscEdycji}>
								<SelectTrigger id="czyGabaryt" className="w-full">
									<SelectValue placeholder="Niewybrano" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Nie</SelectItem>
									<SelectItem value="1">Tak</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="czyTandem">Ładunek tandem</Label>
							<Select value={dane.ladunekTandem !== undefined ? dane.ladunekTandem.toString() : "0"} onValueChange={ (e) => setDane( x => ({...x, ladunekTandem: e }) ) } disabled={!mozliwoscEdycji}>
								<SelectTrigger id="czyTandem" className="w-full">
									<SelectValue placeholder="Niewybrano" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Nie</SelectItem>
									<SelectItem value="1">Tak</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="col-span-3 row-span-3 grid grid-cols-2 gap-4 [&_>_div_*]:disabled:opacity-100">
							<div className="mb-0 flex flex-col space-y-2">
								<Label htmlFor="komentarz">Komentarz</Label>
								<Textarea
									id="komentarz"
									placeholder={!mozliwoscEdycji ? "Brak komentarza" : "Wydarzyło się może coś istotnego, o czym chciałbyś nam wspomnieć?"}
									value={komentarzDebounce ?? ""}
									onChange={(e) => setKomentarzDebounce(e.target.value) }
									className="resize-none h-full"
									disabled={!mozliwoscEdycji}
								/>
							</div>
							<div className="flex flex-col space-y-2">
								<Label htmlFor="uploadZdjec">Zdjęcia</Label>
								<div className="flex flex-col grow gap-1">
									<div
										className="
											min-h-24 grow flex items-center gap-3 rounded-md bg-input/30 border-input border py-2 px-3 overflow-x-auto
											[&::-webkit-scrollbar]:h-1.5! [&::-webkit-scrollbar-thumb]:bg-orange-600!
											[&::-webkit-scrollbar-track]:bg-zinc-500! [::-webkit-scrollbar-track]:shadow-none! [&::-webkit-scrollbar-thumb]:shadow-none!
										"
										onWheel={(e) => {
											e.stopPropagation();
											if (e.deltaY !== 0) {
												e.currentTarget.scrollLeft += e.deltaY
											}
										}} onTouchMove={(e) => { e.stopPropagation() }}
									>
										{ !dane.zdj && !dane.noweZdj && <div className="w-full text-center font-bold tracking-wider text-muted-foreground">Brak zdjęć</div>}
										{
											dane.zdj ? dane.zdj.split(" ").map(zdj => {
												if(!zdj) return;
												return <div key={zdj} className="border group overflow-hidden border-input aspect-video shrink-0 h-20 bg-center bg-cover bg-no-repeat rounded-sm relative" style={{backgroundImage: `url(https://system.thebossspedition.pl${zdj})`}}>
													<div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/70 flex items-center gap-4 justify-evenly px-2">
														<button
															className="bg-input p-2 rounded-sm cursor-pointer hover:text-zinc-900 hover:bg-zinc-100/70"
															onClick={() => setPodglad("https://system.thebossspedition.pl"+zdj) }
														><FaExpand /></button>
														{ mozliwoscEdycji && <button
															className="bg-input p-2 rounded-sm cursor-pointer hover:text-zinc-900 hover:bg-zinc-100/70"
															onClick={() => {
																setDane(x => ({...x, zdj: x.zdj.split(" ").filter(val => val !== zdj || !val).join(" ") }) )
															}}
														><FaTrash /></button> }
													</div>
												</div>
											}) : ""
										}
										{
											dane.noweZdjBlob ? dane.noweZdjBlob.map((zdj, index) => {
												if(!zdj) return;
												return <div key={zdj} className="border group overflow-hidden border-input aspect-video shrink-0 h-20 bg-center bg-cover bg-no-repeat rounded-sm relative" style={{backgroundImage: `url(${zdj})`}}>
													<div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/70 flex items-center gap-4 justify-evenly px-2">
														<button
															className="bg-input p-2 rounded-sm cursor-pointer hover:text-zinc-900 hover:bg-zinc-100/70"
															onClick={() => setPodglad(zdj) }
														><FaExpand /></button>
														<button
															className="bg-input p-2 rounded-sm cursor-pointer hover:text-zinc-900 hover:bg-zinc-100/70"
															onClick={() => {
																URL.revokeObjectURL(zdj);
																setDane(x => ({
																	...x,
																	noweZdj: x.noweZdj.filter((v, i) => i !== index),
																	noweZdjBlob: x.noweZdjBlob.filter((v, i) => i !== index)
																}) )
															}}
														><FaTrash /></button>
													</div>
												</div>
											}) : ""
										}
									</div>
									{ mozliwoscEdycji && <>
										<label htmlFor="uploadZdjec" className="bg-green-700 rounded-md py-1.5 px-3 text-center text-sm font-bold tracking-wide cursor-pointer hover:bg-green-600">Dodaj zdjęcia</label>
										<input
											id="uploadZdjec"
											type="file"
											accept="image/jpeg, image/jpg, image/png"
											className="hidden"
											multiple={"multiple"}
											onChange={(e) => {
												const selected = e.target.files;
												console.log(selected);
												if (!selected || selected.length === 0) return;
												let tmpNoweZdj = dane.noweZdj || [];
												let tmpNoweZdjBlob = dane.noweZdjBlob || [];
												[...selected].forEach(nowe => {
													tmpNoweZdj.push(nowe);
													tmpNoweZdjBlob.push(URL.createObjectURL(nowe));
												})
												setDane(x => ({...x, noweZdj: tmpNoweZdj, noweZdjBlob: tmpNoweZdjBlob }) );
											}}
										/>
									</> }
								</div>
							</div>
						</div>
						<div className="row-span-3 space-y-0.5!">
							<Label className="mb-2!">Promy</Label>
							{ dane.promy ? dane.promy.map((prom, i) => {
								return(
									<Select value={prom !== null ? prom : ""} key={`prom_${i}`} aria-invalid={!(promy.find((x) => x.id == prom))} onValueChange={(e) => {
										let tmpPromy = dane.promy;
										tmpPromy[i] = e;
										setDane(x => ({...x, promy: tmpPromy}));
									}}>
										<SelectTrigger className="w-full"><SelectValue placeholder={ prom !== null ? "Usunięty prom" : "Wybierz prom"} /></SelectTrigger>
										<SelectContent>
											{ wyborPromow }
										</SelectContent>
									</Select>
								)
							}) : <p className="text-sm italic text-muted-foreground">Brak promów</p> }
						</div>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild><Button className="bg-red-400 text-secondary-foreground hover:bg-red-500" onClick={ () => setOtwartyModal(false) } disabled={przetwarzanie}>{ dane.id ? "Zamknij" : "Anuluj" }</Button></DialogClose>
					{ mozliwoscEdycji && <Button className="bg-green-400 text-secondary-foreground hover:bg-green-600" onClick={() => oddajTrase(dane)} disabled={przetwarzanie}>{ przetwarzanie ? "Trwa oddawanie..." : dane.id ? "Popraw raport" : "Utwórz raport" }</Button> }
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
});

const OpisNaglowka = memo(({id, zatwierdz, kiedy, kara, dozwolpoprawke, powododrzuc, wlasnyzarobek}) => {
		if(!id){
			return <span className="font-bold">Wypełnij poniższy formularz, aby oddać nową trasę do sprawdzenia w dyspozytorni.</span>
		} else {
			//istniejaca trasa
			switch(zatwierdz){
				case 0:
					return <>
						<span className="text-blue-400 font-bold">Poniżej znajduje się stan informacji Twojej oddanej trasy.</span><br/>
						<span className="text-blue-300">{(new Date(kiedy).getTime() + 25 * 3600 * 1000 > (Date.now())) ? "Masz jeszcze możliwość wprowadzenia ewentualnych poprawek." : "Czas na wprowadzenie poprawek minął." }</span>
					</>
				case 1:
					return<>
						<span className="text-green-400 font-bold">Twoja trasa została sprawdzona i zatwierdzona przez dyspozytora.</span><br />
						<span className="text-green-300">Zarobek własny z tej trasy wynosi: <b>{wlasnyzarobek.toLocaleString("pl-PL", {style: "currency", currency: "PLN"})}</b></span><br/>
						{ kara ? <span className="text-yellow-400">Została nałożona na Ciebie grzywna w wysokości: <b>{ kara.toLocaleString("pl-PL", { style: "currency", currency: "PLN" }) }</b></span> : <span className="text-green-300">Nie nałożono na Ciebie żadnej grzywny pieniężnej.</span> }
					</>
				case 2:
					if(dozwolpoprawke){
						if(powododrzuc) return <>
							<span className="text-orange-400 font-bold">Twoja trasa została odrzucona do poprawy z powodu:</span><br/>
							<b className="text-yellow-400">{powododrzuc}</b>
						</>
						else return <span className="text-orange-400 font-bold">Twoja trasa została odrzucona do poprawy bez podania powodu.</span>
					} else {
						if(powododrzuc) return <>
							<span className="text-red-500 font-bold">Twoja trasa została odrzucona permanentnie z powodu:</span><br/>
							<b className="text-yellow-400">{powododrzuc}</b>
						</>
						else return <span className="text-red-500 font-bold">Twoja trasa została odrzucona permanentnie bez podania powodu.</span>
					}
			}
		}
	});