import { io } from 'socket.io-client';

const isDev = process.env.NODE_ENV === 'development';


const socket = io(isDev ? 'ws://whatsapp-clone-woad-two.vercel.app' : 'ws://whatsapp-clone-woad-two.vercel.app');
//const socket = io(isDev ? 'ws://localhost:8080' : '/');
//const socket = io(isDev ? 'ws://imaxchat-7n7x.onrender.com' : '/');
export default socket;
