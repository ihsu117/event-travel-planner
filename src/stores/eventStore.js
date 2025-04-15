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
      autoapprove_threshold: 0,
      attendees: []
    }
  }),

  actions: {
    setCurrentEvent(eventData) {
      this.currentEvent = {
        id: eventData.id || eventData.event_id,
        userId: eventData.userId || eventData.user_id,
        org: eventData.org || eventData.organization,
        destinationCode: eventData.destinationCode || eventData.destination_code,
        eventName: eventData.name || eventData.eventName,
        startDate: new Date(eventData.startDate || eventData.start_date),
        endDate: new Date(eventData.endDate || eventData.end_date),
        pictureLink: eventData.pictureLink || eventData.picture_link,
        description: eventData.description,
        maxBudget: eventData.maxBudget || eventData.max_budget,
        currentBudget: eventData.currentBudget || eventData.current_budget,
        createdBy: eventData.createdBy || eventData.created_by,
        financeMan: eventData.financeMan || eventData.finance_man,
        inviteLink: eventData.inviteLink || eventData.invite_link,
        autoapprove: eventData.autoApprove || eventData.autoapprove,
        autoapprove_threshold: eventData.autoApproveThreshold || eventData.autoapprove_threshold,
        attendees: eventData.attendees || eventData.attendees || []
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
        autoapprove_threshold: 0,
        attendees: []
      }
      localStorage.removeItem('currentEvent')
    }
  }
})