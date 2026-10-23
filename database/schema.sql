-- Smart Khareedi schema (MySQL 8.0+)
-- Structure only. No product, price, retailer URL, or user records are included.
-- Creates missing tables; does not drop existing tables.

CREATE DATABASE IF NOT EXISTS `smart_khareedi`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `smart_khareedi`;

CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `platforms` (
  `platform_id` int NOT NULL AUTO_INCREMENT,
  `platform_name` varchar(100) NOT NULL,
  PRIMARY KEY (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'Smartphone',
  `category_id` int DEFAULT NULL,
  `image_url` text,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `product_variants` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `storage` varchar(50) DEFAULT NULL,
  `ram` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`variant_id`),
  KEY `fk_product_variants_product` (`product_id`),
  CONSTRAINT `fk_product_variants_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `product_prices` (
  `price_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `platform_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `product_url` text,
  `availability` varchar(50) DEFAULT 'Available',
  `external_product_id` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`price_id`),
  UNIQUE KEY `unique_variant_platform` (`variant_id`,`platform_id`),
  KEY `fk_product_prices_product` (`product_id`),
  KEY `fk_product_prices_platform` (`platform_id`),
  CONSTRAINT `fk_product_prices_platform` FOREIGN KEY (`platform_id`)
    REFERENCES `platforms` (`platform_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_prices_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_prices_variant` FOREIGN KEY (`variant_id`)
    REFERENCES `product_variants` (`variant_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `price_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `platform_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `availability` varchar(50) DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `fk_price_history_product` (`product_id`),
  KEY `fk_price_history_variant` (`variant_id`),
  KEY `fk_price_history_platform` (`platform_id`),
  CONSTRAINT `fk_price_history_platform` FOREIGN KEY (`platform_id`)
    REFERENCES `platforms` (`platform_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_price_history_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_price_history_variant` FOREIGN KEY (`variant_id`)
    REFERENCES `product_variants` (`variant_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `search_history` (
  `search_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `search_query` varchar(255) NOT NULL,
  `searched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`search_id`),
  KEY `fk_search_history_user` (`user_id`),
  CONSTRAINT `fk_search_history_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `wishlist` (
  `wishlist_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`wishlist_id`),
  KEY `fk_wishlist_user` (`user_id`),
  KEY `fk_wishlist_product` (`product_id`),
  KEY `fk_wishlist_variant` (`variant_id`),
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_variant` FOREIGN KEY (`variant_id`)
    REFERENCES `product_variants` (`variant_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional lookup rows for a fresh development database:
-- INSERT INTO categories (category_name) VALUES ('Smartphone');
-- INSERT INTO platforms (platform_name)
-- VALUES ('Amazon'), ('Flipkart'), ('Vijay Sales'), ('Croma');
