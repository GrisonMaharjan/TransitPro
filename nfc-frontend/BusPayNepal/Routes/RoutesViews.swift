import MapKit
import SwiftUI

struct RoutesView: View {
    @EnvironmentObject private var routesVM: RoutesViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                TextField("Search route, number, or stop", text: $routesVM.searchText)
                    .padding()
                    .background(.background, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(.separator.opacity(0.4)))

                ForEach(routesVM.filteredRoutes) { route in
                    NavigationLink {
                        RouteDetailsView(route: route)
                    } label: {
                        RouteCard(route: route)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(20)
            .padding(.bottom, 96)
        }
        .task { await routesVM.load() }
        .navigationTitle("Routes")
        .background(SmartFareColor.appBackground.ignoresSafeArea())
    }
}

struct RouteDetailsView: View {
    var route: BusRoute
    @State private var camera = MapCameraPosition.region(MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 27.7172, longitude: 85.3240),
        span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)
    ))

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Map(position: $camera) {
                    Marker(route.origin, coordinate: CLLocationCoordinate2D(latitude: 27.708, longitude: 85.315))
                    Marker(route.destination, coordinate: CLLocationCoordinate2D(latitude: 27.721, longitude: 85.361))
                }
                .frame(height: 220)
                .clipShape(RoundedRectangle(cornerRadius: 20))

                RouteCard(route: route)

                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader(title: "Stops")
                    ForEach(Array(route.stops.enumerated()), id: \.offset) { index, stop in
                        HStack {
                            Text("\(index + 1)")
                                .font(.caption.weight(.bold))
                                .frame(width: 28, height: 28)
                                .background(SmartFareColor.primaryBlue.opacity(0.12), in: Circle())
                            Text(stop)
                            Spacer()
                        }
                    }
                }
                .smartCard()

                VStack(alignment: .leading, spacing: 10) {
                    SectionHeader(title: "Live Bus Locations")
                    Label("3 buses moving near \(route.origin)", systemImage: "location.fill")
                    Label("Estimated travel time: \(route.estimatedDuration)", systemImage: "clock.fill")
                    Label("Fare: \(SmartFareFormatter.rupees(route.fare))", systemImage: "creditcard.fill")
                }
                .smartCard()
            }
            .padding(20)
        }
        .navigationTitle(route.number)
        .background(SmartFareColor.appBackground.ignoresSafeArea())
    }
}

