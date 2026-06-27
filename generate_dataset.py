import os
import shutil
import glob
import json

# Define directories
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = r"C:\Users\vanda\.gemini\antigravity\brain\8d415833-3a74-4dbc-9e68-790df7236beb"
IMAGES_DIR = os.path.join(PROJECT_DIR, "data", "images")
DATABASE_PATH = os.path.join(PROJECT_DIR, "data", "database.json")

# Ensure target directory exists
os.makedirs(IMAGES_DIR, exist_ok=True)

# List of products to process
PRODUCTS = [
    {
        "id": "sneakers_red",
        "name": "Crimson Sport Sneakers",
        "category": "shoes",
        "price": "$89.99",
        "description": "High-performance running sneakers featuring a crimson red breathable mesh upper and a responsive cushioned sole.",
        "search_pattern": "sneakers_red_*.png"
    },
    {
        "id": "leather_jacket_black",
        "name": "Classic Rider Leather Jacket",
        "category": "tops",
        "price": "$189.50",
        "description": "Timeless motorcycle jacket crafted from genuine black leather, detailed with silver metal zippers and epaulets.",
        "search_pattern": "leather_jacket_black_*.png"
    },
    {
        "id": "denim_jeans_blue",
        "name": "Vintage Wash Denim Jeans",
        "category": "bottoms",
        "price": "$64.99",
        "description": "Fitted blue jeans in a classic vintage faded wash, designed for everyday comfort and styling versatility.",
        "search_pattern": "denim_jeans_blue_*.png"
    },
    {
        "id": "summer_dress_white",
        "name": "Lace Summer Dress",
        "category": "tops",
        "price": "$79.00",
        "description": "Lightweight white summer dress made of soft cotton with intricate floral lace stitching, perfect for warm sunny days.",
        "search_pattern": "summer_dress_white_*.png"
    },
    {
        "id": "knit_sweater_yellow",
        "name": "Chunky Knit Mustard Sweater",
        "category": "tops",
        "price": "$55.00",
        "description": "Cozy mustard yellow sweater in a chunky cable knit, designed for a relaxed fit and ultimate warmth.",
        "search_pattern": "knit_sweater_yellow_*.png"
    },
    {
        "id": "boots_leather_brown",
        "name": "Rugged Terrain Leather Boots",
        "category": "shoes",
        "price": "$120.00",
        "description": "Durable brown leather boots with a padded ankle collar, reinforced eyelets, and a high-traction rubber outsole.",
        "search_pattern": "boots_leather_brown_*.png"
    },
    {
        "id": "backpack_canvas_green",
        "name": "Vintage Green Canvas Backpack",
        "category": "accessories",
        "price": "$48.99",
        "description": "Spacious olive green backpack made of heavy-duty canvas, finished with leather buckled straps and magnetic snaps.",
        "search_pattern": "backpack_canvas_green_*.png"
    },
    {
        "id": "wool_coat_black",
        "name": "Double-Breasted Wool Coat",
        "category": "tops",
        "price": "$210.00",
        "description": "Elegant winter coat tailored in double-breasted black wool blend, with wide lapels and deep side pockets.",
        "search_pattern": "wool_coat_black_*.png"
    },
    {
        "id": "floral_skirt_pink",
        "name": "Pastel Floral Midi Skirt",
        "category": "bottoms",
        "price": "$45.00",
        "description": "Flowy pastel pink midi skirt adorned with soft white floral patterns and an elasticized waist for easy wear.",
        "search_pattern": "floral_skirt_pink_*.png"
    },
    {
        "id": "wristwatch_silver",
        "name": "Premium Chrono Silver Watch",
        "category": "accessories",
        "price": "$150.00",
        "description": "Sophisticated luxury timepiece with a brushed silver stainless steel strap, a sleek black dial, and water resistance.",
        "search_pattern": "wristwatch_silver_*.png"
    },
    {
        "id": "trench_coat_beige",
        "name": "Classic Beige Trench Coat",
        "category": "tops",
        "price": "$165.00",
        "description": "Stylish beige double-breasted trench coat featuring storm flaps, a waist belt, and a water-repellent finish.",
        "search_pattern": "trench_coat_beige_*.png"
    },
    {
        "id": "running_shoes_blue",
        "name": "Neon Streak Running Shoes",
        "category": "shoes",
        "price": "$95.00",
        "description": "Ultralight running shoes in vibrant cobalt blue, detailed with neon green accent streaks and a flexible outsole.",
        "search_pattern": "running_shoes_blue_*.png"
    }
]

def main():
    catalog = {}
    print("Starting dataset compilation...")

    for prod in PRODUCTS:
        # Search for generated file in artifacts
        search_path = os.path.join(ARTIFACTS_DIR, prod["search_pattern"])
        matching_files = glob.glob(search_path)
        
        if not matching_files:
            print(f"Error: Could not find generated file for {prod['id']} (pattern: {prod['search_pattern']})")
            continue
            
        # Get the newest file matching the pattern
        source_file = max(matching_files, key=os.path.getctime)
        target_filename = f"{prod['id']}.png"
        target_file = os.path.join(IMAGES_DIR, target_filename)
        
        # Copy and rename image
        shutil.copy2(source_file, target_file)
        print(f"Copied {os.path.basename(source_file)} -> data/images/{target_filename}")
        
        # Store in database
        catalog[prod["id"]] = {
            "id": prod["id"],
            "name": prod["name"],
            "category": prod["category"],
            "price": prod["price"],
            "description": prod["description"],
            "image": target_filename
        }
        
    # Save the catalog database
    with open(DATABASE_PATH, "w") as f:
        json.dump(catalog, f, indent=4)
        
    print(f"Catalog saved to {DATABASE_PATH}")
    print(f"Dataset compilation complete. Total products: {len(catalog)}")

if __name__ == "__main__":
    main()
