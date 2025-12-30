// Settings Panels Exports
// Each panel handles configuration for a specific workflow step
// To add a new step: create a new XxxSettings.jsx and export it here

export { ApprovalSettings } from './ApprovalSettings';
export { DeliverySettings } from './DeliverySettings';
export { SigningOrderSettings } from './SigningOrderSettings';
export { ReminderSettings } from './ReminderSettings';
export { ExpirationSettings } from './ExpirationSettings';
export { RevokeSettings } from './RevokeSettings';

// Map of node IDs to their settings panel components
// To add a new step: add entry here with nodeId -> Component
import { ApprovalSettings } from './ApprovalSettings';
import { DeliverySettings } from './DeliverySettings';
import { SigningOrderSettings } from './SigningOrderSettings';
import { ReminderSettings } from './ReminderSettings';
import { ExpirationSettings } from './ExpirationSettings';
import { RevokeSettings } from './RevokeSettings';

export const SETTINGS_PANELS = {
  approval: ApprovalSettings,
  delivery: DeliverySettings,
  signingOrder: SigningOrderSettings,
  reminder: ReminderSettings,
  expiration: ExpirationSettings,
  revoke: RevokeSettings,
};
