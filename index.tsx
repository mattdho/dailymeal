
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set for Daily Meal.");
    displayError("Configuration Error: Daily Meal API Key is missing. Please ensure it's set up correctly to power your meal plans.");
    const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
    if (generateButton) generateButton.disabled = true;
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17';

// DOM Elements
const themeToggleButton = document.getElementById('theme-toggle') as HTMLButtonElement;
const themeIconSun = document.getElementById('theme-icon-sun') as HTMLElement;
const themeIconMoon = document.getElementById('theme-icon-moon') as HTMLElement;
const mealForm = document.getElementById('meal-form') as HTMLFormElement;
const caloriesInput = document.getElementById('calories') as HTMLInputElement;
const mealModeRadios = document.querySelectorAll<HTMLInputElement>('input[name="meal-mode"]');
const fastFoodOptionsDiv = document.getElementById('fast-food-options') as HTMLDivElement;
const diningOutOptionsDiv = document.getElementById('dining-out-options') as HTMLDivElement;
const cookHomeOptionsDiv = document.getElementById('cook-home-options') as HTMLDivElement;
const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
const loadingDiv = document.getElementById('loading') as HTMLDivElement;
const errorMessageDiv = document.getElementById('error-message') as HTMLDivElement;
const mealResultContainer = document.getElementById('meal-result-container') as HTMLDivElement;
const regenerateButton = document.getElementById('regenerate-button') as HTMLButtonElement;
const fastFoodTypeSelect = document.getElementById('fast-food-type') as HTMLSelectElement;
const onboardingTooltip = document.getElementById('onboarding-tooltip') as HTMLDivElement;
const closeTooltipButton = document.getElementById('close-tooltip') as HTMLButtonElement;
const currentYearSpan = document.getElementById('current-year') as HTMLSpanElement;

if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear().toString();
}

// --- Theme Toggle Functionality ---
function setThemeProvider(theme: 'light' | 'dark') {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        if (themeIconSun) themeIconSun.style.display = 'block';
        if (themeIconMoon) themeIconMoon.style.display = 'none';
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        if (themeIconSun) themeIconSun.style.display = 'none';
        if (themeIconMoon) themeIconMoon.style.display = 'block';
    }
}

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            setThemeProvider('light');
            localStorage.setItem('theme', 'light');
        } else {
            setThemeProvider('dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Apply saved theme or default to light
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
setThemeProvider(savedTheme || 'light'); // Default to light mode

// --- Onboarding Tooltip ---
if (onboardingTooltip && closeTooltipButton) {
    if (!localStorage.getItem('dailyMealTooltipDismissed')) {
        onboardingTooltip.style.display = 'flex';
    }
    closeTooltipButton.addEventListener('click', () => {
        onboardingTooltip.style.display = 'none';
        localStorage.setItem('dailyMealTooltipDismissed', 'true');
    });
}


// --- Meal Mode Change Handler ---
mealModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (fastFoodOptionsDiv) fastFoodOptionsDiv.style.display = 'none';
        if (diningOutOptionsDiv) diningOutOptionsDiv.style.display = 'none';
        if (cookHomeOptionsDiv) cookHomeOptionsDiv.style.display = 'none';

        if (radio.checked) {
            switch (radio.value) {
                case 'fast-food':
                    if (fastFoodOptionsDiv) fastFoodOptionsDiv.style.display = 'block';
                    break;
                case 'dining-out':
                    if (diningOutOptionsDiv) diningOutOptionsDiv.style.display = 'block';
                    break;
                case 'cook-home':
                    if (cookHomeOptionsDiv) cookHomeOptionsDiv.style.display = 'block';
                    break;
            }
        }
    });
});

// --- Helper Functions ---
function showLoading(isLoading: boolean) {
    if (loadingDiv) loadingDiv.style.display = isLoading ? 'flex' : 'none';
    if (generateButton) generateButton.disabled = isLoading;
    if (regenerateButton) regenerateButton.disabled = isLoading;
}

function displayError(message: string) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
    if (mealResultContainer) mealResultContainer.style.display = 'none';
}

function clearError() {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }
}

function parseMealData(text: string): Record<string, string> {
    const lines = text.split('\n');
    const data: Record<string, string> = {};
    let currentKey = '';
    let accumulatingValue = '';

    for (const line of lines) {
        const match = line.match(/^([\w-]+):\s*(.*)/); // Allow hyphens in keys like Calorie-Match
        if (match) {
            if (currentKey && accumulatingValue) {
                data[currentKey] = accumulatingValue.trim();
            }
            currentKey = match[1];
            accumulatingValue = match[2];
        } else if (currentKey) {
            accumulatingValue += '\n' + line;
        }
    }
    if (currentKey && accumulatingValue) {
        data[currentKey] = accumulatingValue.trim();
    }
    return data;
}


