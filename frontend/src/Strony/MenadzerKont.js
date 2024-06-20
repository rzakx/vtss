import Nawigacja from "../Komponenty/Nawigacja";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FaUserCheck, FaUserTimes, FaUserClock, FaRedoAlt } from "react-icons/fa";
export default function MenadzerKont(props){
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false, zarzadzaj: false, wniosek: false, typWniosku: null});
    const [ podwyzki, setPodwyzki ] = useState({response: false, dane: null});
    const [ urlopy, setUrlopy ] = useState({response: false, dane: null});
    const [ zmianyProfil, setZmianyProfil ] = useState(null);
    const [ rangi, setRangi ] = useState({response: false, dane: null});
    const [ stanowiska, setStanowiska ] = useState({response: false, dane: null});
    const [ usunAwatar, setUsunAwatar ] = useState(0);
    const { kontoID } = useParams();

    const obejscieTlo = (c) => { return {backgroundImage: `url('${c}')`}};
    
    const zaktualizujProfil = (idosoby) => {
        console.log(idosoby, zmianyProfil);
        const k = new Date(zmianyProfil.datadolaczenia);
        k.setHours(k.getHours() + 2);
        const czas = k.toISOString().slice(0, 19).replace("T", " ");
        Axios.post(gb.backendIP+"/administrujProfil/"+localStorage.getItem('token'), {
            idosoby: idosoby,
            login: zmianyProfil.login,
            stawka: zmianyProfil.stawka,
            garaz: zmianyProfil.garaz,
            truck: zmianyProfil.truck,
            typkonta: zmianyProfil.typkonta,
            stanowisko: zmianyProfil.stanowisko,
            steam: zmianyProfil.steam,
            truckbook: zmianyProfil.truckbook,
            truckersmp: zmianyProfil.truckersmp,
            worldoftrucks: zmianyProfil.worldoftrucks,
            discord: zmianyProfil.discord,
            email: zmianyProfil.email,
            datadolaczenia: czas
        }).then((r) => {
            console.log(r.data);
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
            setZmianyProfil(null);
        }).catch(() => {
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
            setZmianyProfil(null);
        });
    };

    const potwierdzenieUsuwania = (idosoby) => {
        console.log("Usuwam profil", zmianyProfil.login);
        Axios.post(gb.backendIP+"/usunKonto/"+localStorage.getItem('token'), {idosoby: idosoby}).then((r) => {
            console.log(r.data)
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
        }).catch(() => setUzytkownicy({response: false, zarzadzaj: false, wniosek: false}));
    };

    const zarzadzajKontem = (idtypa) => {
        return(
            <div className="administrowanieKonta wejscieSmooth">
                <div className="menadzerRozpatrzTytul"><span style={{color: 'dodgerblue'}}>Zarządzanie Kontem</span></div>
                <div className="administrowanieKol">
                    <span>Awatar:</span>
                    <div className="administrowanieKontaAwatar" style={obejscieTlo('/img/'+zmianyProfil.awatar)} />
                    <button className="admAwatar" onClick={() => setUsunAwatar(1)}>Usuń awatar</button>
                    {usunAwatar ? <div style={{marginTop:"-5px", gap: '5px', display: 'flex'}}>
                        <button className="admAwatar" style={{background: '#b8860b', flexGrow: 1}} onClick={() => setUsunAwatar(0)}>Anuluj</button>
                        <button className="admAwatar" style={{background: '#dc143c', flexGrow: 1}} onClick={() => {
                            let gagatki = [...uzytkownicy.dane];
                            let glupieID;
                            gagatki.find((tmp, k) => {
                                if(tmp.id === idtypa){
                                    glupieID = k;
                                }
                            });
                            gagatki[glupieID]['awatar'] = "awatary/default.png";
                            Axios.post(gb.backendIP+"adminUsunAwatar/"+localStorage.getItem("login")+"/"+zmianyProfil.id, {staryAwatar: zmianyProfil.awatar});
                            setZmianyProfil({...zmianyProfil, awatar: "awatary/default.png"});
                            setUsunAwatar(0);
                            setUzytkownicy({...uzytkownicy, dane: gagatki});
                        }}>Potwierdź</button>
                    </div> : ""}
                </div>
                <div className="administrowanieKol">
                   <div>
                        <span>Login:</span>
                        <input type="text" value={zmianyProfil.login} onChange={(e) => setZmianyProfil({...zmianyProfil, login: e.target.value})}/>
                    </div>
                    <div>
                        <span>Dołączył dnia:</span>
                        <input type="datetime-local" value={zmianyProfil.datadolaczenia} onChange={(e) => setZmianyProfil({...zmianyProfil, datadolaczenia: e.target.value})}/>
                    </div>
                    <div>
                        <span>Typ konta:</span>
                        <select value={zmianyProfil.typkonta} onChange={(e) => setZmianyProfil({...zmianyProfil, typkonta: e.target.value})}>
                            {rangi.dane.map((ranga, idr) => {
                                if(ranga) return <option key={`typkonta_${idr}`} value={idr}>{ranga}</option>
                            })}
                        </select>
                    </div>
                    <div>
                        <span>Stanowisko:</span>
                        <select value={zmianyProfil.stanowisko} onChange={(e) => setZmianyProfil({...zmianyProfil, stanowisko: e.target.value})}>
                            {stanowiska.dane.map((stanowisko, idr) => {
                                if(stanowisko) return <option key={`stanowisko_${idr}`} value={idr}>{stanowisko}</option>
                            })}
                        </select>
                    </div>
                    <div>
                        <span>Stawka za km:</span>
                        <input type="number" step={0.01} value={zmianyProfil.stawka} min={0} onChange={(e) => setZmianyProfil({...zmianyProfil, stawka: e.target.value})}/>
                    </div>
                </div>
                <div className="administrowanieKol">
                    <div>
                        <span>Garaż:</span>
                        <input type="text" value={zmianyProfil.garaz} onChange={(e) => setZmianyProfil({...zmianyProfil, garaz: e.target.value})} />
                    </div>
                    <div>
                        <span>Pojazd:</span>
                        <input type="text" value={zmianyProfil.truck} onChange={(e) => setZmianyProfil({...zmianyProfil, truck: e.target.value})} />
                    </div>
                    <div>
                        <span>Discord ID:</span>
                        <input type="number" step={1} value={zmianyProfil.discord} onChange={(e) => setZmianyProfil({...zmianyProfil, discord: e.target.value})} />
                    </div>
                    <div>
                        <span>E-mail:</span>
                        <input type="text" value={zmianyProfil.email} onChange={(e) => setZmianyProfil({...zmianyProfil, email: e.target.value})} />
                    </div>
                    <div>
                        <span>Steam:</span>
                        <input type="url" value={zmianyProfil.steam} onChange={(e) => setZmianyProfil({...zmianyProfil, steam: e.target.value})} />
                    </div>
                </div>
                <div className="administrowanieKol">
                    <div>
                        <span>TruckBook:</span>
                        <input type="url" value={zmianyProfil.truckbook} onChange={(e) => setZmianyProfil({...zmianyProfil, truckbook: e.target.value})} />
                    </div>
                    <div>
                        <span>TruckersMP:</span>
                        <input type="url" value={zmianyProfil.truckersmp} onChange={(e) => setZmianyProfil({...zmianyProfil, truckersmp: e.target.value})} />
                    </div>
                    <div>
                        <span>World of Trucks:</span>
                        <input type="url" value={zmianyProfil.worldoftrucks} onChange={(e) => setZmianyProfil({...zmianyProfil, worldoftrucks: e.target.value})} />
                    </div>
                </div>
                <div className="administrowanieOpcje">
                    <button onClick={() => { setZmianyProfil(null); setUzytkownicy({...uzytkownicy, zarzadzaj: false})}}>Anuluj</button>
                    <button onClick={() => setZmianyProfil({...zmianyProfil, usuwanie: true})}>Usuń konto</button>
                    <button onClick={() => zaktualizujProfil(idtypa)}>Zapisz zmiany</button>
                </div>
                {zmianyProfil.usuwanie && <div className="potwierdzenieUsuwania wejscieSmooth">
                    <span>Czy napewno chcesz usunąć konto <b>{zmianyProfil.login}</b>?</span>
                    <div>
                        <button onClick={() => setZmianyProfil({...zmianyProfil, usuwanie: false})}>Anuluj</button><button onClick={() => potwierdzenieUsuwania(idtypa)}>Potwierdź</button>
                    </div>
                </div>
                }
            </div>
        )
    };

    const dostanDane = (idtypa) => {
        const daneU = uzytkownicy.dane.filter(u => u.id === idtypa)[0];
        setZmianyProfil({...daneU});
    };

    const dostanPodwyzki = () => {
        Axios.post(gb.backendIP+"listaPodwyzek").then((r) => {
            setPodwyzki({dane: r.data, response: true});
        });
    };

    const dostanUrlopy = () => {
        Axios.post(gb.backendIP+"listaUrlopow").then((r) => {
            setUrlopy({dane: r.data, response: true});
        });
    };

    const dostanKonta = () => {
        //i rangi
        Axios.post(gb.backendIP+"listaUzytkownikow").then((r2) => {
            Axios.post(gb.backendIP+"rangi").then((r3) => {
                Axios.post(gb.backendIP+"stanowiska").then((r4) => {
                    setUzytkownicy({dane: r2.data, response: true});
                    setRangi({dane: r3.data['dane'], response: true});
                    setStanowiska({dane: r4.data['dane'], response: true});
                });
            });
        });
    };

    const wniosekDecyzja = (idwniosku, czyAkcept, czyUrlop) => {
        if(czyAkcept) {
            if(czyUrlop){
                Axios.post(gb.backendIP+"urlopAkcept/"+localStorage.getItem('token'), {
                    idwniosku: idwniosku
                }).then((r) => {
                    console.log(r.data);
                });
            } else {
                Axios.post(gb.backendIP+"podwyzkaAkcept/"+localStorage.getItem('token'), {
                    idwniosku: idwniosku,
                    idwnioskujacego: podwyzki.dane.find(p => p.id === idwniosku).ktozlozyl,
                    stawka: podwyzki.dane.find(p => p.id === idwniosku).nowastawka,
                    rangi: podwyzki.dane.find(p => p.id === idwniosku).nowestanowisko
                }).then((r) => {
                    console.log(r.data);
                });
            }
        } else {
            if(czyUrlop){
                Axios.post(gb.backendIP+"urlopOdrzuc/"+localStorage.getItem('token'), {
                    idwniosku: idwniosku
                }).then((r) => {
                    console.log(r.data);
                });
            } else {
                Axios.post(gb.backendIP+"podwyzkaOdrzuc/"+localStorage.getItem('token'), {
                    idwniosku: idwniosku,
                    powod: uzytkownicy.wniosekpowod
                }).then((r) => {
                    console.log(r.data);
                });
            }
        }
        setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
        setPodwyzki({response: false, dane: null});
        setUrlopy({response: false, dane: null});
    }

    const rozpatrzPodwyzke = (idosoby) => {
        const info = podwyzki.dane.find(tmp => tmp.ktozlozyl === idosoby);
        console.log(info);
        const aktStanowisko = uzytkownicy.dane.find(u => u.id === info.ktozlozyl).stanowisko;
        const aktstanowiskoN = stanowiska.dane[aktStanowisko] + " (" + aktStanowisko + ")";
        const nowestanowisko = stanowiska.dane[info.nowestanowisko] + " (" + info.nowestanowisko + ")";
        return(
            <div className="administrowanieKonta wejscieSmooth">
                <div className="menadzerRozpatrzTytul"><span style={{color: 'goldenrod'}}>Rozpatrzenie Podwyżki</span></div>
                <div className="administrowanieKol">
                    <div>
                        <span>ID wniosku: <b>{info.id}</b></span>
                    </div>
                    <div>
                        <span>Wnioskujący:</span>
                        <input type="text" value={uzytkownicy.dane.find(u => u.id === info.ktozlozyl).login} disabled/>
                    </div>
                    <div>
                        <span>Data złożenia:</span>
                        <input type="text" value={new Date(info.kiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} disabled />
                    </div>
                    <div>
                        <span>Aktualne stanowisko:</span>
                        <input type="text" value={aktstanowiskoN} disabled />
                    </div>
                    <div>
                        <span>Aktualna stawka:</span>
                        <input type="text" value={info.aktstawka.toFixed(2)+" zł/km"} disabled />
                    </div>
                </div>
                <div className="administrowanieKol">
                    <div>
                        <span>Wnioskowane stanowisko:</span>
                        <input type="text" value={nowestanowisko} disabled />
                    </div>
                    <div>
                        <span>Wnioskowana stawka:</span>
                        <input type="text" value={info.nowastawka.toFixed(2)+" zł/km"} disabled />
                    </div>
                    <div>
                        <span>Powód:</span><br />
                        <textarea value={info.powod} disabled/>
                    </div>
                </div>
                <div className="administrowanieOpcje">
                    <button onClick={() => { setUzytkownicy({...uzytkownicy, wniosek: false})}}>Cofnij</button>
                    <button onClick={() => setUzytkownicy({...uzytkownicy, wniosekodrzuc: true})}>Odrzuć</button>
                    <button onClick={() => wniosekDecyzja(info.id, true, false)}>Zaakceptuj</button>
                </div>
                {uzytkownicy.wniosekodrzuc && <div className="potwierdzenieUsuwania wejscieSmooth">
                    <span>Podaj powód odrzucenia wniosku.</span>
                    <textarea value={uzytkownicy.wniosekpowod} onChange={(e) => setUzytkownicy({...uzytkownicy, wniosekpowod: e.target.value})} />
                    <div>
                        <button onClick={() => setUzytkownicy({...uzytkownicy, wniosekodrzuc: false})}>Anuluj</button><button onClick={() => wniosekDecyzja(info.id, false)}>Odrzuć wniosek</button>
                    </div>
                </div>
                }
            </div>
        );
    };

    const rozpatrzUrlop = (idosoby) => {
        const info = urlopy.dane.find(tmp => tmp.kto === idosoby);
        console.log(info);
        return(
            <div className="administrowanieKonta wejscieSmooth">
                <div className="menadzerRozpatrzTytul"><span style={{color: 'crimson'}}>Rozpatrzenie Urlopu</span></div>
                <div className="administrowanieKol">
                    <div>
                        <span>ID wniosku: <b>{info.id}</b></span>
                    </div>
                    <div>
                        <span>Wnioskujący:</span>
                        <input type="text" value={uzytkownicy.dane.find(u => u.id === info.kto).login} disabled/>
                    </div>
                    <div>
                        <span>Od kiedy:</span>
                        <input type="text" value={new Date(info.odkiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} disabled />
                    </div>
                    <div>
                        <span>Do kiedy:</span>
                        <input type="text" value={new Date(info.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})} disabled />
                    </div>
                </div>
                <div className="administrowanieKol">
                    <div>
                        <span>Powód:</span><br />
                        <textarea style={{height: '210px', width: '500px'}} value={info.komentarz} disabled/>
                    </div>
                </div>
                <div className="administrowanieOpcje">
                    <button onClick={() => { setUzytkownicy({...uzytkownicy, wniosek: false})}}>Cofnij</button>
                    <button onClick={() => setUzytkownicy({...uzytkownicy, wniosekodrzuc: true})}>Odrzuć</button>
                    <button onClick={() => wniosekDecyzja(info.id, true, true)}>Zaakceptuj</button>
                </div>
                {uzytkownicy.wniosekodrzuc && <div className="potwierdzenieUsuwania wejscieSmooth">
                    <span>Czy napewno chcesz odrzucić wniosek o Urlop?</span>
                    <div>
                        <button onClick={() => setUzytkownicy({...uzytkownicy, wniosekodrzuc: false})}>Anuluj</button><button onClick={() => wniosekDecyzja(info.id, false, true)}>Odrzuć wniosek</button>
                    </div>
                </div>
                }
            </div>
        );
    };

    const zwrocKonta = () => {
        return (
            <>
                <table className="ostatnieTrasy wejscieSmooth zarzadzanieKontami">
                <tbody>
                    <tr><th>#</th><th>Kierowca</th><th>Dołączył</th><th>Typ konta</th><th>Stanowisko</th><th>Stawka</th><th>Akcja</th></tr>
                    { uzytkownicy.dane ? uzytkownicy.dane.map((user) => {
                        return (
                            <tr key={"user_" + user.id}>
                                <td>{user.id}</td>
                                <td>
                                    <Link to={"../profil/"+user.login}>
                                        <img className="ktoOddal" src={"/img/" + user.awatar} /> 
                                        {user.login}
                                    </Link>
                                </td>
                                <td>{new Date(user.datadolaczenia).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</td>
                                <td>{user.ranga}</td>
                                <td>{user.stanowiskoNazwa}</td>
                                <td>{user.stawka.toFixed(2)} zł / km</td>
                                <td className="ostatniaKolumnaKonta">
                                    <a onClick={() => { setUzytkownicy({...uzytkownicy, zarzadzaj: user.id}) }}>Zarządzaj</a>
                                    {podwyzki.dane && (podwyzki.dane.find(tmp => tmp.ktozlozyl === user.id) && <><br /><a className="menadzerOdnosnikPodwyzka" onClick={() => setUzytkownicy({...uzytkownicy, wniosek: user.id, typWniosku: "podwyzka"})}>Podwyżka</a></>)}
                                    {urlopy.dane && (urlopy.dane.find(tmp => tmp.kto === user.id) && <><br /><a className="menadzerOdnosnikUrlop" onClick={() => setUzytkownicy({...uzytkownicy, wniosek: user.id, typWniosku: "urlop"})}>Urlop</a></>)}
                                </td>
                            </tr>
                        );
                    }): ""}
                </tbody>
                </table>
                {!podwyzki.response && dostanPodwyzki() }
                {!urlopy.response && dostanUrlopy() }
            </>
        );
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    <div className="przegladajTrasy przegladajUzytkownikow" style={{minHeight: '500px'}}>
                        {uzytkownicy.response ? zwrocKonta() : dostanKonta() }
                    </div>
                    { uzytkownicy.zarzadzaj && (zmianyProfil ? zarzadzajKontem(uzytkownicy.zarzadzaj) : dostanDane(uzytkownicy.zarzadzaj)) }
                    { uzytkownicy.wniosek && (uzytkownicy.typWniosku === "podwyzka") && rozpatrzPodwyzke(uzytkownicy.wniosek) }
                    { uzytkownicy.wniosek && (uzytkownicy.typWniosku === "urlop") && rozpatrzUrlop(uzytkownicy.wniosek) }
                </div>
            </div>
        </>
    );
}