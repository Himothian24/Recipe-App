// This is your saved.js file

const savedRecipesContainer = document.getElementById('saved-recipes-container');
const clearRecipesButton = document.getElementById('clear-recipes-button'); // Get the button element

function loadSavedRecipes() {
    savedRecipesContainer.innerHTML = ''; // Clear the loading message

    let hasRecipes = false;

    // Loop through all keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Check if the key starts with our recipe identifier
        if (key.startsWith('saved_recipe_')) {
            const recipeData = localStorage.getItem(key);
            
            // Create a new div to hold the recipe content
            const recipeDiv = document.createElement('div');
            recipeDiv.innerHTML = recipeData;
            savedRecipesContainer.appendChild(recipeDiv);
            hasRecipes = true;
        }
    }

    if (!hasRecipes) {
        savedRecipesContainer.innerHTML = '<p>You have not saved any recipes yet.</p>';
    }
}

// Function to clear all saved recipes
function clearSavedRecipes() {
    if (confirm("Are you sure you want to clear all saved recipes? This cannot be undone.")) {
        // Iterate backward to avoid issues with shifting keys during removal
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith('saved_recipe_')) {
                localStorage.removeItem(key);
            }
        }
        loadSavedRecipes(); // Reload the list to show it's empty
    }
}

// Load the recipes when the page loads
document.addEventListener('DOMContentLoaded', loadSavedRecipes);

// Attach the event listener to the clear button
clearRecipesButton.addEventListener('click', clearSavedRecipes);