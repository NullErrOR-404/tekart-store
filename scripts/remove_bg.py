import os
import sys
from PIL import Image

def remove_background(input_path, output_path):
    print(f"Processing logo from {input_path}...")
    if not os.path.exists(input_path):
        print(f"Error: Input path {input_path} does not exist.")
        sys.exit(1)
        
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # If the pixel is near white (R, G, B > 240), make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Trim empty borders to make the logo tightly fit (optional but good)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Ensure assets directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Saved transparent logo to {output_path}")

if __name__ == "__main__":
    input_img = r"C:\Users\Sameen\.gemini\antigravity-ide\brain\ca1dce7d-4a45-47d5-ae6f-af244464e4a9\media__1781199204291.png"
    output_img = r"C:\Users\Sameen\.gemini\antigravity-ide\scratch\tekart\src\assets\tekart-logo.png"
    remove_background(input_img, output_img)
