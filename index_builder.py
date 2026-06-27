import os
import json
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import faiss

# Paths
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_DIR, "data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")
DATABASE_PATH = os.path.join(DATA_DIR, "database.json")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss.index")
MAPPING_PATH = os.path.join(DATA_DIR, "index_mapping.json")

# Model Setup
print("Loading pretrained ResNet-50 model...")
# Using modern torchvision weights syntax
weights = models.ResNet50_Weights.DEFAULT
model = models.resnet50(weights=weights)
# Remove the classification layer, replace with Identity to get features
model.fc = nn.Identity()
model.eval()

# Image Preprocessing Pipeline
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

def extract_features(image_path):
    try:
        img = Image.open(image_path).convert('RGB')
        tensor = preprocess(img).unsqueeze(0)
        with torch.no_grad():
            features = model(tensor)
        
        # Flatten and convert to numpy array
        features_np = features.squeeze().numpy()
        
        # L2 normalization for Cosine Similarity search
        norm = np.linalg.norm(features_np)
        if norm > 0:
            features_np = features_np / norm
            
        return features_np
    except Exception as e:
        print(f"Error extracting features for {image_path}: {e}")
        return None

def build_index():
    print("Building FAISS index...")
    
    # Load database metadata
    if not os.path.exists(DATABASE_PATH):
        print(f"Error: Database file {DATABASE_PATH} not found. Run generate_dataset.py first.")
        return
        
    with open(DATABASE_PATH, "r") as f:
        database = json.load(f)
        
    feature_list = []
    mapping_list = []
    
    for product_id, product in database.items():
        image_name = product["image"]
        image_path = os.path.join(IMAGES_DIR, image_name)
        
        print(f"Processing: {product_id} ({image_name})...")
        features = extract_features(image_path)
        
        if features is not None:
            feature_list.append(features)
            mapping_list.append(product_id)
            
    if not feature_list:
        print("No features extracted. Index build aborted.")
        return
        
    # Convert feature list to float32 numpy array
    features_matrix = np.array(feature_list).astype('float32')
    
    # FAISS dimensions (ResNet-50 features output is 2048)
    dimension = features_matrix.shape[1]
    print(f"Feature vector dimensions: {dimension}")
    print(f"Total vectors to index: {features_matrix.shape[0]}")
    
    # Using IndexFlatIP for Cosine Similarity (since features are L2 normalized)
    index = faiss.IndexFlatIP(dimension)
    index.add(features_matrix)
    
    # Save the index
    faiss.write_index(index, FAISS_INDEX_PATH)
    print(f"Saved FAISS index to {FAISS_INDEX_PATH}")
    
    # Save the mapping of index position to product ID
    with open(MAPPING_PATH, "w") as f:
        json.dump(mapping_list, f, indent=4)
    print(f"Saved index-to-product mapping to {MAPPING_PATH}")
    print("FAISS index building completed successfully.")

if __name__ == "__main__":
    build_index()
