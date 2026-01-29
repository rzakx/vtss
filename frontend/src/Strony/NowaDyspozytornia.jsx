import { useEffect, useCallback, useState, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Nawigacja from "../Komponenty/Nawigacja";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiArrowNarrowRight } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import Axios from "axios";
import gb from "../GlobalVars";
import { FaSistrix } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const WIERSZE_PER_STRONA = 8;

const NowaDyspozytornia = () => {
	const navigate = useNavigate();
	const [ zakladka, setZakladka ] = useState("oczekujace"); // oczekujace / historia

	const [ miastaLoaded, setMiastaLoaded ] = useState(false);
	const [ miasta, setMiasta ] = useState([]);
	const [ uzytkownicyLoaded, setUzytkownicyLoaded ] = useState(false);
	const [ uzytkownicy, setUzytkownicy ] = useState([]);

	const [ oczekujaceTrasyLoaded, setOczekujaceTrasyLoaded ] = useState(false);
	const [ oczekujaceTrasy, setOczekujaceTrasy ] = useState([]);
	const [ oczekujaceWybranaStrona, setOczekujaceWybranaStrona ] = useState(1);
	const oczekujaceDostepneStrony = useMemo(() => oczekujaceTrasy.length ? Math.max( 1, Math.ceil( oczekujaceTrasy.length / WIERSZE_PER_STRONA ) ) : 1, [oczekujaceTrasy.length]);
	const oczekujacePaginacja = useMemo(() => [...oczekujaceTrasy].slice( (oczekujaceWybranaStrona - 1) * WIERSZE_PER_STRONA, oczekujaceWybranaStrona * WIERSZE_PER_STRONA), [oczekujaceTrasy, oczekujaceWybranaStrona]);

	const [ historiaLoaded, setHistoriaLoaded ] = useState(false);
	const [ historia, setHistoria ] = useState([]);
	const [ historiaWybranaStrona, setHistoriaWybranaStrona ] = useState(1);
	const historiaDostepneStrony = useMemo(() => historia.length ? Math.max( 1, Math.ceil( historia.length / WIERSZE_PER_STRONA ) ) : 1, [historia.length]);
	const historiaPaginacja = useMemo(() => [...historia].slice( (historiaWybranaStrona - 1) * WIERSZE_PER_STRONA, historiaWybranaStrona * WIERSZE_PER_STRONA), [historia, historiaWybranaStrona]);

	const wczytajHistoria = useCallback(async () => {
		await Axios.post(gb.backendIP+"dyspHistoria/").then((r) => {
			if(r.data['dane']) setHistoria(r.data['dane'])
			else setHistoria([]);
		}).catch((er) => {
			toast.error("Błąd wczytywania historii", { description: "Historia nie została wczytana z powodu: "+er.message});
			setHistoria([]);
		}).finally(() => {
			setHistoriaLoaded(true);
		});
	}, []);

	const wczytajOczekujace = useCallback(async () => {
		await Axios.post(gb.backendIP+"dyspozytorTrasy").then((r) => {
			if(r.data['dane']) {
				toast.success("Wczytano oczekujące trasy", { description: "Pomyślnie wczytano oczekujące na rozpatrzenie trasy."});
				setOczekujaceTrasy(r.data['dane']);
			} else setOczekujaceTrasy([]);
		}).catch((er) => {
			toast.error("Błąd wczytywania tras", { description: "Oczekujące trasy nie mogły zostać wczytane. Powód: "+er.message });
			setOczekujaceTrasy([]);
		}).finally(() => setOczekujaceTrasyLoaded(true));
	}, []);

	const wczytajUzytkownikow = useCallback(async () => {
		await Axios.post(gb.backendIP+"listaUzytkownikow").then((r) => {
			if(r.data['blad']){
                toast.error("Błąd wczytywania użytkowników", { description: "Wystąpił błąd podczas wczytywania listy użytkowników. Powód: " + (r.data["blad"] || "Nieznane") });
				setUzytkownicy([]);
			} else {
				setUzytkownicy(r.data);
			}
		}).catch((er) => {
            toast.error("Błąd wczytywania użytkowników", { description: "Wystąpił błąd podczas wczytywania listy użytkowników. Powód: " + er.message });
			setListaUzytkownikow({wczytane: true, zawartosc: []});
		}).finally(() => setUzytkownicyLoaded(true));
	}, []);

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
		}).finally(() => setMiastaLoaded(true));
	}, []);

	useEffect(() => {
		if(!uzytkownicyLoaded){
			wczytajUzytkownikow();
			return;
		}
		if(!historiaLoaded) {
			wczytajHistoria();
			return;
		}
		if(!miastaLoaded) {
			wczytajMiasta();
			return;
		}
		if(!oczekujaceTrasyLoaded) wczytajOczekujace();
		return;
	}, [ uzytkownicyLoaded, wczytajUzytkownikow, historiaLoaded, wczytajHistoria, miastaLoaded, wczytajMiasta, oczekujaceTrasyLoaded, wczytajOczekujace ]);

	return(
		<>
			<Nawigacja />
			<Toaster richColors />
			<div className="tlo" />
			<div className="srodekekranu">
				<Tabs value={zakladka} onValueChange={setZakladka} className="w-full max-w-7xl">
					<TabsList>
						<TabsTrigger value="oczekujace">Oczekujące trasy</TabsTrigger>
						<TabsTrigger value="historia">Historia dyspozytorni</TabsTrigger>
					</TabsList>
					<TabsContent value="oczekujace">
						<Card>
							<CardHeader>
								<CardTitle>Oczekujące trasy</CardTitle>
								<CardDescription>Znajdziesz tutaj zgłoszone, oczekujące na sprawdzenie raporty kierowców z ich wykonanych zleceń.</CardDescription>
								<CardAction>
									<div className="flex flex-col gap-1 max-w-35">
										<Button size="sm" className="h-7" variant="outline" onClick={() => setOczekujaceTrasyLoaded(false)} disabled={!oczekujaceTrasyLoaded}>Odśwież trasy</Button>
										<form
											onSubmit={(e) => {
												e.preventDefault();
												let tmp = e.currentTarget.elements.namedItem("reczneID").value;
												if(!tmp) return;
												if(isNaN(tmp)) return;
												navigate("/dyspozytornia/"+tmp);
											}}
											className="flex gap-1"
										>
											<Input type="number" min={0} name="reczneID" className="h-7 text-xs! text-center font-bold text-yellow-400" placeholder="Ręczne ID" required />
											<Button type="submit" className="h-7 px-2! hover:bg-yellow-400"><FaSistrix /></Button>
										</form>
									</div>
								</CardAction>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow className="bg-muted!">
											<TableHead className="w-13 text-center">ID</TableHead>
											<TableHead className="w-18 text-center">Gra</TableHead>
											<TableHead className="w-60 text-center">Data</TableHead>
											<TableHead className="text-center">Lokalizacja</TableHead>
											<TableHead className="text-center">Ładunek</TableHead>
											<TableHead className="text-center">Kierowca</TableHead>
											<TableHead className="text-center w-24">Akcja</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
									{ uzytkownicyLoaded
										? uzytkownicy.length
											? miastaLoaded
												? miasta.length
													? oczekujaceTrasyLoaded
														? oczekujacePaginacja.length
															? oczekujacePaginacja.map((trasa) => {
																let kierowca = uzytkownicy.find(x => x.id === trasa.kto);
																let skad = miasta.find((w) => w.id === trasa.od) || null;
																let dokad = miasta.find((w) => w.id === trasa.do) || null;
																return(
																	<TableRow key={`trasa_${trasa.id}`}>
																		<TableCell className="text-center">{trasa.id}</TableCell>
																		<TableCell className="text-center">{ trasa.gra ? <img className="min-w-12 min-h-12 w-12 h-12 inline" src={"/img/trasaats.png"} /> : <img className="min-w-12 min-h-12 w-12 h-12 inline" src={"/img/trasaets.png"} /> }</TableCell>
																		<TableCell className="text-center">{ new Date(trasa.kiedy).toLocaleString("pl-PL", { hour: "2-digit", minute: "2-digit" }) } - { new Date(trasa.kiedy).toLocaleString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) }</TableCell>
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
																		<TableCell className="text-center">
																			{ (kierowca === undefined)
																				? <span className="text-orange-400 font-bold italic">Konto usunięte</span>
																				: <a className="hover:tracking-normal!" href={`/profil/${kierowca.login}`} target="_blank" referrerPolicy="origin"><Button variant="ghost" className="h-12 text-base"><img src={"/img/"+kierowca.awatar} className="inline w-8 h-8 mr-2" /> <span>{kierowca.login}</span></Button></a>
																			}
																		</TableCell>
																		<TableCell className="text-center w-24">
																			<a className="hover:tracking-normal! text-inherit!" href={"/dyspozytornia/"+trasa.id}><Button variant="outline" className="w-full" size="sm">Rozpatrz</Button></a>
																		</TableCell>
																	</TableRow>
																)
															})
															: <TableRow><TableCell colSpan={7} className="text-center py-20"><span>Brak tras oczekujących na rozpatrzenie!</span></TableCell></TableRow>
														: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie tras oczekujących na rozpatrzenie...</span></TableCell></TableRow>
													: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Baza danych miejscowości jest pusta...</span></TableCell></TableRow>
												: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie miejscowości...</span></TableCell></TableRow>
											: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Baza danych użytkowników jest pusta...</span></TableCell></TableRow>
										: <TableRow><TableCell colSpan={7} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie listy użytkowników...</span></TableCell></TableRow>
									}
									</TableBody>
									<TableFooter>
										<TableRow className="bg-accent!">
											<TableCell colSpan={7}><div className="flex justify-between gap-2 items-center select-none">
												<Button
													variant={"outline"}
													className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
													onClick={() => setOczekujaceWybranaStrona( (p) => p - 1 ) }
													disabled={ oczekujaceWybranaStrona <= 1 }
												>Poprzednia</Button>
												<p className="text-center">Strona {oczekujaceWybranaStrona} z {oczekujaceDostepneStrony}</p>
												<Button
													variant={"outline"}
													className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
													onClick={ () => setOczekujaceWybranaStrona( (p) => p + 1 ) }
													disabled={ oczekujaceWybranaStrona >= oczekujaceDostepneStrony }
												>Następna</Button>
											</div></TableCell>
										</TableRow>
									</TableFooter>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="historia">
						<Card>
							<CardHeader>
								<CardTitle>Historia dyspozytorni</CardTitle>
								<CardDescription>Znajdziesz tutaj historię działań odnoszących się do sprawdzanych tras.</CardDescription>
								<CardAction>
									<Button variant="outline" onClick={() => setHistoriaLoaded(false)} disabled={!historiaLoaded}>Odśwież</Button>
								</CardAction>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow className="bg-muted!">
											<TableHead className="text-center w-24">Dys. ID</TableHead>
											<TableHead className="text-center w-64">Data</TableHead>
											<TableHead className="text-center">Dyspozytor</TableHead>
											<TableHead className="text-center">Decyzja</TableHead>
											<TableHead className="text-center w-32">ID Trasy</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
									{ uzytkownicyLoaded
										? uzytkownicy.length
											? historiaLoaded
												? historiaPaginacja.length
													? historiaPaginacja.map((his) => {
														const dyspozytor = uzytkownicy.find(x => x.id === his.kto);
														return(
															<TableRow key={`dyspHistoria_${his.id}`}>
																<TableCell className="text-center w-24">#{his.id}</TableCell>
																<TableCell className="text-center w-64">{ new Date(his.kiedy).toLocaleString("pl-PL", { hour: "2-digit", minute: "2-digit" }) } - { new Date(his.kiedy).toLocaleString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) }</TableCell>
																<TableCell className="text-center">
																	{ (dyspozytor === undefined)
																		? <span className="text-orange-400 font-bold italic">Konto usunięte</span>
																		: <a className="hover:tracking-normal!" href={`/profil/${dyspozytor.login}`} target="_blank" referrerPolicy="origin"><Button variant="ghost" className="h-12 text-base"><img src={"/img/"+dyspozytor.awatar} className="inline w-8 h-8 mr-2" /> <span>{dyspozytor.login}</span></Button></a>
																	}
																</TableCell>
																<TableCell className="text-center"><Badge className={`${his.akcja ? "bg-green-500 text-red-100" : "bg-red-500 text-red-100"} font-bold tracking-wide`}>{ his.akcja ? "Trasa zatwierdzona" : "Trasa odrzucona" }</Badge></TableCell>
																<TableCell className="text-center w-32"><a className="hover:tracking-normal!" href={"/dyspozytornia/"+his.trasa}><Button variant="ghost" size="sm" className="text-base">{his.trasa}</Button></a></TableCell>
															</TableRow>
														)
													})
													: <TableRow><TableCell colSpan={5} className="text-center py-20"><span>Historia działań w dyspozytorni jest pusta!</span></TableCell></TableRow>
												: <TableRow><TableCell colSpan={5} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie historii działań w dyspozytorni...</span></TableCell></TableRow>
											: <TableRow><TableCell colSpan={5} className="text-center py-20"><span className="animate-pulse">Baza danych użytkowników jest pusta...</span></TableCell></TableRow>
										: <TableRow><TableCell colSpan={5} className="text-center py-20"><span className="animate-pulse">Trwa wczytywanie listy użytkowników...</span></TableCell></TableRow>
									}
									</TableBody>
									<TableFooter>
										<TableRow className="bg-accent!">
											<TableCell colSpan={5}><div className="flex justify-between gap-2 items-center select-none">
												<Button
													variant={"outline"}
													className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
													onClick={() => setHistoriaWybranaStrona( (p) => p - 1 ) }
													disabled={ historiaWybranaStrona <= 1 }
												>Poprzednia</Button>
												<p className="text-center">Strona {historiaWybranaStrona} z {historiaDostepneStrony}</p>
												<Button
													variant={"outline"}
													className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
													onClick={ () => setHistoriaWybranaStrona( (p) => p + 1 ) }
													disabled={ historiaWybranaStrona >= historiaDostepneStrony }
												>Następna</Button>
											</div></TableCell>
										</TableRow>
									</TableFooter>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</>
	)
};

export default NowaDyspozytornia;