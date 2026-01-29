import { memo,useState, useCallback, useEffect, useMemo } from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DialogMiasta = ({isOpen, setOpen, toast}) => {
    const [ action, setAction ] = useState(false);
    const [ loaded, setLoaded ] = useState(false);
    const [ cities, setCities ] = useState([]);
    const [ filter, setFilter ] = useState({gra: -1, kraj: "", miejscowosc: ""});

    const filterByGame = useMemo(() => {
        if(cities.length){
            if(filter.gra == -1) return cities;
            return cities.filter(x => x.gra == filter.gra);
        } else {
            return []
        }
    }, [cities, filter.gra])
    
    const filteredCities = useMemo(() => {
        if(cities.length){
            let tmpX = filterByGame;
            if(filter.kraj != "") tmpX = tmpX.filter(a => a.kraj.toLowerCase().includes(filter.kraj.toLowerCase()));
            if(filter.miejscowosc != "") tmpX = tmpX.filter(a => a.miasto.toLowerCase().includes(filter.miejscowosc.toLowerCase()));
            return tmpX;
        } else {
            return [];
        }
    }, [cities.length, filter.kraj, filter.miejscowosc, filterByGame]);

    const showFlag = useMemo(() => {
        const cache = new Map();
        return (kraj, isATS) => {
          if (isATS) return "/img/flagi/usa.png";
          if (cache.has(kraj)) return `/img/flagi/${cache.get(kraj)}.png`;
          console.log("pokazFlage");
          const sanitized = kraj
            .toLowerCase().replaceAll("ć", "c")
            .replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l")
            .replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e")
            .replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z");
          cache.set(kraj, sanitized);
          return `/img/flagi/${sanitized}.png`;
        };
    }, []);

    const fetchCities = useCallback(async () => {
        setLoaded(false);
        await Axios.post(gb.backendIP + "miasta").then((r) => {
            if (!r.data["blad"]) {
                setCities(r.data["dane"]);
            } else {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Wystąpił błąd podczas wczytywania zapisanych miejscowości gry z bazy.",
                });
                setCities([]);
            }
        }).catch(() => {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description:
                        "Wystąpił błąd podczas wczytywania zapisanych miejscowości gry z bazy.",
            });
            setCities([]);
        });
        setLoaded(true);
    }, [toast]);

    const addCity = useCallback(async (game, country, city) => {
        if(game == -1) return;
        if(!country || !city) return;
        setAction(true);
        const formattedCity = city.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        const formattedCountry = country.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        await Axios.post(gb.backendIP+"dodajMiasto/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {kraj: formattedCountry, miasto: formattedCity, gra: game}).then((r) => {
            if(!r.data['blad']){
                toast({
                    title: "Dodanie miejscowości",
                    className: "bg-green-500 text-green-50",
                    description: "Pomyślnie dodano miejscowość "+formattedCity+" należące do "+formattedCountry+" z gry "+(game ? "ATS" : "ETS2"),
                });
                setCities([]);
                setLoaded(false);
            } else {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Niedodano miejscowości z powodu: "+r.data['blad']
                })
                setCities([]);
                setLoaded(false);
            }
        }).catch((er) => {
            console.log(er);
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Niedodano miejscowości z powodu: "+er.message
            });
        });
        setAction(false);
    }, [toast]);

    const deleteCity = useCallback(async (game, country, city, id) => {
        setAction(true);
        await Axios.post(gb.backendIP+"usunMiasto/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {
            gra: game,
            kraj: country,
            miasto: city,
            id: id
        }).then((r) => {
            if(!r.data['blad']){
                toast({
                    title: "Usunięto miejscowość",
                    className: "bg-green-500 text-green-50",
                    description: "Pomyślnie usunięto miejscowość "+city+" należące do "+country+" z gry "+(game ? "ATS" : "ETS2"),
                });
                setCities([]);
                setLoaded(false);
            } else {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Nieusunięto miejscowości z powodu: "+r.data['blad']
                })
                setLoaded(false);
                setCities([]);
            }
        }).catch((er) => {
            console.log(er);
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Nieusunięto miejscowości z powodu: "+er.message
            });
        });
        setAction(false);
    }, [toast]);

    useEffect(() => {
        if(!isOpen) return;
        if(!loaded) fetchCities();
    }, [isOpen, fetchCities, loaded])

    return(
        <Dialog open={isOpen} onOpenChange={(e) => setOpen(e)}>
            <DialogTrigger asChild>
                <Button className="grow">Miejscowości</Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={ (e) => e.preventDefault() } className="max-w-[max-content_!important]">
                <DialogHeader>
                    <DialogTitle>Lista miejscowości</DialogTitle>
                    <DialogDescription>Możliwość dodawania i usuwania miejscowości z gry dostępnych w systemie.</DialogDescription>
                </DialogHeader>
                <Button variant="link" size="sm" className="absolute top-2.25 right-9 text-xs" onClick={() => {
                    setFilter({gra: -1, kraj: "", miejscowosc: ""});
                    fetchCities();
                }} >Odśwież</Button>
                <div className="grid grid-cols-[60px_60px_240px_240px_90px] [&>div]:p-2 bg-zinc-900 font-bold -mb-4">
                    <div>ID</div>
                    <div>Gra</div>
                    <div>Kraj / Region</div>
                    <div>Miejscowość</div>
                    <div>Akcja</div>
                </div>
                <div className="max-h-150 overflow-y-auto">
                    { loaded ?
                        cities.length ?
                            filteredCities.length ?
                                filteredCities.map((m, k) => {
                                    return(
                                        <div key={`miasto_${m.id}`} className={`${k%2 ? "bg-zinc-950" : "bg-[#0c0c0c]"} hover:bg-zinc-900 grid grid-cols-[60px_60px_240px_240px_90px] [&>div]:p-2`} >
                                            <div>{m.id}</div>
                                            <div>{m.gra ? "ATS" : "ETS2"}</div>
                                            <div><img className="h-4.5 w-6.25 inline mr-2" src={showFlag(m.kraj, m.gra)} /> {m.kraj}</div>
                                            <div>{m.miasto}</div>
                                            <div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button className="h-7.5 cursor-pointer" disabled={action}>Usuń</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Czy aby napewno chcesz usunąć miasto <b className="text-green-400">{m.miasto}</b> należące do <b className="text-blue-400">{m.kraj}</b> w grze <b className="text-red-400">{m.gra ? "ATS" : "ETS2"}</b>?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction className="cursor-pointer" onClick={ () => deleteCity(m.kraj, m.miasto, m.gra, m.id) }>Potwierdź</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    )})
                                : <div className="p-4 py-10 col-span-5 text-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Brak wyników filtrowania 🙄</b></div>
                            : <div className="p-4 py-10 col-span-5 text-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Brak dostępnych miejscowości 🙄</b></div>
                        : <div className="p-4 py-10 col-span-5 text-center"><b className="animate-[pulse_.6s_cubic-bezier(0.4,0,0.6,1)_infinite]">Trwa wczytywanie miejscowości</b></div>
                    }
                </div>
                <div className="grid grid-cols-[60px_60px_240px_240px_90px] [&>div]:p-2 bg-zinc-900 -mt-4">
                    <div className="col-span-2">
                        <Select value={filter.gra} onValueChange={(e) => setFilter((f) => ({ ...f, gra: e })) } disabled={action} >
                            <SelectTrigger className="grow w-full">
                                <SelectValue placeholder="Wybierz" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value={-1}>Wybierz</SelectItem>
                                <SelectItem value={0}>ETS2</SelectItem>
                                <SelectItem value={1}>ATS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Input placeholder="Wpisz kraj" value={ filter.kraj ?? "" } onChange={(e) => { e.preventDefault(); setFilter(x => ({ ...x, kraj: e.target.value })); }} disabled={action} />
                    </div>
                    <div>
                        <Input placeholder="Wpisz miejscowość" value={ filter.miejscowosc ?? "" } onChange={(e) => { e.preventDefault(); setFilter(x => ({ ...x, miejscowosc: e.target.value })) }} disabled={action} />
                    </div>
                    <div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={action || !filter.kraj || !filter.miejscowosc || (filter.gra != 1 && filter.gra != 0) } className="not-disabled:cursor-pointer" >Dodaj</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Czy aby napewno chcesz dodać nowe miasto <b className="text-green-400">{filter.miejscowosc ?? "???"}</b> należące do <b className="text-blue-400">{filter.kraj ?? "???"}</b> w grze <b className="text-red-400">{filter.gra ? "ATS" : "ETS2"}</b>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                                    <AlertDialogAction className="cursor-pointer" onClick={() => addCity(filter.gra, filter.kraj, filter.miejscowosc)} >Potwierdź</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
};
export default memo(DialogMiasta);