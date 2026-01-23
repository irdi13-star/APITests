export const BOOKING_ENDPOINTS = {
    BASE: '/booking',
    BY_ID: (id: number | string) => `/booking/${id}`,
    SEARCH: '/booking'
} as const;