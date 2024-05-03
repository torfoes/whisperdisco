import os
from channels.generic.websocket import AsyncWebsocketConsumer

class StreamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def send_mp3_stream(self, path_to_mp3):
        try:
            with open(path_to_mp3, 'rb') as f:
                while chunk := f.read(4096):
                    print(f"Sending {len(chunk)} bytes")  # Log how much

