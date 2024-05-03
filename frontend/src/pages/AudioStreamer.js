import React, { useEffect, useRef } from 'react';

const AudioStreamer = ({ url }) => {
    const audioRef = useRef(new Audio());
    const socketRef = useRef(null);

    useEffect(() => {
        function connectWebSocket() {
            console.log('Initializing WebSocket connection...');
            const ws = new WebSocket(url);
            ws.binaryType = 'arraybuffer';

            ws.onopen = () => {
                console.log('WebSocket Connected');
                socketRef.current = ws;
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            ws.onclose = (event) => {
                console.log(event.wasClean ? 'WebSocket Disconnected cleanly' : 'WebSocket Disconnected unexpectedly');
                setTimeout(connectWebSocket, 5000);  // Try to reconnect every 5 seconds
            };

            ws.onmessage = (event) => {
                const arrayBuffer = event.data;
                const blob = new Blob([arrayBuffer], { 'type' : 'audio/mp3' });
                const audioURL = URL.createObjectURL(blob);
                audioRef.current.src = audioURL;
                audioRef.current.play().catch(error => console.error('Error playing audio:', error));
            };
        }

        connectWebSocket();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [url]);  // Re-run effect if URL changes

    return (
        <div>
            <p>Streaming audio...</p>
            <audio ref={audioRef} controls />
        </div>
    );
};

export default AudioStreamer;
