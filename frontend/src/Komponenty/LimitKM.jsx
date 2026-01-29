import { memo,useState, useCallback, useEffect} from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LimitKM = ({ toast }) => {
    const [loaded, setLoaded] = useState(false);
    const [action, setAction] = useState(false);
    const [limit, setLimit] = useState(undefined);

    const initLimit = useCallback(async () => {
        setLoaded(false);
        await Axios.post(gb.backendIP + "glownaInfo")
            .then((r) => setLimit(r.data.limit_km))
            .catch(() => {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description:
                        "Wystąpił błąd podczas wczytywania zapisanych wartości limitu kilometrów.",
                });
            })
            .finally(() => setLoaded(true));
    }, [toast]);

    const changeLimit = useCallback(async () => {
        if (typeof limit !== "number" || isNaN(limit)) {
            console.log("zly typ");
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Niepoprawna wartość limitu kilometrów...",
            });
            setLimit(undefined);
            setLoaded(false);
            setAction(false);
            return;
        }
        if (limit < 0) {
            console.log("ponizej 0");
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description:
                    "Wartość limitu kilometrów musi być równa lub większa od 0.",
            });
            setLimit(undefined);
            setLoaded(false);
            setAction(false);
            return;
        }
        console.log(limit, typeof limit);
        await Axios.post(
            gb.backendIP + "ustawLimit/" + localStorage.getItem("login"),
            { limit: limit }
        )
            .then(() => {
                toast({
                    title: "Limit kilometrów",
                    className: "bg-green-500 text-green-50",
                    description: "Ustanowiono nową wartość limitu kilometrów!",
                });
                setLimit(undefined);
                setLoaded(false);
            })
            .catch((er) =>
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description:
                        "Nieustanowiono nowej wartości limitu KM. " +
                        er.message,
                })
            )
            .finally(() => {
                setAction(false);
            });
    }, [limit, toast]);

    useEffect(() => {
        if (!loaded) initLimit();
        if (action) changeLimit();
    }, [action, changeLimit, initLimit, loaded]);

    return (
        <Card className="border-0">
            <CardHeader className="text-center">
                <CardTitle>Limit KM</CardTitle>
                <CardDescription>
                    Ustalona miesięczna wartość kilometrów do wykonania przez
                    kierowców.
                </CardDescription>
            </CardHeader>
            <CardContent className="-mt-4">
                <div className="space-x-2 flex">
                    <Input
                        type="number"
                        placeholder="Podaj wartość"
                        value={loaded ? limit : ""}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        disabled={!loaded || action}
                    />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="not-disabled:cursor-pointer" disabled={!loaded || action} >Ustaw</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                                <AlertDialogDescription>Czy aby napewno chcesz ustawić nową wartość limitu kilometrów dla kierowców?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                                <AlertDialogAction className="cursor-pointer" onClick={() => setAction(true)} >Potwierdź</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
};
export default memo(LimitKM);