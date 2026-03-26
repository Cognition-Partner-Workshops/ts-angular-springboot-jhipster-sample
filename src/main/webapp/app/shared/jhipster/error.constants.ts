/** Base URI for JHipster-specific RFC 7807 problem types. */
export const PROBLEM_BASE_URL = 'https://www.jhipster.tech/problem';
/** Problem type returned when a registration email is already taken. */
export const EMAIL_ALREADY_USED_TYPE = `${PROBLEM_BASE_URL}/email-already-used`;
/** Problem type returned when a registration login is already taken. */
export const LOGIN_ALREADY_USED_TYPE = `${PROBLEM_BASE_URL}/login-already-used`;
/** Problem type returned when the submitted password fails server-side validation. */
export const INVALID_PASSWORD_TYPE = `${PROBLEM_BASE_URL}/invalid-password`;
