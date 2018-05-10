/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import React, { Component } from 'react';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import FormFieldset from 'components/forms/form-fieldset';
import Popover from 'components/popover';
import TokenField from 'components/token-field';
import { recordTldFilterSelected } from './analytics';

export class TldFilterBar extends Component {
	static propTypes = {
		availableTlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
		filters: PropTypes.shape( {
			tlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
		} ),
		lastFilters: PropTypes.shape( {
			tlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
		} ),
		numberOfTldsShown: PropTypes.number,
		onChange: PropTypes.func.isRequired,
		onReset: PropTypes.func.isRequired,
		onSubmit: PropTypes.func.isRequired,
		recordTldFilterSelected: PropTypes.func.isRequired,
		showPlaceholder: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		numberOfTldsShown: 8,
	};

	state = {
		showPopover: false,
	};

	bindButton = button => ( this.button = button );

	handleButtonClick = event => {
		const isCurrentlySelected = event.currentTarget.dataset.selected === 'true';
		const newTld = event.currentTarget.value;

		this.props.recordTldFilterSelected(
			newTld,
			event.currentTarget.dataset.index,
			! isCurrentlySelected
		);

		const tldSet = new Set( [ ...this.props.filters.tlds, newTld ] );
		if ( isCurrentlySelected ) {
			tldSet.delete( newTld );
		}

		const tlds = [ ...tldSet ];
		this.props.onChange( { tlds }, { shouldSubmit: true } );
	};
	handleFiltersReset = () => {
		this.togglePopover();
		this.props.onReset( 'tlds' );
	};
	handleFiltersSubmit = () => {
		this.togglePopover();
		this.props.onSubmit();
	};
	handleTokenChange = newTlds => {
		const tlds = newTlds.filter( tld => includes( this.props.availableTlds, tld ) );
		this.props.onChange( { tlds } );
	};

	togglePopover = () => {
		this.setState( {
			showPopover: ! this.state.showPopover,
		} );
	};

	render() {
		if ( this.props.showPlaceholder ) {
			return this.renderPlaceholder();
		}

		return (
			<CompactCard className="search-filters__buttons">
				{ this.renderSuggestedButtons() }
				{ this.renderPopoverButton() }
				{ this.state.showPopover && this.renderPopover() }
			</CompactCard>
		);
	}

	renderSuggestedButtons() {
		const { lastFilters: { tlds: selectedTlds } } = this.props;
		return this.props.availableTlds
			.slice( 0, this.props.numberOfTldsShown )
			.map( ( tld, index ) => (
				<Button
					className={ classNames( 'search-filters__tld-button', {
						'is-active': includes( selectedTlds, tld ),
					} ) }
					data-selected={ includes( selectedTlds, tld ) }
					data-index={ index }
					key={ tld }
					onClick={ this.handleButtonClick }
					value={ tld }
				>
					.{ tld }
				</Button>
			) );
	}

	renderPopoverButton() {
		return (
			<Button
				className={ classNames( 'search-filters__popover-button', {
					'is-active': this.props.filters.tlds.length > 0,
				} ) }
				onClick={ this.togglePopover }
				ref={ this.bindButton }
				key="popover-button"
			>
				{ this.props.translate( 'More Extensions', {
					context: 'TLD filter button',
					comment: 'Refers to top level domain name extension, such as ".com"',
				} ) }
				<Gridicon icon="chevron-down" size={ 24 } />
			</Button>
		);
	}

	renderPopover() {
		const { translate } = this.props;

		return (
			<Popover
				autoPosition={ false }
				className="search-filters__popover"
				context={ this.button }
				isVisible={ this.state.showPopover }
				onClose={ this.togglePopover }
				position="bottom left"
			>
				<FormFieldset className="search-filters__token-field-fieldset">
					<TokenField
						isExpanded
						maxSuggestions={ 500 }
						onChange={ this.handleTokenChange }
						placeholder={ translate( 'Select an extension' ) }
						suggestions={ this.props.availableTlds }
						tokenizeOnSpace
						value={ this.props.filters.tlds }
					/>
				</FormFieldset>
				<FormFieldset className="search-filters__buttons-fieldset">
					<div className="search-filters__buttons">
						<Button onClick={ this.handleFiltersReset }>{ translate( 'Reset' ) }</Button>
						<Button primary onClick={ this.handleFiltersSubmit }>
							{ translate( 'Apply' ) }
						</Button>
					</div>
				</FormFieldset>
			</Popover>
		);
	}

	renderPlaceholder() {
		return (
			<CompactCard className="search-filters__buttons">
				{ [ ...Array( this.props.numberOfTldsShown ) ].map( ( undef, index ) => (
					<Button className="search-filters__button--is-placeholder" key={ index } disabled />
				) ) }
			</CompactCard>
		);
	}
}
export default connect( null, {
	recordTldFilterSelected,
} )( localize( TldFilterBar ) );
