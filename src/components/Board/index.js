import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { socket } from "@/socket";
import { MENU_ITEMS } from "@/constants";
import { actionItemClick } from '@/slice/menuSlice'

const Board = () => {

    const canvasRef=useRef(null);
    const dispatch=useDispatch();
    const drawHistory = useRef([]);
    const historyPointer = useRef(0);
    const {activeMenuItem, actionMenuItem} = useSelector((state) => state.menu)
    const {color, size} = useSelector((state) => state.toolbox[activeMenuItem]);
    const shouldDraw = useRef(false);

    useEffect(() => {
        if(!canvasRef.current) return;
        const canvas=canvasRef.current;
        const context=canvas.getContext('2d');

        if(actionMenuItem === MENU_ITEMS.DOWNLOAD){
            const URL = canvas.toDataURL()
            console.log(URL);
            const anchor = document.createElement('a');
            anchor.href=URL;
            anchor.download='sketch.jpg';
            anchor.click();
        }else if(actionMenuItem === MENU_ITEMS.UNDO || actionMenuItem===MENU_ITEMS.REDO){
            if(historyPointer.current>0 && actionMenuItem===MENU_ITEMS.UNDO){
                historyPointer.current-=1;
            }
            if(historyPointer.current<drawHistory.current.length-1 && actionMenuItem===MENU_ITEMS.REDO){
                historyPointer.current+=1;
            }
            const imageData = drawHistory.current[historyPointer.current];
            context.putImageData(imageData, 0, 0);
        }
        dispatch(actionItemClick(null));
    }, [actionMenuItem, dispatch]);

    useEffect(() => {
        if(!canvasRef.current) return;
        const canvas=canvasRef.current;
        const context=canvas.getContext('2d');

        const changeConfig = (color, size) => {
            context.strokeStyle=color;
            context.lineWidth=size;
        }

        const handleChangeConfig = (config) => {
            changeConfig(config.color, config.size);
        }
        
        changeConfig(color, size);
        socket.on('changeConfig', handleChangeConfig);

        return () => {
            socket.off('changeConfig', handleChangeConfig);
        }

    }, [color, size]);

    useLayoutEffect(() => {
        if(!canvasRef.current) return;
        const canvas=canvasRef.current;
        const context=canvas.getContext('2d');

        canvas.height=window.innerHeight;
        canvas.width=window.innerWidth;

        const beginPath = (x, y) => {
            context.beginPath();
            context.moveTo(x, y);
        }

        const drawLine = (x, y) => {
            context.lineTo(x, y);
            context.stroke();
        }

        const handleMouseUp = (e) => {
            shouldDraw.current=false;
            const imageData=context.getImageData(0, 0, canvas.width, canvas.height);
            drawHistory.current.push(imageData);
            historyPointer.current=drawHistory.current.length-1;
        }

        const handleMouseMove = (e) => {
            //draw
            if(!shouldDraw.current) return;
            drawLine(e.clientX, e.clientY);
            socket.emit('drawLine', {x: e.clientX, y: e.clientY});
        }

        const handleMouseDown = (e) => {
            //start
            shouldDraw.current=true;
            beginPath(e.clientX, e.clientY);
            socket.emit('beginPath', {x: e.clientX, y: e.clientY});
        }

        const handleBeginPath = (path) => {
            beginPath(path.x, path.y)
        }

        const handleDrawLine = (path) => {
            drawLine(path.x, path.y)
        }

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        
        canvas.addEventListener('touchstart', handleMouseDown);
        canvas.addEventListener('touchmove', handleMouseMove);
        canvas.addEventListener('touchend', handleMouseUp);

        socket.on('beginPath', handleBeginPath);
        socket.on('drawLine', handleDrawLine);


        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);

            
            canvas.removeEventListener('touchstart', handleMouseDown);
            canvas.removeEventListener('touchmove', handleMouseMove);
            canvas.removeEventListener('touchend', handleMouseUp);

            socket.off('beginPath', handleBeginPath);
            socket.off('drawLine', handleDrawLine);
        }
    }, []);

    console.log(color, size);

    return (
        <canvas ref={canvasRef}></canvas>
    )
}

export default Board;