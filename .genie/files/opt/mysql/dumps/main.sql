
DROP TABLE IF EXISTS `managers`;
CREATE TABLE `managers` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  `updated_at` datetime DEFAULT NULL COMMENT '更新日時',
  `status` smallint(2) NOT NULL DEFAULT '1' COMMENT '状態',
  `login_id` varchar(32) NOT NULL COMMENT 'ログインID',
  `login_pw` varchar(255) NOT NULL COMMENT 'ログインパスワード',
  `manager_id` smallint(4) NOT NULL COMMENT '商工会議所ID:0=事務局, 1以降=商工会議所',
  `area` text COMMENT '地区',
  `name` text COMMENT '会議所名',
  `charger` text COMMENT '担当者名',
  `charger_position` text COMMENT '担当者役職',
  `email` text COMMENT 'E-Mailアドレス',
  PRIMARY KEY (`id`),
  UNIQUE KEY `manager_id` (`manager_id`),
  UNIQUE KEY `login_id` (`login_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COMMENT='管理者';
LOCK TABLES `managers` WRITE;
INSERT INTO `managers` VALUES (1,'2018-03-08 05:54:59',NULL,1,'admin','xxxxxxxx',0,'','事務局','','','');
UNLOCK TABLES;