function displayMealResult(fullResponseText: string) {
    if (!mealResultContainer) return;
    mealResultContainer.innerHTML = ''; // Clear previous results

    const mealData = parseMealData(fullResponseText);

    const mealName = mealData.MealName || "Your Daily Meal";
    const description = mealData.Description || "No description provided.";
    const calories = mealData.Calories || "N/A";
    const protein = mealData.Protein || "N/A";
    const carbs = mealData.Carbs || "N/A";
    const fat = mealData.Fat || "N/A";
    const tagsString = mealData.Tags || "";
    const rationaleOrTips = mealData.RationaleOrTips || "";
    const sourceSpecific = mealData.SourceSpecific || "";
    const calorieMatchTag = mealData['Calorie-Match'] || ""; // Key with hyphen

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStamp = `${dayOfWeek}'s Meal`;

    let calorieMatchClass = '';
    if (calorieMatchTag.toLowerCase().includes('good') || calorieMatchTag.toLowerCase().includes('close')) {
        calorieMatchClass = 'calorie-match-good';
    }
    
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (calorieMatchTag) {
        tagsArray.push(`Match: ${calorieMatchTag}`);
    }


    const cardHTML = `
        <div class="meal-card">
            <p class="meal-day-stamp">${dateStamp}</p>
            <h3>${mealName}</h3>
            <p class="meal-description">${description.replace(/\n/g, '<br>')}</p>

            <div class="meal-calories">
                <svg class="calories-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
                <span class="calories-value">${calories}</span>
                <span class="calories-label">kcal</span>
            </div>

            <div class="macros">
                <div class="macro-item">
                    <span class="macro-icon" role="img" aria-label="Protein">🥩</span>
                    <div class="macro-value">${protein}g</div>
                    <div class="macro-label">Protein</div>
                </div>
                <div class="macro-item">
                    <span class="macro-icon" role="img" aria-label="Carbohydrates">🥔</span>
                    <div class="macro-value">${carbs}g</div>
                    <div class="macro-label">Carbs</div>
                </div>
                <div class="macro-item">
                    <span class="macro-icon" role="img" aria-label="Fat">🧈</span>
                    <div class="macro-value">${fat}g</div>
                    <div class="macro-label">Fat</div>
                </div>
            </div>

            ${tagsArray.length > 0 ? `
            <div class="meal-tags">
                ${tagsArray.map(tag => `<span class="tag ${tag.toLowerCase().startsWith('match:') ? calorieMatchClass : ''}">${tag}</span>`).join('')}
            </div>` : ''}

            ${rationaleOrTips ? `
            <div>
                <h4 class="meal-details-heading">Notes & Tips:</h4>
                <p>${rationaleOrTips.replace(/\n/g, '<br>')}</p>
            </div>` : ''}

            ${sourceSpecific ? `
            <div>
                <h4 class="meal-details-heading">Details:</h4>
                <pre>${sourceSpecific.replace(/^Ingredients:/gm, '<strong>Ingredients:</strong>').replace(/^Instructions:/gm, '<strong>Instructions:</strong>').replace(/^Cook Time:/gm, '<strong>Cook Time:</strong>').replace(/\n- /g, '\n• ').replace(/\n\d+\. /g, '\n&nbsp;&nbsp;$&')}</pre>
            </div>` : ''}
        </div>
    `;
    mealResultContainer.innerHTML = cardHTML;
    mealResultContainer.style.display = 'block';
    if (regenerateButton) {
        regenerateButton.style.display = 'block';
    }
}

// --- Form Submission Handler ---
if (mealForm) {
    mealForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!API_KEY) {
          displayError("Cannot generate meal: Daily Meal API Key is not configured.");
          return;
        }
        await generateMeal();
    });
}

if (regenerateButton) {
    regenerateButton.addEventListener('click', async () => {
        if (!API_KEY) {
          displayError("Cannot regenerate meal: Daily Meal API Key is not configured.");
          return;
        }
        await generateMeal();
    });
}


