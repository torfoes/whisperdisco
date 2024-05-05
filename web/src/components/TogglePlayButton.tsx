import React, {useEffect, useState} from 'react';
import IconButton from '@mui/joy/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { RefObject } from 'react';
import {Stack, Typography} from "@mui/joy";

interface PlayButtonProps {
    audioRef: RefObject<HTMLAudioElement>;
    size: number;
}

const PlayButton: React.FC<PlayButtonProps> = ({ audioRef, size }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const checkIfPlaying = () => {
            if (audioRef.current && !audioRef.current.paused) {
                setIsPlaying(true);
            }
        };

        checkIfPlaying();

        audioRef.current?.addEventListener('play', () => setIsPlaying(true));
        audioRef.current?.addEventListener('pause', () => setIsPlaying(false));

        return () => {
            audioRef.current?.removeEventListener('play', () => setIsPlaying(true));
            audioRef.current?.removeEventListener('pause', () => setIsPlaying(false));
        };
    }, [audioRef]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <>
            <IconButton
                onClick={togglePlay}
                variant="outlined"
                color="primary"
            >
                {isPlaying ?
                    <PauseIcon sx={{ fontSize: size }}/> :
                    <PlayArrowIcon sx={{ fontSize: size }}/>
                }
            </IconButton>
            {!isPlaying && (
                <Typography>Press play to join the party</Typography>
            )}
        </>
    );
};

export default PlayButton;
