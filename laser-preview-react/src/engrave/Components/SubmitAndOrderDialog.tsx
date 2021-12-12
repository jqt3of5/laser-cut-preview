import React, {Component} from "react";

export interface SubmitAndOrderState
{

}

export interface SubmitAndOrderProps
{
    isShowing : boolean
}

export function SubmitAndOrderDialog (props: SubmitAndOrderProps)
{
    if (!props.isShowing)
    {
        return null
    }

    return <div>

    </div>
}
