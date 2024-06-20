import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FaTimes, FaPen, FaShare, FaExpand } from "react-icons/fa";
export default function TrasyOld(props){
    const [ ostatnieTrasy, setOstatnieTrasy ] = useState({response: null});
    const [ daneTrasy, setDaneTrasy ] = useState({wyswietl: false, gra: null, trwaOddawanie: false});
    const [ miastaETS, setMiastaETS ] = useState(null);
    const [ miasta, setMiasta ] = useState(null);
    const [ miastaATS, setMiastaATS ] = useState(null);
    const [ typyNaczep, setTypyNaczep ] = useState(null);
    const [ promy, setPromy ] = useState(null);
    const [ blokada, setBlokada ] = useState({response: null, dane: null, blokada: false});

    const dostanMiasta = () => {
            Axios.post(gb.backendIP+"miasta").then((res2) => {
                Axios.post(gb.backendIP+"typyNaczep").then((res3) => {
                    Axios.post(gb.backendIP+"promy").then((res4) => {
                        setTypyNaczep(res3.data['dane']);
                        setMiasta(res2.data['dane']);
                        setPromy(res4.data['dane']);
                    });
                });
            });
    };

    const dostanTrasy = () => {
        Axios.post(gb.backendIP+"ostatnieTrasy/"+localStorage.getItem('token')).then((res) => {
            if(res.data['dane']){
                setOstatnieTrasy({response: 1, dane: res.data['dane']});
            } else {
                setOstatnieTrasy({response: 1, dane: null});
            }
        }).catch((er) => {
            setOstatnieTrasy({response: 1, dane: null, blad: er.message});
        });
    };

    const oddawanieTrasy = (gra, daneinc) => {
        const dane = {...daneinc};
        if(daneinc){
            if(dane.zdj){
                dane.zdj = dane.zdj.split(" ");
            }
            let krajod;
            let krajdo;
            if(gra){
                krajod = miasta[dane.od] ? miasta[dane.od][0] : null;
                krajdo = miasta[dane.do] ? miasta[dane.do][0] : null;
            } else {
                krajod = miasta[dane.od] ? miasta[dane.od][0] : null;
                krajdo = miasta[dane.do] ? miasta[dane.do][0] : null;
            }
            Axios.post(gb.backendIP+"promyTrasy/"+dane.id).then((res) => {
                setDaneTrasy({trwaOddawanie: false, wyswietl: true, ...dane, liczbapromow: res.data['dane'].ile, promy: res.data['dane'].promy, gra: gra ? 1 : 0, krajOd: krajod, krajDo: krajdo});
            });
        } else {
            setDaneTrasy({trwaOddawanie: false, wyswietl: true, ...dane, liczbapromow: 0, promy: null, gra: gra ? 1 : 0});
        }
    };

    const zwrocTrasy = () => {
        if(ostatnieTrasy.dane){
            return(
                <>
                <table className="ostatnieTrasy wejscieSmooth">
                    <tbody>
                        <tr><th>ID</th><th>Gra</th><th>Data</th><th>Lokalizacja</th><th>Ładunek</th><th>Status</th><th>Akcja</th></tr>
                        {ostatnieTrasy.dane.map((wi) => {
                            const wiersz = {...wi};
                            let status;
                            let akcja;
                            let skad = miasta[wiersz.od];
                            let dokad = miasta[wiersz.do];
                            switch(wiersz.zatwierdz) {
                                case 0:
                                    status = <p style={{color: 'dodgerblue'}}>Oczekująca</p>;
                                    akcja = <a onClick={() => oddawanieTrasy(wiersz.gra, wiersz)}>Edytuj</a>;
                                    break;
                                case 1:
                                    status = <p style={{color: '#3e3'}}>Zatwierdzona</p>;
                                    akcja = <a onClick={() => oddawanieTrasy(wiersz.gra, wiersz)}>Szczegóły</a>;
                                    break;
                                case 2:
                                    if(wiersz.dozwolpoprawke){
                                        status = <p style={{color: 'orange'}}>Do poprawy</p>;
                                        akcja = <a onClick={() => oddawanieTrasy(wiersz.gra, wiersz)}>Edytuj</a>;
                                    } else {
                                        status = <p style={{color: 'crimson'}}>Odrzucona</p>;
                                        akcja = <a onClick={() => oddawanieTrasy(wiersz.gra, wiersz)}>Szczegóły</a>;
                                    }
                                    break;
                            }
                            if(blokada.blokada) akcja = <a onClick={() => oddawanieTrasy(wiersz.gra, wiersz)}>Szczegóły</a>;
                            if((wiersz.zatwierdz == 2) && (wiersz.dozwolpoprawke)) akcja = <a onClick={() => oddawanieTrasy(wiersz.gra, wiersz)}>Popraw</a>
                            return(
                            <tr key={"trasa_"+wiersz.id}>
                                <td>{wiersz.id}</td>
                                <td>{wiersz.gra ? <img src={"/img/trasaats.png"}/> : <img src={"/img/trasaets.png"}/>}</td>
                                <td>{new Date(wiersz.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'})} - {new Date(wiersz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long'})}</td>
                                <td>
                                    {skad && (wiersz.gra ? <img className="flaga" title={skad[0]} src="/img/flagi/usa.png" /> : <img title={skad[0]} className="flaga" src={"/img/flagi/"+skad[0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> )}
                                    <b>{skad ? skad[1] : "???"}</b>
                                    <HiArrowNarrowRight />
                                    {dokad && (wiersz.gra ? <img className="flaga" title={dokad[0]} src="/img/flagi/usa.png" /> : <img title={dokad[0]} className="flaga" src={"/img/flagi/"+dokad[0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} /> )}
                                    <b>{dokad ? dokad[1] : "???"}</b>
                                </td>
                                <td>{wiersz.ladunek}</td>
                                <td>{status}</td>
                                <td>{akcja}</td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
                </>
            )
        } else {
            if(ostatnieTrasy.blad){
                return(<>Wystąpił błąd! {ostatnieTrasy.blad}</>);
            } else {
                return(<>
                    <table className="ostatnieTrasy wejscieSmooth">
                    <thead>
                        <tr><th>ID</th><th>Gra</th><th>Data</th><th>Lokalizacja</th><th>Ładunek</th><th>Status</th><th>Akcja</th></tr>
                    </thead>
                    <tbody>
                        <tr><td colSpan={7}><br/>Kierowco! Nie masz w systemie oddanej żadnej trasy! Może wypadałoby to zmienić?<br/></td></tr>
                    </tbody>
                    </table>
                </>);
            }
        }
    };

    const zwrocKraje = (ats) => {
        let kraje = [];
        miasta.map((p) => {
            if(p != null && p[2] == ats){
                kraje.push(p[0]);
            }
        });
        return [... new Set(kraje)].map((kraj) => {
            return <option key={`kraj_${kraj}`} value={kraj}>{kraj}</option>
        })
    };
    const zmianaLiczbyPromow = (ile) => {
        let tmp = daneTrasy.promy ? daneTrasy.promy : [];
        if(ile < tmp.length) {
            tmp.length = ile;
        } else {
            while(tmp.length < ile){
                tmp.push(null);
            }
        }
        setDaneTrasy({...daneTrasy, liczbapromow: ile, promy: tmp});
    };

    const wybieraniePromow = () => {
        return(
            <>
            <h3>Lista promów</h3>
            <div className="listaPromowDiv">
            { daneTrasy.promy && daneTrasy.promy.map((prom, i) => {
                console.log(i, prom);
                return(
                    <select style={{borderLeft: !(promy.find((x) => x.id == prom)) && '4px solid crimson'}} key={`prom_${i}`} value={prom} onChange={(e) => {
                        let tmpPromy = daneTrasy.promy;
                        tmpPromy[i] = e.target.value;
                        setDaneTrasy({...daneTrasy, promy: tmpPromy});
                    }}>
                        <option value={null}>{(prom != null) ? "Usunięty prom" : "----"}</option>
                        { promy.map((dostepnePromy) => {
                            return <option key={`prom_${i}-${dostepnePromy.id}`} value={dostepnePromy.id}>{dostepnePromy.nazwa}</option>;
                        }) }
                    </select>
                )
            })}
            </div>
            </>
        );
    };

    const noweZdjecia = (zdj) => {
        let arr = [];
        [...zdj].map((fotka) => {
            arr.push(URL.createObjectURL(fotka));
        });
        console.log(arr);
        setDaneTrasy({...daneTrasy, noweZdj: [...zdj], noweZdjBloby: arr});
    };

    const oddajNowa = () => {
        //walidacja czy wypelnione
        if(!daneTrasy.kiedy) return;
        if(!daneTrasy.typserwera) return;
        if(!daneTrasy.typzlecenia) return;
        if(!daneTrasy.ladunek) return;
        if(!daneTrasy.naczepa) return;
        if(!daneTrasy.od) return;
        if(!daneTrasy.do) return;
        if(!daneTrasy.masaladunku) return;
        if(!daneTrasy.uszkodzenia) return;
        if(!daneTrasy.spalanie) return;
        if(!daneTrasy.paliwo) return;
        if(!daneTrasy.przejechane) return;
        if(!daneTrasy.vmax) return;
        if(!daneTrasy.zarobek) return;

        console.log("nowa", daneTrasy);
        const k = new Date(daneTrasy.kiedy);
        k.setHours(k.getHours() + 2);
        const czas = k.toISOString().slice(0, 19).replace("T", " ");
        Axios.post(gb.backendIP+"oddajTrase/"+localStorage.getItem('token'), {
            kiedy: czas,
            gra: daneTrasy.gra,
            typserwera: daneTrasy.typserwera,
            typzlecenia: daneTrasy.typzlecenia,
            ladunek: daneTrasy.ladunek,
            naczepa: daneTrasy.naczepa,
            od: daneTrasy.od,
            do: daneTrasy.do,
            masaladunku: daneTrasy.masaladunku,
            uszkodzenia: daneTrasy.uszkodzenia,
            spalanie: daneTrasy.spalanie,
            paliwo: daneTrasy.paliwo,
            przejechane: daneTrasy.przejechane,
            vmax: daneTrasy.vmax,
            zarobek: daneTrasy.zarobek,
            komentarz: daneTrasy.komentarz,
            noweZdj: daneTrasy.noweZdj,
            ladunekADR: daneTrasy.ladunekADR,
            ladunekGabaryt: daneTrasy.ladunekGabaryt,
            ladunekDelikatny: daneTrasy.ladunekDelikatny
		}, { headers: { 'Content-Type': 'multipart/form-data'}}).then((res) => {
            if(res.data['odp']){
                Axios.post(gb.backendIP+"updateTrasaPromy/"+res.data['odp'], {
                    promy: daneTrasy.promy
                }).then((res2) => {
                    if(res2.data['odp']){
                        setDaneTrasy({wyswietl: false, trwaOddawanie: false});
                        setOstatnieTrasy({response: null});
                    }
                });
            }
        });
    };
    const poprawTrase = () => {
        const k = new Date(daneTrasy.kiedy);
        k.setHours(k.getHours() + 2);
        const czas = k.toISOString().slice(0, 19).replace("T", " ");
        Axios.post(gb.backendIP+"poprawTrase/"+daneTrasy.id+"/"+localStorage.getItem('token'), {
            kiedy: czas,
            typserwera: daneTrasy.typserwera,
            typzlecenia: daneTrasy.typzlecenia,
            ladunek: daneTrasy.ladunek,
            naczepa: daneTrasy.naczepa,
            od: daneTrasy.od,
            do: daneTrasy.do,
            masaladunku: daneTrasy.masaladunku,
            uszkodzenia: daneTrasy.uszkodzenia,
            spalanie: daneTrasy.spalanie,
            paliwo: daneTrasy.paliwo,
            przejechane: daneTrasy.przejechane,
            vmax: daneTrasy.vmax,
            zarobek: daneTrasy.zarobek,
            komentarz: daneTrasy.komentarz,
            noweZdj: daneTrasy.noweZdj,
            stareZdj: daneTrasy.zdj ? daneTrasy.zdj.join(" ") : "",
            ladunekADR: daneTrasy.ladunekADR,
            ladunekGabaryt: daneTrasy.ladunekGabaryt,
            ladunekDelikatny: daneTrasy.ladunekDelikatny
		}, { headers: { 'Content-Type': 'multipart/form-data'}}).then((res) => {
            if(res.data['odp']){
                Axios.post(gb.backendIP+"updateTrasaPromy/"+daneTrasy.id, {
                    promy: daneTrasy.promy
                }).then((res2) => {
                    if(res2.data['odp']){
                        setDaneTrasy({wyswietl: false, trwaOddawanie: false});
                        setOstatnieTrasy({response: null});
                    }
                });
            }
        });
    };

    const opcjeOddawania = () => {
        let zablokuj = false;
        let daneBlokady;
        if(blokada.dane !== null){
            //przeiteruj po kazdym urlopie
            blokada.dane.map((wiersz) => {
                if((wiersz.status == 2) && (Date.now() < new Date(wiersz.dokiedy).getTime()) && (Date.now() >= new Date(wiersz.odkiedy).getTime())){
                    zablokuj = true;
                    daneBlokady = wiersz;
                }
            });
        }
        //jesli ma blokade
        if(zablokuj){
            return(
                <div className="trasyUrlop">
                    <span><b>Kierowco</b>, jako iż jesteś na Urlopie od <b>{new Date(daneBlokady.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b> do <b>{new Date(daneBlokady.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</b>, możesz <b>jedynie przeglądać</b> swoje Trasy.</span>
                    <br />
                    <span>Jeśli chcesz edytować lub oddać nową trasę zakończ swój aktualny urlop!</span>
                    <br />
                    <button onClick={() => zakonczUrlop() }>Zakończ urlop</button>
                    { !blokada.blokada && setBlokada({...blokada, blokada: daneBlokady.idwniosku}) }
                </div>
            )
        } else {
            return(
                <>
                    <a className="wyborGry" onClick={() => oddawanieTrasy(true, null)}>Oddaj trasę ATS <img src="/img/trasaats.png"></img></a>
                    <a className="wyborGry" onClick={() => oddawanieTrasy(false, null)}>Oddaj trasę ETS2 <img src="/img/trasaets.png"></img></a>
                </>
            );
        }
    };

    const sprawdzBlokade = () => {
        Axios.post(gb.backendIP+"historiaUrlopow/"+localStorage.getItem('token')).then((r) => {
            setBlokada({dane: r.data['dane'], response: true});
        }).catch((er) => setBlokada({response: true, dane: null, blokada: false}));
    };

    const zakonczUrlop = () => {
        Axios.post(gb.backendIP+"zakonczUrlop/"+localStorage.getItem('token'), {
            ktory: blokada.blokada
        }).then((r) => {
            if(!r.data['blad']) {
                console.log("Pomyslnie zakonczono urlop");
                setBlokada({response: false, dane: null, blokada: false});
            }
        }).catch((er) => console.log(er));
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    <div className="przegladajTrasy">
                        <h4>Twoje ostatnie trasy</h4>
                        {ostatnieTrasy.response ? zwrocTrasy() : (miasta ? dostanTrasy() : dostanMiasta())}
                        { blokada.response ? opcjeOddawania() : sprawdzBlokade() }
                    </div>
                    
                </div>
            </div>
            {daneTrasy.wyswietl &&
                <div className="formularzTrasyScreen wejscieSmooth">
                    <div className="formularzTrasy">
                        { (daneTrasy.id && ((daneTrasy.zatwierdz === 1) || (daneTrasy.zatwierdz === 2))) ?
                        <div className="informacjeTrasy">
                            { (daneTrasy.id && daneTrasy.zatwierdz === 1) &&
                                <>
                                    <span style={{color: '#3d3'}}>Zarobek własny z trasy: <b>{daneTrasy.wlasnyzarobek.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</b></span>
                                    {daneTrasy.premia ? <span style={{color: '#3d3'}}>Premia za typ ładunku: <b>+{daneTrasy.premia.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</b></span> : ""}
                                    {daneTrasy.kara ? <span style={{color: 'darkgoldenrod'}}>Kara za uszkodzenia: <b>-{daneTrasy.kara.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</b></span> : <span style={{color: 'darkgoldenrod'}}>Nie nałożono żadnej grzywny.</span>}
                                </>
                            }
                            { (daneTrasy.id && (daneTrasy.zatwierdz === 2) && (daneTrasy.dozwolpoprawke === 1)) &&
                            <>
                                <span>Trasa została <b>odrzucona do poprawy</b> z powodu:</span>
                                {daneTrasy.powododrzuc ? <span style={{color: 'darkgoldenrod'}}>{daneTrasy.powododrzuc}</span> : <span style={{color: 'darkgoldenrod'}}>Nie podano.</span>}
                            </>
                            }
                            { (daneTrasy.id && (daneTrasy.zatwierdz === 2) && (daneTrasy.dozwolpoprawke != 1)) &&
                            <>
                                <span>Trasa została <b>odrzucona permanentnie</b> z powodu:</span>
                                {daneTrasy.powododrzuc ? <span style={{color: 'darkgoldenrod'}}>{daneTrasy.powododrzuc}</span> : <span style={{color: 'darkgoldenrod'}}>Nie podano.</span>}
                            </>
                            }
                        </div>
                        : ""
                        }
                        { daneTrasy.pokazZdj && <div className="podgladZdj" style={{backgroundImage: `url(${daneTrasy.pokazZdj})`}} onClick={() => setDaneTrasy({...daneTrasy, pokazZdj: null})}/> }
                        <div className="trasaOpcje">
                            { daneTrasy.id ?
                                (daneTrasy.zatwierdz === 0 || (daneTrasy.zatwierdz === 2 && daneTrasy.dozwolpoprawke)) ?
                                <>
                                    { !daneTrasy.trwaOddawanie && <a onClick={() => setDaneTrasy({wyswietl: false})}><FaTimes /> Zamknij</a>}
                                    { (!blokada.blokada || (daneTrasy.zatwierdz === 2 && daneTrasy.dozwolpoprawke)) && ( daneTrasy.trwaOddawanie ? <a>Trwa wgrywanie...</a> : <a onClick={() => { poprawTrase(); setDaneTrasy({...daneTrasy, trwaOddawanie: true}); }}><FaPen /> Popraw</a>) }
                                </>
                                :
                                <a onClick={() => setDaneTrasy({wyswietl: false})}><FaTimes /> Zamknij</a>
                            :
                            <>
                                { !daneTrasy.trwaOddawanie && <a onClick={() => setDaneTrasy({wyswietl: false})}><FaTimes /> Anuluj</a>}
                                { !blokada.blokada && ( daneTrasy.trwaOddawanie ? <a>Trwa wgrywanie...</a> : <a onClick={() => { oddajNowa(); setDaneTrasy({...daneTrasy, trwaOddawanie: true}); }}><FaShare /> Oddaj</a>) }
                            </>
                            }
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Data raportu</h3>
                                <input style={{borderLeft: !daneTrasy.kiedy && '4px solid crimson'}} type="datetime-local" value={daneTrasy.kiedy} onChange={(e) => setDaneTrasy({...daneTrasy, kiedy: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Typ serwera</h3>
                                <select style={{borderLeft: (daneTrasy.typserwera === undefined) && '4px solid crimson'}} value={daneTrasy.typserwera} onChange={(e) => setDaneTrasy({...daneTrasy, typserwera: e.target.value})}>
                                    <option value={null}>----</option>
                                    <option value="0">SP</option>
                                    <option value="1">MP</option>
                                    <option value="2">TMP</option>
                                </select>
                            </div>
                            <div className="formularzDane">
                                <h3>Typ zlecenia</h3>
                                <select style={{borderLeft: (daneTrasy.typzlecenia === undefined) && '4px solid crimson'}} value={daneTrasy.typzlecenia} onChange={(e) => setDaneTrasy({...daneTrasy, typzlecenia: e.target.value})}>
                                    <option value={null}>----</option>
                                    <option value="0">Zlecenie z gry</option>
                                    <option value="1">Zlecenie generowane przez gracza</option>
                                    <option value="2">World of Trucks</option>
                                </select>
                            </div>
                            <div className="formularzDane">
                                <h3>Gra</h3>
                                <input placeholder="----" type="text" value={daneTrasy.gra ? "American Truck Simulator" : "Euro Truck Simulator 2"} disabled/>
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Ładunek</h3>
                                <input style={{borderLeft: !daneTrasy.ladunek && '4px solid crimson'}} placeholder="----" type="text" value={daneTrasy.ladunek} onChange={(e) => setDaneTrasy({...daneTrasy, ladunek: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Typ naczepy</h3>
                                <select style={{borderLeft: !daneTrasy.naczepa && '4px solid crimson'}} value={daneTrasy.naczepa} onChange={(e) => setDaneTrasy({...daneTrasy, naczepa: e.target.value})}>
                                    <option value={null}>----</option>
                                    {
                                        typyNaczep.map((wiersz) => {
                                            if((wiersz.rodzaj == 'Licencja') && (wiersz.gra == daneTrasy.gra)){
                                                if(!(["Kat. C+E", "ADR", "Gabaryty", "Długie zestawy"].includes(wiersz.nazwa))){
                                                    return <option key={`naczepa_${wiersz.id}`} value={wiersz.id}>{wiersz.nazwa}</option>
                                                }
                                            }
                                        })
                                    }
                                </select>
                            </div>
                            <div className="formularzDane">
                                <h3>Rozpoczęcie trasy</h3>
                                <select style={{borderLeft: !daneTrasy.krajOd && '4px solid crimson'}} value={daneTrasy.krajOd} onChange={(e) => setDaneTrasy({...daneTrasy, krajOd: e.target.value})}>
                                    <option value={null}>----</option>
                                    { zwrocKraje(daneTrasy.gra) }
                                </select>
                                { daneTrasy.krajOd ? 
                                <select style={{borderLeft: !daneTrasy.od && '4px solid crimson'}} value={daneTrasy.od} onChange={(e) => setDaneTrasy({...daneTrasy, od: e.target.value})}>
                                    <option value={null}>----</option>
                                    { miasta.map(i => { if(i && i[0] === daneTrasy.krajOd) { return <option key={`miastoOd_${i[3]}`} value={i[3]}>{i[1]}</option>}}) }
                                </select>
                                : "" }
                            </div>
                            <div className="formularzDane">
                                <h3>Zakończenie trasy</h3>
                                <select style={{borderLeft: !daneTrasy.krajDo && '4px solid crimson'}} value={daneTrasy.krajDo} onChange={(e) => setDaneTrasy({...daneTrasy, krajDo: e.target.value})}>
                                    <option value={null}>----</option>
                                    { zwrocKraje(daneTrasy.gra) }
                                </select>
                                { daneTrasy.krajDo ? 
                                <select style={{borderLeft: !daneTrasy.do && '4px solid crimson'}} value={daneTrasy.do} onChange={(e) => setDaneTrasy({...daneTrasy, do: e.target.value})}>
                                    <option value={null}>----</option>
                                    { miasta.map(i => { if(i && i[0] === daneTrasy.krajDo) { return <option key={`miastoDo_${i[3]}`} value={i[3]}>{i[1]}</option>}}) }
                                </select>
                                : "" }
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Masa ładunku (tony)</h3>
                                <input style={{borderLeft: !daneTrasy.masaladunku && '4px solid crimson'}} placeholder="----" type="number" step="0.1" value={daneTrasy.masaladunku} onChange={(e) => setDaneTrasy({...daneTrasy, masaladunku: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Uszkodzenia</h3>
                                <input style={{borderLeft: (daneTrasy.uszkodzenia === undefined) && '4px solid crimson'}} placeholder="----" type="number" step="0.1" value={daneTrasy.uszkodzenia} onChange={(e) => setDaneTrasy({...daneTrasy, uszkodzenia: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Wykorzystane paliwo (litry)</h3>
                                <input style={{borderLeft: !daneTrasy.spalanie && '4px solid crimson'}} placeholder="----" type="number" step="0.1" value={daneTrasy.spalanie} onChange={(e) => setDaneTrasy({...daneTrasy, spalanie: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Zarobek na zleceniu</h3>
                                <input style={{borderLeft: !daneTrasy.zarobek && '4px solid crimson'}} placeholder="----" type="number" step="0.1" value={daneTrasy.zarobek} onChange={(e) => setDaneTrasy({...daneTrasy, zarobek: e.target.value})}/>
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Pokonany dystans (km)</h3>
                                <input style={{borderLeft: !daneTrasy.przejechane && '4px solid crimson'}} placeholder="----" type="number" step="0.1" value={daneTrasy.przejechane} onChange={(e) => setDaneTrasy({...daneTrasy, przejechane: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Prędkość maksymalna (km/h)</h3>
                                <input style={{borderLeft: !daneTrasy.vmax && '4px solid crimson'}} placeholder="----" type="number" step="0.1" value={daneTrasy.vmax} onChange={(e) => setDaneTrasy({...daneTrasy, vmax: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Koszt tankowanego paliwa</h3>
                                <input style={{borderLeft: (daneTrasy.paliwo === undefined) && '4px solid crimson'}} placeholder="----" type="number" step="0.1" value={daneTrasy.paliwo} onChange={(e) => setDaneTrasy({...daneTrasy, paliwo: e.target.value})}/>
                            </div>
                            <div className="formularzDane">
                                <h3>Liczba promów</h3>
                                <input type="number" step="1" min="0" max="3" value={daneTrasy.liczbapromow} onChange={(e) => zmianaLiczbyPromow(e.target.value)}/>
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Ładunek ADR</h3>
                                <select value={daneTrasy.ladunekADR} onChange={(e) => setDaneTrasy({...daneTrasy, ladunekADR: e.target.value})}>
                                    <option value={null}>Nie</option>
                                    <option value={0}>Nie</option>
                                    <option value={1}>Tak</option>
                                </select>
                            </div>
                            <div className="formularzDane">
                                <h3>Ładunek delikatny</h3>
                                <select value={daneTrasy.ladunekDelikatny} onChange={(e) => setDaneTrasy({...daneTrasy, ladunekDelikatny: e.target.value})}>
                                    <option value={null}>Nie</option>
                                    <option value={0}>Nie</option>
                                    <option value={1}>Tak</option>
                                </select>
                            </div>
                            <div className="formularzDane">
                                <h3>Ładunek gabarytowy</h3>
                                <select value={daneTrasy.ladunekGabaryt} onChange={(e) => setDaneTrasy({...daneTrasy, ladunekGabaryt: e.target.value})}>
                                    <option value={null}>Nie</option>
                                    <option value={0}>Nie</option>
                                    <option value={1}>Tak</option>
                                </select>
                            </div>
                            <div className="formularzDane listaPromow">
                                { (daneTrasy.liczbapromow && daneTrasy.liczbapromow > 0) ? wybieraniePromow() : ""}
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane" style={{maxWidth: 'unset'}}>
                                <h3>Komentarz</h3>
                                <textarea placeholder="Wydarzyło się może coś istotnego, o czym chciałbyś nam wspomnieć?" style={{resize: 'none'}} value={daneTrasy.komentarz} onChange={(e) => setDaneTrasy({...daneTrasy, komentarz: e.target.value})} />
                            </div>
                            <div className="formularzDane" style={{maxWidth: 'unset'}}>
                                <h3>Zdjęcia</h3>
                                <div className="zdjeciaTrasy">
                                    { (!daneTrasy.zdj && !daneTrasy.noweZdj) && <span className="brakZdjec">Brak zdjęć</span>}
                                    { daneTrasy.zdj ? daneTrasy.zdj.map((zdj, i) => {
                                        return <div key={`zdj_${i}`} className="zdjecieTrasa" style={{backgroundImage: `url(${zdj})`}}>
                                            <FaExpand className="zdjecieTrasaPodglad" onClick={() => {
                                                setDaneTrasy({...daneTrasy, pokazZdj: zdj})
                                            }} />
                                            <FaTimes className="zdjecieTrasaUsun" onClick={() => {
                                                setDaneTrasy({...daneTrasy, zdj: daneTrasy.zdj.filter((val, index) => index !== i)})
                                            }} />
                                        </div>
                                    }) : "" }
                                    {
                                        daneTrasy.noweZdjBloby ? daneTrasy.noweZdjBloby.map((zdj, i) => {
                                            return <div key={`blobzdj_${i}`} className="zdjecieTrasa" style={{backgroundImage: `url(${zdj})`}}>
                                                <FaExpand className="zdjecieTrasaPodglad" onClick={() => {
                                                    setDaneTrasy({...daneTrasy, pokazZdj: zdj})
                                                }} />
                                                <FaTimes className="zdjecieTrasaUsun" onClick={() => {
                                                    if(daneTrasy.noweZdj.length === 1){
                                                        setDaneTrasy({
                                                            ...daneTrasy,
                                                            noweZdj: null,
                                                            noweZdjBloby: null
                                                        })
                                                    } else {
                                                        setDaneTrasy({
                                                            ...daneTrasy,
                                                            noweZdj: daneTrasy.noweZdj.filter((val, index) => index !== i),
                                                            noweZdjBloby: daneTrasy.noweZdjBloby.filter((val, index) => index !== i)
                                                        })
                                                    }
                                                    }} />
                                            </div>
                                        }) : ""
                                    }
                                </div>
                                { (!daneTrasy.id || (daneTrasy.zatwierdz === 2 && daneTrasy.dozwolpoprawke) || (daneTrasy.zatwierdz === 0)) &&
                                <input type="file" style={{width: '100%', padding: '10px'}} className={daneTrasy.noweZdj ? "inputZdjTrasyYes" : "inputZdjTrasyNo"} accept="image/*" onChange={(e) => noweZdjecia(e.target.files)} multiple="multiple"/>
                                }
                            </div>
                            <div className="formularzDane" />
                        </div>
                    </div>
                </div>
            }
        </>
    );
}