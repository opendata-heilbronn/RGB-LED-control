import React from "react";
import AppBar from 'material-ui/AppBar';

const Header = ({props}) => (
    <AppBar
        title="RGB LED Control"
        showMenuIconButton={false}
    />
);

export default Header;