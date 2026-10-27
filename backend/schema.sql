-- =====================================================================
-- VivuPlan - Nang cap CSDL SQL Server (chay 1 lan sau schema_sqlserver.sql)
-- Muc dich: luu thong tin dang ky day du + luu chuyen di cua nguoi dung
-- =====================================================================
USE vivuplan_db;
GO

-- 1. Them cot cho bang users (khop voi form dang ky tren web)
ALTER TABLE dbo.users ADD avatar NVARCHAR(500) NULL;
ALTER TABLE dbo.users ADD preferred_style NVARCHAR(30) NULL;   -- nature / history / cuisine / adventure
GO

-- 2. Bang chuyen di cua nguoi dung (dong bo tu localStorage cua web len day)
--    Luu y: web co chuyen di tu tao (vd Da Lat) khong nam trong bang places,
--    nen khong dung bang trips/trip_days cu, ma luu tom tat + ban JSON day du.
CREATE TABLE dbo.user_trips (
    id            NVARCHAR(50)  NOT NULL PRIMARY KEY,
    user_id       NVARCHAR(50)  NOT NULL,
    title         NVARCHAR(255) NOT NULL,
    destination   NVARCHAR(150) NULL,
    start_date    NVARCHAR(20)  NULL,
    end_date      NVARCHAR(20)  NULL,
    budget        BIGINT        NOT NULL DEFAULT 0,
    days_count    INT           NOT NULL DEFAULT 0,
    places_count  INT           NOT NULL DEFAULT 0,
    total_cost    BIGINT        NOT NULL DEFAULT 0,
    trip_json     NVARCHAR(MAX) NULL,
    created_at    DATETIME2     DEFAULT SYSDATETIME(),
    updated_at    DATETIME2     DEFAULT SYSDATETIME(),
    CONSTRAINT fk_user_trips_user FOREIGN KEY (user_id)
        REFERENCES dbo.users (id) ON DELETE CASCADE,
    INDEX idx_user_trips_user (user_id)
);
GO