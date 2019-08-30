import React from 'react';
import './App.css';

function generateRandom(len) {
    const ascii = [];
    for (let i = 0; i < len/2; i++) {
        ascii.push(Math.floor(Math.random() * 94
        ) + 33);
    }
    ascii.push(...ascii);
    // Adapting the Durstenfield shuffle algorithm I found online
    for (let i = len - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ascii[i], ascii[j]] = [ascii[j], ascii[i]];
    }

    return String.fromCharCode(...ascii);
}


class Board extends React.Component {
    constructor(props) {
        super(props);
        // generateRandom(props.len)
        this.state = {
            cards: generateRandom(props.len)
        };
    };

    generateBoard(){

    }
    render(){
        return (
            <table>
                <tbody>
                    <tr>
                        <Square isHidden={true} value={this.state.cards[0]}/>

                        <Square isHidden={true} value={this.state.cards[1]}/>
                    </tr>
                    <tr>
                        <Square isHidden={true} value={this.state.cards[2]}/>

                        <Square isHidden={true} value={this.state.cards[3]}/>
                    </tr>
                </tbody>
            </table>
        )
    }

}

class Square extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            isHidden: props.isHidden,
            value: props.value
        }
    }

    toggleHidden() {
        this.setState({
            isHidden: !this.state.isHidden
        })
    }

    render() {
        return (
            <td className="card" onClick={this.toggleHidden.bind(this)} >
                {this.state.isHidden && this.props.value}
            </td>
        )
    }
}




export default Board;
