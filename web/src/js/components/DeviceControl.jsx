import React, {Component} from "react";
import axios from "axios";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import {SketchPicker} from "react-color";
import {showNotification} from "../actions/notificationActions";
import {fetchIfNeeded} from "../actions/devicesActions";
import {connect} from "react-redux";
import PageLoadingIndicator from "./utils/PageLoadingIndicator";
import {Card, CardTitle, CardText} from "material-ui/Card";

class DeviceControl extends Component {
    state = {device: 'all'};

    onSubmit(color) {
        const {dispatch} = this.props;
        const {device} = this.state;
        if(!color) color = this.state.color;
        axios.post(`/api/devices/${device}/rgb`, {
            color
        })
            .then(() => {
                dispatch(showNotification(`${device} leuchtet nun in ${color}`));
            })
            .catch((error) => {
                console.trace(error.stack);
                dispatch(showNotification(error.message));
            });
    }

    componentWillMount() {
        const {dispatch} = this.props;
        dispatch(fetchIfNeeded());
    }

    getMenuItems() {
        const {items} = this.props;
        const menuItems = [
            <MenuItem key={'all'} value={'all'} primaryText={`Alle Räume`} />,
            <MenuItem key={'codingPen'} value={'codingPen'} primaryText={`Coding Pen`} />,
            <MenuItem key={'counter'} value={'counter'} primaryText={`Theke`} />,
            <MenuItem key={'windows'} value={'windows'} primaryText={`Fenster`} />
        ];
        Object.keys(items).forEach(mac => {
            const macString = mac.toString();
            const device = items[macString];
            menuItems.push(<MenuItem key={macString} value={macString} primaryText={`Raum ${device.room}${device.isOnline ? '' : ' (offline)'}`} />);
        });
        return menuItems;
    }

    handleDeviceChange = (event, index, value) => {
        this.setState({device: value});
    };

    handleColorChange = (value) => {
        this.setState({color: value.hex});
        if(this.state.device) this.onSubmit(value.hex);
        else this.props.dispatch(showNotification('Kein Raum ausgewählt'))
    };

    startEffect = (effect) => {
        if (this.state.device) this.onSubmit(effect);
        else this.props.dispatch(showNotification('Kein Raum ausgewählt'))
    };

    getContent() {
        if (this.props.isFetching) {
            return <PageLoadingIndicator />
        } else {
            const menuItems = this.getMenuItems();
            return <Card>
                <CardTitle title="Farbe setzen" />
                <CardText>
                    <SelectField value={this.state.device} onChange={this.handleDeviceChange.bind(this)} style={{marginBottom:'1rem'}}>
                        {menuItems}
                    </SelectField>
                    <SketchPicker type="sketch" color={ this.state.color } onChangeComplete={this.handleColorChange.bind(this)} />
                    <RaisedButton label="Party" primary={true} style={{margin: '1rem 1rem 0 0'}}
                                  onClick={this.startEffect.bind(this, 'party')}/>
                    <RaisedButton label="Lighthouse" primary={true} style={{marginTop: '1rem'}}
                                  onClick={this.startEffect.bind(this, 'lighthouse')}/>
                </CardText>
            </Card>;
        }
    }

    render() {
        return (
            <section style={{marginTop: '1rem'}}>
                {this.getContent()}
            </section>
        );
    }
}

const mapStateToProps = (state) => state.devices ? state.devices : {isFetching: false, items: {}};

export default connect(mapStateToProps)(DeviceControl)
