import {
	Route,
	BrowserRouter as Router,
	Routes,
	Navigate,
} from "react-router-dom";
import Profil from "./Strony/Profil.jsx";
import Glowna from "./Strony/Glowna.jsx";
import Logowanie from "./Strony/Logowanie.jsx";
import ResetHasla from "./Strony/ResetHasla.jsx";
// import Trasy from "./Strony/Trasy.jsx";
import Ranking from "./Strony/Ranking.jsx";
import Dyspozytornia from "./Strony/Dyspozytornia.jsx";
import Uprawnienia from "./Strony/Uprawnienia.jsx";
import MenadzerKont from "./Strony/MenadzerKont.jsx";
import Incydenty from "./Strony/Incydenty.jsx";
import Podwyzka from "./Strony/Podwyzka.jsx";
import Ustawienia from "./Strony/Ustawienia.jsx";
import Urlop from "./Strony/Urlop.jsx";
import Pusta from "./Strony/Pusta.jsx";
import Winiety from "./Strony/Winiety.jsx";
import Mapa from "./Strony/Mapa.jsx";
import Rekrutacja from "./Strony/Rekrutacja.jsx";
import Statystyka from "./Strony/Statystyka.jsx";
import "./index.css";
import "./style.css";
import Nadajwiniety from "./Strony/Nadajwiniety.jsx";
import { ThemeProvider } from './components/theme-provider';
import Szkolenia from "./Strony/Szkolenia.jsx";
import Szkolenie from "./Strony/Szkolenie.jsx";
import NoweTrasy from "./Strony/NoweTrasy.jsx";
import NowaDyspozytornia from "./Strony/NowaDyspozytornia.jsx";
import DyspozytorniaTrasa from "./Strony/DyspozytorniaTrasa.jsx";
// import Piaskownica from "./Strony/Piaskownica.jsx";

export default function Aplikacja() {
	const state = localStorage.getItem("token")
		? localStorage.getItem("token")
		: false;
	return (
		<Router>
			<ThemeProvider defaultTheme="dark" storageKey="motywAplikacji">
				<Routes>
					<Route path="/" element={state ? <Glowna /> : <Navigate to="/zaloguj" />} />

					<Route path="/profil" element={state ? <Profil /> : <Navigate to="/zaloguj"/>}>
						<Route path="/profil/:loginP" element={state ? <Profil /> : <Navigate to="/zaloguj"/>} />
					</Route>

					<Route path="/zaloguj" element={state ? <Navigate to="/" /> : <Logowanie />} />
					<Route path="/reset" element={state ? <Glowna /> : <ResetHasla />} />

					<Route path="/trasy" element={state ? <NoweTrasy /> : <Navigate to="/zaloguj" />} />
					{/* <Route path="/nowetrasy" element={state ? <NoweTrasy /> : <Navigate to="/zaloguj" />} /> */}

					<Route path="/ranking" element={state ? <Ranking /> : <Navigate to="/zaloguj" />} />
					<Route path="/podwyzka" element={state ? <Podwyzka /> : <Navigate to="/zaloguj" />} />
					<Route path="/urlop" element={state ? <Urlop /> : <Navigate to="/zaloguj" />} />
					<Route path="/incydenty" element={state ? <Incydenty /> : <Navigate to="/zaloguj" />} />

					{/* <Route path="/dyspozytornia" element={state ? <Dyspozytornia /> : <Navigate to="/zaloguj" />} /> */}
					{/* <Route path="/dyspozytornia/:trasaID" element={state ? <Dyspozytornia /> : <Navigate to="/zaloguj" />} /> */}
					<Route path="/dyspozytornia" element={state ? <NowaDyspozytornia /> : <Navigate to="/zaloguj" />} />
					<Route path="/dyspozytornia/:trasaID" element={state ? <DyspozytorniaTrasa /> : <Navigate to="/zaloguj" />} />
					<Route path="/uprawnienia" element={state ? <Uprawnienia /> : <Navigate to="/zaloguj" />} />

					<Route path="/konta" element={state ? <MenadzerKont /> : <Navigate to="/zaloguj" />} />
					<Route path="/ustawienia" element={state ? <Ustawienia /> : <Navigate to="/zaloguj" />} />

					<Route path="/winiety" element={state ? <Winiety /> : <Navigate to="/zaloguj" />} />
					<Route path="/winiety/:komu" element={state ? <Nadajwiniety /> : <Navigate to="/zaloguj" />} />
					
					<Route path="/mapa" element={state ? <Mapa /> : <Navigate to="/zaloguj" />} />
					<Route path="/rekrutacja" element={state ? <Rekrutacja /> : <Navigate to="/zaloguj" />} />
					<Route path="/statystyka" element={state ? <Statystyka /> : <Navigate to="/zaloguj" />} />

					<Route path='/szkolenia' element={state ? <Szkolenia /> : <Navigate to="/zaloguj" /> } />
					<Route path='/szkolenie/:szkolenieId' element={state ? <Szkolenie /> : <Navigate to="/zaloguj" /> } />

					{/* <Route path="/dev" element={state ? <Piaskownica /> : <Navigate to="/zaloguj" /> } /> */}
					<Route path="*" element={<Pusta />} />
				</Routes>
			</ThemeProvider>
		</Router>
	);
}
