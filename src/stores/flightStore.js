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
            airline: '',
            logoURL: '',
            offer_id: ''
        },
        flightResults: []
    }),

    actions: {
        setCurrentFlight(flight) {
            this.currentFlight = {
                flightDate: new Date(flight.flightDate),
                origin: flight.origin,
                destination: flight.destination,
                flightDepTime: flight.flightDepTime,
                flightArrTime: flight.flightArrTime,
                seatNumber: flight.seatNumber,
                seatAvailable: flight.seatAvailable,
                price: flight.price,
                flightType: flight.flightType,
                flightClass: flight.flightClass,
                flightGate: flight.flightGate,
                airline: flight.airline,
                logoURL: flight.logoURL,
                offer_id: flight.offer_id
            };
            console.log('Current flight:', this.currentFlight);
        },

        async setFlightResults(duffelFlights) {
            try {
                // Handle if duffelFlights is a Promise
                const flightData = duffelFlights instanceof Promise ? await duffelFlights : duffelFlights;

                console.log('Flight data type:', typeof flightData);
                console.log('Flight data:', flightData);

                // Ensure we have an array to work with
                if (!Array.isArray(flightData)) {
                    console.error('Expected array of flights, got:', typeof flightData);
                    return;
                }

                this.flightResults = flightData.map(flight => ({
                    flightDate: new Date(flight.departure_date),
                    origin: flight.origin_airport,
                    destination: flight.destination_airport,
                    flightDepTime: flight.departure_time,
                    flightArrTime: flight.arrival_time,
                    seatNumber: '' || 'TBD',
                    seatAvailable: 1,
                    price: Math.round(flight.price),
                    flightType: 'Nonstop',
                    flightClass: 'Economy',
                    flightGate: flight.terminal || 'TBD',
                    airline: flight.airline,
                    logoURL: flight.logo,
                    offer_id: flight.offer_id
                }));

                console.log('Processed flights:', this.flightResults);
            } catch (error) {
                console.error('Error processing flight data:', error);
                this.flightResults = [];
            }
        },

        clearFlights() {
            this.flightResults = []
        }
    },

})