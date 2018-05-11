/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import classNames from 'classnames';
import { get, isEqual, debounce, startsWith } from 'lodash';
import { connect } from 'react-redux';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import notices from 'notices';
import analytics from 'lib/analytics';
import { paymentMethodName, paymentMethodClassName } from 'lib/cart-values';
import TermsOfService from './terms-of-service';
import { getEmergentPaywallConfiguration } from 'state/selectors';
import { requestEmergentPaywallConfiguration } from 'state/transactions/emergent-paywall-configuration/actions';

import wp from 'lib/wp';

const wpcom = wp.undocumented();
const log = debug( 'calypso:checkout:payment:emergent-payall' );

export class EmergentPaywallBox extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
	};

	constructor() {
		super();
		this.state = this.getInitialState();
		this.iframeRef = React.createRef();
		this.formRef = React.createRef();
		this.fetchIframeConfiguration = debounce( this.fetchIframeConfiguration, 500 );
	}

	componentWillMount() {
		window.addEventListener( 'message', this.onMessageReceiveHandler, false );
		if ( this.props.iframeConfig ) {
			this.loadIframe();
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessageReceiveHandler );
	}

	componentDidUpdate( prevProps ) {
		// If our iframe config has been update we must refresh the iframe
		if (
			this.props.iframeConfig &&
			prevProps.iframeConfig &&
			! isEqual( prevProps.iframeConfig.charge_id, this.props.iframeConfig.charge_id )
		) {
			this.loadIframe();
		}
		// Check if our cart is updated
		// TODO: @ramonjd Fix this before merge.
		// This is crude, since the sum of different products MAY have the same cost
		if ( ! isEqual( prevProps.cart.total_cost, this.props.cart.total_cost ) ) {
			this.props.requestEmergentPaywallConfiguration( 'IN', this.props.cart );
		}
	}

	getInitialState() {
		return {
			// iframe values from wpcom
			// paywall_url: '',
			// payload: '',
			// charge_id: '',
			// signature: '',

			paymentMethod: paymentMethodClassName( 'emergent-paywall' ),
			iframeHeight: 600,
			iframeWidth: 750,
			hasConfigLoaded: false,
			redirectTo: '',
			pendingOrder: false,
		};
	}

	onMessageReceiveHandler = event => {
		if ( event && startsWith( this.state.paywall_url, event.origin ) ) {
			const message = get( JSON.parse( event.data ), 'message', {} );
			log( 'Received event from Emergent Paywall:', message );

			switch ( message.name ) {
				case 'WINDOW_SIZE':
					this.setState( {
						iframeHeight: message.payload.size.height,
						iframeWidth: message.payload.size.width,
					} );
					break;
				case 'PURCHASE_STATUS':
					if ( 'submitted' in message ) {
						log( 'Setting state.pendingOrder to the prepareOrder promise' );
						this.setState( { pendingOrder: this.prepareOrder() } );
					} else if ( 'success' in message ) {
						if ( message.success ) {
							this.handlePaywallSuccess();
						} else {
							// TODO: handle failure.
						}
					} else if ( 'close' in message ) {
						//paywall window closed
					}
					break;
				default:
					break;
			}
		}
	};

	handlePaywallSuccess() {
		this.state.pendingOrder
			.then( result => {
				if ( result.order_id ) {
					log( 'Order created. Order ID is: ' + result.order_id );

					const siteSlug = this.props.selectedSite ? this.props.selectedSite.slug : 'no-site';
					const successPath = `/checkout/thank-you/${ siteSlug }/pending/${ result.order_id }`;

					analytics.tracks.recordEvent( 'calypso_checkout_form_submit', {
						payment_method: this.state.paymentMethod,
					} );
					page.redirect( successPath );
				}
			} )
			.catch( error => {
				log(
					'Error creating order: ',
					error,
					error.message || translate( "We've encountered a problem. Please try again later." )
				);
				// TODO: This shouldn't happen, but if it does, what can we do?
			} );
	}

	prepareOrder() {
		const dataForApi = {
			payment: {
				paymentMethod: this.state.paymentMethod,
				paymentKey: this.state.charge_id,
			},
			cart: this.props.cart,
			domainDetails: this.props.transaction.domainDetails,
		};

		log( 'Preparing Order' );

		// get the order ID from rest endpoint
		return wpcom.transactions( 'POST', dataForApi );
	}

	fetchIframeConfiguration = () => {
		notices.clearNotices( 'notices' );
		wpcom.emergentPaywellConfiguration( 'IN', this.props.cart, this.loadIframe );
	};

	loadIframe = () => {
		/*		Move the error notice to the data layer http call
		if ( error ) {
			notices.error( this.props.translate( "There's been an error. Please try again later." ) );
			return;
		}*/
		this.setState(
			{
				hasConfigLoaded: true,
			},
			() => this.formRef.current.submit()
		);
	};

	renderLoadingBlock() {
		return (
			<div className="checkout__emergent-paywall-loading loading-placeholder">
				<div className="checkout__emergent-paywall-loading-content loading-placeholder__content" />
			</div>
		);
	}

	onSubmitFormHandler( event ) {
		event.preventDefault();
	}

	render() {
		const { iframeHeight } = this.state;
		const { payload, paywall_url, signature } = this.props.iframeConfig;
		const iframeContainerClasses = classNames( 'checkout__emergent-paywall-frame-container', {
			'iframe-loaded': !! this.props.iframeConfig,
		} );

		return (
			<div>
				<TermsOfService />
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">{ this.props.children }</div>
					{ ! this.props.iframeConfig && this.renderLoadingBlock() }
					<div className={ iframeContainerClasses }>
						<form
							className="checkout__emergent-paywall-form"
							onSubmit={ this.onSubmitFormHandler }
							ref={ this.formRef }
							name="emergent-paywall-get-iframe-contents"
							target="emergent-paywall-iframe"
							action={ paywall_url }
							method="POST"
						>
							<input type="hidden" name="payload" value={ payload } />
							<input type="hidden" name="signature" value={ signature } />
						</form>
						<iframe
							height={ iframeHeight }
							name="emergent-paywall-iframe"
							title={ paymentMethodName[ 'emergent-paywall' ] }
							ref={ this.iframeRef }
							className="checkout__emergent-paywall-iframe"
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		iframeConfig: getEmergentPaywallConfiguration( state ),
	} ),
	{ requestEmergentPaywallConfiguration }
)( localize( EmergentPaywallBox ) );