async function generateMeal() {
    showLoading(true);
    clearError();
    if (mealResultContainer) mealResultContainer.innerHTML = ''; // Clear previous results

    const calories = caloriesInput.value;
    const selectedMode = (document.querySelector('input[name="meal-mode"]:checked') as HTMLInputElement)?.value;

    let prompt = `You are Daily Meal, a friendly and intelligent AI meal planner.
Your goal is to provide one perfect meal suggestion for the user, aligned with their calorie target and preferences.
Your responses should be warm, user-first, and strictly follow the format below.

Target Calories: ${calories} kcal.

Your response MUST be in the following structured format, with each item on a new line:
MealName: [Name of the Meal/Recipe]
Description: [Short, enticing description of the meal. Max 2-3 sentences.]
Calories: [Estimated total calories, as a number only, e.g., 1250]
Protein: [Estimated protein in grams, as a number only, e.g., 75]
Carbs: [Estimated carbohydrates in grams, as a number only, e.g., 100]
Fat: [Estimated fat in grams, as a number only, e.g., 60]
Tags: [A comma-separated list of 2-4 relevant tags. Examples: High Protein, Quick Cook, Budget Friendly, Vegan, Low Carb, Vegetarian.]
Calorie-Match: [Describe how well it matches the target: "Good Match" if very close (within +/-10% of target), "Close" if reasonably close (within +/-15%), "Slightly Low" or "Slightly High" otherwise.]
RationaleOrTips: [Brief rationale for the choice, or friendly tips for ordering/preparation. Keep concise.]
SourceSpecific: [Details specific to the meal mode. See below.]

`;

    switch (selectedMode) {
        case 'fast-food':
            const selectedFastFoodType = fastFoodTypeSelect.value;
            prompt += `Mode: Fast Food.
Suggest a meal combination from common fast-food chains.
`;
            if (selectedFastFoodType && selectedFastFoodType !== 'any') {
                prompt += `Food type preference: ${selectedFastFoodType.replace('-', ' ')}.
`;
            }
            prompt += `For SourceSpecific, list the Fast Food Chain and Items. Example:
SourceSpecific:
Chain: McDonald's
Items:
- McDouble (no bun, extra pickles)
- Side Salad (vinaigrette)
`;
            break;
        case 'dining-out':
            const diningTags = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="dining-tags"]:checked'))
                .map(cb => cb.value)
                .join(', ');
            prompt += `Mode: Restaurant Meal.
${diningTags ? `User preferences: ${diningTags}.` : ''}
Suggest a general restaurant-style meal.
For SourceSpecific, suggest Cuisine Type or specific Dish Style. Example:
SourceSpecific:
Cuisine: Mediterranean
Dish Style: Grilled Chicken Platter with quinoa and roasted vegetables.
`;
            break;
        case 'cook-home':
            const commonIngredients = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="common-ingredients"]:checked'))
                .map(cb => cb.value);
            const extraIngredients = (document.getElementById('extra-ingredients') as HTMLTextAreaElement).value.split(',')
                .map(item => item.trim()).filter(item => item);
            const allIngredients = [...new Set([...commonIngredients, ...extraIngredients])].join(', ');

            prompt += `Mode: Home Cooking.
Available ingredients: ${allIngredients || 'User has not specified any ingredients; assume common pantry staples are available for a simple meal.'}
Suggest a recipe.
For SourceSpecific, provide Ingredients, Instructions, and Cook Time. Example:
SourceSpecific:
Ingredients:
- Chicken Breast: 150g
- Broccoli: 1 cup
- Olive Oil: 1 tbsp
- Salt, Pepper
Instructions:
1. Preheat oven to 200°C.
2. Season chicken and roast with broccoli for 20-25 mins.
Cook Time: 30 minutes
`;
            break;
        default:
            displayError("Please select a Meal Source.");
            showLoading(false);
            return;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });
        
        const responseText = response.text;
        if (responseText) {
            displayMealResult(responseText);
        } else {
            displayError("Daily Meal couldn't generate a meal plan this time. The response was empty. Try adjusting your query.");
        }
        if (mealResultContainer) mealResultContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Error generating Daily Meal plan:", error);
        let errorMessage = "An unexpected error occurred while Daily Meal was crafting your meal. Please try again.";
        if (error instanceof Error) {
            if (error.message.includes("API key not valid")) {
                errorMessage = "Daily Meal API Key is not valid. Please check your configuration.";
            } else if (error.message.includes("quota")) {
                errorMessage = "You've exceeded your Daily Meal API quota for now. Please check your Gemini account.";
            } else if (error.message.toLowerCase().includes("safety")){
                 errorMessage = "The request was blocked due to safety concerns. Please modify your input and try again.";
            }
        }
        displayError(errorMessage);
    } finally {
        showLoading(false);
    }
}

// Initialize the view for the default selected radio button
document.addEventListener('DOMContentLoaded', () => {
    const initiallySelectedMode = (document.querySelector('input[name="meal-mode"]:checked') as HTMLInputElement)?.value;
    if (initiallySelectedMode) {
        switch (initiallySelectedMode) {
            case 'fast-food': if (fastFoodOptionsDiv) fastFoodOptionsDiv.style.display = 'block'; break;
            case 'dining-out': if (diningOutOptionsDiv) diningOutOptionsDiv.style.display = 'block'; break;
            case 'cook-home': if (cookHomeOptionsDiv) cookHomeOptionsDiv.style.display = 'block'; break;
        }
    }
     if (!API_KEY && generateButton) {
        generateButton.disabled = true;
    }
});
