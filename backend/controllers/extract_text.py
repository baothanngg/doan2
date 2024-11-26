# extract_text.py
import easyocr
import sys
import json
import os
import io
import logging

logging.disable(logging.CRITICAL)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
# Đặt mã hóa đầu ra
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_text(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Không tìm thấy file: {image_path}")
    
    reader = easyocr.Reader(['vi', 'en'], gpu=False)
    result = reader.readtext(image_path)
    
    # Chỉ lấy văn bản
    extracted_text = [text for (_, text, _) in result]
    return extracted_text

if __name__ == "__main__":
    image_path = sys.argv[1]
    try:
        text = extract_text(image_path)
        # ensure_ascii=False để giữ nguyên ký tự Unicode
        print(json.dumps({"status": "success", "data": text}, ensure_ascii=False))
    except Exception as e:
        # Sử dụng stderr để ghi lỗi
        print(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False), file=sys.stderr)
