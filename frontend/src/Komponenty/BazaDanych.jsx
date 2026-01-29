import { memo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import DialogMiasta from "./DialogMiasta";
import DialogPaliwo from "./DialogPaliwo";
import DialogPromy from "./DialogPromy";

const BazaDanych = ({toast}) => {
	const [ ferryOpen, setFerryOpen ] = useState(false);
	const [ citiesOpen, setCitiesOpen ] = useState(false);
	const [ fuelOpen, setFuelOpen ] = useState(false);

	return (
		<Card className="border-0">
			<CardHeader className="text-center">
				<CardTitle>Baza danych gry</CardTitle>
				<CardDescription>Aby otworzyć zarządzanie poszczególną kategorią kliknij w poniższy przycisk.</CardDescription>
			</CardHeader>
			<CardFooter className="-mt-4 gap-2 justify-center flex-wrap">
				<DialogMiasta isOpen={citiesOpen} setOpen={setCitiesOpen} toast={toast} />
				<DialogPromy isOpen={ferryOpen} setOpen={setFerryOpen} toast={toast} />
				<DialogPaliwo isOpen={fuelOpen} setOpen={setFuelOpen} toast={toast} />
			</CardFooter>
		</Card>
	);
};
export default memo(BazaDanych);