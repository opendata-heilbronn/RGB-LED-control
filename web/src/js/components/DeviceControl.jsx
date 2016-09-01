import React, {Component} from "react";
import axios from "axios";
import PlayIcon from "material-ui/svg-icons/av/play-arrow";
import {showNotification} from "../actions/notificationActions";
import {connect} from "react-redux";
import PageLoadingIndicator from "./utils/PageLoadingIndicator";
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

class DeviceControl extends Component {
    state = {devices: {}};

    updateData() {
        const {dispatch} = this.props;
        this.setState({loading: true});
        axios.get('/api/devices')
            .then((response) => {
                this.setState({loading: false, devices: response.data})
            })
            .catch((error) => {
                console.trace(error.stack);
                this.setState({loading: false});
                dispatch(showNotification(error.message));
            });
    }

    onDeviceClick(mac) {
        const {dispatch} = this.props;
        axios.post(`/api/devices/${mac}/rgb`, {
            color: '#0000FF'
        })
            .then(() => {
                dispatch(showNotification(`Mac ${mac} sollte nun 2s lang blau leuchten`));
                return new Promise(resolve => {
                    setTimeout(resolve, 2000);
                });
            })
            .then(() => {
                return axios.post(`/api/devices/${mac}/rgb`, {
                    color: '#000000'
                })
            })
            .catch((error) => {
                console.trace(error.stack);
                this.setState({loading: false});
                dispatch(showNotification(error.message));
            });
    }

    componentWillMount() {
        this.updateData();
    }

    renderDeviceItems() {
        const {devices} = this.state;
        return Object.keys(devices).map(mac => {
            const device = devices[mac];
            return <ListItem
                key={mac}
                rightIcon={<PlayIcon />}
                primaryText={mac}
                secondaryText={`Raum ${device.room}`}
                onClick={this.onDeviceClick.bind(this, mac)}
            />;
        });
    }

    getContent(deviceItems) {
        if (this.state.loading) {
            return <PageLoadingIndicator />
        } else {
            return <Card>
                    <CardTitle title="Ansteuerung testen" subtitle="einzeln je Raum" />
                    <CardText>
                        <List>
                            {deviceItems}
                        </List>
                    </CardText>
                </Card>;
        }
    }

    render() {
        const deviceItems = this.renderDeviceItems();
        const content = this.getContent(deviceItems);

        return (
            <section>
                {content}
            </section>
        );
    }
}

export default connect(() => ({}))(DevicesTestList)