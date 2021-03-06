import React, { Component } from 'react'
import './Consult.css'
import styled from 'styled-components'
import cookie from 'react-cookies'
import { GET, POST, PUT, DELETE } from './ApiCall'
import AppointementsCalendar from './AppointementsCalendar'
import DatePicker from "react-datepicker"
import 'moment-timezone';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'
import VueClockPicker from 'vue-clock-picker'
import { ButtonGroup } from 'react-bootstrap'


const moment = require('moment');

const Separator = styled.div`
    height: 3px;
    margin-top: -3px;
    width: 0%
    transition: .5s;
    align-self: center;
`
const LiY = styled.div`
background: yellow;
`
const LiR = styled.div`
background: red;
`
const Ul = styled.div`
`
const Links = styled.div`
    padding-right: 15%;
    display: flex;
    flex-direction: row;
    height: 100%;
    align-items: center;
`

const Navbar = styled.div`
    width: 100%;
    height: 70px;
    display: flex;
    box-shadow: 0px 0px 39px 9px rgba(214,214,214,0.46);
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    img {
        height: 70px;
        padding-left: 15%;
    }


`

const Link = styled.div`
    height: 100%;

    a {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        color: inherit;
        text-decoration: none;
        width: 130px;
        height: 100%;
        transition: .2s;
        text-align: justify;
        font-weight: bold;
        color: #00A54F;

    }

    a:hover {
        color: white;
        background-color: #00A54F;
        box-shadow: inset 0px 0px 19px -8px rgba(0,0,0,1);
    }

    &:hover ${Separator} {
        background-color: #1E591E;
        width: 100%;
      }

`

const CalendarArea = styled.div`
      grid-area: AppointementsCalendar;
      max-height: 100%;
      width:100%;
`

class Consult extends Component {
    constructor (props) {
        super(props)

        this.state={
            allClinics: this.getAllClinics(),
            clinicId: null,
            clinicSelected:null,
            appointment : [],
            date : new Date(),
            slots: this.generateSlots(),
            datePicked:null,
            appointmentType:null,
            slotSelected:null,
            selectedDate:null,
            dayPickByuser:null,
            patientEmail: '',
            clinicName:null,
            dayOfWeek:null
        }
    }

    getAllClinics(){
        GET('/api/clinics/')
               .then( res =>  res.json())
               .then( res => {
                  if (res.success) {
                    this.setState({allClinics:res.data.clinics})
                  } else 
                    this.setState({allClinics:[]})
                }
            ).catch(e => {
        })
    }
    optionSelectedFromDropdown(item){
      
        for(var i=0;i<this.state.allClinics.length;i++){
            if(this.state.allClinics[i]['name'] == item){
                this.setState({clinicSelected :this.state.allClinics[i]})
                this.setState({clinicId :this.state.allClinics[i]['_id']})
            }
        }
        this.setState({clinicName: item})
        this.getAllAppointment()
        if(this.state.dayOfWeek != null){
            this.createCalendarAvailability(this.state.dayOfWeek)
        }
    }
    

    generateSlots(lowEnd=0, highEnd=36*5){
        let list = [];
        for (let i = lowEnd; i < highEnd; i++) {
            let slot = {id: i,slots:[]}
            list.push(slot);

        }
        return list;
    }

    // Method that will fetch all existing appointments in a specific clinic
    getAllAppointment(){
        cookie.load('session');
          GET('/api/clinics/'+this.state.clinicId+'/appointments/')
               .then( res =>  res.json())
               .then( res => {
                  if (res.success) {
                    this.setState({appointment:res.data.appointments})
                  } else 
                    this.setState({appointment:[]})
                }
            ).catch(e => {
        })
    }



    nurseMakeAppointment(clinicId,patientId,date,blockIds,isAnnual,paymentInfo){
        POST('/api/appointments/', {
            clinicId: clinicId,
            patientId: patientId,
            date: date,
            blockIds: blockIds,
            isAnnual: isAnnual,
            paymentInfo:paymentInfo
        })
           .then( res =>  res.json())
           .then( res => {
                if (res.success) {
                    alert("Appointment Succesfully Created!!")
                    this.setState({appointment:res.data.appointment})
                    window.location.reload()
                }
                else{
                    alert("Appointment Not Created!! Make sur you choose an available slot ")}
            })
    }

