Part 3 — Database

Sirf 2 main tables rakho:

Products
---------
ProductId
ProductName
Description
Price
Stock
Category
IsActive
CreatedDate
Orders
---------
OrderId
CustomerId
OrderDate
TotalAmount
Status
PaymentStatus
CreatedDate

Aur:

OrderItems
----------
OrderItemId
OrderId
ProductId
Quantity
Price

Isse EF Core + relationships bhi practice ho jayenge.