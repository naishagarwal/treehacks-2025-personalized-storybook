from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from google import genai
from openai import OpenAI
import json
import os
from tinydb import TinyDB, Query
import time

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
LUMAAI_API_KEY = os.getenv("LUMAAI_API_KEY")
#GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
#genai_client = genai.Client(api_key=GEMINI_API_KEY)
luma_client = LumaAI(auth_token=LUMAAI_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Database initialization and table creation
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

# Video Generation Helper Functions

def generate_character_physical_description(story):
  response = openai_client.chat.completions.create(
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

def generate_video_for_page(story: str, page: str, style: str) -> str:
    physical_description = generate_character_physical_description(story)
    starter_prompt = (
        f"Please generate a video for the following page, in a {style} style. "
        f"If the page involves the character, use this physical description: {physical_description}. "
        "If not, generate a video without the character. Here is the page: "
    )
    prompt = starter_prompt + page
    print("Video prompt:", prompt)
    
    generation = luma_client.generations.create(prompt=prompt)
    completed = False
    while not completed:
        generation = luma_client.generations.get(id=generation.id)
        if generation.state == "completed":
            completed = True
        elif generation.state == "failed":
            raise RuntimeError(f"Video generation failed: {generation.failure_reason}")
        print("Video generation in progress for page...")
        time.sleep(3)
    
    video_url = generation.assets.video
    print("Generated video URL:", video_url)
    return video_url

def background_generate_video(story_id: int, story: str, page_number: int, page_content: str, style: str):
    """
    Background task to generate a video for a single page and update its status in TinyDB.
    """
    try:
        video_url = generate_video_for_page(story, page_content, style)
        Video = Query()
        record = videos_table.get(Video.story_id == story_id)
        if record:
            pages = record.get("pages", {})
            pages[str(page_number)]["video_url"] = video_url
            videos_table.update({"pages": pages}, Video.story_id == story_id)
            print(f"Updated story {story_id}, page {page_number} with video URL.")
    except Exception as e:
        Video = Query()
        record = videos_table.get(Video.story_id == story_id)
        if record:
            pages = record.get("pages", {})
            pages[page_number]["error"] = str(e)
            videos_table.update({"pages": pages}, Video.story_id == story_id)
            print(f"Error for story {story_id}, page {page_number}: {e}")
    

@app.post("/generate")
async def create_story(request: StoryRequest, background_tasks: BackgroundTasks):
    try:
        # Generate story using OpenAI
        prompt = generate_story_prompt(request.user_input, request.child_profile)
        print("Generated Prompt:", prompt)
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",  # Adjust model as needed
            messages=[
                {"role": "system", "content": "You are a helpful assistant generating children's stories."},
                {"role": "user", "content": prompt}
            ]
        )
        print("OpenAI Response:", response)
        story_content = response.choices[0].message.content
        print("Story Content:", story_content)
        story_data = json.loads(story_content)
        
        # Save the story as a JSON file (optional for persistence)
        os.makedirs("stories", exist_ok=True)
        story_id = len(os.listdir("stories")) + 1
        with open(f"stories/{story_id}.json", "w") as f:
            json.dump(story_data, f)
        
        # Initialize video generation status for each page in TinyDB
        pages_status = {}
        pages = story_data.get("pages", [])
        for i, page in enumerate(pages, start=1):
            pages_status[i] = {"content": page, "video_url": None, "error": None}
        videos_table.insert({"story_id": story_id, "pages": pages_status})
        
        # Define video style (could also be provided by the frontend)
        style = "3d animated cartoon"
        
        # Schedule background tasks for each page's video generation
        for page_number, page_info in pages_status.items():
            background_tasks.add_task(
                background_generate_video,
                story_id,
                story_data.get("story", ""),
                page_number,
                page_info["content"],
                style
            )
        
        # Return the story data and story_id; the frontend can poll /story_video/{story_id} for video updates.
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

@app.get("/story_video/{story_id}/{page_number}")
async def get_story_video_page(story_id: int, page_number: int):
    Video = Query()
    record = videos_table.get(Video.story_id == story_id)
    if record:
        pages = record.get("pages", {})
        # Check if the specific page exists
        if page_number in pages:
            return pages[page_number]
        else:
            raise HTTPException(status_code=404, detail=f"Page {page_number} not found for story {story_id}")
    else:
        raise HTTPException(status_code=404, detail=f"Story video information not found for story {story_id}")

    

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
