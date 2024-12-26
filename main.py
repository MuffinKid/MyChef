from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM

# Define the template with conditional formatting
template = """
Using ONLY these ingredients: {question}

Create {num_recipes} recipe(s) with the following specifications:
{detail_level}
{macro_info}

Only suggest recipes that use EXCLUSIVELY the ingredients provided. Do not assume availability of any additional ingredients.

Answer:"""

def get_recipe_details(is_detailed):
    if is_detailed:
        return """For each recipe include:
- Recipe name
- Detailed step-by-step instructions
- Cooking time and temperature where applicable
- Precise measurements
- Cooking tips and techniques"""
    else:
        return """For each recipe include:
- Recipe name
- Brief 2-3 step instructions
- Approximate cooking time"""

def get_macro_request(include_macros):
    if include_macros:
        return """For each recipe, include nutritional information:
- Total calories
- Protein content
- Carbohydrates
- Fat content"""
    return ""

def get_recipes(ingredients, num_recipes, is_detailed, include_macros):
    detail_level = get_recipe_details(is_detailed)
    macro_info = get_macro_request(include_macros)
    
    # Create the prompt template
    prompt = ChatPromptTemplate.from_template(template)
    
    # Initialize the model
    model = OllamaLLM(model="llama3.2:1b")
    
    # Create the chain
    chain = prompt | model
    
    return chain.invoke({
        "question": ingredients,
        "num_recipes": num_recipes,
        "detail_level": detail_level,
        "macro_info": macro_info
    })

def main():
    # Get ingredients
    ingredients = input("Enter your available ingredients (separate with commas): ")
    
    # Get number of recipes
    while True:
        try:
            num_recipes = int(input("\nHow many recipes would you like? (enter a number): "))
            if num_recipes > 0:
                break
            print("Please enter a positive number.")
        except ValueError:
            print("Please enter a valid number.")
    
    # Get detail level preference
    while True:
        detail_choice = input("\nWould you like detailed or basic recipes? (detailed/basic): ").lower()
        if detail_choice in ['detailed', 'basic']:
            break
        print("Please enter either 'detailed' or 'basic'.")
    is_detailed = detail_choice == 'detailed'
    
    # Get macro preference
    while True:
        macro_choice = input("\nWould you like to include nutritional information (macros)? (yes/no): ").lower()
        if macro_choice in ['yes', 'no', 'y', 'n']:
            break
        print("Please enter 'yes' or 'no'.")
    include_macros = macro_choice.startswith('y')
    

    print("\nGenerating your recipes...")
    recipes = get_recipes(ingredients, num_recipes, is_detailed, include_macros)
    print(recipes)
    
    while True:
        more = input("\nWould you like more recipes with these ingredients? (yes/no): ").lower()
        if more not in ['yes', 'y']:
            print("Thank you for using the recipe generator!")
            break
        
        print("\nGenerating more recipes...")
        recipes = get_recipes(ingredients, num_recipes, is_detailed, include_macros)
        print(recipes)

if __name__ == "__main__":
    main()