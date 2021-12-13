import React, {Dispatch, SyntheticEvent, useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {EngraveActionType, EngraveAppAction} from "../Views/EngraveAppState";
import {Customer} from "../../common/dto";
import axios from "axios";
import './SubmitandOrderDialog.css'

enum Stage  {
    Info,
    Confirmed
}
export interface SubmitAndOrderState
{
   stage : Stage
    projectGuid : string
    orderId : string
    customer : Customer
}

export interface SubmitAndOrderProps
{
    isShowing : boolean
    projectGuid : string
    dispatch : Dispatch<EngraveAppAction>
}

export function SubmitAndOrderDialog (props: SubmitAndOrderProps)
{
    function handleChange(event : SyntheticEvent<HTMLInputElement>) {
        switch(event.currentTarget.name)
        {
            case "name":
                setState({...state, customer: {...state.customer, name: event.currentTarget.value}})
                break;
            case "email":
                setState({...state, customer: {...state.customer, email: event.currentTarget.value}})
                break;
        }
    }

    function submitOrder() {
        axios.post(process.env.REACT_APP_API + "/project/" + props.projectGuid + "/order", state.customer).then(response => {
            //TODO: We might get an error from the server
            if (response.data.error !=="")
            {
                return
            }
            setState({...state, stage: Stage.Confirmed, orderId: response.data.orderId})
        })
    }

    let [state, setState] = useState<SubmitAndOrderState>({
        stage: Stage.Info,
        projectGuid: props.projectGuid,
        orderId: "",
        customer: {
           streetAddress: "",
           name: "",
           city: "",
           state: "",
           country: "",
           email: "",
           phoneNumber:"",
           zipcode: ""
       }
    })

    useEffect(() => {
       setState(state => { return {...state, stage: Stage.Info}})
    }, [props.isShowing])

    if (!props.isShowing)
    {
        return null
    }

    return <Modal show={props.isShowing} onHide={() => props.dispatch({type: EngraveActionType.OrderSubmited})}>
       <Modal.Header closeButton>
           <Modal.Title>
               <label>Submit your order</label>
           </Modal.Title>
       </Modal.Header>
       <Modal.Body>
           {state.stage===Stage.Info &&
               <div className={"customer-address"}>
                   <input onChange={handleChange} name={"name"} value={state.customer.name} placeholder={"Name*"}/>
                   <input onChange={handleChange} name={"email"} value={state.customer.email} placeholder={"Email*"}/>
                   <label className={"cost-label"}>Estimated cost: {"$12.34"}</label>
               </div> }
           {state.stage===Stage.Confirmed &&
                <div>
                    <label>Order confirmed. Order# {state.orderId}</label>
                </div>
           }
       </Modal.Body>
       <Modal.Footer>
           <label className={"footer-label"}>Payment and shipping instructions will be sent to your email. Order will be fulfilled upon reciept of payment.</label>
           {state.stage===Stage.Info && <Button variant={"primary"} onClick={submitOrder}>Submit</Button>}
           {state.stage===Stage.Confirmed && <Button variant={"primary"} onClick={() => props.dispatch({type: EngraveActionType.OrderSubmited})}>Finish</Button>}
       </Modal.Footer>
    </Modal>
}
