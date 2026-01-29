import { memo,useState, useCallback, useEffect} from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogContent, AlertDialogTitle, AlertDialogHeader, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const nazwyMiesiaca = {
	1: "styczeń",
	2: "luty",
	3: "marzec",
	4: "kwiecień",
	5: "maj",
	6: "czerwiec",
	7: "lipiec",
	8: "sierpień",
	9: "wrzesień",
	10: "październik",
	11: "listopad",
	12: "grudzień"
};

const ZdjecieMiesiaca = ({toast}) => {
	const [ action, setAction ] = useState(false);
	const [ loaded, setLoaded ] = useState(false);
	const [ users, setUsers ] = useState([]);
	const [ photo, setPhoto ] = useState({ zdjMiesiacaPlik: undefined, zdjMiesiacaAutor: undefined, zdjMiesiacaOpis: undefined, zdjMiesiacaData: undefined });
	const [ edit, setEdit ] = useState({ allow: false, file: undefined, fileName: undefined, fileBlob: undefined, author: undefined, description: undefined, month: undefined });
	const [ openModal, setOpenModal ] = useState(false);
	const automatycznaData = new Date();
	automatycznaData.setUTCDate(15);
	automatycznaData.setUTCMonth(automatycznaData.getUTCMonth() - 1);

	const fetchData = useCallback(async () => {
		setLoaded(false);
		await Axios.get(gb.backendIP+"/zdjecieMiesiaca").then((r) => {
			if(r.data){
				setPhoto(r.data);
			}
		}).catch((er) => {
			console.log(er);
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Błąd wczytywania zdjęcia miesiąca: "+er.message
			})
		});
		await Axios.post(gb.backendIP + "listaUzytkownikow")
		.then((uzytkownicy) => {
			setUsers(uzytkownicy.data);
		}).catch(() => {
			setUsers([]);
		});
		setLoaded(true);
	}, [toast]);

	useEffect(() => {
		if(!loaded) fetchData();
	}, [fetchData, loaded]);

	const removePhoto = useCallback(async () => {
		setAction(true);
		await Axios.delete(gb.backendIP+"/zdjecieMiesiaca/"+localStorage.getItem("token")).then((r) => {
			toast({
				title: "Odpowiedź",
				className: "bg-green-500 text-green-50",
				description: r.data['odp'] ?? r.data['error'] ?? "Nieznany komunikat"
			})
			fetchData();
		}).catch((er) => {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Nie można usunąć zdjęcia miesiąca. Powód: "+(er.message ?? "Nieznany")
			})
		});
		setAction(false);
	}, [fetchData, toast]);

	const cancelEdit = useCallback(() => {
		if(edit.fileBlob) URL.revokeObjectURL(edit.fileBlob);
		setEdit({ allow: false, file: undefined, fileName: undefined, fileBlob: undefined, author: undefined, description: undefined, month: undefined });
	}, [edit.fileBlob]);

	const savePicture = useCallback(async (data) => {
		console.log(data);
		const automatycznaData = new Date();
		automatycznaData.setUTCDate(15);
		automatycznaData.setUTCMonth(automatycznaData.getUTCMonth() - 1);
		setAction(true);
		await Axios.post(gb.backendIP+"/zdjecieMiesiaca/"+localStorage.getItem("token"), {
			...data,
			file: undefined,
			fileName: undefined,
			fileBlob: undefined,
			allow: undefined,
			zdjMiesiacaImg: data.file,
			month: data.month ?? automatycznaData.toISOString()
		}, { headers: { "Content-Type": "multipart/form-data"} }).then((r) => {
			toast({
				title: "Odpowiedź",
				className: "bg-green-500 text-green-50",
				description: r.data['odp'] ?? r.data['error'] ?? "Nieznany komunikat"
			});
			cancelEdit();
			fetchData();
		}).catch((er) => {
			console.log(er);
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Nie można ustawić zdjęcia miesiąca. Powód: "+(er.message ?? "Nieznany")
			})
		});
		setAction(false);
	}, [cancelEdit, fetchData, toast]);

	return (
		<>
		<Card className="border-0">
			<CardHeader className="text-center">
				<CardTitle>Zdjęcie miesiąca</CardTitle>
				<CardDescription>
					Możliwość ustawienia zdjęcia miesiąca oraz krótkiego
					opisu wyświetlanego na stronie.
				</CardDescription>
			</CardHeader>
			<CardContent className="-mt-4 flex grow justify-center items-end">
				<Dialog isOpen={openModal} onOpenChange={(e) => setOpenModal(e)}>
					<DialogTrigger asChild>
						{ !loaded ? <Skeleton className="aspect-video"></Skeleton> :
						<div className="group aspect-video relative max-w-full max-h-full w-full bg-accent rounded-lg cursor-pointer overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${"/img/"+photo.zdjMiesiacaPlik})`}} onClick={() => setOpenModal(true)}>
							<div className={`absolute inset-0 group-hover:bg-black/50 ${photo.zdjMiesiacaPlik && 'text-transparent'} group-hover:text-primary group-hover:tracking-widest transition-all grid place-content-center`}>
								{!photo.zdjMiesiacaPlik ? <b>Brak zdjęcia</b> : <b>Szczegóły</b> }
							</div>
						</div> }
					</DialogTrigger>
					<DialogContent onOpenAutoFocus={ (e) => e.preventDefault() } className="container! min-[1300px]:max-w-300!">
						<DialogHeader>
							<DialogTitle>Zdjęcie miesiąca</DialogTitle>
							<DialogDescription>Możliwość edycji zdjęcia miesiąca, autora, opisu oraz dla jakiego miesiąca jest zdjęcie.</DialogDescription>
						</DialogHeader>
						<div className="space-y-5">
							<div className="mx-auto relative aspect-video bg-accent bg-cover bg-center bg-no-repeat rounded-lg w-full max-w-210 min-[1400px]:max-w-300" style={{backgroundImage: `url(${edit.fileBlob ?? "/img/"+photo.zdjMiesiacaPlik})`}}>
								{ !edit.fileBlob && !photo.zdjMiesiacaPlik && <div className={`absolute inset-0 tracking-wider font-extrabold text-2xl grid place-content-center`}>Brak zdjęcia</div>}
							</div>
							<div className="flex gap-5">
								<div className="space-y-1.5 flex flex-col">
									<Label>Autor</Label>
									{
										edit.allow ?
										<Select value={edit.author?.toString() ?? ""} onValueChange={(e) => setEdit(x => ({...x, author: e})) } disabled={!loaded || action} >
											<SelectTrigger className="grow w-full">
												<SelectValue placeholder="Kierowca" />
											</SelectTrigger>
											<SelectContent position="popper">
												{ users.map((kierowca) => <SelectItem key={`kierowca_${kierowca.id}`} value={kierowca.id.toString()} >{ kierowca.login }</SelectItem> ) }
											</SelectContent>
										</Select>
										: <div className="flex grow items-center">
											{ photo.zdjMiesiacaAutor ?
											users.find(x => x.id == photo.zdjMiesiacaAutor) === undefined
												? <b>Nieznany kierowca</b>
												: <Link to={`/profil/${users.find(x => x.id == photo.zdjMiesiacaAutor).login}`} className="text-[dodgerblue] cursor-pointer font-extrabold"><img className="inline rounded-md align-middle mr-2 w-8.75 h-8.75" src={"/img/" +users.find(x => x.id == photo.zdjMiesiacaAutor).awatar} /> {users.find(x => x.id == photo.zdjMiesiacaAutor).login} </Link>
											: <b className="text-base">Brak kierowcy</b>
											}
										</div>
									}
								</div>
								<div className="space-y-1.5 flex flex-col">
									<Label>Miesiąc</Label>
									{ edit.allow ?
										<Select value={edit.month ? (new Date(edit.month).getUTCMonth()+1).toString() : ""} onValueChange={(e) => {
											const dateObj = new Date();
											dateObj.setUTCMonth(e-1);
											dateObj.setUTCDate(15);
											setEdit(x => ({...x, month: dateObj}))
										}} disabled={!loaded || action} >
											<SelectTrigger className="grow w-full">
												<SelectValue placeholder="Miesiąc" />
											</SelectTrigger>
											<SelectContent position="popper">
												{ Object.entries(nazwyMiesiaca).map(([index, miesiac]) => <SelectItem key={`miesiac_${index}`} value={index.toString()} >{ miesiac }</SelectItem> ) }
											</SelectContent>
										</Select>
										: <div className="flex grow items-center">{photo.zdjMiesiacaData ? <b>{new Date(photo.zdjMiesiacaData).toLocaleString(undefined, {month: "long", year: "numeric"})}</b> : <b>Nieustawione</b>}</div>
									}
								</div>
								<div className="grow space-y-1.5 flex flex-col">
									<Label>Opis</Label>
									{ edit.allow ?
										<Input type="text" className="grow" value={edit.description ?? ""} placeholder="Miejsce na opis zdjęcia..." onChange={(e) => setEdit(x => ({...x, description: e.target.value}))} disabled={!loaded || action}/>
										: <div className="flex grow items-center">{ photo.zdjMiesiacaOpis ? <b>{photo.zdjMiesiacaOpis}</b> : <b>Brak opisu</b> } </div>
									}
								</div>
								{ edit.allow &&
								<div className="space-y-1.5 flex flex-col">
									<Label htmlFor="zdjMiesiaca">Obraz</Label>
									<label htmlFor="zdjMiesiaca" className={`my-0 flex grow px-4 py-2 ${edit.file ? "bg-green-300 text-green-800 hover:bg-amber-200 hover:text-amber-800" : "bg-amber-200 text-amber-800 hover:bg-amber-700 hover:text-amber-100"} shadow-xs not-disabled:cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`}>
									{edit.file ? "Wybrano plik" : "Wybierz plik"}
									</label>
									<input type="file" accept="image/jpeg, image/png" className="hidden" id="zdjMiesiaca" onChange={(e) => {
										const selected = e.target.files;
										if(!selected || selected.length === 0){
											if(edit.fileBlob) URL.revokeObjectURL(edit.fileBlob);
											setEdit(x => ({...x, file: undefined, fileBlob: undefined, fileName: undefined }));
											return;
										}
										const fileObj = selected[0];
										const fileBlob = URL.createObjectURL(fileObj);
										setEdit(x => ({...x, file: fileObj, fileBlob: fileBlob, fileName: fileObj.name}));
									}} />
								</div>
								}
							</div>
						</div>
						<DialogFooter>
							{ !edit.allow && photo.zdjMiesiacaPlik &&
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button className="bg-red-300 text-red-800 hover:bg-red-900 hover:text-red-50" disabled={!loaded || action}>Usuń zdjęcie</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
										<AlertDialogDescription>
										Czy aby napewno chcesz usunąć zdjęcie miesiąca <b className="text-green-400">{ photo.zdjMiesiacaData && new Date(photo.zdjMiesiacaData).toLocaleString(undefined, { month: "long", year: "numeric" }) }</b> autora <b className="text-blue-400">{users.find(a => a.id == photo.zdjMiesiacaAutor)?.login ?? "???"}</b>?
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
										<AlertDialogAction className="cursor-pointer bg-red-300 text-red-800 hover:bg-red-900 hover:text-red-50" onClick={() => removePhoto() } >Potwierdź</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
							}
							{ !edit.allow ? <Button className="bg-amber-200 text-amber-800 hover:bg-amber-700 hover:text-amber-100" variant="secondary" onClick={() => setEdit(x => ({...x, allow: true}))}>Rozpocznij edycję</Button>
								: <Button className="bg-red-300 text-red-800 hover:bg-red-900 hover:text-red-50" onClick={() => cancelEdit()}>Anuluj edycję</Button> }
							{ edit.allow && 
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button className="pointer-events-auto! disabled:cursor-not-allowed bg-green-600 text-green-50 hover:bg-green-800 hover:text-green-100" disabled={!loaded || action || !edit.author || !edit.file }>Zatwierdź zmiany</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
										<AlertDialogDescription>
										Czy aby napewno chcesz ustawić plik <b className="text-red-300">{edit.fileName}</b> jako nowe zdjęcie miesiąca <b className="text-green-400">{ edit.month ? edit.month.toLocaleString(undefined, { month: "long", year: "numeric" }) : automatycznaData.toLocaleString(undefined, { month: "long", year: "numeric"}) }</b> z autorem <b className="text-blue-400">{users.find(a => a.id == edit.author)?.login ?? "???"}</b> oraz {edit.description && "opisem "}<b className="text-yellow-400">{edit.description ?? "bez opisu"}</b>?
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
										<AlertDialogAction className="cursor-pointer bg-green-600 text-green-50 hover:bg-green-800 hover:text-green-100" onClick={() => savePicture(edit) } >Potwierdź</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
							}
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
		</>
	);
};

export default memo(ZdjecieMiesiaca);