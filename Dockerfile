FROM python:3.11.8-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and main.py
COPY backend/ ./backend/
COPY main.py .

# Set Python path to include backend
ENV PYTHONPATH=/app/backend

# Expose port
EXPOSE 8000

# Start command using the root main.py
CMD ["python", "main.py"]
