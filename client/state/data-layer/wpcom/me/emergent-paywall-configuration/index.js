/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { TRANSACTION_EMERGENT_PAYWALL_CONFIG_REQUEST } from 'state/action-types';
import { receiveEmergentPaywallConfiguration } from 'state/transactions/emergent-paywall-configuration/actions';

/**
 * @module state/data-layer/wpcom/me/emergent-paywall-configuration
 */

/**
 * Dispatches a request to fetch paywall iframe configuration
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const requestEmergentPaywallConfiguration = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/emergent-paywall-configuration',
			body: {
				country: action.countryCode,
				cart: action.cart,
			},
		},
		action
	);

export default {
	[ TRANSACTION_EMERGENT_PAYWALL_CONFIG_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestEmergentPaywallConfiguration,
			onSuccess: ( action, data ) => receiveEmergentPaywallConfiguration( data ),
			onError: noop,
		} ),
	],
};
