using System;
using Microsoft.VisualBasic;

namespace Core.Data
{
    public record Customer(
        string name,
        string email,
        string phone,
        string address1,
        string address2,
        string city,
        string state,
        string country,
        string zipcode);

    public enum OrderStatus
    {
        Ordered,
        Processing,
        Processed,
        Shipped
    }
    public record Order(
        Customer customer,     
        string projectGuid,
        DateTime orderedDate,
        OrderStatus status,
        float cost,
        bool paid
        );
}