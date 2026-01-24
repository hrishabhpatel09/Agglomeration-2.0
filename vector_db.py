import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from google import genai
from google.genai import types
import os

load_dotenv()

# ---------------- CONFIG ----------------
QDRANT_URL = os.getenv("QDRANT_URL")

COLLECTION = "email_vectors"
VECTOR_SIZE = 768  # MiniLM output size

# ---------------- INIT ----------------
client = QdrantClient(url=QDRANT_URL)
client2 = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))



def get_gemini_embeddings(texts):
    # Call the API
    response = client2.models.embed_content(
        model="text-embedding-004",
        contents=texts,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            title="Optional Title"
        )
    )

    # Return the embedding vector
    # logic: if input is a single string, return the first embedding values
    if isinstance(texts, str):
        return response.embeddings[0].values
    
    # If input is a list of strings, return a list of vectors
    return [e.values for e in response.embeddings]

def init_qdrant():
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION not in collections:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )

# ---------------- EMBEDDING ----------------

# def embed(text: str):
#     if not text or not text.strip():
#         return None

#     return model.encode(
#         text,
#         normalize_embeddings=True
#     ).tolist()

# ---------------- VECTOR OPS ----------------

import uuid  # <--- Make sure this is imported at the top
from qdrant_client.models import PointStruct
# ... your other imports

def add_vector(vector, payload, id_string):
    # Convert the string ID (email message_id) into a valid deterministic UUID
    # We use uuid5 so the same email ID always produces the same UUID
    point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, id_string))

    client.upsert(
        collection_name=COLLECTION,
        points=[
            PointStruct(
                id=point_id,  # Use the generated UUID here
                vector=vector,
                payload=payload
            )
        ]
    )
    print(f"Stored vector for ID: {id_string} (UUID: {point_id})")

def search_similar(vector, threshold=0.80):
    if not vector:
        return None
    
    # UPDATED: Use query_points instead of search
    response = client.query_points(
        collection_name=COLLECTION,
        query=vector,   # Argument renamed from 'query_vector' to 'query'
        limit=1
    )

    # UPDATED: Access the list of points via the .points attribute
    results = response.points

    if not results:
        return None

    # manually apply threshold
    if results[0].score >= threshold:
        return results[0]

    return None
