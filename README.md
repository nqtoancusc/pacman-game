This PacMan game is a remote control game developed by Toan Nguyen. Users will connect to the game via a socket connection between the browser on mobile and the browser on computer. When connection is established, users are put into a queue and wait for their turn. User queue number is counting down. A user will start playing when there's nobody in front of them. User control the game from the browser on their mobile and can check their score in real time. The user with highest score will be shown on screen and can be seen by public.

RUN TEST:
1. Check the current version:
Look at package.json file to see the current version (Change version number before running build').

2. Run build

grunt build

- If we want to test with testbuild (Optional):

sudo PORT=8501 PORT_HTTPS=8502 HOSTNAME=0.0.0.0 node app/server

OR (run this, the form is disabled)

./test-prod-build

---> TEST LOCALLY (using our phone) AT: https://<LOCAL SERVER IP>:8502
(<LOCAL SERVER IP> is the IP of my local machine)

[
---> No need to do this debug step, but if we need to do debug:
Debug with testbuild
grunt testbuild
]

DEPLOYMENT:
1. Sync files to PRODUCTION SERVER

(Enter password)

2. SSH to production server:

- ssh to server: ssh <USERNAME>@<PRODUCTION SERVER IP>

3. Go to application folder

4. Run forever list to see the ID of the process

forever list

5. Restart the process

forever restart <process_id>

6. Test the remote control

7. Exit the console