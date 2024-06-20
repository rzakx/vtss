import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function UprawnieniaOld(props){
    const [ kontoFirmowe, setKontoFirmowe ] = useState({response: false, suma: 0});
    const [historiaF, setHistoriaF] = useState({response: null, dane: null});
    const [historia, setHistoria] = useState({response: null, dane: null, usuwane: false});
    const [nazwyupr, setNazwyupr] = useState({response: null, dane: null});
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false});
    const [ dodawane, setDodawane ] = useState({kto: null, naco: null, odkiedy: new Date(), dokiedy: null, cena: null, gra: null, ktoPlaci: null});

    const dostanHistorie = () => {
        Axios.post(gb.backendIP+"uprHistoria").then((r) => {
            Axios.post(gb.backendIP+"uprHistoriaFirmowe").then((rf) => {
                Axios.post(gb.backendIP+"listaUzytkownikow").then((r2) => {
                    Axios.post(gb.backendIP+"uprawnienia").then((r3) => {
                        setUzytkownicy({dane: r2.data, response: true});
                        setHistoria({response: true, dane: r.data['dane'], usuwane: null});
                        setHistoriaF({response: true, dane: rf.data['dane']});
                        setNazwyupr({response: true, dane: r3.data});
                    });
                });
            });
        });
    };

    const dostanStanFirmy = () => {
        Axios.post(gb.backendIP+"kontofirmowestan").then((r) => {
            if(r.data['blad']){
                console.log(r.data['blad']);
                setKontoFirmowe({response: true, suma: 0});
            } else {
                setKontoFirmowe({response: true, suma: r.data['odp']});
            }
        }).catch((er) => {
            console.log(er);
            setKontoFirmowe({response: true, suma: 0});
        });
    };

    const usunUpr = (id, potwierdzone) => {
        if(potwierdzone){
            Axios.post(gb.backendIP+"usunUpr/"+id+"/"+localStorage.getItem("login")).then((r) => {
                if(r.data['odp'] == "usunieto"){
                    setHistoria({...historia, response: null, usuwane: null});
                    setKontoFirmowe({response: false, suma: 0});
                }
            });
        } else {
            setHistoria({...historia, usuwane: id});
        }
    };

    const nadajUpr = () => {
        if(dodawane.kto && dodawane.naco && dodawane.dokiedy && dodawane.cena && (dodawane.ktoPlaci !== null)){
            Axios.post(gb.backendIP+"dodajUpr/"+localStorage.getItem('token'), {
                kto: dodawane.kto,
                cena: dodawane.cena,
                dokiedy: dodawane.dokiedy,
                naco: dodawane.naco,
                gra: dodawane.gra,
                ktoplaci: dodawane.ktoPlaci
            }).then((res) => {
                if(res.data['odp'] == "ok"){
                    setDodawane({kto: null, naco: null, odkiedy: new Date(), dokiedy: null, cena: null, gra: null, ktoPlaci: null});
                    setHistoria({response: null, dane: null, usuwane: false});
                    setKontoFirmowe({response: false, suma: 0});
                }
            });
        }
        console.log(dodawane);
    };

    const wyswietlHistorie = () => {
        return(
            <table className="ostatnieTrasy uprTable wejscieSmooth">
                { historia.usuwane && <div className="overlay zabluruj" />}
                <tbody>
                    <tr><th>ID</th><th>Posiadacz</th><th>Gra</th><th>Uprawnienie</th><th>Cena</th><th>Nadane</th><th>Ważność</th><th>Akcja</th></tr>
                    { historia.dane.map((wiersz) => {
                        const nazwaUpr = nazwyupr.dane.find(upr => upr.id === wiersz.naco);
                        const kierowca = uzytkownicy.dane.find(user => user.id === wiersz.kto).login;
                        let zaplacone = "K: "+wiersz.cena.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'});
                        if(historiaF.dane){
                            const czyFirmaZaplacila = historiaF.dane.find(w => w.opis.split(" ")[1] == wiersz.id);
                            if(czyFirmaZaplacila){
                                console.log(czyFirmaZaplacila);
                                zaplacone = "F: "+((-1*parseFloat(czyFirmaZaplacila.suma)).toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'}));
                            }
                        }
                        return(
                            <tr>
                                <td>{wiersz.id}</td>
                                <td><a href={"/profil/"+kierowca}><img className="ktoOddal" src={"/img/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).awatar} />{kierowca}</a></td>
                                <td>{wiersz.gra ? "ATS" : "ETS2"}</td>
                                <td>{nazwaUpr.nazwa ? `${nazwaUpr.nazwa} ${nazwaUpr.rodzaj}` : "???"}</td>
                                <td>{zaplacone}</td>
                                <td>{new Date(wiersz.odkiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                                <td>{new Date(wiersz.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                                <td><a onClick={() => { usunUpr(wiersz.id, false); setHistoria({...historia, usuwane: wiersz.id}); }}>Usuń</a></td>
                            </tr>
                        )
                    })}
                    <tr>
                        <td>#</td>
                        <td><select value={dodawane.kto ? dodawane.kto : null} onChange={(e) => setDodawane({...dodawane, kto: e.target.value})}>
                            <option value={null}>Kierowca</option>
                            {uzytkownicy.dane.map((user) => {
                                return(
                                    <option value={user.id}>{user.login}</option>
                                )
                            })}    
                        </select></td>
                        <td>
                            <select value={dodawane.gra ? dodawane.gra : null} onChange={(e) => setDodawane({...dodawane, gra: e.target.value})}>
                                <option value={null}>Gra</option>
                                <option value={0}>ETS2</option>
                                <option value={1}>ATS</option>
                            </select>
                        </td>
                        <td>
                            { ((dodawane.gra == 0) || (dodawane.gra == 1)) ?
                            <select className="uprWybierane" value={dodawane.naco ? dodawane.naco : null} onChange={(e) => setDodawane({...dodawane, naco: e.target.value})}>
                                <option value={null}>Uprawnienie</option>
                                <optgroup label="Licencje">
                                    {nazwyupr.dane.map((upr) => {
                                        if((upr.gra == dodawane.gra) && (upr.rodzaj == 'Licencja')) {
                                            return <option value={upr.id}>{upr.nazwa}</option>
                                        }
                                    })}
                                </optgroup>
                                <optgroup label="Szkolenia">
                                    {nazwyupr.dane.map((upr) => {
                                        if((upr.gra == dodawane.gra) && (upr.rodzaj == 'Szkolenie')) {
                                            return <option value={upr.id}>{upr.nazwa}</option>
                                        }
                                    })}
                                </optgroup>
                            </select>
                            : "Wybierz grę"
                            }
                        </td>
                        <td><input type="number" step="0.01" value={dodawane.cena ? dodawane.cena : null} placeholder="0,00 zł" onChange={(e) => setDodawane({...dodawane, cena: e.target.value})} /></td>
                        <td>
                            <select value={dodawane.ktoPlaci ? dodawane.ktoPlaci : null} onChange={(e) => setDodawane({...dodawane, ktoPlaci: e.target.value})}>
                                <option value={null}>Kto płaci?</option>
                                <option value={0}>Kierowca</option>
                                <option value={1}>Firma</option>
                            </select>
                        </td>
                        <td><input type="date" value={dodawane.dokiedy ? dodawane.dokiedy : null} onChange={(e) => setDodawane({...dodawane, dokiedy: e.target.value})} /></td>
                        <td><a onClick={ nadajUpr }>Dodaj</a></td>
                    </tr>
                </tbody>
            </table>
        )
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    <div className="uprStanKontaFirmy">
                        <span>Stan konta firmy:</span>
                        <span><b>{kontoFirmowe.response ? kontoFirmowe.suma.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'}) : dostanStanFirmy()}</b></span>
                    </div>
                    { historia.response ? (historia.dane ? wyswietlHistorie() : <span>Brak danych</span>) : dostanHistorie()}    
                </div>
                { historia.usuwane ?
                    <div className="komunikat wejscieSmooth">
                        Czy napewno chcesz usunąć uprawnienie {historia.usuwane}?
                        <div>
                            <a onClick={() => usunUpr(historia.usuwane, true)}>Tak</a>
                            <a onClick={() => setHistoria({...historia, usuwane: null})}>Nie</a>
                        </div>
                    </div>
                    : "" }
            </div>
            
        </>
    );
}