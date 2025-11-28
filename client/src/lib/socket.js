import io from "socket.io-client";

// Use environment variable or default to localhost
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
});

export default socket;
