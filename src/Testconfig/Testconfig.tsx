import React from 'react'
import './Testconfig.css'

export class Testconfig extends React.Component {
    render() {
        return (
            <div className="testconfig">
                <h1>Testconfig</h1>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="repeat">Repeat</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="repeat" name="repeat" />
                    </div>
                </div>

                <div className="row">
                    <div className="col-25">
                        <label htmlFor="sfactor">Scale Factor</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="sfactor" name="scale_factor" />
                    </div>
                </div>

                <div className="row">
                    <div className="col-25">
                        <label htmlFor="rpsec">Requests per second</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="rpsec" name="requests_per_second" />
                    </div>
                </div>
            </div>
        );
    }
}