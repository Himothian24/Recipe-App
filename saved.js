const savedRecipesContainer = document.getElementById('saved-recipes-container');
const clearRecipesButton = document.getElementById('clear-recipes-button');

/**
 * Creates the HTML string for a single recipe card.
 * @param {object} recipeData - The parsed recipe object.
 * @returns {string} The HTML string for the card.
 */
function createRecipeCard(recipeData) {
    // Using your existing styles with minor cleanup
    const cardBackgroundColor = 'rgba(255, 255, 255, 1)'; // Changed to full opacity white
    const titleBorderColor = 'rgba(0, 0, 0, 0.1)'; 

    // Used CSS properties consistent with your merged style (less inline style is better)
    const cardStyle = `padding: 20px; margin: 20px 0; border: 1px solid #e1e8ed; border-radius: 12px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); position: relative; background: ${cardBackgroundColor};`;
    const titleStyle = `color: #007bff; border-bottom: 2px solid ${titleBorderColor}; padding-bottom: 5px; margin-top: 0;`;
    const h4Style = 'color: #333; margin-top: 15px; margin-bottom: 5px;';
    const ulStyle = 'padding-left: 20px; margin-top: 5px;';
    const buttonContainerStyle = 'text-align: right; margin-top: 15px;';
    const buttonStyle = 'background-color: #007bff; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: background-color 0.3s; font-size: 16px;';


    // Ensure ingredients are handled correctly, assuming they might be a string or array
    const ingredientsArray = Array.isArray(recipeData.ingredients) 
        ? recipeData.ingredients 
        : (recipeData.ingredients 
            ? String(recipeData.ingredients).split('\n').filter(i => i.trim()) 
            : []
        );

    const ingredientsHtml = ingredientsArray.map(item => `<li>${item}</li>`).join('');

    return `
        <div data-recipe-title="${recipeData.title.replace(/"/g, '&quot;')}" style="${cardStyle}">
            <h3 style="${titleStyle}">${recipeData.title}</h3>
    
            ${recipeData.restrictions ? `<p style="font-style: italic; color: #555;">Restrictions: ${recipeData.restrictions}</p>` : ''}

            <h4 style="${h4Style}">Ingredients:</h4>
            <ul style="${ulStyle}">
                ${ingredientsHtml}
            </ul>

            <h4 style="${h4Style}">Instructions:</h4>
            <p>${recipeData.instructions}</p>
    
            <div style="${buttonContainerStyle}">
                <button class="remove-button" data-recipe-key="${recipeData.storageKey}" style="${buttonStyle}">Remove Recipe</button>
            </div>
        </div>
    `;
}

/**
 * Appends a single, parsed recipe object to the container.
 * @param {object} recipeData - The parsed recipe object to display.
 */
function displayRecipeCard(recipeData) {
    // Append the card HTML to the container
    savedRecipesContainer.innerHTML += createRecipeCard(recipeData);
}
 
/**
 * Loads all recipes from localStorage and displays them.
 */
function loadSavedRecipes() {
    savedRecipesContainer.innerHTML = ''; // IMPORTANT: Clear container once at the start
    let hasRecipes = false;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith('recipe-')) {
            const recipeJson = localStorage.getItem(key);
            
            try {
                // IMPORTANT FIX: Parse the JSON string back into a JS object
                const recipeData = JSON.parse(recipeJson);
                
                // Attach the storage key to the data for easy removal later
                recipeData.storageKey = key; 
                
                // Display the parsed recipe
                displayRecipeCard(recipeData);
                hasRecipes = true;
            } catch (e) {
                console.error("Error parsing recipe data from localStorage for key:", key, e);
            }
        }
    }

    if (!hasRecipes) {
        savedRecipesContainer.innerHTML = '<p>You have not saved any recipes yet.</p>';
    }
    
    // Attach event listeners to the new "Remove" buttons
    attachRemoveEventListeners();
}

/**
 * Clears all recipes and reloads the display.
 */
function clearSavedRecipes() {
    // Added a check to respect your original prompt, but changed the loop slightly
    if (confirm("Are you sure you want to clear all saved recipes? This cannot be undone.")) {
       
        // Loop backwards to safely remove items without skipping
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('recipe-')) {
                localStorage.removeItem(key);
            }
        }
        loadSavedRecipes(); // Reload the display
    }
}

/**
 * Attaches click handlers to the new "Remove" buttons.
 */
function attachRemoveEventListeners() {
    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const key = event.target.getAttribute('data-recipe-key');
            if (key && confirm('Are you sure you want to remove this recipe?')) {
                localStorage.removeItem(key);
                loadSavedRecipes(); // Reload to update the display
            }
        });
    });
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', loadSavedRecipes);

// Event listener for the global clear button
if (clearRecipesButton) {
    clearRecipesButton.addEventListener('click', clearSavedRecipes);
} else {
    // If you don't have a clear button, you can remove this block.
    console.warn("Element with ID 'clear-recipes-button' not found.");
}

// Expose the function if needed by other scripts
window.loadSavedRecipes = loadSavedRecipes;