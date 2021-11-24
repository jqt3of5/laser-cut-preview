import './PrettyButton.css'

class PrettyButtonProps {
   constructor(
       public children : any,
       public className : string
   ) {
   }
}

export function PrettyButton(props : PrettyButtonProps) {
   return <button className={"pretty-button " + props.className}>{props.children}</button>
}