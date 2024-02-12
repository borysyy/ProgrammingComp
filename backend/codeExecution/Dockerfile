# Use an official Ubuntu image as a parent image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential packages
RUN apt-get update -y && apt-get install -y \
    build-essential \     
    cmake \               
    gdb \     
    g++ \
    gcc \
    python3 \
    && rm -rf /var/lib/apt/lists/*


# Copy the C++ code into the container
COPY submissions/ /submissions/ 

# Define an entry point script that will be executed by the Node.js server
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
























