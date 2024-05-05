import React, { useState, useEffect, RefObject } from 'react';

// @ts-ignore
import { LiveAudioVisualizer } from 'react-audio-visualize';

declare global {
    interface HTMLAudioElement {
        captureStream(): MediaStream;
    }
}

interface AudioVisualizerProps {
    audioRef: RefObject<HTMLAudioElement>;
}

const AudioVisualizerComponent: React.FC<AudioVisualizerProps> = ({ audioRef }) => {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    useEffect(() => {
        console.log('useEffect triggered'); // Initial log to track useEffect triggering
        if (audioRef.current) {
            console.log('Audio element is available:', audioRef.current);
            const stream: MediaStream = audioRef.current.captureStream();
            console.log('Stream captured:', stream); // Log the captured stream

            if (stream && stream.getAudioTracks().length > 0) {
                console.log('Audio tracks available:', stream.getAudioTracks()); // Log available audio tracks
                const audioTrack: MediaStreamTrack = stream.getAudioTracks()[0];
                console.log('Using audio track:', audioTrack); // Log the audio track being used

                const newMediaRecorder: MediaRecorder = new MediaRecorder(stream);
                console.log('MediaRecorder initialized'); // Log the initialization of the MediaRecorder

                setMediaRecorder(newMediaRecorder);

                newMediaRecorder.ondataavailable = (event: BlobEvent) => {
                    console.log('Data available from MediaRecorder:', event.data.size, 'bytes'); // Log data size from the recorder
                };

                newMediaRecorder.onerror = (event) => {
                    console.error('Error from MediaRecorder:', event); // Log errors from the MediaRecorder
                };

                newMediaRecorder.start();
                console.log('MediaRecorder started'); // Confirm the MediaRecorder has started
            } else {
                console.log('No audio tracks found in the stream'); // If no audio tracks, log it
            }
        } else {
            console.log('Audio ref is not available'); // If audioRef is not initialized, log it
        }
    }, [audioRef]);

    return (
        <div>
            {mediaRecorder ? (
                <LiveAudioVisualizer
                    mediaRecorder={mediaRecorder}
                    width={200}
                    height={75}
                    barWidth={5}
                    gap={1}
                    backgroundColor="transparent"
                    barColor="rgb(160, 198, 255)"
                    fftSize={1024}
                    maxDecibels={20}
                    minDecibels={-90}
                    smoothingTimeConstant={0.4}
                />
            ) : (
                <p>Waiting for MediaRecorder to initialize...</p> // Provide a fallback UI
            )}
        </div>
    );
};

export default AudioVisualizerComponent;
