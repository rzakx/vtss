import { memo,useState, useCallback, useEffect } from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OknoWiniety = ({toast}) => {
    const [ action, setAction ] = useState(false);
    const [ loaded, setLoaded ] = useState(false);
    const [ winiety, setWiniety ] = useState([]);
    const [ target, setTarget ] = useState(undefined);
    const [ newPrice, setNewPrice ] = useState(undefined);

    const changeWinieta = useCallback(async (target, newPrice) => {
        let znajdz = winiety.find(x => x.id === target);
        if(znajdz == undefined) return;
        setAction(true);
        await Axios.post(gb.backendIP+"ustawWiniete/"+localStorage.getItem("login"), {
            cena: newPrice,
            kraj: znajdz.kraj,
            ktora: target
        }).then((r) => {
            if(!r.data['blad']){
                toast({
                    title: "Koszt winiety",
                    className: "bg-green-500 text-green-50",
                    description: "Ustanowiono nową wartość ceny za winietę państwa "+znajdz.kraj,
                });
            } else {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Nieustawiono nowej ceny winiety państwa "+znajdz.kraj+". Błąd: "+r.data['blad']
                })
            }
        }).catch((er) => {
            console.log(er);
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Nieustawiono nowej ceny winiety państwa "+znajdz.kraj+". Błąd: "+er.message
            });
            setWiniety({ init: false, dane: [], wybrane: undefined, kwota: undefined, akcja: false });
        }).finally(() => {
            setAction(false);
            setTarget(undefined);
            setNewPrice(undefined);
            setWiniety([]);
            setLoaded(false);
        });
    }, [toast, winiety]);

    const fetchWiniety = useCallback(async () => {
        setLoaded(false);
        await Axios.post(gb.backendIP + "wszystkieWiniety").then((r) => {
            setWiniety(r.data['dane']);
            setNewPrice(undefined);
            setTarget(undefined);
        })
        .catch(() => {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Wystąpił błąd podczas wczytywania ustawionych cen winiet.",
            });
            setWiniety([]);
            setTarget(undefined);
            setNewPrice(undefined);
        });
        setLoaded(true);
    }, [toast]);

    useEffect(() => {
        if(!loaded) fetchWiniety();
        // if(winiety.akcja) wykonajWiniety();
    });

        return(
            <Card className="border-0">
                <CardHeader className="text-center">
                    <CardTitle>Winiety</CardTitle>
                    <CardDescription>Tutaj możesz przeglądać i ustawiać cenę winiety dla wybranych państw.</CardDescription>
                </CardHeader>
                <CardContent className="-mt-4">
                    <div className="flex flex-col grow space-y-1">
                        <Label>Państwo</Label>
                        {/* setWiniety((w) => ({ ...w, wybrane: e, kwota: winiety.dane.find( (x) => x.id == e ).cena })) */}
                        <Select value={winiety.wybrane} onValueChange={(e) => { setNewPrice(winiety.find((x) => x.id == e).cena); setTarget(e); }} disabled={ !loaded || action } >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Wybierz" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {winiety.map((winieta) => <SelectItem key={`winieta_${winieta.id}`} value={winieta.id} >{winieta.kraj}</SelectItem> )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex space-x-1.5 mt-3">
                        <div className="flex flex-col space-y-1 min-w-17.5">
                            <Label>Kwota</Label>
                            <Input
                                type="number" placeholder="0,00 zł" value={ newPrice ?? "" }
                                onChange={ (e) => setNewPrice(parseFloat(e.target.value)) }
                                disabled={ !loaded || action }
                            />
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="grow self-end not-disabled:cursor-pointer" disabled={!loaded || action || !target || !newPrice }>Ustaw</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Czy aby napewno chcesz ustawić cenę winiety <b className="text-blue-400">{winiety.find(x => x.id == target)?.kraj ?? "???"}</b> z <b className="text-red-400">{winiety.find(x => x.id == target)?.cena.toLocaleString( "pl-PL", { style: "currency", currency: "PLN" } ) ?? 0}</b> na <b className="text-green-400">{newPrice ? newPrice.toLocaleString( "pl-PL", { style: "currency", currency: "PLN" } ) : "0,00 zł"}</b>?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="cursor-pointer"
                                                    onClick={ () => changeWinieta(target, newPrice) }
                                                >Potwierdź</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
        )
};
export default memo(OknoWiniety);