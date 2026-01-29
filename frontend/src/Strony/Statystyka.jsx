import Nawigacja from "../Komponenty/Nawigacja";
import { useEffect, useMemo, useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Bar, BarChart, Pie, PieChart, Legend, ScatterChart, ErrorBar, Scatter, ReferenceLine, LabelList } from 'recharts';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { pl } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch";

const SpalanieTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
		<div className="bg-muted/90 p-2.5 ">
			<p className="text-amber-300">Kierowca: {payload[0].payload.kto }</p>
			<p className="text-green-400">Min. spalanie: {payload[0].payload.min.toFixed(1) } l / 100 km</p>
			<p className="text-purple-400">Śr. spalanie: {payload[0].payload.avg.toFixed(1) } l / 100 km</p>
			<p className="text-red-400">Max. spalanie: {payload[0].payload.max.toFixed(1) } l / 100 km</p>
		</div>
		);
	}
	return null;
};

const UszkodzeniaTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
		<div className="bg-muted/95 p-2.5 ">
			<p className="text-amber-300">Kierowca: {payload[0].payload.login }</p>
            <p className="text-purple-400">Liczba tras: {payload[0].payload.liczbaTras}</p>
    		<p className="text-green-400">Liczba tras poniżej 1% uszkodzeń: {payload[0].payload.ponizej } ({payload[0].payload.ponizejProcent}%)</p>
			<p className="text-red-400">Liczba tras równo i powyżej 1% uszkodzeń: {payload[0].payload.powyzej } ({payload[0].payload.powyzejProcent}%)</p>
		</div>
		);
	}
	return null;
};

const PredkoscTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
		<div className="bg-muted/90 p-2.5 ">
			<p className="text-amber-300">Kierowca: {payload[0].payload.kto }</p>
			<p className="text-green-400">Min. prędkość max: {payload[0].payload.min.toFixed(1) } km/h</p>
			<p className="text-purple-400">Śr. prędkość max: {payload[0].payload.avg.toFixed(1) } km/h</p>
			<p className="text-red-400">Max. prędkość max: {payload[0].payload.max.toFixed(1) } km/h</p>
		</div>
		);
	}
	return null;
};

const DystansTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
		return (
		<div className="bg-muted/90 p-2.5 ">
			<p className="text-amber-300">Kierowca: {payload[0].payload.kto }</p>
			<p className="text-lime-400">Dostarczony tonaż: {payload[0].payload.tony } t</p>
			<p className="text-blue-400">Pokonany dystans: {payload[0].payload.km } km</p>
		</div>
		);
	}
	return null;
};

