import SwiftUI

struct MainFormView: View {
    @StateObject private var viewModel = MealViewModel()

    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Your Daily Calories")) {
                    TextField("1500", text: $viewModel.calories)
                        .keyboardType(.numberPad)
                }

                Section(header: Text("Meal Source")) {
                    Picker("Meal Source", selection: $viewModel.mealMode) {
                        ForEach(MealMode.allCases) { mode in
                            Text(mode.displayName).tag(mode)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())

                    switch viewModel.mealMode {
                    case .fastFood:
                        FastFoodOptionsView(viewModel: viewModel)
                    case .diningOut:
                        DiningOutOptionsView(viewModel: viewModel)
                    case .cookHome:
                        HomeCookingOptionsView(viewModel: viewModel)
                    }
                }

                Section {
                    Button("Get My Daily Meal") {
                        viewModel.generateMeal()
                    }
                }

                if let result = viewModel.result {
                    Section {
                        ResultView(text: result.text, regenerateAction: viewModel.generateMeal)
                    }
                }

                if viewModel.isLoading {
                    ProgressView("Finding your Daily Meal...")
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                }
            }
            .navigationTitle("Daily Meal")
        }
    }
}

struct MainFormView_Previews: PreviewProvider {
    static var previews: some View {
        MainFormView()
    }
}
