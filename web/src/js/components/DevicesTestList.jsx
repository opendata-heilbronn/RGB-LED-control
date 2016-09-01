import React, {Component} from "react";
import axios from "axios";
import {List, ListItem} from "material-ui/List";
import PlayIcon from "material-ui/svg-icons/av/play-arrow";
import {showNotification} from "../actions/notificationActions";
import {connect} from "react-redux";
import PageLoadingIndicator from "./utils/PageLoadingIndicator";
import {Card, CardTitle, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import OnlineIcon from 'material-ui/svg-icons/navigation/check';
import OfflineIcon from 'material-ui/svg-icons/navigation/close';
import {green500, lightBlack} from 'material-ui/styles/colors';
import moment from 'moment';
moment.locale('de');

const formatDate = (ts) => {
    if(!ts) return '-';
    return moment(ts).format('DD.MM.YY HH:mm:ss');
};

class DevicesTestList extends Component {
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
                dispatch(showNotification(`${mac} leuchtet nun 2s lang blau`));
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
            const avatar = device.isOnline ? <Avatar icon={<OnlineIcon />} backgroundColor={green500} /> : <Avatar icon={<OfflineIcon />} backgroundColor={lightBlack} />;
            return <ListItem
                key={mac}
                leftAvatar={avatar}
                rightIcon={<PlayIcon />}
                primaryText={`Raum ${device.room}`}
                secondaryText={<p>{mac}<br />{formatDate(device.lastSeen)}</p>}
                secondaryTextLines={2}
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