import React, { Component, PropTypes } from 'react';
import Snackbar from 'material-ui/Snackbar';
import { hideNotification } from '../../actions/notificationActions'
import { connect } from 'react-redux'

class Notification extends Component {
    closeNotification() {
        const { dispatch } = this.props;
        dispatch(hideNotification());
    }

    render() {
        return (
            <Snackbar open={this.props.message ? true : false} message={this.props.message}
                      autoHideDuration={2000} onRequestClose={this.closeNotification.bind(this)}/>
        );
    }
}

Notification.propTypes = {
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return state.notification || {message: ""};
}

export default connect(mapStateToProps)(Notification)
