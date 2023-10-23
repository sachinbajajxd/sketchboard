import { io } from "socket.io-client";
const URL = 'https://sketchboard-rwud.onrender.com';
export const socket = io(URL);