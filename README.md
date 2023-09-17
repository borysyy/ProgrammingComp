**How to build the docker file:**

`docker build --build-arg USER=username -t users .`

**How to run the docker file:**

`docker run -t -p 22:22 users`

**For now if there are multiple users (Only a current problem, web server will fix) :**

`docker run -t -p 2200:22 users`

**How the user ssh in:**

`username@localhost`

**If there are multiple users (Only a current problem, web server will fix):**

`username@localhost -p 2200`

**How to check the status of the docker images:**

`docker ps`

**How to stop the docker images:**

`docker stop *Container IDs*`

**COMMON PROBLEM:**

`ssh-keygen -f "/home/slava/.ssh/known_hosts" -R "localhost"`


