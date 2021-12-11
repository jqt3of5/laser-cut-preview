import React from 'react';
import './SideBar.css'

export interface SideBarProps {
    items : string[]
    selected? : string | undefined
    onSelect : (item:string, index:number) => void
}
export default function SideBarMenu (props: SideBarProps) {
    return (<div className={"side-bar-menu"}>
            {props.items.map((item, i) => <div key={i} onClick={() => props.onSelect(item, i)} className={"side-bar-item" + (props.selected === item ? " side-bar-item-selected" : "")}>{item}</div>)}
    </div>)
}
