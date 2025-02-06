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
    flightResults: []
  }),

  actions: {
    setFlightResults(duffelFlights) {
      // this.flightResults = duffelFlights.map(flight => ({
      //   flightDate: new Date(flight.departure_date),
      //   origin: flight.origin_airport,
      //   destination: flight.destination_airport,
      //   flightDepTime: flight.departure_time,
      //   flightArrTime: flight.arrival_time,
      //   seatNumber: '', // Not provided by Duffel search
      //   seatAvailable: 1, // Default value
      //   price: Math.round(flight.price),
      //   flightType: 'Nonstop', // Can be determined by segments length
      //   flightClass: 'Economy', // Default from search params
      //   flightGate: flight.terminal || 'TBD',
      //   airline: flight.airline
      // }))

      duffelFlights.forEach(flight => {
        this.flightResults.push({
          flightDate: new Date(flight.departure_date),
        origin: flight.origin_airport,
        destination: flight.destination_airport,
        flightDepTime: flight.departure_time,
        flightArrTime: flight.arrival_time,
        seatNumber: '', // Not provided by Duffel search
        seatAvailable: 1, // Default value
        price: Math.round(flight.price),
        flightType: 'Nonstop', // Can be determined by segments length
        flightClass: 'Economy', // Default from search params
        flightGate: flight.terminal || 'TBD',
        airline: flight.airline
        })
      })
    },

    clearFlights() {    
        this.flightResults=[]
    }
}
})