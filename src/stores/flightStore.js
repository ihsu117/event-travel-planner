import { defineStore } from 'pinia'

export const useFlightStore = defineStore('flight', {
    state: () => ({
        currentFlight: {
            flightID: null,
            flightDate: null,
            origin: '',
            passID: '',
            flightNumber: '',
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
            offer_id: '',
            itinerary: [],
            search_key: ''
        },
        flightResults: [],
        itineraries: []
    }),

    actions: {
        setCurrentFlight(flight) {
            this.currentFlight = {
                flightID: null,
                flightDate: flight.flightDate,
                flightNumber: flight.flightNumber,
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
                offer_id: flight.offer_id,
                itinerary: flight.itinerary,
                search_key: flight.search_key
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
                
                this.flightResults = flightData.slice(0).map(flight => {
                    const [year, month, day] = flight.details[0].itinerary[0].departure_date.split('-');
                    const aflightDate = new Date(year, month - 1, day);
                    console.log('!!!Flight date:', aflightDate); 
                
                    return {
                        flightID: null,
                        flightDate: aflightDate,
                        flightNumber: flight.details[0].itinerary[0].flight_num,
                        origin: flight.origin_airport,
                        destination: flight.destination_airport,
                        flightDepTime: flight.details[0].itinerary[0].departure_time,
                        flightArrTime: flight.details[0].itinerary[flight.details[0].itinerary.length - 1].arrival_time,
                        seatNumber: '' || 'TBD',
                        seatAvailable: 1,
                        passID: flight.passenger_id,
                        price: Math.round(flight.price),
                        flightType: flight.flight_type,
                        flightClass: flight.flight_class,
                        flightGate: flight.details[0].itinerary[0].terminal || 'TBD',
                        airline: flight.airline,
                        logoURL: flight.logo,
                        offer_id: flight.offer_id,
                        itinerary: flight.details,
                        search_key: flight.search_key
                    };
                });
                

                console.log('Processed flights:', this.flightResults);
            } catch (error) {
                console.error('Error processing flight data:', error);
                this.flightResults = [];
            }
        },

        async setEventFlightResults(eventFlights) {
            try {
                const flightData = eventFlights instanceof Promise ? await eventFlights : eventFlights;

                console.log('Flight data type:', typeof flightData);
                console.log('Flight data:', flightData);

                if (!Array.isArray(flightData)) {
                    console.error('Expected array of flights, got:', typeof flightData);
                    return;
                }

                this.flightResults = flightData.map(flight => ({
                    flightID: flight.flight_id,
                    flightDate: new Date(flight.depart_time),
                    flightNumber: flight.flight_num,
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

                console.log('Processed flights:', this.flightResults);
            } catch (error) {
                console.error('Error processing flight data:', error);
                this.flightResults = [];
            }
        },

        clearFlights() {
            this.flightResults = []
        },

        setReturningFlightResults(flightData) {
            try {
                console.log('Flight data type:', typeof flightData);
                console.log('Flight data:', flightData);

                // Ensure we have an array to work with
                // if (!Array.isArray(flightData)) {
                //     console.error('Expected array of flights, got:', typeof flightData);
                //     return;
                // }
                
                this.flightResults = flightData.slice(0).map(flight => {
                    const [year, month, day] = flight.flightDate.split('-');
                    const aflightDate = new Date(year, month - 1, day);
                
                    return {
                        flightID: null,
                        flightDate: aflightDate,
                        flightNumber: flight.flightNumber,
                        origin: flight.origin,
                        destination: flight.destination,
                        flightDepTime: flight.flightDepTime,
                        flightArrTime: flight.flightArrTime,
                        seatNumber: '' || 'TBD',
                        seatAvailable: 1,
                        passID: flight.passID,
                        price: Math.round(flight.price),
                        flightType: flight.flight_type,
                        flightClass: flight.flightClass,
                        flightGate:'TBD', // Not working
                        airline: flight.airline,
                        logoURL: flight.logoURL,
                        offer_id: flight.offer_id,
                        itinerary: flight.itinerary,
                        search_key: flight.search_key
                    };
                });
                

                console.log('Processed flights:', this.flightResults);
            } catch (error) {
                console.error('Error processing flight data:', error);
                this.flightResults = [];
            }
        },

        setItinerary(itineraryData) {
            try {
            if (!Array.isArray(itineraryData)) {
                console.error('Expected array of itinerary data, got:', typeof itineraryData);
                return;
            }

            this.itineraries = [...this.itineraries, ...itineraryData];
            console.log('Updated itineraries:', this.itineraries);
            } catch (error) {
            console.error('Error setting itinerary data:', error);
            }
        },

        clearItinerary() {
            this.itineraries = []
        }
    },

})