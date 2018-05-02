/** @format */
/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import QueryUsersSuggestions from 'components/data/query-users-suggestions';
import { getUserSuggestions } from 'state/users/suggestions/selectors';
import PropTypes from 'prop-types';

const connectUserMentions = WrappedComponent => {
	class connectUserMentionsFetcher extends React.PureComponent {
		static propTypes = {
			siteId: PropTypes.number,
		};

		render() {
			return (
				<Fragment>
					{ !! this.props.siteId && <QueryUsersSuggestions siteId={ this.props.siteId } /> }
					<WrappedComponent { ...this.props } />
				</Fragment>
			);
		}
	}

	return connect( ( state, ownProps ) => {
		return {
			siteId: ownProps.siteId,
			suggestions: getUserSuggestions( state, ownProps.siteId ),
		};
	} )( connectUserMentionsFetcher );
};

export default connectUserMentions;
