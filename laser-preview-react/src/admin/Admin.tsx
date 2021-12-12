import React, {useState} from 'react';
import './Admin.css';
import SideBarMenu from "./Components/SideBarMenu";
import ProjectDetailView from "./Views/ProjectDetailView";
import ProjectList from "./Views/ProjectList";
import MaterialsList from "./Views/MaterialsList";
import {Order, OrderStatus} from "../common/dto";

function Admin() {
    function onOrderSelected(order : Order)
    {

    }

    const data = React.useMemo<Order[]>(() => [
        {
            customer: {
                name: "John Todd",
                email: "jqt3of5@gmail.com",
                streetAddress: "33423 woodhouse",
                city: "Saratoga springs",
                state: "UT",
                country: "USA",
                zipcode: "84045",
                phoneNumber: "234-234-23423",
            },
            cost: 123.34,
            orderId: "1234567",
            status: OrderStatus.Ordered,
            projectGuid: "1234qwerty",
            orderedDate: Date.now()
        }
        ],[])

    const [selected, setSelected] = useState("Projects")

    let currentView = null
    switch(selected)
    {
        case "Projects":
            currentView = <ProjectList orders={data} onOrderSelected={onOrderSelected}></ProjectList>
            break;
        case "Materials":
            currentView = <MaterialsList></MaterialsList>
            break;
        case "Users":
            break;
        case "Settings":
            break;
        case "Analytics":
            break;
    }
  return (
    <div className="App">
        <header className="App-header">
            <div>CraftCloset Admin</div>
        </header>
        <div className={"App-content"}>
            <div className={"App-side-bar"}>
                <div className={"side-bar-header"}>
                </div>
                <SideBarMenu selected={selected} items={["Projects", "Materials", "Users", "Analytics"]} onSelect={(item, index) => setSelected(item)}/>
            </div>
            <div className={"App-main-view"}>
                {currentView}
            </div>
        </div>
    </div>
  );
}

export default Admin;
