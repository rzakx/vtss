import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nawigacja from "../Komponenty/Nawigacja";
import { Card, CardAction, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { TbReportMoney } from "react-icons/tb";
import { RiSparkling2Line } from "react-icons/ri";
import { GiShatteredGlass } from "react-icons/gi";
import { AlertTriangleIcon, CalendarRangeIcon, DatabaseZapIcon, FuelIcon, Gamepad2Icon, GaugeIcon, HandCoinsIcon, HardDriveIcon, IdCardIcon, LoaderCircleIcon, MapPinCheckIcon, MapPinHouseIcon, PackageIcon, RadiationIcon, RouteIcon, ShipIcon, WeightTildeIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Axios from "axios";
import { cn } from "../lib/utils";
import gb from "../GlobalVars";
import { FaExpand, FaTrailer, FaTruckLoading } from "react-icons/fa";

const OpisNaglowka = memo(({zatwierdz, kara, dozwolpoprawke, powododrzuc, wlasnyzarobek}) => {
	switch(zatwierdz){
		case 0:
			if(powododrzuc){
				return <>
					<span>Zapoznaj się z poniższymi informacjami i sprawdź ich poprawność.</span><br/>
					<span>Jeśli trasa wydaje się być poprawna, zatwierdź ją. W przeciwnym przypadku odrzuć trasę podając uzasadnienie.</span><br />
					<span className="text-blue-400 font-bold">Trasa została poprawiona. Powodem wcześniejszego odrzucenia było:</span><br />
					<span className="text-blue-300">{powododrzuc}</span>
				</>
			} else {
				return <>
					<span>Zapoznaj się z poniższymi informacjami i sprawdź ich poprawność.</span><br/>
					<span>Jeśli trasa wydaje się być poprawna, zatwierdź ją. W przeciwnym przypadku odrzuć trasę podając uzasadnienie.</span>
				</>
			}
		case 1:
			return<>
				<span className="text-green-400 font-bold">Trasa kierowcy została już sprawdzona i zatwierdzona przez dyspozytora.</span><br />
				<span className="text-green-300">Zarobek własny kierowcy z tej trasy wynosi: <b>{wlasnyzarobek.toLocaleString("pl-PL", {style: "currency", currency: "PLN"})}</b></span><br/>
				{ kara ? <span className="text-yellow-400">Została nałożona na kierowcę grzywna w wysokości: <b>{ kara.toLocaleString("pl-PL", { style: "currency", currency: "PLN" }) }</b></span> : <span className="text-green-300">Nie nałożono na kierowcę żadnej grzywny pieniężnej.</span> }
			</>
		case 2:
			if(dozwolpoprawke){
				if(powododrzuc) return <>
					<span className="text-orange-400 font-bold">Trasa kierowcy została już sprawdzona i odrzucona do poprawy z powodu:</span><br/>
					<b className="text-yellow-400">{powododrzuc}</b>
				</>
				else return <span className="text-orange-400 font-bold">Trasa kierowcy została już sprawdzona i odrzucona do poprawy bez podania powodu.</span>
			} else {
				if(powododrzuc) return <>
					<span className="text-red-500 font-bold">Trasa kierowcy została już sprawdzona i odrzucona permanentnie z powodu:</span><br/>
				<b className="text-yellow-400">{powododrzuc}</b>
			</>
			else return <span className="text-red-500 font-bold">Trasa kierowcy została już sprawdzona i odrzucona permanentnie bez podania powodu.</span>
		}
	}
});

const procenty = [
	[], [], [], [],
	[0, 45, 100, 100, 100, 100,  100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
	[0, 35,  70, 100, 100, 100,  100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
	[0, 20,  40,  60,  80, 100,  100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
	[0, 20,  40,  60,  80, 100,  100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
	[0, 15,  30,  40,  65,  75,   85, 100, 100, 100, 100, 100, 100, 100, 100, 100],
	[0, 15,  30,  40,  65,  75,   85, 100, 100, 100, 100, 100, 100, 100, 100, 100],
	[0, 10,  15,  30,  45,  55,   60,  70,  80,  90, 100, 100, 100, 100, 100, 100],
	[0, 10,  15,  30,  45,  55,   60,  70,  80,  90, 100, 100, 100, 100, 100, 100],
	[0,  5,  10,  15,  20,  25,   30,  35,  40,  45,  50,  60,  70,  80,  90, 100],
	[0,  5,  10,  15,  20,  25,   30,  35,  40,  45,  50,  60,  70,  80,  90, 100]
];

const RozpatrzenieOdrzuc = memo(({otwarte, setOtwarte, navigate, idtrasy}) => {
	const [ powod, setPowod ] = useState("");
	const [ dozwolpoprawke, setDozwolpoprawke ] = useState(true);
	const [ przetworz, setPrzetworz ] = useState(false);

	const rozpatrz = useCallback(async () => {
		setPrzetworz(true);
		let bodyData = {
			zatwierdz: 2,
			dozwolpoprawe: 1,
			powod: "Nie podano."
		};
        if(!dozwolpoprawke) bodyData.dozwolpoprawe = 0;
        if(powod) bodyData.powod = powod;

		await Axios.post(gb.backendIP+"rozpatrzenieTrasy/"+localStorage.getItem('token')+"/"+idtrasy, {...bodyData}).then((res) => {
			if(res.data['blad']){
				toast.error("Wystąpił błąd", { description: res.data['blad'], duration: 5_500 });
				setPrzetworz(false);
			} else {
				toast.success("Trasa została odrzucona", { description: "Za chwilę zostaniesz przeniesiony do dyspozytorni.", duration: 5_500 });
				const powrotTimeout = setTimeout(() => {
					navigate("/dyspozytornia/");
					return () => clearTimeout(powrotTimeout);
				}, 6000);
			}
		}).catch((er) => {
			toast.error("Wystąpił błąd", { description: er.message, duration: 5_500 });
			setPrzetworz(false);
		});
	}, [idtrasy, navigate, powod, dozwolpoprawke]);

	return(
		<Drawer open={otwarte === "odrzuc"} onOpenChange={() => !przetworz && setOtwarte(undefined) }>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Odrzucanie trasy</DrawerTitle>
					<DrawerDescription>Zdecyduj czy trasa odrzucana jest do poprawy, czy permanentnie.<br/>Możesz również opcjonalnie podać powód odrzucenia.</DrawerDescription>
				</DrawerHeader>
				<div className="w-full max-w-200 mx-auto px-4">
					<div className="flex justify-between">
						<Label htmlFor="powododrzuc">Powód odrzucenia:</Label>
						<div className="flex gap-2 items-center">
							<Label htmlFor="dozwolpoprawke">Czy do poprawy?</Label>
							<Switch
								id="dozwolpoprawke"
								checked={dozwolpoprawke}
								disabled={przetworz}
								onCheckedChange={(e) => setDozwolpoprawke(e) }
								className="data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500 cursor-pointer"
							/>
							<span className="cursor-pointer text-sm font-bold" onClick={() => !przetworz && setDozwolpoprawke(x => !x) }>{ dozwolpoprawke ? "TAK" : "NIE" }</span>
						</div>
					</div>
					<Textarea
						id="powododrzuc"
						value={powod ?? ""}
						placeholder="Wprowadź tekst..."
						onChange={ (e) => setPowod(e.target.value) }
						disabled={przetworz}
						className="resize-none mt-3"
					/>
				</div>
				<DrawerFooter className="flex flex-row justify-center">
					<DrawerClose asChild>
						<Button disabled={przetworz} className="bg-amber-200 text-amber-800 hover:bg-amber-700 hover:text-amber-100">Anuluj</Button>
					</DrawerClose>
					<Button disabled={przetworz} className="disabled:opacity-100 disabled:bg-red-500 disabled:text-red-100 bg-red-300 text-red-800 hover:bg-red-500 hover:text-red-100" onClick={() => rozpatrz() }>{ przetworz ? "Trwa odrzucanie" : "Odrzuć trasę" }{ przetworz && <LoaderCircleIcon className="animate-spin" />}</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
})

const RozpatrzenieZatwierdz = memo(({otwarte, setOtwarte, navigate, adr, delikatny, gabaryt, tandem, uszkodzenia, stanowisko, stawka, przejechane, idtrasy, idkierowcy, kosztpaliwa, zarobekcalkowity}) => {
	const [ przetworz, setPrzetworz ] = useState(false);
	const [ premia, setPremia ] = useState("");
	const [ kara, setKara ] = useState("");

	const oknoPremii = useMemo(() => (adr || delikatny || gabaryt || tandem), [adr, delikatny, gabaryt, tandem]);
	const wyliczonyZarobek = useMemo(() => {
		let tmpPremia = 0;
		if(premia) tmpPremia = premia;
		return parseFloat(przejechane) * parseFloat(stawka) + parseFloat(tmpPremia);
	}, [stawka, premia, przejechane]);

	const wyliczonaKara = useMemo(() => {
		if(!(uszkodzenia > 0)) return { kwota: 0, procent: 0 };
		const mnoznik = Math.min(15, Math.round(uszkodzenia));
		const wstepnaKara = procenty[stanowisko][mnoznik]*wyliczonyZarobek/100;
        const procent = procenty[stanowisko][mnoznik];
		return { kwota: wstepnaKara, procent: procent };
	}, [uszkodzenia, stanowisko, wyliczonyZarobek]);

	const rozpatrz = useCallback(async () => {
		setPrzetworz(true);
		let bodyData = {
			grzywna: 0,
			zatwierdz: 1,
			kto: idkierowcy,
			przejechane: przejechane,
			nadawanaPremia: 0,
			dlaFirmy: 0
		};
		if(premia){
			let tmpPremia = parseFloat(premia);
			if(!isNaN(tmpPremia)){
				tmpPremia = Number(tmpPremia.toFixed(2));
				bodyData.nadawanaPremia = tmpPremia;
			}
		}
		if(kara){
			let tmpGrzywna = parseFloat(kara);
			if(!isNaN(tmpGrzywna)){
				tmpGrzywna = Number(tmpGrzywna.toFixed(2));
				bodyData.grzywna = tmpGrzywna;
			}
		}
		
		bodyData.dlaFirmy = 0.02*parseFloat(zarobekcalkowity);
		if(bodyData.grzywna) bodyData.dlaFirmy = bodyData.dlaFirmy + bodyData.grzywna;
		if(bodyData.nadawanaPremia) bodyData.dlaFirmy = bodyData.dlaFirmy - bodyData.nadawanaPremia;
		if(kosztpaliwa) bodyData.dlaFirmy = bodyData.dlaFirmy - parseFloat(kosztpaliwa);
		bodyData.dlaFirmy = Number(parseFloat(bodyData.dlaFirmy).toFixed(2));
		
		await Axios.post(gb.backendIP+"rozpatrzenieTrasy/"+localStorage.getItem('token')+"/"+idtrasy, {...bodyData}).then((res) => {
			if(res.data['blad']){
				toast.error("Wystąpił błąd", { description: res.data['blad'], duration: 5_500 });
				setPrzetworz(false);
			} else {
				toast.success("Trasa została zatwierdzona", { description: "Za chwilę zostaniesz przeniesiony do dyspozytorni.", duration: 5_500 });
				const powrotTimeout = setTimeout(() => {
					navigate("/dyspozytornia/");
					return () => clearTimeout(powrotTimeout);
				}, 6000);
			}
		}).catch((er) => {
			toast.error("Wystąpił błąd", { description: er.message, duration: 5_500 });
			setPrzetworz(false);
		});
	}, [idtrasy, premia, kara, idkierowcy, przejechane, zarobekcalkowity, kosztpaliwa, navigate]);

	return(
		<Drawer open={otwarte === "zatwierdz"} onOpenChange={() => !przetworz && setOtwarte(undefined) }>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Zatwierdzanie trasy</DrawerTitle>
					<DrawerDescription>{ ( !uszkodzenia && !oknoPremii ) ? "Czy aby napewno chcesz zatwierdzić trasę?" : "Wprowadź opcjonalnie grzywnę i/lub premie, a następnie zatwierdź swoją decyzję."}</DrawerDescription>
				</DrawerHeader>
				{ ( (uszkodzenia > 0) || oknoPremii ) && <div className="w-full max-w-200 min-h-40 grow mx-auto px-4 flex flex-col items-center justify-center gap-3 pb-4">
					{ ( uszkodzenia > 0 ) && <div className="px-4 py-2 bg-card border border-input rounded-md flex gap-4 items-center">
						<p className="text-justify text-sm font-medium tracking-wider leading-relaxed text-zinc-300"><span className="text-red-400">W trasie wykryto uszkodzenia {uszkodzenia}%.</span> Możesz nałożyć opcjonalnie grzywnę. Z racji, że kierowca z tej trasy <span className="text-green-300">zarobi {wyliczonyZarobek.toLocaleString("pl-PL", {style: "currency", currency: "PLN"}) }</span> <span className="text-orange-300">proponowana kara wynosi { wyliczonaKara.kwota.toLocaleString("pl-PL", { style: "currency", currency: "PLN" }) }</span>, co stanowi {wyliczonaKara.procent}% zarobku.</p>
						<div className="min-w-40">
							<Label className="font-bold tracking-wider mb-1 block text-center">Wartość grzywny:</Label>
							<Input disabled={przetworz} className="text-center" type="number" step="0.01" min={0} value={kara ?? ""} placeholder="Opcjonalna" onChange={ (e) => setKara(e.target.value) } />
						</div>
					</div> }
					{ oknoPremii && <div className="px-4 py-2 bg-card border border-input rounded-md flex gap-4 items-center">
						<p className="text-justify text-sm font-semibold tracking-wider leading-relaxed text-zinc-300">
							Na kierowcę można nałożyć opcjonalną premię ponieważ ładunek w oddawanej trasie jest ładunkiem: { (adr == true) && <Badge className="bg-orange-500 text-orange-50 font-black">ADR</Badge> } { (delikatny == true) && <Badge className="bg-sky-500 text-sky-50 font-black">Delikatnym</Badge>} { (gabaryt == true) && <Badge className="bg-purple-500 text-purple-50 font-black">Gabarytowym</Badge>} { (tandem == true) && <Badge className="bg-emerald-500 text-emerald-50 font-black">Tandemowy</Badge>}
						</p>
						<div className="min-w-40">
							<Label className="font-bold tracking-wider mb-1 block text-center">Wartość premii:</Label>
							<Input disabled={przetworz} className="text-center" type="number" step="0.01" min={0} value={premia ?? ""} placeholder="Opcjonalna" onChange={ (e) => setPremia(e.target.value) } />
						</div>
					</div> }
				</div> }
				<DrawerFooter className="flex flex-row justify-center">
					<DrawerClose asChild>
						<Button disabled={przetworz} className="bg-amber-200 text-amber-800 hover:bg-amber-700 hover:text-amber-100">Anuluj</Button>
					</DrawerClose>
					<Button disabled={przetworz} className="disabled:opacity-100 disabled:bg-green-600 disabled:text-green-100 bg-green-300 text-green-800 hover:bg-green-600 hover:text-green-100" onClick={ () => rozpatrz() }>{ przetworz ? "Trwa zatwierdzanie" : "Zatwierdź trasę" }{ przetworz && <LoaderCircleIcon className="animate-spin" />}</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
});

const DyspozytorniaTrasa = (props) => {
	const { trasaID } = useParams();
	const navigate = useNavigate();
	const [ podglad, setPodglad ] = useState(undefined);
	const [ daneLoaded, setDaneLoaded ] = useState(false);
	const [ dane, setDane ] = useState({});
	const [ rozpatrzenie, setRozpatrzenie ] = useState(undefined);

	const wczytajDane = useCallback(async (id) => {
		await Axios.get(gb.backendIP+"noweDyspozytornia/"+localStorage.getItem("token")+"/"+id).then((r) => {
			if(r.data['blad']){
				// toast o bledzie
				toast.error("Błąd wczytywania trasy", { description: r.data['blad'] });
				setDane({blad: "Błąd wczytywania danych trasy. Powód: "+r.data['blad']});
			} else {
				// toast o pomyslnym wcyztaniu
				toast.success("Wczytano dane", { description: "Niezbędne informacje o trasie zostały wczytane." });
				setDane(r.data);
			}
		}).catch((er) => {
			// info o niewczytaniu
			toast.error("Błąd wczytywania trasy", { description: er.message });
			setDane({blad: "Błąd wczytywania danych trasy. Powód: "+er.message});
		}).finally(() => setDaneLoaded(true))
	}, []);

	useEffect(() => {
		if(!trasaID) return;
		if(daneLoaded) return;
		wczytajDane(trasaID)
	}, [wczytajDane, trasaID]);

	return(
		<>
			<Nawigacja />
			<div className="tlo" />
			<div className="srodekekranu">
				<Toaster richColors />
				<Card className="max-w-400! w-95/100">
					<CardHeader>
						<CardTitle>Rozpatrywanie trasy #{trasaID ?? "brak"}</CardTitle>
						{ (daneLoaded && !dane.blad ) && <CardDescription>
							<OpisNaglowka zatwierdz={dane.zatwierdz} kara={dane.kara} dozwolpoprawke={dane.dozwolpoprawke} powododrzuc={dane.powododrzuc} wlasnyzarobek={dane.wlasnyzarobek} />
						</CardDescription> }
						{ dane?.kierowca?.id && <CardAction>
							<a href={"/profil/"+dane.kierowca.login} target="_blank"><Button className="min-h-14 pl-1 pr-2 bg-tranparent hover:bg-input/30" size="sm">
								<img src={"https://system.thebossspedition.pl/img/"+dane.kierowca.awatar} className="object-contain object-center h-12 w-12 inline mr-0.5 rounded-sm" />
								<div>
									<p className="text-sm font-black text-muted-foreground text-center tracking-wider">Autor trasy</p>
									<p className="font-black tracking-widest text-base text-amber-400">{ dane.kierowca.login ?? "Usunięty kierowca" }</p>
								</div>
							</Button></a>
						</CardAction>}
					</CardHeader>
					<CardContent className="px-6 py-0 flex flex-col gap-4">
						{ daneLoaded ?
							!dane.blad ?
						<div className="grid grid-cols-4 gap-4 [&>div]:space-y-2 [&_>_div_*]:disabled:opacity-100">
							<div>
								<Label htmlFor="kiedy">Data raportu</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.kiedy ? `${new Date(dane.kiedy).toLocaleString("pl-PL", { day: "numeric", month: "long", year: "numeric"})} - ${new Date(dane.kiedy).toLocaleString("pl-PL", {hour: "2-digit", minute: "2-digit" })}` : "Nieznana data"}</span>
									<CalendarRangeIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="typserwera">Typ serwera</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">
										{ dane.typserwera === 2 && "TruckersMP" }
										{ dane.typserwera === 1 && "Multiplayer" }
										{ dane.typserwera === 0 && "Singleplayer" }
									</span>
									<HardDriveIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="typzlecenia">Typ zlecenia</Label>
								<div className="group flex justify-between aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">
										{ dane.typzlecenia === 0 && "Zlecenie z gry" }
										{ dane.typzlecenia === 1 && "Generowane przez gracza" }
										{ dane.typzlecenia === 2 && "World of Trucks" }
									</span>
									<DatabaseZapIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="gra">Gra</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{dane.gra ? "American Truck Simulator" : "Euro Truck Simulator 2"}</span>
									<Gamepad2Icon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="ladunek">Ładunek</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.ladunek ?? "Nieznana wartość" }</span>
									<PackageIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="typnaczepy">Typ naczepy</Label>
								<div
									aria-invalid={!dane.uprawnienie.wazne}
									className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
									title={!dane.uprawnienie.wazne ? `Kierowca w momencie oddawania raportu\nnie posiadał ważnej Licencji ${dane.gra ? "ATS": "ETS2"}: ${dane.uprawnienie.nazwa}\n\nOstatni termin ważności: ${dane.uprawnienie.wygasa ? new Date(dane.uprawnienie.wygasa).toLocaleString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) : "Brak"}` : undefined}
								>
									<span className="truncate">{dane.uprawnienie.nazwa ?? "Usunięte uprawnienie" }</span>
									{!dane.uprawnienie.wazne ? <AlertTriangleIcon className="text-red-400" /> : <IdCardIcon className="opacity-30 group-hover:opacity-70 transition-opacity" /> }
								</div>
							</div>
							<div>
								<Label htmlFor="rozptrasy">Rozpoczęcie trasy</Label>
								<div className="flex gap-1 w-full">
									<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
										<div className="flex items-center gap-2 w-full">
											{ !dane.skadKraj ? "" : dane.gra ? <img className="w-6 h-4 inline" title={dane.skadKraj} src="/img/flagi/usa.png" /> : <img title={dane.skadKraj} className="w-6 h-4 inline" src={"/img/flagi/"+dane.skadKraj.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> }
											<span className="truncate">{ dane.skadKraj ?? "Nieznany kraj" }, { dane.skadMiasto ?? "Nieznane miasto" }</span>
										</div>
										<MapPinHouseIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
									</div>
								</div>
							</div>
							<div>
								<Label htmlFor="zaktrasy">Zakończenie trasy</Label>
								<div className="flex gap-1 w-full">
									<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
										<div className="flex items-center gap-2 w-full">
											{ !dane.dokadKraj ? "" : dane.gra ? <img className="w-6 h-4 inline" title={dane.dokadKraj} src="/img/flagi/usa.png" /> : <img title={dane.dokadKraj} className="w-6 h-4 inline" src={"/img/flagi/"+dane.dokadKraj.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> }
											<span className="truncate">{ dane.dokadKraj ?? "Nieznany kraj"}, { dane.dokadMiasto ?? "Nieznane miasto" }</span>
										</div>
										<MapPinCheckIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
									</div>
								</div>
							</div>
							<div>
								<Label htmlFor="masal">Masa ładunku</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ (dane.masaladunku)?.toLocaleString("pl-PL") ?? "???" } ton</span>
									<WeightTildeIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="uszk">Uszkodzenia</Label>
								<div aria-invalid={dane.uszkodzenia > 0} className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.uszkodzenia === undefined ? "??%" : dane.uszkodzenia > 0 ? dane.uszkodzenia.toLocaleString("pl-PL", {style: "unit", unit: "percent"} ) : "Brak uszkodzeń"}</span>
									{ (dane.uszkodzenia > 0) ? <AlertTriangleIcon className="text-red-400" /> : <RiSparkling2Line className="opacity-30 group-hover:opacity-70 transition-opacity h-full w-auto shrink-0" /> }
								</div>
							</div>
							<div>
								<Label htmlFor="paliwo">Wykorzystane paliwo</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.spalanie?.toLocaleString("pl-PL", {style: "unit", unit: "liter", unitDisplay: "long"} ?? "??? litrów" ) }</span>
									<FuelIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="zarobekzlecenie">Zarobek na zleceniu</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.zarobek?.toLocaleString("pl-PL", {style: "currency", currency: "PLN"} ?? "??? zł" ) }</span>
									<TbReportMoney className="opacity-30 group-hover:opacity-70 transition-opacity h-full w-auto" />
								</div>
							</div>
							<div>
								<Label htmlFor="pokonanydystans">Pokonany dystans</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.przejechane?.toLocaleString("pl-PL", {style: "unit", unit: "kilometer", unitDisplay: "narrow"} ?? "??? km" ) }</span>
									<RouteIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="vmax">Prędkość maksymalna</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.vmax?.toLocaleString("pl-PL", {style: "unit", unit: "kilometer-per-hour", unitDisplay: "narrow"} ?? "??? km/h" ) }</span>
									<GaugeIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="kosztapaliwa" className="truncate">Koszty paliwa</Label>
								<div className="group flex justify-between gap-1 aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.paliwo?.toLocaleString("pl-PL", {style: "currency", currency: "PLN"} ?? "??? zł" ) }</span>
									<HandCoinsIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="ilepromow">Ile promów i pociągów</Label>
								<div className="group flex justify-between gap-1 leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.promy?.length ?? "0" }</span>
									<ShipIcon className="opacity-30 group-hover:opacity-70 transition-opacity" />
								</div>
							</div>
							<div>
								<Label htmlFor="czyADR">Ładunek ADR</Label>
								<div aria-invalid={dane.ladunekADR === 1} className="group flex justify-between gap-1 aria-invalid:border-green-600 leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.ladunekADR ? "Tak" : "Nie" }</span>
									<RadiationIcon className={cn("opacity-30 group-hover:opacity-70 transition-opacity", dane.ladunekADR === 1 && "text-green-600 opacity-100")} />
								</div>
							</div>
							<div>
								<Label htmlFor="czyDelikatny">Ładunek delikatny</Label>
								<div aria-invalid={dane.ladunekDelikatny === 1} className="group flex justify-between gap-1 aria-invalid:border-green-600 leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.ladunekDelikatny ? "Tak" : "Nie" }</span>
									<GiShatteredGlass className={cn("opacity-30 group-hover:opacity-70 transition-opacity h-full w-auto", dane.ladunekDelikatny === 1 && "text-green-600 opacity-100")} />
								</div>
							</div>
							<div>
								<Label htmlFor="czyGabaryt">Ładunek gabarytowy</Label>
								<div aria-invalid={dane.ladunekGabaryt === 1} className="group flex justify-between gap-1 aria-invalid:border-green-600 leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.ladunekGabaryt ? "Tak" : "Nie" }</span>
									<FaTruckLoading className={cn("opacity-30 group-hover:opacity-70 transition-opacity h-full w-auto", dane.ladunekGabaryt === 1 && "text-green-600 opacity-100")} />
								</div>
							</div>
							<div>
								<Label htmlFor="czyTandem">Ładunek tandem</Label>
								<div aria-invalid={dane.ladunekTandem === 1} className="group flex justify-between gap-1 aria-invalid:border-green-600 leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
									<span className="truncate">{ dane.ladunekTandem ? "Tak" : "Nie" }</span>
									<FaTrailer className={cn("opacity-30 group-hover:opacity-70 transition-opacity h-full w-auto", dane.ladunekTandem === 1 && "text-green-600 opacity-100")} />
								</div>
							</div>
							<div className="col-span-3 row-span-3 grid grid-cols-2 gap-4 [&_>_div_*]:disabled:opacity-100">
								<div className="mb-0 flex flex-col space-y-2">
									<Label htmlFor="komentarz">Komentarz</Label>
									{/* <div aria-invalid={dane.ladunekTandem === 1} className="h-full aria-invalid:border-green-600 leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
										{ dane.komentarz ?? "Brak komentarza" }
									</div> */}
										<Textarea
											id="komentarz"
											aria-invalid={!!dane.komentarz}
											placeholder="Brak komentarza"
											value={dane.komentarz ?? ""}
											className="resize-none h-full aria-invalid:border-amber-400/70 disabled:cursor-default"
											disabled
										/>
									</div>
									<div className="flex flex-col space-y-2">
										<Label htmlFor="uploadZdjec">Zdjęcia</Label>
										<div className="flex flex-col grow gap-1">
											<div
												className="min-h-24 grow flex items-center gap-3 rounded-md bg-input/30 border-input border py-2 px-3 overflow-x-auto
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
												{ dane.zdj ? dane.zdj.split(" ").map(zdj => {
													if(!zdj) return;
													return <div key={zdj} className="border group overflow-hidden border-input aspect-video shrink-0 h-20 bg-center bg-cover bg-no-repeat rounded-sm relative" style={{backgroundImage: `url(https://system.thebossspedition.pl${zdj})`}}>
														<div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/70 flex items-center gap-4 justify-evenly px-2">
															<button
																className="bg-input p-2 rounded-sm cursor-pointer hover:text-zinc-900 hover:bg-zinc-100/70"
																onClick={() => setPodglad("https://system.thebossspedition.pl"+zdj) }
															><FaExpand /></button>
														</div>
													</div>
												}) : "" }
											</div>
										</div>
									</div>
								</div>
								<div className="row-span-3 space-y-0.5!">
									<Label className="mb-2!">Promy i pociągi</Label>
									{ dane.promy.length ? dane.promy.map((prom, i) =>
											<div key={`prom_${prom.id}`} className="aria-invalid:border-destructive leading-[1.875] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm">
												{prom.nazwa}
											</div>
									) : <p className="text-sm italic text-muted-foreground">Brak</p> }
							</div>
						</div>
						: <div>{dane.blad}</div>
						: <Skeleton className="grid place-content-center py-20 text-base font-black tracking-widest cursor-wait select-none">Trwa wczytywanie</Skeleton>
						}
					</CardContent>
					<CardFooter className="justify-end space-x-4">
						<Button className="bg-amber-200 text-amber-800 hover:bg-amber-700 hover:text-amber-100" onClick={() => navigate(-1)}>Wróć do listy</Button>
						{ (daneLoaded && !dane.blad) &&
							<>
								<Button className="bg-red-300 text-red-800 hover:bg-red-500 hover:text-red-100" onClick={() => setRozpatrzenie("odrzuc") }>Odrzuć</Button>
								<Button className="bg-green-300 text-green-800 hover:bg-green-600 hover:text-green-100" onClick={() => setRozpatrzenie("zatwierdz") }>Zatwierdź</Button>
							</>
						}
					</CardFooter>
				</Card>
			</div>
			{ podglad &&
			<div className="z-100 fixed inset-0 pointer-events-auto! bg-black/80 p-10 pl-25 flex items-center justify-center cursor-zoom-out" onClick={() => setPodglad(undefined) }>
				<img src={podglad} className="rounded-lg max-w-95/100 max-h-95/100 object-contain object-center animate-[wejscieSmooth_.4s_ease]" alt="Ważność zdjęcia wygasła" />
			</div> }
			{ ( daneLoaded && !dane.blad ) &&
			<>
				<RozpatrzenieOdrzuc
					otwarte={rozpatrzenie}
					setOtwarte={setRozpatrzenie}
					idtrasy={trasaID}
					navigate={navigate}
				/>
				<RozpatrzenieZatwierdz
					otwarte={rozpatrzenie}
					setOtwarte={setRozpatrzenie}
					adr={dane.ladunekADR}
					delikatny={dane.ladunekDelikatny}
					gabaryt={dane.ladunekGabaryt}
					tandem={dane.ladunekTandem}
					uszkodzenia={dane.uszkodzenia}
					stanowisko={dane.kierowca.stanowisko}
					stawka={dane.kierowca.stawka}
					przejechane={dane.przejechane}
					idtrasy={trasaID}
					idkierowcy={dane.kierowca.id}
					kosztpaliwa={dane.paliwo}
					zarobekcalkowity={dane.zarobek}
					navigate={navigate}
				/>
			</> }
		</>
	)
};

export default DyspozytorniaTrasa;