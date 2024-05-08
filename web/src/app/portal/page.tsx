'use client'

import { Sheet, Typography, Button } from "@mui/joy";
import { useRouter } from 'next/navigation';
import { css } from '@emotion/react';

export default function CaptivePage() {
    const router = useRouter();

    const handleJoinClick = () => {
        window.open('/stream', '_blank');
    };

    return (
        <Sheet
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 2,
                gap: 2,
            }}
        >
            <Typography level="h4" component="h1">
                Join the Disco
            </Typography>
            <Typography level="body-sm">
                Welcome to the party! Press &quot;Join&quot; to enter the music stream.
            </Typography>


            <Button
                onClick={handleJoinClick}
                variant="solid"
                size="lg"
            >
                Join
            </Button>
        </Sheet>
    );
}
