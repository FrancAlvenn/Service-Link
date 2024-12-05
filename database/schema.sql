CREATE TABLE `assets` (
  `asset_id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `asset_type` varchar(50) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Available',
  `last_maintenance` date DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `type_specific_1` varchar(255) DEFAULT NULL,
  `type_specific_2` varchar(255) DEFAULT NULL,
  `type_specific_3` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`asset_id`),
  UNIQUE KEY `serial_number` (`serial_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `designation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `designation` varchar(50) NOT NULL,
  `description` text,
  `archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `uploaded_by` int NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `job_request_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_request_id` varchar(50) NOT NULL,
  `quantity` text,
  `particulars` text NOT NULL,
  `description` text NOT NULL,
  `remarks` text,
  `archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_request_id` (`job_request_id`),
  CONSTRAINT `job_request_details_ibfk_1` FOREIGN KEY (`job_request_id`) REFERENCES `job_requests` (`reference_number`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `job_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(50) NOT NULL,
  `date_required` date NOT NULL,
  `purpose` text NOT NULL,
  `requester_id` varchar(50) NOT NULL,
  `immediate_head_approval` varchar(255) DEFAULT 'pending',
  `gso_director_approval` varchar(255) DEFAULT 'pending',
  `operations_director_approval` varchar(255) DEFAULT 'pending',
  `archived` tinyint(1) DEFAULT '0',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_number` (`reference_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;





CREATE TABLE `priority_level` (
  `id` int NOT NULL AUTO_INCREMENT,
  `priority` varchar(50) NOT NULL,
  `description` text,
  `archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `purchasing_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(50) NOT NULL,
  `date_requested` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_required` date NOT NULL,
  `requester_id` varchar(50) NOT NULL,
  `supply_category` varchar(255) NOT NULL,
  `purpose` text NOT NULL,
  `immediate_head_approval` varchar(255) DEFAULT 'Pending',
  `gso_director_approval` varchar(255) DEFAULT 'Pending',
  `operations_director_approval` varchar(255) DEFAULT 'Pending',
  `archived` tinyint(1) DEFAULT '0',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_number` (`reference_number`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `purchasing_request_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchasing_request_id` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  `particulars` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchasing_request_id` (`purchasing_request_id`),
  CONSTRAINT `purchasing_request_details_ibfk_1` FOREIGN KEY (`purchasing_request_id`) REFERENCES `purchasing_requests` (`reference_number`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `requests_attachments` (
  `attachment_id` int NOT NULL AUTO_INCREMENT,
  `request_id` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `requests_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `request_id` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `comment_text` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  `description` text,
  `archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `system_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `performed_by` varchar(50) NOT NULL,
  `target` varchar(50) NOT NULL,
  `details` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(50) NOT NULL,
  `reference_number` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'Approved/InProgress',
  `assigned_to` int DEFAULT NULL,
  `priority_level` varchar(50) DEFAULT 'Medium',
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `profile_image_id` int DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `access_level` varchar(255) DEFAULT NULL,
  `immediate_head` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived` tinyint DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




CREATE TABLE `vehicle_requisition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(50) NOT NULL,
  `vehicle_requested` varchar(255) DEFAULT NULL,
  `date_filled` date NOT NULL,
  `date_of_trip` date NOT NULL,
  `time_of_departure` time NOT NULL,
  `time_of_arrival` time DEFAULT NULL,
  `number_of_passengers` int NOT NULL,
  `destination` varchar(255) NOT NULL,
  `purpose` text NOT NULL,
  `requester_id` varchar(100) NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'Pending',
  `vehicle_id` int DEFAULT NULL,
  `remarks` text,
  `immediate_head_approval` varchar(255) DEFAULT 'Pending',
  `gso_director_approval` varchar(255) DEFAULT 'Pending',
  `operations_director_approval` varchar(255) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




CREATE TABLE `venue_requisition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference_number` varchar(50) NOT NULL,
  `venue_id` int NOT NULL,
  `requester_id` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `organization` varchar(100) DEFAULT NULL,
  `event_title` varchar(255) NOT NULL,
  `purpose` text NOT NULL,
  `event_nature` varchar(255) DEFAULT NULL,
  `event_dates` varchar(255) NOT NULL,
  `event_start_time` time NOT NULL,
  `event_end_time` time NOT NULL,
  `participants` varchar(255) NOT NULL,
  `pax_estimation` int DEFAULT '0',
  `equipment_materials` text,
  `status` varchar(100) DEFAULT 'Pending',
  `remarks` text,
  `immediate_head_approval` varchar(255) DEFAULT 'Pending',
  `gso_director_approval` varchar(255) DEFAULT 'Pending',
  `operations_director_approval` varchar(255) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

