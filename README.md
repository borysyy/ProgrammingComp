# Docker Instructions

**How to build the docker file:**

`docker build -t users .`

**How to run with dockerbuild command**

`dockerbuild <Path to Dockerfile directory>`

**How to run the docker file:**

`docker run -t -v ~/tmp:/tmp -e USER=username -p 22:22 users`

**How to run with dockerrun command**

`dockerrun <USERNAME>`

**For now if there are multiple users (Only a current problem, web server will fix) :**

`docker run -t -v ~/tmp:/tmp -e USER=username -p 2200:22 users`

**How the user ssh in:**

`ssh username@localhost`

**If there are multiple users (Only a current problem, web server will fix):**

`ssh username@localhost -p 2200`

**How a student could submit their solution**

`./a.out > /tmp/username.txt`

**How to check the status of the docker images:**

`docker ps`

**How to stop the docker images:**

`docker stop <CONTAINER ID>`

**COMMON PROBLEM:**

`ssh-keygen -f "/home/slava/.ssh/known_hosts" -R "localhost"`



