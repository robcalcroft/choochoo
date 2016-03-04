import React from 'react';

export default class Train extends React.Component {
    static propTypes = {
        service: React.PropTypes.object.isRequired
    }

    render() {
        const {
            operator,
            origin,
            destination,
            std,
            etd
        } = this.props.service;

        return (
            <div className='row train fadein'>
                <div className='col-sm-12 col-md-1'>
                    <img src={require('assets/train.png')} height='25' width='25' />
                </div>
                <div className='col-sm-12 col-md-8'>
                    Departing from
                    <b> {origin[0].locationName} </b>
                    to
                    <b> {destination[0].locationName} </b>
                    at
                    <b> {etd === 'On time' ? std : `${etd} instead of ${std}`} </b>
                </div>
                <div className='col-sm-12 col-md-2'>
                    <b>{operator}</b>
                </div>
            </div>
        );
    }
}
