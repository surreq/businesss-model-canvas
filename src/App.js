import React from 'react';
import './App.css';

import BMGrid from './BMGrid'
import * as jsPDF from 'jspdf'
import * as html2canvas from 'html2canvas';
import Cookies from 'js-cookie';
import Toast from './Toast'
export default class App extends React.Component {
  
  state = {edit:false, 
          showHeader: false, 
          showVersion: false, 
          header:"Business Model Name",
          version: "1.0",
          showToast: false,
          message: "",
          layout:  this.getInitialLayout(),
          texts: this.getInitialTexts()
        
        }

  constructor(props){
    super(props)
    this.handleHeaderChange = this.handleHeaderChange.bind(this);
    this.handleVersionChange = this.handleVersionChange.bind(this);
    this.saveToCookies = this.saveToCookies.bind(this);
    this.printDocument = this.printDocument.bind(this);
    this.saveAsImage = this.saveAsImage.bind(this);
    this.resetLayout = this.resetLayout.bind(this);
    this.handleLayoutChange = this.handleLayoutChange.bind(this);
  }

  componentDidMount(){

    try{
      let bmCookie = Cookies.get('business_model')
      if(bmCookie){
        bmCookie = JSON.parse(bmCookie)
        if(bmCookie.layout){
          this.updateLayout(bmCookie.layout)
          this.setState({texts: bmCookie.texts})
        }
      }
    }catch(error){
      console.error("could not parse cookie")
    }
  }

  updateLayout(newLayout){ //nasty fix
    this.setState({layout:[]}, function(){
      this.setState({layout:newLayout})
    })
  }

  getInitialLayout(){
    return [{i: 'Key Partners',        x: 0, y: 0, w: 2, h: 8},
    {i: 'Key Activities',       x: 2, y: 0, w: 2, h: 4},
    {i: 'Value Propositions',   x: 4, y: 0, w: 2, h: 8 },
    {i: 'Customer Relations',   x: 6, y: 0, w: 2, h: 4},
    {i: 'Customer Segments',    x: 8, y: 0, w: 2, h: 8},
    {i: 'Channels',             x: 6, y: 4, w: 2, h: 4},
    {i: 'Key Resources',        x: 2, y: 4, w: 2, h: 4},
    {i: 'Cost',                 x: 0, y: 8, w: 5, h: 4},
    {i: 'Revenue Streams',      x: 5, y: 8, w: 5, h: 4},
    ]
  }
  getInitialTexts(){
    return {
      'Key Partners':  `* Equinix (for data Center facilities)\n* Content Providers`,
      'Key Activities':      `* Plateform Dvpt`,
      'Value Propositions':  `* Manage Professionnal identity\n* Build Professionnal network\n* Identify & Reach the Right Talent\n* Reach the target Audience\n* Access to LinkedIn data base content via API's widgets`,
      'Customer Relations':  `* Internet Users\n* * Recruiters\n* * Advertisers & Marketers\n* Developers\n* Free offerings & Premium Subscriptions\n* Hiring Solutions\n* Marketing Solutions`,
      'Customer Segments':   `* Internet Users\n* Advertisers and Marketers\n* Developers\n* Recruiters`,
      'Channels':            `* LinkedIn Website\n* Field Sales`,
      'Key Resources':       `* LinkedIn Platform`,
      'Cost':                `* Web Hosting Costs\n* Marketing & Sales\n* Product Dvpt\n* General Administrative`,
      'Revenue Streams':     `* Free Offerings & Premium Subscriptions\n* Hiring Solutions\n* Marketing Solutions`
          }
  }

  handleTextChange(value, index){
    let texts = this.state.texts
    texts[index] = value
    this.setState({texts: texts})
  }

