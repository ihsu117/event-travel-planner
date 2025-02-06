import { defineStore } from 'pinia'

export const useFlightStore = defineStore('flight', {
  state: () => ({
    flightResults: []
  }),

  actions: {
    getFlights(flightData) {
      this.flightResults = flightData;
    }
  }
})