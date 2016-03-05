import React from 'react';

export default class Train extends React.Component {
    static propTypes = {
        service: React.PropTypes.object.isRequired,
        locationName: React.PropTypes.string.isRequired,
        infoMessages: React.PropTypes.array.isRequired,
        filterLocationName: React.PropTypes.string.isRequired
    }

    getArrivalTime(locationName, callingPoints) {
        return callingPoints.find(callingPoint => callingPoint.locationName === locationName).st;
    }

    // Not used but available for future use
    renderCallingPoints(callingPoints) {
        return `Calling at ${callingPoints.map(
            callingPoint => callingPoint.locationName
        ).join(', ')}`;
    }

    render() {
        const {
            operator,
            destination,
            std,
            etd,
            subsequentCallingPoints
        } = this.props.service;

        return (
            <div className='row train fadein'>
                <div className='col-sm-1'>
                    <img src={require('assets/train.png')} height='50' width='50' />
                </div>
                <div className='col-sm-11'>
                    <div className='row'>

                        <div className='col-sm-12 col-md-10'>
                            Departing from
                            <b> {this.props.locationName} </b>
                            towards
                            <b> {destination[0].locationName} </b>
                            at
                            <b> {etd === 'On time' ? std : `${etd} instead of ${std}`} </b>
                            {destination[0].via ? `${destination[0].via} ` : ''}
                            arriving at
                            <b> {
                                this.getArrivalTime(
                                    this.props.filterLocationName,
                                    subsequentCallingPoints[0].callingPoint
                                )
                            } </b>
                        </div>
                        <div className='col-sm-12 col-md-2'>
                            <b>{operator}</b>
                        </div>
                    </div>
                    {
                        this.props.infoMessages.map(message =>
                            <div className='row' key={message.value}>
                                <br />
                                <div className='col-sm-12'>
                                    Travel info: <b>{message.value.split('.')[0]}</b>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}
