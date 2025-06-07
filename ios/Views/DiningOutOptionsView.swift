import SwiftUI

struct DiningOutOptionsView: View {
    @ObservedObject var viewModel: MealViewModel

    let tags = ["high protein", "low carb", "vegetarian", "vegan", "gluten-free", "budget-friendly"]

    var body: some View {
        VStack(alignment: .leading) {
            ForEach(tags, id: \.self) { tag in
                Toggle(isOn: Binding(
                    get: { viewModel.diningTags.contains(tag) },
                    set: { isOn in
                        if isOn { viewModel.diningTags.insert(tag) }
                        else { viewModel.diningTags.remove(tag) }
                    }
                )) {
                    Text(tag.capitalized)
                }
            }
        }
    }
}

struct DiningOutOptionsView_Previews: PreviewProvider {
    static var previews: some View {
        DiningOutOptionsView(viewModel: MealViewModel())
            .padding()
    }
}
