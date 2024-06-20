import Axios from "axios";
import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import gb from "../GlobalVars";

export default function Rekrutacja(props){
    const [rekru, setRekru] = useState({response: false, dane: null, wybrane: null, blad: null});

    const dostanInfo = () => {
        Axios.post(gb.backendIP+"rekrutacja/"+localStorage.getItem("token")).then((r) => {
            setRekru({...rekru, ...r.data});
        }).catch((er) => {
            console.log(er);
            setRekru({response: true, dane: null, wybrane: null});
        });
    };

    const wyswietlInfo = () => {
        console.log(rekru);
		if(rekru.dane){
			return(<>
				<div className="rekrutacja">
					<table>
						<thead><tr><th>ID</th><th>Pseudonim</th><th>E-Mail</th><th>Wiek</th><th>Godziny</th><th>TruckersMP</th><th>TruckBook</th><th>Steam</th><th>Akcja</th></tr></thead>
						<tbody>
							{rekru.dane.map((wiersz) => {
								return(
									<tr key={`rekrutacja_${wiersz.id}`}>
										<td>{wiersz.id}</td>
										<td>{wiersz.pseudonim}</td>
										<td>{wiersz.email}</td>
										<td>{wiersz.lat} lat</td>
										<td>{wiersz.godzin} h</td>
										<td>{wiersz.truckersmp ? <a target="_blank" href={`https://truckersmp.com/user/${wiersz.truckersmp}`}>{wiersz.truckersmp}</a> : "Niepodano"}</td>
										<td>{wiersz.truckbook ? <a target="_blank" href={`https://trucksbook.eu/users/all/0?search=${wiersz.truckbook}`}>{wiersz.truckbook}</a> : "Niepodano"}</td>
										<td>{wiersz.steamid ? <a target="_blank" href={`https://steamcommunity.com/profiles/${wiersz.steamid}`}>Odnośnik</a> : "Niepodano"}</td>
										<td><button onClick={() => setRekru({...rekru, wybrane: wiersz})}>Rozpatrz</button></td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</>);
		} else {
			return(<>
				<div className="rekrutacja" style={{}}>
					<span style={{textAlign: 'center', width: '100%', display: 'block', margin: '100px 0'}}><b>Rekrutacja</b><br/><br/><br/>Brak aktywnych zgłoszeń!</span>
				</div>
			</>);
		}
    };
	const decyzja = (dane, wybor) => {
		if(wybor){
			//akceptacja
			console.log("akceptacja");
			Axios.post(gb.backendIP+"rekrutacjaPrzyjmij/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {...dane}).then((r) => {
				if(r.data['odp']){
					setRekru({response: false, dane: null, wybrane: null, blad: r.data['blad']});
				} else {
					setRekru({...rekru, blad: r.data['blad']});
				}
			}).catch((er) => {
				setRekru({...rekru, blad: "Błąd zapytania do BackEnd'u"});
			});
		} else {
			//odrzucenie
			console.log("odrzucenie");
			Axios.post(gb.backendIP+"rekrutacjaOdrzuc/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"), {...dane}).then((r) => {
				console.log("Odrzucono");
				if(r.data['odp']){
					setRekru({response: false, dane: null, wybrane: null, blad: r.data['blad']});
				} else {
					setRekru({...rekru, blad: r.data['blad']});
				}
			}).catch((er) => {
				setRekru({...rekru, blad: "Błąd zapytania do BackEnd'u"});
			});
		}
	};

	const rozpatrzOkno = () => {
		return(
			<div className="rozpatrzRekrutacje">
				<div className="rekrutacjaWiersz">
					<div>
						<span>ID Zgłoszenia</span>
						<span>{rekru.wybrane.id}</span>
					</div>
					<div>
						<span>Pseudonim</span>
						<span>{rekru.wybrane.pseudonim}</span>
					</div>
					<div>
						<span>E-Mail</span>
						<span>{rekru.wybrane.email}</span>
					</div>
					<div>
						<span>Wiek</span>
						<span>{rekru.wybrane.lat} lat</span>
					</div>
					<div>
						<span>Godziny w grze</span>
						<span>{rekru.wybrane.godzin} h</span>
					</div>
				</div>
				<div className="rekrutacjaWiersz">
					<div>
						<span>TruckersMP</span>
						{rekru.wybrane.truckersmp ? <a target="_blank" href={`https://truckersmp.com/user/${rekru.wybrane.truckersmp}`}>{rekru.wybrane.truckersmp}</a> : <span>Niepodano</span>}
					</div>
					<div>
						<span>TrucksBook</span>
						{rekru.wybrane.truckbook ? <a target="_blank" href={`https://trucksbook.eu/users/all/0?search=${rekru.wybrane.truckbook}`}>{rekru.wybrane.truckbook}</a> : <span>Niepodano</span>}
					</div>
					<div>
						<span>Steam</span>
						{rekru.wybrane.steamid ? <a target="_blank" href={`https://steamcommunity.com/profiles/${rekru.wybrane.steamid}`}>Odnośnik</a> : <span>Niepodano</span>}
					</div>
					<div>
						<span>Discord ID</span>
						<span>{`<@${rekru.wybrane.discord}>`}</span>
					</div>
					<div>
						<span>Kto polecił</span>
						{rekru.wybrane.ktopolecil ? <span>{rekru.wybrane.ktopolecil}</span> : <span>Nikt</span>}
					</div>
				</div>
				<div className="rekrutacjaWiersz">
					<div>
						<span>Uzasadnienie</span>
						<textarea value={rekru.wybrane.dlaczego ? rekru.wybrane.dlaczego : "Niepodano"} disabled />
					</div>
				</div>
				<div className="rekrutacjaWiersz">
					<button onClick={() => setRekru({...rekru, wybrane: null})}>Zamknij</button>
					<button onClick={() => decyzja(rekru.wybrane, false)}>Odrzuć</button>
					<button onClick={() => decyzja(rekru.wybrane, true)}>Przyjmij</button>
				</div>
			</div>
		)
	};

	const wyswietlBlad = () => {
		return(
			<div className="bladRekrutacja" onClick={() => { setRekru({...rekru, blad: null})}}>
				<span>{rekru.blad}</span>
			</div>
		);
	};

    return(
        <>
        <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna" style={{minHeight: '500px'}}>
					{!rekru.response ? dostanInfo() : wyswietlInfo()}
					{rekru.wybrane && rozpatrzOkno() }
					{rekru.blad && wyswietlBlad()}
                </div>
            </div>
        </>
    );
};