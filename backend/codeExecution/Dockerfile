# Use an official Ubuntu image as a parent image
FROM ubuntu:20.04
FROM openjdk:11 as builder

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive, LC_CTYPE=en_US.UTF-8
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64

# Update and install essential packages
RUN apt-get update -y && apt-get install -y \
    build-essential \
    cmake \
    gdb \
    g++ \
    gcc \
    python3 \
    openjdk-11-jdk \
    default-jdk \
    nodejs

# Copy the code into the container
COPY submissions/ /submissions/ 

# Copy the entrypoint script into the container
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
