import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import {Device} from 'mediasoup-client';
import {unmountComponentAtNode} from "react-dom";

const App = () => {
  const deviceRef = useRef(null);
  const transportRef = useRef(null);

  const [audioTrack, setAudioTrack] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    console.log('Socket connection initialized.');

    socket.emit('requestRouterCapabilities');

    socket.on('routerCapabilities', async ({ routerRtpCapabilities }) => {
      console.log('Router capabilities received:', routerRtpCapabilities);
      if (!deviceRef.current) {
        const newDevice = new Device();
        try {
          await newDevice.load({ routerRtpCapabilities });
          deviceRef.current = newDevice;
          console.log('Device loaded successfully.', routerRtpCapabilities);
          socket.emit('createTransport');
        } catch (error) {
          console.error('Failed to load the device:', error);
        }
      }
    });


    socket.on('transportCreated', async (transportParams) => {
      console.log('Server transport params:', transportParams);
      if (!deviceRef.current) {
        console.error('Device is not initialized.');
        return;
      }

      try {
        transportRef.current = deviceRef.current.createRecvTransport(transportParams);

        console.log('Receive transport set up successfully.', transportRef.current.direction);

        transportRef.current.on('connect', ({ dtlsParameters }, callback, errback) => {
          console.log('Attempting to connect transport...');

          socket.emit('connect-transport', {
            transportId: transportRef.current.id,
            dtlsParameters
          }, (response) => {
            if (response.error) {
              console.error('Error during transport connect:', response.error);
              errback(new Error(response.error));
            } else {
              console.log('Transport connected successfully.');
              callback();
            }
          });
        });

        transportRef.current.on('connectionstatechange', (state) => {
          console.log('Transport connection state changed:', state);
          if (state === 'connected') {
            console.log('Transport is fully connected and operational.');
          } else if (state === 'failed') {
            console.error('Transport connection failed.');
          }
        });

          socket.emit('requestConsume', {
            rtpCapabilities: deviceRef.current.rtpCapabilities,
            transportId: transportRef.current.id
          });


      } catch (error) {
        console.error('Failed to set up the transport:', error);
      }
    });

    socket.on('consumerCreated', async (consumeParams) => {
      if (transportRef.current) {
        try {
          const consumer = await transportRef.current.consume(consumeParams);
          const { track } = consumer;

          setAudioTrack(track);
        } catch (error) {
          console.error('Could not consume audio:', error);
        }
      } else {
        console.error("Transport not initialized, cannot consume audio.");
      }
    });

  }, []);

  useEffect(() => {
    const fetchTransportStats = async () => {
      try {
        if (transportRef.current) {
          const transportStats = await transportRef.current.getStats();
          console.log('Transport Stats:');
          transportStats.forEach(stat => {
            console.log(stat);
          });
        }
      } catch (error) {
        console.error('Error fetching transport stats:', error);
      }
    };


    // Set up an interval to fetch transport stats every X milliseconds
    const statsInterval = setInterval(fetchTransportStats, 5000); // Fetch every 5 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(statsInterval);
  }, [transportRef.current]);


  useEffect(() => {
    const audioElement = audioRef.current;

    const handlePlay = () => console.log('Audio is playing');
    const handleError = (e) => console.error('Error playing audio:', e);

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('error', handleError);
    };
  }, []);


  useEffect(() => {
    if (audioTrack) {
      const stream = new MediaStream([audioTrack]);
      console.log('Stream active:', stream.active);  // Should be true
      console.log('Track enabled:', audioTrack.enabled); // Should be true
      console.log('Track readyState:', audioTrack.readyState); // Should be 'live'
      console.log('Track muted:', audioTrack.muted); // Should be false
      audioRef.current.srcObject = stream;
    }
  }, [audioTrack]);


  return (
      <div className="App">
        <h1>Whisper Disco</h1>
        <audio ref={audioRef} autoPlay controls />
        {!audioTrack && <p>Waiting for audio...</p>}
      </div>
  );
};

export default App;