export default function Statystyka(props) {
    const [zakladka, setZakladka] = useState("firma");
    const [firmoweHistoria, setFirmoweHistoria] = useState([]);
    const [firmoweDane, setFirmoweDane] = useState({konto: [], slupkowy: [], czystyPrzychod: 0, czystyWydatek: 0, czystyDochod: 0})
    const [zakres, setZakres] = useState({od: null, do: null, wybrane: null});
    const [przyblizKolowy, setPrzyblizKolowy] = useState(false);

    const [ instruktor, setInstruktor ] = useState({blad: undefined, odp: undefined});
    const { instruktorSumaRazem, instruktorSumaEts, instruktorSumaAts } = useMemo(() => {
        if(!instruktor.odp) return {instruktorSumaRazem: "???", instruktorSumaEts: "???", instruktorSumaAts: "???"};
        const ats = instruktor.odp.reduce((total, curr) => total + curr.ats, 0);
        const ets = instruktor.odp.reduce((total, curr) => total + curr.ets, 0);
        return { instruktorSumaRazem: ats + ets, instruktorSumaEts: ets, instruktorSumaAts: ats };
    }, [instruktor.odp]);

    const [ dyspozytor, setDyspozytor ] = useState({ blad: undefined, odp: undefined });
    const { dyspozytorSumaRazem, dyspozytorSumaZatw, dyspozytorSumaOdrzuc } = useMemo(() => {
        if(!dyspozytor.odp) return { dyspozytorSumaRazem: "???", dyspozytorSumaZatw: "???", dyspozytorSumaOdrzuc: "???" };
        const zatw = dyspozytor.odp.reduce((total, curr) => total + curr.zatwierdzone, 0);
        const odrzuc = dyspozytor.odp.reduce((total, curr) => total + curr.odrzucone, 0);
        return { dyspozytorSumaRazem: zatw + odrzuc, dyspozytorSumaZatw: zatw, dyspozytorSumaOdrzuc: odrzuc };
    }, [dyspozytor.odp]);

    const [uzytkownicy, setUzytkownicy] = useState({blad: undefined, odp: undefined});

    const [ kierowcy, setKierowcy] = useState({blad: undefined, spalanie: undefined, uszkodzenia: undefined, predkosc: undefined, zarobki: undefined});
    const kierowcyPredkoscSrednia = useMemo(() => kierowcy.predkosc ? Number(kierowcy.predkosc.reduce((prev, curr) => prev + curr.avg, 0) / kierowcy.predkosc.length).toFixed(0) : 0, [kierowcy.predkosc]);

    const srednieSpalanieRazem = useMemo(() => kierowcy.spalanie ? Number((kierowcy.spalanie.reduce((prev, curr) => prev + curr.avg, 0) / kierowcy.spalanie.length).toFixed(1))  : 0, [kierowcy.spalanie]);

    const [ prompociag, setPrompociag ] = useState({blad: undefined, zestaw: undefined, razem: undefined, unikalnych: undefined});

    const [ logistykaMisc, setLogistykaMisc ] = useState({ blad: undefined, odp: undefined });
    const {logistykaIleTras, logistykaIleTrasETS, logistykaIleTrasATS, logistykaUnikalneETS, logistykaUnikalneATS} = useMemo(() => {
        if(!logistykaMisc.odp) return { logistykaIleTras: 0, logistykaIleTrasETS: 0, logistykaIleTrasATS: 0, logistykaUnikalneETS: 0, logistykaUnikalneATS: 0 };
        const tmpETS = logistykaMisc.odp.filter(x => x.gra === 0);
        const tmpATS = logistykaMisc.odp.filter(x => x.gra === 1);
        const trasETS = tmpETS.reduce((prev, curr) => prev + curr.liczba_wystapien, 0);
        const trasATS = tmpATS.reduce((prev, curr) => prev + curr.liczba_wystapien, 0);
        return {
            logistykaIleTras: trasATS + trasETS, logistykaIleTrasETS: trasETS, logistykaIleTrasATS: trasATS, logistykaUnikalneETS: tmpETS.length, logistykaUnikalneATS: tmpATS.length
        }
    }, [logistykaMisc.odp]);

	const [ logistykaPanstwa, setLogistykaPanstwa ] = useState({ blad: undefined, odp: undefined, gra: false });
    const { logistykaPanstwoStart, logistykaPanstwoKoniec } = useMemo(() => {
        if(!logistykaPanstwa.odp || (logistykaPanstwa.odp.length == 0)) return {logistykaPanstwoStart: undefined, logistykaPanstwoKoniec: undefined};
        const odVal = [...logistykaPanstwa.odp].sort((a, b) => b.od - a.od)[0].od;
        const doVal = [...logistykaPanstwa.odp].sort((a, b) => b.do - a.do)[0].do;
        const odPanstwa = [...logistykaPanstwa.odp].filter(x => x.od === odVal).map((val, index) => val.kraj);
        const doPanstwa = [...logistykaPanstwa.odp].filter(x => x.do === doVal).map((val, index) => val.kraj);
        if(odPanstwa.length > 3) odPanstwa.length = 3;
        if(doPanstwa.length > 3) doPanstwa.length = 3;
        return {
            logistykaPanstwoStart: odPanstwa.join(" / ")+" ("+odVal+"x)",
            logistykaPanstwoKoniec: doPanstwa.join(" / ")+" ("+doVal+"x)"
        }
    }, [logistykaPanstwa.odp]);

    const [ logistykaSpecjalne, setLogistykaSpecjalne ] = useState({blad: undefined, odp: undefined});
    const tekstSpecjalne = useMemo(() => {
        if(!logistykaSpecjalne.odp) return undefined;
        if(logistykaSpecjalne.odp.reduce((p, c) => p+c.wartosc, 0) <= 0) return undefined;
        let tmp = logistykaSpecjalne.odp.filter(x => x.wartosc > 0).map((val, ind) => val.nazwa + " ("+val.wartosc+"x)" );
        return tmp.join(", ");
    }, [logistykaSpecjalne.odp]);

    const [paginacjaFirmowe, setPaginacjaFirmowe] = useState(1);
    const liczbaElementow = 10;
    const dostepnaPaginacjaFirmowe = Math.ceil(firmoweHistoria.length / liczbaElementow);
    const historiaFirmowePaginacja = useMemo(
        () => firmoweHistoria.sort((a, b) => new Date(b.kiedy).getTime() - new Date(a.kiedy).getTime()),
        [firmoweHistoria]
    ).slice( (paginacjaFirmowe - 1) * liczbaElementow, paginacjaFirmowe * liczbaElementow );

    const zmienZakres = (e) => {
        let dataMax = new Date();
        dataMax.setHours(23, 59, 59, 975);
        let dataMin = new Date();
        dataMin.setHours(23, 59, 59, 975);
        let tmpE = 2;
        if(!e) {
            dataMin.setDate(dataMin.getDate() - 7);
        } else {
            tmpE = e;
        }
        if(e === 1){
            dataMin.setDate(dataMin.getDate() - 1);
        }
        if(e === 2){
            dataMin.setDate(dataMin.getDate() - 7);
        }
        if(e === 3){
            dataMin.setDate(dataMin.getDate() - 31);
        }
        if(e === 4){
            dataMin.setDate(dataMin.getDate() - 93);
        }
        if(e === 5){
            dataMin.setDate(dataMin.getDate() - 365);
        }
        if(e === 6){
            dataMin.setDate(dataMin.getDate() - 2000);
        }
		if(e === 7){
			dataMin = undefined;
			dataMax = undefined;
		}
        setZakres({od: dataMin, do: dataMax, wybrane: tmpE});
    };

    const wczytajKontoFirmowe = async () => {
        await Axios.post(gb.backendIP+"statystykakontofirmowe/"+localStorage.getItem("token"), {
            czasOd: zakres.od.toISOString(),
            czasDo: zakres.do.toISOString()
        }).then((r) => {
            if(r.data['blad']){
                console.log(r.data);
            } else {
                let czystyPrzychod = 0;
                let czystyWydatek = 0;
                const suma = r.data.odp.suma;
                let tmp = r.data.odp.dane
                .sort((a, b) => new Date(a.kiedy).getTime() - new Date(b.kiedy).getTime())
                .reduce((acc, curr, idx) => {
                  const previousSaldo = idx === 0 ? suma : acc[idx - 1].saldo;
                  acc.push({
                      kiedy: new Date(curr.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long'}) + " " + new Date(curr.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'}),
                      saldo: previousSaldo + curr.suma,
                      roznica: curr.suma,
                    });
                    return acc;
                }, []);

                //kolowe
                let kategorie = [
                    {kategoria: "Trasy", zysk: 0, strata: 0},
                    {kategoria: "Przelewy", zysk: 0, strata: 0},
                    {kategoria: "Licencje", zysk: 0, strata: 0},
                    {kategoria: "Szkolenia", zysk: 0, strata: 0},
                    {kategoria: "Zwroty", zysk: 0, strata: 0}
                ];
                r.data.odp.dane.forEach((x) => {
                    let index;
                    if(x.opis.toLowerCase().includes("trasa")){
                        index = 0;
                    } else {
                        if(x.opis.toLowerCase().includes("zwrot za usuwanie")){
                            index = 4;
                        } else {
                            if(x.opis.toLowerCase().includes("licencja [ats]") || x.opis.toLowerCase().includes("licencja [ets2]")){
                                index = 2;
                            } else {
                                if(x.opis.toLowerCase().includes("szkolenie [ats]") || x.opis.toLowerCase().includes("szkolenie [ets2]")){
                                    index = 3;
                                } else {
                                    index = 1;
                                }
                            }
                        }
                    }
                    if(x.suma < 0){
                        kategorie[index].strata = kategorie[index].strata + Math.abs(x.suma);
                        czystyWydatek = czystyWydatek + Math.abs(x.suma);
                    } else {
                        kategorie[index].zysk = kategorie[index].zysk + Math.abs(x.suma);
                        czystyPrzychod = czystyPrzychod + Math.abs(x.suma);
                    }
                });

                let rozbite = [];
				console.log((zakres.wybrane == 7 && ((1000 * 3600 * 24 * 14) >= (zakres.do.getTime() - zakres.od.getTime()))), "dni")
                if(zakres.wybrane == 2 || zakres.wybrane == 1 || (zakres.wybrane == 7 && ((1000 * 3600 * 24 * 14) >= (zakres.do.getTime() - zakres.od.getTime())))){
                    //rozbic na dni
                    let tymczasowe = {};
                    r.data.odp.dane.forEach((x) => {
                        let dzien = new Date(x.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long'});
                        if(!tymczasowe[dzien]){
                            tymczasowe[dzien] = {name: dzien, zysk: 0, strata: 0};
                        }
                        if(x.suma < 0){
                            tymczasowe[dzien].strata = tymczasowe[dzien].strata + Math.abs(x.suma);
                        } else {
                            tymczasowe[dzien].zysk = tymczasowe[dzien].zysk + Math.abs(x.suma);
                        }
                    })
                    rozbite = Object.values(tymczasowe);
                }
				console.log((zakres.wybrane == 7 && ((1000 * 3600 * 24 * 14) < (zakres.do.getTime() - zakres.od.getTime()) ) && ( (1000 * 3600 * 24 * 31) >= (zakres.do.getTime() - zakres.od.getTime()) ) ), "tygodnie")
                if(zakres.wybrane == 3 || (zakres.wybrane == 7 && ((1000 * 3600 * 24 * 14) < (zakres.do.getTime() - zakres.od.getTime()) ) && ( (1000 * 3600 * 24 * 31) >= (zakres.do.getTime() - zakres.od.getTime()) ) )){
                    //rozbic na 5 tygodni
                    rozbite = [
                        {name: "Tydzień 1", zysk: 0, strata: 0},
                        {name: "Tydzień 2", zysk: 0, strata: 0},
                        {name: "Tydzień 3", zysk: 0, strata: 0},
                        {name: "Tydzień 4", zysk: 0, strata: 0},
                        {name: "Tydzień 5", zysk: 0, strata: 0}
                    ]
                    r.data.odp.dane.forEach((x) => {
                        let przydzielDate = new Date(x.kiedy);
                        let index = (przydzielDate.getDate() - 1 - (przydzielDate.getDate() - 1)%7)/7;
                        if(x.suma < 0){
                            rozbite[index].strata = rozbite[index].strata + Math.abs(x.suma);
                        } else {
                            rozbite[index].zysk = rozbite[index].zysk + Math.abs(x.suma);
                        }
                    })
                    // (a.getDate()-1 - (a.getDate()-1) % 7)/7
                }
				console.log(( zakres.wybrane === 7 && ( (1000 * 3600 * 24 * 31) < (zakres.do.getTime() - zakres.od.getTime()) ) ), "najdluzszy")
                if((zakres.wybrane > 3 && zakres.wybrane < 7) || ( zakres.wybrane === 7 && ( (1000 * 3600 * 24 * 31) < (zakres.do.getTime() - zakres.od.getTime()) ) )){
                    let tymczasowe = {};
                    r.data.odp.dane.forEach((x) => {
                        let miesiac = new Date(x.kiedy).toLocaleString('pl-PL', {month: 'long', year: 'numeric'});
                        if(!tymczasowe[miesiac]) tymczasowe[miesiac] = {name: miesiac, zysk: 0, strata: 0};
                        if(x.suma < 0){
                            tymczasowe[miesiac].strata = tymczasowe[miesiac].strata + Math.abs(x.suma);
                        } else {
                            tymczasowe[miesiac].zysk = tymczasowe[miesiac].zysk + Math.abs(x.suma);
                        }
                    })
                    rozbite = Object.values(tymczasowe);
                }
                
                setFirmoweDane({konto: tmp, slupkowy: rozbite, czystyPrzychod: czystyPrzychod, czystyWydatek: czystyWydatek, czystyDochod: czystyPrzychod - czystyWydatek});
                setFirmoweHistoria(r.data.odp.dane);
                setPaginacjaFirmowe(1);
            }
        }).catch(er => {
            console.log(er);
        })
    };

    const wczytajDzialaniaKadry = async () => {
        await Axios.post(gb.backendIP+"statystykakadradyspozytor/"+localStorage.getItem("token"), {
            czasOd: zakres.od.toISOString(),
            czasDo: zakres.do.toISOString()
        }).then((r) => {
            // console.log(r.data);
            if(r.data['blad']){
                setDyspozytor({blad: r.data['blad'], odp: undefined})
            } else {
                let tmp = [...r.data.odp];
                if(uzytkownicy.odp){
                    r.data.odp.forEach((dysp, index) => {
                        const findUser = uzytkownicy.odp.find(u => u.id === dysp.kto);
                        if(findUser !== undefined) tmp[index].kto = findUser.login;
                        else tmp[index].kto = "Nieznany";
                    });
                }
                setDyspozytor({blad: undefined, odp: tmp});
            }
        }).catch((er) => {
            console.log(er);
            setDyspozytor({blad: "Wystąpił błąd: "+er.message, odp: undefined})
        });

		await Axios.post(gb.backendIP+"statystykakadrainstruktor/"+localStorage.getItem("token"), {
			czasOd: zakres.od.toISOString(),
			czasDo: zakres.do.toISOString(),
		}).then((r) => {
			if(r.data['blad']){
				setInstruktor({blad: r.data['blad'], odp: undefined});
			} else {
				let tmp = [...r.data.odp];
                if(uzytkownicy.odp){
                    r.data.odp.forEach((upr, index) => {
						tmp[index].razem = upr.ets + upr.ats;
                        const findUser = uzytkownicy.odp.find(u => u.id === upr.instruktor);
                        if(findUser !== undefined) tmp[index].instruktor = findUser.login;
                        else tmp[index].instruktor = "Nieznany";
                    });
                }
				setInstruktor({blad: undefined, odp: tmp});
			}
		}).catch((er) => {
            console.log(er);
            setInstruktor({blad: "Wystąpił błąd: "+er.message, odp: undefined})
        });
    };

    const wczytajUzytkownicy = async () => {
        await Axios.post(gb.backendIP + "listaUzytkownikow")
		.then((uzytkownicy) => {
            setUzytkownicy({blad: undefined, odp: uzytkownicy.data});
		}).catch((er2) => {
			// toast({
			// 	title: "Wystąpił błąd",
			// 	variant: "destructive",
			// 	description: "Wystąpił błąd podczas wczytywania listy użytkowników systemu.",
			// });
			setUzytkownicy({blad: "Wystąpił błąd "+er.message, odp: undefined});
		});
    };

	const wczytajSpalanie = async () => {
		await Axios.post(gb.backendIP+"statystykaKierowcySpalanie/"+localStorage.getItem("token"), {
			czasOd: zakres.od.toISOString(),
			czasDo: zakres.do.toISOString(),
		}).then((r) => {
			if(r.data['blad']){
				setKierowcy((p) => ({...p, spalanie: undefined, blad: r.data['blad']}) );
			} else {
				let tmp = [...r.data.odp];
				if(uzytkownicy.odp){
                    r.data.odp.forEach((x, index) => {
						tmp[index].roznicaDol = [Math.abs(x.avg - x.min), 0];
						tmp[index].roznicaGora = [0, Math.abs(x.avg - x.max)];
                        const findUser = uzytkownicy.odp.find(u => u.id === x.kto);
                        if(findUser !== undefined) tmp[index].kto = findUser.login;
                        else tmp[index].kto = "Nieznany";
                    });
                }
				setKierowcy((p) => ({...p, blad: undefined, spalanie: tmp}));
			}
		}).catch((er) => {
			setKierowcy((p) => ({...p, spalanie: undefined, blad: "Wystąpił błąd: "+er.message }) );
		})
	};

    const wczytajUszkodzenia = async () => {
		await Axios.post(gb.backendIP+"statystykaKierowcyUszkodzenia/"+localStorage.getItem("token"), {
			czasOd: zakres.od.toISOString(),
			czasDo: zakres.do.toISOString(),
		}).then((r) => {
			if(r.data['blad']){
				setKierowcy((p) => ({...p, uszkodzenia: undefined, blad: r.data['blad']}) );
			} else {
                let tmp = [...r.data['odp']];
                tmp.forEach((x, i) => {
                    tmp[i].liczbaTras = x.ponizej + x.powyzej;
                    tmp[i].ponizejProcent = ((x.ponizej / (x.ponizej + x.powyzej))*100).toFixed(1);
                    tmp[i].powyzejProcent = ((x.powyzej / (x.ponizej + x.powyzej))*100).toFixed(1);
                })
				setKierowcy((p) => ({...p, blad: undefined, uszkodzenia: tmp}));
			}
		}).catch((er) => {
			setKierowcy((p) => ({...p, uszkodzenia: undefined, blad: "Wystąpił błąd: "+er.message }) );
		})
	};

	const wczytajZarobki = async () => {
		await Axios.post(gb.backendIP+"statystykaKierowcyZarobki/"+localStorage.getItem("token"), {
			czasOd: zakres.od.toISOString(),
			czasDo: zakres.do.toISOString(),
		}).then((r) => {
			if(r.data['blad']){
				setKierowcy((p) => ({...p, zarobki: undefined, blad: r.data['blad']}) );
			} else {
				let tmp = [...r.data.odp];
				if(uzytkownicy.odp){
                    r.data.odp.forEach((x, index) => {
                        const findUser = uzytkownicy.odp.find(u => u.id === x.kierowca);
                        if(findUser !== undefined) tmp[index].kierowca = findUser.login;
                        else tmp[index].kto = "Nieznany";
                    });
                }
				setKierowcy((p) => ({...p, blad: undefined, zarobki: tmp}));
			}
		}).catch((er) => {
			setKierowcy((p) => ({...p, zarobki: undefined, blad: "Wystąpił błąd: "+er.message }) );
		})
	};

    const wczytajPredkosc = async () => {
        await Axios.post(gb.backendIP+"statystykaKierowcyPredkosc/"+localStorage.getItem("token"), {
			czasOd: zakres.od.toISOString(),
			czasDo: zakres.do.toISOString(),
		}).then((r) => {
			if(r.data['blad']){
				setKierowcy((p) => ({...p, predkosc: undefined, blad: r.data['blad']}) );
			} else {
				let tmp = [...r.data.odp];
				if(uzytkownicy.odp){
                    r.data.odp.forEach((x, index) => {
                        tmp[index].max = Number(tmp[index].max.toFixed(0));
                        tmp[index].avg = Number(tmp[index].avg.toFixed(0));
                        tmp[index].min = Number(tmp[index].min.toFixed(0));
                        const findUser = uzytkownicy.odp.find(u => u.id === x.kto);
                        if(findUser !== undefined) tmp[index].kto = findUser.login;
                        else tmp[index].kto = "Nieznany";
                    });
                }
				setKierowcy((p) => ({...p, blad: undefined, predkosc: tmp}));
			}
		}).catch((er) => {
			setKierowcy((p) => ({...p, predkosc: undefined, blad: "Wystąpił błąd: "+er.message }) );
		})
    };

    const wczytajDystansTonaz = async () => {
        await Axios.post(gb.backendIP+"statystykaKierowcyPrzejechane/"+localStorage.getItem("token"), {
			czasOd: zakres.od.toISOString(),
			czasDo: zakres.do.toISOString(),
		}).then((r) => {
			if(r.data['blad']){
				setKierowcy((p) => ({...p, dystans: undefined, blad: r.data['blad']}) );
			} else {
				let tmp = [...r.data.odp];
				if(uzytkownicy.odp){
                    r.data.odp.forEach((x, index) => {
                        const findUser = uzytkownicy.odp.find(u => u.id === x.kto);
                        if(findUser !== undefined) tmp[index].kto = findUser.login;
                        else tmp[index].kto = "Nieznany";
                    });
                }
				setKierowcy((p) => ({...p, blad: undefined, dystans: tmp}));
			}
		}).catch((er) => {
			setKierowcy((p) => ({...p, dystans: undefined, blad: "Wystąpił błąd: "+er.message }) );
		})
    };

    const wczytajPromPociag = async () => {
        await Axios.post(gb.backendIP+"statystykaLogistykaPromy/"+localStorage.getItem("token"), {
            czasOd: zakres.od.toISOString(),
            czasDo: zakres.do.toISOString()
        }).then((r) => {
            if(r.data['blad']){
                setPrompociag({blad: r.data['blad'], zestaw: undefined, razem: undefined, unikalnych: undefined});
            } else {
                setPrompociag({blad: undefined, zestaw: r.data.zestaw, razem: r.data.razem, unikalnych: r.data.unikalnych});
            }
        }).catch((er) => {
            setPrompociag({blad: "Wystąpił błąd: "+er.message, zestaw: undefined, razem: undefined, unikalnych: undefined});
        })
    };

    const wczytajLogistykaMisc = async () => {
        await Axios.post(gb.backendIP+"statystykaLogistykaWiele/"+localStorage.getItem("token"), {
            czasOd: zakres.od.toISOString(),
            czasDo: zakres.do.toISOString()
        }).then((r) => {
            if(r.data['blad']){
                setLogistykaMisc({blad: r.data['blad'], odp: undefined});
            } else {
				const mapa = new Map();
				r.data['odp'].forEach(naczepa => {
					let nazwa = naczepa.nazwa;
					if(nazwa === null) nazwa = "Nieznane (stare wartości)";
					if(nazwa == "Kat. C+E") return;
					const klucz = `${naczepa.gra}_${nazwa}`;
					if(mapa.has(klucz)){
						const istnieje = mapa.get(klucz);
						istnieje.liczba_wystapien += naczepa.liczba_wystapien;
					} else {
						mapa.set(klucz, {
							gra: naczepa.gra,
							nazwa: nazwa,
							liczba_wystapien: naczepa.liczba_wystapien
						})
					}
				});
				let tmp = Array.from(mapa.values());
				let naprzemienneEts = [];
				let naprzemienneAts = [];
				let ets = tmp.filter(x => x.gra === 0).sort((a, b) => b.liczba_wystapien - a.liczba_wystapien);
				let lewa = 0;
				let prawa = ets.length - 1;
				while(lewa <= prawa){
					naprzemienneEts.push(ets[lewa]);
					if(lewa !== prawa) {
						naprzemienneEts.push(ets[prawa]);
					}
					lewa++;
					prawa--;
				}
				let ats = tmp.filter(x => x.gra === 1).sort((a, b) => b.liczba_wystapien - a.liczba_wystapien);
				lewa = 0;
				prawa = ats.length - 1;
				while(lewa <= prawa){
					naprzemienneAts.push(ats[lewa]);
					if(lewa !== prawa) {
						naprzemienneAts.push(ats[prawa]);
					}
					lewa++;
					prawa--;
				}
                setLogistykaMisc({blad: undefined, odp: [...naprzemienneEts, ...naprzemienneAts]});
            }
        }).catch((er) => {
            setLogistykaMisc({blad: "Wystąpił błąd: "+er.message, odp: undefined});
        })
    };

	const wczytajPanstwa = async () => {
		await Axios.post(gb.backendIP+"statystykaLogistykaPanstwa/"+localStorage.getItem("token"), {
            gra: logistykaPanstwa.gra,
			czasOd: zakres.od.toISOString(),
			czasDo: zakres.do.toISOString()
		}).then((r) => {
			if(r.data['blad']){
				setLogistykaPanstwa({...logistykaPanstwa, blad: r.data['blad'], odp: undefined});
			} else {
				let tmp = [];
				r.data.odp.forEach(x => {
					tmp.push({...x, razem: x.od + x.do});
				});
				tmp = tmp.sort((a, b) => b.razem - a.razem);
				if(tmp.length > 10) tmp.length = 10;
				setLogistykaPanstwa({...logistykaPanstwa, blad: undefined, odp: tmp});
			}
		}).catch((er) => {
			setLogistykaPanstwa({...logistykaPanstwa, blad: "Wystąpił błąd: "+er.message, odp: undefined});
		});
	};

    const wczytajSpecjalne = async () => {
        await Axios.post(gb.backendIP+"statystykaLogistykaSpecjalne/"+localStorage.getItem("token"), {
            czasOd: zakres.od.toISOString(),
            czasDo: zakres.do.toISOString()
        }).then((r) => {
            if(r.data['blad']){
                setLogistykaSpecjalne({blad: r.data['blad'], odp: undefined});
            } else {
                setLogistykaSpecjalne({blad: undefined, odp: r.data.odp});
            }
        }).catch((er) => {
            setLogistykaSpecjalne({blad: "Wystąpił błąd: "+er.message, odp: undefined});
        });
    };

    useEffect(() => {
        if(!uzytkownicy.odp && !uzytkownicy.blad){
            wczytajUzytkownicy();
            return;
        }
        if(!zakres.wybrane){
            zmienZakres();
            return;
        }
		if(zakres.od === undefined) return;
		if(zakres.do === undefined) return;
        if(zakladka == "firma") wczytajKontoFirmowe();
        if(zakladka == "kadra") wczytajDzialaniaKadry();
		if(zakladka == "kierowcy"){
			wczytajSpalanie();
			wczytajZarobki();
            wczytajPredkosc();
            wczytajDystansTonaz();
            wczytajUszkodzenia();
		}
        if(zakladka == "logistyka"){
            wczytajPromPociag();
            wczytajLogistykaMisc();
			wczytajPanstwa();
            wczytajSpecjalne();
        }
    }, [zakres, zakladka, uzytkownicy]);

    useEffect(() => {
        if(zakladka == "logistyka"){
            wczytajPanstwa();
        }
    }, [logistykaPanstwa.gra]);

	return (
		<>
			<Nawigacja />
			<Toaster richColors />
			<div className="tlo" />
			<div className="srodekekranu">
                <Dialog open={przyblizKolowy} onOpenChange={setPrzyblizKolowy}>
					<DialogContent className="w-fit" onOpenAutoFocus={(event) => event.preventDefault()}>
						<DialogHeader>
							<DialogTitle>{przyblizKolowy === "naczepyETS2" ? <>Używane naczepy ETS2 - {logistykaUnikalneETS ?? "???"} unikalnych</> : <>Używane naczepy ATS - {logistykaUnikalneATS ?? "???"} unikalnych</> }</DialogTitle>
						</DialogHeader>
					{
						przyblizKolowy === "naczepyETS2" ?
						
						<PieChart width={860} height={760}>
							<Pie
								data={logistykaMisc.odp.filter(x => x.gra === 0)}
								cx="50%" cy="50%" labelLine={false} label={({ x, y, name, value, fill, percent }) => (
									<>
										<text x={x} y={y - 6} textAnchor="middle"
											fill="var(--color-zinc-100)"
											fontSize={14} fontWeight={600}
											style={{textShadow: "0 0 3px #000"}}
										>{`${name}`}</text>
										<text x={x} y={y + 6} textAnchor="middle"
											fill="var(--color-green-300)"
											style={{textShadow: "0 0 3px #000"}}
											fontSize={14} fontWeight={600}
										>{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
									</>
								)}
								innerRadius={200} outerRadius={300}
								dataKey="liczba_wystapien" nameKey="nazwa"
								stroke="var(--color-muted)"
							>
							{ logistykaMisc.odp.filter(x => x.gra === 0).map((entry, index) => (
								<Cell key={"ets2"+entry.nazwa+entry.liczba_wystapien} fill={index%3 ? index%3 === 1 ? "var(--color-purple-700)" : "var(--color-purple-600)" : "var(--color-purple-500)" } />
							))}
							</Pie>
						</PieChart>
						: "" }
						{ przyblizKolowy === "naczepyATS" ?
						<PieChart width={860} height={760}>
							<Pie
								data={logistykaMisc.odp.filter(x => x.gra === 1)}
								cx="50%" cy="50%" labelLine={false} label={({ x, y, name, value, fill, percent }) => (
									<>
										<text x={x} y={y - 6} textAnchor="middle"
											fill="var(--color-zinc-100)"
											fontSize={14} fontWeight={600}
											style={{textShadow: "0 0 3px #000"}}
										>{`${name}`}</text>
										<text x={x} y={y + 6} textAnchor="middle"
											fill="var(--color-green-300)"
											style={{textShadow: "0 0 3px #000"}}
											fontSize={14} fontWeight={600}
										>{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
									</>
								)}
								innerRadius={200} outerRadius={300}
								dataKey="liczba_wystapien" nameKey="nazwa"
								stroke="var(--color-muted)"
							>
							{ logistykaMisc.odp.filter(x => x.gra === 1).map((entry, index) => (
								<Cell key={"ats"+entry.nazwa+entry.liczba_wystapien} fill={index%3 ? index%3 === 1 ? "var(--color-amber-400)" : "var(--color-amber-300)" : "var(--color-amber-500)" } />
							))}
							</Pie>
						</PieChart>
						: ""}
					</DialogContent>
				</Dialog>
                <Tabs value={zakladka} onValueChange={setZakladka} className="w-full max-w-312.5 h-[75vh] max-h-175 relative">
                    <div className="absolute top-0 right-0 text-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg gap-2">
						<div className="bg-muted rounded-lg">
							<Select value={zakres.wybrane} onValueChange={(e) => zmienZakres(e)}>
								<SelectTrigger className="bg-muted">
									<SelectValue placeholder="Wybierz zakres"/>
								</SelectTrigger>
								<SelectContent>
									{/* <SelectItem value={1}>Dzisiaj</SelectItem> */}
									<SelectItem value={2}>Ostatnie 7 dni</SelectItem>
									<SelectItem value={3}>Ostatnie 31 dni</SelectItem>
									<SelectItem value={4}>Ostatnie 93 dni</SelectItem>
									<SelectItem value={5}>Ostatnie 365 dni</SelectItem>
									<SelectItem value={6}>Od samego początku</SelectItem>
									<SelectItem value={7}>Własny zakres</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{
							zakres.wybrane === 7 &&
							<div className="relative bg-muted rounded-lg">
								<Popover>
									<PopoverTrigger>
										<Button variant="outline">
											Od: {zakres.od ? new Date(zakres.od).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' }) : "BRAK" } do: {zakres.do ? new Date(zakres.do).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' }) : "BRAK"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="grid grid-cols-2 gap-2 w-fit">
										<div className="text-[0.8rem] font-semibold w-full text-center">Zakres od {zakres.od ? new Date(zakres.od).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' }) : "Niewybrane"}</div>
										<div className="text-[0.8rem] font-semibold w-full text-center">Zakres do {zakres.do ? new Date(zakres.do).toLocaleString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' }) : "Niewybrane"}</div>
										<Calendar showYearSwitcher={false} defaultMonth={zakres.od ? new Date(zakres.od) : new Date()} timeZone="Europe/Warsaw" mode="single" locale={pl} disabled={{after: zakres.do ? new Date(zakres.do) : new Date() }} selected={new Date(zakres.od) || undefined} onSelect={(e) => setZakres((z) => ({...z, od: new Date(e)}) ) } />
										<Calendar showYearSwitcher={false} defaultMonth={zakres.do ? new Date(zakres.do) : new Date()} timeZone="Europe/Warsaw" mode="single" locale={pl} disabled={{before: zakres.od ? new Date(zakres.od) : undefined }}
                                            selected={new Date(zakres.do) || undefined} onSelect={(e) => {
                                                let tmp = new Date(e);
                                                tmp.setHours(23, 59, 59, 975);
                                                setZakres((z) => ({...z, do: tmp}) )
										    }}
                                        />
									</PopoverContent>
								</Popover>
							</div>
						}
                    </div>
                    <TabsList>
                        <TabsTrigger value="firma">Konto firmowe</TabsTrigger>
                        <TabsTrigger value="logistyka">Ogólna logistyka</TabsTrigger>
                        <TabsTrigger value="kierowcy">Statystyka kierowców</TabsTrigger>
                        <TabsTrigger value="kadra">Kontrola kadry</TabsTrigger>
                    </TabsList>
                    <TabsContent value="firma">
                        <Card className="h-fit">
                            <CardContent className="flex gap-5 h-full">
                                <div className="flex flex-col grow justify-between w-110">
                                        { firmoweHistoria.length ?
                                        <>
										<h3 className="font-semibold tracking-wider mb-3">Historia tranzakcji pieniężnych</h3>
										<Table className="w-full overflow-hidden">
                                            <TableHeader>
                                                <TableRow className="dark:bg-zinc-800">
                                                    <TableHead>Akcja</TableHead>
                                                    <TableHead className="text-right"></TableHead>
                                                    <TableHead className="text-right">Wartość</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {
                                                    historiaFirmowePaginacja.map((x) => (
                                                        <TableRow key={x.id}>
                                                            <TableCell title={x.opis} className="w-48 max-w-48 min-w-48 cursor-help overflow-ellipsis whitespace-nowrap overflow-hidden">{x.opis}</TableCell>
                                                            <TableCell className="text-right text-[0.7rem]">{new Date(x.kiedy).toLocaleString('pl-PL', { day: '2-digit', month: 'long' })} {new Date(x.kiedy).toLocaleString('pl-PL', {hour: "2-digit", minute: "2-digit"})}</TableCell>
                                                            <TableCell className={`text-right ${x.suma < 0 ? "text-red-300" : "text-green-300"}`}>{x.suma.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"})}</TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={4}>
                                                        <div className="flex justify-between gap-2 items-center select-none">
                                                            <Button
                                                                variant={"outline"}
                                                                className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
                                                                onClick={() => setPaginacjaFirmowe((p) => Math.max(p - 1, 1))}
                                                                disabled={paginacjaFirmowe === 1}
                                                            >Poprzednia</Button>
                                                            Strona {paginacjaFirmowe} z {dostepnaPaginacjaFirmowe}
                                                            <Button
                                                                variant={"outline"}
                                                                className="disabled:cursor-not-allowed not-disabled:cursor-pointer"
                                                                onClick={() => setPaginacjaFirmowe((p) => Math.min(p + 1, dostepnaPaginacjaFirmowe))}
                                                                disabled={paginacjaFirmowe === dostepnaPaginacjaFirmowe}
                                                            >Następna</Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                        </>
                                        : <><h3 className="font-semibold tracking-wider mb-3">Historia tranzakcji pieniężnych</h3><span>Brak danych...</span></> }
                                </div>
                                <div className="grid-rows-2 grid grow gap-3">
                                    <div className="text-[0.8rem] font-semibold relative pt-4">
                                        <h3 className="font-semibold tracking-wider absolute right-0 left-25 text-center top-0">Wykres stanu konta firmowego</h3>
                                        { firmoweDane.konto.length ?
                                        <ResponsiveContainer>
                                            <AreaChart data={firmoweDane.konto}>
                                                <XAxis dataKey="kiedy" hide="true"  />
                                                <YAxis
                                                    type="number"
                                                    domain={['auto', 'auto']}
                                                    tickFormatter={(value) => `${value.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"})}`}
                                                    width={100}
                                                />
                                                <Area
                                                    name="Stan konta"
                                                    dataKey="saldo"
                                                    type="monotoneX"
                                                    fill="var(--color-blue-400)"
                                                    fillOpacity={0.6}
                                                    stroke="var(--color-blue-400)"
                                                    strokeWidth={1}
                                                    isAnimationActive={false}
                                                />
                                                <Legend />
                                                <Tooltip
                                                    contentStyle={{background: "var(--color-muted)", borderRadius: '12px'}}
                                                    formatter={(value, name) => [`${value.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"})}`, name]}
                                                />
                                                <CartesianGrid vertical={false} strokeDasharray={"12 6"} strokeOpacity={0.2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                        : <span className="text-center block">Brak danych</span> }
                                    </div>
                                    <div className="text-[0.8rem] font-semibold relative pt-4 mt-2">
                                        <h3 className="font-semibold tracking-wider absolute left-25 right-0 top-0 text-center">Wykres słupkowy zysk i strat</h3>
                                        <div className="absolute right-0 top-0 text-right">
                                            <p className="text-green-400">Przychód: {firmoweDane.czystyPrzychod.toLocaleString("pl-PL", {style: "currency", currency: "PLN" } )}</p>
                                            <p className="text-red-400">Wydatki: {(-1*firmoweDane.czystyWydatek).toLocaleString("pl-PL", {style: "currency", currency: "PLN" } )}</p>
                                            <p className="text-purple-400">Dochód: {firmoweDane.czystyDochod > 0 && "+"}{firmoweDane.czystyDochod.toLocaleString("pl-PL", {style: "currency", currency: "PLN" } )}</p>
                                        </div>
                                        { firmoweDane.slupkowy.length ?
                                        <ResponsiveContainer>
                                            <BarChart data={firmoweDane.slupkowy}>
                                                <YAxis
                                                    width={100}
                                                    type="number" domain={['auto', 'auto']}
                                                    tickFormatter={(value) => `${value.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"})}`}
                                                />
                                                <XAxis dataKey="name" interval={0} angle={-6} textAnchor="middle" />
                                                <Tooltip
                                                    contentStyle={{background: "var(--color-muted)"}}
                                                    formatter={(value, name) => [`${value.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"})}`, name]}
                                                />
                                                <Legend />
                                                <Bar name="Zysk" fill="var(--color-green-400)" dataKey="zysk" isAnimationActive={false} />
                                                <Bar name="Strata" dataKey="strata" fill="var(--color-red-400)" isAnimationActive={false} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        : <span className="text-center block">Brak danych</span> }
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="logistyka">
                        <Card className="h-fit">
                            <CardContent className="flex gap-5 h-full">
								<div className="grid grid-cols-2 grow h-full gap-3">
									<div className="col-span-2 flex grow h-fit justify-between">
                                        <div className="flex flex-col">
                                            <h3 className="text-center">Ilość oddanych tras - {logistykaIleTras ?? "???"}</h3>
                                            { tekstSpecjalne ? <h5 className="text-center text-[0.75rem] text-amber-400 font-bold -mb-3">{tekstSpecjalne}</h5> : "" }

                                            { logistykaMisc.odp ? logistykaIleTras ?
                                                <PieChart width={250} height={220}>
													<Pie
														data={[{name: "ETS2", value: logistykaIleTrasETS}, {name: "ATS", value: logistykaIleTrasATS}]}
														cx="50%" cy="50%" labelLine={false} label={({ x, y, name, value, fill, percent }) => (
															<>
																<text x={x} y={y - 6} textAnchor="middle"
																	style={{textShadow: "0 0 3px #0c0c0c"}}
																	fill={name == "ETS2" ? "var(--color-green-300)" : "var(--color-red-300)"}
																	fontSize={12} fontWeight={700}
																>{`${name}`}</text>
																<text x={x} y={y + 6} textAnchor="middle"
																	style={{textShadow: "0 0 3px #0c0c0c"}}
																	fill={name == "ETS2" ? "var(--color-green-100)" : "var(--color-red-100)"}
																	fontSize={13} fontWeight={500}
																>{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
															</>
														)}
														innerRadius={35} outerRadius={60}
														dataKey="value" nameKey="name"
														stroke="var(--color-muted)"
													>
														{ [{name: "ETS2", value: logistykaIleTrasETS}, {name: "ATS", value: logistykaIleTrasATS}].map((entry, index) => (
															<Cell key={entry.name+"_"+index} fill={index%2 ? "var(--color-red-400)" : "var(--color-green-400)" } />
														))}
													</Pie>
												</PieChart>
                                            : <span className="block text-center">Brak danych</span>
                                            : logistykaMisc.blad ? <span className="block text-center">{logistykaMisc.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-center">Używane naczepy ETS2 - {logistykaUnikalneETS ?? "???"} unikalnych</h3>
                                            { logistykaMisc.odp ? logistykaUnikalneETS ?
                                                <PieChart width={440} height={260} onClick={() => setPrzyblizKolowy("naczepyETS2")}>
													<Pie
														data={logistykaMisc.odp.filter(x => x.gra === 0)}
														cx="50%" cy="50%" labelLine={false} label={({ x, y, name, value, fill, percent }) => (
															<>
																<text x={x} y={y - 6} textAnchor="middle"
																	fill="var(--color-amber-100)"
																	style={{textShadow: "0 0 3px #0c0c0c"}}
																	fontSize={12} fontWeight={500}
																>{`${name}`}</text>
																<text x={x} y={y + 6} textAnchor="middle"
																	fill="var(--color-amber-200)"
																	style={{textShadow: "0 0 3px #0c0c0c"}}
																	fontSize={12} fontWeight={500}
																>{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
															</>
														)}
														innerRadius={60} outerRadius={80}
														dataKey="liczba_wystapien" nameKey="nazwa"
														stroke="var(--color-muted)"
													>
														{ logistykaMisc.odp.filter(x => x.gra === 0).map((entry, index) => (
															<Cell key={"ets2"+entry.nazwa+entry.liczba_wystapien} fill={index%3 ? index%3 === 1 ? "var(--color-purple-700)" : "var(--color-purple-600)" : "var(--color-purple-500)" } />
														))}
													</Pie>
												</PieChart>
                                            : <span className="block text-center">Brak danych</span>
                                            : logistykaMisc.blad ? <span className="block text-center">{logistykaMisc.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-center">Używane naczepy ATS - {logistykaUnikalneATS ?? "???"} unikalnych</h3>
                                            { logistykaMisc.odp ? logistykaUnikalneATS ?
                                                <PieChart width={340} height={260} onClick={() => setPrzyblizKolowy("naczepyATS")}>
													<Pie
														data={logistykaMisc.odp.filter(x => x.gra === 1)}
														cx="50%" cy="50%" labelLine={false} label={({ x, y, name, value, fill, percent }) => (
															<>
																<text x={x} y={y - 6} textAnchor="middle"
																	fill="var(--color-purple-500)"
																	fontSize={12} fontWeight={500}
																	style={{textShadow: "0 0 3px #0c0c0c"}}
																>{`${name}`}</text>
																<text x={x} y={y + 6} textAnchor="middle"
																	fill="var(--color-purple-600)"
																	style={{textShadow: "0 0 3px #0c0c0c"}}
																	fontSize={12} fontWeight={500}
																>{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
															</>
														)}
														innerRadius={60} outerRadius={80}
														dataKey="liczba_wystapien" nameKey="nazwa"
														stroke="var(--color-muted)"
													>
														{ logistykaMisc.odp.filter(x => x.gra === 1).map((entry, index) => (
															<Cell key={"ats"+entry.nazwa+entry.liczba_wystapien} fill={index%3 ? index%3 === 1 ? "var(--color-amber-400)" : "var(--color-amber-300)" : "var(--color-amber-500)" } />
														))}
													</Pie>
												</PieChart>
                                            : <span className="block text-center">Brak danych</span>
                                            : logistykaMisc.blad ? <span className="block text-center">{logistykaMisc.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
                                        </div>
									</div>
									<div className="flex flex-col grow relative">
										<h3 className="text-center">Rozkład {logistykaPanstwa.gra ? "stanów" : "państw"} na podstawie tras kierowców</h3>
                                        <div className="absolute top-0 right-0 space-x-1.5 font-bold flex items-center">
                                            <span className={logistykaPanstwa.gra === false ? "text-zinc-300" : "text-zinc-500"}>ETS</span>
                                            <Switch id="przelacznikGry" checked={logistykaPanstwa.gra} onCheckedChange={() => setLogistykaPanstwa((l) => ({...l, gra: !l.gra}))} />
                                            <span className={logistykaPanstwa.gra === true ? "text-zinc-300" : "text-zinc-500"}>ATS</span>
                                        </div>
                                        <h5 className="text-center text-[0.7rem] text-amber-400 font-bold">Najczęściej rozpoczynano trasę w {logistykaPanstwoStart ?? "Brak"}, a kończono w { logistykaPanstwoKoniec ?? "Brak"}</h5>
										<div className="w-full min-h-64 grow bg-zinc-900 text-[0.8rem] font-semibold leading-[1.2]">
											{ logistykaPanstwa.odp ? logistykaPanstwa.odp.length ?
											<ResponsiveContainer>
												<BarChart data={logistykaPanstwa.odp}>
                                                    <CartesianGrid vertical={false} strokeDasharray="6 6" opacity={0.2} />
													<YAxis scale="linear" domain={[0, 'auto']} />
													<XAxis dataKey="kraj" type="category" tick={false} label={{value: `Top 10 najczęstszych ${logistykaPanstwa.gra ? "stanów" : "państw"}`}} />
                                                    <Bar dataKey="od" name="Startowe" fill="var(--color-green-300)" stackId={1} hide />
													<Bar dataKey="do" name="Docelowe" fill="var(--color-red-300)" stackId={1} hide />
													<Bar dataKey="razem" name="Razem" fill="#1283b7" stackId={1}>
														<LabelList scaleToFit={true} dataKey="kraj" angle={-90} position="center" fill="var(--color-zinc-100)" style={{fontSize: '0.75rem', fontWeight: 500, textShadow: '0 0 3px #222'}} />
													</Bar>
                                                    <Tooltip includeHidden filterNull={false} contentStyle={{background: "var(--color-muted)"}} />
												</BarChart>
											</ResponsiveContainer>
                                            : <span className="block text-center">Brak danych</span>
                                            : logistykaPanstwa.blad ? <span className="block text-center">{logistykaPanstwa.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
										</div>
									</div>
									<div className="flex flex-col grow">
										<h3 className="text-center">Wykorzystywane promy i pociągi</h3>
                                        <h5 className="text-center text-[0.7rem] text-amber-400 font-bold">{prompociag.unikalnych || "??"} unikalnych połączeń tranzytowych użyto łącznie {prompociag.razem || "???"} razy.</h5>
										<div className="w-full min-h-64 grow bg-zinc-900 text-[0.8rem] font-semibold leading-[1.2]">
											{ prompociag.zestaw ? prompociag.zestaw.length ?
											<ResponsiveContainer>
												<BarChart data={prompociag.zestaw}>
                                                    <CartesianGrid vertical={false} strokeDasharray="6 6" opacity={0.2} />
													<YAxis dataKey="ile" width={80} domain={[0, 'auto']} scale="linear" label={{value: "Liczba użyć", angle: -90, textAnchor: "middle", verticalAnchor: "middle", offset: 10}} />
													<XAxis dataKey="nazwa" type="category" tick={false} label={{value: "Top 10 połączeń tranzytowych" }} />
                                                    <Bar dataKey="ile" name="Liczba użyć" fill="var(--color-blue-400)" >
                                                        <LabelList dataKey="nazwa" angle={-80} fill="var(--color-zinc-50)" style={{fontSize: '0.75rem', fontWeight: 500, textShadow: '0 0 3px #333'}} />
                                                    </Bar>
                                                    <Tooltip includeHidden filterNull={false} contentStyle={{background: "var(--color-muted)"}} />
												</BarChart>
											</ResponsiveContainer>
                                            : <span className="block text-center">Brak danych</span>
                                            : prompociag.blad ? <span className="block text-center">{prompociag.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
										</div>
									</div>
								</div>
                            </CardContent>
                        </Card>
                    </TabsContent>

			    	<TabsContent value="kierowcy">
						<Card className="h-fit">
							<CardContent className="flex gap-5 h-full">
								<div className="grid grid-cols-2 grow h-full gap-y-1 gap-x-3">
									<div className="row-span-3 flex flex-col grow">
										<h3 className="text-center ml-25">Zarobki i wydatki kierowców</h3>
										<div className="w-full min-h-64 grow bg-zinc-900 text-[0.8rem] font-semibold leading-[1.2]">
											{ kierowcy.zarobki ? kierowcy.zarobki.length ? 
											<ResponsiveContainer>
												<BarChart data={kierowcy.zarobki} syncId="kierowcy" syncMethod="index">
                                                    <CartesianGrid vertical={false} strokeDasharray="6 6" opacity={0.2} />
													<YAxis width={100} domain={['auto', 'auto']} name="Zarobki/Wydatki" type="number" tickFormatter={(value) => `${value.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"})}`} />
													<XAxis dataKey="kierowca" />
                                                    <Bar dataKey="wlasnyzarobek" name="Zarobek z tras" fill="var(--color-green-500)" stackId={1} />
                                                    <Bar dataKey="premia" name="Premie z tras" fill="var(--color-green-400)" stackId={1} />
                                                    <Bar dataKey="gesty" name="Bonus z konta firmowego" fill="var(--color-green-300)" stackId={1} />
                                                    <Bar dataKey="kara" name="Grzywne z tras" fill="var(--color-red-500)" stackId={2} />
                                                    <Bar dataKey="uprawnienia" name="Koszty uprawnień" fill="var(--color-red-400)" stackId={2} />
                                                    <Bar hide={true} dataKey="razem" name="Podsumowanie" fill="var(--color-yellow-300)" />
                                                    <Tooltip includeHidden filterNull={false} contentStyle={{background: "var(--color-muted)"}} formatter={(val, name) => ([val.toLocaleString('pl-PL', {style: "currency", currency: "PLN"}) , name])} />
                                                    <ReferenceLine y={0} />
												</BarChart>
											</ResponsiveContainer>
											: <span className="block text-center">Brak danych</span>
                                            : kierowcy.blad ? <span className="block text-center">{kierowcy.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
										</div>

                                        <h3 className="text-center ml-25">Statystyka uszkodzeń kierowców</h3>
                                        <div className="w-full h-48 bg-zinc-900 text-[0.8rem] font-semibold leading-[1.2]">
                                            { kierowcy.uszkodzenia ? kierowcy.uszkodzenia.length ?
                                            <ResponsiveContainer>
                                                <BarChart data={kierowcy.uszkodzenia} syncId="kierowcy" layout="vertical">
                                                    <CartesianGrid horizontal={false} strokeDasharray="6 6" opacity={0.2} />
                                                    <YAxis width={100} dataKey="login" type="category" interval={0} />
                                                    <XAxis type="number" hide />
                                                    <Bar dataKey="ponizejProcent" unit={"%"} stackId={1} fill="var(--color-green-400)">
                                                        <LabelList fill="#fff" position="center"
                                                            style={{fontSize: '0.75rem', fontWeight: 500, textShadow: '0 0 3px #222'}}
                                                            valueAccessor={(entry) => ({
                                                                ponizej: entry.ponizej,
                                                                ponizejProcent: entry.ponizejProcent
                                                            })}
                                                            formatter={(value) => value.ponizejProcent > 1 ? `${value.ponizej} (${value.ponizejProcent}%)` : '' }
                                                        />
                                                    </Bar>
                                                    <Bar dataKey="powyzejProcent" stackId={1} fill="var(--color-red-400)">
                                                        <LabelList fill="#fff" position="center"
                                                            style={{fontSize: '0.75rem', fontWeight: 500, textShadow: '0 0 3px #222'}}
                                                            valueAccessor={(entry) => ({
                                                                powyzej: entry.powyzej,
                                                                powyzejProcent: entry.powyzejProcent
                                                            })}
                                                            formatter={(value) => value.powyzejProcent > 1 ? `${value.powyzej} (${value.powyzejProcent}%)` : `` }
                                                        />
                                                    </Bar>
                                                    <Tooltip
                                                        includeHidden
                                                        filterNull={false}
                                                        content={<UszkodzeniaTooltip />}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            : <span className="block text-center">Brak danych</span>
                                            : kierowcy.blad ? <span className="block text-center">{kierowcy.blad}</span>
                                            : <span className="block text-center">Trwa wczytywanie...</span>
                                            }
                                        </div>
									</div>
									<div className="flex flex-col grow">
										<h3 className="text-center ">Średnie spalanie</h3>
										<div className="w-full h-48 bg-zinc-900 text-[0.8rem] font-semibold leading-[1.2]">
											{ kierowcy.spalanie ? kierowcy.spalanie.length ?
											<ResponsiveContainer>
												<ScatterChart syncId="kierowcy" syncMethod="index" >
													<CartesianGrid vertical={false} strokeDasharray="6 6" opacity={0.2} />
													<YAxis domain={['auto', 'auto']} width={75} name="Spalanie" dataKey="avg" type="number" label={{value: "litry na 100 km", angle: -90, verticalAnchor: "middle", textAnchor: "middle" }} />
													<XAxis name="Kierowca" dataKey="kto" type="category" />
                                                    <ReferenceLine y={srednieSpalanieRazem} stroke="var(--color-purple-400)" strokeDasharray="6 6" label={{value: `Średnia wszystkich kierowców (${srednieSpalanieRazem} l / 100 km)`, position: "insideBottomRight"}} />
													<Scatter name="Średnie spalanie" data={kierowcy.spalanie} shape="square" fill="var(--color-purple-400)">
														<ErrorBar dataKey="roznicaDol" width={4} strokeWidth={2} stroke="var(--color-green-300)" strokeOpacity={0.8} direction="y" />
														<ErrorBar dataKey="roznicaGora" width={4} strokeWidth={2} stroke="var(--color-red-300)" strokeOpacity={0.8} direction="y" />
													</Scatter>
													<Tooltip includeHidden content={<SpalanieTooltip />} filterNull={false} />
												</ScatterChart>
											</ResponsiveContainer>
											: <span className="block text-center">Brak danych</span>
                                            : kierowcy.blad ? <span className="block text-center">{kierowcy.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
										</div>
									</div>
									<div className="flex flex-col grow">
										<h3 className="text-center ">Prędkość maksymalna kierowców</h3>
										<div className="w-full h-48 bg-zinc-900 text-[0.8rem] font-semibold leading-[1.2]">
											{ kierowcy.predkosc ? kierowcy.predkosc.length ?
											<ResponsiveContainer>
												<ScatterChart syncId="kierowcy" syncMethod="index" >
													<CartesianGrid opacity={0.2} strokeDasharray="6 6" />
													<YAxis domain={['auto', 'auto']} width={75} name="Prędkość" dataKey="avg" type="number" unit="km/h" />
													<XAxis name="Kierowca" dataKey="kto" type="category" />
                                                    <ReferenceLine ifOverflow="extendDomain" y={ kierowcyPredkoscSrednia } stroke="var(--color-purple-400)" strokeDasharray="6 6" label={{value: `Średnia wszystkich kierowców (${kierowcyPredkoscSrednia} km/h)`, position: "insideBottomRight", }} />
                                                    <ReferenceLine ifOverflow="extendDomain" y={90} stroke="var(--color-green-400)" strokeDasharray="6 6" label={{value: "Wartość akceptowalna (90 km/h)", position: "insideBottomRight", color: "var(--color-green-300)" }} />
													<Scatter data={kierowcy.predkosc} shape="star" fill="var(--color-purple-400)" line />
													<Tooltip includeHidden content={<PredkoscTooltip />} filterNull={false} />
												</ScatterChart>
											</ResponsiveContainer>
                                            : <span className="block text-center">Brak danych</span>
                                            : kierowcy.blad ? <span className="block text-center">{kierowcy.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
										</div>
									</div>
									<div className="flex flex-col grow">
										<h3 className="text-center ">Pokonany dystans oraz masa ładunku z tras</h3>
										<div className="w-full h-48 bg-zinc-900 text-[0.8rem] font-semibold leading-[1.2]">
											{ kierowcy.dystans ? kierowcy.dystans.length ?
											<ResponsiveContainer>
												<ScatterChart syncId="kierowcy" syncMethod="index" >
													<CartesianGrid opacity={0.2} strokeDasharray="6 6" />
													<YAxis domain={['auto', 'auto']} width={95} dataKey="tony" type="number" unit=" t" label={{value: "Masa ładunku", angle: -90, verticalAnchor: "middle", textAnchor: "middle", offset: -15, style: {fontSize: '0.7rem', fontWeight: '500'} }} />
													<XAxis dataKey="km" type="number" unit=" km" label={{value: "Pokonany dystans", position: "bottom", offset: -10, style: {fontSize: '0.7rem', fontWeight: '500'} }} />
													<Scatter data={kierowcy.dystans} shape="diamond" fill="var(--color-orange-400)">
                                                        <LabelList dataKey="kto" position="bottom" />
                                                    </Scatter>
													<Tooltip includeHidden content={<DystansTooltip />} filterNull={false} />
												</ScatterChart>
											</ResponsiveContainer>
                                            : <span className="block text-center">Brak danych</span>
                                            : kierowcy.blad ? <span className="block text-center">{kierowcy.blad}</span>
											: <span className="block text-center">Trwa wczytywanie...</span> }
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

                    <TabsContent value="kadra">
                        <Card className="h-fit">
                            <CardContent className="flex gap-5 h-full">
                                <div className="grid grid-cols-2 grow h-full gap-3">
                                    <div className="flex flex-col grow">
                                        <div className="flex w-full">
                                            <div className="grow px-2 py-1 border bg-zinc-600 text-center">
                                                <h3 className="font-semibold tracking-wider">Dyspozytorzy</h3>
                                                <h5 className="text-[0.85rem] text-zinc-300 font-medium">Rozpatrzenia dotyczące tras</h5>
                                            </div>
                                            <div className="flex flex-col px-3 items-center justify-center border border-zinc-500 leading-[1.2]">
                                                <h5 className="font-semibold text-[0.7rem] break-keep">Łączna ilość</h5>
                                                <h3 className="font-black text-[1.3rem] tracking-widest text-blue-300">{ dyspozytorSumaRazem }</h3>
                                            </div>
                                            <div className="flex flex-col px-3 items-center justify-center border border-zinc-500 border-r-0 border-l-0 leading-[1.2]">
                                                <h5 className="font-semibold text-[0.7rem] break-keep">Zatwierdzone</h5>
                                                <h3 className="font-black text-[1.3rem] tracking-widest text-green-300">{ dyspozytorSumaZatw }</h3>
                                            </div>
                                            <div className="flex flex-col px-3 items-center justify-center border border-zinc-500 leading-[1.2]">
                                                <h5 className="font-semibold text-[0.7rem] break-keep">Odrzucone</h5>
                                                <h3 className="font-black text-[1.3rem] tracking-widest text-red-300">{ dyspozytorSumaOdrzuc }</h3>
                                            </div>
                                        </div>
                                        <div className="w-full h-64 bg-zinc-900 mt-4 text-[0.8rem] font-semibold leading-[1.2]">
                                            { dyspozytor.odp ? dyspozytorSumaRazem ?
                                            <ResponsiveContainer>
                                                <BarChart data={dyspozytor.odp}>
                                                    <YAxis width={40} type="number" domain={[0, 'auto']} />
                                                    <CartesianGrid vertical={false} opacity={0.2} />
                                                    <XAxis name="Dyspozytor" dataKey="kto" interval={0} textAnchor="middle" fontWeight="bold"/>
                                                    <Bar name="Zatwierdzone" dataKey={"zatwierdzone"} fill="var(--color-green-400)" />
                                                    <Bar name="Odrzucone" dataKey={"odrzucone"} fill="var(--color-red-400)" />
                                                    <Bar hide={true} name="Razem" dataKey={"razem"} fill="var(--color-blue-400)" />                                                    
                                                    <Tooltip includeHidden contentStyle={{background: "var(--color-muted)"}} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            : <span className="block text-center">Brak danych</span>
                                            : dyspozytor.blad ?
                                            <span className="block text-center">{dyspozytor.blad}</span>
                                            : <span className="block text-center">Trwa wczytywanie...</span> }
                                        </div>
                                        
                                    </div>
                                    <div className="flex flex-col grow">
                                        <div className="flex w-full">
                                            <div className="grow px-2 py-1 border bg-zinc-600 text-center">
                                                <h3 className="font-semibold tracking-wider">Instruktor</h3>
                                                <h5 className="text-[0.85rem] text-zinc-300 font-medium">Liczba nadawanych uprawnień w ETS2 / ATS</h5>
                                            </div>
                                            <div className="flex flex-col px-3 items-center justify-center border border-zinc-500 leading-[1.2]">
                                                <h5 className="font-semibold text-[0.7rem] break-keep">Łączna ilość</h5>
                                                <h3 className="font-black text-[1.3rem] tracking-widest text-purple-300">{instruktorSumaRazem}</h3>
                                            </div>
                                            <div className="flex flex-col px-3 items-center justify-center border border-zinc-500 border-r-0 border-l-0 leading-[1.2]">
                                                <h5 className="font-semibold text-[0.7rem] break-keep">ETS2</h5>
                                                <h3 className="font-black text-[1.3rem] tracking-widest text-yellow-300">{instruktorSumaEts}</h3>
                                            </div>
                                            <div className="flex flex-col px-3 items-center justify-center border border-zinc-500 leading-[1.2]">
                                                <h5 className="font-semibold text-[0.7rem] break-keep">ATS</h5>
                                                <h3 className="font-black text-[1.3rem] tracking-widest text-blue-300">{instruktorSumaAts}</h3>
                                            </div>
                                        </div>
                                        <div className="w-full h-64 bg-zinc-900 mt-4 text-[0.8rem] font-semibold leading-[1.2]">
                                            { instruktor.odp ? instruktorSumaRazem ?
                                            <ResponsiveContainer>
                                                <BarChart data={instruktor.odp}>
                                                    <YAxis width={40} type="number" domain={[0, 'auto']} />
                                                    <CartesianGrid vertical={false} opacity={0.2} />
                                                    <XAxis name="Instruktor" dataKey="instruktor" interval={0} textAnchor="middle" fontWeight="bold"/>
                                                    <Bar name="Euro Truck Simulator 2" dataKey={"ets"} fill="var(--color-yellow-400)" />
                                                    <Bar name="American Truck Simulator" dataKey={"ats"} fill="var(--color-blue-400)" />
                                                    <Bar hide={true} name="Razem" dataKey={"razem"} fill="var(--color-purple-400)" />
                                                    <Tooltip includeHidden contentStyle={{background: "var(--color-muted)"}} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            : <span className="block text-center">Brak danych</span> : instruktor.blad ?? <span className="block text-center">Trwa wczytywanie...</span> }
                                        </div>
                                        
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
		</>
	);
};