import React, {Component} from "react";
import axios from "axios";
import {List, ListItem} from "material-ui/List";
import PlayIcon from "material-ui/svg-icons/av/play-arrow";
import {showNotification} from "../actions/notificationActions";
import {connect} from "react-redux";
import PageLoadingIndicator from "./utils/PageLoadingIndicator";
import {Card, CardTitle, CardText} from "material-ui/Card";
import Avatar from "material-ui/Avatar";
import OnlineIcon from "material-ui/svg-icons/navigation/check";
import OfflineIcon from "material-ui/svg-icons/navigation/close";
import {green500, lightBlack} from "material-ui/styles/colors";
import { fetchIfNeeded } from '../actions/devicesActions';
import moment from "moment";
moment.locale('de');

const formatDate = (ts) => {
    if (!ts) return '-';
    return moment(ts).format('DD.MM.YY HH:mm:ss');
};

class DevicesTestList extends Component {
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
                dispatch(showNotification(error.message));
            });
    }

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchIfNeeded());
    }

    renderDeviceItems() {
        const {items} = this.props;
        return Object.keys(items).map(mac => {
            const device = items[mac];
            const avatar = device.isOnline ? <Avatar icon={<OnlineIcon />} backgroundColor={green500}/> :
                <Avatar icon={<OfflineIcon />} backgroundColor={lightBlack}/>;
            return <ListItem
                key={mac}
                leftAvatar={avatar}
                rightIcon={<PlayIcon />}
                primaryText={`Raum ${device.room}`}
                secondaryText={<p>{mac}{device.version ? ', ' + device.version : ''}<br />{formatDate(device.lastSeen)}
                </p>}
                secondaryTextLines={2}
                onClick={this.onDeviceClick.bind(this, mac)}
            />;
        });
    }

    getContent(deviceItems) {
        if (this.props.isFetching) {
            return <PageLoadingIndicator />
        } else {
            return <Card>
                <CardTitle title="Ansteuerung testen" subtitle="einzeln je Raum"/>
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

const mapStateToProps = (state) => state.devices ? state.devices : {isFetching: false, items: {}};

export default connect(mapStateToProps)(DevicesTestList)