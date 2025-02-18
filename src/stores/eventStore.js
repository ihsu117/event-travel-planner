import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    currentEvent: {
      id: null,
      organization: '',
      name: '',
      startDate: null,
      endDate: null,
      pictureLink: '',
      description: '',
      maxBudget: 0,
      currentBudget: 0,
      createdBy: null,
      financeMan: null,
      inviteLink: ''
    }
  }),

  actions: {
    setCurrentEvent(eventData) {
      this.currentEvent = {
        id: eventData.id,
        organization: eventData.organization,
        name: eventData.name,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        pictureLink: eventData.pictureLink,
        description: eventData.description,
        maxBudget: eventData.maxBudget,
        currentBudget: eventData.currentBudget,
        createdBy: eventData.createdBy,
        financeMan: eventData.financeMan,
        inviteLink: eventData.inviteLink
      }
    }
  }
})