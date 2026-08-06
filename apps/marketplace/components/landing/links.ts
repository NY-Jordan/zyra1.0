export const SALON_APP_URL = process.env.NEXT_PUBLIC_SALON_URL || 'http://localhost:3001'
export const SALON_LOGIN_URL = `${SALON_APP_URL}/auth/login`

// There's no self-serve signup in the salon app yet — every "try for free" CTA
// leads to the contact form on this page instead of a registration page.
export const CONTACT_ANCHOR = '#contact'
