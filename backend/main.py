from fastapi import FastAPI
from pydantic import BaseModel
from generate import generate_story
import uuid

app = FastAPI()

# In-memory storage for simplicity
stories = {}

class StoryRequest(BaseModel):
    description: str

@app.post("/generate")
def generate_new_story(request: StoryRequest):
    story_id = str(uuid.uuid4())
    story_pages = generate_story(request.description)
    stories[story_id] = {"pages": story_pages}
    return {"story_id": story_id}

@app.get("/story/{story_id}")
def get_story(story_id: str):
    return stories.get(story_id, {"pages": []})
