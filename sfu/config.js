const config = {
    server: {
        port: 3000
    },
    corsOptions: {
        origin: ['*'],
        credentials: true,
        methods: ['GET', 'POST']
    },
    ioCorsOptions: {
        cors: {
            origin: ['*'],
            credentials: true,
            methods: ['GET', 'POST']
        },
    },
    mediasoup: {
        worker: {},
        router: {
            mediaCodecs: [{ kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 }]
        },
        // specify the audio source configuration here
        audioTransportOptions: {
            listenInfo: {
                ip: '127.0.0.1',
                port: 42424,
                protocol: 'udp',
                flags: { udpReusePort: true}
            },
            rtcpMux: false,
            comedia: true,
        },
        audioProducerOptions: {
            kind: 'audio',
            rtpParameters: {
                codecs: [{
                    mimeType: 'audio/opus',
                    payloadType: 101,
                    clockRate: 48000,
                    channels: 2
                }],
                encodings: [{ ssrc: 12345678 }]
            }
        },
        webRtcTransport: {
            listenInfos: [{
                protocol: 'udp',
                ip: '127.0.0.1',
                announcedAddress: null,
            }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        },
    }
};

module.exports = config;
