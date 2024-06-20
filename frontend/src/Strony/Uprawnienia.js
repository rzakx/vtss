import Nawigacja from "../Komponenty/Nawigacja";
import { useState, useEffect } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
import { BsPersonLinesFill, BsBuildingsFill } from "react-icons/bs";

export default function Uprawnienia(props){
    const [ kontoFirmowe, setKontoFirmowe ] = useState({response: false, suma: 0});
    const [historiaF, setHistoriaF] = useState({response: null, dane: null});
    const [historia, setHistoria] = useState({response: null, dane: null, usuwane: false});
    const [nazwyupr, setNazwyupr] = useState({response: null, dane: null});
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false});
    const [ dodawane, setDodawane ] = useState({gra: undefined});
	const [ zakladka, setZakladka ] = useState("nadawanie");
	const [ nadawane, setNadawane ] = useState({kierowca: undefined, kierowcaId: undefined, uprawnienia: [], pokrywajacy: undefined });
	const [ rozwijane, setRozwijane ] = useState({kierowca: false, pokrywajacy: false, gra: false});

    const podobne = [
        {
            'n': "Chłodnia",
            'e': 9,
            'a': 57
        },
        {
            'n': "Cysterna/Cement",
            'e': 13,
            'a': 65
        },
        {
            'n': "Do przewozu bydła",
            'e': 43,
            'a': 71
        },
        {
            'n': "Firanka/Furgon/Izoterma/Plandeka",
            'e': 5,
            'a': 53
        },
        {
            'n': "Kłonicowa",
            'e': 7,
            'a': 67
        },
        {
            'n': "Lora",
            'e': 19,
            'a': 73
        },
        {
            'n': "Niskopodwoziowa",
            'e': 15,
            'a': 69
        },
        {
            'n': "Platforma",
            'e': 21,
            'a': 61
        },
        {
            'n': "Podkontenerowa",
            'e': 11,
            'a': 59
        },
        {
            'n': "Wywrotka",
            'e': 46,
            'a': 63
        },
    ];

    useEffect(() => {
        if(dodawane.blad){
            const bladInter = setTimeout(() => setDodawane({...dodawane, blad: null}), 2500);
            return () => clearTimeout(bladInter);
        }
    }, [dodawane]);

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
            Axios.post(gb.backendIP+"usunUprNowe/"+id+"/"+localStorage.getItem("login")).then((r) => {
                if(r.data['odp'] == "usunieto"){
                    setHistoria({...historia, response: null, usuwane: null});
                    setKontoFirmowe({response: false, suma: 0});
                }
            });
        } else {
            setHistoria({...historia, usuwane: id});
        }
    };

    const nadajUprawnienia = () => {
        if(!nadawane.kierowca){
            setNadawane({...nadawane, blad: "Wybierz kierowcę!"});
            console.log("Nie wybrano kierowcy!");
            return;
        }
        if(nadawane.pokrywajacy === undefined){
            setNadawane({...nadawane, blad: "Wybierz pokrywającego!"});
            console.log("Nie wybrano pokrywającego!");
            return;
        }
        if(!nadawane.uprawnienia.length) {
            setNadawane({...nadawane, blad: "Koszyk jest pusty!"});
            console.log("Koszyk jest pusty");
            return;
        }
        if(sumaKoszta() > 0 && nadawane.pokrywajacy == 1){
            if(sumaKoszta() > parseFloat(kontoFirmowe.suma)) {
                setNadawane({...nadawane, blad: "Przekroczony budżet konta firmowego!"});
                console.log("Przekroczony budżet konta firmowego!");
                return;
            }
        }
        console.log(nadawane);
        Axios.post(gb.backendIP+"nadajUpr/"+localStorage.getItem('token'), {
            komu: nadawane.kierowcaId,
            komuDc: uzytkownicy.dane.find(x => x.id == nadawane.kierowcaId) ? uzytkownicy.dane.find(x => x.id == nadawane.kierowcaId).discord : null,
            komuLogin: nadawane.kierowca,
            uprawnienia: nadawane.uprawnienia,
            pokrywajacy: nadawane.pokrywajacy
        }).then((r) => {
            if(r.data['odp']){
                //gites
                setNadawane({odp: "Pomyślnie nadano!", kierowca: undefined, kierowcaId: undefined, uprawnienia: [], pokrywajacy: undefined });
                setDodawane({gra: undefined});
                setHistoria({response: null, dane: null, usuwane: false});
                setKontoFirmowe({response: false, suma: 0});
            } else {
                // zle
                setNadawane({...nadawane, blad: r.data['blad'] || "Wystąpił nieznany błąd!"});
            }
        }).catch((er) => {
            console.log(er.message);
            setNadawane({...nadawane, blad: er.message});
        });
    };

	const sumaKoszta = () => {
		let koszta = 0;
		nadawane.uprawnienia.map((x) => koszta += parseFloat(x.koszt));
		return koszta;
	};

    const znajdzOdpowiednik = (gra, xid) => {
        if(gra) return podobne.find(x => x.a == xid) ? podobne.find(x => x.a == xid).e : -1;
        else return podobne.find(x => x.e == xid) ? podobne.find(x => x.e == xid).a : -1;
    };

    const dodajKoszyk = () => {
        let tmpDodawane = {...dodawane};
        if(tmpDodawane.gra === undefined){
            console.log("Nie wybrałeś gry.");
            setDodawane({...dodawane, blad: "Nie wybrałeś gry. (Znak zapytania)"});
            return;
        }
        if(!tmpDodawane.waznosc) {
            console.log("Nie wybrałeś daty ważności uprawnienia.");
            setDodawane({...dodawane, blad: "Nie wybrałeś daty ważności uprawnienia."});
            return;
        }
        if(tmpDodawane.koszt === undefined) {
            console.log("Podaj koszt uprawnienia.");
            setDodawane({...dodawane, blad: "Podaj koszt uprawnienia."});
            return;
        }
        if(tmpDodawane.typ === undefined){
            console.log("Nie wybrałeś typu uprawnienia.");
            setDodawane({...dodawane, blad: "Nie wybrałeś typu uprawnienia."});
            return;
        }
        if(!tmpDodawane.upr) {
            console.log("Nie wybrałeś uprawnienia.");
            setDodawane({...dodawane, blad: "Nie wybrałeś uprawnienia."});
            return;
        }
        if(tmpDodawane.koszt < 0) {
            console.log("Koszt uprawnienia nie może być ujemny!");
            setDodawane({...dodawane, blad: "Koszt uprawnienia nie może być ujemny!"});
            return;
        }
        tmpDodawane.nazwa = nazwyupr.dane.find(x => x.id == dodawane.upr).nazwa;
        tmpDodawane.powiazanie = `${Date.now()}-${tmpDodawane.upr}`;
        let tmpNadawane = [...nadawane.uprawnienia];
        //sprawdz duplikat
        if(tmpNadawane.find(x => x.id == tmpDodawane.upr)){
            console.log("W koszyku istnieje już takie uprawnienie.");
            setDodawane({...dodawane, blad: "W koszyku istnieje już takie uprawnienie."});
            return;
        };
        tmpNadawane.push(tmpDodawane);
        if(tmpDodawane.typ == 0){
            const odpowiednik = znajdzOdpowiednik(tmpDodawane.gra, tmpDodawane.upr);
            console.log("id odpowiednika", odpowiednik);
            if(odpowiednik > 0) {
                const odpowiednikObj = nazwyupr.dane.find(x => x.id == odpowiednik);
                tmpNadawane.push({koszt: 0, typ: 0, waznosc: tmpDodawane.waznosc, gra: odpowiednikObj.gra, upr: odpowiednik, nazwa: odpowiednikObj.nazwa, powiazanie: tmpDodawane.powiazanie });
            }
        }
        setDodawane({koszt: undefined, typ: undefined, waznosc: undefined, gra: undefined, upr: undefined});
        setNadawane({...nadawane, uprawnienia: tmpNadawane, blad: null})
    };

    const usunKoszyk = (delPowiazanie) => {
        let tmpUpr = [...nadawane.uprawnienia];
        console.log("Przed usun", tmpUpr);
        tmpUpr = tmpUpr.filter(x => x.powiazanie != delPowiazanie);
        console.log("Po usun", tmpUpr);
        setNadawane({...nadawane, uprawnienia: tmpUpr, blad: null});
    };

    const uprawnieniaKoszyk = () => {
        if(!nadawane.uprawnienia.length) return;
        return nadawane.uprawnienia.map((x, xid) => {
            return(
            <div className="uprBox" key={`uprKoszyk_${xid}_${x.koszt}_${x.upr}`}>
                <div className="uprBoxPrzycisk" onClick={() => usunKoszyk(x.powiazanie)}>Usuń</div>
                <div className="uprBoxGora">
                    <div className="uprBoxGra"style={{background: x.gra === undefined ? "no-repeat center/cover url(/img/znakzapytania.png)" : (x.gra == 0 ? "no-repeat center/cover url(/img/trasaets.png)" : "no-repeat center/cover url(/img/trasaats.png)")}} />
                    <div className="uprBoxGora2">
                        <div className="uprBoxLine">{new Date(x.waznosc).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                        <div className="uprBoxLine">{parseFloat(x.koszt).toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</div>
                    </div>
                </div>
                <div className="uprBoxLine">{(x.typ == 0) ? "Szkolenie" : "Licencja"}</div>
                <div className="uprBoxLine" style={{borderBottom: 'none'}}>{x.nazwa} ({x.upr})</div>
            </div>
        );
        })
    }

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    <div className="uprawnieniaZakladki">
						<div className={`uprawnieniaZakladka ${zakladka == "nadawanie" ? "uprawnieniaZakladkaAktywna" : ""}`} onClick={(e) => setZakladka("nadawanie")}>Nadawanie</div>
						<div className={`uprawnieniaZakladka ${zakladka == "cennik" ? "uprawnieniaZakladkaAktywna" : ""}`} onClick={(e) => setZakladka("cennik")}>Cennik</div>
						<div className={`uprawnieniaZakladka ${zakladka == "historia" ? "uprawnieniaZakladkaAktywna" : ""}`} onClick={(e) => setZakladka("historia")}>Historia</div>
                    </div>
					<div className="uprawnieniaFirma">
						<b>Stan konta firmy:</b>
						<p>{kontoFirmowe.response ? kontoFirmowe.suma.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'}) : dostanStanFirmy() }</p>
					</div>
					<div className="uprawnieniaOkno">
						{ zakladka == "nadawanie" ?
						<div className="uprawnieniaNadawanie">
							<div className="uprawnieniaNadawanieGora">
								<div className="uprawnieniaNadawanieGoraLewa">
									<div className="uprawnieniaNadawanieGoraCol">
										<h3>Kierowca</h3>
										<div className="uprawnieniaNadawanieGoraOpcja">
											<div style={{display: 'flex', gap: '10px', 'alignItems': 'center', 'height': '30px'}} onClick={() => setRozwijane({kierowca: !rozwijane.kierowca, gra: false, pokrywajacy: false})}>{nadawane.kierowca ? <><div className="uprawnieniaNadawanieAvatar" style={{backgroundImage: `url(/img/${nadawane.kierowcaImg})`}} /> {nadawane.kierowca}</> : "Wybierz"}</div>
											<div className="uprawnieniaNadawanieGoraRozwijane" style={{display: rozwijane.kierowca ? "" : 'none'}}>
											{ uzytkownicy.dane ? uzytkownicy.dane.map((x) => {
												return <div key={`kierowca_${x.id}`} style={{background: nadawane.kierowca == x.login ? "#4caf50" : "", display: 'flex', gap: '10px', 'alignItems': 'center'}} onClick={() => { setRozwijane({kierowca: false, gra: false, pokrywajacy: false}); setNadawane({...nadawane, blad: null, kierowcaId: x.id, kierowca: x.login, kierowcaImg: x.awatar}); }}><div className="uprawnieniaNadawanieAvatar" style={{background: `center/cover url(/img/${x.awatar}) transparent`}} /> {x.login}</div>
											}) : (!uzytkownicy.response ? dostanHistorie() : "") }
											</div>
										</div>
									</div>
									<div className="uprawnieniaNadawanieGoraCol">
										<h3>Pokrywający</h3>
										<div className="uprawnieniaNadawanieGoraOpcja">
											<div style={{height: '30px', display: 'flex', alignItems: 'center'}} onClick={() => setRozwijane({kierowca: false, gra: false, pokrywajacy: !rozwijane.pokrywajacy})}>{(nadawane.pokrywajacy === undefined) ? "Wybierz" : (nadawane.pokrywajacy ? <><BsBuildingsFill style={{scale: "1.3", marginRight: '10px'}} /> Firma</> : <><BsPersonLinesFill style={{scale: "1.3", marginRight: '10px'}}/> Kierowca</>)}</div>
											<div className="uprawnieniaNadawanieGoraRozwijane" style={{display: rozwijane.pokrywajacy ? "" : 'none'}}>
												<div style={{background: nadawane.pokrywajacy === 0 ? "#4caf50" : ""}} onClick={() => { setRozwijane({kierowca: false, gra: false, pokrywajacy: false}); setNadawane({...nadawane, blad: null, pokrywajacy: 0}) }}>Kierowca</div>
												<div style={{background: nadawane.pokrywajacy === 1 ? "#4caf50" : ""}} onClick={() => { setRozwijane({kierowca: false, gra: false, pokrywajacy: false}); setNadawane({...nadawane, blad: null, pokrywajacy: 1}) }}>Firma</div>
											</div>
										</div>
									</div>
								</div>
								<div className="uprawnieniaNadawanieGoraPrawa">
									<div style={{textAlign: 'right'}}>
                                        Należność: <b>{sumaKoszta().toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</b>
                                        { nadawane.blad ? <><br /><b style={{color: "crimson"}}>{nadawane.blad}</b></> : ""}
                                        { nadawane.odp ? <><br /><b style={{color: "green"}}>{nadawane.odp}</b></> : ""}
                                    </div>
									<div style={{marginTop: '6px', display: 'flex', gap: '20px'}}>
										<div className="uprawnieniaNadawaniePrzycisk" onClick={() => setNadawane({kierowca: undefined, kierowcaId: undefined, pokrywajacy: undefined, kierowcaImg: undefined, uprawnienia: [] })}>Wyczyść</div>
										<div className="uprawnieniaNadawaniePrzycisk" style={{background: "green"}} onClick={() => nadajUprawnienia()}>Nadaj</div>
									</div>
								</div>
							</div>
							<h3>Uprawnienia</h3>
							<div className="uprawnieniaNadawanieDol">
                                <div className="uprBox" style={{background: '#412c24'}}>
                                    {dodawane.blad ? <div className="uprBoxError">{dodawane.blad}</div> : ""}
                                    <div className="uprBoxPrzycisk" onClick={() => dodajKoszyk()}>Dodaj</div>
                                    <div className="uprBoxGora">
                                        <div className="uprBoxGra" style={{background: dodawane.gra === undefined ? "no-repeat center/cover url(/img/znakzapytania.png)" : (dodawane.gra == 0 ? "no-repeat center/cover url(/img/trasaets.png)" : "no-repeat center/cover url(/img/trasaats.png)")}} onClick={() => setRozwijane({gra: !rozwijane.gra, kierowca: false, pokrywajacy: false})}>
                                            <div className="uprWybierzGre" style={{opacity: rozwijane.gra ? '1' : '0', visibility: rozwijane.gra ? "" : "hidden"}}>
                                                <div className="uprWybierzGreWybor" style={{background: 'rgba(0,0,0,0.3)', transform: rozwijane.gra ? `translateX(0)` : ""}} onClick={() => setRozwijane({gra: !rozwijane.gra, kierowca: false, pokrywajacy: false})} />
                                                <div className="uprWybierzGreWybor" style={{background: `no-repeat center/90% url(/img/trasaets.png)`, transform: rozwijane.gra ? `translateX(0)` : ""}} onClick={() => { setRozwijane({gra: !rozwijane.gra, kierowca: false, pokrywajacy: false}); setDodawane({...dodawane, gra: 0}); }} />
                                                <div className="uprWybierzGreWybor" style={{background: `no-repeat center/90% url(/img/trasaats.png)`, transform: rozwijane.gra ? `translateX(0)` : ""}} onClick={() => { setRozwijane({gra: !rozwijane.gra, kierowca: false, pokrywajacy: false}); setDodawane({...dodawane, gra: 1}); }}/>
                                            </div>
                                        </div>
                                        <div className="uprBoxGora2">
                                            <input className="uprBoxLine" type="date" value={dodawane.waznosc !== undefined ? dodawane.waznosc : ""} onChange={(e) => setDodawane({...dodawane, waznosc: e.target.value})}/>
                                            <input className="uprBoxLine" type="number" step="0.01" placeholder="Podaj cene" value={dodawane.koszt !== undefined ? dodawane.koszt : ""} onChange={(e) => setDodawane({...dodawane, koszt: e.target.value})}/>
                                        </div>
                                    </div>
                                    <select className="uprBoxLine" value={dodawane.typ === undefined ? "" : dodawane.typ} onChange={(e) => setDodawane({...dodawane, typ: e.target.value})}>
                                        <option value={null}>Wybierz typ</option>
                                        <option value={0}>Szkolenie</option>
                                        <option value={1}>Licencja</option>
                                    </select>
                                        
                                    { ((dodawane.gra == 0) || (dodawane.gra == 1)) ?
                                        (dodawane.typ === undefined ? <div className="uprBoxLine" style={{borderBottom: 'none'}}>Nie wybrano typu</div> :
                                        <select className="uprBoxLine" style={{borderBottom: 'none'}} value={dodawane.upr ? dodawane.upr : ""} onChange={(e) => setDodawane({...dodawane, upr: e.target.value})}>
                                            <option value={null}>Wybierz uprawnienie</option>
                                            {nazwyupr.dane.map((upr) => {
                                                if((upr.gra == dodawane.gra) && (upr.rodzaj.toLowerCase() == (dodawane.typ == 0 ? "szkolenie" : "licencja"))) {
                                                    return <option key={`uprList_${upr.id}`} value={upr.id}>{upr.nazwa}</option>
                                                }
                                            })}
                                        </select>
                                        )
                                    : <div className="uprBoxLine" style={{borderBottom: 'none'}}>Nie wybrano gry</div>
                                    }
                                </div>
                                { nadawane.uprawnienia.length ? uprawnieniaKoszyk() : "" }
							</div>
						</div> : "" }
						{ zakladka == "historia" ?
						<>
						{ historia.usuwane ?
							<div className="potwierdzenieUsuwaniaUpr">
								<span>Czy aby napewno chcesz usunąć uprawnienie ID {historia.usuwane}?</span>
								<div><button onClick={() => setHistoria({...historia, usuwane: null})}>Anuluj</button><button onClick={() => usunUpr(historia.usuwane, 1)}>Potwierdź</button></div>
							</div> : "" }
							<div className="uprawnieniaHistoria">
							<table>
                                <thead>
                                    <tr><th>ID</th><th>Posiadacz</th><th>Uprawnienie</th><th>Koszt</th><th>Nadane</th><th>Ważność</th><th>Akcja</th></tr>
                                </thead>
                                <tbody>
                                { historia.response ? historia.dane.map((wiersz) => {
                                    const histUpr = nazwyupr.dane.find(upr => upr.id === wiersz.naco);
                                    const kierowca = uzytkownicy.dane.find(user => user.id === wiersz.kto);
                                    return(<tr key={`histUpr_${wiersz.id}`}>
                                        <td>{wiersz.id}</td>
                                        <td><a href={"/profil/"+kierowca.login}><img src={"/img/"+kierowca.awatar} />{kierowca.login}</a></td>
                                        <td>{histUpr.rodzaj} {histUpr.gra ? "ATS" : "ETS2"} - {histUpr.nazwa}</td>
                                        <td>{(wiersz.cena) ? wiersz.cena.toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", currency: "PLN"}) : (wiersz.cenaFirmy ? wiersz.cenaFirmy.toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", currency: "PLN"}) : "0,00 zł")}<br/>{wiersz.cenaFirmy ? "Firma" : "Kierowca"}</td>
										<td>{new Date(wiersz.odkiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                                        <td>{new Date(wiersz.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                                        <td><button className="uprUsunPrzycisk" onClick={() => usunUpr(wiersz.id, 0)}>Usuń</button></td>
                                    </tr>)
                                }) : dostanHistorie() }
                                </tbody>
							</table>
						</div>
						</> : "" }
						{ zakladka == "cennik" ?
							<table className="uprawnieniaCennik">
                                <thead>
                                    <tr><th>Licencja</th><th>1 miesiąc</th><th>2 miesiące</th><th>4 miesiące</th><th>6 miesięcy</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>Firanka / Furgon / Izoterma</th>
                                        <td>{(400).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(1000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(2000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Chłodnia</th>
                                        <td>{(1000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(1900).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3610).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(5150).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Podkontenerowa</th>
                                        <td>{(1500).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(2850).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(5415).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(7700).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Platforma</th>
                                        <td>{(2000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(7220).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(10250).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Niskopodłogowa / Niskopodwoziowa</th>
                                        <td>{(3000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(5700).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(10830).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(15420).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Cysterna/Cement</th>
                                        <td>{(2500).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(4750).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(9025).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(10250).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Wywrotka</th>
                                        <td>{(2000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(7220).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(10250).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Do przewozu bydła</th>
                                        <td>{(1000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(1900).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3610).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(5150).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Lora</th>
                                        <td>{(2000).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(7220).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(10250).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Kłonicowa</th>
                                        <td>{(1500).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(2850).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(5415).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(7700).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Specjalne</th>
                                        <th>1 miesiąc</th><th>2 miesiące</th><th>4 miesiące</th><th>6 miesięcy</th>
                                    </tr>
                                    <tr>
                                        <th>Kat. C+E</th>
                                        <td>{(600).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(1200).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(2400).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3600).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Klasyfikacja ADR</th>
                                        <td>{(800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(1600).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3200).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(4800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Gabaryty</th>
                                        <td>{(800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(1600).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3200).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(4800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                    <tr>
                                        <th>Długie zestawy</th>
                                        <td>{(800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(1600).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(3200).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                        <td>{(4800).toLocaleString('pl-PL', {style: 'currency', useGrouping: "always", minimumFractionDigits: 0, maximumFractionDigits: 0 , currency: "PLN"})}</td>
                                    </tr>
                                </tbody>
                            </table> : "" }
					</div>
                </div>
            </div>
            
        </>
    );
}