import { memo,useState, useCallback } from "react";
import Axios from "axios";
import gb from "../GlobalVars"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const WiadomoscGlobalna = ({toast}) => {
    const [ message, setMessage ] = useState(undefined);
    const [ action, setAction ] = useState(false);

    const sendMessage = useCallback(async (tresc) => {
        setAction(true);
        if (!tresc) {
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Niewysłano wiadomości globalnej. Wiadomość nie może być pusta.",
            });
            return;
        }
        await Axios.post(gb.backendIP+"wiadomoscGlobalna/"+localStorage.getItem("login")+"/"+localStorage.getItem("token"),
            { wiadomosc: tresc }
        ).then((r) => {
            if (!r.data["blad"]) {
                toast({
                    title: "Wiadomość globalna",
                    className: "bg-green-500 text-green-50",
                    description: "Wiadomość została przekazana do kierowców za pośrednictwem bota Discord.",
                });
                setMessage(undefined);
            } else {
                toast({
                    title: "Wystąpił błąd",
                    variant: "destructive",
                    description: "Niewysłano wiadomości globalnej. Błąd: " + r.data["blad"],
                });
            }
        }).catch((er) => {
            console.log(er);
            toast({
                title: "Wystąpił błąd",
                variant: "destructive",
                description: "Niewysłano wiadomości globalnej. Błąd: " + er.message,
            });
        }).finally(() => setAction(false));
    }, [toast]);

    return (
        <Card className="border-0">
            <CardHeader className="text-center">
                <CardTitle>Wiadomość globalna</CardTitle>
                <CardDescription>
                    Wiadomość wysyłana do wszystkich użytkowników systemu z
                    kontem Discord.
                </CardDescription>
            </CardHeader>
            <CardContent className="-mt-4 grow">
                <Textarea
                    className="h-full max-h-42.5 resize-none overflow-y-auto"
                    value={message ?? ""}
                    onChange={ (e) => setMessage(e.target.value ) }
                    placeholder="Uzupełnij zawartość wysyłanej wiadomości"
                    disabled={action}
                />
            </CardContent>
            <CardFooter className="-mt-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full not-disabled:cursor-pointer" disabled={!message || action} >Wyślij</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Potwierdzenie czynności</AlertDialogTitle>
                            <AlertDialogDescription>
                                Czy aby napewno chcesz wysłać wiadomość
                                globalną? Otrzyma ją każdy użytkownik systemu,
                                który ma powiązane konto Discord.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
                            <AlertDialogAction className="cursor-pointer" onClick={() => sendMessage(message) } >Potwierdź</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
};
export default memo(WiadomoscGlobalna);