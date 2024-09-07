# DiscordHook
 Simple web app that allows you to send and edit discord messages using webhooks.

 Live Preview: https://wh.kozejin.dev/

## Setup
 1. Build the Discordhook docker image.
 ```bash
 docker build -t discord-hook .
 ```

 2. Run the docker container.
 ```bash
 docker run -d -p 5000:5000 --name discord-hook discord-hook
 ```

 This will build the image and start the container, making your app accessible on port 5000.