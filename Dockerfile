# #Specifies the underlying OS architecture that you are gonna use to build the image.
# FROM ubuntu:20.04
# #Variable called USER
# ARG USER
# #Runs a command to update and upgrade
# RUN apt update && apt upgrade -y
# #Runs a command to install ssh
# RUN apt install -y openssh-server 
# #Runs a command to install gcc and g++
# RUN apt install -y gcc g++
# #Runs a command to install nano
# RUN apt install -y nano 
# #Runs a command to start ssh
# RUN service ssh start
# #Makes a problems and submissions directory
# RUN mkdir /problems /submissions
# #Executable for the containers
# CMD useradd -m $USER -s /bin/bash; ((echo 'password'; echo 'password') | passwd $USER); if [ "$DEFAULTPASSWD" = 1 ]; then echo 'Using default password'; else passwd -e $USER; fi; mkdir /home/$USER/.ssh; chown -R $USER:$USER /home/$USER/.ssh; /usr/sbin/sshd -D; 
# #Tells Docker to get all its information required during the runtime from a specified Port.
# EXPOSE 22
# FROM gcc:latest

# Use an official Ubuntu image as a parent image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential packages
RUN apt-get update -y && apt-get install -y \
    build-essential \     
    cmake \               
    gdb \     
    g++ 

# Copy the C++ code into the container
COPY submissions/ /submissions/ 

# Define an entry point script that will be executed by the Node.js server
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
























