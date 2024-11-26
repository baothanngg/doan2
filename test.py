import easyocr
import cv2
import matplotlib.pyplot as plt
import os
import logging

# Khởi tạo EasyOCR với hỗ trợ tiếng Việt
reader = easyocr.Reader(['vi', 'en'], gpu=True)

logging.disable(logging.CRITICAL)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# Đọc ảnh
image_path = './bt2.jpg'
image = cv2.imread(image_path)

result = reader.readtext(image_path)

# In kết quả
for (bbox, text, prob) in result:
    print(f'Text: {text}, Probability: {prob}')

