/** @format */

/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getBillingTransactionsByType } from 'state/selectors';

describe( 'getBillingTransactionsByType()', () => {
	const state = {
		billingTransactions: {
			items: {
				past: [
					{
						id: '12345678',
						amount: '$1.23',
						date: '2016-12-12T11:22:33+0000',
					},
				],
				upcoming: [
					{
						id: '87654321',
						amount: '$4.56',
						date: '2016-10-12T11:22:33+0000',
					},
				],
			},
		},
	};

	test( 'should return the past billing transactions', () => {
		const output = getBillingTransactionsByType( state, 'past' );
		expect( output ).toEqual( [
			{
				id: '12345678',
				amount: '$1.23',
				date: moment( '2016-12-12T11:22:33+0000' ).toDate(),
			},
		] );
	} );

	test( 'should return the upcoming billing transactions', () => {
		const output = getBillingTransactionsByType( state, 'upcoming' );
		expect( output ).toEqual( [
			{
				id: '87654321',
				amount: '$4.56',
				date: moment( '2016-10-12T11:22:33+0000' ).toDate(),
			},
		] );
	} );

	test( 'should return null if billing transactions have not been fetched yet', () => {
		const output = getBillingTransactionsByType(
			{
				billingTransactions: {
					items: {},
				},
			},
			'past'
		);
		expect( output ).toBe( null );
	} );
} );
