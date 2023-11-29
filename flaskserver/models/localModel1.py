# Local Model Attempt 1
# https://www.youtube.com/watch?app=desktop&v=tc87-ZKWm78

from transformers import pipeline

model_id = "google/flan-t5-large"

summarizer = pipeline("summarization", model=model_id)