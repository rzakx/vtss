import { Button } from "@/components/ui/button";
import Nawigacja from "@/Komponenty/Nawigacja";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import gb from "../GlobalVars";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Rekrutacja(props){
	const { toast } = useToast();
	const [ zgloszenia, setZgloszenia ] = useState({checked: false, dane: [], blad: ""});
	const [ rozpatrywany, setRozpatrywany ] = useState({otwarte: false, dane: {}, wybrane: null, decyzja: undefined });
	const [ paginacja, setPaginacja ] = useState(1);
	const liczbaElementow = 6;
	const dostepnaPaginacja = Math.ceil(zgloszenia.dane.length / liczbaElementow);
    const zawartoscPaginacja = zgloszenia.dane.slice( (paginacja - 1) * liczbaElementow, paginacja * liczbaElementow );

	useEffect(() => {
		const wczytajZgloszenia = async () => {
			await Axios.post(gb.backendIP+"rekrutacja/"+localStorage.getItem("token")).then((r) => {
				setZgloszenia(x => ({...x, blad: "", checked: true, dane: r.data['dane']}));
			}).catch((er) => {
				console.log("Blad wczytywania zgłoszeń rekrutacyjnych!");
				setZgloszenia(x => ({...x, blad: er.message || "Nieznany błąd", checked: true}));
			})
		}
		if(!zgloszenia.checked) wczytajZgloszenia();
	}, [zgloszenia.checked]);

	useEffect(() => {
		const rozpatrzenie = async () => {
			await Axios.post(gb.backendIP+"rekrutacjaDecyzja/"+localStorage.getItem("token"), { decyzja: rozpatrywany.decyzja, id: rozpatrywany.dane.id })
			.then((r) => {
				if(!r.data['odp']){
					toast({
						title: "Wystąpił błąd",
						variant: "destructive",
						description: "Nieudane zapytanie. Powód: "+r.data['blad']
					});
				} else {
					if(r.data['blad']){
						toast({
							title: "Wystąpił błąd",
							variant: "destructive",
							description: `Pomyślnie ${rozpatrywany.decyzja === "odrzuc" ? "odrzucono" : "zaakceptowano"} zgłoszenie, ale wystąpiły problemy. ${r.data['blad']}`
						});
					} else {
						toast({
							title: "Zaktualizowano zgłoszenie",
							className: "bg-green-500 text-green-50",
							description: `Pomyślnie ${rozpatrywany.decyzja === "odrzuc" ? "odrzucono" : "zaakceptowano"} zgłoszenie.`
						});
					}
				}
				setRozpatrywany({otwarte: false, dane: {}, wybrane: null, decyzja: undefined });
				setZgloszenia(x => ({...x, checked: false}));
			}).catch((er) => {
				setRozpatrywany(x => ({...x, decyzja: undefined}));
				toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Nieudane zapytanie. Powód: "+er.message
                });
			})
		};
		if(rozpatrywany.decyzja) rozpatrzenie();
	}, [rozpatrywany.decyzja]);

	const zarzadzajZgloszeniem = () => {
		return(
			<Dialog open={rozpatrywany.otwarte} onOpenChange={(e) => {
				setRozpatrywany((prev) => ({...prev, otwarte: e}))
			}}>
				<DialogContent className="max-w-6xl w-[95%] bg-card overflow-hidden">
					<DialogHeader>
						<DialogTitle>Rozpatrywanie zgłoszenia #{rozpatrywany.dane.id}</DialogTitle>
						<DialogDescription>
							Zapoznaj się z informacjami przedstawionymi przez aplikującego i dokonaj decyzji o przyjęciu lub odrzuceniu zgłoszenia.
						</DialogDescription>
					</DialogHeader>
					<div className="grid w-full grid-cols-4 max-xl:grid-cols-3 gap-3 mb-5
					[&_p]:text-sm [&_p]:px-3 [&_p]:py-2 [&_p]:bg-secondary [&_p]:mt-1 [&_p]:rounded-sm max-lg:[&_p]:text-xs">
						<div className="">
							<Label>Pseudonim</Label>
							<p>{rozpatrywany.dane.pseudonim || "Nieznane"}</p>
						</div>
						<div>
							<Label>E-Mail</Label>
							<p>{rozpatrywany.dane.email || "Nieznane"}</p>
						</div>
						<div>
							<Label>Discord</Label>
							<p>{rozpatrywany.dane.discord ? `<@${rozpatrywany.dane.discord}>` : "Nieznane"}</p>
						</div>
						<div>
							<Label>Wiek</Label>
							<p>{rozpatrywany.dane.lat ? `${rozpatrywany.dane.lat} lat` : "Nieznane"}</p>
						</div>
						<div>
							<Label>Godziny w ETS</Label>
							<p>{rozpatrywany.dane.godzin ? `${rozpatrywany.dane.godzin} h` : "Nieznane"}</p>
						</div>
						<div>
							<Label>Kto polecił</Label>
							<p>{rozpatrywany.dane.ktopolecil || "Puste"}</p>
						</div>
						<div>
							<Label>SteamID64</Label>
							<p>{rozpatrywany.dane.steamid ? <a target="_blank" className="text-blue-500 font-bold hover:tracking-wider transition-all" href={`https://steamcommunity.com/profiles/${rozpatrywany.dane.steamid}`}>Odnośnik</a> : "Nieznane"}</p>
						</div>

						<div>
							<Label>TruckersMP</Label>
							<p>{rozpatrywany.dane.truckersmp ? <a target="_blank" className="text-blue-500 font-bold hover:tracking-wider transition-all" href={`https://truckersmp.com/user/${rozpatrywany.dane.truckersmp}`}>{rozpatrywany.dane.truckersmp}</a> : "Niepodano"}</p>
						</div>
						<div>
							<Label>TruckBook</Label>
							<p>{rozpatrywany.dane.truckbook ? <a target="_blank" className="text-blue-500 font-bold hover:tracking-wider transition-all" href={`https://trucksbook.eu/users/all/0?search=${rozpatrywany.dane.truckbook}`}>{rozpatrywany.dane.truckbook}</a> : "Niepodano"}</p>
						</div>

						<div>
							<Label>Typ uczestnictwa</Label>
							<p>{rozpatrywany.dane.podwykonawca ? "Podwykonawca" : "Kierowca"}</p>
						</div>

						<div className="col-span-4 max-xl:col-span-3">
							<Label>Uzasadnienie</Label>
							<p className="tracking-wide text-justify min-h-16 w-full">{rozpatrywany.dane.dlaczego || "Brak..."}</p>
						</div>
						
					</div>
					<DialogFooter>
						<DialogClose asChild><Button className="bg-input/50 border text-zinc-50 hover:bg-amber-400/80 transition-colors duration-300">Cofnij</Button></DialogClose>
						<AlertDialog>
							<AlertDialogTrigger disabled={rozpatrywany.decyzja !== undefined}>
								<Button
									className="hover:bg-red-500 hover:text-foreground bg-red-400 transition-colors duration-300"
									disabled={rozpatrywany.decyzja !== undefined}
								>Odrzuć</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Potwierdzenie odrzucenia</AlertDialogTitle>
									<AlertDialogDescription>
										Czy aby napewno chcesz odrzucić zgłoszenie tego użytkownika?
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Anuluj</AlertDialogCancel>
									<AlertDialogAction onClick={() => setRozpatrywany((nw) => ({...nw, decyzja: "odrzuc"})) }>Odrzuć</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<AlertDialog>
							<AlertDialogTrigger disabled={rozpatrywany.decyzja !== undefined}>
								<Button
									className="hover:bg-green-500 hover:text-foreground bg-green-400 transition-colors duration-300"
									disabled={rozpatrywany.decyzja !== undefined}
								>Zaakceptuj</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Potwierdzenie akceptacji</AlertDialogTitle>
									<AlertDialogDescription>
										Czy aby napewno chcesz zaakceptować zgłoszenie i stworzyć konto w systemie dla tego użytkownika?
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Anuluj</AlertDialogCancel>
									<AlertDialogAction onClick={() => setRozpatrywany((nw) => ({...nw, decyzja: "zaakceptuj"})) }>Potwierdź</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		)
	};

    return (
		<>
			<Nawigacja />
			<Toaster richColors />
			<div className="tlo" />
			<div className="srodekekranu">
				<Card className="w-full max-w-5xl">
					<CardHeader>
						<CardTitle>Dostępne zgłoszenia</CardTitle>
						<CardDescription>
							Oczekujące na rozpatrzenie zgłoszenia rekrutacyjne.
						</CardDescription>
						<CardAction>
							<Button disabled={!zgloszenia.checked} onClick={() => setZgloszenia(x => ({checked: false, blad: "", wybrane: null, dane: []}))}>
								Odśwież
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						{
							!zgloszenia.checked ?
							<div className="w-full my-3 text-center text-sm tracking-widest animate-pulse">
								Trwa wczytywanie...
							</div>
							:
						zgloszenia.dane.length ? (
							<Table className="w-full overflow-hidden">
								<TableHeader>
									<TableRow className="dark:bg-zinc-800">
										<TableHead>UID</TableHead>
										<TableHead>Pseudonim</TableHead>
										<TableHead>E-Mail</TableHead>
										<TableHead>Wiek</TableHead>
										<TableHead>Godziny</TableHead>
										<TableHead>Data zgłoszenia</TableHead>
										<TableHead>Status</TableHead>
										<TableHead></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{ zawartoscPaginacja.map(zgloszenie => {
										return <TableRow key={"rekrutacja_"+zgloszenie.id}>
											<TableCell>{zgloszenie.id}</TableCell>
											<TableCell>{zgloszenie.pseudonim || "Nieznane" }</TableCell>
											<TableCell>{zgloszenie.email || "Niepodano"}</TableCell>
											<TableCell>{zgloszenie.lat || "??"} lat</TableCell>
											<TableCell>{zgloszenie.godzin || "???"} h</TableCell>
											<TableCell>{new Date(zgloszenie.dataModyfikacji).toLocaleString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) } - {new Date(zgloszenie.dataModyfikacji).toLocaleString("pl-PL", { hour: "2-digit", minute: "2-digit" }) } </TableCell>
											<TableCell><Badge className={zgloszenie.status === 3 ? "bg-amber-300 text-amber-800" : zgloszenie.status === 1 ? "bg-green-300 text-green-800" : "bg-red-300 text-red-800"}>{zgloszenie.status === 3 ? "Oczekujący" : zgloszenie.status === 2 ? "Odrzucony" : "Przyjęty"}</Badge></TableCell>
											<TableCell><Button variant="link" onClick={() => setRozpatrywany( x => ({...x, wybrane: zgloszenie.id, dane: zgloszenie, otwarte: true}) ) }>Szczegóły</Button></TableCell>
										</TableRow>
									})}
								</TableBody>
								<TableFooter>
									<TableRow>
										<TableCell colSpan={8}>
											<div className="flex justify-between gap-2 items-center select-none">
												<Button
													variant={"outline"}
													className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
													onClick={() => setPaginacja( (p) => Math.max( p - 1, 1 ) ) }
													disabled={ paginacja === 1 }
												>
													Poprzednia
												</Button>
												Strona {paginacja} z {dostepnaPaginacja}
												<Button
													variant={"outline"}
													className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
													onClick={() => setPaginacja( (p) => Math.min( p + 1, dostepnaPaginacja ) ) }
													disabled={ paginacja === dostepnaPaginacja }
												>
													Następna
												</Button>
											</div>
										</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						) : (
							<div className="w-full my-3 text-center text-sm tracking-widest">
								Brak dostępnych zgłoszeń rekrutacyjnych
							</div>
						)}
					</CardContent>
				</Card>
				{rozpatrywany.wybrane ? zarzadzajZgloszeniem() : ""}
			</div>
		</>
	);
};