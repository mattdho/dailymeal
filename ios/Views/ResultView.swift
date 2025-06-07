import SwiftUI

struct ResultView: View {
    let text: String
    let regenerateAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(text)
                .padding()
            Button("Try Another Meal") {
                regenerateAction()
            }
        }
    }
}

struct ResultView_Previews: PreviewProvider {
    static var previews: some View {
        ResultView(text: "Sample meal result", regenerateAction: {})
            .padding()
    }
}
