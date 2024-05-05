

Start the audio stream:
```bash
cd songs
ffmpeg -stream_loop -1 -re -i test_song.mp3 -acodec libopus -ar 48000 -ac 2 -ab 128k -f rtp -sdp_file output.sdp -payload_type 101 -ssrc 12345678 rtp://127.0.0.1:42424
```

Verifying audio playback:
```bash
ffplay -protocol_whitelist file,rtp,udp -i audio.sdp
```

Start the SFU:
```bash
node sfu/server.js
```