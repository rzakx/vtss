import Nawigacja from "../Komponenty/Nawigacja";
import { useEffect, useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Ranking(props){
    const dateObj = new Date();
    const [ odswiezyc, setOdswiezyc ] = useState(1);
    const lastMonth = dateObj.toISOString().split('T')[0].slice(0,-3);
    const [ miesiacRok, setMiesiacRok ] = useState(lastMonth);
    const [ dane, setDane ] = useState(null);
    const [ coSortowac, setCoSortowac ] = useState('przejechane');
    const [ jakSortowac, setJakSortowac ] = useState(false); //true ASC false DESC
    const [ filtrowanie, setFiltrowanie ] = useState("razem"); //razem, ets, ats
    document.title = "The Boss Spedition - Ranking "+new Date(miesiacRok).toLocaleString('pl-PL', {month: 'long', year: 'numeric'});
    
    const odswiezDane = () => {
        if(filtrowanie === "razem"){
            Axios.post(gb.backendIP+"ranking/"+miesiacRok).then((res) => {
                if(!res.data['blad']){
                    setDane(res.data['dane']);
                } else {
                    setDane(null);
                }
            }).catch((er) => console.log(er));
        }
        if(filtrowanie === "ets"){
            Axios.post(gb.backendIP+"rankingETS/"+miesiacRok).then((res) => {
                if(!res.data['blad']){
                    setDane(res.data['dane']);
                } else {
                    setDane(null);
                }
            }).catch((er) => console.log(er));
        }
        if(filtrowanie === "ats"){
            Axios.post(gb.backendIP+"rankingATS/"+miesiacRok).then((res) => {
                if(!res.data['blad']){
                    setDane(res.data['dane']);
                } else {
                    setDane(null);
                }
            }).catch((er) => console.log(er));
        }
        setOdswiezyc(0);
    };

    useEffect(() => {

    }, [odswiezyc, miesiacRok])

    const przygotujSort = (poczym) => {
        if(coSortowac === poczym){
            setJakSortowac(!jakSortowac);
        } else {
            setCoSortowac(poczym);
		}
    };

    const zwrocDane = () => {
        if(dane){
            let tmpDane = dane.sort((a, b) => {
				if(coSortowac){
                    if(coSortowac){
                        if(jakSortowac){
                            return a[coSortowac] - b[coSortowac];
                        } else {
                            return b[coSortowac] - a[coSortowac];
                        }
                    }
				}
            });
            let sumaPrzejechane = 0;
            let sumaTonaz = 0;
            let sumaTras = 0;
            let sumaSpalanie = 0;
            let sumaZarobek = 0;
            let sumaWlasnyZarobek = 0;
            let liczbaRekordow = 0;
            tmpDane.map(rekord => {
                sumaPrzejechane += rekord.przejechane;
                sumaTonaz += rekord.tonaz;
                sumaTras += rekord.tras;
                sumaSpalanie += rekord.spalanie;
                sumaZarobek += rekord.zarobek;
                sumaWlasnyZarobek += rekord.wlasnyzarobek;
                liczbaRekordow += 1;
            })

            return(
                <div className="relative">

                    <table className="
                    border-collapse
                    w-full
                    [&_img]:rounded-[50%]
                    [&_img]:align-middle
                    [&_img]:mr-5
                    [&_img]:w-11.25
                    [&_img]:h-11.25
                    [&_img]:inline
                    wejscieSmooth">
                        <thead className="[&_tr]:border-l-2 [&_tr]:border-l-transparent">
                        <tr className="
                        [&_th]:cursor-pointer
                        [&_th]:border-b
                        [&_th]:border-b-[goldenrod]
                        [&_th]:py-2.5
                        [&_th]:px-3.75
                        [&_th]:text-left
                        [&_th]:align-middle
                        [&_th]:transition-all
                        [&_th]:duration-300
                        [&_th:hover]:tracking-[1px]
                        [&_th:hover]:bg-[#0f0f0f]
                        [&_th]:select-none
                        ">
                            <th>Użytkownik</th>
                            <th className={(coSortowac === 'przejechane') ? (jakSortowac ? "border-b border-b-[crimson] text-[crimson] tracking-[1px] bg-[#0e0e0e]" : "border-b border-b-[#3d3] text-[#3d3] tracking-[1px] bg-[#0e0e0e]") : "hover:text-[#eee]"} onClick={() => przygotujSort('przejechane')}>Przejechane</th>
                            <th className={(coSortowac === 'tonaz') ? (jakSortowac ? "border-b border-b-[crimson] text-[crimson] tracking-[1px] bg-[#0e0e0e]" : "border-b border-b-[#3d3] text-[#3d3] tracking-[1px] bg-[#0e0e0e]") : "hover:text-[#eee]"} onClick={() => przygotujSort('tonaz')}>Tonaż</th>
                            <th className={(coSortowac === 'tras') ? (jakSortowac ? "border-b border-b-[crimson] text-[crimson] tracking-[1px] bg-[#0e0e0e]" : "border-b border-b-[#3d3] text-[#3d3] tracking-[1px] bg-[#0e0e0e]") : "hover:text-[#eee]"} onClick={() => przygotujSort('tras')}>Ilość tras</th>
                            <th className={(coSortowac === 'spalanie') ? (jakSortowac ? "border-b border-b-[crimson] text-[crimson] tracking-[1px] bg-[#0e0e0e]" : "border-b border-b-[#3d3] text-[#3d3] tracking-[1px] bg-[#0e0e0e]") : "hover:text-[#eee]"} onClick={() => przygotujSort('spalanie')}>Śr. Spalanie</th>
                            <th className={(coSortowac === 'zarobek') ? (jakSortowac ? "border-b border-b-[crimson] text-[crimson] tracking-[1px] bg-[#0e0e0e]" : "border-b border-b-[#3d3] text-[#3d3] tracking-[1px] bg-[#0e0e0e]") : "hover:text-[#eee]"} onClick={() => przygotujSort('zarobek')}>Zarobek</th>
                            <th title="Bez uwzględniania kar!" className={(coSortowac === 'wlasnyzarobek') ? (jakSortowac ? "border-b border-b-[crimson] text-[crimson] tracking-[1px] bg-[#0e0e0e]" : "border-b border-b-[#3d3] text-[#3d3] tracking-[1px] bg-[#0e0e0e]") : "hover:text-[#eee]"} onClick={() => przygotujSort('wlasnyzarobek')}>Własny zarobek</th>
                        </tr>
                        </thead>
                        <tbody className="
                        [&_tr]:border-l-2 [&_tr]:border-l-transparent
                        [&_tr_td]:py-2.5
                        [&_tr_td]:px-3.75
                        [&_tr_td]:text-left
                        [&_tr_td]:align-middle
                        [&_tr_td]:transition-all
                        [&_tr_td]:duration-300
                        [&_tr:nth-child(odd)_td]:bg-[#121212]
                        [&_tr:nth-child(even)_td]:bg-[#161616]
                        [&_tr:hover_td]:bg-[#1C1C1C]
                        [&_tr:hover_td]:text-[#ddd]
                        ">
                        { tmpDane.map(rekord => {
                            return(
                            <tr key={"dane_"+rekord.id} className={(rekord.login === localStorage.getItem('login')) ? "border-l-2 border-l-[#3f3]" : ""}>
                                <td><a href={"/profil/"+rekord.login}><img src={"img/"+rekord.awatar} />{rekord.login}</a></td>
                                <td>{rekord.przejechane.toLocaleString()} km</td>
                                <td>{rekord.tonaz.toLocaleString("pl-PL")}</td>
                                <td>{rekord.tras.toLocaleString("pl-PL")}</td>
                                <td>{rekord.spalanie.toFixed(1).toLocaleString()} l / 100 km</td>
                                <td>{rekord.zarobek.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</td>
                                <td title="Bez uwzględniania kar!">{rekord.wlasnyzarobek.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</td>
                            </tr>
                            );
                        })}
                        <tr>
                            <td><b>SUMA</b></td>
                            <td><b>{sumaPrzejechane.toLocaleString()} km</b></td>
                            <td><b>{sumaTonaz.toLocaleString("pl-PL")}</b></td>
                            <td><b>{sumaTras.toLocaleString("pl-PL")}</b></td>
                            <td><b>{(sumaSpalanie/liczbaRekordow).toFixed(1).toLocaleString()} l / 100 km</b></td>
                            <td><b>{sumaZarobek.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</b></td>
                            <td title="Bez uwzględniania kar!"><b>{sumaWlasnyZarobek.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</b></td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="absolute bottom-full right-0 bg-[#121212] items-center flex gap-2.5 py-1.25 px-2.5">
                        <b>Filtruj gry: </b>
                        <select className="p-1 border-0 outline-0 bg-[#a5a5a5] max-w-37.5 font-medium text-[1rem] text-black" value={filtrowanie} onChange={(e) => {
                            setFiltrowanie(e.target.value);
                            setOdswiezyc(1);
                        }}>
                            <option value={"razem"}>Razem</option>
                            <option value={"ets"}>ETS2</option>
                            <option value={"ats"}>ATS</option>
                        </select>
                    </div>
                </div>
            );
        }
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    <input type="month" className="absolute left-0 bottom-full p-2 bg-[#181818] outline-0 border-0 text-[orange] text-[1.1rem] scheme-dark" min="2021-03" value={miesiacRok} max={lastMonth} onChange={(e) => {
                        // e.preventDefault();
                        let tmp = e.target.value;
                        if(!tmp) return;
                        // let wynik;
                        // let rozbij = tmp.split("-");
                        // wynik = rozbij[0];
                        // if(rozbij[1] > 0){
                        //     wynik = wynik + "-" + rozbij[1].padStart(2, "0");
                        // }
                        // console.log(wynik)
                        // let tmpDate = new Date(e.target.value);

                        // setMiesiacRok(wynik);
                        setMiesiacRok(e.target.value);
                        setOdswiezyc(1);
                    }}
                    placeholder={lastMonth}/>
                    { odswiezyc ? odswiezDane() : "" }
                    { (dane && coSortowac) ? zwrocDane() : <p className="w-full text-center p-7.5 text-[1.1rem] wejscieSmooth">Brak danych!</p>}
                </div>
            </div>
        </>
    );
}