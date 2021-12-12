import React, {Component, Dispatch, SyntheticEvent, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {EngraveActionType, EngraveAppAction} from "../Views/EngraveAppState";
import {Order} from "../../common/dto";
import axios from "axios";
import './SubmitandOrderDialog.css'

export interface SubmitAndOrderState
{
   order : Order
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
    }

    function submitOrder() {
        axios.post(process.env.REACT_APP_API + "/" + props.projectGuid + "/order", state).then(response => {

        })
    }

    let [state, setState] = useState<SubmitAndOrderState>({
       order: {
           customer: {
               streetAddress: "",
               name: "",
               city: "",
               state: "",
               country: "",
               email: "",
               phoneNumber:"",
               zipcode: ""
           },
           cost: 0,
           projectGuid: props.projectGuid,
           status: null,
           orderGuid: null,
           orderedDate: null
       }
    })

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
           <div className={"customer-address"}>
               <input onChange={handleChange} name={"name"} value={state.order.customer.name} placeholder={"Name*"}></input>
               <input onChange={handleChange} name={"email"} value={state.order.customer.email} placeholder={"Email*"}></input>
               <label className={"cost-label"}>Estimated cost: {"$12.34"}</label>
           </div>
       </Modal.Body>
       <Modal.Footer>
           <label className={"footer-label"}>Payment and shipping instructions will be sent to your email. Order will be fulfilled upon reciept of payment.</label>
           <Button variant={"primary"} onClick={submitOrder}>Submit</Button>
       </Modal.Footer>
    </Modal>
}
