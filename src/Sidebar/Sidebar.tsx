import React from 'react';
import './Sidebar.css'

class Sidebar extends React.Component {
    render() {
        return (
            <div className="sidebar">
                <a href="#">Data Generation</a>
                <a href="#">Data Generation</a>
                <a href="#">Delay</a>
            </div>
        );
    }
}

export default Sidebar;