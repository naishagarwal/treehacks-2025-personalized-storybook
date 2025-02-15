import os
from lumaai import LumaAI
import requests
import time

#initializing Luma AI
client = LumaAI(
    auth_token= os.environ.get('LUMAAI_API_KEY'),
)

# generating the video
generation = client.generations.create(
  prompt="A animated childrens story book of a girl meeting a boy on Valentines Day",
)

completed = False
while not completed:
  generation = client.generations.get(id=generation.id)
  if generation.state == "completed":
    completed = True
  elif generation.state == "failed":
    raise RuntimeError(f"Generation failed: {generation.failure_reason}")
  print("Dreaming")
  time.sleep(3)

video_url = generation.assets.video

# download the video
response = requests.get(video_url, stream=True)
with open(f'{generation.id}.mp4', 'wb') as file:
    file.write(response.content)
print(f"File downloaded as {generation.id}.mp4")

