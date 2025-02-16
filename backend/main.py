from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from google import genai
from openai import OpenAI
import json
import os
from tinydb import TinyDB, Query

from lumaai import LumaAI

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API keys from environment variables
#LUMAAI_API_KEY = os.getenv("LUMAAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
#genai_client = genai.Client(api_key=GEMINI_API_KEY)
#luma_client = LumaAI(auth_token=LUMAAI_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Databse initialization and table creation
db = TinyDB('db.json')
videos_table = db.table("page_videos")
profile_table = db.table("profiles")

class Profile(BaseModel):
    nickname: str
    age: int
    location: str
    gender: str
    race: str
    interests: str

class StoryRequest(BaseModel):
    user_input: str
    child_profile: Profile

def generate_story_prompt(user_input: str, child_profile: Profile) -> str:
    return f"""Generate a story with the following input from a parent: {user_input}. 
    They are telling this story to {child_profile.nickname}, a {child_profile.age} year old {child_profile.gender} from {child_profile.location} who is {child_profile.race} and enjoys {child_profile.interests}. 
    Please provide an appropriate children's story given this information, and make it personalized to {child_profile.nickname}. This should not include any role-playing with you as the parent, just the 
    story.
    Additionally, please divide up the story into multiple pages, just like a regular children's book. Return the final output in a JSON format,
    where the keys are "story" and "pages", and the values are the story and the list of pages, respectively. DO NOT include Page 1, Page 2, etc in the story. Besides these elements,
    there should be no other additional output. I should be able to use the command json.loads(output) to get the story and list of pages.
    """

@app.post("/generate")
async def create_story(request: StoryRequest):
    try:
        # Log input data for debugging
        print("User input:", request.user_input)
        print("Child profile:", request.child_profile)
        
        prompt = generate_story_prompt(request.user_input, request.child_profile)
        print("Generated Prompt:", prompt)
        
        # Call the API in a try/except block to catch errors
        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",  # Consider testing with "gpt-3.5-turbo" if issues persist
                messages=[
                    {"role": "system", "content": "You are a helpful assistant generating children's stories."},
                    {"role": "user", "content": prompt}
                ]
            )
            print("API Response:", response)
        except Exception as api_error:
            print("Error during OpenAI API call:", api_error)
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {api_error}")
        
        # Check that the response has the expected structure
        if not response.choices or not response.choices[0].message:
            raise HTTPException(status_code=500, detail="Invalid response structure from OpenAI API.")
        
        story_content = response.choices[0].message.content
        print("Story Content:", story_content)
        
        # Attempt to parse the JSON output
        try:
            story_data = json.loads(story_content)
        except Exception as json_error:
            print("JSON parsing error:", json_error)
            raise HTTPException(status_code=500, detail=f"Error parsing story JSON: {json_error}. Content received: {story_content}")
        
        # Save to a file with a unique ID (or use a database)
        story_id = len(os.listdir("stories")) + 1
        with open(f"stories/{story_id}.json", "w") as f:
            json.dump(story_data, f)
            
        return {"story_id": story_id, **story_data}
    
    except Exception as e:
        print("Error in create_story endpoint:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/story/{story_id}")
async def get_story(story_id: int):
    try:
        with open(f"stories/{story_id}.json", "r") as f:
            story_data = json.load(f)
        return story_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Story not found")
    

@app.post("/api/save_details")
async def save_details(profile: Profile):
    try:
        #insert profile id into TinyDB
        profile_id = profile_table.insert(profile.dict())
        return {"profile_id": profile_id, "profile": profile.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/profile/{profile_id}")
async def get_profile(profile_id: int):
    try:
        filename = f"profiles/{profile_id}.json"
        with open(filename, "r") as f:
            profile_data = json.load(f)
        return profile_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")
    
@app.get("/debug/db")
async def debug_db():
    return {
        "profiles": profile_table.all(),
        "story_videos": videos_table.all()
    }


if __name__ == "__main__":
    # Create stories directory if it doesn't exist
    os.makedirs("stories", exist_ok=True)
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
