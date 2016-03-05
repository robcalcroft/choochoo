import React from 'react';
import { Typeahead } from 'react-typeahead';
import $ from 'jquery';
import _ from 'underscore';
import forage from 'localforage';
import moment from 'moment';
import TrainsList from 'common/TrainsList';
import ServiceWorker from 'offline-plugin/runtime';
import 'offline-js';

export default class Home extends React.Component {

    constructor() {
        super();

        // Set initial state
        this.state = {
            origin: {
                input: '',
                code: '',
                predictions: []
            },
            destination: {
                input: '',
                code: '',
                predictions: []
            },
            metadata: {
                stateSaving: false,
                networkStatus: 'down'
            },
            trains: {
                services: [],
                lastUpdate: moment(),
                filterLocationName: '',
                locationName: '',
                infoMessages: []
            }
        };

        this.store = forage.createInstance({
            name: 'trainTimesApp'
        });

        // Save the state to offline every 5 seconds
        this.saveStateInterval = setInterval(this.saveState.bind(this), 5000);

        // Check network state every 3 seconds as the events for Offline
        // sometimes don't trigger, this makes favicon calls a lot so a TODO :S
        // is to remove it in the future
        this.offlineStatusInterval = setInterval(() => window.Offline.check(), 3000);

        // Component is broken so we have to hack the init value into it only
        // need to do this once though. See function comments for more.
        this.updateTypeaheadValueOnce = _.once(this.updateTypeaheadValue);

        // Install service worker
        ServiceWorker.install();

        // Load any previously cached state
        this.loadState();
    }

    componentDidMount() {
        this.registerNetworkStatusBindings();
    }

    componentDidUpdate() {
        if (this.state.origin.input !== '') {
            this.updateTypeaheadValueOnce();
        }
    }

    getNetworkStatus(networkStatus) {
        const readyForOffline = !!window.navigator.serviceWorker;
        const canSaveState = this.state.metadata.stateSaving;
        let suffix = '';

        // Ensure the user knows what the sitch is
        if (networkStatus === 'down') {
            if (readyForOffline && canSaveState) {
                suffix = ' (Available offline and progress will be saved)';
            } else if (readyForOffline && !canSaveState) {
                suffix = ' (Available offline but progress won\'t be saved)';
            } else if (!readyForOffline && canSaveState) {
                suffix = ' (Not available offline but progress saving is active)';
            } else if (!readyForOffline && !canSaveState) {
                suffix = ' (Not available offline and progress is not being saved)';
            }
            return `Offline${suffix}`;
        }
        return 'Online';
    }

    registerNetworkStatusBindings() {
        this.setState({
            metadata: Object.assign({}, this.state.metadata, {
                networkStatus: window.Offline.state
            })
        });

        window.Offline.on('up', () => {
            this.setState({
                metadata: Object.assign({}, this.state.metadata, {
                    networkStatus: 'up'
                })
            });
        });

        window.Offline.on('down', () => {
            this.setState({
                metadata: Object.assign({}, this.state.metadata, {
                    networkStatus: 'down'
                })
            });
        });
    }

    saveState(prop = 'state', state = this.state) {
        this.store.setItem(prop, state).then(() => {
            this.setState({
                metadata: Object.assign({}, this.state.metadata, {
                    stateSaving: true
                })
            });
        }, () => {
            this.setState({
                metadata: Object.assign({}, this.state.metadata, {
                    stateSaving: false
                })
            });
        });
    }

    loadState() {
        this.store.getItem('state').then(state => {
            if (state) {
                this.setState(state);
                this.saveState();
            }
        });
    }

    // Hack to fix broken component :|
    // Issue stems from the fact that the component can't have the 'value' or
    // 'defaultValue' prop updated via state; it only seems to render once.
    // Annoying, however this is the best typeahead comp I've found, others are
    // too bloated/shit.
    updateTypeaheadValue() {
        if (this.state.origin.input) {
            this.refs.originStation.setEntryText(this.state.origin.input);
            this.refs.originStation.focus();
        }
        if (this.state.destination.input) {
            this.refs.destinationStation.setEntryText(this.state.destination.input);
        }
    }

    stationChange(event) {
        const element = event.target;
        const value = element.value;
        const stationType =
            element.id === 'originStation' ? 'origin' : 'destination';

        this.setState({
            [`${stationType}`]: Object.assign({}, this.state[`${stationType}`], {
                input: value
            })
        });

        // Stop tab triggering call
        // TODO Fix native tab action not working
        if (event.which === 9) {
            return false;
        }

        if (value.length < 3) {
            return false;
        }

        return $.ajax({
            url: '/api-proxy',
            method: 'GET',
            data: {
                uri: `/crs/${value}`
            }
        }).done(data => {
            this.setState({
                [`${stationType}`]: Object.assign({}, this.state[stationType], {
                    predictions: data
                })
            });
        }).fail(error => {
            console.log(error);
        });
    }

    stationSelected(option, event) {
        const parent = $(event.target).parent().parent().prev();

        if (parent.attr('id') === 'originStation') {
            this.setState({
                origin: {
                    input: option.stationName,
                    code: option.crsCode,
                    predictions: []
                }
            });
        } else if (parent.attr('id') === 'destinationStation') {
            this.setState({
                destination: {
                    input: option.stationName,
                    code: option.crsCode,
                    predictions: []
                }
            });
        }

        this.saveState();
    }

