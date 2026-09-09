-- Seed Data for Atul_test_Az Database
-- Run this script in SQL Server Management Studio or sqlcmd

USE [Atul_test_Az]
GO

-- Insert Products
INSERT INTO [Products] ([ProductId], [ProductName], [Description], [Price], [Stock], [Category], [IsActive], [CreatedDate])
VALUES 
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Wireless Keyboard K380', 'Compact multi-device Bluetooth keyboard.', 49.99, 120, 'Peripherals', 1, GETUTCDATE()),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '27" 4K Monitor', 'IPS panel with USB-C 90W power delivery.', 379.00, 34, 'Displays', 1, GETUTCDATE()),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'USB-C Docking Station', '11-in-1 dock with dual HDMI and ethernet.', 149.50, 58, 'Accessories', 1, GETUTCDATE()),
    ('f6a7b8c9-d0e1-2345-f012-456789012345', 'Noise Cancelling Headset', 'Certified headset with dual mic array.', 219.00, 0, 'Audio', 0, GETUTCDATE()),
    ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Ergonomic Mouse MX', 'Vertical grip mouse with 4000 DPI sensor.', 89.99, 76, 'Peripherals', 1, GETUTCDATE()),
    ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Portable SSD 1TB', 'NVMe drive with hardware encryption.', 109.99, 95, 'Storage', 1, GETUTCDATE())
GO

-- Insert Users (AuthService)
INSERT INTO [Users] ([UserId], [Name], [Email], [Role], [Phone], [Company])
VALUES 
    ('USR-1', 'Aarav Sharma', 'admin@minioms.com', 'Admin', '+91 98200 11223', 'Mini OMS Pvt Ltd')
GO

-- Insert Orders
DECLARE @OrderDate1 DATETIME = DATEADD(day, -7, GETUTCDATE())
DECLARE @OrderDate2 DATETIME = DATEADD(day, -3, GETUTCDATE())
DECLARE @OrderDate3 DATETIME = DATEADD(day, -1, GETUTCDATE())

DECLARE @OrderId1 UNIQUEIDENTIFIER = NEWID()
DECLARE @OrderId2 UNIQUEIDENTIFIER = NEWID()
DECLARE @OrderId3 UNIQUEIDENTIFIER = NEWID()

INSERT INTO [Orders] ([OrderId], [CustomerId], [OrderDate], [TotalAmount], [Status], [PaymentStatus], [CreatedDate])
VALUES 
    (@OrderId1, 'USR-1', @OrderDate1, 528.98, 'Completed', 'Paid', @OrderDate1),
    (@OrderId2, 'USR-1', @OrderDate2, 89.99, 'Processing', 'Paid', @OrderDate2),
    (@OrderId3, 'USR-1', @OrderDate3, 219.98, 'Pending', 'Unpaid', @OrderDate3)
GO

-- Insert OrderItems
DECLARE @OrderId1 UNIQUEIDENTIFIER = (SELECT TOP 1 [OrderId] FROM [Orders] WHERE [Status] = 'Completed' ORDER BY [OrderDate])
DECLARE @OrderId2 UNIQUEIDENTIFIER = (SELECT TOP 1 [OrderId] FROM [Orders] WHERE [Status] = 'Processing' ORDER BY [OrderDate])
DECLARE @OrderId3 UNIQUEIDENTIFIER = (SELECT TOP 1 [OrderId] FROM [Orders] WHERE [Status] = 'Pending' ORDER BY [OrderDate])

INSERT INTO [OrderItems] ([OrderItemId], [OrderId], [ProductId], [ProductName], [Quantity], [Price])
VALUES 
    (NEWID(), @OrderId1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Wireless Keyboard K380', 2, 49.99),
    (NEWID(), @OrderId1, 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '27" 4K Monitor', 1, 379.00),
    (NEWID(), @OrderId1, 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'USB-C Docking Station', 1, 149.50),
    (NEWID(), @OrderId2, 'd4e5f6a7-b8c9-0123-def0-234567890123', 'Ergonomic Mouse MX', 1, 89.99),
    (NEWID(), @OrderId3, 'e5f6a7b8-c9d0-1234-ef01-345678901234', 'Portable SSD 1TB', 2, 109.99)
GO

PRINT 'Seed data inserted successfully!'
GO
