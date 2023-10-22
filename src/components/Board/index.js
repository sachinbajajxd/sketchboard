import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux'

import { MENU_ITEMS } from "@/constants";
import { actionItemClick } from '@/slice/menuSlice'

const Board = () => {

    const canvasRef=useRef(null);
    const activeMenuItem = useSelector((state) => state.menu.activeMenuItem);
    const {color, size} = useSelector((state) => state.toolbox[activeMenuItem]);

    useEffect(() => {
        if(!canvasRef.current) return;
        const canvas=canvasRef.current;
        const context=canvas.getContext('2d');

        canvas.height=window.innerHeight;
        canvas.width=window.innerWidth;
    }, []);

    console.log(color, size);

    return (
        <canvas ref={canvasRef}></canvas>
    )
}

export default Board;