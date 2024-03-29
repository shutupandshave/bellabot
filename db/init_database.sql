CREATE DATABASE `bellabot` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bellabot`;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` text NOT NULL,
  `channelID` varchar(45) NOT NULL,
  `couponValue` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idcoupons_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `blacklist` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `DiscordID` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `alliances` (
  `id` bigint NOT NULL,
  `name` text NOT NULL,
  `roleID` varchar(45) DEFAULT NULL,
  `COUPON_CODE_ID` bigint DEFAULT NULL,
  `ticker` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `COUPON_CODE_ALLIANCES_idx` (`COUPON_CODE_ID`),
  CONSTRAINT `COUPON_CODE_ALLIANCES` FOREIGN KEY (`COUPON_CODE_ID`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `corporations` (
  `id` bigint NOT NULL,
  `name` text NOT NULL,
  `roleID` varchar(45) DEFAULT NULL,
  `allianceID` bigint DEFAULT NULL,
  `COUPON_CODE_ID` bigint DEFAULT NULL,
  `ticker` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `COUPON_CODE_CORPORATIONS_idx` (`COUPON_CODE_ID`),
  CONSTRAINT `COUPON_CODE_CORPORATIONS` FOREIGN KEY (`COUPON_CODE_ID`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` varchar(45) NOT NULL,
  `ESI_CHAR_ID` int DEFAULT NULL,
  `ESI_REFRESH_TOKEN` text,
  `ESI_AUTH_TOKEN` text,
  `ESI_CHAR_NAME` varchar(45) DEFAULT NULL,
  `ESI_CORP_ID` bigint DEFAULT NULL,
  `UUID` varchar(45) NOT NULL,
  `COUPON_CODE_ID` bigint DEFAULT NULL,
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `esi` (`ESI_CHAR_ID`),
  KEY `COUPON_CODE_USERS_idx` (`COUPON_CODE_ID`),
  KEY `CORPORATION_USERS_idx` (`ESI_CORP_ID`),
  CONSTRAINT `CORPORATION_USERS` FOREIGN KEY (`ESI_CORP_ID`) REFERENCES `corporations` (`id`),
  CONSTRAINT `COUPON_CODE_USERS` FOREIGN KEY (`COUPON_CODE_ID`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;