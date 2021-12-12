import React, {useEffect, useState} from "react";
import {GraphicGroupDetail, SubGraphicDetail} from "./GraphicDetails";
import {SvgSubGraphic} from "../../common/dto";
import {EngraveActionType} from "../Views/EngraveAppState";
import {UploadNewGraphicProps} from "./UploadNewGraphicDialog";

export interface ModalDialogProps
{
    isShowing : boolean
    title: string
    onCancel : () => void
    children : any
}
export function ModalDialog(props: ModalDialogProps)
{
    if (!props.isShowing)
    {
        return null
    }
    return <div className={"modal"}>
        <div className={"modal-dialog"}>
            <div className={"modal-dialog-header bottom-separator"}>
                <label>{props.title}</label>
                <span className="close textButton" onClick={props.onCancel}>&times;</span>
            </div>
            <div className={"modal-content-container"}>
                {props.children}
            </div>
        </div>
    </div>
}
