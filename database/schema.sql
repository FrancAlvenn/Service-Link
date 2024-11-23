    -- Table for Vehicle Requisition
    CREATE TABLE vehicle_requisition (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference_number VARCHAR(50) NOT NULL,
        vehicle_requested VARCHAR(255),
        date_filled DATE NOT NULL,
        date_of_trip DATE NOT NULL,
        time_of_departure TIME NOT NULL,
        time_of_arrival TIME,
        number_of_passengers INT NOT NULL,
        destination VARCHAR(255) NOT NULL,
        purpose TEXT NOT NULL,
        requester_id VARCHAR(100) NOT NULL,
        designation VARCHAR(100),
        status VARCHAR(100) DEFAULT 'pending',
        vehicle_id INT,
        remarks TEXT,
        immediate_head_approval VARCHAR(255) DEFAULT 'pending',
        gso_director_approval VARCHAR(255) DEFAULT 'pending',
        operations_director_approval VARCHAR(255) DEFAULT 'pending',
        archived BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Insert for Vehicle Request

    INSERT INTO vehicle_requisition
    (reference_number, date_filled, date_of_trip, time_of_departure, time_of_arrival, number_of_passengers, destination, purpose, requester_id , designation, status, vehicle_id, remarks, immediate_head_approval, gso_director_approval, operations_director_approval) 
    VALUES
    ('SV-2024-01', '2024-11-01', '2024-11-05', '08:00:00', '12:00:00', 4, 'Manila', 'Business meeting with partner company', 'John Doe', 'Manager', 'pending', NULL, 'No remarks', 'Pending', 'Pending', 'Pending'),
    ('SV-2024-02', '2024-11-02', '2024-11-07', '09:00:00', '13:00:00', 2, 'Quezon City', 'Site inspection', 'Jane Smith', 'Supervisor', 'pending', NULL, 'Need a van for transportation', 'Pending', 'Pending', 'Pending'),
    ('SV-2024-03', '2024-11-03', '2024-11-08', '07:30:00', '11:30:00', 6, 'Laguna', 'Team-building event', 'Michael Johnson', 'Lead Developer', 'pending', NULL, 'Group of employees, need 2 vehicles', 'Pending', 'Pending', 'Pending'),
    ('SV-2024-04', '2024-11-04', '2024-11-09', '10:00:00', '14:00:00', 8, 'Tagaytay', 'Company retreat', 'Sarah Lee', 'HR Manager', 'pending', NULL, 'Large group, need 2 vans', 'Pending', 'Pending', 'Pending'),
    ('SV-2024-05', '2024-11-05', '2024-11-12', '06:30:00', '10:30:00', 3, 'Batangas', 'Corporate event', 'David Clark', 'Event Coordinator', 'pending', NULL, 'Need a bus for the event', 'Pending', 'Pending', 'Pending');



    -- Table for Venue Requisition
    CREATE TABLE venue_requisition (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference_number VARCHAR(50) NOT NULL,
        venue_id INT NOT NULL,
        requester_id VARCHAR(100) NOT NULL,
        department VARCHAR(100) DEFAULT NULL,
        organization VARCHAR(100) DEFAULT NULL,
        event_title VARCHAR(255) NOT NULL,
        purpose TEXT NOT NULL,
        event_nature VARCHAR(255) DEFAULT NULL,
        event_dates VARCHAR(255) NOT NULL,
        event_start_time TIME NOT NULL,
        event_end_time TIME NOT NULL,
        participants VARCHAR(255) NOT NULL,
        pax_estimation INT DEFAULT 0,
        equipment_materials TEXT DEFAULT NULL,
        status VARCHAR(100) DEFAULT 'pending',
        remarks TEXT DEFAULT NULL,
        immediate_head_approval VARCHAR(255) DEFAULT 'pending',
        gso_director_approval VARCHAR(255) DEFAULT 'pending',
        operations_director_approval VARCHAR(255) DEFAULT 'pending',
        archived BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );


    -- Table for User Account
    CREATE TABLE users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        reference_number VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        contact_number VARCHAR(255),
        profile_image_id INT,
        organization VARCHAR(255),
        department VARCHAR(255),
        designation VARCHAR(255),
        access_level VARCHAR(255),
        immediate_head VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Table for Images
    CREATE TABLE images (
        image_id INT AUTO_INCREMENT PRIMARY KEY,
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        uploaded_by INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Table for Assets
    CREATE TABLE assets (
        asset_id INT PRIMARY KEY AUTO_INCREMENT,
        reference_number VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        capacity INT,
        manufacturer VARCHAR(255),
        model VARCHAR(255),
        serial_number VARCHAR(255) UNIQUE,
        purchase_date DATE,
        purchase_cost DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'Available',
        last_maintenance DATE,
        warranty_expiry DATE,
        type_specific_1 VARCHAR(255),
        type_specific_2 VARCHAR(255),
        type_specific_3 VARCHAR(255)
    );

    -- Table for Comments on Requests
    CREATE TABLE requests_comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(255),
        user_id INT,
        comment_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    );

    -- Table for Attachments related to Requests
    CREATE TABLE requests_attachments (
        attachment_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(255),
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        uploaded_by INT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );


    -- Table for Status
    CREATE TABLE status (
        id INT PRIMARY KEY AUTO_INCREMENT,
        status VARCHAR(50) NOT NULL,
        description TEXT
    );

    -- Insert data into Status table
    INSERT INTO Status (status, description) VALUES 
    ('Submitted', 'Request has been submitted'),
    ('Pending', 'Request is pending review'),
    ('Approved/InProgress', 'Request has been approved and is currently in progress'),
    ('On Hold', 'Request is on hold'),
    ('Disapproved/Rejected', 'Request has been disapproved or rejected'),
    ('Completed', 'Request has been completed'),
    ('Approved with Condition', 'Request has been approved with specific conditions');


    -- Table for Departments
    CREATE TABLE departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT
    );

    -- Insert data into Departments table
    INSERT INTO departments (name, description) VALUES 
    ('College of Computer Studies', 'Department focused on computer and information technology education'),
    ('College of Accountancy', 'Department focused on accountancy and financial studies'),
    ('College of Arts and Sciences', 'Department focused on liberal arts and sciences education'),
    ('College of Business Administration', 'Department focused on business and management studies'),
    ('College of Education', 'Department focused on teacher education and educational studies'),
    ('College of Health Sciences', 'Department focused on health-related programs and studies'),
    ('School of Mechanical Engineering', 'Department focused on engineering disciplines'),
    ('College of Hospitality and Tourism', 'Department focused on hospitality and tourism management'),
    ('College of Maritime Education', 'Department focused on maritime studies'),
    ('School of Psychology', 'Department focused on psychological studies and research');


    -- Table for Organizations
    CREATE TABLE organizations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL
    );

    -- Insert data into Organizations table
    INSERT INTO organizations (name) VALUES 
    ('Association of Computer Enthusiasts'),
    ('Alliance of Liberal Arts Students'),
    ('CBA Young Managers Professional Alliance for Corporate Triumph'),
    ('Erudites of the Nightingale Society'),
    ('Association of Hospitality and Restaurant Management'),
    ('League of Young Tourism Students'),
    ('DYCI - Junior Philippine Institute of Accountants'),
    ('College of Education Student Organization'),
    ('PSYCHE'),
    ('DYCI - Pambansang Samahan ng Inhenyero Mekanikal'),
    ('Maritime Council Officer'),
    ('Corps of Midshipman'),
    ('DYCI - College Peer Facilitators Circle'),
    ('Dr. Yangas Student Publications Vox Nostra'),
    ('Himig DYCIan');









