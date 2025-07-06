import SwiftUI

struct ContentView: View {
    @StateObject private var flashcardManager = FlashcardManager()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header
                VStack {
                    Text("Shona Flash")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                    
                    Text("Learn Words")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Quick Stats
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(flashcardManager.reviewCount)")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("Due")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(flashcardManager.streakCount)")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("Streak")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal)
                
                // Main Actions
                VStack(spacing: 12) {
                    NavigationLink(destination: FlashcardView()) {
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.orange)
                            .frame(height: 45)
                            .overlay(
                                HStack {
                                    Image(systemName: "rectangle.on.rectangle")
                                        .font(.system(size: 16, weight: .semibold))
                                    Text("Study")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                .foregroundColor(.white)
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    HStack(spacing: 8) {
                        NavigationLink(destination: ProgressView()) {
                            RoundedRectangle(cornerRadius: 20)
                                .fill(Color.blue)
                                .frame(height: 35)
                                .overlay(
                                    HStack {
                                        Image(systemName: "chart.bar")
                                            .font(.system(size: 12))
                                        Text("Progress")
                                            .font(.system(size: 12))
                                    }
                                    .foregroundColor(.white)
                                )
                        }
                        .buttonStyle(PlainButtonStyle())
                        
                        NavigationLink(destination: SettingsView()) {
                            RoundedRectangle(cornerRadius: 20)
                                .fill(Color.gray)
                                .frame(height: 35)
                                .overlay(
                                    HStack {
                                        Image(systemName: "gear")
                                            .font(.system(size: 12))
                                        Text("Settings")
                                            .font(.system(size: 12))
                                    }
                                    .foregroundColor(.white)
                                )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .padding()
            .navigationTitle("")
            .navigationBarHidden(true)
        }
        .onAppear {
            flashcardManager.loadFlashcards()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}