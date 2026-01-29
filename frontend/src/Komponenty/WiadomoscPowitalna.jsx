import { memo,useState, useCallback, useEffect } from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const WiadomoscPowitalna = ({toast}) => {
    const [ action, setAction ] = useState(false);
    const [ loaded, setLoaded ] = useState(false);
    const [ message, setMessage ] = useState(undefined);

    const loadMessage = useCallback(async () => {
        setLoaded(false);
        await Axios.post(gb.backendIP + "glownaInfo")
        .then((r) => setMessage(r.data.informacja))
        .catch(() => {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description:
                    "Wystąpił błąd podczas wczytywania wiadomości powitalnej.",
            });
        })
        .finally(() => setLoaded(true));
    }, [toast]);

    const changeMessage = useCallback(async (tresc) => {
        setAction(true);
        if(!tresc) {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Wiadomość powitalna nie może być pusta..."
            })
            return;
        };
        await Axios.post(gb.backendIP+"ustawPowitalna/"+localStorage.getItem('login'), {
            tresc: tresc
        }).then(() => {
            toast({
                title: "Wiadomość powitalna",
                className: "bg-green-500 text-green-50",
                description: "Ustanowiono nową treść wiadomości powitalnej na stronie startowej.",
            });
            setLoaded(false);
        }).catch((er) => toast({
            title: "Wystąpił błąd",
            variant: "destructive",
            description: "Nieustanowiono nowej wiadomości powitalnej. "+er.message
        }));
        setAction(false);
    }, [toast]);

    useEffect(() => {
        if(!loaded) loadMessage();
    }, [loaded, loadMessage]);

    return (
        <Card className="border-0">
            <CardHeader className="text-center">
                <CardTitle>Wiadomość powitalna</CardTitle>
                <CardDescription>Zawartość tekstowa wyświetlana na samej górze strony głównej.</CardDescription>
            </CardHeader>
            <CardContent className="-mt-4 grow">
                <Textarea
                    className="h-full max-h-42.5 resize-none overflow-y-auto"
                    placeholder="Uzupełnij zawartość (opcjonalnie)"
                    value={ loaded ? message ?? ""	: "Trwa wczytywanie..." }
                    onChange={(e) => setMessage(e.target.value) }
                    disabled={!loaded || action}
                />
            </CardContent>
            <CardFooter className="-mt-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full not-disabled:cursor-pointer" disabled={!loaded || action} >Ustaw</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                            <AlertDialogDescription>Czy aby napewno chcesz ustawić nową wiadomość powitalną?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                            <AlertDialogAction className="cursor-pointer" onClick={() => changeMessage(message) }>Potwierdź</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
};
export default memo(WiadomoscPowitalna);