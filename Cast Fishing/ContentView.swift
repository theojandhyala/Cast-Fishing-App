//
//  ContentView.swift
//  Cast Fishing
//
//  Created by Theo Jandhyala on 12/06/2026.
//

import SwiftUI

struct ContentView: View {
    @State private var selectedSpot = "Lake Point"
    @State private var lureWeight = 18.0
    @State private var isWindChecked = true
    @State private var isLineChecked = false
    @State private var isDragChecked = true

    private let spots = ["Lake Point", "River Bend", "Harbor Wall"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    header
                    spotPicker
                    conditionsGrid
                    castCard
                    prepChecklist
                    catchLog
                }
                .padding(20)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Cast Fishing")
        }
    }

    private var header: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [Color(red: 0.02, green: 0.22, blue: 0.28), Color(red: 0.08, green: 0.46, blue: 0.52)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: "water.waves")
                    .font(.system(size: 34, weight: .semibold))
                    .foregroundStyle(.white)

                Text("Ready for the next cast")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)

                Text("Track the spot, check the wind, tune your tackle, and log the catch before you head back in.")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.84))
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(24)
        }
        .frame(maxWidth: .infinity, minHeight: 220, alignment: .bottomLeading)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var spotPicker: some View {
        Picker("Spot", selection: $selectedSpot) {
            ForEach(spots, id: \.self) { spot in
                Text(spot)
            }
        }
        .pickerStyle(.segmented)
    }

    private var conditionsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            MetricTile(title: "Wind", value: "9 mph", symbol: "wind", tint: .cyan)
            MetricTile(title: "Water", value: "61°F", symbol: "thermometer.medium", tint: .orange)
            MetricTile(title: "Pressure", value: "1017 mb", symbol: "gauge.with.dots.needle.50percent", tint: .indigo)
            MetricTile(title: "Bite Window", value: "6:40 PM", symbol: "clock", tint: .green)
        }
    }

    private var castCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Label("Cast Setup", systemImage: "scope")
                .font(.headline)

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Lure Weight")
                    Spacer()
                    Text("\(Int(lureWeight)) g")
                        .fontWeight(.semibold)
                }

                Slider(value: $lureWeight, in: 5...40, step: 1)
            }

            HStack(spacing: 12) {
                RecommendationBadge(title: "Distance", value: castDistance)
                RecommendationBadge(title: "Retrieve", value: retrieveSpeed)
            }
        }
        .cardStyle()
    }

    private var prepChecklist: some View {
        VStack(alignment: .leading, spacing: 14) {
            Label("Pre-Cast Check", systemImage: "checklist")
                .font(.headline)

            Toggle("Wind at your back", isOn: $isWindChecked)
            Toggle("Line free of nicks", isOn: $isLineChecked)
            Toggle("Drag set", isOn: $isDragChecked)
        }
        .toggleStyle(.switch)
        .cardStyle()
    }

    private var catchLog: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Label("Catch Log", systemImage: "fish")
                    .font(.headline)
                Spacer()
                Button {
                } label: {
                    Image(systemName: "plus")
                        .font(.headline)
                }
                .buttonStyle(.borderedProminent)
                .clipShape(Circle())
            }

            HStack(spacing: 12) {
                Image(systemName: "mappin.and.ellipse")
                    .font(.title2)
                    .foregroundStyle(.teal)
                    .frame(width: 44, height: 44)
                    .background(Color.teal.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))

                VStack(alignment: .leading, spacing: 4) {
                    Text(selectedSpot)
                        .font(.subheadline.bold())
                    Text("No catch logged yet today")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
        }
        .cardStyle()
    }

    private var castDistance: String {
        lureWeight >= 24 ? "Long" : "Medium"
    }

    private var retrieveSpeed: String {
        lureWeight >= 22 ? "Slow" : "Steady"
    }
}

private struct MetricTile: View {
    let title: String
    let value: String
    let symbol: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: symbol)
                .font(.title3)
                .foregroundStyle(tint)
                .frame(width: 36, height: 36)
                .background(tint.opacity(0.14), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.title3.bold())
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
}

private struct RecommendationBadge: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.headline)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
    }
}

private extension View {
    func cardStyle() -> some View {
        padding(16)
            .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

#Preview {
    ContentView()
}
