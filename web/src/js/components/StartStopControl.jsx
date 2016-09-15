import React, {Component} from "react";
import axios from "axios";
import RaisedButton from "material-ui/RaisedButton";
import {showNotification} from "../actions/notificationActions";
import {connect} from "react-redux";
import {Card, CardTitle, CardText} from "material-ui/Card";

class StartStopControl extends Component {
    sendState(state) {
        const {dispatch} = this.props;
        axios.post(`/api/devices/masterOverride`, {
            state: state ? 1 : 0
        })
            .then(() => {
                dispatch(showNotification(`Alle Räume sind nun ${state ? 'an' : 'aus'}`));
            })
            .catch((error) => {
                console.trace(error.stack);
                dispatch(showNotification(error.message));
            });
    }

    render() {
        return (
            <section style={{marginTop: '1rem'}}>
                <Card>
                    <CardTitle title="Master Control" subtitle="Alle Räume ..."/>
                    <CardText>
                        <RaisedButton label="Aus" primary={true}
                                      onClick={this.sendState.bind(this, false)}/>
                    </CardText>
                </Card>
            </section>
        );
    }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(StartStopControl);
