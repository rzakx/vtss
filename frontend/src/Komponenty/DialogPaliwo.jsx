import { memo,useState, useCallback, useEffect, useMemo } from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogContent, AlertDialogTitle, AlertDialogHeader, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaPen, FaCheckCircle } from "react-icons/fa";
import { MdLockReset } from "react-icons/md";

const flagaStawki = {
    'Albania': '/img/flagi/albania.png',
    'Austria': '/img/flagi/austria.png',
    'Belgium': '/img/flagi/belgia.png',
    'Bosnia-Herzegovina': '/img/flagi/bosniaihercegowina.png',
    'Bulgaria': '/img/flagi/bulgaria.png',
    'Croatia': '/img/flagi/chorwacja.png',
    'Czech': '/img/flagi/czechy.png',
    'Denmark': '/img/flagi/dania.png',
    'Estonia': '/img/flagi/estonia.png',
    'Finland': '/img/flagi/finlandia.png',
    'France': '/img/flagi/francja.png',
    'Germany': '/img/flagi/niemcy.png',
    'Hungary': '/img/flagi/wegry.png',
    'Italy': '/img/flagi/wlochy.png',
    'Kosovo': '/img/flagi/kosowo.png',
    'Latvia': '/img/flagi/lotwa.png',
    'Lithuania': '/img/flagi/litwa.png',
    'Luxembourg': '/img/flagi/luksemburg.png',
    'Macedonia': '/img/flagi/polnocnamacedonia.png',
    'Montenegro': '/img/flagi/czarnogora.png',
    'Netherlands': '/img/flagi/holandia.png',
    'Norway': '/img/flagi/norwegia.png',
    'Poland': '/img/flagi/polska.png',
    'Portugal': '/img/flagi/portugalia.png',
    'Romania': '/img/flagi/rumunia.png',
    'Russia': '/img/flagi/rosja.png',
    'Serbia': '/img/flagi/serbia.png',
    'Slovakia': '/img/flagi/slowacja.png',
    'Slovenia': '/img/flagi/slowenia.png',
    'Spain': '/img/flagi/hiszpania.png',
    'Sweden': '/img/flagi/szwecja.png',
    'Switzerland': '/img/flagi/szwajcaria.png',
    'Turkey': '/img/flagi/turcja.png',
    'uk': '/img/flagi/wielkabrytania.png',
    'Aland': '/img/flagi/wyspyalandzkie.png',
    'Andorra': '/img/flagi/andorra.png',
    'Armenia': '/img/flagi/armenia.png',
    'Azerbaidjan': '/img/flagi/azerbejdzan.png',
    'Belarus': '/img/flagi/bialorus.png',
    'Cyprus': '/img/flagi/cypr.png',
    'Faroe Islands': '/img/flagi/wyspyowcze.png',
    'Georgia': '/img/flagi/gruzja.png',
    'Greece': '/img/flagi/grecja.png',
    'Greenland': '/img/flagi/grenlandia.png',
    'Guernsey': '/img/flagi/wielkabrytania.png',
    'Iceland': '/img/flagi/islandia.png',
    'Ireland': '/img/flagi/irlandia.png',
    'Isle of Man': '/img/flagi/wyspaman.png',
    'Jersey': "/img/flagi/jersey.png",
    'Liechtenstein': "/img/flagi/liechtenstein.png",
    'Malta': '/img/flagi/malta.png',
    'Moldova': '/img/flagi/moldawia.png',
    'Monaco': '/img/flagi/monako.png',
    'Northern Ireland': '/img/flagi/irlandiapolnocna.png',
    'San Marino': '/img/flagi/sanmarino.png',
    'Svalbard': '/img/flagi/norwegia.png',
    'Ukraine': '/img/flagi/ukraina.png',
    'Egypt': '/img/flagi/egipt.png',
    'Iraq': '/img/flagi/irak.png',
    'Israel': '/img/flagi/izrael.png',
    'Jordan': '/img/flagi/jordan.png',
    'Lebanon': '/img/flagi/liban.png',
    'Libya': "/img/flagi/libia.png",
    'Saudi Arabia': "/img/flagi/arabiasaudyjska.png",
    'Syria': "/img/flagi/syria.png",
    'westbank': "/img/flagi/palestyna.png"
};

