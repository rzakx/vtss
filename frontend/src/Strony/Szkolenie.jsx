import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Nawigacja from "@/Komponenty/Nawigacja";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import Axios from "axios";
import gb from "@/GlobalVars";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RiArrowGoBackFill } from "react-icons/ri";
import { FaCheck, FaGavel, FaUsers } from "react-icons/fa";
import { io } from "socket.io-client";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { MdWatchLater } from "react-icons/md";

const Szkolenie = (props) => {

    const { szkolenieId } = useParams();
    const { toast } = useToast();
    const [ bladSprawdzania, setBladSprawdzania ] = useState({wiadomosc: "", powod: "", triggered: false});
    const [ daneSzkolenia, setDaneSzkolenia ] = useState({sprawdzone: false, dostep: false, rolaInstruktora: false, informacje: undefined, uprawnienia: []});
    const [ historiaCzatu, setHistoriaCzatu ] = useState({polaczony: false, wczytane: false, zawartosc: [], blokada: true});
    const [ wysylanaWiadomosc, setWysylanaWiadomosc ] = useState({zawartosc: "", wyslij: false});
    const [ dostepneTypySzkolen, setDostepneTypySzkolen ] = useState({wczytane: false, zawartosc: []});
    const [ listaUzytkownikow, setListaUzytkownikow ] = useState({wczytane: false, zawartosc: []});
    const [ akcjaInstruktor, setAkcjaInstruktor ] = useState(undefined);
    const socketRef = useRef(null);

    const inicjalizacjaDanych = async () => {
        // sprawdza czy uzytkownik ma dostep
        // jesli nie - ustawia odpowiednia wiadomosc i po 15s przekierowuje na główną
        // jesli tak - ustawia widok albo wlasciciela albo instruktora szkolenia i wczytuje niezbedne informacje o szkoleniu
        console.log("Sprawdzam sobie czy mam dostep do szkolenia id: ", szkolenieId);
        await Axios.post(gb.backendIP+"szkolenie/"+localStorage.getItem("token")+"/"+szkolenieId)
        .then((r) => {
            if(r.data['blad']){
                setBladSprawdzania({wiadomosc: "Nie jesteś uprawniony do interakcji z tym zgłoszeniem.", powod: "Powód: "+r.data['blad'], triggered: false});
                setDaneSzkolenia({sprawdzone: true, dostep: false, rolaInstruktora: false, informacje: undefined, uprawnienia: []});
                return;
            }
            setDaneSzkolenia({sprawdzone: true, ...r.data});
            return;
        }).catch((er) => {
            setBladSprawdzania({wiadomosc: "Wystąpił błąd podczas sprawdzania uprawnień dostępu do zgłoszenia.", powod: "Powód: "+er.message, triggered: false});
            setDaneSzkolenia({sprawdzone: true, dostep: false, rolaInstruktora: false, informacje: undefined, uprawnienia: []});
            return;
        });
    };

    const wczytajDostepneSzkolenia = async () => {
		await Axios.post(gb.backendIP+"uprawnienia")
		.then((r) => {
			setDostepneTypySzkolen({wczytane: true, zawartosc: r.data});
		}).catch((er) => {
			console.log("blad wczytywania dostepnych typow szkolen");
            toast({
				title: "Dostępne typy szkoleń",
				variant: "destructive",
				description:
					"Wystąpił błąd podczas wczytywania dostępnych typów szkoleń. Powód: " +
					er.message,
			});
			setDostepneTypySzkolen({wczytane: true, zawartosc: []});
		})
	};

    const wczytajUzytkownikow = async () => {
        await Axios.post(gb.backendIP+"listaUzytkownikow")
        .then((r) => {
            if(r.data['blad']){
                toast({
                    title: "Lista użytkowników",
                    variant: "destructive",
                    description: "Wystąpił błąd podczas wczytywania danych o instruktorach. Powód: " + r.data["blad"] || "Nieznane",
                });
                setListaUzytkownikow({wczytane: true, zawartosc: []});
                return;
            }
            setListaUzytkownikow({wczytane: true, zawartosc: r.data});
        }).catch((er) => {
            toast({
                title: "Lista użytkowników",
                variant: "destructive",
                description:
                    "Wystąpił błąd podczas wczytywania dostępnych typów szkoleń. Powód: " +
                    er.message,
            });
            setListaUzytkownikow({wczytane: true, zawartosc: []});
        })
    };

    const wczytajHistorieCzatu = async () => {
        await Axios.post(gb.backendIP+"szkolenieCzat/"+localStorage.getItem("token")+"/"+szkolenieId)
        .then((r) => {
            if(r.data['blad']){
                setHistoriaCzatu({wczytane: true, zawartosc: [], polaczony: false, blokada: r.data['blad']});
                return;
            }
            setHistoriaCzatu({wczytane: true, zawartosc: r.data.odp, polaczony: false, blokada: false});
        }).catch((er) => {
            console.log(er);
            toast({
                title: "Czat szkoleniowy",
                variant: "destructive",
                description: "Wystąpił błąd podczas wczytywania historii czatu szkoleniowego. Powód: "+er.message
            })
            setHistoriaCzatu({wczytane: true, zawartosc: [], polaczony: false, blokada: "Błąd sieciowy"});
        })
    };

    useEffect(() => {
        if(!daneSzkolenia.sprawdzone) {
            inicjalizacjaDanych();
            return;
        }
        if(bladSprawdzania.wiadomosc){
            if(!bladSprawdzania.triggered){
                const wyprowadzGrzecznie = setTimeout(() => {
                    setBladSprawdzania((b) => ({...b, triggered: true}));
                }, 15_000);
                return () => {
                    clearTimeout(wyprowadzGrzecznie);
                }
            } else {
                window.location.href = "/";
                return;
            }
        }
        if(!listaUzytkownikow.wczytane) wczytajUzytkownikow();
        if(!dostepneTypySzkolen.wczytane) wczytajDostepneSzkolenia();
    }, [daneSzkolenia, szkolenieId, bladSprawdzania, dostepneTypySzkolen, listaUzytkownikow]);

    useEffect(() => {
        if(!daneSzkolenia.dostep) return;
        if(!historiaCzatu.wczytane) {
            wczytajHistorieCzatu();
            return;
        }

        if(historiaCzatu.blokada) {
            console.log("uzytkownik ma blokadeee, wiec bez sensu laczyc sie z czatem")
            return;
        }
        if(daneSzkolenia.informacje.status === 2) {
            console.log("nie polacze z czatem bo i tak szkolenie ma status zakonczone...");
            return;
        }
        if(!historiaCzatu.polaczony) {
            socketRef.current = io("https://telemetria.thebossspedition.pl");
        }

        const socketOnConnect = (e) => {
			console.log("Połączono z socket, prosze o dolaczenie do czatu");
			socketRef.current.emit("czatSzkolenieDolacz", { szkolenieId: szkolenieId, token: localStorage.getItem("token") });
            setHistoriaCzatu((x) => ({...x, polaczony: true}));
		}
		const socketOtrzymajWiadomosc = (e) => {
            console.log(e);
			setHistoriaCzatu((x) => ({...x, zawartosc: [...historiaCzatu.zawartosc, e]}));
		}
		const socketOnDisconnect = (e) => {
			console.log("Rozłączono z czatem socket!");
            toast({
                title: "Rozłączono z czatem!",
                variant: "destructive",
                description: "Połączenie zostało zerwane! Następuje automatyczna próba wznowienia połączenia."
            })
            setHistoriaCzatu((x) => ({...x, polaczony: false}));
		}

		socketRef.current.on("connect", socketOnConnect);
		socketRef.current.on("czatSzkolenieOdbierz", socketOtrzymajWiadomosc);
		socketRef.current.on("disconnect", socketOnDisconnect);
		return () => {
			socketRef.current.off("connect", socketOnConnect);
			socketRef.current.off("czatSzkolenieOdbierz", socketOtrzymajWiadomosc);
			socketRef.current.off("disconnect", socketOnDisconnect);
		};

    }, [daneSzkolenia, historiaCzatu]);

    useEffect(() => {
        if(wysylanaWiadomosc.wyslij && wysylanaWiadomosc.zawartosc){
            if(!socketRef.current){
                toast({
                    title: "Błąd wysyłania wiadomości",
                    variant: "destructive",
                    description: "Nie jesteś połączony z czatem szkoleniowym."
                });
                setWysylanaWiadomosc((x) => ({...x, wyslij: false}));
            } else {
                if(!socketRef.current.connected){
                    toast({
                        title: "Błąd wysyłania wiadomości",
                        variant: "destructive",
                        description: "Nie jesteś połączony z czatem szkoleniowym."
                    });
                    setWysylanaWiadomosc((x) => ({...x, wyslij: false}));
                } else {
                    console.log("wysylanie wiadomosci", wysylanaWiadomosc.zawartosc);
                    socketRef.current.emit("czatSzkolenieWyslij", {
                        token: localStorage.getItem("token"),
                        szkolenieId: szkolenieId,
                        wiadomosc: wysylanaWiadomosc.zawartosc
                    });
                    setWysylanaWiadomosc({zawartosc: "", wyslij: false})
                }
            }
        }
    }, [wysylanaWiadomosc.wyslij]);

    const przejmijTicket = async () => {
        await Axios.post(gb.backendIP+"szkoleniePrzejmij/"+localStorage.getItem("token")+"/"+szkolenieId)
        .then((r) => {
            if(r.data['blad']){
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: r.data['blad']
                });
                setAkcjaInstruktor(undefined);
                return;
            }
            toast({
                title: "Przejęto zgłoszenie",
                variant: "success",
                description: "Pomyślnie przejęto zgłoszenie szkolenia. Jesteś teraz upoważniony do czatu szkoleniowego."
            })
            setAkcjaInstruktor(undefined);
            setDaneSzkolenia((x) => ({...x, sprawdzone: false}));
            setHistoriaCzatu((x) => ({...x, wczytane: false}));
        }).catch((er) => {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: er.message
            });
            setAkcjaInstruktor(undefined);
        });
    };

    const zamknijTicket = async () => {
        await Axios.post(gb.backendIP+"szkolenieZakoncz/"+localStorage.getItem("token")+"/"+szkolenieId)
        .then((r) => {
            if(r.data['blad']){
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: r.data['blad']
                });
                setAkcjaInstruktor(undefined);
                return;
            }
            toast({
                title: "Zamknięto zgłoszenie",
                variant: "success",
                description: "Pomyślnie zmieniono status zgłoszenia szkolenia."
            })
            setAkcjaInstruktor(undefined);
            setDaneSzkolenia((x) => ({...x, sprawdzone: false}));
            setHistoriaCzatu((x) => ({...x, wczytane: false}));
            if(r.data.odp === "Anulowano zgłoszenie.") window.location.href = "/szkolenia";
        }).catch((er) => {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: er.message
            });
            setAkcjaInstruktor(undefined);
        });
    };

    useEffect(() => {
        if(akcjaInstruktor === "przejmij") przejmijTicket();
        if(akcjaInstruktor === "zakoncz") zamknijTicket();
    }, [akcjaInstruktor]);

    // const ktoraStronaCzatu = useMemo(() => )

    const znajdzLogin = useCallback((idUzytkownika) => {
        const login = listaUzytkownikow.zawartosc.find(x => x.id === idUzytkownika);
        if(login) {
            return {
                login: login.login,
                awatar: "/img/" + login.awatar,
                strona: login.login === localStorage.getItem("login")
            }
        } else {
            return {
                login: "Nieznany",
                awatar: "/img/awatary/default.png",
                strona: false
            };
        }
    }, [listaUzytkownikow.zawartosc]);

    const breakpointyCzatu = useRef([]);

    const wyswietlHistorieCzatu = () => {
        return historiaCzatu.zawartosc.map((wiadomosc, index) => {
            const daneUser = znajdzLogin(wiadomosc.uzytkownik);
            const breakpointy = breakpointyCzatu.current;
            let zmianaStrony = true;
            if(!breakpointy.length ) breakpointy.push({ index: index, timestamp: new Date(wiadomosc.dataWyslania) });
            if(index){
                zmianaStrony = (historiaCzatu.zawartosc[index-1].uzytkownik !== wiadomosc.uzytkownik);
                //  ? znajdzLogin(historiaCzatu.zawartosc[index-1].uzytkownik) : false;
                if(!zmianaStrony) {
                    // znajdz ostatni breakpoint, OGOLNIE ponowny render wyswietlHistorieCzatu() nie generuje od nowa breakpointow...
                    // wiec trzeba sprawdzac te ktore sa max o indexie tego indexu.
                    const lastBreakpoint = breakpointy.filter(x => x.index <= index).at(-1);
                    if(lastBreakpoint.index === index) zmianaStrony = true;
                    else {
                        // console.log("lastBreakpoint index:", lastBreakpoint.index, "current index: ", index);
                        // console.log("roznica czasu: ", new Date(wiadomosc.dataWyslania).getTime() - lastBreakpoint.timestamp.getTime());
                        if(new Date(wiadomosc.dataWyslania).getTime() - lastBreakpoint.timestamp.getTime() > 1000 * 60 * 5){
                            breakpointy.push({
                                index: index,
                                timestamp: new Date(wiadomosc.dataWyslania)
                            });
                            zmianaStrony = true;
                        }
                    }

                } else {
                    // console.log("zmianaStrony");
                    const prewencjaPonownegoBreakpointu = breakpointy.find(x => x.index === index);
                    if(prewencjaPonownegoBreakpointu === undefined){
                        breakpointy.push({
                            index: index,
                            timestamp: new Date(wiadomosc.dataWyslania)
                        });
                    }
                }
            }
            
            return(
                <div className="flex flex-col" key={`wiadomosc_${daneUser.login}_${wiadomosc.id}`}>
                    { zmianaStrony
                    ? <div key={`autorWiadomosci_${daneUser.login}_${index.toString()}`} className={`${daneUser.strona ? "self-end" : "self-start flex-row-reverse"} mb-1 mt-3 flex items-center`}>
                        <span className="font-bold tracking-wider text-sm">{daneUser.login}</span>
                        <img src={daneUser.awatar} className={`inline ${daneUser.strona ? "ml-3" : "mr-3"} h-8 w-8 rounded-xl`} />
                    </div>
                    : "" }
                    <div className={`${daneUser.strona ? "self-end rounded-tr-none bg-blue-500" : "self-start rounded-tl-none bg-purple-400"} rounded-xl py-2 px-3 w-fit max-w-3/5`}>
                        <p className={`${daneUser.strona ? "text-right" : "text-left"} text-[10px] tracking-wide font-light`}>{ new Date(wiadomosc.dataWyslania).toLocaleString("pl-PL", {hour: "2-digit", minute: "2-digit", second: "2-digit", day: "numeric", month: "long"})}</p>
                        <div className={`${daneUser.strona ? "text-right" : "text-left"} text-sm font-medium tracking-wide`}>{ wiadomosc.wiadomosc }</div>
                    </div>
                </div>
            )
        })
    };

    const zmienStatusUpr = async (idupr, czyNadane) => {
        await Axios.post(gb.backendIP+"zmienStatusUprSzkolenie/"+szkolenieId+"/"+localStorage.getItem("token"), {
            idupr: idupr,
            nadane: czyNadane === 1 ? true : false,
        }).then((r) => {
            if(r.data['blad']){
                toast({
                    title: "Błąd zmiany statusu",
                    variant: "destructive",
                    description: "Wystąpił błąd podczas zmiany statusu uprawnienia. Powód: " + (r.data['blad']),
                });
            } else {
                toast({
                    title: "Zaktualizowano status",
                    variant: "success",
                    description: "Pomyślnie zaktualizowano status uprawnienia."
                });
                setDaneSzkolenia(x => ({...x, sprawdzone: false}));
            }
        }).catch((er) => {
            toast({
                title: "Błąd zmiany statusu",
                variant: "destructive",
                description: "Wystąpił błąd podczas zmiany statusu uprawnienia. Powód: " + er.message,
            });
        });
    };

    return(
        <>
        <Nawigacja />
        <Toaster richColors />
        <div className="tlo" />
        <div className="srodekekranu">
        <Card>
        { !daneSzkolenia.dostep
        ? <CardContent>
            <p className="text-sm text-center font-semibold">{ bladSprawdzania.wiadomosc || "Wystąpił błąd podczas sprawdzania uprawnień dostępu do zgłoszenia." }</p>
            <p className="text-sm text-center font-semibold">{ bladSprawdzania.powod || "Powód: Nieznany." }</p>
            <br />
            <CardDescription className="text-center">Za chwilę zostaniesz przeniesiony na stronę główną.</CardDescription>
        </CardContent>
        : !daneSzkolenia.informacje
            ? <CardContent>
                <p className="text-sm text-center font-semibold">Trwa wczytywanie informacji...</p>
                <br />
                <CardDescription className="text-center">Zgłoszenie szkolenia #{szkolenieId}</CardDescription>
            </CardContent>
            : <>
                <CardHeader>
                    <CardTitle>Zgłoszenie szkolenia #{szkolenieId}</CardTitle>
                    <CardDescription>
                    { !daneSzkolenia.rolaInstruktora ? "Znajdziesz tutaj informacje dotyczące Twojego zgłoszenia." : `Informacje dotyczące zgłoszenia szkolenia użytkownika ${listaUzytkownikow.zawartosc.find(x => x.id === daneSzkolenia.informacje.kierowca) ? listaUzytkownikow.zawartosc.find(x => x.id === daneSzkolenia.informacje.kierowca).login : "Nieznany"}.`}
                    </CardDescription>
                    <CardAction className="space-x-2">
                        <Link to="/szkolenia" className="hover:tracking-[inherit_!important]"><Button variant="secondary"><RiArrowGoBackFill /> Wróć do listy</Button></Link>
                        { (daneSzkolenia.informacje.status === 0 && !daneSzkolenia.rolaInstruktora) &&
                            <Button disabled={akcjaInstruktor} className="bg-red-300 text-red-800 hover:bg-red-900 hover:text-red-50" onClick={() => setAkcjaInstruktor("zakoncz")}><FaGavel /> Anuluj szkolenie</Button>
                        }
                        { daneSzkolenia.rolaInstruktora
                        ? (daneSzkolenia.informacje.status !== 2)
                            ? !daneSzkolenia.informacje.instruktor
                                ? <Button disabled={akcjaInstruktor} className="bg-amber-200 text-amber-800 hover:bg-amber-700 hover:text-amber-100" onClick={() => setAkcjaInstruktor("przejmij")}><FaUsers /> Przejmij szkolenie</Button>
                                : <Button disabled={akcjaInstruktor} className="bg-red-300 text-red-800 hover:bg-red-900 hover:text-red-50" onClick={() => setAkcjaInstruktor("zakoncz")}><FaGavel /> Zakończ szkolenie</Button>
                            : ""
                        : ""
                        }
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-5 mb-5">
                        <div className="space-y-1.5 w-160">
                            <div className="justify-between items-end flex">
                                <Label>Lista uprawnień (Wybranych: {daneSzkolenia.uprawnienia.length})</Label>
                                { daneSzkolenia.rolaInstruktora && <p className="text-xs -mb-1 font-bold">PPM - Status nadania</p>}
                            </div>
                            <div className="flex w-full space-y-1.5 flex-col">
                                { daneSzkolenia.uprawnienia.map((upr, index) => {
                                    const znajdzUpr = dostepneTypySzkolen.zawartosc.find(zn => zn.id == upr.idUprawnienia);
                                    if(!znajdzUpr) return <div key={"uprawnienie"+upr.id} className="inline-flex w-full">
                                        <div className="w-160 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">Usunięty typ uprawnienia</div>
                                    </div>;
                                    // if(daneSzkolenia.rolaInstruktora && daneSzkolenia.informacje.status == 1){
                                        return(
                                            <ContextMenu>
                                                <ContextMenuTrigger asChild>
                                                    <div key={"uprawnienie"+upr.id} className="inline-flex w-full">
                                                        <div className="w-15.5 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{znajdzUpr.gra ? "ATS" : "ETS2"}</div>
                                                        <div className="w-25 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{znajdzUpr.rodzaj}</div>
                                                        <div className="w-66.75 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-2 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 truncate">{znajdzUpr.nazwa}</div>
                                                        <div className="w-45.75 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{new Date(upr.termin).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                                                        <div title={upr.nadane === 1 ? "Uprawnienie zostało nadane" : "Uprawnienie oczekuje na nadanie"} className={`w-7 flex items-center justify-center dark:bg-input/50 border border-input border-l-0 ${upr.nadane === 1 ? "text-green-400" : "text-orange-300"}`}>{upr.nadane === 1 ? <FaCheck /> : <MdWatchLater />}</div>
                                                    </div>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent>
                                                    <ContextMenuItem
                                                        disabled={upr.nadane || !daneSzkolenia.rolaInstruktora || daneSzkolenia.informacje.status != 1}
                                                        data-idupr={upr.id}
                                                        onSelect={(e) => zmienStatusUpr(e.target.attributes['data-idupr'].value, 1)}
                                                    >Oznacz jako nadane <FaCheck className="text-green-400" /></ContextMenuItem>
                                                    <ContextMenuItem
                                                        disabled={!upr.nadane || !daneSzkolenia.rolaInstruktora || daneSzkolenia.informacje.status != 1}
                                                        data-idupr={upr.id}
                                                        onSelect={(e) => zmienStatusUpr(e.target.attributes['data-idupr'].value, 0)}
                                                    >Oznacz jako oczekujące <MdWatchLater className="text-orange-300" /></ContextMenuItem>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        )
                                    // }
                                    // return(<div key={"uprawnienie"+upr.id} className="inline-flex w-full">
                                    //     <div className="w-15.5 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{znajdzUpr.gra ? "ATS" : "ETS2"}</div>
                                    //     <div className="w-25 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{znajdzUpr.rodzaj}</div>
                                    //     <div className="w-66.75 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-2 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 truncate">{znajdzUpr.nazwa}</div>
                                    //     <div className="w-45.75 rounded-none border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">{new Date(upr.termin).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                                    //     <div title={upr.nadane === 1 ? "Uprawnienie zostało nadane" : "Uprawnienie oczekuje na nadanie"} className={`w-7 flex items-center justify-center dark:bg-input/50 border border-input border-l-0 ${upr.nadane === 1 ? "text-green-400" : "text-orange-300"}`}>{upr.nadane === 1 ? <FaCheck /> : <MdWatchLater />}</div>
                                    // </div>)
                                }) }
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 min-w-sm h-fit">
                            <div className="space-y-1.5">
                                <Label>Kierowca</Label>
                                {
                                    listaUzytkownikow.zawartosc.find(kierowca => kierowca.id === daneSzkolenia.informacje.kierowca)
                                    ? <Link target="_blank" to={"/profil/"+listaUzytkownikow.zawartosc.find(kierowca => kierowca.id === daneSzkolenia.informacje.kierowca).login}>
                                        <img className="inline rounded-md align-middle mr-3 w-7.5 h-7.5" src={"/img/" + listaUzytkownikow.zawartosc.find(kierowca => kierowca.id === daneSzkolenia.informacje.kierowca).awatar } /> 
                                        { listaUzytkownikow.zawartosc.find(kierowca => kierowca.id === daneSzkolenia.informacje.kierowca).login || "Nieznany kierowca" }
                                    </Link>
                                    : <p className="text-muted-foreground font-medium text-sm">Usunięte konto</p>
                                }
                            </div>
                            <div className="space-y-1.5">
                                <Label>Instruktor</Label>
                                <div>
                                    { daneSzkolenia.informacje.instruktor
                                    ? listaUzytkownikow.zawartosc.find(instruktor => instruktor.id === daneSzkolenia.informacje.instruktor)
                                        ? <Link target="_blank" to={"/profil/"+listaUzytkownikow.zawartosc.find(instruktor => instruktor.id === daneSzkolenia.informacje.instruktor).login}>
                                            <img className="inline rounded-md align-middle mr-3 w-7.5 h-7.5" src={"/img/" + listaUzytkownikow.zawartosc.find(instruktor => instruktor.id === daneSzkolenia.informacje.instruktor).awatar  } /> 
                                            { listaUzytkownikow.zawartosc.find(instruktor => instruktor.id === daneSzkolenia.informacje.instruktor).login || "Nieznany kierowca" }
                                        </Link>
                                        : <p className="text-muted-foreground font-medium text-sm">Usunięte konto</p>
                                    : <p className="text-muted-foreground font-medium text-sm">Brak</p> }
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Status szkolenia</Label>
                                <Badge className={daneSzkolenia.informacje.status === 0 ? "bg-amber-300 text-amber-800" : daneSzkolenia.informacje.status === 2 ? "bg-green-300 text-green-800" : "bg-red-300 text-red-800"}>{daneSzkolenia.informacje.status === 0 ? "Oczekujące" : daneSzkolenia.informacje.status === 2 ? "Zakończone" : "W trakcie"}</Badge>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Użycie zniżki</Label>
                                <p className="text-muted-foreground font-medium text-sm">{daneSzkolenia.informacje.czyZnizka ? "Tak" : "Nie"}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Data utworzenia</Label>
                                <p className="text-muted-foreground font-medium text-sm">{ new Date(daneSzkolenia.informacje.dataRozpoczecia).toLocaleString("pl-PL", {day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"}) } </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Data zakończenia</Label>
                                <p className="text-muted-foreground font-medium text-sm">{ daneSzkolenia.informacje.dataZakonczenia ? new Date(daneSzkolenia.informacje.dataZakonczenia).toLocaleString("pl-PL", {day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"}) : "Zgłoszenie w toku." } </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Przybliżony termin</Label>
                                <p className="text-muted-foreground font-medium text-sm">{ daneSzkolenia.informacje.dataPrzypuszczalna ? new Date(daneSzkolenia.informacje.dataPrzypuszczalna).toLocaleString("pl-PL", {day: "numeric", month: "long", year: "numeric"}) : "Dowolny." }</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex w-full justify-between">
                            <b className="ml-2 -mb-2 text-sm tracking-wide">Czat szkoleniowy</b>
                            <Badge className={`transition-colors duration-500 ${historiaCzatu.polaczony ? 'bg-green-300 text-green-800' : 'bg-orange-300 text-orange-800'}`}>{ historiaCzatu.polaczony ? "Połączony": "Rozłączony"}</Badge>
                        </div>
                        <div key={`czatSzkoleniowy_${szkolenieId}`} className="w-full min-h-24 max-h-64 p-2 gap-1 overflow-y-auto bg-zinc-50/15 rounded-md border-muted-foreground/40 border-2 flex flex-col">
                            { !historiaCzatu.wczytane ? <div className="text-white select-none opacity-60 font-regular italic place-self-center grow flex items-center justify-center text-xs tracking-widest"><p>Trwa wczytywanie historii wiadomości...</p></div>
                            : historiaCzatu.blokada ?
                                <div className="text-white select-none opacity-60 font-regular italic place-self-center grow flex items-center justify-center text-xs tracking-widest"><p>{historiaCzatu.blokada}</p></div>
                                : historiaCzatu.zawartosc.length ? wyswietlHistorieCzatu()
                            : <div className="text-white select-none opacity-60 font-regular italic place-self-center grow flex items-center justify-center text-xs tracking-widest"><p>Brak wysłanych wiadomości...</p></div>
                            }
                        </div>
                        <div className="flex w-full gap-2">
                            <Input
                                type="text"
                                maxLength={400}
                                placeholder={
                                    historiaCzatu.blokada
                                    ? "Nie jesteś uprawniony do wysyłania wiadomości..."
                                    : daneSzkolenia.informacje.instruktor
                                        ? (daneSzkolenia.informacje.status !== 2)
                                            ? "Wprowadź swoją wiadomość..."
                                            : "Zgłoszenie zostało zamknięte."
                                        : daneSzkolenia.rolaInstruktora
                                            ? "Aby rozpocząć konwersację, przejmij zgłoszenie."
                                            : "Nie możesz wysyłać wiadomości w szkoleniu bez instruktora."
                                }
                                className="grow tracking-wider font-medium text-teal-300"
                                value={wysylanaWiadomosc.zawartosc || ""}
                                onChange={(e) => setWysylanaWiadomosc((x) => ({...x, zawartosc: e.target.value}))}
                                onKeyDown={(e) => { 
            						if(e.key === 'Enter' && wysylanaWiadomosc.zawartosc) {
                                        e.preventDefault();
                                        if(!(wysylanaWiadomosc.wyslij || historiaCzatu.blokada || (daneSzkolenia.informacje.instruktor === null) || (daneSzkolenia.informacje.status === 2))) setWysylanaWiadomosc((x) => ({...x, wyslij: true}));
                                    }
                                }}
                                disabled={wysylanaWiadomosc.wyslij || historiaCzatu.blokada || (daneSzkolenia.informacje.instruktor === null) || (daneSzkolenia.informacje.status === 2)}
                            />
                            <Button disabled={(daneSzkolenia.informacje.status === 2) || !wysylanaWiadomosc.zawartosc || wysylanaWiadomosc.wyslij || historiaCzatu.blokada || (daneSzkolenia.informacje.instruktor === null)} onClick={() => setWysylanaWiadomosc((x) => ({...x, wyslij: true}))}>Wyślij</Button>
                        </div>
                    </div>
                </CardContent>
            </>
            }
        </Card>
        </div>
        </>
    )

};

export default Szkolenie;