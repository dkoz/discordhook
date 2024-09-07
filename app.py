import logging
from flask import Flask, render_template, request, jsonify
import requests
from asgiref.wsgi import WsgiToAsgi
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)

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
    
@app.route('/load_webhook', methods=['POST'])
def load_webhook():
    data = request.json
    webhook_url = data['webhook_url']
    message_id = data['message_id']

    try:
        message_url = f"{webhook_url}/messages/{message_id}"
        response = requests.get(message_url)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": "Failed to load webhook message"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_webhook/<message_id>', methods=['PATCH'])
def update_webhook(message_id):
    data = request.json
    webhook_url = data['webhook_url']
    payload = data['payload']

    try:
        message_url = f"{webhook_url}/messages/{message_id}"
        response = requests.patch(message_url, json=payload)
        if response.status_code == 200 or response.status_code == 204:
            return jsonify({"status": "Webhook message updated!"}), 200
        else:
            return jsonify({"error": "Failed to update webhook message"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

asgi_app = WsgiToAsgi(app)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(asgi_app, host="0.0.0.0", port=5000)
