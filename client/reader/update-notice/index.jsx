/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop, filter, get, flatMap } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getDocumentHeadCappedUnreadCount } from 'state/document-head/selectors';
import { getCommentById } from 'state/comments/selectors';
import { getReaderStream as getStream } from 'state/selectors';

class UpdateNotice extends React.PureComponent {
	static propTypes = {
		streamKey: PropTypes.string,
		onClick: PropTypes.func,
		cappedUnreadCount: PropTypes.string,
	};

	static defaultProps = { onClick: noop };

	render() {
		const { count } = this.props;

		const counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': count > 0,
		} );

		return (
			<div className={ counterClasses } onClick={ this.handleClick }>
				<DocumentHead unreadCount={ count } />
				<Gridicon icon="arrow-up" size={ 18 } />
				{ this.props.translate( '%s new post', '%s new posts', {
					args: [ this.props.cappedUnreadCount ],
					count,
				} ) }
			</div>
		);
	}

	handleClick = event => {
		event.preventDefault();
		this.props.onClick();
	};
}

const countNewComments = ( state, postKeys ) => {
	const newComments = flatMap( postKeys, postKey => {
		return filter( postKey.comments, commentId => {
			return ! getCommentById( {
				state,
				siteId: postKey.blogId,
				commentId: commentId,
			} );
		} );
	} );
	return newComments.length;
};

const mapStateToProps = ( state, ownProps ) => {
	const stream = getStream( state, ownProps.streamKey );
	const pendingItems = stream.pendingItems.items;
	const updateCount = stream.pendingItems.items.length;

	// ugly hack for convos
	const isConversations = !! get( pendingItems, [ 0, 'comments' ] );
	const count = isConversations ? countNewComments( state, pendingItems ) : updateCount;

	return {
		cappedUnreadCount: getDocumentHeadCappedUnreadCount( state ),
		count,
	};
};

export default connect( mapStateToProps )( localize( UpdateNotice ) );
