import SwiftUI

struct AchievementUnlockedView: View {
    let achievement: Achievement
    @Environment(\.dismiss) var dismiss
    @State private var animateIcon = false
    @State private var animateStars = false
    @State private var animateText = false
    @State private var showParticles = false
    
    var body: some View {
        ZStack {
            // Background
            backgroundGradient
            
            // Particle effects
            if showParticles {
                ParticleEffectView()
            }
            
            VStack(spacing: 24) {
                // Achievement icon
                achievementIcon
                
                // Title and description
                achievementInfo
                
                // Cultural significance
                if let significance = achievement.culturalSignificance {
                    culturalSignificanceCard(significance)
                }
                
                // Reward info
                rewardInfo
                
                // Continue button
                continueButton
            }
            .padding()
        }
        .ignoresSafeArea()
        .onAppear {
            startAnimations()
        }
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                achievement.isLegendary ? Color.yellow.opacity(0.3) : Color.purple.opacity(0.3),
                achievement.isLegendary ? Color.orange.opacity(0.3) : Color.blue.opacity(0.3)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            RadialGradient(
                colors: [Color.white.opacity(0.3), Color.clear],
                center: .center,
                startRadius: 50,
                endRadius: 300
            )
        )
    }
    
    // MARK: - Achievement Icon
    private var achievementIcon: some View {
        ZStack {
            // Glow effect
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            achievement.isLegendary ? Color.yellow : Color.purple,
                            Color.clear
                        ],
                        center: .center,
                        startRadius: 20,
                        endRadius: 100
                    )
                )
                .frame(width: 200, height: 200)
                .blur(radius: 20)
                .opacity(animateIcon ? 0.8 : 0)
            
            // Trophy base
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: achievementColors,
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 120, height: 120)
                .rotationEffect(.degrees(animateIcon ? 360 : 0))
                .scaleEffect(animateIcon ? 1.0 : 0.5)
            
            // Icon
            Image(systemName: achievement.icon)
                .font(.system(size: 60))
                .foregroundColor(.white)
                .scaleEffect(animateIcon ? 1.0 : 0)
            
            // Stars around icon
            ForEach(0..<8) { index in
                Image(systemName: "star.fill")
                    .font(.system(size: 20))
                    .foregroundColor(.yellow)
                    .offset(
                        x: cos(CGFloat(index) * .pi / 4) * 80,
                        y: sin(CGFloat(index) * .pi / 4) * 80
                    )
                    .rotationEffect(.degrees(Double(index) * 45))
                    .scaleEffect(animateStars ? 1.0 : 0)
                    .opacity(animateStars ? 1.0 : 0)
                    .animation(
                        .spring(response: 0.5, dampingFraction: 0.6)
                        .delay(Double(index) * 0.1),
                        value: animateStars
                    )
            }
        }
        .padding(.top, 40)
    }
    
    // MARK: - Achievement Info
    private var achievementInfo: some View {
        VStack(spacing: 12) {
            Text("Achievement Unlocked!")
                .font(.headline)
                .foregroundColor(.secondary)
                .scaleEffect(animateText ? 1.0 : 0.8)
                .opacity(animateText ? 1.0 : 0)
            
            Text(achievement.title)
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.primary)
                .multilineTextAlignment(.center)
                .scaleEffect(animateText ? 1.0 : 0.8)
                .opacity(animateText ? 1.0 : 0)
            
            Text(achievement.description)
                .font(.title3)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
                .scaleEffect(animateText ? 1.0 : 0.8)
                .opacity(animateText ? 1.0 : 0)
        }
    }
    
    // MARK: - Cultural Significance Card
    private func culturalSignificanceCard(_ significance: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Cultural Significance", systemImage: "globe.africa.fill")
                .font(.headline)
                .foregroundColor(.purple)
            
            Text(significance)
                .font(.callout)
                .foregroundColor(.secondary)
                .lineSpacing(4)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.purple.opacity(0.1))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.purple.opacity(0.3), lineWidth: 1)
        )
        .scaleEffect(animateText ? 1.0 : 0.9)
        .opacity(animateText ? 1.0 : 0)
    }
    
    // MARK: - Reward Info
    private var rewardInfo: some View {
        HStack(spacing: 20) {
            rewardBadge(
                icon: "star.circle.fill",
                value: "+\(achievement.points)",
                label: "XP"
            )
            
            if achievement.category == .cultural {
                rewardBadge(
                    icon: "globe.africa.fill",
                    value: "+\(achievement.points)",
                    label: "Cultural Points"
                )
            }
            
            if achievement.isRare {
                rewardBadge(
                    icon: "sparkles",
                    value: "Rare",
                    label: "Achievement"
                )
            }
            
            if achievement.isLegendary {
                rewardBadge(
                    icon: "crown.fill",
                    value: "Legendary",
                    label: "Status"
                )
            }
        }
        .scaleEffect(animateText ? 1.0 : 0.8)
        .opacity(animateText ? 1.0 : 0)
    }
    
    private func rewardBadge(icon: String, value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(.orange)
            
            Text(value)
                .font(.headline)
                .foregroundColor(.primary)
            
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(minWidth: 80)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.orange.opacity(0.1))
        )
    }
    
    // MARK: - Continue Button
    private var continueButton: some View {
        Button(action: {
            dismiss()
        }) {
            HStack {
                Text("Continue")
                    .font(.headline)
                Image(systemName: "arrow.forward.circle.fill")
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                LinearGradient(
                    colors: [Color.orange, Color.orange.opacity(0.8)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(.white)
            .cornerRadius(16)
            .shadow(color: Color.orange.opacity(0.3), radius: 8, x: 0, y: 4)
        }
        .padding(.horizontal)
        .scaleEffect(animateText ? 1.0 : 0.8)
        .opacity(animateText ? 1.0 : 0)
    }
    
    // MARK: - Helper Properties
    private var achievementColors: [Color] {
        if achievement.isLegendary {
            return [Color.yellow, Color.orange]
        } else if achievement.isRare {
            return [Color.purple, Color.blue]
        } else {
            return [Color.orange, Color.orange.opacity(0.8)]
        }
    }
    
    // MARK: - Animations
    private func startAnimations() {
        withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
            animateIcon = true
        }
        
        withAnimation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3)) {
            animateStars = true
            showParticles = true
        }
        
        withAnimation(.spring(response: 0.5, dampingFraction: 0.8).delay(0.5)) {
            animateText = true
        }
        
        // Haptic feedback
        WKInterfaceDevice.current().play(.success)
    }
}

