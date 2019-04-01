import React from 'react'

export default class Control extends React.Component {
  constructor(){
    super();
    this.state ={
      isComFirst: false,
      isComSecond: true
    }
  }
  render() {
    return (
      <div className="radioButton">
        
        <form>
        先手：
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="opetion1"
              checked={!this.state.isComFirst}
            />Human
          </label>
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="option1"
              checked={this.state.isComFirst}
            />Com
          </label>
        </form>
        <form>
        後手：
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="Human"
              checked={!this.state.isComSecond}
            />Human
          </label>
          <label>
            <input
              type="radio"
              name="playerOrder"
              value="com"
              checked={this.state.isComSecond}
            />Com
          </label>
        </form>
          <div>
            候補手評価値表示：<input type="checkbox" id="myCheck" onclick=""></input>
          </div>
          <div>
            <input type="button" value="保存"/>
          </div>
      </div>
    )
  }
}