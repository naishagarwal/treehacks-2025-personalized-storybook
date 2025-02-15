import os
from lumaai import LumaAI
import requests
import time
import json

LUMAAI_API_KEY = "luma-19f0d3ab-ba29-4fd7-b9d3-f237135d32f1-cc1826b7-2b05-431b-8a88-5b719a6d2d69"
#initializing Luma AI
client = LumaAI(
    auth_token= LUMAAI_API_KEY,
)

def generate_character_reference_image(story_json):
  with open(story_json, 'r') as f:
      page_list = json.load(f)
      pages = page_list['pages']
      story = page_list['story']
      for page in pages:
        print(page)
        generation = client.generations.image.create(
            prompt="Please generate a character reference image for the following story: " + story,
            character_ref={
                "identity0": {
                  "images": [
                    "https://drive.google.com/file/d/14G9eGxTJxP9dBDyQRhfqKEyCufmYecXD/view?usp=sharing"
                  ]
                }
              }
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
        
        id = generation.id
        image_url = generation.assets.image

        # download the image
        response = requests.get(image_url, stream=True)
        with open(f'{generation.id}.jpg', 'wb') as file:
            file.write(response.content)
        print(f"File downloaded as {id}.jpg")

     

def generate_video(story_json):
#load in pages json file
  with open(story_json, 'r') as f:
      page_list = json.load(f)
      pages = page_list['pages']
      for page in pages:
        print(page)
        # Generate a video for each page, and then use end frame to concatenate all videos together
        generation = client.generations.create(
          prompt=page,
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

        id = generation.id
        video_url = generation.assets.video

        # download the video
        response = requests.get(video_url, stream=True)
        with open(f'{id}.mp4', 'wb') as file:
            file.write(response.content)
        print(f"File downloaded as {id}.mp4")


generate_character_reference_image("story.json")
#generate_video("story.json")
       

