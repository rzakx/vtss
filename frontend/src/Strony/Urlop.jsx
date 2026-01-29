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
            <div className="flex flex-col items-center bg-[#0c0c0c] p-2.5 leading-[1.2]">
                <h4>Historia złożonych wniosków o Urlop</h4>
                <table className="border-collapse w-full

mt-2.5 bg-[#1e1e1e]
[&_tr_th]:border
[&_tr_th]:border-[#333]
[&_tr_td]:border
[&_tr_td]:border-[#333]
[&_tr:nth-child(odd)_td]:bg-[#121212]
[&_tr:nth-child(even)_td]:bg-[#161616]

[&_tr_th]:p-2.5
[&_tr_th]:text-left
[&_tr_th]:align-middle
[&_tr_th]:transition-all [&_tr_th]:duration-300
[&_tr:hover_th]:bg-[#1c1c1c]
[&_tr:hover_th]:text-[#ddd]

[&_tr_td]:p-2.5
[&_tr_td]:text-left
[&_tr_td]:align-middle
[&_tr_td]:transition-all [&_tr_td]:duration-300
[&_tr:hover_td]:bg-[#1c1c1c]
[&_tr:hover_td]:text-[#ddd]

[&_tr_td:first-child]:text-center
[&_tr_th:first-child]:text-center
[&_tr_th:nth-child(2)]:text-center
">
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
                                            <img className="rounded-[50%] align-middle inline mr-2.5 w-7.5 h-7.5" src={"/img/" + wiersz.awatarRozpatrzyl} /> 
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
                    <div>
                        <div>
                            <div className="relative p-5">
                                <h2 className="font-semibold">Formularz o Urlop</h2>
                                <div className="flex flex-row gap-2.5 mt-5 leading-[1.2]
                                [&_input]:text-zinc-800
                                [&_textarea]:text-zinc-800
                                [&_input]:text-[0.83rem]
                                [&_textarea]:text-[0.83rem]

                                [&_input]:mt-2.5
                                [&_input]:w-full
                                [&_input]:font-bold
                                [&_input]:bg-[#ffffffbf]
                                [&_input]:p-2
                                [&_input]:outline-0
                                [&_input]:border-0

                                [&_textarea]:mt-2.5
                                [&_textarea]:font-bold
                                [&_textarea]:bg-[#ffffffbf]
                                [&_textarea]:p-2
                                [&_textarea]:outline-0
                                [&_textarea]:border-0
                                [&_textarea]:resize-none
                                [&_textarea]:h-26.25
                                [&_textarea]:w-full
                                [&_textarea]:text-justify

                                [&_button]:p-2.5
                                [&_button]:font-bold
                                [&_button]:my-0
                                [&_button]:mx-2.5
                                [&_button]:tracking-[1px]
                                [&_button]:bg-[#373]
                                [&_button]:text-[#ccc]
                                [&_button]:text-[0.8rem]
                                [&_button]:border-0
                                [&_button]:text-shadow-[1px_1px_3px_#111]
                                [&_button]:shadow-[0_0_10px_0_#060606]
                                [&_button]:cursor-pointer
                                [&_button]:transition-all [&_button]:duration-300
                                [&_button]:hover:tracking-[2px]
                                [&_button]:hover:bg-[goldenrod]">
                                    <div className="flex flex-col gap-2.5">
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
                                    <div className="flex flex-col gap-2.5 grow">
                                        <div>
                                            <span>Powód:</span>
                                            <textarea
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