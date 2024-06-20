import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
import { RiAlertFill } from "react-icons/ri";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FaTimes, FaCheck, FaSistrix, FaShare, FaExpand, FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
export default function Trasy(props){
    const [ ostatnieTrasy, setOstatnieTrasy ] = useState({response: null});
    const [ daneTrasy, setDaneTrasy ] = useState({wyswietl: false, gra: null});
    const [ miasta, setMiasta ] = useState(null);
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false});
    const [ typyNaczep, setTypyNaczep ] = useState(null);
    const [ promy, setPromy ] = useState(null);
    const [ historia, setHistoria ] = useState({wysun: false, dane: null, response: false});
    const [ sprawdzoneUprawnienie, setSprawdzoneUprawnienie] = useState({response: false, posiada: null});
    const { trasaID } = useParams();

    const dostanMiasta = () => {
        Axios.post(gb.backendIP+"miastaOld").then((res2) => {
            Axios.post(gb.backendIP+"typyNaczep").then((res3) => {
                Axios.post(gb.backendIP+"promy").then((res4) => {
                    setTypyNaczep(res3.data['dane']);
                    setMiasta(res2.data['dane']);
                    setPromy(res4.data['dane']);
                });
            })
        });
    };

    const dostanTrasy = () => {
        Axios.post(gb.backendIP+"dyspozytorTrasy").then((res) => {
            if(res.data['dane']){
                let trasy = res.data['dane'];
                setOstatnieTrasy({response: 1, dane: trasy});
            } else {
                setOstatnieTrasy({response: 1, dane: null});
            }
        }).catch((er) => {
            setOstatnieTrasy({response: 1, dane: null, blad: er.message});
        });
    };

    const sprawdzanieTrasy = (gra, daneinc) => {
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
                setDaneTrasy({wyswietl: true, ...dane, liczbapromow: res.data['dane'].ile, promy: res.data['dane'].promy, gra: gra ? 1 : 0, krajOd: krajod, krajDo: krajdo});
            });
        }
    };

    const dostanHistorie = () => {
        Axios.post(gb.backendIP+"dyspHistoria/").then((res) => {
            if(res.data['dane']){
                setHistoria({response: true, dane: res.data['dane'], wysun: false});
            } else {
                setHistoria({response: true, dane: null, wysun: false});
            }
        });
    };

    const zwrocTrasy = () => {
    if(uzytkownicy.response){
        if(trasaID && !daneTrasy.wyswietl){
                console.log("No kurwa podane");
                Axios.post(gb.backendIP+"trasaDane/"+trasaID).then((res2) => {
                    console.log(res2.data['dane']);
                    sprawdzanieTrasy(res2.data['dane']['gra'], res2.data['dane']);
                });
        }
        if(!trasaID && ostatnieTrasy.dane){
                return(
                    <>
                    <table className="ostatnieTrasy wejscieSmooth">
                        <tbody>
                            <tr><th>ID</th><th>Gra</th><th>Data</th><th>Lokalizacja</th><th>Ładunek</th><th>Kto oddał</th><th>Akcja</th></tr>
                            {ostatnieTrasy.dane.map((wiersz) => {
                                const skad = miasta[wiersz.od];
                                const dokad = miasta[wiersz.do];
                                const autor = uzytkownicy.dane.find(user => user.id === wiersz.kto).login;
                                return(
                                    <tr key={"trasa_"+wiersz.id}>
                                        <td>{wiersz.id}</td>
                                        <td>{wiersz.gra ? <img src={"/img/trasaats.png"}/> : <img src={"/img/trasaets.png"}/>}</td>
                                        <td>{new Date(wiersz.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'})} - {new Date(wiersz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long'})}</td>
                                        <td>
                                            {skad && (wiersz.gra ? <img title={skad[0]} className="flaga" src={"/img/flagi/usa.png"} /> : <img title={skad[0]} className="flaga" src={"/img/flagi/"+skad[0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} />)}
                                            <b>{skad ? skad[1] : "???"}</b>
                                            <HiArrowNarrowRight />
                                            {dokad && (wiersz.gra ? <img title={dokad[0]} className="flaga" src={"/img/flagi/usa.png"} /> : <img title={dokad[0]} className="flaga" src={"/img/flagi/"+dokad[0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} />)}
                                            <b>{dokad ? dokad[1] : "???"}</b>
                                        </td>
                                        <td>{wiersz.ladunek}</td>
                                        <td><a href={"/profil/"+autor}><img className="ktoOddal" src={"/img/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).awatar} />{autor}</a></td>
                                        <td><a onClick={() => sprawdzanieTrasy(wiersz.gra, wiersz)}>Rozpatrz</a></td>
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
                return(<>Aktualnie nie ma żadnej trasy oczekującej na rozpatrzenie.</>);
            }
        }
    } else {
        Axios.post(gb.backendIP+"listaUzytkownikow").then((res) => {
            setUzytkownicy({dane: res.data, response: true});
        });
    }
        
    };

    const odrzucanie = () => {
        return(
            <div className="akcjaDyspozytor wejscieSmooth">
                <span style={{fontWeight: 600}}>Odrzucanie trasy nr {daneTrasy.id} użytkownika {uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}</span><br />
                <div>
                    <span>Powód:</span><br />
                    <textarea onChange={ (e) => setDaneTrasy({...daneTrasy, powododrzucenia: e.target.value})} />
                </div>
                <div>
                    <span>Zezwolić na poprawę trasy?</span>
                    <select value={daneTrasy.dozwolPoprawe ? daneTrasy.dozwolPoprawe : 1} onChange={(e) => setDaneTrasy({...daneTrasy, dozwolPoprawe: e.target.value})}>
                        <option value={null} />
                        <option value="1">Tak</option>
                        <option value="0">Nie</option>
                    </select>
                </div>
                <br />
                <div style={{marginTop: '40px'}}>
                    <a onClick={() => setDaneTrasy({...daneTrasy, odrzucanie: false, powododrzucenia: null, dozwolPoprawe: null})}><FaShare /> Wróć</a>
                    <a onClick={() => decyzja(false)}><FaTimes /> Odrzuć</a>
                </div>
            </div>
        )
    };

    const zatwierdzanie = () => {
        const kierowca = uzytkownicy.dane.find(user => user.id === daneTrasy.kto);
        let wstepnaKara = 0;
        const potencjalnyZarobek = ((daneTrasy.przejechane * kierowca.stawka) + (daneTrasy.nadawanaPremia ? parseFloat(daneTrasy.nadawanaPremia) : 0)).toFixed(2);
        let procent = 0;
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
        ]
        if(daneTrasy.uszkodzenia){
            let mnoznik = Math.round(daneTrasy.uszkodzenia);
            if(daneTrasy.uszkodzenia > 15) mnoznik = 15;
            wstepnaKara = procenty[kierowca.stanowisko][mnoznik]*potencjalnyZarobek/100;
            procent = procenty[kierowca.stanowisko][mnoznik];
        }
        return(
            <div className="akcjaDyspozytor wejscieSmooth">
                <span style={{fontWeight: 600}}>Zatwierdzanie trasy nr {daneTrasy.id} użytkownika {uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}</span><br />
                { (daneTrasy.uszkodzenia || daneTrasy.ladunekADR || daneTrasy.ladunekDelikatny || daneTrasy.ladunekGabaryt) ?
                <div className="zatwierdzaniePremieKary">
                    { daneTrasy.uszkodzenia ?
                    <div style={{maxWidth: '380px', textAlign: 'center', alignItems: 'center'}}>
                        <span>W trasie wykryto uszkodzenia.</span>
                        <span>Możesz opcjonalnie nałożyć grzywnę. Pamiętaj, że kierowca potencjalnie z tej trasy zarobi {parseFloat(potencjalnyZarobek).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</span>
                        <span>Wyliczona kara na podstawie stanowiska i uszkodzeń wynosi: {parseFloat(wstepnaKara).toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})} <sup>{procent}% zarobku</sup></span>
                        <input style={{borderColor: "crimson"}} type="number" step="0.01" placeholder="Wprowadź grzywnę" value={daneTrasy.nakladanaGrzywna ? daneTrasy.nakladanaGrzywna : ""} onChange={(e) => setDaneTrasy({...daneTrasy, nakladanaGrzywna: e.target.value})} />
                    </div>
                    : ""}
                    { (daneTrasy.ladunekADR || daneTrasy.ladunekGabaryt || daneTrasy.ladunekDelikatny) ?
                    <div>
                        <span>Ładunek w oddawanej trasie jest:</span>
                        <ul>
                        { daneTrasy.ladunekGabaryt ? <li><b>Gabarytowy</b></li> : ""}
                        { daneTrasy.ladunekDelikatny ? <li><b>Delikatny</b></li> : ""}
                        { daneTrasy.ladunekADR ? <li><b>ADR</b></li> : ""}
                        </ul>
                        <span>Możesz nałożyć premię za ładunek.</span>
                        <input style={{borderColor: "#008700"}} type="number" step="0.01" placeholder="Wprowadź premię" value={daneTrasy.nadawanaPremia ? daneTrasy.nadawanaPremia : ""} onChange={(e) => setDaneTrasy({...daneTrasy, nadawanaPremia: e.target.value})} />
                    </div>
                    : ""}
                </div>
                : "" }
                <div style={{marginTop: '40px'}}>
                    <a onClick={() => setDaneTrasy({...daneTrasy, zatwierdzanie: false, nakladanaGrzywna: null})}><FaShare /> Wróć</a>
                    <a onClick={() => decyzja(true)}><FaCheck /> Zatwierdź</a>
                </div>
            </div>
        );
    };

    const decyzja = (jaka) => {
        let bodyData = {};
        if(jaka){
            //zatwierdzanie
            bodyData.grzywna = daneTrasy.nakladanaGrzywna ? daneTrasy.nakladanaGrzywna : 0;
            bodyData.zatwierdz = 1;
            bodyData.kto = daneTrasy.kto;
            bodyData.przejechane = daneTrasy.przejechane;
            bodyData.nadawanaPremia = daneTrasy.nadawanaPremia ? daneTrasy.nadawanaPremia : 0;
            bodyData.dlaFirmy = 0.02*parseFloat(daneTrasy.zarobek);
            if(bodyData.grzywna){
                bodyData.dlaFirmy = bodyData.dlaFirmy + parseFloat(bodyData.grzywna);
            }
            if(bodyData.nadawanaPremia){
                bodyData.dlaFirmy = bodyData.dlaFirmy - parseFloat(bodyData.nadawanaPremia);
            }
            if(daneTrasy.paliwo){
                bodyData.dlaFirmy = bodyData.dlaFirmy - parseFloat(daneTrasy.paliwo);
            }
            bodyData.dlaFirmy = parseFloat(bodyData.dlaFirmy).toFixed(2);
        } else {
            //odrzucanie
            bodyData.zatwierdz = 2;
            if(daneTrasy.dozwolPoprawe){
                if(daneTrasy.dozwolPoprawe == 0){
                    bodyData.dozwolpoprawe = 0;
                } else {
                    bodyData.dozwolpoprawe = 1;
                }
            } else {
                bodyData.dozwolpoprawe = 1;
            }
            if(daneTrasy.powododrzucenia) {
                bodyData.powod = daneTrasy.powododrzucenia;
            } else {
                bodyData.powod = "Nie podano.";
            }
        }
        console.log(bodyData);
        Axios.post(gb.backendIP+"rozpatrzenieTrasy/"+localStorage.getItem('token')+"/"+daneTrasy.id, {...bodyData}).then((res) => {
            if(res.data['odp']){
                setDaneTrasy({wyswietl: false});
                setOstatnieTrasy({response: null});
                setSprawdzoneUprawnienie({response: false, posiada: null});
            }
        });
    };

    const pokazHistorie = () => {
        return(
            <div className="dyspHistoria wejscieSmooth">
                <table className="ostatnieTrasy">
                    <tbody>
                        <tr><th>ID Trasy</th><th>Dyspozytor</th><th>Data rozpatrzenia</th><th>Decyzja</th></tr>
                        {historia.dane ?
                        historia.dane.map((wiersz) => {
                            return(
                                <tr key={`dyspH_${wiersz.trasa}_${new Date(wiersz.kiedy).getTime()}`}>
                                    <td><a href={"/dyspozytornia/"+wiersz.trasa}>{wiersz.trasa}</a></td>
                                    <td>
                                        <a href={"/profil/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).login}>
                                            <img className="ktoOddal" src={"/img/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).awatar} /> 
                                            {uzytkownicy.dane.find(user => user.id === wiersz.kto).login}
                                        </a>
                                    </td>
                                    <td>{new Date(wiersz.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'})} - {new Date(wiersz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', year: 'numeric'})}</td>
                                    <td>{wiersz.akcja ? "Zaakceptowana" : "Odrzucona"}</td>
                                </tr>
                            )
                        })    
                        : <tr><td colSpan={4}>Brak danych...</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        )
    };

    const sprawdzUprawnienie = (idosoby, idnaczepy, kiedy) => {
        Axios.post(gb.backendIP+"sprawdzUprawnienieTrasy", {
            idosoby: idosoby,
            idnaczepy: idnaczepy,
            kiedy: kiedy.split(" ")[0]
        }).then((r) => {
            const posiada = r.data['posiada'] ? r.data['posiada'] : false;
            if(posiada){
                console.log("TS trasy:", new Date(kiedy).getTime());
                console.log("TS Upr:", new Date(posiada).getTime());
                if(new Date(posiada).getTime() < new Date(kiedy).getTime()){
                    setSprawdzoneUprawnienie({response: true, posiada: false, kiedy: new Date(posiada)});
                } else {
                    setSprawdzoneUprawnienie({response: true, posiada: posiada, kiedy: new Date(posiada)});    
                }
            } else {
                setSprawdzoneUprawnienie({response: true, posiada: false});
            }
        }).catch((er) => {
            console.log(er);
            setSprawdzoneUprawnienie({response: true, posiada: null});
        });
    }

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna" style={{minHeight: '500px'}}>
                    <div className="przegladajTrasy" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                        <h4>Następujące trasy czekają na rozpatrzenie</h4>
                        {ostatnieTrasy.response ? zwrocTrasy() : (miasta ? dostanTrasy() : dostanMiasta())}
                    </div>
                    {historia.response ? <div className="dyspHistoriaBtn" onClick={() => setHistoria({...historia, wysun: !historia.wysun})}>{historia.wysun ? <FaArrowAltCircleDown /> : <FaArrowAltCircleUp />} Historia</div> : dostanHistorie() }
                    {historia.wysun && pokazHistorie() }
                    <div className="customDysp">
                        <input type="number" min="1" step="1" placeholder="ID Trasy" id="customIdTrasy" />
                        <a onClick={() => { document.getElementById("customIdTrasy").value && window.location.assign("/dyspozytornia/"+document.getElementById("customIdTrasy").value); }}><FaSistrix /></a>
                    </div>
                </div>
                
            </div>
            {daneTrasy.wyswietl &&
                <div className="formularzTrasyScreen wejscieSmooth">
                    <div className="formularzTrasy dyspozytorniaTrasyForm" style={{height: 'unset', paddingBottom: '5px'}}>
                        { daneTrasy.pokazZdj && <div className="podgladZdj" style={{backgroundImage: `url(${daneTrasy.pokazZdj})`}} onClick={() => setDaneTrasy({...daneTrasy, pokazZdj: null})}/> }
                        { daneTrasy.odrzucanie && odrzucanie() }
                        { daneTrasy.zatwierdzanie && zatwierdzanie() }
                        { daneTrasy.powododrzuc ?
                            <div style={{maxWidth: 'unset', marginBottom: '10px', fontSize: '0.9rem', background: '#181818', padding: '10px'}}>
                                <h3 style={{color: 'orangered', fontWeight: 'bold'}}>Trasa była odrzucona:</h3>
                                <span style={{flexGrow: 1, minHeight: '120px'}}>{daneTrasy.powododrzuc}</span>
                            </div>
                            : ""
                        }
                        <div className="trasaOpcje">
                            <a onClick={() => {
                                if(trasaID) {
                                    window.location.href = "/dyspozytornia";
                                } else {
                                    setDaneTrasy({wyswietl: false});
                                    setSprawdzoneUprawnienie({response: false, posiada: null});
                                }
                            }}><FaShare /> Wróć</a>
                            <a onClick={() => setDaneTrasy({...daneTrasy, odrzucanie: true})}><FaTimes /> Odrzuć</a>
                            <a onClick={() => setDaneTrasy({...daneTrasy, zatwierdzanie: true})}><FaCheck /> Zatwierdź</a>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Data raportu</h3>
                                <span>{new Date(daneTrasy.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'})} - { new Date(daneTrasy.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
                            </div>
                            <div className="formularzDane">
                                <h3>Typ serwera</h3>
                                {daneTrasy.typserwera ? ((daneTrasy.typserwera == 2) ? <span>TMP</span> : <span>MP</span>) : <span>SP</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Typ zlecenia</h3>
                                {!daneTrasy.typzlecenia ? <span>Zlecenie z gry</span> : ((daneTrasy.typzlecenia === 2) ? <span>World of Trucks</span> : <span>Zlecenie generowane przez gracza</span>)}
                            </div>
                            <div className="formularzDane">
                                <h3>Gra</h3>
                                {daneTrasy.gra ? <span>American Truck Simulator</span> : <span>Euro Truck Simulator 2</span>}
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Ładunek</h3>
                                {daneTrasy.ladunek ? <span>{daneTrasy.ladunek}</span> : <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Typ naczepy</h3>
                                <span title={!sprawdzoneUprawnienie.posiada ? 
                                    (sprawdzoneUprawnienie.kiedy ? 
                                        `W momencie oddawania trasy Kierowca nie posiadał ważnej Licencji na dany typ naczepy. Ważność skończyła się: ${sprawdzoneUprawnienie.kiedy.toLocaleString('pl-PL', {day: '2-digit', month: 'long', year: 'numeric'})}` 
                                        : `Kierowca nie posiadał kiedykolwiek uprawnienia na daną Licencje!`) : null} style={{borderLeft: !sprawdzoneUprawnienie.posiada && '4px solid crimson'}}>{!sprawdzoneUprawnienie.posiada && <RiAlertFill style={{margin: '-8px 5px -5px -5px', verticalAlign: 'middle', fill: 'crimson'}}/> }{ typyNaczep.map((naczepki) => {if(naczepki.id === daneTrasy.naczepa) return naczepki.nazwa}) }</span>
                                { daneTrasy.id && (!sprawdzoneUprawnienie.response && sprawdzUprawnienie(daneTrasy.kto, daneTrasy.naczepa, daneTrasy.kiedy)) }
                            </div>
                            <div className="formularzDane">
                                <h3>Rozpoczęcie trasy</h3>
                                <span>{daneTrasy.krajOd && (daneTrasy.gra ? <img className="flaga" src="/img/flagi/usa.png" />
                                : <img className="flaga" src={"/img/flagi/"+miasta[daneTrasy.od][0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"}/> )} 
                                {daneTrasy.krajOd ? `${miasta[daneTrasy.od][0]}, ${miasta[daneTrasy.od][1]}` : "Usunięta miejscowość"}</span>
                            </div>
                            <div className="formularzDane">
                                <h3>Zakończenie trasy</h3>
                                <span>{daneTrasy.krajDo && (daneTrasy.gra ? 
                                <img className="flaga" src="/img/flagi/usa.png" /> : 
                                <img className="flaga" src={"/img/flagi/"+miasta[daneTrasy.do][0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"}/>) } 
                                {daneTrasy.krajDo ? `${miasta[daneTrasy.do][0]}, ${miasta[daneTrasy.do][1]}` : "Usunięta miejscowość"}</span>
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Masa ładunku</h3>
                                {daneTrasy.masaladunku ? <span>{daneTrasy.masaladunku.toLocaleString('pl-PL')} t</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Uszkodzenia</h3>
                                {daneTrasy.uszkodzenia ? <span title="Wykryto uszkodzenia!" style={{borderLeft: daneTrasy.uszkodzenia && '4px solid crimson'}}><RiAlertFill style={{margin: '-8px 5px -5px -5px', verticalAlign: 'middle', fill: 'crimson'}}/> {daneTrasy.uszkodzenia.toLocaleString('pl-PL')}%</span>: <span>Brak uszkodzeń</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Wykorzystane paliwo</h3>
                                {daneTrasy.spalanie ? <span>{daneTrasy.spalanie.toLocaleString('pl-PL')} l</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Koszt tankowanego paliwa</h3>
                                {daneTrasy.paliwo !== undefined ? <span>{daneTrasy.paliwo.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</span>: <span>Nie podano.</span>}
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Pokonany dystans</h3>
                                {daneTrasy.przejechane ? <span>{daneTrasy.przejechane.toLocaleString('pl-PL')} km</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Prędkość maksymalna</h3>
                                {daneTrasy.vmax ? <span>{daneTrasy.vmax} km/h</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Zarobek na zleceniu</h3>
                                {daneTrasy.zarobek ? <span>{daneTrasy.zarobek.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</span>: <span>Nie podano.</span>}
                            </div>
                            { daneTrasy.promy ?
                            <div className="formularzDane" style={{position: 'relative'}}>
                                <h3>Promy/pociągi</h3>
                                <div className="listaPromowDiv" style={{display: 'flex', flexDirection: 'column', gap: '8px', width: '100%'}}>
                                    { daneTrasy.promy.map((prom, i) => { return <span key={`promD_${prom}`}>{promy.find((dostepnePromy) => dostepnePromy.id === prom) ? promy.find((dostepnePromy) => dostepnePromy.id === prom).nazwa : "Usunięty Prom"}</span> }) }
                                </div>
                            </div>
                            :
                            <div className="formularzDane">
                                <h3>Kierowca</h3>
                                <span style={{padding: '0'}}><a style={{padding: '0'}} href={"/profil/"+uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}><img src={"/img/"+uzytkownicy.dane.find(user => user.id === daneTrasy.kto).awatar} /> {uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}</a></span>
                            </div>
                            }
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Ładunek ADR</h3>
                                {daneTrasy.ladunekADR ? <span style={{borderLeft: '8px solid #008700'}}>Tak</span> : <span>Nie</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Ładunek Delikatny</h3>
                                {daneTrasy.ladunekDelikatny ? <span style={{borderLeft: '8px solid #008700'}}>Tak</span> : <span>Nie</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Ładunek Gabaryt</h3>
                                {daneTrasy.ladunekGabaryt ? <span style={{borderLeft: '8px solid #008700'}}>Tak</span> : <span>Nie</span>}
                            </div>
                            <div className="formularzDane" />
                        </div>
                        <div className="formularzLinia">
                            { daneTrasy.komentarz ?
                            <div className="formularzDane" style={{maxWidth: 'unset'}}>
                                <h3>Komentarz</h3>
                                <span style={{flexGrow: 1, minHeight: '120px'}}>{daneTrasy.komentarz}</span>
                            </div>
                            : ""
                            }
                            <div className="formularzDane">
                                <h3>Zdjęcia</h3>
                                <div className="zdjeciaTrasy">
                                    { (!daneTrasy.zdj && !daneTrasy.noweZdj) && <span className="brakZdjec">Brak zdjęć</span>}
                                    { daneTrasy.zdj ? daneTrasy.zdj.map((zdj, i) => {
                                        return <div key={`zdjecieTrasa_${i}`} className="zdjecieTrasa" style={{cursor: "zoom-in", backgroundImage: `url(${zdj})`}} onClick={() => {
                                                setDaneTrasy({...daneTrasy, pokazZdj: zdj})
                                            }}>
                                        </div>
                                    }) : "" }
                                </div>
                            </div>
                            { daneTrasy.promy && <div className="formularzDane">
                                <h3>Kierowca</h3>
                                <span style={{padding: 0}}><a style={{color: '#ddd', background: '#181818'}} href={"/profil/"+uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}><img src={"/img/"+uzytkownicy.dane.find(user => user.id === daneTrasy.kto).awatar} /> {uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}</a></span>
                            </div> }
                        </div>
                    </div>
                </div>
            }
        </>
    );
}