import React from 'react';
import './App.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Dropdown } from 'react-bootstrap';

class TakenCourse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      rating: 'No Rating'
    }
    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    return (
      <Card style={{width: '33%', marginTop: '5px', marginBottom: '5px'}}>
        <Card.Body>
          <Card.Title>
            <div style={{maxWidth: 250}}>
              {this.props.data.name}
            </div>
            {this.getExpansionButton()}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{this.props.data.number} - {this.getCredits()}</Card.Subtitle>
          {this.getDropdown()}
          {this.getDescription()}
        </Card.Body>
      </Card>
    )
  }


  getDropdown() {
      return (
      <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        {this.state.rating}
      </Dropdown.Toggle>
    
      <Dropdown.Menu>
        <Dropdown.Item onSelect={()=>this.handleSelect("No Rating")}>No Rating</Dropdown.Item>
        <Dropdown.Item onSelect={()=>this.handleSelect("1")}>1</Dropdown.Item>
        <Dropdown.Item onSelect={()=>this.handleSelect("2")}>2</Dropdown.Item>
        <Dropdown.Item onSelect={()=>this.handleSelect("3")}>3</Dropdown.Item>
        <Dropdown.Item onSelect={()=>this.handleSelect("4")}>4</Dropdown.Item>
        <Dropdown.Item onSelect={()=>this.handleSelect("5")}>5</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>)
  }

  handleSelect(value) {
      this.setState({rating: value});
      
      this.props.recommendCourse(this.props.data, value);
  }

  setExpanded(value) {
    this.setState({expanded: value});
  }

  getExpansionButton() {
    let buttonText = '▼';
    let buttonOnClick = () => this.setExpanded(true);

    if(this.state.expanded) {
      buttonText = '▲';
      buttonOnClick = () => this.setExpanded(false)
    }

    return (
      <Button variant='outline-dark' style={{width: 25, height: 25, fontSize: 12, padding: 0, position: 'absolute', right: 20, top: 20}} onClick={buttonOnClick}>{buttonText}</Button>
    )
  }

  getDescription() {
    if(this.state.expanded) {
      return (
        <div>
          {this.props.data.description}
        </div>
      )
    }
  }

  getCredits() {
    if(this.props.data.credits === 1)
      return '1 credit';
    else
      return this.props.data.credits + ' credits';
  }
}

export default TakenCourse;
