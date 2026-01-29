import { useRef, useEffect } from "react";
export default function Licznik(props) {
    const grad = useRef(null);
    const poprzedniaWartosc = useRef(0);
    //min 0 max 180 tickow 7
    //max - min / tickow - 1
    // 0 30 60 90 120 150 180

    useEffect(() => {
        const linia = grad.current;
        if(!linia) return;
        const dlugosc = linia.getTotalLength();
        const wypelnienie = Math.min(Math.abs((props.cur - props.min) / (props.max - props.min)), 1) * dlugosc;
        const wypelnieniePoprzednie = Math.min(Math.abs((poprzedniaWartosc - props.min) / (props.max - props.min)), 1) * dlugosc;

        linia.style.strokeDasharray = `${wypelnieniePoprzednie} ${dlugosc - wypelnieniePoprzednie}`;

        requestAnimationFrame(() => {
            linia.style.transition = 'stroke-dasharray 1s ease';
            linia.style.strokeDasharray = `${wypelnienie} ${dlugosc - wypelnienie}`;
        });
        poprzedniaWartosc.current = props.cur;
    }, [props.cur, props.min, props.max]);

    return(
        <div className="relative w-25 h-25 bg-[#1c1c1c] rounded-[50%]
        shadow-[inset_0_0_5px_0_#0e0e0e,0_0_5px_#0e0e0e] border border-[#757575]
        [&_svg]:w-[90%] [&_svg]:h-[90%] [&_svg]:m-[5%]" style={props.style}>
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
            <div className='absolute top-1/2 left-1/2 translate-[-50%] text-center text-[1rem] tracking-[-1px]'>
                <span className="text-[0.8rem] tracking-[0px] text-[#ccc] text-shadow-[0_0_2px_#111] -mb-0.75">{props.tytul}</span>
                <p className="break-keep text-nowrap font-bold text-[0.9rem]">{props.cur} {props.jednostka}</p>
            </div>
        </div>
    )
}