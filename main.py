from flask import Flask, jsonify, request
from db import threads_col, messages_col
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

HOST = "localhost"
PORT = 8000


@app.route("/tickets", methods=["GET"])
def get_tickets():
    """Fetch all tickets from the database"""
    try:
        limit = int(request.args.get("limit", 50))
        tickets = list(threads_col.find({}, {"_id": 0}).limit(limit))
        return jsonify({
            "status": "success",
            "count": len(tickets),
            "tickets": tickets
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route("/messages", methods=["GET"])
def get_msgs():
    """Fetch all messages from the database"""
    try:
        limit = int(request.args.get("limit", 50))
        msgs = list(messages_col.find({}, {"_id": 0}).limit(limit))
        return jsonify({
            "status": "success",
            "count": len(msgs),
            "messages": msgs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/tickets/<ticket_id>", methods=["GET"])
def get_ticket(ticket_id):
    """Fetch a specific ticket by ticket_id"""
    try:
        ticket = threads_col.find_one({"ticket_id": ticket_id}, {"_id": 0})
        if not ticket:
            return jsonify({
                "status": "error",
                "message": "Ticket not found"
            }), 404
        return jsonify({
            "status": "success",
            "ticket": ticket
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/tickets/<ticket_id>/messages", methods=["GET"])
def get_ticket_messages(ticket_id):
    """Fetch all messages for a specific ticket"""
    try:
        messages = list(messages_col.find({"ticket_id": ticket_id}, {"_id": 0}))
        return jsonify({
            "status": "success",
            "count": len(messages),
            "messages": messages
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, host=HOST, port=PORT)
