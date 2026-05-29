import sys
from PIL import Image, ImageDraw

def remove_outer_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Create a copy for floodfilling
    ImageDraw.floodfill(img, (0, 0), (255, 255, 255, 0), thresh=30)
    ImageDraw.floodfill(img, (img.width - 1, 0), (255, 255, 255, 0), thresh=30)
    ImageDraw.floodfill(img, (0, img.height - 1), (255, 255, 255, 0), thresh=30)
    ImageDraw.floodfill(img, (img.width - 1, img.height - 1), (255, 255, 255, 0), thresh=30)
    
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_outer_bg(sys.argv[1], sys.argv[2])
