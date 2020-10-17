import React from 'react';
import './App.css';
import Course from './Course';
import TakenCourse from './TakenCourse';

class CourseArea extends React.Component {
  getCourses() {
    let courses = [];

    // Completed Course Tab
    if(this.props.completeMode) {
      for(let i = 0; i < this.props.data.length; i++){
        courses.push (
          <TakenCourse key={i} data={this.props.data[i]} courseKey={this.props.data[i].number} recommendCourse={(course, value) => this.props.recommendCourse(course, value)}/>
        )
      }
    }


    else if (Array.isArray(this.props.data)){
      for(let i =0; i < this.props.data.length; i++){
        courses.push (
          <Course key={i} data={this.props.data[i]} courseKey={this.props.data[i].number} addCartCourse={(data) => this.props.addCartCourse(data)} removeCartCourse={(data) => this.props.removeCartCourse(data)} cartCourses={this.props.cartCourses} completed={this.props.completed}/>
        )
      }
    }
    else{
      for(const course of Object.keys(this.props.data)){
        courses.push (
          <Course key={this.props.data[course].number} data={this.props.data[course]} courseKey={this.props.data[course].number} addCartCourse={(data) => this.props.addCartCourse(data)} removeCartCourse={(data) => this.props.removeCartCourse(data)} cartCourses={this.props.cartCourses} completed={this.props.completed}/>
        )
      }
    }

    return courses;
  }

  shouldComponentUpdate(nextProps) {
    return (JSON.stringify(this.props) !== JSON.stringify(nextProps))
  }

  render() {
    return (
      <div style={{margin: 5, marginTop: -5}}>
        {this.getCourses()}
      </div>
    )
  }
}

export default CourseArea;
