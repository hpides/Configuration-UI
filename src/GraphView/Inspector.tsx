import React from 'react'
import './Inspector.css'
import NodeConfig from './Nodes/NodeConfig';

interface Props {
    activeConfig: any;
}

interface State {}

class Inspector extends React.Component<Props, State> {

    render() {
        let conf = this.props.activeConfig;
        let nodeName: String = "nothing selected";
        if (conf) {
            nodeName = conf.getName();
        }
        return (
            <div className="inspector">
                <h3>Inspector</h3>
                <p>{nodeName}</p>
            </div>
        );
    }
}

export default Inspector;