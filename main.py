from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
import json
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow all origins
CORS(app)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Recipe generation template

template = """
Using the ingredients: {ingredients}
Create {num_recipes} recipe(s).

Return ONLY a JSON object with NO additional text, formatted EXACTLY as shown:
{{
    "recipes": [
        {{
            "recipe_name": "Recipe Name",
            "cooking_time": "X minutes",
            "difficulty": "Easy/Medium/Hard",
            "nutrition": {{
                "calories": "X calories per serving",
                "protein": "X grams per serving"
            }},
            "ingredients_list": ["ingredient 1", "ingredient 2"],
            "instructions": ["Step 1", "Step 2"],
            "tips": "Cooking tips"
        }}
    ]
}}
"""

def get_recipes(ingredients, num_recipes):
    try:
        # Use the updated template
        prompt = ChatPromptTemplate.from_template(template)
        model = OllamaLLM(model="llama3.2")
        chain = prompt | model
        
        response = chain.invoke({
            "ingredients": ingredients,
            "num_recipes": num_recipes
        })
        
        print("Raw LLM response:", response)
        
        # Find and clean JSON from response
        match = re.search(r'(\{[\s\S]*\})', response)
        if not match:
            return {"recipes": [], "error": "No valid JSON found in response"}
            
        try:
            cleaned_data = json.loads(match.group(1))
            return cleaned_data
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            return {"recipes": [], "error": "Invalid JSON format"}
            
    except Exception as e:
        print(f"Error in get_recipes: {e}")
        return {"recipes": [], "error": str(e)}





@app.route('/generate-recipes', methods=['POST', 'OPTIONS'])
def generate_recipes():
    if request.method == 'OPTIONS':
        return '', 204
        
    logger.info("Received recipe generation request")
    try:
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        # Validate request data
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        if 'ingredients' not in data or 'num_recipes' not in data:
            return jsonify({"error": "Missing required parameters"}), 400
            
        ingredients = data['ingredients']
        num_recipes = int(data['num_recipes'])
        
        # Validate input values
        if not ingredients:
            return jsonify({"error": "Ingredients list cannot be empty"}), 400
            
        if num_recipes < 1:
            return jsonify({"error": "Number of recipes must be at least 1"}), 400
            
        result = get_recipes(ingredients, num_recipes)
        
        logger.info("Successfully generated recipes")
        return jsonify(result)
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request")
        return jsonify({"error": "Invalid JSON format"}), 400
    except ValueError as e:
        logger.error(f"Value error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Server is running"
    }), 200

if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5001, debug=True)
