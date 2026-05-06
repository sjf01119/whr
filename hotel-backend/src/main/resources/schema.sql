CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  avatar VARCHAR(255) NOT NULL DEFAULT '' COMMENT '用户头像地址',
  role VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uk_sys_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS hotel (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  merchant_id BIGINT NOT NULL,
  name VARCHAR(128) NOT NULL,
  address VARCHAR(255) NOT NULL,
  description VARCHAR(1024) NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  KEY idx_hotel_merchant_id (merchant_id),
  KEY idx_hotel_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS room_type (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id BIGINT NOT NULL,
  name VARCHAR(128) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  facilities_text VARCHAR(1024) NOT NULL,
  stock INT NOT NULL,
  created_at DATETIME NOT NULL,
  KEY idx_room_type_hotel_id (hotel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS booking_order (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(32) NOT NULL,
  user_id BIGINT NOT NULL,
  hotel_id BIGINT NOT NULL,
  room_type_id BIGINT NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  room_count INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uk_booking_order_order_no (order_no),
  KEY idx_booking_order_user_id (user_id),
  KEY idx_booking_order_hotel_id (hotel_id),
  KEY idx_booking_order_room_type_id (room_type_id),
  KEY idx_booking_order_status (status),
  KEY idx_booking_order_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS booking_guest (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  guest_name VARCHAR(64) NOT NULL,
  id_card VARCHAR(32) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  KEY idx_booking_guest_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
