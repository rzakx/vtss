import { memo,useState, useCallback, useEffect, useMemo } from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DialogPromy = ({isOpen, setOpen, toast}) => {
    const [ loaded, setLoaded ] = useState(false);
    const [ action, setAction ] = useState(false);
    const [ ferry, setFerry] = useState([]);
    const [ filtryPromy, setFiltryPromy] = useState({skad: "", dokad: "", jednokierunkowe: 0});

    const filteredFerries = useMemo(() => {
        if(ferry.length){
            let tmp = [...ferry];
            if(filtryPromy.skad != ""){
                tmp = tmp.filter(a => {
                    if(!a.nazwa) return;
                    const tmpN = a.nazwa.split(" - ");
                    if(filtryPromy.jednokierunkowe){
                        return tmpN[0].toLowerCase().includes(filtryPromy.skad.toLowerCase())
                    } else {
                        return (tmpN[0].toLowerCase().includes(filtryPromy.skad.toLowerCase()) || tmpN[1].toLowerCase().includes(filtryPromy.skad.toLowerCase()))
                    }
                })
            }
            if(filtryPromy.dokad != "") {
                tmp = tmp.filter(a => {
                    if(!a.nazwa) return
                    const tmpN = a.nazwa.split(" - ");
                    if(filtryPromy.jednokierunkowe){
                        return tmpN[1].toLowerCase().includes(filtryPromy.dokad.toLowerCase())
                    } else {
                        return (tmpN[0].toLowerCase().includes(filtryPromy.dokad.toLowerCase()) || tmpN[1].toLowerCase().includes(filtryPromy.dokad.toLowerCase()))
                    }
                })
            }
            return tmp
        } else {
            return []
        }
    }, [ferry, filtryPromy.dokad, filtryPromy.jednokierunkowe, filtryPromy.skad]);

    const initFerry = useCallback(async () => {
        setLoaded(false);
        await Axios.post(gb.backendIP+"promy").then((r) => {
            if(!r.data['blad']){
                setFerry(r.data['dane']);
            } else {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Wystąpił błąd podczas wczytywania zapisanych połączeń tranzytowych z bazy.",
                });
                setFerry([]);
            }
        }).catch(() => {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Wystąpił błąd podczas wczytywania zapisanych połączeń tranzytowych z bazy.",
            });
            setFerry([]);
        });
        setLoaded(true);
    }, [toast]);

    const addFerry = useCallback(async (from, to, oneway) => {
        if(!from || !to) return;
        setAction(true);
        const formattedFrom = from.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        const formattedTo = to.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        let requestBody;
        if(oneway == 1){
            requestBody = [[[formattedFrom, formattedTo].join(" - "), "x"]];
        } else {
            requestBody = [[[formattedFrom, formattedTo].join(" - "), "x"], [[formattedTo, formattedFrom].join(" - "), "x"]];
        }
        await Axios.post(gb.backendIP+"dodajProm/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {dodawane: requestBody}).then((r) => {
            if(!r.data['blad']){
                toast({
                    title: "Dodanie połączeń tranzytowych",
                    className: "bg-green-500 text-green-50",
                    description: "Pomyślnie dodano połączenie tranzytowe "+(oneway == 1 ? "jednokierunkowe " : "dwukierunkowe ") + "między " + formattedFrom + ", a " + formattedTo,
                });
                setFerry([]);
                setLoaded(false);
            } else {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Niedodano połączeń tranzytowych z powodu: "+r.data['blad']
                });
                setFerry([]);
                setLoaded(false);
            }
        }).catch((er) => {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Niedodano połączeń tranzytowych z powodu: "+er.message
            });
        });
        setAction(false);
    }, [toast]);
    
    const deleteFerry = useCallback(async (id, name) => {
        setAction(true);
        console.log("delete", id, name);
        await Axios.post(gb.backendIP+"usunProm/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {
            ktore: id,
            nazwa: name
        }).then((r) => {
            if(!r.data['blad']){
                toast({
                    title: "Usunięto połączenie tranzytowe",
                    className: "bg-green-500 text-green-50",
                    description: "Pomyślnie usunięto połączenie tranzytowe "+name,
                });
                setFerry([]);
                setLoaded(false);
            } else {
                toast({
                    title: "Wystąpił błąd",
                    className: "bg-green-500 text-green-50",
                    description: "Nieusunięto połączenia tranzytowego "+name+" z powodu: "+r.data['blad'],
                });
                setFerry([]);
                setLoaded(false);
            }
        }).catch((er) => {
            console.log(er);
            toast({
                title: "Wystąpił błąd",
                className: "bg-green-500 text-green-50",
                description: "Nieusunięto połączenia tranzytowego "+name+" z powodu: "+er.message,
            });
        });
        setAction(false);
    }, [toast]);

    useEffect(() => {
        if(!isOpen) return;
        if(!loaded) initFerry();
    });

    return(
        <Dialog open={isOpen} onOpenChange={(e) => setOpen(e)}>
            <DialogTrigger asChild>
                <Button className="grow">Promy</Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={ (e) => e.preventDefault() } className="max-w-[max-content_!important]">
                <DialogHeader className="relative">
                    <DialogTitle>Lista promów i pociągów</DialogTitle>
                    <DialogDescription>Możliwość dodawania i usuwania połączeń tranzytowych z gry.</DialogDescription>
                </DialogHeader>
                <Button variant="link" size="sm" className="absolute top-2.25 right-9 text-xs" onClick={() => {
                    setFiltryPromy({skad: "", dokad: "", jednokierunkowe: 0});
                    initFerry();
                }} >Odśwież</Button>
                <div className="grid grid-cols-[110px_240px_240px_90px] [&>div]:p-2 bg-zinc-900 font-bold -mb-4">
                    <div>ID</div>
                    <div>Skąd</div>
                    <div>Dokąd</div>
                    <div>Akcja</div>
                </div>
                <div className="max-h-150 overflow-y-auto">
                    {/* { loaded ? zwrocPromy() : <div className="p-4 py-10 col-span-4 text-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Trwa wczytywanie połączeń...</b></div> } */}
                    { loaded ?
                        ferry.length ?
                            filteredFerries.length ?
                                filteredFerries.map((prom, k) => {
                                    let nazwa = prom.nazwa.split(" - ");
                                    return(
                                        <div key={`prom_${prom.id}`} className={`${k%2 ? "bg-zinc-950" : "bg-[#0c0c0c]"} hover:bg-zinc-900 grid grid-cols-[110px_240px_240px_90px] [&>div]:p-2`} >
                                            <div>{prom.id}</div>
                                            <div>{nazwa[0]}</div>
                                            <div>{nazwa[1]}</div>
                                            <div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button className="h-7.5 cursor-pointer" disabled={action}>Usuń</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Czy aby napewno chcesz usunąć połączenie z <b className="text-green-400">{nazwa[0]}</b> do <b className="text-green-400">{nazwa[1]}</b>?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction className="cursor-pointer" onClick={ () => deleteFerry(prom.id, prom.nazwa) } >Potwierdź</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    )
                                })
                                : <div className="p-4 py-10 col-span-4 text-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Brak wyników filtrowania 🙄</b></div>
                            : <div className="p-4 py-10 col-span-4 text-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Brak połączeń tranzytowych 🤨</b></div>
                        : <div className="p-4 py-10 col-span-4 text-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Trwa wczytywanie połączeń...</b></div>
                    }
                </div>
                <div className="grid grid-cols-[110px_240px_240px_90px] [&>div]:p-2 bg-zinc-900 -mt-4">
                    <div>
                        <Select value={filtryPromy.jednokierunkowe} onValueChange={ (e) => setFiltryPromy((f) => ({ ...f, jednokierunkowe: e })) } disabled={action}>
                            <SelectTrigger className="grow w-full">
                                <SelectValue placeholder="Kierunek" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value={0}>Dwukierunkowe</SelectItem>
                                <SelectItem value={1}>Jednokierunkowe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Input placeholder="Początek" value={ filtryPromy.skad ?? "" } onChange={(e) => { e.preventDefault(); setFiltryPromy(x =>  ({...x, skad: e.target.value})); }} disabled={action} />
                    </div>
                    <div>
                        <Input placeholder="Koniec" value={	filtryPromy.dokad ?? "" } onChange={(e) => { e.preventDefault(); setFiltryPromy(x => ({ ...x, dokad: e.target.value })); }} disabled={action} />
                    </div>
                    <div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={ action || !filtryPromy.skad || !filtryPromy.dokad || ( filtryPromy.jednokierunkowe !== 0 && filtryPromy.jednokierunkowe !== 1 ) }
                                    className="not-disabled:cursor-pointer"
                                >Dodaj</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Czy aby napewno chcesz dodać nowe
                                        połączenie <b className="text-blue-400">{filtryPromy.jednokierunkowe ? "jednokierunkowe" : "dwukierunkowe"}</b> między <b className="text-green-400">{filtryPromy.skad}</b>
                                        , a <b className="text-green-400">{filtryPromy.dokad}</b>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                                    <AlertDialogAction className="cursor-pointer" onClick={() => addFerry(filtryPromy.skad, filtryPromy.dokad, filtryPromy.jednokierunkowe)} >Potwierdź</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
};
export default memo(DialogPromy);