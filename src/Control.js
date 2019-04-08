import React from 'react'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';


export default class Control extends React.Component {
  constructor() {
    super();
    this.state = {
      isComFirst: false,
      isComSecond: true
    }
  }

  // THIS PART IS NOT COMPLETED AT ALL
  handleClick() {
    this.setState({
      isComFirst: !this.state.isComFirst
    });

    console.log("clicked!");
  }

  render() {
    return (

      <div className="settingControl">
        <ButtonGroup aria-label="Board control">
          <Button variant="primary" type="submit" value="Submit" >一手前</Button>
          <Button variant="primary" type="submit" value="Submit" >一手先</Button>
        </ButtonGroup>

        <div className="settings alert alert-light">
          {/* <form>

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
        </form> */}
          {/* <form>
          <div>
            候補手評価値表示：<input type="checkbox" id="myCheck" onClick=""></input>
          </div>
        </form> */}
          <Button variant="danger" type="submit" value="Submit" >新規</Button>

        </div>
      </div>
    )
  }
}