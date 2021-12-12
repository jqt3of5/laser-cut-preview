import React from 'react';
import {Column, useRowSelect, useTable} from "react-table";
import '../../common/common.css'
import './ProjectList.css'
import {Order} from "../../common/dto";


export interface ProjectListProps{
    orders : Order[]
    onOrderSelected : (order:Order) => void
}
export default function ProjectList(props: ProjectListProps) {
    const columns : Column<Order>[] = React.useMemo(
        () => [
            {
                Header: "Name",
                accessor: "name",
            },
            {
                Header: "Project Value",
                accessor: "cost"
            },
            {
                Header:"Order Number",
                accessor:"orderid"
            },
            {
                Header: "Status",
                accessor:"status"
            },
            // {
            //     Header: "Open Project",
            //     accessor:"projectUrl"
            // },

        ], [])
    const useTableInstance = useTable({columns: columns, data: props.orders}, useRowSelect)
    return <div className={"project-list"}>
        <div className={"project-list-search"}>

        </div>
        <table className={"fill"} {...useTableInstance.getTableProps()}>
            <thead>
            {
                useTableInstance.headerGroups.map( hGroup => (
                   <tr {...hGroup.getHeaderGroupProps()}>
                       {
                            hGroup.headers.map(column => (
                               <th {...column.getHeaderProps()}>
                                   {column.render('Header')}
                               </th>
                            ))
                       }
                   </tr>
                ))
            }
            </thead>
            <tbody {...useTableInstance.getTableBodyProps()} >
            {
                useTableInstance.rows.map(row => {
                    useTableInstance.prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {
                                row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>
                                        {cell.render('Cell')}
                                    </td>
                                ))
                            }
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
    </div>
}