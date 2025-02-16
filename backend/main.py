from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from google import genai
from openai import OpenAI
import json
import os

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
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
#genai_client = genai.Client(api_key=GEMINI_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# class ChildProfile(BaseModel):
#     name: str
#     age: int
#     gender: str
#     location: str
#     race: str
#     interests: str

class Profile(BaseModel):
    nickname: str
    age: int
    location: str
    gender: str
    interests: str

class StoryRequest(BaseModel):
    user_input: str
    child_profile: Profile

def generate_story_prompt(user_input: str, child_profile: Profile) -> str:
    return f"""Generate a story with the following input from a parent: {user_input}. 
    They are telling this story to {child_profile.name}, a {child_profile.age} year old {child_profile.gender} from {child_profile.location} who is {child_profile.race} and enjoys {child_profile.interests}. 
    Please provide an appropriate children's story given this information, and make it personalized to {child_profile.name}. This should not include any role-playing with you as the parent, just the 
    story.
    Additionally, please divide up the story into multiple pages, just like a regular children's book. Return the final output in a JSON format,
    where the keys are "story" and "pages", and the values are the story and the list of pages, respectively. DO NOT include Page 1, Page 2, etc in the story. Besides these elements,
    there should be no other additional output. I should be able to use the command json.loads(output) to get the story and list of pages.
    """

@app.post("/generate")
async def create_story(request: StoryRequest):
    try:
        prompt = generate_story_prompt(request.user_input, request.child_profile)
        
        # Using OpenAI (you can switch to Gemini by uncommenting the other section)
        response = openai_client.chat.completions.create(
            model="gpt-4-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant generating children's stories."},
                {"role": "user", "content": prompt}
            ]
        )
        
        story_content = response.choices[0].message.content
        story_data = json.loads(story_content)
        
        # Save to a file with a unique ID (you might want to use a database instead)
        story_id = len(os.listdir("stories")) + 1  # Simple ID generation
        with open(f"stories/{story_id}.json", "w") as f:
            json.dump(story_data, f)
            
        return {"story_id": story_id, **story_data}
    
    except Exception as e:
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
        os.makedirs("profiles", exist_ok=True)
        profile_id = len(os.listdir("profiles")) + 1
        with open(f"profiles/{profile_id}.json", "w") as f:
            json.dump(profile.dict(), f)
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

if __name__ == "__main__":
    # Create stories directory if it doesn't exist
    os.makedirs("stories", exist_ok=True)
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
