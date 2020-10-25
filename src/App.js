import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import CourseArea from './CourseArea';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allCourses: [],
      filteredCourses: [],
      subjects: [],
      interestAreas: [],
      cartCourses: {},
      completedCourses:{},
      completedRating:{},
      recommendedCourses: []
    };
  }



  componentDidMount() {
   this.loadInitialState()
  }

  async loadInitialState(){
    let courseURL = "http://mysqlcs639.cs.wisc.edu:53706/api/react/classes";
    let courseData = await (await fetch(courseURL)).json()

    let completedURL = "http://mysqlcs639.cs.wisc.edu:53706/api/react/students/5022025924/classes/completed";
    let completedData = await (await fetch(completedURL)).json()

    this.setState({allCourses: courseData, filteredCourses: courseData, subjects: this.getSubjects(courseData), interestAreas: this.getInterestAreas(courseData), completedCourses: completedData});
  }

  getInterestAreas(data) {
    let interestAreas = [];
    interestAreas.push("All");

    for (let i = 0; i < data.length; i++) {

      if (interestAreas.indexOf(data[i].subject.toLowerCase()) === -1) {
        interestAreas.push(data[i].subject.toLowerCase());
      }
      for (let j = 0; j < data[i].keywords.length; j++) {
        if (interestAreas.indexOf(data[i].keywords[j].toLowerCase()) === -1) {
          interestAreas.push(data[i].keywords[j].toLowerCase());
        }
      }
    }
    

    return interestAreas;
  }

  getSubjects(data) {
    let subjects = [];
    subjects.push("All");

    for(let i = 0; i < data.length; i++) {
      if(subjects.indexOf(data[i].subject) === -1)
        subjects.push(data[i].subject);
    }

    return subjects;
  }

  setCourses(courses) {
    this.setState({filteredCourses: courses})
  }

  addCartCourse(data) {
    let newCartCourses = JSON.parse(JSON.stringify(this.state.cartCourses))// I think this is a hack to deepcopy
    let courseIndex = this.state.allCourses.findIndex((x) => {return x.number===data.course})
    if (courseIndex === -1)
    {
      return 
    }

    if('subsection' in data) {
      if(data.course in this.state.cartCourses) {
        if(data.section in this.state.cartCourses[data.course]) {
          newCartCourses[data.course][data.section].push(data.subsection);
        }
        else {
          newCartCourses[data.course][data.section] = [];
          newCartCourses[data.course][data.section].push(data.subsection);
        }
      }
      else {
        newCartCourses[data.course] = {};
        newCartCourses[data.course][data.section] = [];
        newCartCourses[data.course][data.section].push(data.subsection);
      }
    }
    else if('section' in data) {
      if(data.course in this.state.cartCourses) {
        newCartCourses[data.course][data.section] = [];

        for(let i = 0; i < this.state.allCourses[courseIndex].sections[data.section].subsections.length; i++) {
          newCartCourses[data.course][data.section].push(this.state.allCourses[courseIndex].sections[data.section].subsections[i]);
        }
      
      
      }
      else {
        newCartCourses[data.course] = {};
        newCartCourses[data.course][data.section] = [];
        for(let i = 0; i < this.state.allCourses[courseIndex].sections[data.section].subsections.length; i++) { 
          newCartCourses[data.course][data.section].push(this.state.allCourses[courseIndex].sections[data.section].subsections[i]);
        }
      }
    }
    else {
      newCartCourses[data.course] = {};


      for (let i = 0; i < this.state.allCourses[courseIndex].sections.length; i++){
        newCartCourses[data.course][i] = [];

         for(let c= 0; c < this.state.allCourses[courseIndex].sections[i].subsections.length; c ++){
          newCartCourses[data.course][i].push(this.state.allCourses[courseIndex].sections[i].subsections[c]);
        }

      }


    }
    this.setState({cartCourses: newCartCourses});
  }

  removeCartCourse(data) {
    let newCartCourses = JSON.parse(JSON.stringify(this.state.cartCourses))

    if('subsection' in data) {
      newCartCourses[data.course][data.section].splice(newCartCourses[data.course][data.section].indexOf(data.subsection), 1);
      if(newCartCourses[data.course][data.section].length === 0) {
        delete newCartCourses[data.course][data.section];
      }
      if(Object.keys(newCartCourses[data.course]).length === 0) {
        delete newCartCourses[data.course];
      }
    }
    else if('section' in data) {
      delete newCartCourses[data.course][data.section];
      if(Object.keys(newCartCourses[data.course]).length === 0) {
        delete newCartCourses[data.course];
      }
    }
    else {
      delete newCartCourses[data.course];
    }
    this.setState({cartCourses: newCartCourses});
  }

  getCartData() {
    let cartData = [];

    for(const courseKey of Object.keys(this.state.cartCourses)) {
      let course = this.state.allCourses.find((x) => {return x.number === courseKey})

      cartData.push(course);
    }
    return cartData;
  }

  // recommender algorithm
  recommendCourse(course, value) {
    let rating = this.state.completedRating;
    rating[course.number] = value;
    this.setState({completedRating: rating});

    // completedRating: {{course number : rating}}
    
    // keep only highRating courses, find their interest areas
    let highRatingInterestAreas = [];
    for (const completed_course of Object.keys(this.state.completedRating)) {
      if (this.state.completedRating[completed_course] === "4" || this.state.completedRating[completed_course] === "5") {
        for (const course of this.state.allCourses) {
          if (course.number === completed_course) {
            if (highRatingInterestAreas.indexOf(course.subject.toLowerCase()) === -1) {
              highRatingInterestAreas.push(course.subject.toLowerCase());
            }
            for (const keyword of course.keywords) {
              if (highRatingInterestAreas.indexOf(keyword.toLowerCase()) === -1) {
                highRatingInterestAreas.push(keyword.toLowerCase());
              }
            }
          }
        }
      }
    }
    

    // get recommended courses from highRatingInterestAreas
    
    let recommend = [];
    for (const course of this.state.allCourses) {
      if (!this.state.completedCourses.data.includes(course.number)) { // only courses have not been taken
        if (highRatingInterestAreas.includes(course.subject.toLowerCase())) {
          recommend.push(course);
        }
        else {
          for (const keyword of course.keywords) {
            if (highRatingInterestAreas.includes(keyword)) {
              recommend.push(course);
              break;
            }
          }
        }
      }
    }
    

    this.setState({recommendedCourses: recommend});
    
  }

  render() {
    
    
    let completed = [];
    
    for (const one_course of (this.state.allCourses)) {
      
      for (var i = 0; i < this.state.completedCourses.data.length; i++) {
        
        if (this.state.completedCourses.data[i] === one_course.number) {
          completed.push(one_course);
        }
      }
    }

    let recommend_header = "Recommended Courses (" + this.state.recommendedCourses.length + ")";
    
    return (
      <>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />

        <Tabs defaultActiveKey="search" style={{position: 'fixed', zIndex: 1, width: '100%', backgroundColor: 'white'}}>
          <Tab eventKey="search" title="Search" style={{paddingTop: '5vh'}}>
            <Sidebar setCourses={(courses) => this.setCourses(courses)} courses={this.state.allCourses} subjects={this.state.subjects} interestAreas={this.state.interestAreas}/>
            <div style={{marginLeft: '20vw'}}>
              <CourseArea data={this.state.filteredCourses} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} completed={this.state.completedCourses}/>
            </div>
          </Tab>
          <Tab eventKey="cart" title="Cart" style={{paddingTop: '5vh'}}>
            <div style={{marginLeft: '20vw'}}>
              <CourseArea data={this.getCartData()} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} completed={this.state.completedCourses}/>
            </div>
          </Tab>
          <Tab eventKey="completed" title="Completed Courses" style={{paddingTop: '5vh'}}>
            <div style={{marginLeft: '20vw'}}>
              <CourseArea data={completed} completeMode="true" recommendCourse={(course, value) => this.recommendCourse(course, value)}/>
            </div>
          </Tab>
          <Tab eventKey="recommended" title={recommend_header} style={{paddingTop: '5vh'}}>
            <div style={{marginLeft: '20vw'}}>
              <CourseArea data={this.state.recommendedCourses} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} completed={this.state.completedCourses}/>
            </div>
          </Tab>
        </Tabs>
      </>
    )
  }
}

export default App;
