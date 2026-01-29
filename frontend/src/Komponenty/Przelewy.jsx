import { memo,useState, useCallback, useEffect } from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogContent, AlertDialogTitle, AlertDialogHeader, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"

const Przelewy = ({toast}) => {
	const [ action, setAction ] = useState(false);
	const [ loaded, setLoaded ] = useState(false);
	const [ balance, setBalance ] = useState(0);
	const [ users, setUsers ] = useState([]);
	const [ reason, setReason ] = useState(undefined);
	const [ amount, setAmount ] = useState(undefined);
	const [ target, setTarget ] = useState(undefined);

	const initTransfer = useCallback(async () => {
		setLoaded(false);
		await Axios.post(gb.backendIP + "kontofirmowestan").then((r) => {
			setBalance(r.data['odp']);
		}).catch(() => {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Wystąpił błąd podczas wczytywania stanu konta firmowego.",
			});
			setBalance(0);
		});
		await Axios.post(gb.backendIP + "listaUzytkownikow")
		.then((uzytkownicy) => {
			setUsers(uzytkownicy.data);
		}).catch(() => {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Wystąpił błąd podczas wczytywania listy użytkowników systemu.",
			});
			setUsers([]);
		});
		setLoaded(true);
	}, [toast]);

	const transferMoney = useCallback(async (target, amount, reason) => {
		setAction(true);
		await Axios.post(gb.backendIP+"dodajKwote/"+localStorage.getItem('token'), {
            komu: target,
            kwota: amount,
            powod: reason ? reason : null
        }).then((r) => {
			console.log(r.data);
			toast({
				title: "Wykonano przelew",
				className: "bg-green-500 text-green-50",
				description: "Kwota została przekazana na konto kierowcy.",
			});
        }).catch((er) => {
			toast({
				title: "Wystąpił błąd",
				variant: "destructive",
				description: "Niewykonano przelewu. Błąd: "+er.message
			});
		}).finally(() => {
			setAction(false);
			setAmount(undefined);
			setTarget(undefined);
			setBalance(undefined);
			setUsers([]);
			setLoaded(false);
		});
	}, [toast]);

	useEffect(() => {
		if(!loaded) initTransfer();
	}, [initTransfer, loaded])


		return(
			<Card className="border-0">
				<CardHeader className="text-center">
					<CardTitle>Transakcje pieniężne</CardTitle>
					<CardDescription>Możliwość przekazania konkretnej kwoty z konta firmowego na konto wybranego kierowcy.</CardDescription>
				</CardHeader>
				<CardContent className="-mt-4">
					<div className="flex space-x-1.5">
						<div className="flex flex-col grow space-y-1">
							<Label>Kierowca</Label>
							<Select value={target ?? ""} onValueChange={(e) => setTarget(e) } disabled={!loaded || action }>
								<SelectTrigger className="grow w-full">
									<SelectValue placeholder="Kierowca" />
								</SelectTrigger>
								<SelectContent position="popper">
									{ users.map((kierowca) => <SelectItem key={`kierowca_${kierowca.id}`} value={kierowca.id} >{ kierowca.login }</SelectItem> ) }
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col space-y-1">
							<Label>Kwota</Label>
							<Input
								type="number" step="0.01"
								placeholder="0,00 zł" value={ amount ?? "" }
								onChange={(e) => setAmount(parseFloat( e.target.value )) }
								disabled={!loaded || action}
							/>
						</div>
					</div>
					<div className="space-y-1 mt-2">
						<Label>Powód:</Label>
						<Textarea
							className="resize-none min-h-8"
							value={reason ?? ""}
							onChange={(e) => setReason(e.target.value) }
							placeholder="Podaj powód czynności (opcjonalnie)"
							disabled={!loaded || action}
						/>
					</div>
					<div className="flex w-full justify-between space-x-2 mt-2">
						<div className="flex flex-col space-y-1">
							<Label>Konto firmowe</Label>
							<Input type="text" className="text-right" disabled readOnly value={ loaded ? balance.toLocaleString( "pl-PL", { style: "currency", currency: "PLN" } ) : "Wczytuję" } />
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button className="self-end not-disabled:cursor-pointer" disabled={!loaded || action || !target || !amount} >Wykonaj</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
									<AlertDialogDescription>
										Czy aby napewno chcesz dokonać przelewu w wysokości <b className="text-green-400">{amount ? amount.toLocaleString( "pl-PL", { style: "currency", currency: "PLN" } ) : amount}</b> na konto kierowcy <b className="text-blue-400">{users.find(a => a.id == target)?.login ?? "???"}</b>?
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
									<AlertDialogAction className="cursor-pointer" onClick={() => transferMoney(target, amount, reason) } >Potwierdź</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</Card>
		)
};

export default memo(Przelewy);