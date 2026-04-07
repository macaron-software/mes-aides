import SwiftUI

/// Root navigation hub — adaptive for iPhone (NavigationStack) and iPad (NavigationSplitView)
struct ContentView: View {
    @Environment(\.horizontalSizeClass) private var hSizeClass

    var body: some View {
        if hSizeClass == .regular {
            AidaIPadLayout()
        } else {
            NavigationStack {
                HomeView()
            }
        }
    }
}

// MARK: — iPad: NavigationSplitView with sidebar

private struct AidaIPadLayout: View {
    @EnvironmentObject var store: SimulatorStore
    @State private var selected: String? = "home"

    var body: some View {
        NavigationSplitView {
            List(selection: $selected) {
                Label("Accueil",     systemImage: "house.fill")         .tag("home")
                Label("Simulateur", systemImage: "list.clipboard.fill") .tag("simulator")
                Label("Résultats",  systemImage: "checkmark.seal.fill") .tag("results")
            }
            .navigationTitle("Mes Aides")
            .navigationSplitViewColumnWidth(min: 220, ideal: 240)
        } detail: {
            NavigationStack {
                switch selected {
                case "simulator": SimulatorView()
                case "results":   ResultsView(results: store.results, profile: store.profile)
                default:          HomeView()
                }
            }
        }
    }
}
