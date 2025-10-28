import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";


const apiKey = "AIzaSyCkmZ8iTx2iGDbC5Tp3yVD6Neg1vL7BEA8"; 
const ai = new GoogleGenerativeAI(apiKey);


const submitButton = document.getElementById('search-button');
const queryInput = document.getElementById('recipe-query');
const resultsContainer = document.getElementById('results-container');
const message = document.getElementById('message');


//card thing
function createRecipeCard(recipeData) {
    // Styling to replicate the model's requested inline CSS style
    const cardStyle = 'padding: 15px; margin: 15px 0; border: 1px solid #ddd; border-radius: 8px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); position: relative;';
    const titleStyle = 'color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;';
    const buttonContainerStyle = 'text-align: right; margin-top: 10px;';
    const buttonStyle = 'background-color: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;';

    // Ensure ingredients is an array before mapping
    const ingredientsArray = Array.isArray(recipeData.ingredients) ? recipeData.ingredients : (recipeData.ingredients ? String(recipeData.ingredients).split('\n').filter(i => i.trim()) : []);
    
    // Build the ingredients list HTML
    const ingredientsHtml = ingredientsArray.map(item => `<li>${item}</li>`).join('');

    return `
        <div data-recipe-title="${recipeData.title.replace(/"/g, '&quot;')}" style="${cardStyle}">
            <h3 style="${titleStyle}">${recipeData.title}</h3>
            
            ${recipeData.restrictions ? `<p style="font-style: italic; color: #555;">Restrictions: ${recipeData.restrictions}</p>` : ''}

            <h4>Ingredients:</h4>
            <ul style="padding-left: 20px;">
                ${ingredientsHtml}
            </ul>

            <h4>Instructions:</h4>
            <p>${recipeData.instructions}</p>
            
            <div style="${buttonContainerStyle}">
                <button class="save-button" style="${buttonStyle}">Save Recipe</button>
            </div>
        </div>
    `;
}


//re worked button
function attachSaveButtonListeners() {
    const saveButtons = document.querySelectorAll('.save-button');
    saveButtons.forEach(button => {
        const oldButton = button.cloneNode(true);
        button.parentNode.replaceChild(oldButton, button);
    });

    document.querySelectorAll('.save-button').forEach(button => {
        button.addEventListener('click', () => {
            const recipeElement = button.closest('div');
            if (recipeElement) {
                // Get the whole HTML card content to save
                const recipeData = recipeElement.outerHTML; 
                // Use the data attribute for a cleaner title lookup
                const recipeTitle = recipeElement.getAttribute('data-recipe-title') || recipeElement.querySelector('h3').textContent;
                
                // Store in localStorage
                localStorage.setItem(`saved_recipe_${recipeTitle.replace(/\s/g, '_').toLowerCase()}`, recipeData);
                alert(`Recipe "${recipeTitle}" has been saved!`);

                if (window.loadSavedRecipes) {
                    window.loadSavedRecipes(); 
                }
            }
        });
    });
}


function displayRecipeCards(recipesArray) {
    resultsContainer.innerHTML = ''; // Clear existing content
    
    // Check if the array is empty or invalid
    if (!Array.isArray(recipesArray) || recipesArray.length === 0) {
        message.innerHTML = "<p>No recipes found. Please try a different query.</p>";
        return;
    }

    // Generate and append HTML for each recipe
    recipesArray.forEach(recipe => {
        resultsContainer.innerHTML += createRecipeCard(recipe);
    });

    // Attach event listeners to the new buttons
    attachSaveButtonListeners();
}

submitButton.addEventListener('click', async () => {
    const retrictionData = localStorage.getItem("Dietary-Restrictons");
    const retriction = JSON.parse(retrictionData);
    const ingredients = queryInput.value.trim();

    if (!ingredients) {
        message.textContent = "Please enter an ingredient or dish name to search.";
        return;
    }

    submitButton.setAttribute('disabled', true);
    submitButton.style.backgroundColor = '#0056b3';
    resultsContainer.innerHTML = ""; // Clear previous results
    message.innerHTML = "<p>Generating recipes... Please wait.</p>";

    try {
        let promptText = `Find 4 recipes for ${ingredients} that comply with the following Dietary Restriction: ${retriction}. 
        Return the results as a single JSON array of objects. Each object must have the following keys: "title" (string), "restrictions" (string), "ingredients" (array of strings), and "instructions" (string). 
        Do not include any text, markdown formatting (like triple backticks or markdown lists), or explanation outside of the final JSON array.`;
        
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent({
            contents: [{ parts: [{ text: promptText }] }],
        });

        const responseText = result.response.text().trim();
        
        let recipesData;
        try {
            const cleanText = responseText.replace(/^```json\s*|^\s*```|```$/g, '').trim(); 
            recipesData = JSON.parse(cleanText);
        } catch (parseError) {
            console.error("Error parsing JSON from model response:", parseError, "Raw text:", responseText);
            message.textContent = "Error: Could not process the recipe data from the server. Check console for raw output.";
            submitButton.removeAttribute('disabled');
            submitButton.style.backgroundColor = '#007bff';
            return;
        }

        displayRecipeCards(recipesData);
        message.innerHTML = ""; // Clear the loading message

    } catch (error) {
        console.error("Error generating recipe:", error);
        // Applying the 'straight' instruction
        const errorMessage = `The AI generator failed, and that sucks. Error: ${error.message}. Please check the console for details.`;
        message.textContent = errorMessage;
    }
    
    // Reset UI
    submitButton.removeAttribute('disabled');
    submitButton.style.backgroundColor = '#007bff'; 
});