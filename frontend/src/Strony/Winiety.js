import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";

export default function Winiety(props){
    const [ wybrane, setWybrane ] = useState(0);
    const [stanKonta, setStanKonta] = useState({response: false, kwota: 0});
    const [ twojeWiniety, setTwojeWiniety ] = useState({response: false, dane: null});
    const [listaWiniet, setListaWiniet ] = useState({response: false, dane: null});
    let finalnaKwota = 0;
    let ileWybranych = 0;
    let znizka = 0;

    const dostanWiniety = () => {
        Axios.post(gb.backendIP+"dostepneWiniety/"+localStorage.getItem("token"))
        .then((r) => {
            Axios.post(gb.backendIP+"swojeWiniety/"+localStorage.getItem("token"))
            .then((r2) => {
                setListaWiniet({...r.data});
                setTwojeWiniety({...r2.data});
            }).catch((er2) => {
                console.log(er2);
                setTwojeWiniety({response: true, dane: null, blad: "Błąd wczytywania twoich winiet"});
                setListaWiniet({...r.data});
            });
        }).catch((er) => {
            console.log(er);
            setListaWiniet({response: true, dane: null, blad: "Błąd wczytywania dostępnych winiet"});
        })
    };
    const wyswietlWiniety = () => {
        if(listaWiniet.dane){
            return listaWiniet.dane.map((winieta) => {
                let klasy = "winietaShop";
                let tytul = "Nie posiadasz tej winiety";
                let posiadana = false;
                let wygasa = undefined;
                const dzis = Date.now();
                if(twojeWiniety.dane){
                    const x = twojeWiniety.dane.find(tmp => tmp.kraj === winieta.id);
                    if(x !== undefined){
                        const dokiedy = new Date(x.termin).getTime();
                        wygasa = dokiedy;
                        posiadana = true;
                        const ilednizostalo = (dokiedy - dzis) / (1000 * 3600 * 24);
                        if(dokiedy < dzis){
                            klasy = klasy + " wygaslaWinieta";
                            tytul = "Ta winieta wygasła!";
                        } else{
                            tytul = `Ta winieta wygasa za ~${ilednizostalo.toFixed(0)} dni!`;
                            if(ilednizostalo > 4){
                                klasy = klasy + " swiezaWinieta";
                            } else {
                                klasy = klasy + " niedlugoWinieta";
                                tytul = `Ta winieta wygasa za ${(ilednizostalo*24).toFixed(0)}h!`
                            }
                        }
                    }
                }

                //sprawdz czy jest wybrana do kupna zeby nadac kolor krawedzi
                if(wybrane[winieta.id]){
                    if(wybrane[winieta.id].wybrane){
                        klasy = klasy + " wybranaWinieta";
                    }
                }

                return(
                    <div title={tytul} className={klasy} key={`winieta_${winieta.id}`} onClick={() => setWybrane({...wybrane, [winieta.id]: {wybrane: (wybrane[winieta.id] ? (!wybrane[winieta.id].wybrane) : true), wygasa: wygasa, posiadana: posiadana}})}>
                        <img src={"/img/flagi/"+winieta.kraj.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} />
						<div className="winietaDane">
							<span>{winieta.kraj}</span>
							<p>{winieta.cena.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</p>
						</div>
                    </div>
                )
            });
        } else {
            return "Pusto jak skurwysyn";
        }
    };

    const koszyk = () => {
        let ileWybranychTmp = 0;
        let sumaWybranych = 0;
        wybrane && Object.entries(wybrane).filter((a) => {
            if(a[1].wybrane){
                ileWybranychTmp++;
                sumaWybranych += parseFloat(listaWiniet.dane.filter((winieta) => winieta.id == a[0])[0].cena);
            }
        });
        znizka = 5 * parseInt(ileWybranychTmp/4);
        finalnaKwota = (sumaWybranych * (100 - znizka))/100;
        ileWybranych = ileWybranychTmp;

        return(
            <div className="winietaShopKoszyk">
                <h3>Koszyk</h3>
                <span><b>Stan konta:</b> {(stanKonta.kwota).toLocaleString("pl-PL", {style: "currency", currency: "PLN"})} </span>
                <span><b>Wybranych winiet:</b> { ileWybranych }</span>
                <span><b>Kwota:</b> { finalnaKwota.toLocaleString("pl-PL", {style: "currency", currency: "PLN"}) } { znizka ? <sup>(rabat {znizka}%)</sup> : <sup>Brak rabatu</sup> }</span>
                <button className="zamowWiniety" onClick={() => zamow()}>{stanKonta.response && (finalnaKwota <= stanKonta.kwota) ? "Zapłać" : "Nie stać cię"}</button>
                {!stanKonta.response && dostanStanKonta()}
            </div>
        )
    };

    const dostanStanKonta = () => {
        let odp = 0;
        Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem("login")+"/wlasnyzarobek").then((res) => {
			odp += res.data['odp'];
			Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem("login")+"/kary").then((res2) => {
				odp -= res2.data['odp'];
				Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem("login")+"/upr").then((res3) => {
					odp -= res3.data['odp'];
					Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem("login")+"/gesty").then((res4) => {
						odp += res4.data['odp'];
						Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem("login")+"/winiety").then((res5) => {
							odp -= res5.data['odp'];
							setStanKonta({response: true, kwota: odp});
						});
					});
				});
			});
		});
    };

    const zamow = () => {
        let posiadaneWygasle = [];
        let posiadaneWazne = [];
        let nieposiadane = [];
        Object.entries(wybrane).map((w) => {
            if(w[1].wybrane){
                if(w[1].posiadana){
                    const dzis = Date.now();
                    if(dzis > w[1].wygasa){
                        //stara UPDATE dzis+31dni
                        posiadaneWygasle.push(w[0]);
                    } else {
                        //stara UPDATE wygasa+31dni
                        posiadaneWazne.push(w[0]);
                    }
                } else {
                    //nowa INSERT dzis+31dni
                    nieposiadane.push(w[0]);
                }
            }
        });
        console.log("posiadaneWygasle", posiadaneWygasle);
        console.log("nieposiadane", nieposiadane);
        console.log("posiadaneWazne", posiadaneWazne);
        let wiadomosc = `Użytkownik [${localStorage.getItem('login')}](https://system.thebossspedition.pl/profil/${localStorage.getItem('login')}) zakupił ${ileWybranych} winiet za kwotę ${parseFloat(finalnaKwota).toFixed(2)} zł (ze zniżką ${znizka}%).`;
        if(posiadaneWazne.length){
            wiadomosc = wiadomosc + `\nWiniety ważne, przedłużane:`;
            posiadaneWazne.map((posiadanaW) => {
                wiadomosc = wiadomosc + "\n- " + listaWiniet.dane.filter((w) => w.id == posiadanaW)[0].kraj;
            });
        }
        if(nieposiadane.length || posiadaneWygasle.length){
            wiadomosc = wiadomosc + "\nWiniety wygasłe lub nieposiadane:";
            nieposiadane.map((posiadanaW) => {
                wiadomosc = wiadomosc + "\n- " + listaWiniet.dane.filter((w) => w.id == posiadanaW)[0].kraj;
            });
            posiadaneWygasle.map((posiadanaW) => {
                wiadomosc = wiadomosc + "\n- " + listaWiniet.dane.filter((w) => w.id == posiadanaW)[0].kraj;
            });
        }
        console.log(wiadomosc);
        if(stanKonta.kwota >= finalnaKwota){
            const cenaJedna = (finalnaKwota/ileWybranych).toFixed(2);
            Axios.post(gb.backendIP+"zakupWinietyNowe/"+localStorage.getItem("token"), {ktore: nieposiadane, cena: cenaJedna}).then((r) => {
                Axios.post(gb.backendIP+"zakupWinietyWygasle/"+localStorage.getItem("token"), {ktore: posiadaneWygasle, cena: cenaJedna}).then((r2) => {
                    Axios.post(gb.backendIP+"zakupWinietyWazne/"+localStorage.getItem("token"), {ktore: posiadaneWazne, cena: cenaJedna}).then((r3) => {
                        Axios.post(gb.backendIP+"zakupWinietDC/"+localStorage.getItem("token"), {wiadomosc: wiadomosc});
                        console.log(r.data, r2.data, r3.data);
                        console.log("OK Kupno, cena za jedna: ", cenaJedna);
                        setStanKonta({response: false, kwota: 0});
                        setTwojeWiniety({response: false, dane: null});
                        setListaWiniet({response: false, dane: null});
                        setWybrane(0);
                    });
                }); 
            });
        } else {
            console.log("Za mało siana");
        }
    };

    return(<>
        <Nawigacja />
        <div className="tlo" />
		<div className="srodekekranu">
            <div className="glowna" style={{padding: '20px', maxWidth: '1400px'}}>
                <div className="winietaShopGora">
                    { koszyk() }
                    <div className="winietaShopBoczne">
                        <div className="winietyWytlumaczenie">
                            <div className="wytlumaczenieW"><span className="kolkoWinieta swiezaWinieta"></span> Długa ważność</div>
                            <div className="wytlumaczenieW"><span className="kolkoWinieta niedlugoWinieta"></span> Niedługo wygasa</div>
                            <div className="wytlumaczenieW"><span className="kolkoWinieta wygaslaWinieta"></span> Wygasła</div>
                            <div className="wytlumaczenieW"><span className="kolkoWinieta"></span> Nieposiadana</div>
                            <div className="wytlumaczenieW"><span className="kolkoWinieta wybranaWinieta"></span> Wybrana do zakupu</div>
                        </div>
                        <h2 className="tytulWinietaShop">Kupowanie/przedłużanie winiet</h2>
                    </div>
                </div>
                <div className="listaWinietShop">
                    {listaWiniet.response ? wyswietlWiniety() : dostanWiniety() }
                </div>
            </div>
        </div>
    </>);
}