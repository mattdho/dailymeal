import Foundation

enum MealMode: String, CaseIterable, Identifiable {
    case fastFood = "fast-food"
    case diningOut = "dining-out"
    case cookHome = "cook-home"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .fastFood: return "Fast Food"
        case .diningOut: return "Restaurant Meal"
        case .cookHome: return "Home Cooking"
        }
    }
}
