DROP DATABASE post;
CREATE DATABASE post;
USE post;


CREATE TABLE payUser(
	payNum			INTEGER PRIMARY KEY auto_increment,
	user			VARCHAR(20),
	email			text,
    phone			VARCHAR(20),
    age				VARCHAR(10),
    DATE			DATE
);


CREATE TABLE postInfo(
	postNum			INTEGER PRIMARY KEY auto_increment,
    author			VARCHAR(20),
    authorIcon		text,
    email			text,
    title			text,
    content			LONGTEXT,
    img				text,
    DATE			DATE,
    hit				INTEGER
);

CREATE TABLE adaNews(
	postNum			INTEGER PRIMARY KEY auto_increment,
    author			VARCHAR(20),
    authorIcon		text,
    email			text,
    title			text,
    content			LONGTEXT,
    img				text,
    DATE			DATE,
    hit				INTEGER
);

CREATE TABLE comments(
	comNum			INTEGER PRIMARY KEY auto_increment,
    postNum			INTEGER,
    user			VARCHAR(20),
    userIcon		text,
    email			text,
    content			text,
    liked			INTEGER,
    DATE			DATE,
    private			INTEGER,
	FOREIGN KEY (postNum) REFERENCES postInfo(postNum)
);

SELECT * FROM post.payUser;
SELECT * FROM post.adaNews;
SELECT * FROM post.postInfo;
SELECT * FROM post.comments;


set SQL_SAFE_UPDATES = 0;


AlTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';
FLUSH privileges;
