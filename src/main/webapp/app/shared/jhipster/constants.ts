/** HTTP response header carrying success alert translation keys from the backend. */
export const MESSAGE_ALERT_HEADER_NAME = 'x-jhipstersampleapplicationapp-alert';
/** HTTP response header carrying error translation keys from the backend. */
export const MESSAGE_ERROR_HEADER_NAME = 'x-jhipstersampleapplicationapp-error';
/** HTTP response header carrying entity name or ID parameters for alert interpolation. */
export const MESSAGE_PARAM_HEADER_NAME = 'x-jhipstersampleapplicationapp-params';

/** Spring Security authority constants mirrored for client-side role checks. */
export enum Authority {
  ADMIN = 'ROLE_ADMIN',
  USER = 'ROLE_USER',
}