const DialogPaliwo = ({isOpen, setOpen, toast}) => {
	const [ loaded, setLoaded ] = useState(false);
	const [ action, setAction ] = useState(false);
	const [ fuel, setFuel ] = useState([]);
	const [ filter, setFilter] = useState({nazwa: "", gra: -1, wybrany: undefined, wartosc: undefined});

	const fetchFuel = useCallback(async () => {
		setLoaded(false);
		await Axios.post(gb.backendIP+"stawkiPaliwowe").then((r) => {
			setFuel(r.data);
		}).catch((er) => {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Wystąpił błąd podczas wczytywania zapisanych stawek paliwowych. ERR: "+er.message,
			});
			setFuel([]);
		});
		setLoaded(true);
	}, [toast]);

	const changeFuel = async () => {
		if(!parseFloat(filter.wartosc)) {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Niepoprawna wartość ceny za litr."
			});
			setAction(false);
			return;
		}
		await Axios.post(gb.backendIP+"aktualizujStawkePaliwa/"+localStorage.getItem("token"), {
			id: filter.wybrany,
			nowaStawka: parseFloat(filter.wartosc),
			name: fuel.find(x => x.id == filter.wybrany) ? fuel.find(x => x.id == filter.wybrany).name : "Nieznane"
		}).then((r) => {
			if(r.data['blad']){
				toast({
					title: "Wystąpił błąd",
					variant: "destructive",
					description: "Niewykonano zmiany z powodu: "+r.data['blad']
				});
				setLoaded(false);
				setFuel([])
				setFilter(x => ({...x, wybrany: undefined, wartosc: undefined}));
			} else {
				toast({
					title: "Stawka paliwowa",
					className: "bg-green-500 text-green-50",
					description: r.data['odp'],
				});
				setFuel([]);
				setLoaded(false);
				setFilter(x => ({...x, wybrany: undefined, wartosc: undefined}));
			}
		}).catch((er) => {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Niewykonano zmiany z powodu: "+er.message
			});
			// setPaliwo(x => ({...x, akcja: false}))
			setFilter(x => ({...x, wybrany: undefined, wartosc: undefined}));
		});
		setAction(false);
	};

	const filteredByGame = useMemo(() => {
		if(fuel.length){
			if(filter.gra !== -1) return fuel.filter(x => x.gra === filter.gra);
			return fuel;
		} else {
			return [];
		}
	}, [filter.gra, fuel]);

	const filteredContent = useMemo(() => {
		if(filteredByGame.length){
			if(filter.nazwa != "") return filteredByGame.filter(p => p.name.toLowerCase().includes(filter.nazwa.toLowerCase()));
			return filteredByGame;
		} else {
			return [];
		}
	}, [filter.nazwa, filteredByGame]);

	useEffect(() => {
		if(!isOpen) return;
		if(!loaded) fetchFuel();
	})

	return(
		<Dialog open={isOpen} onOpenChange={(e) => setOpen(e)}>
			<DialogTrigger asChild>
				<Button className="grow">Ceny paliw</Button>
			</DialogTrigger>
			<DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-[900px!important]">
				<DialogHeader>
					<DialogTitle>Stawki paliwowe</DialogTitle>
					<DialogDescription>Tutaj możesz zmodyfikować stawkę naliczaną na stacjach paliwowych za litr w poszczególnych regionach konkretnej gry.</DialogDescription>
				</DialogHeader>
				<Button variant="link" size="sm" className="absolute top-2.25 right-9 text-xs" onClick={() => {
					setFilter({nazwa: "", gra: -1, wybrany: undefined, wartosc: undefined});
					fetchFuel();
				}} >Odśwież</Button>
				<div className="space-y-2">
					<div className="space-x-2 w-full flex">
						<Select value={filter.gra} onValueChange={(e) => setFilter((p) => ({ ...p, gra: e })) } disabled={action}>
							<SelectTrigger>
								<SelectValue placeholder="Gra"></SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={-1}>Wybierz</SelectItem>
								<SelectItem value={0}>Euro Truck Simulator 2</SelectItem>
								<SelectItem value={1}>American Truck Simulator</SelectItem>
							</SelectContent>
						</Select>
						<Input placeholder="Wyszukiwanie po nazwie regionu..." className="grow" value={ filter.nazwa ?? "" } onChange={(e) => setFilter((p) => ({ ...p, nazwa: e.target.value })) } disabled={action} />
					</div>
					{ loaded ?
						fuel.length ?
							filteredContent.length
								? <div className="flex flex-wrap gap-4 max-h-[70vh] overflow-y-auto mt-4 pr-2">
									{filteredContent.map((stawka) => {
										return(
											<div key={`paliwo_${stawka.id}`} className="dark:bg-zinc-900 rounded-xl p-2 flex justify-between grow max-w-70 overflow-hidden" >
												<img className="w-16 h-12 mr-2 rounded-lg self-center" src={stawka.gra ? "/img/flagi/usa.png" : flagaStawki[stawka.name]} />
												<div className="flex grow justify-center items-center flex-col px-2 space-y-1">
													<h3 className="font-extrabold text-nowrap">{stawka.name}</h3>
													<div className="text-sm flex relative items-center [&_button]:transition-colors [&_button]:duration-300">
														<BsFuelPumpFill className="absolute left-0 top-0 bottom-0 w-8 h-full px-2" />
														<Input
															className="grow rounded-none py-1 h-auto disabled:opacity-90 pl-8 w-37.5"
															disabled={stawka.id != filter.wybrany}
															value={stawka.id != filter.wybrany ? stawka.stawka : filter.wartosc}
															onChange={(e) => {
																(filter.wybrany != undefined) && setFilter(p => ({...p, wartosc: e.target.value}))
															}}
														/>
														{
															(stawka.id === filter.wybrany) ?
															<div className="absolute right-0 top-0 bottom-0">
																<AlertDialog>
																	<AlertDialogTrigger asChild>
																		<button className="h-full px-2 bg-green-400/40 hover:bg-green-400 cursor-pointer"><FaCheckCircle /></button>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
																			<AlertDialogDescription>
																				Czy aby napewno chcesz zmienić cenę paliwa w regionie <b className="text-blue-400">{stawka.name}</b> z <b className="text-red-400">{parseFloat(stawka.stawka).toLocaleString( "pl-PL", { style: "currency", currency: "PLN", minimumFractionDigits: 3 } )}</b> / litr na <b className="text-green-400">{parseFloat(filter.wartosc) ? parseFloat(filter.wartosc).toLocaleString( "pl-PL", { style: "currency", currency: "PLN", minimumFractionDigits: 3 } ) : "???"}</b> / litr?
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
																			<AlertDialogAction
																				className="cursor-pointer"
																				onClick={ () => changeFuel() }
																			>Potwierdź</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
																<button className="h-full px-1.5 bg-red-500/40 hover:bg-red-500 cursor-pointer border-l border-l-zinc-300" onClick={() => setFilter(p => ({...p, wybrany: undefined, wartosc: undefined}))}>
																	<MdLockReset className="text-[1.1rem]" />
																</button>
															</div>
															: <button className="absolute right-0 top-0 bottom-0 px-2 bg-zinc-600 hover:bg-orange-400 cursor-pointer" onClick={() => setFilter(p => ({...p, wybrany: stawka.id, wartosc: stawka.stawka}))}><FaPen /></button>
														}
													</div>
												</div>
											</div>
										)
									})}
								</div>
								: <div className="flex grow h-40 items-center justify-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Brak wyników filtrowania 🙄</b></div>
							: <div className="flex grow h-40 items-center justify-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Brak dostępnych danych 🙄</b></div>
						: <div className="flex grow h-40 items-center justify-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Trwa wczytywanie...</b></div>
					}
				</div>
			</DialogContent>
		</Dialog>
	)
};
export default memo(DialogPaliwo);