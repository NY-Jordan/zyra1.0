import { Booking, ClientInfo, ReservationType, BookingState } from '../app/booking/[id]/types'

export type BookingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_RESERVATION_TYPE'; payload: ReservationType }
  | { type: 'SET_CURRENT_PERSON_INDEX'; payload: number }
  | { type: 'SET_MULTIPLE_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'DELETE_BOOKING'; payload: number }
  | { type: 'UPDATE_CURRENT_BOOKING'; payload: Partial<Booking> }
  | { type: 'SET_CLIENT_INFO'; payload: ClientInfo }
  | { type: 'UPDATE_CLIENT_INFO'; payload: { field: string; value: string } }
  | { type: 'RESET_CURRENT_PERSON_STATE' }

const initialState: BookingState = {
  currentStep: 1,
  reservationType: null,
  currentPersonIndex: 0,
  multipleBookings: [
    {
      personNumber: 1,
      service: null,
      supplements: [],
      hairdresser: null,
      date: null,
      time: null,
    },
  ],
  clientInfo: {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
  },
}

export const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }

    case 'SET_RESERVATION_TYPE':
      return { ...state, reservationType: action.payload }

    case 'SET_CURRENT_PERSON_INDEX':
      return { ...state, currentPersonIndex: action.payload }

    case 'SET_MULTIPLE_BOOKINGS':
      return { ...state, multipleBookings: action.payload }

    case 'ADD_BOOKING': {
      return {
        ...state,
        multipleBookings: [...state.multipleBookings, action.payload],
      }
    }

    case 'DELETE_BOOKING': {
      const newBookings = state.multipleBookings.filter((_, i) => i !== action.payload)
      const newPersonIndex = state.currentPersonIndex === action.payload 
        ? Math.max(0, action.payload - 1)
        : state.currentPersonIndex
      return {
        ...state,
        multipleBookings: newBookings,
        currentPersonIndex: newPersonIndex,
      }
    }

    case 'UPDATE_CURRENT_BOOKING': {
      const newBookings = [...state.multipleBookings]
      const currentBooking = newBookings[state.currentPersonIndex]
      if (currentBooking) {
        newBookings[state.currentPersonIndex] = {
          ...currentBooking,
          ...action.payload,
        }
      }
      return { ...state, multipleBookings: newBookings }
    }

    case 'SET_CLIENT_INFO':
      return { ...state, clientInfo: action.payload }

    case 'UPDATE_CLIENT_INFO':
      return {
        ...state,
        clientInfo: {
          ...state.clientInfo,
          [action.payload.field]: action.payload.value,
        },
      }

    case 'RESET_CURRENT_PERSON_STATE': {
      const newBookings = [...state.multipleBookings]
      const currentBooking = newBookings[state.currentPersonIndex]
      if (currentBooking) {
        newBookings[state.currentPersonIndex] = {
          personNumber: currentBooking.personNumber,
          service: null,
          supplements: [],
          hairdresser: null,
          date: null,
          time: null,
        }
      }
      return { ...state, multipleBookings: newBookings }
    }

    default:
      return state
  }
}

export { initialState }
