# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code to the working directory
COPY . .

# The PORT environment variable is automatically set by Render.
# We don't need to expose it manually, but it's good practice.
EXPOSE 10000

# Define the command to run the app.
# Gunicorn is a production-ready WSGI server.
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:10000", "main:app"]
