/** @format */

/**
 * Internal dependencies
 */
import { TRANSACTION_EMERGENT_PAYWALL_CONFIG_ADD } from 'state/action-types';

export default function( state = null, action ) {
	switch ( action.type ) {
		case TRANSACTION_EMERGENT_PAYWALL_CONFIG_ADD:
			return action.data;
		default:
			return state;
	}
}