  handleLayoutChange(newLayout){
    this.setState({layout:newLayout})
    this.fit2Content()
  }
  saveAsImage() {
    this.setState({edit:false}, function(){
      let elementWidth = document.getElementById('divToPrint').offsetWidth
      let elementHeight = document.getElementById('divToPrint').offsetHeight
      html2canvas(document.getElementById('divToPrint'), {
        width: elementWidth,
        height: elementHeight
      }).then((canvas) => {

          const link = document.createElement('a');
          link.download =  'business_model.png';
          //console.log(canvas)
          link.href = canvas.toDataURL('image/png');
          link.click();

        })
    })
  }
    printDocument() {
    this.setState({edit:false}, function(){
      let elementWidth = document.getElementById('divToPrint').offsetWidth
      let elementHeight = document.getElementById('divToPrint').offsetHeight
      html2canvas(document.getElementById('divToPrint'), {
        width: elementWidth,
        height: elementHeight
      }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          let ratio = (elementHeight>elementWidth ? "p" : "l")
          const pdf = new jsPDF(ratio, "mm", "a4");
          var width = pdf.internal.pageSize.getWidth();
          var height = pdf.internal.pageSize.getHeight();
          let fitToWidth = (elementWidth / elementHeight) > (width / height)
          if(fitToWidth)
            pdf.addImage(imgData, 'JPEG', 0, 0, width, elementHeight*width/elementWidth);
          else 
            pdf.addImage(imgData, 'JPEG', 0, 0, elementWidth*height/elementHeight, height);
          pdf.save("business_model.pdf");
        })
    })
  }
  saveToCookies(){
    this.setState({edit:false})

    Cookies.set('business_model', {layout:this.state.layout, texts:this.state.texts})
    this.showToast("model saved")
  }
  resetLayout(){
    this.updateLayout(this.getInitialLayout())
    this.setState({texts:this.getInitialTexts()})
    this.showToast("model reset")
    
  }
  toggleChange = () => {
    this.setState({
      showHeader: !this.state.showHeader
    });
  } 
  toggleChangeEdit = () => {
    this.setState({
      edit: !this.state.edit
    });
  } 
  toggleChangeVersion = () => {
    this.setState({
      showVersion: !this.state.showVersion
    });
  } 

  handleHeaderChange(event){
    this.setState({
      header: event.target.value
    });
  }

  handleVersionChange(event){
    this.setState({
      version: event.target.value
    });
  }
  showToast (message) {    
    this.setState({
      showToast: true,
      message: message
    }, () => {
      setTimeout(() =>
        this.setState({ showToast: false })
    ,  3000)
    })
  }
  fit2Content(){
    let items = document.getElementsByClassName('react-grid-item')
    let parent = document.getElementById('divToPrint')
      let minX =parent.offsetWidth
      let minY = parent.offsetHeight
      let maxX = -1
      let maxY = -1
      for(var i=0;i<items.length;i++){
          let currMaxY = items[i].offsetTop + items[i].offsetHeight
          let currMaxX = items[i].offsetLeft + items[i].offsetWidth
          maxY = currMaxY > maxY ? currMaxY : maxY
          maxX = currMaxX > maxX ? currMaxX : maxX
          minY = items[i].offsetTop < minY ? items[i].offsetTop : minY
          minX = items[i].offsetLeft < minX ? items[i].offsetLeft : minX
      }
      parent.style.width = `${maxX-minX+20}px`
      parent.style.height = `${maxY-minY+20}px`
  }
  render() {

    return (
      <div className="main-app" >
        <div className="topbar">
            <h4>Business Model Canvas</h4>
            <button className="generate" onClick={this.resetLayout}>Reset</button>
            <button className="generate" onClick={this.saveAsImage}>Save as Image</button>
            <button className="generate" onClick={this.printDocument}>Save as PDF</button>
            <button className="cookify" onClick={this.saveToCookies}>Save to Cookies</button>
            <span>Edit</span>
            <div className="toggle-name">
                <input type="checkbox" id="toggly2" className="toggly" checked={this.state.edit} onChange={this.toggleChangeEdit}/>
                <label className="toggle-label" htmlFor="toggly2"><i></i></label>
            </div>
            <span>Header</span>
            <div className="toggle-name">
                <input type="checkbox" id="toggly" className="toggly" checked={this.state.showHeader} onChange={this.toggleChange}/>
                <label className="toggle-label" htmlFor="toggly"><i></i></label>
            </div>
            <span>Version</span>
            <div className="toggle-name">
                <input type="checkbox" id="toggly3" className="toggly" checked={this.state.showVersion} onChange={this.toggleChangeVersion}/>
                <label className="toggle-label" htmlFor="toggly3"><i></i></label>
            </div>
        </div>

        <div className="grid-parent mt4" id="divToPrint">
          {this.state.showHeader || this.state.showVersion ? (<div className="headers">
            {this.state.showHeader ? 
              (<div className="header-container">
                <input type="text" className="header-input" value={this.state.header} onChange={(e) => {this.handleHeaderChange(e)}}></input>
                </div>)
              :""}
            {this.state.showVersion ? 
              (<div className="version-container">
                Version: <input type="text" className="version-input" value={this.state.version}  onChange={(e) => {this.handleVersionChange(e)}}></input>
                </div>)
                :""}
            </div>)
            :""}
          <BMGrid style={{position:'relative'}} textChange={(value, index)=>this.handleTextChange(value, index)} texts={this.state.texts} changeLayout={(layout)=>this.handleLayoutChange(layout)} layout={this.state.layout} edit={this.state.edit} ></BMGrid>
        </div>
      
        <Toast
          message={this.state.message}
          visible={this.state.showToast}
        />
      </div>
    );
  }

}
