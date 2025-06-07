import SwiftUI

struct HomeCookingOptionsView: View {
    @ObservedObject var viewModel: MealViewModel

    let commonIngredients = [
        "Chicken Breast", "Ground Beef", "Salmon", "Eggs", "Tofu", "Rice",
        "Pasta", "Quinoa", "Potatoes", "Broccoli", "Spinach", "Onions",
        "Garlic", "Tomatoes", "Olive Oil", "Avocado"
    ]

    var body: some View {
        VStack(alignment: .leading) {
            Text("Ingredients on Hand")
                .font(.headline)
            ForEach(commonIngredients, id: \.self) { ingredient in
                Toggle(isOn: Binding(
                    get: { viewModel.commonIngredients.contains(ingredient) },
                    set: { isOn in
                        if isOn { viewModel.commonIngredients.insert(ingredient) }
                        else { viewModel.commonIngredients.remove(ingredient) }
                    }
                )) {
                    Text(ingredient)
                }
            }
            TextField("Additional ingredients (comma separated)", text: $viewModel.extraIngredients)
                .textFieldStyle(RoundedBorderTextFieldStyle())
        }
    }
}

struct HomeCookingOptionsView_Previews: PreviewProvider {
    static var previews: some View {
        HomeCookingOptionsView(viewModel: MealViewModel())
            .padding()
    }
}
