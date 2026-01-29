import { useEffect } from "react";
export default function PopupTrasy(props){
    const styl = {
        'position': 'absolute',
        'zIndex': 100,
        'background': '#1e1e1ee6',
        'padding': '10px',
        'color': 'orangered',
        'bottom': '0',
        'left': '0',
        'top': '0',
        'right': '0',
        'display': 'flex',
        'alignItems': 'center',
        'justifyContent': 'center',
        'fontSize': '1.2rem',
        'fontWeight': 'bold',
        'animation': `popupTrasyFade ${props.dlugosc}ms ease forwards`,
        'cursor': 'pointer'
    }
    useEffect(() => {
        const odliczanie = setTimeout(props.wygasl, props.dlugosc);
        return () => clearTimeout(odliczanie);
    }, [])
    return(
        <div key={`popup_${props.time}`} style={styl} onClick={() => props.wygasl()}>
            <div>
                {props.zawartosc}
            </div>
        </div>
    )
}