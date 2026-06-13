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
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 22) {
                    topStatus
                    spotPicker
                    recommendationPanel
                    conditionStrip
                    setupPanel
                    checklistPanel
                    catchLogPanel
                }
                .padding(.horizontal, 18)
                .padding(.top, 12)
                .padding(.bottom, 28)
            }
            .background(appBackground)
            .navigationTitle("Cast Fishing")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var appBackground: some View {
        LinearGradient(
            colors: [Color(red: 0.94, green: 0.97, blue: 0.96), Color(red: 0.88, green: 0.93, blue: 0.92)],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }

    private var topStatus: some View {
        HStack(alignment: .center, spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color.teal.opacity(0.14))
                Image(systemName: "water.waves")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(.teal)
            }
            .frame(width: 54, height: 54)

            VStack(alignment: .leading, spacing: 4) {
                Text("Evening bite window")
                    .font(.headline)
                Text("6:40 PM · light wind · clear water")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.82)
            }

            Spacer(minLength: 0)
        }
    }

    private var spotPicker: some View {
        Picker("Spot", selection: $selectedSpot) {
            ForEach(spots, id: \.self) { spot in
                Text(spot)
            }
        }
        .pickerStyle(.segmented)
    }

    private var recommendationPanel: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(selectedSpot)
                        .font(.title2.bold())
                    Text("Cast toward the shaded edge and retrieve steadily.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.78))
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()

                Image(systemName: "scope")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(width: 38, height: 38)
                    .background(.white.opacity(0.16), in: Circle())
            }

            HStack(spacing: 10) {
                StatPill(title: "Distance", value: castDistance)
                StatPill(title: "Retrieve", value: retrieveSpeed)
                StatPill(title: "Depth", value: "4 ft")
            }
        }
        .foregroundStyle(.white)
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Color(red: 0.02, green: 0.29, blue: 0.33), Color(red: 0.08, green: 0.48, blue: 0.48)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 8, style: .continuous)
        )
    }

    private var conditionStrip: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Conditions", symbol: "cloud.sun")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ConditionChip(title: "Wind", value: "9 mph", symbol: "wind", tint: .cyan)
                    ConditionChip(title: "Water", value: "61°F", symbol: "thermometer.medium", tint: .orange)
                    ConditionChip(title: "Pressure", value: "1017 mb", symbol: "gauge.with.dots.needle.50percent", tint: .indigo)
                    ConditionChip(title: "Moon", value: "Waxing", symbol: "moon", tint: .purple)
                }
                .padding(.vertical, 2)
            }
        }
    }

    private var setupPanel: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Cast Setup", symbol: "slider.horizontal.3")

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Lure weight")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("\(Int(lureWeight)) g")
                        .font(.headline)
                }

                Slider(value: $lureWeight, in: 5...40, step: 1)
                    .tint(.teal)
            }
        }
        .panelStyle()
    }

    private var checklistPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Pre-Cast Check", symbol: "checklist")
            CheckRow(title: "Wind at your back", isOn: $isWindChecked)
            CheckRow(title: "Line free of nicks", isOn: $isLineChecked)
            CheckRow(title: "Drag set", isOn: $isDragChecked)
        }
        .panelStyle()
    }

    private var catchLogPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SectionHeader(title: "Catch Log", symbol: "fish")
                Spacer()
                Button {
                } label: {
                    Image(systemName: "plus")
                        .font(.subheadline.weight(.bold))
                        .frame(width: 32, height: 32)
                }
                .buttonStyle(.borderedProminent)
                .buttonBorderShape(.circle)
                .tint(.teal)
            }

            HStack(spacing: 12) {
                Image(systemName: "mappin.and.ellipse")
                    .font(.headline)
                    .foregroundStyle(.teal)
                    .frame(width: 38, height: 38)
                    .background(Color.teal.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))

                VStack(alignment: .leading, spacing: 3) {
                    Text(selectedSpot)
                        .font(.subheadline.bold())
                    Text("No catch logged today")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
        }
        .panelStyle()
    }

    private var castDistance: String {
        lureWeight >= 24 ? "Long" : "Medium"
    }

    private var retrieveSpeed: String {
        lureWeight >= 22 ? "Slow" : "Steady"
    }
}

private struct SectionHeader: View {
    let title: String
    let symbol: String

    var body: some View {
        Label(title, systemImage: symbol)
            .font(.headline)
            .foregroundStyle(.primary)
    }
}

private struct StatPill: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
            Text(value)
                .font(.subheadline.bold())
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 10)
        .padding(.vertical, 9)
        .background(.white.opacity(0.14), in: RoundedRectangle(cornerRadius: 8))
    }
}

private struct ConditionChip: View {
    let title: String
    let value: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: symbol)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(tint)
                .frame(width: 30, height: 30)
                .background(tint.opacity(0.14), in: Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.subheadline.bold())
                    .lineLimit(1)
                Text(title)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(minWidth: 122, alignment: .leading)
        .background(Color(.systemBackground).opacity(0.92), in: RoundedRectangle(cornerRadius: 8))
    }
}

private struct CheckRow: View {
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        Toggle(isOn: $isOn) {
            Text(title)
                .font(.subheadline)
        }
        .toggleStyle(.switch)
        .tint(.teal)
    }
}

private extension View {
    func panelStyle() -> some View {
        padding(16)
            .background(Color(.systemBackground).opacity(0.96), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

#Preview {
    ContentView()
}
