import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";


// WARNING: Replace with your actual API key
const API_KEY = 'AIzaSyCkmZ8iTx2iGDbC5Tp3yVD6Neg1vL7BEA8'; // Replace with your key

// Corrected variable name
let recipe_num = 0;
const ai = new GoogleGenerativeAI(API_KEY);

const imageInput = document.getElementById('food-pic');
const imagePreview = document.getElementById('image-preview');
const ingredientsInput = document.getElementById('food-input-field');
const servingsInput = document.getElementById('serving-num');
const detailSelector = document.getElementById('recipe-detail-selector');
const useOnlyIngredientsSelector = document.getElementById('person_input_num');
var submitButton = document.getElementById('submit-recipe-button');
const outputDiv = document.getElementById('output');

let uploadedFile = null;

// Display image preview when a file is selected
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
        uploadedFile = null;
    }
});

// Convert a File object to a Base64 string
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};


function createRecipeCard(recipeData) {
    const cardBackgroundColor = recipeData.colors[0];
    const titleBorderColor = recipeData.colors[1]; 

    const cardStyle = `padding: 15px; margin: 15px 0; border: 1px solid #ddd; border-radius: 8px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); position: relative; background: ${cardBackgroundColor};`;
    const titleStyle = `color: #333; border-bottom: 2px solid ${titleBorderColor}; padding-bottom: 5px;`;
    const buttonContainerStyle = 'text-align: right; margin-top: 10px;';
    const buttonStyle = 'background-color: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;';

    const ingredientsArray = Array.isArray(recipeData.ingredients) ? recipeData.ingredients : (recipeData.ingredients ? String(recipeData.ingredients).split('\n').filter(i => i.trim()) : []);
    
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

function displayRecipeCards(recipe) {
    outputDiv.innerHTML = ''; // Clear existing content

    // Generate and append HTML for each recipe
    outputDiv.innerHTML += createRecipeCard(recipe);

}

submitButton.addEventListener('click', async () => {
    submitButton.setAttribute('disabled', true);
    submitButton.setAttribute('style', 'background-color: #0056b3;')
    const ingredients = ingredientsInput.value.trim();
    recipe_num = recipe_num + 1;
    
    // Check if at least one input is provided
    if (!uploadedFile && !ingredients) {
        alert("Please upload an image or enter main ingredients to generate a recipe.");
        return;
    }

    outputDiv.innerHTML = "<p>Generating recipe... Please wait.</p>";

    try {
        const servings = servingsInput.value || "1";
        const detail = detailSelector.value;
        const useOnly = useOnlyIngredientsSelector.value;

        let promptText;
        

        if (uploadedFile && ingredients) {
            promptText = `Generate a recipe for the dish shown in the provided image. Use the following ingredients as a starting point: ${ingredients}.`;
        } 

        else if (uploadedFile) {
            promptText = `Generate a recipe for the dish in the provided image.`;
        } 
 
        else {
            promptText = `Generate a recipe for a dish using the following main ingredients: ${ingredients}.`;
        }
        
        promptText += `\n\nThe recipe should have the following characteristics:
        Include servings: ${servings}, details: ${detail},
        Return the results as a JSON. Each object must have the following keys:
        "title" (string), "restrictions" (string), "ingredients" (array of strings),
        and "instructions" (string) with each instruction on new line and numbered, and "colors" (array of strings) with 2 hexadecimal representing a color sceme assoeatioed with .
        Finally Do not include any text, markdown formatting (like triple backticks or markdown lists),
        or explanation outside of the final JSON.

       `;

    
        if (useOnly === 'yes') {
            promptText += `\n- The recipe must use ONLY these ingredients. Do not add any others.`;
        }
        
        const parts = [];

        // Add the image part only if a file is uploaded
        if (uploadedFile) {
            const base64ImageData = await fileToBase64(uploadedFile);
            const mimeType = uploadedFile.type || 'image/jpeg';
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64ImageData,
                },
            });
        }
        
        parts.push({ text: promptText });

        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent({
            contents: [{ parts: parts }],
        });

        const responseText = await result.response.text();
        const jsontext = JSON.parse(responseText);
        const stringtext = JSON.stringify(jsontext)
        localStorage.setItem(`recipe-${jsontext.title.replace(/\s/g, '_').toLowerCase()}`, stringtext)
        alert(`${jsontext.title} is saved.`)

        outputDiv.innerHTML = "";
        displayRecipeCards(jsontext);
        
    } catch (error) {
        console.error("Error generating recipe:", error);
        outputDiv.textContent = `Error: ${error.message}. Please check the console for details.`;
    }
    submitButton.removeAttribute('disabled');
    submitButton.setAttribute('style', 'button{background-color: #007bff;}button:hover{background-color: #0056b3;} ')
});