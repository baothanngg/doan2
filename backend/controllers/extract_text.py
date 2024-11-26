import easyocr
import sys
import json
import os
import io
import logging
from PIL import Image, ImageEnhance, ImageFilter
from io import BytesIO

logging.disable(logging.CRITICAL)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
# Đặt mã hóa đầu ra
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def preprocess_image(image_path):
    image = Image.open(image_path)
    # Chuyển sang ảnh xám
    image = image.convert('L')
    # Lọc nhiễu
    image = image.filter(ImageFilter.MedianFilter())
    # Tăng độ tương phản
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)
    return image

def merge_close_text(result, max_distance=20):
    """
    Hợp nhất các từ gần nhau dựa trên vị trí bounding box.
    result: Danh sách các tuple (bounding box, text, confidence)
    max_distance: Khoảng cách tối đa để hợp nhất
    """
    merged_text = []
    current_text = ""
    for i, text in enumerate(result):
        if i == 0:
            current_text = text
            continue
        if len(current_text) + len(text) < max_distance:  # Ghép nếu gần nhau
            current_text += " " + text
        else:
            merged_text.append(current_text)
            current_text = text
    if current_text:
        merged_text.append(current_text)
    return merged_text

def extract_text(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Không tìm thấy file: {image_path}")
    
    image = preprocess_image(image_path)
    # Chuyển hình ảnh thành bytes
    buffered = BytesIO()
    image.save(buffered, format='PNG')
    img_bytes = buffered.getvalue()
    
    reader = easyocr.Reader(['vi', 'en'], gpu=True)
    result = reader.readtext(img_bytes, detail=0, paragraph=True)
    
    # Hợp nhất các từ gần nhau
    merged_result = merge_close_text(result)
    
    return merged_result

if __name__ == "__main__":
    image_path = sys.argv[1]
    try:
        text = extract_text(image_path)
        # ensure_ascii=False để giữ nguyên ký tự Unicode
        print(json.dumps({"status": "success", "data": text}, ensure_ascii=False))
    except Exception as e:
        # Sử dụng stderr để ghi lỗi
        print(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False), file=sys.stderr)
