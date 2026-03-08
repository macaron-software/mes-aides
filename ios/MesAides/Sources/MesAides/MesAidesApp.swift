import SwiftUI

@main
struct MesAidesApp: App {
    @StateObject private var store = SimulatorStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .preferredColorScheme(.light)
        }
    }
}
