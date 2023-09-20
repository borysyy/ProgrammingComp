#Specifies the underlying OS architecture that you are gonna use to build the image.
FROM ubuntu:22.04
#Variable called USER
ARG USER
#Runs a command to update and upgrade
RUN apt update && apt upgrade -y
#Runs a command to install ssh
RUN apt install -y openssh-server 
#Runs a command to install gcc and g++
RUN apt install -y gcc g++
#Runs a command to install nano
RUN apt install -y nano 
#Runs a command to start ssh
RUN service ssh start
#Executable for the containers
CMD useradd -m $USER -s /bin/bash; (echo 'password'; echo 'password') | passwd $USER; passwd -e $USER; mkdir /home/$USER/.ssh; chown -R $USER:$USER /home/$USER/.ssh; /usr/sbin/sshd -D;
#Tells Docker to get all its information required during the runtime from a specified Port.
EXPOSE 22



