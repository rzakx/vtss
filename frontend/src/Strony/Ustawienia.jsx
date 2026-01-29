import Nawigacja from "../Komponenty/Nawigacja";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import WiadomoscPowitalna from "@/Komponenty/WiadomoscPowitalna";
import Przelewy from "@/Komponenty/Przelewy";
import LimitKM from "@/Komponenty/LimitKM";
import WiadomoscGlobalna from "@/Komponenty/WiadomoscGlobalna";
import ZdjecieMiesiaca from "@/Komponenty/ZdjecieMiesiaca";
import BazaDanych from "@/Komponenty/BazaDanych";
import OknoWiniety from "@/Komponenty/OknoWiniety";

export default function Ustawienia() {
	const { toast } = useToast();

	return (
		<>
			<Nawigacja />
			<Toaster richColors />
			<div className="tlo" />
			<div className="srodekekranu">
				<div className="w-full max-w-300 relative grid grid-cols-3 gap-5">
					<WiadomoscPowitalna toast={toast} />
					<WiadomoscGlobalna toast={toast} />
					<OknoWiniety toast={toast} />
					<Przelewy toast={toast} />
					<div className="gap-5 flex flex-col justify-between">
						<LimitKM toast={toast} />
						<BazaDanych toast={toast} />
					</div>
					<ZdjecieMiesiaca toast={toast} />
				</div>
			</div>
		</>
	);
}