    searchTrains() {
        if (!this.state.origin.input || !this.state.destination.input) {
            this.setState({
                trains: {
                    services: [],
                    lastUpdate: moment(),
                    filterLocationName: '',
                    locationName: '',
                    infoMessages: []
                }
            });
            return alert('Oops, no \'from\' or \'to\' specified' +
                ' (ensure you selected the items by clicking, not by hitting enter or tab)'
            );
        }

        if (this.state.metadata.networkStatus === 'down') {
            return false;
        }

        return $.ajax({
            url: '/api-proxy',
            method: 'GET',
            data: {
                uri: `/departures/${this.state.origin.input}/to/${this.state.destination.input}`
            }
        }).done(data => {
            this.setState({
                trains: {
                    services: data.trainServices || [],
                    lastUpdate: data.generatedAt,
                    filterLocationName: data.filterLocationName,
                    locationName: data.locationName,
                    infoMessages: data.nrccMessages || []
                }
            });
        }).fail(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className='container'>
                <header>
                    <img src={require('assets/train.png')} />
                    <h1>&nbsp;Live Train Times</h1>
                </header>
                <main>
                    <div className='border--bottom'>
                        <h2>Settings</h2>
                        <div className='row'>
                            <div className='col-sm-12 col-md-3'>
                                <b>Save recent searches&nbsp;</b>
                                <input className='settings' type='text' placeholder='5' />
                            </div>
                            <div className='col-sm-12 col-md-3' style={{paddingTop: '1vh'}}>
                                <b>State saving&nbsp;</b>
                                {this.state.metadata.stateSaving ? 'Active' : 'Inactive'}
                            </div>
                            <div className='col-sm-12 col-md-3' style={{paddingTop: '1vh'}}>
                                <b>Network status&nbsp;</b>
                                {this.getNetworkStatus(this.state.metadata.networkStatus)}
                            </div>
                            <div className='col-sm-12 col-md-3' style={{paddingTop: '1vh'}}>
                                <b>Ready for offline&nbsp;</b>
                                {window.navigator.serviceWorker ?
                                    'Yes' : 'No (browser lacks support)'
                                }
                            </div>
                        </div>
                    </div>
                    <div className='row flex border--bottom' style={{marginBottom: '5vh'}}>
                        <div className='col-sm-12 col-md-3'>
                            <h2 className='station-search-title'>From</h2>
                            <Typeahead
                                options={this.state.origin.predictions}
                                maxVisible={20}
                                customClasses={{
                                    input: 'station-entry',
                                    hover: 'hover',
                                    results: 'results'
                                }}
                                ref='originStation'
                                onKeyUp={this.stationChange.bind(this)}
                                filterOption={(inputValue, option) => option.crsCode}
                                displayOption={value => value.stationName}
                                onOptionSelected={this.stationSelected.bind(this)}
                                inputProps={{ id: 'originStation' }}
                            />
                        </div>
                        <div className='col-sm-12 col-md-offset-3 col-md-3'>
                            <h2 className='station-search-title'>To</h2>
                                <Typeahead
                                    options={this.state.destination.predictions}
                                    maxVisible={10}
                                    customClasses={{
                                        input: 'station-entry',
                                        hover: 'hover',
                                        results: 'results'
                                    }}
                                    ref='destinationStation'
                                    onKeyUp={this.stationChange.bind(this)}
                                    filterOption={(inputValue, option) => option.crsCode}
                                    displayOption={value => value.stationName}
                                    onOptionSelected={this.stationSelected.bind(this)}
                                    inputProps={{ id: 'destinationStation' }}
                                />
                        </div>
                        <div className='col-sm-12 col-md-3 flex-child-center'>
                            <button
                                className={
                                    this.state.metadata.networkStatus === 'down' ?
                                    'disabled' : ''
                                }
                                onClick={this.searchTrains.bind(this)}
                            >Search</button>
                        </div>
                    </div>
                    <TrainsList
                        trainServices={this.state.trains.services}
                        lastUpdate={this.state.trains.lastUpdate}
                        filterLocationName={this.state.trains.filterLocationName}
                        locationName={this.state.trains.locationName}
                        infoMessages={this.state.trains.infoMessages}
                    />
                </main>
                <footer>
                    <p>Built as part of the <a href='https://register.port.ac.uk/ords/f?p=111:3:0::NO::P3_UNIT_ID:456280302'>WEBRES UoP course</a>, uses National Rail's open data feeds via the <a href='https://github.com/jpsingleton/Huxley'>Huxley proxy</a>. Application is focused around <a href='https://developer.mozilla.org/en-US/Apps/Fundamentals/Offline'>offline web</a> and how it can be used to improve user experience on a number of levels. This site uses one of <a href='https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API'>IndexedDB</a>, <a href='https://developer.mozilla.org/en/docs/Web/API/Window/localStorage'>localStorage</a> or <a href='https://en.wikipedia.org/wiki/Web_SQL_Database'>WebSQL</a> (depending on browser) to store recently accessed data offline so you can view it at a later data. Additionally, the JavaScript and CSS resources are not loaded via a CDN and will be cached by your browser. <b>Try turning off your Wi-Fi and reloading the page!</b></p>
                </footer>
            </div>
        );
    }
}
