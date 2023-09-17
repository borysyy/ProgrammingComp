FROM ubuntu

ARG USER

RUN apt update && apt upgrade -y

RUN apt install -y openssh-server

RUN apt install -y nano 

RUN service ssh start

RUN useradd -m $USER -s /bin/bash

RUN (echo 'password'; echo 'password') | passwd $USER

RUN passwd -e $USER

RUN mkdir /home/$USER/.ssh

RUN chown -R $USER:$USER /home/$USER/.ssh

CMD ["/usr/sbin/sshd", "-D"]

EXPOSE 22