    sendToCart(patientObj){

        PUT('/api/patients/'+patientObj._id,{ ...patientObj})
                .then( res =>  res.json())
                .then( res => {
                        if (res.success) {
                            alert("Appointment Saved to Cart")
                        }
                        else{
                            alert("A probleme occured when saving to your cart / Please try again")
                        }
                    })
                    .catch(e => {
                })
    }

    // Method that will allow patients to create an appointment
    createAppointment(){
        if(this.state.datePicked !=null && this.state.appointmentType !=null && this.state.slotSelected !=null && this.state.clinicId !=null){

            const user = cookie.load('session')
            var blockid = []
            var isannual = true

            if(this.state.appointmentType == "appointmentType60"){
                blockid.push(this.state.slotSelected)
                blockid.push(this.state.slotSelected + 1)
                blockid.push(this.state.slotSelected + 2)
            }else{
                blockid.push(this.state.slotSelected)
                isannual = false
            }

            var patientEmail;
            if(user.type=="nurse"){
                patientEmail = this.state.patientEmail
            }else{
                patientEmail = user.email
            }
            

            GET('/api/patients/email/'+patientEmail)
                .then(res => res.json())
                .then(res => {
                    if(res.success){
                    
                    const patientObj = {...res.data.patient}
                    const patientId = patientObj._id
                    let appointmentObj = {
                        clinicId: this.state.clinicId,
                        patientId: patientId,
                        date: this.state.datePicked,
                        blockIds: blockid,
                        isAnnual: isannual,
                        paymentInfo:{cardNumber:1}
                    }

                    if(user.type=="nurse"){
                        const isUpdating = this.props.history.location.state && this.props.history.location.state.updateAppointment

                        if(isUpdating){
                            this.props.history.push("/nurse", {newAppointment: appointmentObj, info: this.props.history.location.state.info} )
                        }else {
                            this.nurseMakeAppointment(this.state.clinicId,patientId,this.state.datePicked,blockid,isannual,{cardNumber:1})
                        }

                    }else{
                        
                        if(patientObj.cart == undefined){
                            patientObj.cart = []
                        }

                        const isUpdating = this.props.history.location.state && this.props.history.location.state.updateAppointment

                        
                        if(isUpdating){
                            this.props.history.push("/patient", {newAppointment: appointmentObj, info: this.props.history.location.state.info} )
                        }else {
                            patientObj.cart.push(appointmentObj)
                            this.sendToCart(patientObj)
                        }
                    }
                }else{
                    alert("This email does not figure in our database!!!")
                }
                })
        }
        else{
            alert("You did not pick a day/Type/Slot")
        }

    }
    // Method that will, based on patient's date selection, determine the first day in the same week
    filterCalendarByDate(day) {

        if(this.state.clinicId != null){
        var dayCurrent = day.getDay()

        var firstDayOfWeek = day;
        var dayOfWeek =[]

        var dayGoodFormat = moment(day).format("YYYY-MM-DD");

        this.setState({datePicked:dayGoodFormat});
        this.setState({date:dayGoodFormat});


        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - dayCurrent);
        var firstDay = moment(firstDayOfWeek).format("YYYY-MM-DD");
        var dayOfWeek = []

        dayOfWeek.push(firstDay)
        for(let day = 1; day < 7; day++){

            firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 1);
            firstDay = moment(firstDayOfWeek).format("YYYY-MM-DD");
            dayOfWeek.push(firstDay)

        }
        this.setState({dayOfWeek:dayOfWeek})
        this.createCalendarAvailability(dayOfWeek)
    }
    else{
        alert("Choose a Clinic First")
    }
    }

    getYearOfDate(date){
        return true
    }

    createCalendarAvailability(arrOfWeek) {

        var list = [];
        for (let i = 0; i < 180; i++) {
            var slot = {id: i,slots:[]};

            if(i<36){
                slot.date=arrOfWeek[1];
                list.push(slot);
            }
            if(i>=36 && i<72){
                slot.date=arrOfWeek[2];
                list.push(slot);
            }
            if(i>=72 && i<108){
                slot.date=arrOfWeek[3];
                list.push(slot);
            }
            if(i>=108 && i<144){
                slot.date=arrOfWeek[4];
                list.push(slot);
            }
            if(i>=144 && i<180){
                slot.date=arrOfWeek[5];
                list.push(slot);
            }

        }

        for (let i = 0; i < this.state.appointment.length; i++) {
            if(this.state.appointment[i].date > arrOfWeek[0] && this.state.appointment[i].date < arrOfWeek[6]){
                var dayOfTheAppointment = parseInt(moment(this.state.appointment[i].date).day())-1;
                for (let x = 0; x< this.state.appointment[i].blockIds.length; x++) {
                    list[this.state.appointment[i].blockIds[x]+(36*dayOfTheAppointment)].slots.push(this.state.appointment[i])
                }
            }
        }
        for(let element=0; element<list.length; element++){
            list[element]['MaxSlots']= this.state.clinicSelected.rooms.length
        }
        this.setState({slots: list});
    }

    handleSlotPicked(slot,date){
        this.setState({slotSelected:slot});
        this.setState({datePicked:date});
        this.setState({date:date})
    }

    componentWillMount() {
        //this.getAllAppointment()
        //this.getInfos();
        this.setState({allClinics: this.getAllClinics()})
        
        //this.setState({appointment: this.getAllAppointment()})
       
    }


    render() {
    const session = cookie.load('session')
    const options = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]
    const defaultOption = options[0]

    const isUpdating = this.props.history.location.state && this.props.history.location.state.updateAppointment
    

    const nameClinics = []
    if(this.state.allClinics != undefined){

     for(var i=0;i<this.state.allClinics.length;i++){
           nameClinics.push(this.state.allClinics[i]['name'])
      }
    }
    

    return (

    
    <React.Fragment>


     <Navbar>
         <a href="/"> <img alt="" src={require('./res/logo.png')}/></a>
            {!session ? <Links>
                <Link>
                    <a href="/login">Sign in</a>
                    <Separator/>
                </Link>
                <Link>
                    <a href="/SignUp">Sign up</a>
                    <Separator/>
                </Link>
            </Links> :
            <Links>
                { session.type === "patient" ?
                    <Link color="#FF6666" underColor="black">
                        <a href="/cart">Cart</a>
                        <Separator/>
                    </Link>:
                    <Link></Link>
                }
                <Link onClick={ _ => cookie.remove('session')} color="#FF6666" underColor="black">
                    <a href="/">Log out</a>
                    <Separator/>
                </Link>
            </Links>}
        </Navbar>

    <div className="color">

      {session ?

        <React.Fragment>
            <br/>
            <div className="container2">

                {
                    session.type === "nurse"?
                    <div>
                        <label>Please write a patient email</label>
                        <input onChange={ e => this.setState({patientEmail:e.target.value})}></input>
                    </div>
                    : null
                }
                <label>Please choose a clinic</label>

                <Dropdown options={nameClinics} value={this.state.clinicName} onChange={e =>this.optionSelectedFromDropdown(e.value)}  placeholder="Select an option" />
                <br />
                
                <label>{isUpdating ? "Pick a new appointment date" : "Pick a consultation date"}</label>
                <br />
                <DatePicker className='date' selected={this.state.date} onChange={e => this.filterCalendarByDate(e) } />
                <br />
                <br />
                <p>{isUpdating ? "Pick a new appointment type " : "Pick a consultation type "}</p>
                <RadioGroup onChange={value=>this.setState({appointmentType:value})} >
                    <RadioButton value="appointmentType20">20 min walk-in</RadioButton>
                    <RadioButton value="appointmentType60">1h annual check-up</RadioButton>
                </RadioGroup>

                <p>Choose the starting slot in the calendar</p>

                <button className="button" id = "appointmentSave" onClick={ _ => this.createAppointment() }> Book Appointment</button>
            
                { this.state.clinicSelected !=null ?
            <div>
                <br />
                
                <label>Legend</label>
                <Ul>
                    <LiY> There is 1-{this.state.clinicSelected['rooms'].length} slots for booking available
                    </LiY>
                    <LiR> There is no slots for booking available 
                    </LiR>
                </Ul>
            </div>
            :null}

            </div>
            <br/>
            <CalendarArea>
                <AppointementsCalendar onSlotClicked={ (slot,date) => this.handleSlotPicked(slot,date) } slots={this.state.slots} style={{height: 600}}/>
            </CalendarArea>


        </React.Fragment>
        :
        <React.Fragment>

            <div className="container2">
                <p>Find a Consultation in minutes!</p>
            </div>

            <div className="container">
                <span>You need to be registered to the system to be able to consult a doctor !</span>
                <br/>
                <a href="/SignUp">Sign up now</a>
            </div>
        </React.Fragment>
        }

    </div>
    </React.Fragment>
        );
    }
}

export default Consult;
