import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Ustawienia(props){
    const [ust, setUst] = useState({dane: null, response: false});
    const [ ustawWiniete, setUstawWiniete ] = useState({ktora: undefined, cena: null, kraj: undefined});
    const [ winiety, setWiniety ] = useState({response: false, dane: null});
    const [ miasta, setMiasta ] = useState({response: false, open: false, dane: null});
    const [ filtryMiasta, setFiltryMiasta ] = useState({gra: -1, kraj: "", miejscowosc: ""});
    const [ promy, setPromy ] = useState({response: false, dane: null, open: false});
    const [ filtryPromy, setFiltryPromy ] = useState({skad: "", dokad: "", jednokierunkowe: 0});
    const [ stanKontaFirmowego, setStanKontaFirmowego ] = useState({response: false, suma: 0});
    let tmpX = 0;

    const initUstawienia = () => {
        Axios.post(gb.backendIP+"listaUzytkownikow").then((uzytkownicy) => {
            Axios.post(gb.backendIP+"glownaInfo").then((glowna) => {
                setUst({response: true, limitkm: glowna.data['limitkm'], msg: glowna.data['msg'], uzytkownicy: uzytkownicy.data, wybranyUzytkownik: null});
            });
        });
    };
    const ustawMsg = () => {
        if(!ust.msg) return;
        Axios.post(gb.backendIP+"ustawPowitalna/"+localStorage.getItem('login'), {
            tresc: ust.msg
        }).then((r) => {
            console.log(r.data);
            setUst({response: false}); 
        }).catch((er) => console.log(er));
    };
    const dodajKwote = () => {
        if(!ust.kwotaDod) return;
        if(!ust.wybranyUzytkownik) return;
        console.log(ust);
        Axios.post(gb.backendIP+"dodajKwote/"+localStorage.getItem('token'), {
            komu: ust.wybranyUzytkownik,
            kwota: ust.kwotaDod,
            powod: ust.powodDod ? ust.powodDod : null
        }).then((r) => {
            console.log(r);
            setUst({...ust, kwotaDod: 0, powodDod: ''});
            setStanKontaFirmowego({response: false, suma: 0});
        }).catch((er) => console.log(er));
    };
    const ustawLimit = () => {
        if(!ust.limitkm) return;
        Axios.post(gb.backendIP+"ustawLimit/"+localStorage.getItem('login'), {
            limit: ust.limitkm
        }).then((r) => {
            console.log(r.data);
            setUst({response: false}); 
        }).catch((er) => console.log(er));
    };
    const ustawCeneWiniety = () => {
        if(ustawWiniete.ktora && ustawWiniete.kraj){
            console.log(ustawWiniete);
            Axios.post(gb.backendIP+"ustawWiniete/"+localStorage.getItem("login"), { cena: ustawWiniete.cena, kraj: ustawWiniete.kraj, ktora: ustawWiniete.ktora}).then((r) => {
                if(!r.data['blad']){
                    let win = [...winiety.dane];
                    let i;
                    win.find((el, k) => {
                        if(el.id == ustawWiniete.ktora) i = k
                    });
                    win[i].cena = ustawWiniete.cena;
                    setWiniety({...winiety, dane: win});
                    setUstawWiniete({cena: null, ktora: undefined, kraj: undefined});
                }
            }).catch((er) => console.log(er));
        }
    }
    const dostanWiniety = () => {
        Axios.post(gb.backendIP+"wszystkieWiniety").then((r) => {
            setWiniety({...r.data, response: true});
        }).catch((er) => {
            console.log(er);
            setWiniety({response: true, dane: null});
        })
    };
    const pokazWiniety = () => {
        if(!winiety.dane) return;
        return winiety.dane.map((w) => {
            return <option key={`win_${w.id}`} value={w.id}>{w.kraj}</option>
        });
    };
    const dostanMiasta = () => {
        Axios.post(gb.backendIP+"miasta").then((r) => {
            if(!r.data['blad']){
                setMiasta({...miasta, response: true, dane: r.data['dane']});
            } else {
                setMiasta({response: true, open: false, dane: null, blad: "Wystąpił błąd"});
            }
        }).catch((er) => {
            console.log(er);
            setMiasta({response: true, open: false, dane: null, blad: "Wystąpił błąd"});
        });
    };
    const zarzadzanieMiastami = () => {
        return(
            <>
            <div className="zarzadzanieMiastami">
                <table>
                <thead><tr><th>ID</th><th>Gra</th><th>Kraj / Region</th><th>Miejscowość</th><th>Akcja</th></tr></thead>
                <tbody>
                    { miasta.response ? wyswietlMiasta() : dostanMiasta() }
                    { !tmpX && <tr><td style={{height: '140px'}} colSpan={5}><br/>Brak wyników, spróbuj zmienić filtry lub dodaj taką miejscowość.<br/></td></tr>}
                </tbody>
                </table>
            </div>
            <div className="zarzadzanieMiastamiDodaj">
                <span>#</span>
                <select value={(filtryMiasta.gra != undefined) ? filtryMiasta.gra : -1} onChange={(e) => setFiltryMiasta({...filtryMiasta, gra: e.target.value})}>
                    <option value={-1}>Wybierz</option>
                    <option value={0}>ETS2</option>
                    <option value={1}>ATS</option>
                </select>
                <input type="text" placeholder="Wpisz kraj" value={filtryMiasta.kraj ? filtryMiasta.kraj : ""} onChange={(e) => setFiltryMiasta({...filtryMiasta, kraj: e.target.value})} />
                <input type="text" placeholder="Wpisz miejscowość" value={filtryMiasta.miejscowosc ? filtryMiasta.miejscowosc : ""} onChange={(e) => setFiltryMiasta({...filtryMiasta, miejscowosc: e.target.value})} />
                <button onClick={() => dodajMiasto()}>Dodaj</button>
            </div>
            <div className="zarzadzanieMiastamiFiltry">
                <div className="zarzadzanieMiastamiFiltr">
                    <button onClick={() => setMiasta({...miasta, open: !miasta.open})}>Zamknij</button>
                </div>
            </div>
            </>
        )
    };
    const dodajMiasto = () => {
        if(filtryMiasta.gra == -1) return;
        if(!filtryMiasta.kraj || !filtryMiasta.miejscowosc) return;
        const miasto = filtryMiasta.miejscowosc.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        const kraj = filtryMiasta.kraj.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        console.log(filtryMiasta.gra, kraj, miasto);
        Axios.post(gb.backendIP+"dodajMiasto/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {kraj: kraj, miasto: miasto, gra: filtryMiasta.gra}).then((r) => {
            if(!r.data['blad']){
                setFiltryMiasta({gra: -1, miejscowosc: miasto, kraj: ""});
                setMiasta({response: false, open: true});
            }
        }).catch((er) => console.log(er));
    };
    const usunMiasto = (ar) => {
        Axios.post(gb.backendIP+"usunMiasto/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {gra: ar[2], kraj: ar[0], miasto: ar[1], id: ar[3]}).then((r) => {
            if(!r.data['blad']){
                setFiltryMiasta({...filtryMiasta, gra: -1, kraj: ""});
                setMiasta({response: false, open: true});
            }
        }).catch((er) => console.log(er));
    };
    const wyswietlMiasta = () => {
        if(miasta.dane){
            tmpX = 0;
            return miasta.dane.map((miasto) => {
                if(miasto){
                    if((filtryMiasta.gra != -1) && (filtryMiasta.gra != miasto.gra)) return;
                    if((filtryMiasta.kraj != "") && !(miasto.kraj.toLowerCase().startsWith(filtryMiasta.kraj.toLowerCase()) )) return;
                    if((filtryMiasta.miejscowosc != "") && !(miasto.miasto.toLowerCase().startsWith(filtryMiasta.miejscowosc.toLowerCase()) )) return;
                    tmpX++;
                    return(
                        <tr key={`miejscowosc_${miasto.id}`}>
                            <td>{miasto.id}</td>
                            <td>{miasto.gra ? "ATS" : "ETS2"}</td>
                            <td>{ miasto.gra ?
                                <img className="flaga" src="/img/flagi/usa.png" /> : 
                                <img className="flaga" src={"/img/flagi/"+miasto.kraj.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"}/>
                                } {miasto.kraj}</td>
                            <td>{miasto.miasto}</td>
                            <td>
                                <a onClick={() => usunMiasto(miasto)}>Usuń</a>
                            </td>
                        </tr>
                    )
                }
            });
        } else {
            return(<tr><td colSpan={5}>Brak miejscowości w bazie danych...</td></tr>)
        }
    };

    const dostanPromy = () => {
        Axios.post(gb.backendIP+"promy").then((r) => {
            if(!r.data['blad']){
                setPromy({...promy, response: true, dane: r.data['dane']});
            } else {
                setPromy({response: true, open: false, dane: null, blad: "Wystąpił błąd"});
            }
        }).catch((er) => {
            console.log(er);
            setPromy({response: true, open: false, dane: null, blad: "Wystąpił błąd"});
        });
    };
    const zarzadzaniePromami = () => {
        return(
            <>
            <div className="zarzadzaniePromami">
                <table>
                <thead><tr><th>ID</th><th>Skąd</th><th>Dokąd</th><th>Akcja</th></tr></thead>
                <tbody>
                    { promy.response ? wyswietlPromy() : dostanPromy() }
                    { !tmpX && <tr><td style={{height: '140px'}} colSpan={4}><br/>Brak wyników, spróbuj zmienić filtry lub dodaj taki prom.<br/></td></tr>}
                </tbody>
                </table>
            </div>
            <div className="zarzadzaniePromamiDodaj">
                <select value={filtryPromy.jednokierunkowe ? filtryPromy.jednokierunkowe : 0} onChange={(e) => setFiltryPromy({...filtryPromy, jednokierunkowe: e.target.value})}>
                    <option value={0}>Obustronny</option>
                    <option value={1}>Jednostronny</option>
                </select>
                <input type="text" placeholder="Wpisz skąd" value={filtryPromy.skad ? filtryPromy.skad : ""} onChange={(e) => setFiltryPromy({...filtryPromy, skad: e.target.value})} />
                <input type="text" placeholder="Wpisz dokąd" value={filtryPromy.dokad ? filtryPromy.dokad : ""} onChange={(e) => setFiltryPromy({...filtryPromy, dokad: e.target.value})} />
                <button onClick={() => dodajProm()}>Dodaj</button>
            </div>
            <div className="zarzadzanieMiastamiFiltry">
                <div className="zarzadzanieMiastamiFiltr">
                    <button onClick={() => setPromy({...promy, open: !promy.open})}>Zamknij</button>
                </div>
            </div>
            </>
        )
    };
    const dodajProm = () => {
        if(!filtryPromy.skad || !filtryPromy.dokad) return;
        const skad = filtryPromy.skad.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        const dokad = filtryPromy.dokad.split(" ").map(a => a[0].toUpperCase()+a.substring(1)).join(" ");
        let cialko;
        if(filtryPromy.jednokierunkowe == 1){
            cialko = [[[skad, dokad].join(" - "), "x"]];
        } else {
            cialko = [[[skad, dokad].join(" - "), "x"], [[dokad, skad].join(" - "), "x"]];
        }
        Axios.post(gb.backendIP+"dodajProm/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {dodawane: cialko}).then((r) => {
            if(!r.data['blad']){
                setPromy({response: false, open: true});
            }
        }).catch((er) => console.log(er));
    };
    const usunProm = (ar) => {
        Axios.post(gb.backendIP+"usunProm/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {ktore: ar.id, nazwa: ar.nazwa}).then((r) => {
            if(!r.data['blad']){
                setPromy({response: false, open: true});
            }
        }).catch((er) => console.log(er));
    };
    const wyswietlPromy = () => {
        if(promy.dane){
            tmpX = 0;
            return promy.dane.map((prom, k) => {
                if(prom){
                    if(!prom.nazwa) return;
                    const podziel = prom.nazwa.split(" - ");
                    if(filtryPromy.jednokierunkowe == 1){
                        if((filtryPromy.skad != "") && !(podziel[0].toLowerCase().startsWith(filtryPromy.skad.toLowerCase()) )) return;
                        if((filtryPromy.dokad != "") && !(podziel[1].toLowerCase().startsWith(filtryPromy.dokad.toLowerCase()) )) return;
                    } else {
                        if((filtryPromy.skad != "") && !( podziel[0].toLowerCase().startsWith( filtryPromy.skad.toLowerCase() ) || podziel[1].toLowerCase().startsWith( filtryPromy.skad.toLowerCase() ))) return;
                        if((filtryPromy.dokad != "") && !( podziel[0].toLowerCase().startsWith( filtryPromy.dokad.toLowerCase() ) || podziel[1].toLowerCase().startsWith( filtryPromy.dokad.toLowerCase() ))) return;
                    }
                    tmpX++;
                    return(
                        <tr key={`prom_${prom.id}`}>
                            <td>{prom.id}</td>
                            <td>{podziel[0]}</td>
                            <td>{podziel[1]}</td>
                            <td>
                                <a onClick={() => usunProm(prom)}>Usuń</a>
                            </td>
                        </tr>
                    )
                }
            });
        } else {
            return(<tr><td colSpan={5}>Brak miejscowości w bazie danych...</td></tr>)
        }
    };

    const wyslijGlobalDC = () => {
        if(!ust.globalDC) return;
        Axios.post(gb.backendIP+"wiadomoscGlobalna/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {wiadomosc: ust.globalDC}).then((r) => {
            if(!r.data['blad']){
                setUst({...ust, globalDC: ""});
            }
        }).catch((er) => {
            console.log(er);
        })
    };

    const dostanKontoFirmowe = () => {
        Axios.post(gb.backendIP+"kontofirmowestan").then((r) => {
            if(r.data['blad']){
                console.log(r.data['blad']);
                setStanKontaFirmowego({response: true, suma: 0});
            } else {
                setStanKontaFirmowego({response: true, suma: r.data['odp']});
            }
        }).catch((er) => {
            console.log(er);
            setStanKontaFirmowego({response: true, suma: 0});
        });
    }

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    { miasta.open ? zarzadzanieMiastami() : ""}
                    { promy.open ? zarzadzaniePromami() : ""}
                    { ust.response ?
                    <>
                    <div className="ustawieniaMain">
                        <div className="ustawieniaKol">
                            <h2>Wiadomość powitalna</h2>
                            <span>Górny tekst na stronie głównej:</span>
                            <textarea placeholder="Ustaw wiadomość, która będzie wyświetlać się na stronie głównej Systemu." value={ust.msg} onChange={(e) => setUst({...ust, msg: e.target.value})} />
                            <button onClick={() => ustawMsg()}>Ustaw</button>
                        </div>
                        <div className="ustawieniaKol"><div className="slupeczek" /></div>
                        <div className="ustawieniaKol">
                            <h2>Dodawanie pieniędzy</h2>
                            <div style={{display: 'flex', gap: '20px'}}>
                                <div style={{width: '130px'}}>
                                    <span>Użytkownik:</span>
                                    <select value={ust.wybranyUzytkownik ? ust.wybranyUzytkownik : ""} onChange={(e) => setUst({...ust, wybranyUzytkownik: e.target.value})}>
                                        <option value={null}>Wybierz</option>
                                        { ust.uzytkownicy.map((user) => {
                                            return <option key={`user_${user.id}`} value={user.id}>{user.login}</option>
                                        })}
                                    </select>
                                </div>
                                <div style={{width: '100px'}}>
                                    <span>Kwota:</span>
                                    <input type="number" value={ust.kwotaDod ? ust.kwotaDod : ''} step={0.01} placeholder={0.12} onChange={(e) => setUst({...ust, kwotaDod: e.target.value})}/>
                                </div>
                                <div>
                                    <span>Konto firmy:</span><br/><br/>
                                    <span style={{textAlign: 'right', width: '100%', display: 'block'}}><b>{stanKontaFirmowego.response ? stanKontaFirmowego.suma.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) : dostanKontoFirmowe() }</b></span>
                                </div>
                            </div>
                            <div>
                                <span>Powód:</span>
                                <textarea placeholder="Podaj powód tej operacji. (opcjonalnie)" value={ust.powodDod ? ust.powodDod : ''} onChange={(e) => setUst({...ust, powodDod: e.target.value})} />
                            </div>
                            <button onClick={() => dodajKwote()}>Dodaj</button>
                        </div>
                        <div className="ustawieniaKol"><div className="slupeczek" /></div>
                        <div className="ustawieniaKol">
                            <h2>Limit KM</h2>
                            <div>
                                <span>Wartość:</span>
                                <input type="number" step={1} value={ust.limitkm} onChange={(e) => setUst({...ust, limitkm: e.target.value})}/>
                            </div>
                            <button onClick={() => ustawLimit()}>Ustaw</button>
                        </div>
                    </div>
                    <div style={{width: '90%', height: '1px', background: '#444444', margin: '-10px auto'}}/>
                    <div className="ustawieniaMain">
                       <div className="ustawieniaKol">
                            <h2>Wiadomość Discord</h2>
                            <span>Treść:</span>
                            <textarea value={ust.globalDC ? ust.globalDC : ""} onChange={(e) => setUst({...ust, globalDC: e.target.value})} placeholder="Jest to wiadomość globalna. Treść otrzyma każdy użytkownik systemu który ma połączone konto Discord."/>
                            <button onClick={() => wyslijGlobalDC()}>Wyślij</button>
                        </div>
                        <div className="ustawieniaKol"><div className="slupeczek" /></div>
                        <div className="ustawieniaKol" style={{justifyContent: 'space-evenly'}}>
                            <h2>Miejscowości i Promy</h2>
                            <span style={{fontStyle: 'italic', textAlign: 'center'}}>Aby otworzyć zarządzanie<br/> miejscowościami lub promami<br/>kliknij w poniższy przycisk.</span>
                            <div style={{display: 'flex', justifyContent: 'space-around'}}>
                                <button style={{width: 'fit-content'}} onClick={() => setMiasta({...miasta, open: !miasta.open})}>Miejscowości</button>
                                <button style={{width: 'fit-content'}} onClick={() => setPromy({...promy, open: !promy.open})}>Promy</button>
                            </div>
                        </div>
                        <div className="ustawieniaKol"><div className="slupeczek" /></div>
                        <div className="ustawieniaKol">
                            <h2>Winiety</h2>
                            <div>
                                <span>Kraj:</span>
                                <select value={ustawWiniete.ktora ? ustawWiniete.ktora : ""} onChange={(e) => setUstawWiniete({...ustawWiniete, ktora: e.target.value, cena: winiety.dane.find(a => a.id == e.target.value).cena, kraj: winiety.dane.find(a => a.id == e.target.value).kraj})}>
                                    <option value={null}>Wybierz</option>
                                    { winiety.response ? pokazWiniety() : dostanWiniety() }
                                </select>
                            </div>
                            <div>
                                <span>Cena:</span>
                                <input type="number" step="0.01" value={ustawWiniete.cena ? ustawWiniete.cena : ""} onChange={(e) => setUstawWiniete({...ustawWiniete, cena: e.target.value})} placeholder="0,00 zł"/>
                            </div>
                            <button onClick={() => ustawCeneWiniety() }>Ustaw</button>
                        </div>
                    </div>
                    </>
                    : initUstawienia() }
                </div>
            </div>
        </>
    );
};