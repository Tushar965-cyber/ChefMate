"""
ChefMate - REST API Backend Server
Connects the Python Recommendation Engine & Intent Classifier to the React Frontend.
Runs locally on http://127.0.0.1:8000 with CORS enabled.
Zero third-party pip dependencies required.
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Ensure recipe_generator directory is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

from recipe_logic import load_recipes, clean_ingredients, find_matches
from chatbot import ChefMateBot

RECIPES_FILE = os.path.join(CURRENT_DIR, "data", "recipes.json")
recipes_db = load_recipes(RECIPES_FILE)
bot_instance = ChefMateBot(RECIPES_FILE)


class ChefMateAPIHandler(BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def _send_json(self, status_code: int, data: dict):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ("/", "/api/v1/health"):
            self._send_json(200, {
                "status": "online",
                "service": "ChefMate Python Backend",
                "version": "2.0.0",
                "database_size": len(recipes_db),
                "ai_intent_model": "TF-IDF + Multinomial Naive Bayes",
            })
        elif path == "/api/v1/recipes":
            self._send_json(200, {
                "count": len(recipes_db),
                "recipes": recipes_db,
            })
        else:
            self._send_json(404, {"error": f"Endpoint {path} not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            payload = json.loads(post_data) if post_data.strip() else {}
        except Exception:
            payload = {}

        if path == "/api/v1/recommend":
            # Endpoint: POST /api/v1/recommend
            # Payload: { "ingredients": ["rice", "tomato"], "filters": { "meal_type": "dinner", ... } }
            raw_ingredients = payload.get("ingredients", [])
            if isinstance(raw_ingredients, str):
                user_ings = clean_ingredients(raw_ingredients)
            elif isinstance(raw_ingredients, list):
                user_ings = []
                for item in raw_ingredients:
                    user_ings.extend(clean_ingredients(str(item)))
            else:
                user_ings = []

            filters = payload.get("filters", {}) or {}

            # Execute Python ranking algorithm
            results = find_matches(recipes_db, user_ings, filters)

            formatted_results = []
            for item in results:
                r = item["recipe"]
                formatted_results.append({
                    "recipe": r,
                    "matchPercentage": item["match_percentage"],
                    "matchingIngredients": item["matching_ingredients"],
                    "missingIngredients": item["missing_ingredients"],
                })

            self._send_json(200, {
                "success": True,
                "count": len(formatted_results),
                "results": formatted_results,
                "applied_filters": filters,
                "user_ingredients": user_ings,
            })

        elif path == "/api/v1/chat":
            # Endpoint: POST /api/v1/chat
            # Payload: { "message": "I have rice, tomato, onion" }
            user_msg = payload.get("message", "")
            bot_reply = bot_instance.process_message(user_msg)
            last_results = []
            if bot_instance.last_results:
                for item in bot_instance.last_results:
                    last_results.append({
                        "recipe": item["recipe"],
                        "matchPercentage": item["match_percentage"],
                        "matchingIngredients": item["matching_ingredients"],
                        "missingIngredients": item["missing_ingredients"],
                    })

            self._send_json(200, {
                "reply": bot_reply,
                "active_ingredients": bot_instance.user_ingredients,
                "active_filters": bot_instance.filters,
                "results": last_results,
            })

        else:
            self._send_json(404, {"error": f"POST endpoint {path} not found"})

    def log_message(self, format, *args):
        # Clean terminal logging
        sys.stderr.write(f"[API Server] {self.address_string()} - {format % args}\n")


def run_server(port: int = 8000):
    host = "0.0.0.0"
    server_address = (host, port)
    httpd = HTTPServer(server_address, ChefMateAPIHandler)
    print("=" * 60)
    print(f"[ChefMate] Python Backend Server is RUNNING")
    print(f"[Network]  Listening on: http://{host}:{port}")
    print(f"[Database] Recipes Loaded: {len(recipes_db)}")
    print(f"Endpoints:")
    print(f"  GET  http://{host}:{port}/api/v1/health")
    print(f"  GET  http://{host}:{port}/api/v1/recipes")
    print(f"  POST http://{host}:{port}/api/v1/recommend")
    print(f"  POST http://{host}:{port}/api/v1/chat")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[API Server] Shutting down gracefully...")
        httpd.server_close()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)

