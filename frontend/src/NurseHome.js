import React, { Component } from 'react'
import './Consult.css'
import styled from 'styled-components'
import cookie from 'react-cookies'
import { GET, POST, PUT } from './ApiCall'
import 'moment-timezone';
import 'react-dropdown/style.css'
import AppointmentItem from './AppointmentItem'
import swal from 'sweetalert2'    

const moment = require('moment');

const Separator = styled.div`
    height: 3px;
    margin-top: -3px;
    width: 0%
    transition: .5s;
    align-self: center;
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

class NurseHome extends Component {
    constructor (props) {
        super(props)

        this.state={
            cart: [],
        }

        this.mounted()
    }



    generateInfoByPatientCart(cart){
        if(cart == undefined){
            alert("You did not save an appointment at this time")
        }else{
            this.setState({cart}) // <- The real one when Ribal fix the issue
        }
    }



    async mounted() {
        const {value: email} = await swal.fire({
            title: 'Enter a Patient email',
            input: 'text',
            showCancelButton: true,
            inputValidator: async (value) => {
                if(!value) return "Please enter an email";

                const response = await GET(`/api/patients/email/${value}`).then( res =>  res.json())
                    .then( res => {
                        return res;
                    }).catch(e => "Network error" )
                    
                console.log('user',{response})

                if (!response.success) {
                    return `Patient doesn't exist!`
                } else {
                    this.setState({patientId: response.data.patient._id, email: value})
                }
            }
          })

        console.log('pat', this.state.patientId)

        GET(`/api/patients/${this.state.patientId}/appointments`)
            .then( res =>  res.json())
            .then( res => {
                console.log('appts',{res})
                this.generateInfoByPatientCart(res.data.appointments)
            }
            ).catch(e => {

            })
    }


    render() {
    const session = cookie.load('session')
    const {cart} = this.state

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
                <Link onClick={ _ => window.location.reload()} color="#FF6666" underColor="black">
                    <a href="/nurse">Search</a>
                    <Separator/>
                </Link>
                <Link onClick={ _ => cookie.remove('session')} color="#FF6666" underColor="black">
                    <a href="/">Log out</a>
                    <Separator/>
                </Link>
            </Links>}
        </Navbar>

        <div class= "logged-body">
            {this.state.email? <h1>Appointments for {this.state.email}</h1> : null}

            {cart.map(item => <AppointmentItem history={this.props.history} cartInfo ={cart} info={item}  date={item.date} time={item.blockIds} isAnnual={item.isAnnual}/>)}
        </div>



    </React.Fragment>
        );
    }
}

export default NurseHome;
