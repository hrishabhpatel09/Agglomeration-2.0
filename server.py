from flask import Flask, jsonify, request
from script import fetch_emails
from dotenv import load_dotenv

load_dotenv()

#---------------------------
PORT=8000
HOST="localhost"

app = Flask(__name__)

@app.route("/emails", methods=["GET"])
def get_emails():
    limit = int(request.args.get("limit", 10))

    try:
        emails = fetch_emails(limit)
        return jsonify({
            "status": "success",
            "count": len(emails),
            "emails": emails
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000, host=HOST)
