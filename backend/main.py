from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
#from google import genai
from openai import OpenAI
import json
import os
from tinydb import TinyDB, Query
import time
from dotenv import load_dotenv
from lumaai import LumaAI
import uuid
from pathlib import Path

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
# Load API keys from environment variables
LUMAAI_API_KEY = os.getenv("LUMAAI_API_KEY")
#GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
#genai_client = genai.Client(api_key=GEMINI_API_KEY)
luma_client = LumaAI(auth_token=LUMAAI_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Directories for audio files (since they are being stored locally)
AUDIO_DIR = Path("tts_outputs")
AUDIO_DIR.mkdir(exist_ok=True)

# Database initialization and table creation
db = TinyDB('db.json')
videos_table = db.table("page_videos")
audios_table = db.table("page_audios")
profile_table = db.table("profiles")
stories_table = db.table("stories")

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
    return f"""Generate a story with the following input: {user_input}. 
    This story is being told to {child_profile.nickname}, a {child_profile.age} year old {child_profile.gender} from {child_profile.location} who is {child_profile.race} and enjoys {child_profile.interests}. If any of those fields seem missing, ignore and 
    proceed by making inferences or make the story broadly applicable.
    Please provide an appropriate children's story given this information, and make it personalized to {child_profile.nickname}. This should not include any role-playing with you as the parent, just the 
    story.
    Additionally, please divide up the story into multiple pages, just like a regular children's book. Return the final output in a JSON format,
    where the keys are "story" and "pages", and the values are a short title for the story and the list of pages, respectively. DO NOT include Page 1, Page 2, etc in the text you return, just the actual content. Besides these elements,
    there should be no other additional output. I should be able to use the command json.loads(output) to get the story title and the list of pages. That means "pages" should simply map to a list of strings, with each string being the text for the page.
    Try to ensure the story has an overarching, interesting plot. Use language appropriate for children's stories,
    with repetitive phrasing where applicable and some challenge words appropriate for their age.
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

def generate_video_for_page(physical_description: str, page: str, style: str) -> str:
    if isinstance(page, dict):
        page = page.get("content", str(page))

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
    
    video_url = generation.assets.video
    print("Generated video URL:", video_url)
    return video_url

def background_generate_video(story_id: int, description: str, page_number: int, page_content: str, style: str):
    """
    Background task to generate a video for a single page and update its status in TinyDB.
    """
    try:
        video_url = generate_video_for_page(description, page_content, style)
        Video = Query()
        record = videos_table.get(Video.story_id == story_id)
        if record:
            pages = record.get("pages", {})
            pages[page_number]["video_url"] = video_url
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

## AUDIO GENERATION FUNCTIONS

def generate_audio_for_page(page_text: str, voice: str = "alloy") -> str:
    """
    Generate an audio file (MP3) for the given page text using OpenAI's TTS API.
    Returns the file path (as string) of the generated audio.
    """
    audio_filename = f"speech_{uuid.uuid4().hex}.mp3"
    audio_file_path = AUDIO_DIR / audio_filename

    response = openai_client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=page_text
    )
    response.stream_to_file(audio_file_path)
    print("Generated audio file:", audio_file_path)
    return str(audio_file_path)

def background_generate_audio(story_id: int, page_number: str, page_content: str, voice: str = "ash"):
    """
    Background task to generate audio for a given page and update its status in TinyDB.
    """
    try:
        audio_url = generate_audio_for_page(page_content, voice)
        Audio = Query()
        record = audios_table.get(Audio.story_id == story_id)
        if record:
            pages = record.get("pages", {})
            pages[str(page_number)]["audio_url"] = audio_url
            audios_table.update({"pages": pages}, Audio.story_id == story_id)
            print(f"Updated story {story_id}, page {page_number} with audio URL: {audio_url}")
    except Exception as e:
        Audio = Query()
        record = audios_table.get(Audio.story_id == story_id)
        if record:
            pages = record.get("pages", {})
            pages[str(page_number)]["error"] = str(e)
            audios_table.update({"pages": pages}, Audio.story_id == story_id)
            print(f"Error for story {story_id}, page {page_number} audio: {e}")

    

@app.post("/generate")
async def create_story(request: StoryRequest, background_tasks: BackgroundTasks):
    try:
        # Generate story using OpenAI
        prompt = generate_story_prompt(request.user_input, request.child_profile)
        print("Generated Prompt:", prompt)
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant generating children's stories."},
                {"role": "user", "content": prompt}
            ]
        )
        story_content = response.choices[0].message.content
        print("Story Content:", story_content)
        story_data = json.loads(story_content)

        # Save the story in TinyDB instead of a file
        story_id = stories_table.insert(story_data)

        # Initialize video & audio generation status in TinyDB
        pages_status = {}
        title = story_data.get("story")
        pages = story_data.get("pages", [])
        
        character_description = generate_character_physical_description(" ".join(pages))

        for i, page in enumerate(pages, start=1):
            pages_status[i] = {"content": page, "video_url": None, "audio_url": None, "error": None}

        videos_table.insert({"story_id": story_id, "title" : title, "pages": pages_status})
        audios_table.insert({"story_id": story_id, "title" : title, "pages": pages_status})
        
        # Define video style (could also be provided by the frontend)
        style = "illustrated storybook art"
        default_voice = "ash"
        
        # Schedule background tasks for each page's video generation
        for page_number, page_info in pages_status.items():
            background_tasks.add_task(
                background_generate_video,
                story_id,
                character_description,
                page_number,
                page_info["content"],
                style
            )
            background_tasks.add_task(
                background_generate_audio,
                story_id,
                int(page_number),
                page_info["content"],
                default_voice
            )

        return {"story_id": story_id, **story_data}
    
    except Exception as e:
        print("Error in create_story endpoint:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/story/{story_id}")
async def get_story(story_id: int):
    story = stories_table.get(doc_id=story_id)
    if story:
        return story
    else:
        raise HTTPException(status_code=404, detail="Story not found")

@app.get("/get_saved_stories")
async def get_saved_stories():
    stories = stories_table.all()
    story_list = [{"story_id": story.doc_id, "title": story.get("title", "Untitled Story")} for story in stories]
    return {"stories": story_list}

@app.get("/story_video/{story_id}/{page_number}")
async def get_story_video_page(story_id: int, page_number: str):
    Video = Query()
    print(f"Story id is {story_id} and page is {page_number}")
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

@app.get("/story_audio/{story_id}/{page_number}")
async def get_story_audio_page(story_id: int, page_number: str):
    Audio = Query()
    record = audios_table.get(Audio.story_id == story_id)
    if record:
        pages = record.get("pages", {})
        if page_number in pages:
            return pages[page_number]
        else:
            raise HTTPException(status_code=404, detail=f"Page {page_number} not found for story {story_id}")
    else:
        raise HTTPException(status_code=404, detail=f"Story audio information not found for story {story_id}")


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
        profile = profile_table.get(doc_id=profile_id)
        if profile:
            return profile
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@app.get("/debug/db")
async def debug_db():
    return {
        "profiles": profile_table.all(),
        "story_videos": videos_table.all(),
        "audios": audios_table.all()
    }


if __name__ == "__main__":
    # Create stories directory if it doesn't exist
    os.makedirs("stories", exist_ok=True)
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
