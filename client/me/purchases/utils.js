/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import { addCardDetails, editCardDetails, purchasesRoot } from './paths';
import {
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
} from 'lib/purchases';
import { isDomainTransfer } from 'lib/products-values';

// TODO: Remove these property-masking functions in favor of accessing the props directly
function getPurchase( props ) {
	return props.selectedPurchase;
}

function goToList() {
	page( purchasesRoot );
}

function isDataLoading( props ) {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

function recordPageView( trackingSlug, props, nextProps = null ) {
	if ( isDataLoading( nextProps || props ) ) {
		return null;
	}

	if (
		nextProps &&
		( props.hasLoadedUserPurchasesFromServer || ! nextProps.hasLoadedUserPurchasesFromServer )
	) {
		// only record the page view the first time the purchase loads from the server
		return null;
	}

	const purchase = getPurchase( nextProps || props );

	if ( ! purchase ) {
		return null;
	}

	const { productSlug } = purchase;

	analytics.tracks.recordEvent( `calypso_${ trackingSlug }_purchase_view`, {
		product_slug: productSlug,
	} );
}

function canEditPaymentDetails( purchase ) {
	if ( ! config.isEnabled( 'upgrades/credit-cards' ) ) {
		return false;
	}
	return (
		! isExpired( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		! isDomainTransfer( purchase )
	);
}

function getEditCardDetailsPath( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const { payment: { creditCard } } = purchase;

		return editCardDetails( siteSlug, purchase.id, creditCard.id );
	}
	return addCardDetails( siteSlug, purchase.id );
}

export {
	getPurchase,
	goToList,
	isDataLoading,
	recordPageView,
	canEditPaymentDetails,
	getEditCardDetailsPath,
};
