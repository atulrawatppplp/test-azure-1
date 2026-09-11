-- Mini Order Management System — Azure SQL schema
-- Products lives in the Product Service database; Orders and OrderItems live in the Order Service database.

IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Products
    (
        ProductId   UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Products PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        ProductName NVARCHAR(200)    NOT NULL,
        Description NVARCHAR(1000)   NOT NULL CONSTRAINT DF_Products_Description DEFAULT '',
        Price       DECIMAL(18, 2)   NOT NULL CONSTRAINT CK_Products_Price CHECK (Price >= 0),
        Stock       INT              NOT NULL CONSTRAINT CK_Products_Stock CHECK (Stock >= 0),
        Category    NVARCHAR(100)    NOT NULL,
        IsActive    BIT              NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1,
        CreatedDate DATETIME2(3)     NOT NULL CONSTRAINT DF_Products_CreatedDate DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_Products_Category ON dbo.Products (Category) INCLUDE (ProductName, Price, Stock);
END;
GO

IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Orders
    (
        OrderId       UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Orders PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        CustomerId    NVARCHAR(100)    NOT NULL,
        CustomerName  NVARCHAR(200)    NOT NULL,
        OrderDate     DATETIME2(3)     NOT NULL CONSTRAINT DF_Orders_OrderDate DEFAULT SYSUTCDATETIME(),
        TotalAmount   DECIMAL(18, 2)   NOT NULL CONSTRAINT CK_Orders_TotalAmount CHECK (TotalAmount >= 0),
        Status        NVARCHAR(20)     NOT NULL CONSTRAINT CK_Orders_Status CHECK (Status IN ('Pending', 'Processing', 'Completed', 'Cancelled')),
        PaymentStatus NVARCHAR(20)     NOT NULL CONSTRAINT CK_Orders_PaymentStatus CHECK (PaymentStatus IN ('Unpaid', 'Paid', 'Refunded')),
        CreatedDate   DATETIME2(3)     NOT NULL CONSTRAINT DF_Orders_CreatedDate DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_Orders_Status ON dbo.Orders (Status) INCLUDE (CustomerName, OrderDate, TotalAmount);
END;
GO

IF OBJECT_ID('dbo.OrderItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderItems
    (
        OrderItemId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderItems PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        OrderId     UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_OrderItems_Orders REFERENCES dbo.Orders (OrderId) ON DELETE CASCADE,
        ProductId   UNIQUEIDENTIFIER NOT NULL,
        ProductName NVARCHAR(200)    NOT NULL,
        Quantity    INT              NOT NULL CONSTRAINT CK_OrderItems_Quantity CHECK (Quantity > 0),
        Price       DECIMAL(18, 2)   NOT NULL CONSTRAINT CK_OrderItems_Price CHECK (Price >= 0)
    );

    CREATE INDEX IX_OrderItems_OrderId ON dbo.OrderItems (OrderId);
END;
GO
