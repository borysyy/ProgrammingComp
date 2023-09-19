#Specifies the underlying OS architecture that you are gonna use to build the image.
FROM ubuntu
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
#Runs a command to add the user
RUN useradd -m $USER -s /bin/bash
#Runs a command to set the default password to password
RUN (echo 'password'; echo 'password') | passwd $USER
#Runs a command to require the user to change the password
RUN passwd -e $USER
#Runs a command to make a directory for ssh
RUN mkdir /home/$USER/.ssh
#Runs a command to change the ownership of the file
RUN chown -R $USER:$USER /home/$USER/.ssh
#Defines the default executable of a Docker image
CMD ["/usr/sbin/sshd", "-D"]
#Tells Docker to get all its information required during the runtime from a specified Port.
EXPOSE 22



