# VisionSearch

### Deep Learning-Based Visual Search & Embedding Indexing Platform

VisionSearch is a premium visual retail search engine that extracts high-dimensional semantic representations from apparel images and indexes them for real-time similarity matching. Rather than relying on traditional text tags, the platform maps clothing profiles, patterns, collar structures, and textures into vector coordinates to retrieve nearest neighbors in sub-10 milliseconds.

---

## 🚀 Key Highlights & Tech Stack

- **Feature Extraction (ResNet-50 CNN)**: Processes input query images through convolutional layers, stripping the final classification layer to extract a 2048-dimensional float embedding from the global average-pooling output.
- **Vector Index (FAISS)**: Leverages Facebook AI Similarity Search (`IndexFlatIP`) for exact nearest-neighbor retrieval on an enterprise-scale simulated index of **325 catalog items**.
- **Verification Layer (OpenCV ORB)**: Employs Oriented FAST and Rotated BRIEF descriptors with a Brute-Force Hamming matcher to align local geometric keypoints and validate similarity rankings.
- **Dynamic PCA Projection (Numpy SVD)**: Projects the 2048-D embedding manifold onto a 2D plane on-the-fly using Singular Value Decomposition, rendering an interactive scatter plot showing the query relative to category clusters.
- **Model Evaluation Dashboard**: Displays Top-1/Top-5 accuracy, Precision@K, and Recall@K calculated via a leave-one-out cross-validation protocol with pixel-distorted test samples.

---

## 🛠️ Tech Stack

- **Backend**: Python, Flask, PyTorch (Torchvision models), NumPy, FAISS-CPU, OpenCV-Python, Pillow
- **Frontend**: HTML5, Vanilla CSS3 (off-white Pinterest-like theme), Vanilla JavaScript (ES6+), FontAwesome Icons, Google Fonts (Plus Jakarta Sans, Outfit, JetBrains Mono)
- **Environment Management**: `uv` (Python package installer & virtual environment manager)

---

## 📦 Installation & Setup

### Prerequisites
Make sure you have Python 3.10+ installed on your system. Using the `uv` package manager is highly recommended for speed and convenience.

### 1. Clone & Navigate to Project
```powershell
cd "C:\Users\vanda\.gemini\antigravity\scratch\visionsearch_ai"
```

### 2. Install Dependencies
```powershell
uv pip install -r requirements.txt
```

### 3. Run the Server
```powershell
uv run python app.py
```
*(On startup, the system will verify the index, generate 24 augmented noisy variants for the base catalog items to build a 325-product index, and warm up the PCA projections cache).*

### 4. Access the App
Open your web browser and navigate to:
```http
http://127.0.0.1:5000
```

---

## 📐 Architecture Diagram

```
[Query Image] 
      │
      ▼
[ResNet-50 CNN] ──(Average Pooling)──► [2048-D Embedding Vector] (L2 Normalized)
                                                 │
                               ┌─────────────────┴────────────────┐
                               ▼                                  ▼
                        [FAISS KNN Index]                [Numpy SVD PCA Solver]
                               │                                  │
                               ▼                                  ▼
                     [Ranked Product IDs]              [2D Coordinates plotted]
                               │
                               ▼
                    [OpenCV ORB Verification]
                               │
                               ▼
                      [Rendered Matches]
```
