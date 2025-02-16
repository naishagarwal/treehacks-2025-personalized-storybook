import os
from lumaai import LumaAI
import requests
import time
import json
from openai import OpenAI

LUMAAI_API_KEY =  "luma-19f0d3ab-ba29-4fd7-b9d3-f237135d32f1-cc1826b7-2b05-431b-8a88-5b719a6d2d69"
OPENAI_API_KEY = "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"

#initializing Luma AI
client = LumaAI(
    auth_token= LUMAAI_API_KEY,
)

with open('story.json', 'r') as f:
    page_list = json.load(f)
    pages = page_list['pages']
    story = page_list['story']

def generate_character_physical_description(story):
  client = OpenAI(api_key = OPENAI_API_KEY)
  response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant generating children's stories."},
            {
                "role": "user",
                "content": "Please generate a physical description of the character in the following story. Include vivid description, enough to simulate the character in a video. Limit description to very concise direct physical attributes, including clothing. Here is the story: " + story
            }
        ]
    )

  return response.choices[0].message.content



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
                    "https://raw.githubusercontent.com/naishagarwal/treehacks-2025-personalized-storybook/main/backend/cartoon-girl.jpg"
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

     

def generate_video(style):
  physical_description = generate_character_physical_description(story)
  starter_prompt = f'''Please generate a video for the following page, in a {style} style. If the page involves the character to be generated in the scene, 
  then please use this physical description to generate it: {physical_description}. If the page does not involve the character to be generated in the scene, then please generate a video without the character. Here is the page:'''
  #load in pages json file
  for page in pages:
    print(page)
    print(starter_prompt + page)
    # Generate a video for each page, and then use end frame to concatenate all videos together
    generation = client.generations.create(
      prompt= starter_prompt + page,
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
    print(video_url)

    # download the video
    response = requests.get(video_url, stream=True)
    with open(f'{id}.mp4', 'wb') as file:
        file.write(response.content)
    print(f"File downloaded as {id}.mp4")
    break
    
style = "storybook illustrated drawing"
generate_video(style)
       

