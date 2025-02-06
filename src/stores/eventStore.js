import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    currentEvent: {
      organization: '',
      eventName: '',
      startDate: null,
      endDate: null,
      bgImage: '',
    }
  }),
    
  actions: {
    setCurrentEvent(eventData) {
      this.currentEvent = {
        organization: eventData.organization,
        eventName: eventData.event,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        bgImage: eventData.bgImage
      }
    }
  }
  }
)