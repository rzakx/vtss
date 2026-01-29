import React, { useEffect, useRef, useState } from 'react';
import { io } from "socket.io-client";
import IkonkaTruck from '../SVG/IkonkaTruck';
import IkonkaNaczepa from "../SVG/IkonkaNaczepa";

export default function MapaETS(props){
	const [gracze, setGracze] = useState([]);
	const [wybrany, setWybrany] = useState(false);
	const socketRef = useRef(null);


	//socket
	useEffect(() => {
		socketRef.current = io("https://telemetria.thebossspedition.pl");
		const socket = socketRef.current;
		const socketOnConnect = (e) => {
			console.log("Połączono z backendem, socket, prosze o pozycje");
			socket.emit("poprosPozycje");
		}
		const socketOtrzymajPozycje = (e) => {
			console.log("Otrzymane pozycje: ", e);
			setGracze(e);
		}
		const socketOnDisconnect = (e) => {
			console.log("Rozłączono socket!");
		}
		socket.on("connect", socketOnConnect);
		socket.on("otrzymajPozycje", socketOtrzymajPozycje);
		socket.on("disconnect", socketOnDisconnect);
		return () => {
			socket.off("connect", socketOnConnect);
			socket.off("otrzymajPozycje", socketOtrzymajPozycje);
			socket.off("disconnect", socketOnDisconnect);
		};
	}, []);

	const Licznik = (props) => {
		const grad = useRef(null);
		const poprzedniaWartosc = useRef(props.cur);
		//min 0 max 180 tickow 7
		//max - min / tickow - 1
		// 0 30 60 90 120 150 180
	
		useEffect(() => {
			const linia = grad.current;
			if(!linia) return;
			console.log(props.cur, poprzedniaWartosc.current);
			const dlugosc = linia.getTotalLength();
			const wypelnienie = Math.min(Math.abs((props.cur - props.min) / (props.max - props.min)), 1) * dlugosc;
			const wypelnieniePoprzednie = Math.min(Math.abs((poprzedniaWartosc - props.min) / (props.max - props.min)), 1) * dlugosc;

			linia.style.strokeDasharray = `${wypelnieniePoprzednie} ${dlugosc - wypelnieniePoprzednie}`;

			requestAnimationFrame(() => {
				linia.style.transition = 'stroke-dasharray 0.8s ease';
				linia.style.strokeDasharray = `${wypelnienie} ${dlugosc - wypelnienie}`;
			});
			poprzedniaWartosc.current = props.cur;
		}, [props.cur, props.min, props.max]);
	
		return(
			<div className="licznik" style={props.style}>
				<svg width="300" height="300" viewBox="0 0 400 400">
					<defs>
						<linearGradient id="grad1">
							<stop offset="10%" stopColor="#8bc34a" />
							<stop offset="20%" stopColor="#ffeb3b" />
							<stop offset="95%" stopColor="#af003c" />
						</linearGradient>
						<linearGradient id="gradOdwrotne">
							<stop offset="5%" stopColor="#af003c" />
							<stop offset="35%" stopColor="#ffeb3b" />
							<stop offset="100%" stopColor="#8bc34a" />
						</linearGradient>
					</defs>
	
					<path ref={grad}
						fill="none"
						stroke={props.odwrocKolory ? "url(#gradOdwrotne)" : "url(#grad1)"}
						strokeWidth="30"
						strokeLinecap="round"
						d="M 45 300 A 184.5 184.5 0 1 1 355 300"
					/>
				</svg>
				<div className='licznikTekstowe'>
					<span>{props.tytul}</span>
					<p>{props.cur} {props.jednostka}</p>
				</div>
			</div>
		)
	}

	const InformacjeWybranego = () => {
		const tmpObj = gracze.find(v => v.login === wybrany);
		console.log(tmpObj);

		let logoMarka;
        if(tmpObj.ciezarowka){
            switch(tmpObj.ciezarowka.marka){
                case 'Mercedes-Benz':
                    logoMarka = "MERCEDES.webp";
                    break;
                case 'Scania':
                    logoMarka = "SCANIA.webp";
                    break;
                case 'Renault Trucks':
                    logoMarka = "RENAULT.webp";
                    break;
                case 'DAF':
                    logoMarka = "DAF.webp";
                    break;
                case 'Iveco':
                    logoMarka = "IVECO.webp";
                    break;
                case 'Volvo':
                    logoMarka = "VOLVO.webp";
                    break;
                case 'MAN':
                    logoMarka = 'MAN.webp';
                    break;
            }
        }
		return(
			<div className="naviPanelInformacje">
				<h3>Kierowca {wybrany}</h3>
				<p className='naviZnacznikCzasowy'>Dane z { new Date(tmpObj.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', hour: "2-digit", minute: "2-digit", second: "2-digit"})}</p>
				<div className="naviIkonkiGlowne">
					<IkonkaTruck title={tmpObj.ciezarowka == null ? `Kierowca nie prowadzi aktualnie żadnego pojazdu.` : `Uszkodzenia: Nieznane`} style={tmpObj.ciezarowka == null ? {opacity: 0.2} : null} />
					<IkonkaNaczepa title={tmpObj.naczepa == null ? `Kierowca nie posiada aktualnie żadnej naczepy.` : `Uszkodzenia: Nieznane`} style={tmpObj.naczepa == null ? {opacity: 0.2} : null} />
				</div>

				<div className='naviDaneContainer' style={{alignItems: 'flex-start', justifyContent: 'space-around', gap: "10px", marginBottom: "30px", marginLeft: '-10px', marginRight: '-10px'}}>
					<div>
                        <span>Ciężarówka</span>
						{ tmpObj.ciezarowka == null ? <div className='naviMaleNapisy'><p>Brak</p></div> :
						<div className='naviMarkaModel'>
							<img className='naviLogoTruck' src={`/img/marki/${logoMarka}`} />
							<div className='naviMaleNapisy naviMarkaModel' style={{width: 'min-content', textWrap: 'nowrap'}}>
                                <p>{tmpObj.ciezarowka.marka}</p>
                                <p>{tmpObj.ciezarowka.model}</p>
							</div>
						</div> }
					</div>
					<div className='naviMaleNapisy'>
                        <span>Naczepa</span>
						{ tmpObj.naczepa == null ? <p>Brak</p> : 
						<>
							<p style={{textWrap: 'nowrap'}}>{tmpObj.naczepa.typNaczepy} {tmpObj.naczepa.typLancucha}</p>
							<p>{tmpObj.praca == null ? "Brak załadunku" : <>{tmpObj.praca.ladunek} {Math.round(tmpObj.praca.wagaNaczepy/1000)} t</>}</p>
						</> }
					</div>
				</div>

				<div className='naviDaneContainer' style={{flexDirection: "column", marginBottom: "50px"}}>
					<span>Aktualne zlecenie:</span>
					{ tmpObj.praca == null ? <p>Brak</p> :
					<>
						<p>Skąd: Polska, {tmp.skad}, {tmp.skadFirma}</p>
						<p>Dokąd: Polska, {tmp.dokad}, {tmp.dokadFirma}</p>
					</> }
				</div>
				
				<div className='naviDaneContainer' style={{flexDirection: "column", marginBottom: "30px"}}>
					<span style={{marginBottom: "10px"}}>Telemetria</span>
					<div className='naviDaneContainer' style={{width: "100%", justifyContent: "space-between"}}>
						<Licznik min={0} max={180} cur={tmpObj.pozycja ? tmpObj.pozycja.speed ? parseInt(tmpObj.pozycja.speed*3600/1000) : 0 : 0} jednostka={"km/h"} tytul={"Prędkość"} />
						<Licznik min={0} max={tmpObj.ciezarowka ? tmpObj.ciezarowka.maxObroty ? tmpObj.ciezarowka.maxObroty : 2400 : 2400} cur={tmpObj.ciezarowka ? tmpObj.pozycja ? tmpObj.pozycja.rpm ? parseInt(tmpObj.pozycja.rpm) : 0 : 0 : 0} jednostka={"obr"} tytul={"Obroty"} />
						<Licznik style={{width: '80px', height: '80px', marginTop: "20px"}} min={0} max={tmpObj.ciezarowka ? tmpObj.ciezarowka.maxPaliwo ? tmpObj.ciezarowka.maxPaliwo : 1000 : 1000} cur={tmpObj.ciezarowka ? tmpObj.pozycja ? tmpObj.pozycja.fuel ? parseInt(tmpObj.pozycja.fuel) : 0 : 0 : 0} jednostka={"l"} tytul={"Paliwo"} odwrocKolory={true}/>
					</div>

					<div className='naviDaneContainer' style={{width: "100%", marginTop: "10px"}}>
						<div className='naviWspolrzedne'>
							<b>Pozycja X:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.positionX ? Number(tmpObj.pozycja.positionX).toFixed(0) : "Nieznane"}
						</div>
						<div className='naviWspolrzedne'>
							<b>Pozycja Y:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.positionZ ? Number(tmpObj.pozycja.positionZ).toFixed(0) : "Nieznane"}
						</div>
						<div className='naviWspolrzedne'>
							<b>Rotacja:</b><br />{tmpObj.pozycja == null ? "Nieznane" : tmpObj.pozycja.heading ? `${Number(tmpObj.pozycja.heading).toFixed(0)}°` : "Nieznane"}
						</div>
					</div>
				</div>
				<div style={{display: 'flex', width: '100%', gap: 20}}>
					<button className="naviSledz">Śledź na mapie</button>
					<button onClick={() => setWybrany(null)}>Zamknij</button>
				</div>
			</div>
		)
	};


	return(<>
		<div className="naviPanel">
			<h3>Lista kierowców</h3>
			<div className='naviPanelKierowcy'>
				{ gracze.map((gracz, klucz) => {
					return <div key={`${gracz.login}_${gracz.kiedy}`} className="naviPanelKierowca" onClick={() => setWybrany(gracz.login)}>
						<img src={"/img/awatary/default.png"} />
						<div>
							<span>{gracz.login}</span>
							<p>{ new Date(gracz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', hour: "2-digit", minute: "2-digit", second: "2-digit"})}</p>
						</div>
					</div>
				}) }
			</div>
			<InformacjeWybranego />
            
		</div>
	</>)
};