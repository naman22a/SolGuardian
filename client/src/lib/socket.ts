'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(
            process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'http://localhost:5000',
            {
                transports: ['websocket']
            }
        );
    }
    return socket;
};
