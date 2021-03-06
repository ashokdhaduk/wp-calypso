/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import CountedTextarea from 'components/forms/counted-textarea';
import FormTextarea from 'components/forms/form-textarea';
import InfoPopover from 'components/info-popover';
import TrackInputChanges from 'components/track-input-changes';
import * as stats from 'lib/posts/stats';

class PublicizeMessage extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		message: PropTypes.string,
		preview: PropTypes.string,
		acceptableLength: PropTypes.number,
		requireCount: PropTypes.bool,
		displayMessageHeading: PropTypes.bool,
		onChange: PropTypes.func,
		preFilledMessage: PropTypes.string,
	};

	static defaultProps = {
		disabled: false,
		message: '',
		acceptableLength: 280,
		requireCount: false,
		displayMessageHeading: true,
		onChange: noop,
		preFilledMessage: '',
	};

	userHasEditedMessage = false;

	onChange = event => {
		this.userHasEditedMessage = true;
		this.props.onChange( event.target.value );
	};

	recordStats = () => {
		stats.recordStat( 'sharing_message_changed' );
		stats.recordEvent( 'Publicize Sharing Message Changed' );
	};

	shouldPreFillMessage() {
		return ! this.userHasEditedMessage && '' === this.props.message;
	}

	getMessage() {
		if ( this.shouldPreFillMessage() ) {
			return this.props.preFilledMessage;
		}
		return this.props.message;
	}

	renderInfoPopover() {
		return (
			<InfoPopover
				className="publicize-message-counter-info"
				position="bottom left"
				gaEventCategory="Editor"
				popoverName="SharingMessage"
			>
				{ this.props.translate(
					'The length includes space for the link to your post and an attached image.',
					{ context: 'Post editor sharing message counter explanation' }
				) }
			</InfoPopover>
		);
	}

	renderTextarea() {
		const placeholder =
			this.props.preview || this.props.translate( 'Write a message for your audience here.' );
		if ( this.props.requireCount ) {
			return (
				<CountedTextarea
					disabled={ this.props.disabled }
					placeholder={ placeholder }
					countPlaceholderLength={ true }
					value={ this.getMessage() }
					onChange={ this.onChange }
					showRemainingCharacters={ true }
					acceptableLength={ this.props.acceptableLength }
					className="editor-sharing__message-input"
				>
					{ this.renderInfoPopover() }
				</CountedTextarea>
			);
		}
		return (
			<div>
				<FormTextarea
					disabled={ this.props.disabled }
					value={ this.getMessage() }
					placeholder={ placeholder }
					onChange={ this.onChange }
					className="editor-sharing__message-input"
				/>
			</div>
		);
	}

	render() {
		return (
			<div className="editor-sharing__publicize-message">
				{ this.props.displayMessageHeading && (
					<h5 className="editor-sharing__message-heading">
						{ this.props.translate( 'Customize the message', {
							context: 'Post editor sharing message heading',
						} ) }
					</h5>
				) }
				<TrackInputChanges onNewValue={ this.recordStats }>
					{ this.renderTextarea() }
				</TrackInputChanges>
			</div>
		);
	}
}

export default localize( PublicizeMessage );
