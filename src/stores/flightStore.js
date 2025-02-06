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
  })
})