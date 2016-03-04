import React from 'react';
import { Typeahead } from 'react-typeahead';
import $ from 'jquery';
import _ from 'underscore';
import forage from 'localforage';
import moment from 'moment';
import TrainsList from 'common/TrainsList';

export default class Home extends React.Component {

    constructor() {
        super();

        // Set initial state
        this.state = {
            originInput: '',
            originCode: '',
            destinationInput: '',
            destinationCode: '',
            originPredictions: [],
            destinationPredictions: [],
            offlineMode: false,
            trainServices: [],
            trainServicesLastUpdate: moment(),
            filterLocationName: ''
        };

        this.store = forage.createInstance({
            name: 'trainTimesApp'
        });

        // Save the state to offline every 5 seconds
        this.saveStateInterval = setInterval(this.saveState.bind(this), 5000);

        // Component is broken so we have to hack the init value into it
        // only need to do this once though. See function comments for more.
        this.updateTypeaheadValueOnce = _.once(this.updateTypeaheadValue);

        this.loadState();
    }

    componentDidUpdate() {
        if (this.state.originInput !== '') {
            this.updateTypeaheadValueOnce();
        }
    }

    saveState() {
        this.store.setItem('state', this.state).then(() => {
            this.setState({ offlineMode: true });
        }, () => {
            this.setState({ offlineMode: false });
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
    // Issue stems from the fact that the component can't have the 'value' or 'defaultValue'
    // prop updated via state; it only seems to render once. Annoying, however this is the
    // best typeahead comp I've found, others are too bloated/shit.
    updateTypeaheadValue() {
        if (this.state.originInput) {
            this.refs.originStation.setEntryText(this.state.originInput);
            this.refs.originStation.focus();
        }
        if (this.state.destinationInput) {
            this.refs.destinationStation.setEntryText(this.state.destinationInput);
        }
    }

    stationChange(event) {
        const element = event.target;
        const value = element.value;
        const stationType =
            element.id === 'originStation' ? 'origin' : 'destination';

        this.setState({
            [`${stationType}Input`]: value
        });

        // Stop tab triggering call
        // TODO Fix native tab action not working
        if (event.which === 9) {
            return false;
        }

        if (value.length < 4) {
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
                [`${stationType}Predictions`]: data
            });
        }).fail(error => {
            console.log(error);
        });
    }

    stationSelected(option, event) {
        const parent = $(event.target).parent().parent().prev();

        if (parent.attr('id') === 'originStation') {
            this.setState({
                originInput: option.stationName,
                originCode: option.crsCode,
                originPredictions: []
            });
        } else if (parent.attr('id') === 'destinationStation') {
            this.setState({
                destinationInput: option.stationName,
                destinationCode: option.crsCode,
                destinationPredictions: []
            });
        }

        this.saveState();
    }

    searchTrains() {
        if (!this.state.originInput || !this.state.originInput) {
            this.setState({
                trainServices: [],
                trainServicesLastUpdate: moment(),
                filterLocationName: ''
            });
            return alert('Oops, no \'from\' or \'to\' specified');
        }

        return $.ajax({
            url: '/api-proxy',
            method: 'GET',
            data: {
                uri: `/departures/${this.state.originInput}/to/${this.state.destinationInput}`
            }
        }).done(data => {
            this.setState({
                trainServices: data.trainServices === null ? [] : data.trainServices,
                trainServicesLastUpdate: data.generatedAt,
                filterLocationName: data.filterLocationName
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
                                <b>Offline mode&nbsp;</b>
                                {this.state.offlineMode ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    </div>
                    <div className='row flex border--bottom' style={{marginBottom: '5vh'}}>
                        <div className='col-sm-12 col-md-3'>
                            <h2 className='station-search-title'>From</h2>
                            <Typeahead
                                options={this.state.originPredictions}
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
                                    options={this.state.destinationPredictions}
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
                            <button onClick={this.searchTrains.bind(this)}>Search</button>
                        </div>
                    </div>
                    <TrainsList
                        trainServices={this.state.trainServices}
                        lastUpdate={this.state.trainServicesLastUpdate}
                        filterLocationName={this.state.filterLocationName}
                    />
                </main>
                <footer>
                    <p>Built as part of the <a href='https://register.port.ac.uk/ords/f?p=111:3:0::NO::P3_UNIT_ID:456280302'>WEBRES UoP course</a>, uses National Rail's open data feeds via the <a href='https://github.com/jpsingleton/Huxley'>Huxley proxy</a>. Application is focused around <a href='https://developer.mozilla.org/en-US/Apps/Fundamentals/Offline'>offline web</a> and how it can be used to improve user experience on a number of levels. This site uses one of <a href='https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API'>IndexedDB</a>, <a href='https://developer.mozilla.org/en/docs/Web/API/Window/localStorage'>localStorage</a> or <a href='https://en.wikipedia.org/wiki/Web_SQL_Database'>WebSQL</a> (depending on browser) to store recently accessed data offline so you can view it at a later data. Additionally, the JavaScript and CSS resources are not loaded via a CDN and will be cached by your browser. <b>Try turning off your Wi-Fi and reloading the page!</b></p>
                </footer>
            </div>
        );
    }
}
