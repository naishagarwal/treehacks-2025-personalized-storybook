## Taking user prompt and generating the story
from google import genai
from openai import OpenAI
import json
import ast

GEMINI_API_KEY = "AIzaSyBAvl0X_PmmWJpWkHuz5NFZQQOuw42icPM"
OPENAI_API_KEY = "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"
client = genai.Client(api_key= GEMINI_API_KEY)
client2 = OpenAI(api_key = OPENAI_API_KEY)


user_input = "Tell my child a story about how patience is a virtue."
child_profile_info = {
    "name": "Emily",
    "age": 7,
    "gender": "female",
    "location": "New York",
    "race": "latina",
    "interests": "reading, playing with toys"
}

def generate_story_prompt(user_input, child_profile_info):
    name = child_profile_info["name"]
    age = child_profile_info["age"]
    gender = child_profile_info["gender"]
    location = child_profile_info["location"]
    race = child_profile_info["race"]
    interests = child_profile_info["interests"]
    
    prompt = f"""Generate a story with the following input from a parent: {user_input}. 
    They are telling this story to {name}, a {age} year old {gender} from {location} who is {race} and enjoys {interests}. 
    Please provide an appropriate children's story given this information, and make it personalized to {name}. This should not include any role-playing with you as the parent, just the 
    story.
    Additionally, please divide up the story into multiple pages, just like a regular children's book. Return the final output in a JSON format,
    where the keys are "story" and "pages", and the values are the story and the list of pages, respectively. DO NOT include Page 1, Page 2, etc in the story. Besides these elements,
    there should be no other additional output. I should be able to use the command json.loads(output) to get the story and list of pages.
    """
    
    return prompt

def generate_story():
    story_prompt = generate_story_prompt(user_input, child_profile_info)

    ## Using Google Gemini 
    # response = client.models.generate_content(
    #     model="gemini-2.0-flash",
    #     contents = {story_prompt}
    # )

    # return response.text

    ## Using OpenAI
    response = client2.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant generating children's stories."},
            {
                "role": "user",
                "content": story_prompt
            }
        ]
    )

    return response.choices[0].message.content

story = generate_story() 
# Save story to a file
page_list = json.loads(story) # json dictionary of the story and the pages
# print(type(story))
# print(story)
# print(type(page_list))
# print(page_list)

# Save page_list into a json file
with open('story.json', 'w') as f:
    json.dump(page_list, f)


# generating story with specific page number