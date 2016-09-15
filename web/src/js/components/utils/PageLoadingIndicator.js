import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const style = {
    margin: '24px'
};

const PageLoadingIndicator = () => {
    return (
        <CircularProgress mode="indeterminate" style={style}/>
    );
};

export default PageLoadingIndicator;