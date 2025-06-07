import SwiftUI

struct FastFoodOptionsView: View {
    @ObservedObject var viewModel: MealViewModel

    var body: some View {
        Picker("Fast Food Type", selection: $viewModel.fastFoodType) {
            Text("Any / General").tag("any")
            Text("Burgers / American").tag("burgers")
            Text("Mexican").tag("mexican")
            Text("Pizza").tag("pizza")
            Text("Sandwiches / Subs").tag("sandwiches")
            Text("Chicken").tag("chicken")
            Text("Asian / Chinese").tag("chinese")
        }
        .pickerStyle(MenuPickerStyle())
    }
}

struct FastFoodOptionsView_Previews: PreviewProvider {
    static var previews: some View {
        FastFoodOptionsView(viewModel: MealViewModel())
            .padding()
    }
}
