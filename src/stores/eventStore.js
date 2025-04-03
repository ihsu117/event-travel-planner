import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    currentEvent: {
      id: null,
      userId: '',
      organization: null,
      destinationCode: '',
      eventName: '',
      startDate: null,
      endDate: null,
      pictureLink: '',
      description: '',
      maxBudget: 0,
      currentBudget: 0,
      createdBy: null,
      financeMan: null,
      inviteLink: '',
      autoapprove: false,
      autoapprove_threshold: 0
    }
  }),

  actions: {
    setCurrentEvent(eventData) {
      this.currentEvent = {
        id: eventData.id,
        userId: eventData.userId,
        org: eventData.org,
        destinationCode: eventData.destinationCode,
        eventName: eventData.name,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        pictureLink: eventData.pictureLink,
        description: eventData.description,
        maxBudget: eventData.maxBudget,
        currentBudget: eventData.currentBudget,
        createdBy: eventData.createdBy,
        financeMan: eventData.financeMan,
        inviteLink: eventData.inviteLink,
        autoapprove: eventData.autoApprove,
        autoapprove_threshold: eventData.autoApproveThreshold
      }
      console.log(this.currentEvent)
      localStorage.setItem('currentEvent', JSON.stringify(this.currentEvent));
    },

    loadCurrentEvent() {
      const eventData = localStorage.getItem('currentEvent');
      if (eventData) {
        const parsedEventData = JSON.parse(eventData);
        parsedEventData.startDate = new Date(parsedEventData.startDate);
        parsedEventData.endDate = new Date(parsedEventData.endDate);
        this.currentEvent = JSON.parse(eventData);
      }
    },
    clearEvents() {
      this.currentEvent = {
        id: null,
        userId: '',
        organization: '',
        destinationCode: '',
        eventName: null,
        startDate: null,
        endDate: null,
        pictureLink: '',
        description: '',
        maxBudget: 0,
        currentBudget: 0,
        createdBy: null,
        financeMan: null,
        inviteLink: '',
        autoapprove: false,
        autoapprove_threshold: 0
      }
      localStorage.removeItem('currentEvent')
    }
  }
})