// MARK: - Particle Effect View
struct ParticleEffectView: View {
    @State private var particles: [Particle] = []
    
    var body: some View {
        GeometryReader { geometry in
            ForEach(particles) { particle in
                ParticleView(particle: particle)
            }
        }
        .onAppear {
            createParticles()
        }
    }
    
    private func createParticles() {
        for _ in 0..<20 {
            let particle = Particle(
                x: CGFloat.random(in: 0...UIScreen.main.bounds.width),
                y: UIScreen.main.bounds.height,
                size: CGFloat.random(in: 4...8),
                color: [Color.yellow, Color.orange, Color.purple].randomElement()!,
                velocity: CGFloat.random(in: 2...5),
                angle: CGFloat.random(in: -30...30)
            )
            particles.append(particle)
        }
    }
}

struct Particle: Identifiable {
    let id = UUID()
    var x: CGFloat
    var y: CGFloat
    let size: CGFloat
    let color: Color
    let velocity: CGFloat
    let angle: CGFloat
}

struct ParticleView: View {
    let particle: Particle
    @State private var offset = CGSize.zero
    @State private var opacity: Double = 1.0
    
    var body: some View {
        Circle()
            .fill(particle.color)
            .frame(width: particle.size, height: particle.size)
            .position(x: particle.x, y: particle.y)
            .offset(offset)
            .opacity(opacity)
            .onAppear {
                withAnimation(.linear(duration: 3)) {
                    offset = CGSize(
                        width: particle.angle * 5,
                        height: -particle.velocity * 150
                    )
                    opacity = 0
                }
            }
    }
}

// MARK: - Shona Celebration View
struct ShonaPatternView: View {
    @State private var animate = false
    
    var body: some View {
        ZStack {
            ForEach(0..<6) { index in
                ShonaSymbol()
                    .offset(
                        x: cos(CGFloat(index) * .pi / 3) * 100,
                        y: sin(CGFloat(index) * .pi / 3) * 100
                    )
                    .rotationEffect(.degrees(Double(index) * 60))
                    .scaleEffect(animate ? 1.5 : 0.5)
                    .opacity(animate ? 0 : 1)
                    .animation(
                        .easeOut(duration: 2)
                        .delay(Double(index) * 0.2)
                        .repeatForever(autoreverses: false),
                        value: animate
                    )
            }
        }
        .onAppear {
            animate = true
        }
    }
}

struct ShonaSymbol: View {
    var body: some View {
        ZStack {
            // Traditional pattern placeholder
            Circle()
                .stroke(Color.orange, lineWidth: 2)
                .frame(width: 20, height: 20)
            
            Circle()
                .fill(Color.orange)
                .frame(width: 8, height: 8)
        }
    }
}

// MARK: - Preview
struct AchievementUnlockedView_Previews: PreviewProvider {
    static var previews: some View {
        AchievementUnlockedView(
            achievement: Achievement(
                id: "test",
                title: "Munhu Ane Hunhu",
                description: "Master all greeting forms",
                icon: "hands.sparkles.fill",
                points: 100,
                category: .cultural,
                requirement: .categoryMastered("Greetings"),
                isRare: true,
                culturalSignificance: "Greetings are the foundation of hunhu (ubuntu) - the philosophy of interconnectedness"
            )
        )
    }
}