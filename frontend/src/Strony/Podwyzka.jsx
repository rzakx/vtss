import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Podwyzka(props){
    const [wniosek, setWniosek] = useState({nowastawka: null, nowestanowisko: null, powod: null, rangi: null, blad: null});
    const [historia, setHistoria] = useState({dane: null, response: false});
    const initDane = () => {
        Axios.post(gb.backendIP+"stanowiska").then((r) => {
            Axios.post(gb.backendIP+"twojeAktDaneWniosek/"+localStorage.getItem('token')).then((r2) => {
                setWniosek({...wniosek, nowastawka: r2.data['aktstawka'], nowestanowisko: r2.data['aktstanowisko'], ...r2.data, rangi: r.data['dane']});
            });
        });
    };
    const initHistoria = () => {
        Axios.post(gb.backendIP+"historiaPodwyzek/"+localStorage.getItem('token')).then((r) => {
            setHistoria({dane: r.data['dane'], response: true});
        }).catch((er) => setHistoria({response: true, dane: null}));
    };

    const zlozWniosek = () => {
        if(!wniosek.powod){
            setWniosek({...wniosek, blad: "Nie podano powodu"});
            return;
        }
        if(!wniosek.nowastawka){
            setWniosek({...wniosek, blad: "Podaj stawkę, nawet jeśli nie wnioskujesz o inną!"});
            return;
        }
        if(!wniosek.nowestanowisko){
            setWniosek({...wniosek, blad: "Wybierz stanowisko, nawet jeśli nie wnioskujesz o inne!"});
            return;
        }
        Axios.post(gb.backendIP+"zlozWniosek/"+localStorage.getItem("token"), {
            aktstanowisko: wniosek.aktstanowisko,
            nowestanowisko: wniosek.nowestanowisko,
            aktstawka: wniosek.aktstawka,
            nowastawka: wniosek.nowastawka,
            aktstanowiskoN: wniosek.rangi[wniosek.aktstanowisko] + ` (${wniosek.aktstanowisko})`,
            nowestanowiskoN: wniosek.rangi[wniosek.nowestanowisko] + ` (${wniosek.nowestanowisko})`,
            powod: wniosek.powod
        }).then((r) => {
            console.log(r.data);
            setWniosek({nowastawka: null, nowestanowisko: null, powod: null, rangi: null, blad: null});
            setHistoria({dane: null, response: false});
        }).catch((err) => {
            setWniosek({nowastawka: null, nowestanowisko: null, powod: null, rangi: null, blad: "Wystapil blad podczas składania wniosku!"});
        });
    };

    const histBody = (dane) => {
        return(
//             .historiaWnioskow { display: flex; flex-direction: column; align-items: center; background: #0c0c0c; padding: 10px; }
// .historiaWnioskow table { margin-top: 10px; background: #1e1e1e;}
// .historiaWnioskow table tr th, .historiaWnioskow table tr td { border: 1px solid #333;}

// .ostatnieTrasy tr th, .ostatnieTrasy tr td { padding: 10px 15px; text-align: left; vertical-align: middle; transition: all .4s ease;}
// .ostatnieTrasy tr th, .ostatnieTrasy tr td { padding: 10px; }
// .ostatnieTrasy tr td:first-child, .ostatnieTrasy tr th:first-child, .ostatnieTrasy tr th:nth-child(2) { text-align: center;}
// .rankingTable tr:nth-child(odd) td, .ostatnieTrasy tr:nth-child(odd) td { background: #121212; }
// .rankingTable tr:nth-child(even) td, .ostatnieTrasy tr:nth-child(even) td { background: #161616; }
// .rankingTable tr:hover td, .ostatnieTrasy tr:hover td { background: #1C1C1C; color: #ddd; }

            <div className="flex flex-col items-center bg-[#0c0c0c] p-2.5 leading-[1.2]">
                <h4 className="font-semibold">Historia złożonych wniosków</h4>
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
                        <tr><th>Data</th><th>Stanowisko</th><th>Stawka</th><th>Status</th></tr>
                        { dane ? dane.map((wiersz) => {
                            let decyzja;
                            switch(wiersz.status){
                                case 1:
                                    decyzja = <td title={wiersz.powod} style={{color: '#2f2'}}>Zaakceptowano</td>;
                                    break;
                                case 0:
                                    decyzja = <td title={wiersz.powod} style={{color: 'crimson'}}>Odrzucono</td>;
                                    break;
                                case null:
                                    decyzja = <td style={{color: 'dodgerblue'}}>Oczekujący</td>;
                                    break;
                            }
                            return(
                                <tr key={`podwyzka_${wiersz.idwniosku}`}>
                                    <td>{ new Date(wiersz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', year: 'numeric'})}</td>
                                    <td>{wniosek.rangi[wiersz.aktstanowisko] || "Nieznane"} → {wniosek.rangi[wiersz.nowestanowisko] || "Nieznane"}</td>
                                    <td>{wiersz.aktstawka.toFixed(2) || "Nieznane"} → {wiersz.nowastawka.toFixed(2) || "Nieznane"}</td>
                                    {decyzja}
                                </tr>
                            )
                        }) : <tr><td rowSpan={4} colSpan={4}>Brak złożonych wniosków.</td></tr>}
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
                <div className="glowna">
                { wniosek.rangi ?
                <>
                    <div>
                        <div>
                            <div className="relative p-[20px_345px_20px_20px]">
                                <h2 className="font-semibold">Formularz o podwyżkę</h2>
                                <div className="flex flex-row gap-2.5 mt-5 leading-[1.2]
                                [&_select]:text-zinc-800
                                [&_input]:text-zinc-800
                                [&_textarea]:text-zinc-800
                                [&_select]:text-[0.83rem]
                                [&_input]:text-[0.83rem]
                                [&_textarea]:text-[0.83rem]

                                [&_input]:mt-2.5
                                [&_input]:w-full
                                [&_input]:font-bold
                                [&_input]:bg-[#ffffffbf]
                                [&_input]:p-2
                                [&_input]:outline-0
                                [&_input]:border-0

                                [&_select]:mt-2.5
                                [&_select]:w-full
                                [&_select]:font-bold
                                [&_select]:bg-[#ffffffbf]
                                [&_select]:p-2
                                [&_select]:outline-0
                                [&_select]:border-0

                                [&_textarea]:mt-2.5
                                [&_textarea]:font-bold
                                [&_textarea]:bg-[#ffffffbf]
                                [&_textarea]:p-2
                                [&_textarea]:outline-0
                                [&_textarea]:border-0
                                [&_textarea]:resize-none
                                [&_textarea]:h-26.25
                                [&_textarea]:w-100
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
                                [&_button]:hover:bg-[goldenrod]
                                
                                ">
                                    <div className="flex flex-col gap-2.5">
                                        <div>
                                            <span>Aktualne stanowisko:</span>
                                            <input type="text" value={wniosek.rangi[wniosek.aktstanowisko] + " (" + wniosek.aktstanowisko + ")"} disabled />
                                        </div>
                                        <div>
                                            <span>Wnioskowane stanowisko:</span>
                                            <select value={wniosek.nowestanowisko} onChange={(e) => setWniosek({...wniosek, nowestanowisko: e.target.value})}>
                                                { wniosek.rangi.map((ranga, idr) => {
                                                    if(ranga) return <option key={`opcja_${idr}`} value={idr}>{ranga} ({idr})</option> 
                                                })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        <div>
                                            <span>Aktualna stawka:</span>
                                            <input type="text" value={wniosek.aktstawka.toFixed(2) + " zł/km"} disabled/>
                                        </div>
                                        <div>
                                            <span>Wnioskowana stawka:</span>
                                            <input type="number" step={0.01} min={0} value={wniosek.nowastawka} onChange={(e) => setWniosek({...wniosek, nowastawka: e.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        <div>
                                            <span>Powód:</span>
                                            <textarea
                                                placeholder="Pamiętaj, aby wnioskować o stanowisko i/lub stawkę adekwatną do twojego zaangażowania. Jeśli wnioskujesz tylko o jedno, drugą opcje wybierz taką jaką masz aktualnie ;)" 
                                                value={wniosek.powod ? wniosek.powod : undefined}
                                                onChange={(e) => setWniosek({...wniosek, powod: e.target.value})}
                                            />
                                        </div>
                                        <button onClick={() => zlozWniosek()}>Złóż wniosek</button>
                                    </div>
                                </div>
                                <div className="absolute top-10.75 right-5 text-[0.85rem] leading-[1.2] text-left">
                                        <table className="
                                        border-collapse
                                        [&_td]:p-0.5
                                        [&_tr_td:nth-child(2)]:text-center
                                        [&_tr_th:nth-child(2)]:text-center
                                        [&_tr_td:nth-child(2)]:pl-1.25
                                        [&_tr_th:nth-child(2)]:pl-1.25
                                        ">
                                            <thead><tr><th>Stanowisko</th><th>Zakres stawki</th></tr></thead>
                                            <tbody>
                                                <tr><td>Król Szos</td><td>0,40 zł - x,xx zł</td></tr>
                                                <tr><td>Kierowca Wyjadacz</td><td>0,38 zł - 0,39 zł</td></tr>
                                                <tr><td>Kierowca Gabarytów</td><td>0,35 zł - 0,37 zł</td></tr>
                                                <tr><td>Zaawansowany Kierowca</td><td>0,32 zł - 0,34 zł</td></tr>
                                                <tr><td>Kierowca</td><td>0,29 zł - 0,31 zł</td></tr>
                                                <tr><td>Początkujący Kierowca</td><td>0,25 zł - 0,28 zł</td></tr>
                                                <tr><td>Kierowca Podwójnej Obsady</td><td>0,21 zł - 0,24 zł</td></tr>
                                                <tr><td>Rekrut</td><td>0,16 zł - 0,20 zł</td></tr>
                                                <tr><td>Stażysta</td><td>0,11 zł - 0,15 zł</td></tr>
                                                <tr><td>Żółtodziób</td><td>0,10 zł</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                            </div>
                        </div>
                        
                    </div>
                    { historia.response ? (historia.dane ? histBody(historia.dane) : histBody(null)) : initHistoria() }
                    </>
                : initDane()
                }
                </div>
            </div>
        </>
    );
};