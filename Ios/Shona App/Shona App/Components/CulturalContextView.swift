//
//  CulturalContextView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 7/1/2025.
//

import SwiftUI

struct CulturalContextView: View {
    let culturalNotes: [String]
    var title: String = "Cultural Context"
    @State var expanded: Bool = false
    var variant: CulturalVariant = .default
    
    enum CulturalVariant {
        case `default`, compact, highlight
        
        var containerColor: Color {
            switch self {
            case .default: return Color.orange.opacity(0.1)
            case .compact: return Color.yellow.opacity(0.1)
            case .highlight: return Color.orange.opacity(0.15)
            }
        }
        
        var borderColor: Color {
            switch self {
            case .default: return Color.orange.opacity(0.3)
            case .compact: return Color.yellow.opacity(0.3)
            case .highlight: return Color.orange.opacity(0.4)
            }
        }
        
        var iconColor: Color {
            switch self {
            case .default: return Color.orange
            case .compact: return Color.yellow
            case .highlight: return Color.orange
            }
        }
        
        var textColor: Color {
            switch self {
            case .default: return Color.orange
            case .compact: return Color.yellow
            case .highlight: return Color.orange
            }
        }
    }
    
    var body: some View {
        if !culturalNotes.isEmpty {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                Button(action: { withAnimation(.easeInOut) { expanded.toggle() } }) {
                    HStack {
                        HStack(spacing: 8) {
                            Image(systemName: "globe")
                                .font(.title3)
                                .foregroundColor(variant.iconColor)
                            
                            Text(title)
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(variant.textColor)
                            
                            if variant == .highlight {
                                Image(systemName: "heart.fill")
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .opacity(0.8)
                            }
                        }
                        
                        Spacer()
                        
                        Image(systemName: expanded ? "chevron.up" : "chevron.down")
                            .font(.caption)
                            .foregroundColor(variant.iconColor)
                            .rotationEffect(.degrees(expanded ? 180 : 0))
                            .animation(.easeInOut, value: expanded)
                    }
                }
                .buttonStyle(PlainButtonStyle())
                
                // Cultural Notes Content
                if expanded {
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(culturalNotes.enumerated()), id: \.offset) { index, note in
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "lightbulb.fill")
                                    .font(.caption)
                                    .foregroundColor(variant.iconColor)
                                    .padding(.top, 2)
                                
                                Text(note)
                                    .font(.callout)
                                    .foregroundColor(.primary)
                                    .lineLimit(nil)
                                    .multilineTextAlignment(.leading)
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color(.systemBackground).opacity(0.8))
                            )
                        }
                        
                        // Cultural insight callout
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "heart.fill")
                                .font(.caption)
                                .foregroundColor(.red)
                                .padding(.top, 2)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Cultural Insight")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(variant.textColor)
                                
                                Text("Understanding these cultural contexts helps you communicate more naturally and respectfully in Shona. Language and culture are deeply connected - when you learn one, you discover the other.")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                    .lineLimit(nil)
                                    .multilineTextAlignment(.leading)
                            }
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color(.systemBackground).opacity(0.9))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(variant.borderColor, lineWidth: 1)
                                )
                        )
                    }
                    .padding(.top, 12)
                    .transition(.opacity.combined(with: .scale(scale: 0.95, anchor: .top)))
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(variant.containerColor)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(variant.borderColor, lineWidth: 1)
                    )
            )
        }
    }
}

// MARK: - Compact Version

struct CulturalContextCompact: View {
    let culturalNotes: [String]
    var maxNotes: Int = 2
    
    var body: some View {
        if !culturalNotes.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    Image(systemName: "globe")
                        .font(.caption)
                        .foregroundColor(.orange)
                    
                    Text("Cultural Notes")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.orange)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(Array(culturalNotes.prefix(maxNotes).enumerated()), id: \.offset) { index, note in
                        HStack(alignment: .top, spacing: 6) {
                            Circle()
                                .fill(Color.orange)
                                .frame(width: 4, height: 4)
                                .padding(.top, 6)
                            
                            Text(note)
                                .font(.caption2)
                                .foregroundColor(.orange)
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                        }
                    }
                    
                    if culturalNotes.count > maxNotes {
                        HStack(alignment: .top, spacing: 6) {
                            Circle()
                                .fill(Color.orange.opacity(0.5))
                                .frame(width: 4, height: 4)
                                .padding(.top, 6)
                            
                            Text("+\(culturalNotes.count - maxNotes) more cultural insight\(culturalNotes.count - maxNotes > 1 ? "s" : "")")
                                .font(.caption2)
                                .foregroundColor(.orange.opacity(0.8))
                                .italic()
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Highlight Version

struct CulturalContextHighlight: View {
    let culturalNotes: [String]
    
    var body: some View {
        if !culturalNotes.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 12) {
                    Circle()
                        .fill(Color.orange)
                        .frame(width: 32, height: 32)
                        .overlay(
                            Image(systemName: "globe")
                                .font(.callout)
                                .foregroundColor(.white)
                        )
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Cultural Spotlight")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.orange)
                        
                        Text("Essential cultural understanding")
                            .font(.caption)
                            .foregroundColor(.orange.opacity(0.8))
                    }
                    
                    Spacer()
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text(culturalNotes[0])
                        .font(.callout)
                        .foregroundColor(.primary)
                        .lineLimit(nil)
                        .multilineTextAlignment(.leading)
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color(.systemBackground).opacity(0.8))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.orange.opacity(0.3), lineWidth: 1)
                        )
                )
                
                if culturalNotes.count > 1 {
                    HStack {
                        Spacer()
                        Text("+\(culturalNotes.count - 1) more cultural insight\(culturalNotes.count - 1 > 1 ? "s" : "")")
                            .font(.caption2)
                            .foregroundColor(.orange.opacity(0.8))
                        Spacer()
                    }
                }
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [
                        Color.orange.opacity(0.1),
                        Color.yellow.opacity(0.1),
                        Color.orange.opacity(0.05)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.orange.opacity(0.4), lineWidth: 1)
            )
            .cornerRadius(16)
        }
    }
}

// MARK: - Preview

#Preview {
    ScrollView {
        VStack(spacing: 20) {
            CulturalContextView(
                culturalNotes: [
                    "In Shona culture, greetings are sacred and show respect",
                    "Always use plural forms when addressing elders or strangers",
                    "The greeting 'mhoroi' shows more respect than 'mhoro'"
                ],
                expanded: true
            )
            
            CulturalContextCompact(
                culturalNotes: [
                    "Names in Shona culture often have deep meaning",
                    "It's polite to ask for someone's name after greeting",
                    "Numbers are essential for market interactions"
                ]
            )
            
            CulturalContextHighlight(
                culturalNotes: [
                    "Markets are social centers, not just commercial spaces",
                    "Bargaining is expected and shows engagement"
                ]
            )
        }
        .padding()
    }
}