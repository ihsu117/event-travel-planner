import { defineStore } from 'pinia'
import { logger } from '../../backend/service/LogService.mjs';

// Init child logger instance
const log = logger.child({
    dataAccess : "flightStore", //specify module where logs are from
});

export const useFlightStore = defineStore('flight', {
    state: () => ({
        currentFlight: {
            flightID: null,
            flightDate: null,
            origin: '',
            passID: '',
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
                flightID: null,
                flightDate: new Date(flight.flightDate),
                origin: flight.origin,
                passID: flight.passID,
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
            console.log('Current flight:', this.currentFlight);  //Debug
            log.verbose("Current flight set", {currentFlight: this.currentFlight});
        },

        async setFlightResults(duffelFlights) {
            try {
                // Handle if duffelFlights is a Promise
                const flightData = duffelFlights instanceof Promise ? await duffelFlights : duffelFlights;

                console.log('Flight data type:', typeof flightData); //Debug
                console.log('Flight data:', {flightData: flightData}); //Debug
                log.verbose('Flight results data set:', {flightData: flightData, flightDataType: typeof flightData});


                // Ensure we have an array to work with
                if (!Array.isArray(flightData)) {
                    log.error(new Error('Expected array of flights, got:', typeof flightData));
                    return;
                }

                this.flightResults = flightData.slice(1).map(flight => ({
                    flightID: null,
                    flightDate: new Date(flight.itinerary[0].departure_date),
                    origin: flight.origin_airport,
                    destination: flight.destination_airport,
                    flightDepTime: flight.itinerary[0].departure_time,
                    flightArrTime: flight.itinerary[flight.itinerary.length - 1].arrival_time,
                    seatNumber: '' || 'TBD',
                    seatAvailable: 1,
                    passID: flight.passenger_ids,
                    price: Math.round(flight.price),
                    flightType: flight.flight_type,
                    flightClass: flight.flight_class,
                    flightGate: flight.itinerary[0].terminal || 'TBD',
                    airline: flight.airline,
                    logoURL: flight.logo,
                    offer_id: flight.offer_id
                }));

                console.log('Processed flights:', this.flightResults); //Debug
                log.verbose('Processed flights:', {flightResults: this.flightResults});
            } catch (error) {
                log.error('Error processing flight data:', error);
                this.flightResults = [];
            }
        },

        async setEventFlightResults(eventFlights) {
            try {
                const flightData = eventFlights instanceof Promise ? await eventFlights : eventFlights;

                console.log('Flight data type:', typeof flightData); //Debug
                console.log('Flight data:', flightData); //Debug

                if (!Array.isArray(flightData)) {
                    log.error(new Error('Expected array of flights, got:', typeof flightData));
                    return;
                }

                this.flightResults = flightData.map(flight => ({
                    flightID: flight.flight_id,
                    flightDate: new Date(flight.depart_time),
                    origin: flight.depart_loc,
                    destination: flight.arrive_loc,
                    flightDepTime: flight.depart_time,
                    flightArrTime: flight.arrive_time,
                    seatNumber: '' || 'TBD',
                    seatAvailable: 1,
                    passID: flight.attendee_id,
                    price: Math.round(flight.price),
                    flightType: flight.flightType || '',
                    flightClass: flight.flightClass || '',
                    flightGate: flight.flightGate || 'TBD',
                    airline: flight.airline || '',
                    logoURL: flight.logoURL || '',
                    offer_id: flight.offer_id
                }));

                console.log('Processed flights:', this.flightResults); //Debug
                log.verbose('Processed flights:', {flightResults: this.flightResults});
            } catch (error) {
                log.error('Error processing flight data:', error);
                this.flightResults = [];
            }
        },

        clearFlights() {
            this.flightResults = []
        }
    },

})