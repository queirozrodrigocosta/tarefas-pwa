import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

export const trackEvent = (eventName, parameters = {}) => {
  try {
    logEvent(analytics, eventName, parameters)
    if (window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error)
  }
}

export const trackLogin = (method = 'email') => {
  trackEvent('login', { method })
}

export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', { method })
}

export const trackTaskAdded = () => {
  trackEvent('task_added', { 
    event_category: 'engagement',
    event_label: 'new_task'
  })
}

export const trackTaskCompleted = () => {
  trackEvent('task_completed', {
    event_category: 'engagement', 
    event_label: 'task_done'
  })
}

export const trackTaskDeleted = () => {
  trackEvent('task_deleted', {
    event_category: 'engagement',
    event_label: 'task_removed'
  })
}

export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  })
}