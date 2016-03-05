import React from 'react';
import moment from 'moment';
import Train from 'common/Train';

export default class TrainsList extends React.Component {
    static propTypes = {
        trainServices: React.PropTypes.array.isRequired,
        lastUpdate: React.PropTypes.oneOfType([
            React.PropTypes.string.isRequired,
            React.PropTypes.object.isRequired
        ]),
        filterLocationName: React.PropTypes.string.isRequired,
        locationName: React.PropTypes.string.isRequired,
        infoMessages: React.PropTypes.array.isRequired
    }

    static defaultProps = {
        trainServices: [],
        lastUpdate: moment()
    }

    render() {
        return (
            <div id='trains' className='border--bottom'>
                <div className='row'>
                    <div className='col-sm-6'>
                        Last updated <b>{moment(this.props.lastUpdate).fromNow()}</b>
                    </div>
                    <div className='col-sm-6 filter-location-name'>
                        {
                            this.props.filterLocationName !== '' ?
                            <span>Travelling to <b>{this.props.filterLocationName}</b></span> : ''
                        }
                    </div>
                </div>
                {
                    (() => {
                        if (!this.props.trainServices.length) {
                            return (
                                <h1 className='fadein' style={{textAlign: 'center'}}>
                                    No trains available
                                </h1>
                            );
                        }
                        return this.props.trainServices.map(trainService =>
                            <Train
                                key={trainService.serviceID}
                                service={trainService}
                                locationName={this.props.locationName}
                                infoMessages={this.props.infoMessages}
                            />
                        );
                    })()
                }
            </div>
        );
    }
}
