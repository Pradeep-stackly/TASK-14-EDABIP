-- EDABIP database

CREATE DATABASE IF NOT EXISTS edabip_db;

USE edabip_db;

-- Login table for the platform
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_name VARCHAR(150) NOT NULL UNIQUE,
  industry VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_org_created_by
  FOREIGN KEY (created_by)
  REFERENCES users(id)
  ON DELETE CASCADE
);

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  workspace_name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_workspace_org
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE,

  CONSTRAINT uq_workspace_name_per_org
  UNIQUE (organization_id, workspace_name)
);

-- Workspace members
CREATE TABLE IF NOT EXISTS workspace_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('Admin', 'Analyst', 'Viewer') NOT NULL DEFAULT 'Viewer',
  joined_date DATE NOT NULL DEFAULT (CURRENT_DATE),

  CONSTRAINT fk_wu_workspace
  FOREIGN KEY (workspace_id)
  REFERENCES workspaces(id)
  ON DELETE CASCADE,

  CONSTRAINT fk_wu_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE,

  -- no duplicate members
  CONSTRAINT uq_workspace_user
  UNIQUE (workspace_id, user_id)
);

-- Seed data (password: Passw0rd!)

INSERT INTO users (full_name, email, password, is_platform_admin)
VALUES
('Platform Admin', 'admin@edabip.com', '$2b$10$ngeNLXRcUIMjoymP.yoC1O0fuc1zfJa7LuNso82GALUc6RAF1wCRq', TRUE),
('Karthik Raman', 'karthik@brightsoft.com', '$2b$10$ngeNLXRcUIMjoymP.yoC1O0fuc1zfJa7LuNso82GALUc6RAF1wCRq', FALSE),
('Divya Menon', 'divya@nexawave.com', '$2b$10$ngeNLXRcUIMjoymP.yoC1O0fuc1zfJa7LuNso82GALUc6RAF1wCRq', FALSE),
('Arjun Nair', 'arjun@brightsoft.com', '$2b$10$ngeNLXRcUIMjoymP.yoC1O0fuc1zfJa7LuNso82GALUc6RAF1wCRq', FALSE);

INSERT INTO organizations (organization_name, industry, company_size, email, contact_number, status, created_by)
VALUES
('BrightSoft Technologies', 'Information Technology', '51-200', 'contact@brightsoft.com', '9840012345', 'Active', 2),
('NexaWave Analytics', 'Data & Analytics', '11-50', 'contact@nexawave.com', '9940056789', 'Active', 3);

INSERT INTO workspaces (organization_id, workspace_name, description, status)
VALUES
(1, 'Product Analytics', 'Workspace for the product team dashboards', 'Active'),
(1, 'Finance Reports', 'Monthly finance and revenue reports', 'Active'),
(2, 'Customer Insights', 'Customer behaviour and churn analysis', 'Active');

INSERT INTO workspace_users (workspace_id, user_id, role)
VALUES
(1, 2, 'Admin'),
(1, 4, 'Analyst'),
(2, 2, 'Admin'),
(3, 3, 'Admin');
