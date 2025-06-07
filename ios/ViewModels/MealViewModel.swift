import Foundation

class MealViewModel: ObservableObject {
    @Published var calories: String = "1500"
    @Published var mealMode: MealMode = .fastFood
    @Published var fastFoodType: String = "any"
    @Published var diningTags: Set<String> = []
    @Published var commonIngredients: Set<String> = []
    @Published var extraIngredients: String = ""

    @Published var result: MealResult?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let service: GeminiAPIService

    init(service: GeminiAPIService = GeminiAPIService()) {
        self.service = service
    }

    func generateMeal() {
        Task {
            await generateMealTask()
        }
    }

    @MainActor
    private func generateMealTask() async {
        isLoading = true
        errorMessage = nil
        result = nil
        let prompt = buildPrompt()
        do {
            let text = try await service.generateMeal(prompt: prompt)
            result = MealResult(text: text)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func buildPrompt() -> String {
        var prompt = "Calories: \(calories).\n"
        switch mealMode {
        case .fastFood:
            prompt += "Mode: Fast Food."
            if fastFoodType != "any" { prompt += " Type: \(fastFoodType)." }
            prompt += " Suggest a meal combination from common fast-food chains."
        case .diningOut:
            let tags = diningTags.joined(separator: ", ")
            prompt += "Mode: Restaurant Meal. Preferences: \(tags)."
        case .cookHome:
            let extras = extraIngredients.split(separator: ",")
                .map { $0.trimmingCharacters(in: .whitespaces) }
            let all = Array(commonIngredients) + extras
            let ingredients = all.joined(separator: ", ")
            prompt += "Mode: Home Cooking. Ingredients: \(ingredients)."
        }
        prompt += " Return a concise meal plan with calories and macros." 
        return prompt
    }
}
