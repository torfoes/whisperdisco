import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CssVarsProvider } from '@mui/joy/styles';
import {CssBaseline} from "@mui/joy";
import ThemeRegistry from "./ThemeRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhisperDisco - Start the party!",
  description: "WhisperDisco allows you to listen to music with friends in real-time.",
};

export default function RootLayout(props: { children: any; }) {
  return (
      <html lang="en">
        <body>
            <ThemeRegistry options={{ key: 'joy' }}>{props.children}</ThemeRegistry>
        </body>
      </html>
  );
}
