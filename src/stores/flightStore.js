import { defineStore } from 'pinia'

export const useFlightStore = defineStore('flight', {
  state: () => ({
    currentFlight: {
      flightDate: null,
      origin: '',
      destination: '',
      flightDepTime: '',
      flightArrTime: '', 
      seatNumber: '',
      seatAvailable: 0,
      price: 0,
      flightType: '',
      flightClass: '',
      flightGate: '',
      airline: ''
    },
    flightResults: [] // Array to store multiple flight options
  }),

  actions: {
    setCurrentFlight(flightData) {
      this.currentFlight = {
        // Convert Duffel API response to match PFlight props
        flightDate: new Date(flightData.slices[0].departure_time),
        origin: flightData.slices[0].origin.iata_code,
        destination: flightData.slices[0].destination.iata_code,
        flightDepTime: new Date(flightData.slices[0].departure_time)
          .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        flightArrTime: new Date(flightData.slices[0].arrival_time)
          .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        seatNumber: flightData.passengers?.[0]?.seat_assignments?.[0]?.designator || '',
        seatAvailable: flightData.available_seats || 0,
        price: Math.round(flightData.total_amount),
        flightType: flightData.slices[0].connections.length === 0 ? 'Nonstop' : 'Connection',
        flightClass: flightData.cabin_class?.charAt(0).toUpperCase() + 
                    flightData.cabin_class?.slice(1) || 'Economy',
        flightGate: flightData.slices[0].departure_gate || '',
        airline: flightData.owner.name || ''
      }
    },

    // Store multiple flight results
    setFlightResults(flights) {
      this.flightResults = flights.map(flight => ({
        flightDate: new Date(flight.slices[0].departure_time),
        origin: flight.slices[0].origin.iata_code,
        destination: flight.slices[0].destination.iata_code,
        flightDepTime: new Date(flight.slices[0].departure_time)
          .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        flightArrTime: new Date(flight.slices[0].arrival_time)
          .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        seatNumber: flight.passengers?.[0]?.seat_assignments?.[0]?.designator || '',
        seatAvailable: flight.available_seats || 0,
        price: Math.round(flight.total_amount),
        flightType: flight.slices[0].connections.length === 0 ? 'Nonstop' : 'Connection',
        flightClass: flight.cabin_class?.charAt(0).toUpperCase() + 
                    flight.cabin_class?.slice(1) || 'Economy',
        flightGate: flight.slices[0].departure_gate || '',
        airline: flight.owner.name || ''
      }))
    },

    // Clear flight results
    clearFlights() {
      this.flightResults = []
      this.currentFlight = {
        flightDate: null,
        origin: '',
        destination: '',
        flightDepTime: '',
        flightArrTime: '',
        seatNumber: '',
        seatAvailable: 0,
        price: 0,
        flightType: '',
        flightClass: '',
        flightGate: '',
        airline: ''
      }
    }
  }
})