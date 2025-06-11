import os
import replicate
import time
from datetime import datetime
import requests
import os
from urllib.parse import urlparse
from pathlib import Path

def download_image(url, save_dir='web-frontend/public/images/generated'):
    """
    Download an image from a URL and save it locally
    
    Args:
        url (str): URL of the image to download
        save_dir (str): Directory to save the image in
    
    Returns:
        str: Local path to the saved image
    """
    try:
        # Create save directory if it doesn't exist
        Path(save_dir).mkdir(parents=True, exist_ok=True)
        
        # Generate a filename from the URL
        filename = f"jamaican-design-{int(time.time())}.png"
        save_path = os.path.join(save_dir, filename)
        
        # Download the image
        response = requests.get(url)
        response.raise_for_status()
        
        # Save the image
        with open(save_path, 'wb') as f:
            f.write(response.content)
            
        return os.path.join('/images/generated', filename)  # Return web-accessible path
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def generate_design(prompt):
    """
    Generate designs using Ideogram AI model
    
    Args:
        prompt (str): Description of the design to generate
    
    Returns:
        tuple: (URLs of generated images, Local paths of downloaded images)
    """
    try:
        # Initialize the Replicate client
        # Make sure REPLICATE_API_TOKEN is set in your environment
        client = replicate.Client()
        
        # Run the Ideogram model
        output = client.run(
            "ideogram-ai/ideogram-v3-quality",
            input={
                "prompt": prompt,
                "resolution": "None",
                "style_type": "None",
                "aspect_ratio": "3:2",
                "magic_prompt_option": "Off"
            }
        )
        
        # The output will be a list of image URLs
        # Download images and get local paths
        local_paths = []
        if isinstance(output, list):
            for url in output:
                local_path = download_image(url)
                if local_path:
                    local_paths.append(local_path)
        else:
            local_path = download_image(output)
            if local_path:
                local_paths.append(local_path)

        # Log the URLs and local paths
        with open('design_generation_log.txt', 'a') as f:
            f.write(f"\n{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Prompt: {prompt}\n")
            f.write(f"URLs: {output}\n")
            f.write(f"Local paths: {local_paths}\n")
            f.write("=" * 50 + "\n")
            
        return output, local_paths
    
    except Exception as e:
        print(f"Error generating design: {str(e)}")
        return None, []

def main():
    # Example prompts for Jamaican-themed designs
    prompts = [
        "A modern, minimalist design featuring elegant paint strokes in Jamaican flag colors. The strokes flow diagonally across a sleek black background, with vibrant green (#009B3A) and gold (#FED100) creating a dynamic, professional aesthetic. The paint strokes have a high-quality, artistic finish with clean edges and subtle blending where colors meet. The composition maintains perfect balance and negative space for a corporate, sophisticated look.",
        "An abstract, artistic interpretation of the Jamaican flag colors in a contemporary design. Smooth, flowing paint strokes in emerald green and brilliant gold sweep across a deep black canvas. The strokes have a professional, refined quality with precise edges and intentional overlapping, creating depth and movement. The composition is balanced and modern, perfect for a professional website header.",
        "A sleek, corporate design with bold paint strokes in Jamaican national colors. The strokes are clean and precise, with rich green (#009B3A) and warm gold (#FED100) creating dramatic diagonal movements across a sophisticated black background. The paint has a glossy, premium finish with sharp definition and subtle color gradients."
    ]
    
    print("Starting design generation...\n")
    
    for prompt in prompts:
        print(f"Generating design for prompt: {prompt}")
        result = generate_design(prompt)
        if result:
            urls, local_paths = result
            print(f"Generated URLs:\n{urls}")
            print(f"Local paths:\n{local_paths}\n")
        
        # Wait a bit between generations to avoid rate limiting
        time.sleep(2)
    
    print("Design generation complete! Check design_generation_log.txt for all results.")

if __name__ == "__main__":
    main()
