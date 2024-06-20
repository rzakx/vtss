import {
	Route,
	BrowserRouter as Router,
	Routes,
	Navigate,
} from "react-router-dom";
import Profil from "./Strony/Profil";
import Glowna from "./Strony/Glowna";
import Logowanie from "./Strony/Logowanie";
import ResetHasla from "./Strony/ResetHasla";
import Trasy from "./Strony/Trasy";
import Ranking from "./Strony/Ranking";
import Dyspozytornia from "./Strony/Dyspozytornia";
import Uprawnienia from "./Strony/Uprawnienia";
import MenadzerKont from "./Strony/MenadzerKont";
import Incydenty from "./Strony/Incydenty";
import Podwyzka from "./Strony/Podwyzka";
import Ustawienia from "./Strony/Ustawienia";
import Urlop from "./Strony/Urlop";
import Pusta from "./Strony/Pusta";
import Winiety from "./Strony/Winiety";
import Mapa from "./Strony/Mapa";
import Rekrutacja from "./Strony/Rekrutacja";
import "./style.css";
import Nadajwiniety from "./Strony/Nadajwiniety";

export default function Aplikacja() {
	const state = localStorage.getItem("token")
		? localStorage.getItem("token")
		: false;
	return (
		<Router>
			<Routes>
				<Route path="/" element={state ? <Glowna /> : <Navigate to="/zaloguj" />} />

				<Route path="/profil" element={state ? <Profil /> : <Navigate to="/zaloguj"/>}>
					<Route path="/profil/:loginP" element={state ? <Profil /> : <Navigate to="/zaloguj"/>} />
				</Route>

				<Route path="/zaloguj" element={state ? <Navigate to="/" /> : <Logowanie />} />
				<Route path="/reset" element={state ? <Glowna /> : <ResetHasla />} />

				<Route path="/trasy" element={state ? <Trasy /> : <Navigate to="/zaloguj" />} />

				<Route path="/ranking" element={state ? <Ranking /> : <Navigate to="/zaloguj" />} />
				<Route path="/podwyzka" element={state ? <Podwyzka /> : <Navigate to="/zaloguj" />} />
				<Route path="/urlop" element={state ? <Urlop /> : <Navigate to="/zaloguj" />} />
				<Route path="/incydenty" element={state ? <Incydenty /> : <Navigate to="/zaloguj" />} />

				<Route path="/dyspozytornia" element={state ? <Dyspozytornia /> : <Navigate to="/zaloguj" />} />
				<Route path="/dyspozytornia/:trasaID" element={state ? <Dyspozytornia /> : <Navigate to="/zaloguj" />} />
				<Route path="/uprawnienia" element={state ? <Uprawnienia /> : <Navigate to="/zaloguj" />} />

				<Route path="/konta" element={state ? <MenadzerKont /> : <Navigate to="/zaloguj" />} />
				<Route path="/ustawienia" element={state ? <Ustawienia /> : <Navigate to="/zaloguj" />} />

				<Route path="/winiety" element={state ? <Winiety /> : <Navigate to="/zaloguj" />} />
				<Route path="/winiety/:komu" element={state ? <Nadajwiniety /> : <Navigate to="/zaloguj" />} />
				
				<Route path="/mapa" element={state ? <Mapa /> : <Navigate to="/zaloguj" />} />
				<Route path="/rekrutacja" element={state ? <Rekrutacja /> : <Navigate to="/zaloguj" />} />

				<Route path="*" element={<Pusta />} />
			</Routes>
		</Router>
	);
}
