import { useReducer, useCallback } from 'react'
import { bookingReducer, initialState, BookingAction } from './useBookingReducer'
import { Booking } from '../app/booking/[id]/types'

export const useBookingReducerHook = () => {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  // Action creators
  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step })
  }, [])

  const setReservationType = useCallback((type: 'single' | 'multiple' | null) => {
    dispatch({ type: 'SET_RESERVATION_TYPE', payload: type })
  }, [])

  const setCurrentPersonIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_PERSON_INDEX', payload: index })
  }, [])

  const setMultipleBookings = useCallback((bookings: Booking[]) => {
    dispatch({ type: 'SET_MULTIPLE_BOOKINGS', payload: bookings })
  }, [])

  const addBooking = useCallback((booking: Booking) => {
    dispatch({ type: 'ADD_BOOKING', payload: booking })
  }, [])

  const deleteBooking = useCallback((index: number) => {
    dispatch({ type: 'DELETE_BOOKING', payload: index })
  }, [])

  const updateCurrentBooking = useCallback((updates: Partial<Booking>) => {
    dispatch({ type: 'UPDATE_CURRENT_BOOKING', payload: updates })
  }, [])

  const updateClientInfo = useCallback((field: string, value: string) => {
    dispatch({ type: 'UPDATE_CLIENT_INFO', payload: { field, value } })
  }, [])

  const resetCurrentPersonState = useCallback(() => {
    dispatch({ type: 'RESET_CURRENT_PERSON_STATE' })
  }, [])

  return {
    state,
    dispatch,
    // Single state setters
    setCurrentStep,
    setReservationType,
    setCurrentPersonIndex,
    // Multiple state setters
    setMultipleBookings,
    addBooking,
    deleteBooking,
    updateCurrentBooking,
    // Client info setters
    updateClientInfo,
    // Reset functions
    resetCurrentPersonState,
  }
}
