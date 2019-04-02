import React from 'react'
// import {Button, ButtonToolbar, Form} from 'react-bootstrap';


export default class Control extends React.Component {
  constructor(){
    super();
    this.state ={
      isComFirst: false,
      isComSecond: true
    }
  }

  // THIS PART IS NOT COMPLETED
  handleClick(){
    this.setState({
      isComFirst: !this.state.isComFirst
    });

    console.log("clicked!");
  }

  render() {
    return (

      <div className="radioButton">
        <form>
        
        先手: 
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="option1"
              checked={!this.state.isComFirst}
              onClick=""
            />Human
          </label>
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="option1"
              checked={this.state.isComFirst}
              onClick=""
            />Com
          </label>
      
        </form>
        <form>
        後手: 
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="Human"
              checked={!this.state.isComSecond}
              onClick=""
            />Human
          </label>
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="com"
              checked={this.state.isComSecond}
              onClick=""
            />Com
          </label>
          <div>
            候補手評価値表示：<input type="checkbox" id="myCheck" onClick=""></input>
          </div>
          <div>
            <button type="submit" value="SaveSetting">設定保存</button>
          </div>
          </form>
      </div>
    )
  }
}