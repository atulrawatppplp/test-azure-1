-- Sample catalogue rows for local / dev environments.
IF NOT EXISTS (SELECT 1 FROM dbo.Products)
BEGIN
    INSERT INTO dbo.Products (ProductName, Description, Price, Stock, Category, IsActive)
    VALUES
        (N'Wireless Keyboard K380', N'Compact multi-device Bluetooth keyboard.', 49.99, 120, N'Peripherals', 1),
        (N'27" 4K Monitor', N'IPS panel with USB-C 90W power delivery.', 379.00, 34, N'Displays', 1),
        (N'USB-C Docking Station', N'11-in-1 dock with dual HDMI and ethernet.', 149.50, 58, N'Accessories', 1),
        (N'Noise Cancelling Headset', N'Certified headset with dual mic array.', 219.00, 0, N'Audio', 0),
        (N'Ergonomic Mouse MX', N'Vertical grip mouse with 4000 DPI sensor.', 89.99, 76, N'Peripherals', 1),
        (N'Portable SSD 1TB', N'NVMe drive with hardware encryption.', 109.99, 95, N'Storage', 1);
END;
GO
