-- MySQL dump 10.17  Distrib 10.3.24-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: apiauth
-- ------------------------------------------------------
-- Server version 10.3.24-MariaDB-2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `oauth_providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_providers` (
  `provider_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` varchar(200) NOT NULL,
  `client_secret` varchar(200) DEFAULT NULL,
  `url` varchar(1000) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `image` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

insert into oauth_providers(client_id,client_secret,url,name,image)
  VALUES ('5VcMIVe7v28XJaiGdq6raZJ4','CHJNPf4xEnCjiXays9A77aXBS3oWXbSsTrPcF8reb0wvXbKl', 'https://facebuquison.webapiexploitation.com.br/', 'Facebuquison', ''),
  ('TGFzmaJCWFsJNjzzfgjv2hOc','6eiINyy1rlEVhbPhWQycI2F980gEbb6ClkmwaAQ6pNnaSBmn', 'https://cathub.webapiexploitation.com.br/', 'Cathub', '');

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `document` varchar(45) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `birth_date` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `role` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `photo` varchar(45) DEFAULT NULL,
  `recovery_token` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `oauth_users`
--

DROP TABLE IF EXISTS `oauth_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_users` (
  `user_id` varchar(45) NOT NULL,
  `provider_id` int(10) unsigned NOT NULL,
  `oauth_id` varchar(200) DEFAULT NULL,
  `oauth_username` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`provider_id`,`oauth_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('009d7b44-d8c3-4be2-afd4-4672801b51c5','Admin','admin@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'admin','123456',NULL,NULL),('0c8aae59-72ac-467d-8975-12cbb56de305','Jhonatan Agostinho','jagostinho@webapiexploitation.com.br',NULL,NULL,'male','2001-01-22T03:00:00.000Z',NULL,'user','123456',NULL,NULL),('143fba53-8e79-41b6-a88a-ec6ce487b255','Helvio Junior','hjunior@webapiexploitation.com.br',NULL,NULL,'male','1981-07-08T03:00:00.000Z',NULL,'user','123456',NULL,NULL),('192471f4-7589-40ca-b1d7-3ccd430e02b4','Jacson Alvarenga','jalvarenga@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'user','123456',NULL,NULL),('1f6b5552-0e25-4284-8773-888ed56095c3','Valdemar Antunes','vantunes@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'user','123456',NULL,NULL),('3935e76a-52a6-4ff7-8f5c-c84f09fc92bf','Atila Fagundes','afagundes@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'user','123456',NULL,NULL),('47047b49-43e6-4d82-9926-c11eafb47245','Gyselle Pacheco','gpacheco@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'user','123456',NULL,NULL),('50935929-ce6b-40d1-902d-a47ff44103a2','Bruno Abreu','babreu@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'user','123456',NULL,NULL),('54027f35-12d4-4f8e-99ce-d981ad6f9f28','Patrik Sampaulo','psampaulo@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'user','123456',NULL,NULL),('560bd643-6f7a-449d-9d55-9f4d91374541','Wenerton Alves','walves@webapiexploitation.com.br',NULL,NULL,NULL,NULL,NULL,'user','123456',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-02-15 22:44:39