# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

This repository also contains a SwiftUI iOS project that demonstrates the same Gemini-powered meal-planning features for mobile users.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set the `GEMINI_API_KEY` to your Gemini API key. Keep `.env.local` out of version control.
3. Run the app:
   `npm run dev`

## SwiftUI iOS App

The iOS project mirrors the web app using SwiftUI and the Gemini API.

### Configuring the Gemini API Key

1. Create a `.env` file inside the iOS project directory and add your key:

   ```
   GEMINI_API_KEY=your-api-key
   ```

2. A build script reads this value and writes it to `Info.plist` under the
   `GeminiApiKey` entry. You can also manually edit `Info.plist` if preferred.

### Build and Run

1. Open the Xcode project in `DailyMeal.xcodeproj`.
2. Select an iOS simulator device.
3. Press **Run** or hit `Cmd+R` to build and launch the app.
