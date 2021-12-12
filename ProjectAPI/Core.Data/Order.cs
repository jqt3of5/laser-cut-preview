using System;
using Microsoft.VisualBasic;

namespace Core.Data
{
    public record Customer(
        string name,
        string email,
        string phone,
        string streetAddress,
        string city,
        string state,
        string country,
        string zipcode);

    public enum OrderStatus
    {
        Ordered,
        Paid,
        Processing,
        Shipped,
        Closed
    }
    public record Order(
        Customer customer,     
        string orderGuid,
        string projectGuid,
        DateTime orderedDate,
        OrderStatus status,
        float cost,
        bool paid
        );
}