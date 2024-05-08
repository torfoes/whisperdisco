const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mediasoup = require('mediasoup');
const cors = require('cors');
const config = require('./config');

const app = express();
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST']
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    }
});


let worker;
let router;
let audioProducer;
let audioTransport;

const transports = new Map();

function storeTransport(transportId, transport) {
    transports.set(transportId, transport);
}

function getTransportById(transportId) {
    return transports.get(transportId);
}

function removeTransport(transportId) {
    transports.delete(transportId);
}


async function startMediaSoup() {
    worker = await mediasoup.createWorker();
    console.log("MediaSoup worker started with PID:", worker.pid);
    worker.on('died', () => {
        console.error('MediaSoup worker died, exiting in 2 seconds...');
        setTimeout(() => process.exit(1), 2000);
    });

    router = await worker.createRouter(config.mediasoup.router);
    console.log("MediaSoup router created.");

    audioTransport = await router.createPlainTransport(config.mediasoup.audioTransportOptions);

    console.log(`Plain RTP transport is listening on IP: ${audioTransport.tuple.localIp} and Port: ${audioTransport.tuple.localPort}`);

    audioProducer = await audioTransport.produce(config.mediasoup.audioProducerOptions);
    console.log('Audio producer created:', audioProducer.id);


    const statsInterval = setInterval(async () => {
        try {
            const transportStats = await audioTransport.getStats();
            const producerStats = await audioProducer.getStats();
            console.log('Transport Stats:', JSON.stringify(transportStats, null, 2));
            console.log('Producer Stats:', JSON.stringify(producerStats, null, 2));
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Consider stopping interval if there's a persistent error
            clearInterval(statsInterval);
        }
    }, 10000);

}

async function setupServer() {
    await startMediaSoup();
    server.listen(config.server.port, () => {
        console.log(`Server is running on http://localhost:${config.server.port}`);
    });


    io.on('connection', (socket) => {
        socket.emit('routerCapabilities', {
            routerRtpCapabilities: router.rtpCapabilities
        });

        socket.on('createTransport', async () => {
            try {
                const transport = await router.createWebRtcTransport(config.mediasoup.webRtcTransport);

                transports.set(transport.id, transport);

                const params = {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters
                };
                socket.emit('transportCreated', params);
                // console.log('Transport creation details sent to client');
            } catch (error) {
                console.error('Failed to create transport:', error);
                socket.emit('error', 'Failed to create transport');
            }
        });


        // issue is here -- connect consume existing transport
        socket.on('connect-transport', async (data, callback) => {
            const { transportId, dtlsParameters } = data;

            try {
                const transport = getTransportById(transportId);
                if (!transport) {
                    throw new Error('Transport not found');
                }

                await transport.connect({ dtlsParameters });

                console.log('Transport connected successfully');
                callback({ status: 'ok' });
            } catch (error) {
                console.error('Failed to connect transport:', error);
                callback({ status: 'failed', error: error.message });
                socket.emit('error', { message: 'Failed to connect transport', details: error.message });
            }
        });



        socket.on('requestConsume', async (data) => {
            console.log('Request to consume received:', data);
            const { rtpCapabilities, transportId } = data;


            if (!router.canConsume({
                producerId: audioProducer.id,
                rtpCapabilities
            })) {
                console.error("Cannot consume: incompatible RTP Capabilities for producerId:", producerId);
                socket.emit('error', { error: 'Incompatible RTP Capabilities' });
                return;
            }

            const transport = getTransportById(transportId)

            try {
                const consumer = await transport.consume({
                    producerId: audioProducer.id,
                    rtpCapabilities,
                    paused: true
                });

                // Log the creation of the consumer
                console.log('Consumer created successfully:', consumer.id);

                socket.emit('consumerCreated', {
                    id: consumer.id,
                    producerId: audioProducer.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    type: consumer.type,
                    producerPaused: consumer.producerPaused
                });

                // console.log('Consumer details sent to client');
                await consumer.resume();
                console.log('Consumer resumed');
            } catch (error) {
                console.error('Error during consumption process:', error);
                socket.emit('error', { error: 'Error consuming', details: error.message });
            }
        });
    });


}


setupServer().catch(error => {
    console.error('Error setting up the MediaSoup server:', error);
});
