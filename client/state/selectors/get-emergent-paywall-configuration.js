/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns paywall iframe configuration
 *
 * @param  {Object}  state       Global state tree
 * @return {Object|null}         emergent paywall iframe configuration
 */
export default function getEmergentPaywallConfiguration( state ) {
	return get( state.transactions, 'emergentPaywallConfiguration', null );
}
