/** @format */

/**
 * Internal dependencies
 */
import {
	TRANSACTION_EMERGENT_PAYWALL_CONFIG_ADD,
	TRANSACTION_EMERGENT_PAYWALL_CONFIG_REQUEST,
} from 'state/action-types';

/**
 * Action creator function: TRANSACTION_EMERGENT_PAYWALL_CONFIG_ADD
 *
 * @param {Object} data - paywall iframe configuration
 * @return {Object} action object
 */
export const receiveEmergentPaywallConfiguration = data => ( {
	type: TRANSACTION_EMERGENT_PAYWALL_CONFIG_ADD,
	data,
} );

/**
 * Action creator to request emergent paywall iframe configuration: TRANSACTION_EMERGENT_PAYWALL_CONFIG_REQUEST
 *
 * @param {String} countryCode - a country code
 * @param {Object} cart - cart store object
 * @return {Object} action object
 */
export const requestEmergentPaywallConfiguration = ( countryCode, cart ) => ( {
	type: TRANSACTION_EMERGENT_PAYWALL_CONFIG_REQUEST,
	countryCode,
	cart,
} );
