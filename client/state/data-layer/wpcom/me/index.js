/*
 * @format
 */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import block from './block';
import connectedApplications from './connected-applications';
import devices from './devices';
import emergentPaywallConfiguration from './emergent-paywall-configuration';
import notification from './notification';
import settings from './settings';
import sendVerificationEmail from './send-verification-email';
import countries from './transactions/supported-countries';
import order from './transactions/order';
import twoStep from './two-step';

export default mergeHandlers(
	block,
	connectedApplications,
	countries,
	devices,
	emergentPaywallConfiguration,
	notification,
	settings,
	sendVerificationEmail,
	twoStep,
	order
);
