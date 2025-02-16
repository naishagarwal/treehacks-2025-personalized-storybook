import openai

openai.api_key = "YOUR_OPENAI_API_KEY"

def generate_story(description):
    # Generate text
    story_text = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": f"Generate a children's story about: {description}"}]
    )["choices"][0]["message"]["content"]

    # Split into pages and generate images
    story_parts = story_text.split(". ")
    pages = []
    for part in story_parts:
        image = openai.Image.create(
            prompt=f"Illustration of: {part}",
            n=1,
            size="512x512"
        )["data"][0]["url"]
        pages.append({"text": part, "image": image})
    return pages
