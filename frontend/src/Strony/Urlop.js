import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Urlop(props){
    const [wniosek, setWniosek] = useState({odkiedy: null, dokiedy: null, powod: null, blad: null});
    const [historia, setHistoria] = useState({dane: null, response: false});

    const initHistoria = () => {
        Axios.post(gb.backendIP+"historiaUrlopow/"+localStorage.getItem('token')).then((r) => {
            setHistoria({dane: r.data['dane'], response: true});
        }).catch((er) => setHistoria({response: true, dane: null}));
    };

    const zlozWniosek = () => {
        if(!wniosek.powod){
            setWniosek({...wniosek, blad: "Nie podano powodu"});
            return;
        }
        if(!wniosek.odkiedy){
            setWniosek({...wniosek, blad: "Wybierz datę rozpoczęcia Urlopu!"});
            return;
        }
        let rozp = new Date(wniosek.odkiedy);
        rozp.setDate(rozp.getDate() + 3);
        console.log(rozp.getTime(), Date.now());
        if(rozp.getTime() < Date.now()){
            setWniosek({...wniosek, blad: "Datę rozpoczęcia można ustawić tylko do 3 dni wstecz!"});
            return;
        }
        if(!wniosek.dokiedy){
            setWniosek({...wniosek, blad: "Wybierz datę zakończenia Urlopu!"});
            return;
        }
        Axios.post(gb.backendIP+"zlozUrlop/"+localStorage.getItem("token"), {
            odkiedy: wniosek.odkiedy,
            dokiedy: wniosek.dokiedy,
            powod: wniosek.powod
        }).then((r) => {
            console.log(r.data);
            setWniosek({odkiedy: null, dokiedy: null, powod: null, blad: null});
            setHistoria({dane: null, response: false});
        }).catch((err) => {
            setWniosek({odkiedy: null, dokiedy: null, powod: null, blad: "Wystapil blad podczas składania wniosku!"});
        });
    };

    const histBody = (dane) => {
        return(
            <div className="historiaWnioskow">
                <h4>Historia złożonych wniosków o Urlop</h4>
                <table className="ostatnieTrasy">
                    <tbody>
                        <tr><th>ID</th><th>Od kiedy</th><th>Do kiedy</th><th>Kto rozpatrzył</th><th>Status</th></tr>
                        { dane ? dane.map((wiersz) => {
                            let decyzja;
                            switch(wiersz.status){
                                case 3:
                                    decyzja = <td style={{color: 'orangered'}}>Anulowany przez użytkownika</td>;
                                    break;
                                case 2:
                                    //porownaj date rozpoczecia i zakonczenia
                                    if(Date.now() < new Date(wiersz.odkiedy).getTime() ){
                                        decyzja = <td style={{color: '#2f2'}}>Oczekujący na rozpoczęcie</td>;
                                    } else {
                                        if(Date.now() < new Date(wiersz.dokiedy).getTime() ){
                                            decyzja = <td style={{color: "#2f2"}}>Urlop w trakcie</td>;
                                        } else {
                                            decyzja = <td style={{color: "orangered"}}>Urlop zakończony</td>;
                                        }
                                    }
                                    break;
                                case 1:
                                    decyzja = <td style={{color: 'crimson'}}>Odrzucony</td>;
                                    break;
                                case 0:
                                    decyzja = <td style={{color: 'dodgerblue'}}>Nierozpatrzony</td>;
                                    break;
                                case null:
                                    decyzja = <td style={{color: 'dodgerblue'}}>Nierozpatrzony</td>;
                                    break;
                            }
                            return(
                                <tr key={`urlop_${wiersz.idwniosku}`}>
                                    <td>{wiersz.idwniosku}</td>
                                    <td>{new Date(wiersz.odkiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</td>
                                    <td>{new Date(wiersz.dokiedy).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</td>
                                    <td>{ wiersz.ktorozpatrzyl ?
                                        <Link to={"../profil/"+wiersz.ktorozpatrzyl}>
                                            <img className="ktoOddal" style={{width: '30px', height: '30px', marginRight: '10px'}} src={"/img/" + wiersz.awatarRozpatrzyl} /> 
                                            {wiersz.ktorozpatrzyl}
                                        </Link>
                                        : "-" }
                                    </td>
                                    {decyzja}
                                </tr>
                            )
                        }) : <tr><td rowSpan={4} colSpan={5}>Brak złożonych wniosków.</td></tr>}
                    </tbody>
                </table>
            </div>
        )
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna" style={{maxWidth: '1000px'}}>
                    <div className="podwyzkiRow">
                        <div className="podwyzkiKol">
                            <div className="wniosek">
                                <h2>Formularz o Urlop</h2>
                                <div className="wniosekGora">
                                    <div className="wniosekGoraKol">
                                        <div>
                                            <span>Kiedy rozpoczynasz urlop:</span>
                                            <input type="date" value={wniosek.odkiedy ? wniosek.odkiedy : ""} onChange={(e) => setWniosek({...wniosek, odkiedy: e.target.value, blad: null})} />
                                        </div>
                                        <div>
                                            <span>Kiedy kończysz urlop:</span>
                                            <input type="date" value={wniosek.dokiedy ? wniosek.dokiedy : ""} onChange={(e) => setWniosek({...wniosek, dokiedy: e.target.value, blad: null})} />
                                        </div>
                                        {wniosek.blad &&
                                        <div>
                                            <span style={{color: 'crimson', fontWeight: 'bold', fontSize: '0.8rem'}}>{wniosek.blad}</span>
                                        </div>}
                                    </div>
                                    <div className="wniosekGoraKol" style={{flexGrow: 1}}>
                                        <div>
                                            <span>Powód:</span>
                                            <textarea style={{width: '100%'}}
                                                placeholder="Uzasadnij swój urlop, przedstaw powód i takie tam ;)" 
                                                value={wniosek.powod ? wniosek.powod : ""}
                                                onChange={(e) => setWniosek({...wniosek, powod: e.target.value, blad: null})}
                                            />
                                        </div>
                                        <button onClick={() => zlozWniosek()}>Złóż wniosek</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    { historia.response ? (historia.dane ? histBody(historia.dane) : histBody(null)) : initHistoria() }
                </div>
            </div>
        </>
    );
};