import React from 'react'
import './Testconfig.css'

export class Testconfig extends React.Component {
    render() {
        return (
            <div className="testconfig">
                <h1>Testconfig</h1>
                <label>Repeat</label>
                <input type="text" name="repeat" /><br />
                <label>Scale Factor</label>
                <input type="text" name="scale_factor" /><br />
                <label>Requests per second</label>
                <input type="text" name="requests_per_second" />
            </div>
        );
    }
}