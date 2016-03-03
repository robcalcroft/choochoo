import React from 'react';
import { Typeahead } from 'react-typeahead';
import $ from 'jquery';

export default class Home extends React.Component {

    constructor() {
        super();

        this.state = localStorage.getItem('state') || {
            originInput: '',
            destinationInput: '',
            originPredictions: [],
            destinationPredictions: []
        };
    }

    // add lookupf for current trains near station and load,
    // need to implement redux for this to properly work <3
    stationsAutocompleteChange(event) {
        const value = event.target.value;

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
                proxyUri: `/crs/${value}`
            }
        })
        .done(data => {
            this.setState({
                originPredictions: data
            });
        })
        .fail(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className='container'>
                <header>
                    <img src={require('assets/train.png')} />
                    <h1>&nbsp;Train Times</h1>
                </header>
                <main>
                    <div className='border--bottom'>
                        <h2>Settings</h2>
                        <b>Save recent searches&nbsp;</b>
                        <input className='settings' type='text' placeholder='5' />
                    </div>
                    <div className='row'>
                        <div className='col-sm-3'>
                            <h2>From</h2>
                            <Typeahead
                                options={this.state.originPredictions}
                                maxVisible={5}
                                customClasses={{
                                    input: 'station-entry',
                                    hover: 'hover',
                                    results: 'results'
                                }}
                                onKeyUp={this.stationsAutocompleteChange.bind(this)}
                                filterOption={(inputValue, option) => option.crsCode}
                                displayOption={value => value.stationName}
                                preventKeyEvents='true'
                                onOptionSelected={
                                    (option, event) => $(event.target)
                                                            .parent()
                                                            .parent()
                                                            .prev()
                                                            .attr('data-crscode', option.crsCode)
                                }
                            />
                        </div>
                        <div className='col-sm-offset-3 col-sm-3'>
                            <h2>To</h2>
                            <input className='station-entry' type='text' />
                        </div>
                    </div>
                </main>
                <footer>
                    <p>Built as part of the WEBRES UoP course, uses National Rail's open data feeds via the <a href='https://github.com/jpsingleton/Huxley'>Huxley proxy</a>. Application is focused around <a href='https://developer.mozilla.org/en-US/Apps/Fundamentals/Offline'>offline web</a> and how it can be used to improve user experience on a number of levels. This site uses X to store recently accessed data offline so you can view it at a later data. Additionally, the JavaScript and CSS resources are not loaded via a CDN and will be cached by your browser. <b>Try turning off your Wi-Fi and reloading the page!</b></p>
                </footer>
            </div>
        );
    }
}
