## Taking user prompt and generating the story
from google import genai

GEMINI_API_KEY = "AIzaSyBAvl0X_PmmWJpWkHuz5NFZQQOuw42icPM"
client = genai.Client(api_key= GEMINI_API_KEY)


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
    Please provide an appropriate children's story given this information, and make it personalized to {name}. Just provide me the story, with no additional role-playing.
    Additionally, please divide up the story into multiple pages, each page labeled as Page 1, Page 2, etc just like a regular children's book. Return the final output
    as an array, with each element a separate page in the story. DO NOT include Page 1, Page 2, etc in the story.
    """
    
    return prompt

def generate_story():
    story_prompt = generate_story_prompt(user_input, child_profile_info)

    ## Using Google Gemini 
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents = {story_prompt}
    )

    return response.text

story = generate_story() 
print(story)

