DROP TABLE IF EXISTS `users`;

CREATE TABLE 'users' (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `userName` varchar(255) NOT NULL,
    `hash` varchar(255) NOT NULL,
    `salt` varchar(255) NOT NULL,
    `admin` tinyint(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
)

DROP TABLE IF EXISTS `books_record`;

CREATE TABLE `books_record`(
    `bookId` int(11) NOT NULL AUTO_INCREMENT, 
    `bookName` varchar(255) NOT NULL,
    `author` varchar(255) NOT NULL,
    `copies` int(11) NOT  NULL DEFAULT 0,
    `selfCode` int(1111) NOT  NULL DEFAULT 1111,
    PRIMARY KEY (`bookId`)
)


DROP TABLE IF EXISTS `requests`;

CREATE TABLE `requests`(
    `reqId` int(11) NOT NULL AUTO_INCREMENT, 
    `date` date 
    `bookId` varchar(255) NOT NULL,
    `userId` varchar(255) NOT NULL,
    `status` int(4) NOT  NULL DEFAULT 0 CHECK (status >= -1 AND status <=2),
    PRIMARY KEY (`reqId`),
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (bookId) REFERENCES books (bookId)
)
--  NULL = -1
-- Request (Check-out) = 0
-- Request (Check-In) = 1
-- Check Out = 2 


