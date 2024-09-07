import logging
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Disable logging
log = logging.getLogger('werkzeug')
log.disabled = False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_webhook', methods=['POST'])
def send_webhook():
    data = request.json
    webhook_url = data['webhook_url']
    payload = data['payload']
    thread_id = payload.get('thread_id')

    if thread_id:
        webhook_url = f"{webhook_url}?thread_id={thread_id}"

    response = requests.post(webhook_url, json=payload)

    if response.status_code == 204:
        return jsonify({"status": "Webhook sent!"}), 200
    else:
        return jsonify({"status": "Failed to send webhook"}), response.status_code

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=20000)
