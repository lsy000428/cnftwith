const express = require("express");
const url = require("url");
const multer  = require('multer');
const fs = require('fs');
var bodyParser = require('body-parser')
const upload = multer({ dest: 'postImg/' })
const urlencode = require("urlencode");
const server = express();
const mysql = require('mysql');  // mysql 모듈 로드

//DB연동
var db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '1234',
  database : 'post',
  "timezone":"Asia/Seoul",
  "dateStrings":"date",
  multipleStatements: true
});
let sql;
let sql2;
let sql3;



db.connect();~


server.use(bodyParser.urlencoded({limit: '5mb', extended: false, parameterLimit: 10000}));
server.use(express.urlencoded({extended: true}));
server.use(express.static(__dirname));
server.set('view engine', 'ejs');




server.get("/", (req, res) => {
  sql = `SELECT * FROM postInfo ORDER BY postNum DESC LIMIT 3; `;
  sql2 = `SELECT * FROM postInfo ORDER BY hit DESC LIMIT 4; `;
  db.query(sql + sql2, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/main", {
      list1 : data[0],
      list2 : data[1]
    });
  });
});

server.get("/main", (req, res) => {
  sql = `SELECT * FROM postInfo ORDER BY postNum DESC LIMIT 3; `;
  sql2 = `SELECT * FROM postInfo ORDER BY hit DESC LIMIT 4; `;
  db.query(sql + sql2, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/main_Login", {
      list1 : data[0],
      list2 : data[1]
    });
  });
});

server.get("/login", (req, res) => {
  res.sendFile(__dirname + "/loginPage.html");
});

//ada 뉴스
server.get("/adaNews", (req, res) => {
  var urlPath = url.parse(req.url);
  
  if(urlPath.path == '/adaNews') {
    sql = `SELECT * FROM adaNews`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
      res.render(__dirname + "/ejs/adaNews", {
        list : data
      });
    });
  }
  else {
    var search = urlencode.decode(urlPath.query.replace(/postSearch=/, ""));
    sql = `SELECT * FROM adaNews WHERE title LIKE '%${search}%'`;
    db.query(sql, (error, data, fields) => {
      if(error) throw error;
      res.render(__dirname + "/ejs/adaNews", {
        list : data
      });
    });
  }
});

server.get("/newsPostPage", (req, res) => {
  res.sendFile(__dirname + "/newsPostPage.html");
});

server.post("/newsPostPage", upload.single("files"), (req, res) => {
  const title = req.body['postTitle'];
  const content = req.body['postContent'];
  const nickname = req.body['nickname'];
  const icon = req.body['icon'];
  const email = req.body['email'];
  const image = req.file;
  var btn = req.body['posting'];


  if(btn == '포스팅' && image == null) {
    sql = `INSERT INTO adaNews (author, authorIcon, email, title, content, img, DATE, hit) VALUES('${nickname}', '${icon}', '${email}', '${title}', '${content}', '', now(), 1)`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
    });
    res.redirect("/adaNews_Login");
  }
  else {
    sql = `INSERT INTO adaNews (author, authorIcon, email, title, content, img, DATE, hit) VALUES('${nickname}', '${icon}', '${email}', '${title}', '${content}', '${image.filename}', now(), 1)`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
    });
    res.redirect("/adaNews_Login");
  }
});


server.get("/adaNews_Login", (req, res) => {
  var urlPath = url.parse(req.url);
  
  if(urlPath.path == '/adaNews_Login') {
    sql = `SELECT * FROM adaNews`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
      res.render(__dirname + "/ejs/adaNews_Login", {
        list : data
      });
    });
  }
  else {
    var search = urlencode.decode(urlPath.query.replace(/postSearch=/, ""));

    sql = `SELECT * FROM adaNews WHERE title LIKE '%${search}%'`;
    db.query(sql, (error, data, fields) => {
      if(error) throw error;
      res.render(__dirname + "/ejs/adaNews_Login", {
        list : data
      });
    });
  }
});

server.get("/adaNewsInfo", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));

  sql = `UPDATE adanews SET hit = hit + 1 WHERE postNum = ${search};`;
  sql2 = `SELECT * FROM adanews WHERE postNum LIKE '%${search}%';`;
  db.query(sql + sql2, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/adaNewsInfo", {
      list : data[1]
    });
  });
});

server.get("/adaNewsInfo_Login", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));

  sql = `UPDATE adanews SET hit = hit + 1 WHERE postNum = ${search};`;
  sql2 = `SELECT * FROM adanews WHERE postNum LIKE '%${search}%';`;
  db.query(sql + sql2, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/adaNewsInfo_Login", {
      list : data[1]
    });
  });
});

server.get("/adaNewsUpdate", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));

  sql = `SELECT * FROM adanews WHERE postNum LIKE '%${search}%'`;
  db.query(sql, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/adaNewsUpdate", {
      list : data
    });
  });
});



server.post("/adaNewsInfo_Login", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));


  var btnName = req.body['delete'];
  if (btnName == '삭제') {
    sql = `SELECT * FROM adanews WHERE postNum = ${search};`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
      if(data[0].img != '') {
        try {
            fs.unlinkSync(`postImg/${data[0].img}`);
        } catch (error) {
            if(err.code == 'ENOENT'){
                console.log("파일 삭제 Error 발생");
            }
        }
      }
    });

    sql = `DELETE FROM adanews WHERE postNum = ${search};`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
    });
    res.redirect("/adaNews_Login");
  }
});


//cnft소개
server.get("/cnftPost", (req, res) => {
  var urlPath = url.parse(req.url);
  
  if(urlPath.path == '/cnftPost') {
    sql = `SELECT * FROM postInfo`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
      res.render(__dirname + "/ejs/cnftPostPage", {
        list : data
      });
    });
  }
  else {
    var search = urlencode.decode(urlPath.query.replace(/postSearch=/, ""));
    sql = `SELECT * FROM postInfo WHERE title LIKE '%${search}%'`;
    db.query(sql, (error, data, fields) => {
      if(error) throw error;
      res.render(__dirname + "/ejs/cnftPostPage", {
        list : data
      });
    });
  }
});

server.get("/cnftPost_Login", (req, res) => {
  var urlPath = url.parse(req.url);
  
  if(urlPath.path == '/cnftPost_Login') {
    sql = `SELECT * FROM postInfo`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
      res.render(__dirname + "/ejs/cnftPostPage_Login", {
        list : data
      });
    });
  }
  else {
    var search = urlencode.decode(urlPath.query.replace(/postSearch=/, ""));

    sql = `SELECT * FROM postInfo WHERE title LIKE '%${search}%'`;
    db.query(sql, (error, data, fields) => {
      if(error) throw error;
      res.render(__dirname + "/ejs/cnftPostPage_Login", {
        list : data
      });
    });
  }
});

server.get("/cnftPostInfo", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));

  sql = `UPDATE postInfo SET hit = hit + 1 WHERE postNum = ${search};`;
  sql2 = `SELECT * FROM postInfo WHERE postNum LIKE '%${search}%';`;
  sql3 = `SELECT * FROM comments WHERE postNum LIKE '%${search}%';`;
  db.query(sql + sql2 + sql3, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/cnftPostInfo", {
      list1 : data[1],
      list2 : data[2]
    });
  });
});

server.get("/cnftPostInfo_Login", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));

  sql = `UPDATE postInfo SET hit = hit + 1 WHERE postNum = ${search};`;
  sql2 = `SELECT * FROM postInfo WHERE postNum LIKE '%${search}%';`;
  sql3 = `SELECT * FROM comments WHERE postNum LIKE '%${search}%';`;
  db.query(sql + sql2 + sql3, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/cnftPostInfo_Login", {
      list1 : data[1],
      list2 : data[2]
    });
  });
});

server.get("/cnftPosting", (req, res) => {
  res.sendFile(__dirname + "/cnftPostingPage.html");
});

server.get("/cnftPostUpdate", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));

  sql = `SELECT * FROM postInfo WHERE postNum LIKE '%${search}%'`;
  db.query(sql, (error, data, fields) => {
    if(error) throw error;
    res.render(__dirname + "/ejs/cnftPostUpdate", {
      list : data
    });
  });
});

server.get("/enterInfo", (req, res) => {
  res.sendFile(__dirname + "/enterInfoPage.html");
});


server.get("/payPage", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/id=/, ""));

  sql = `SELECT * FROM payUser WHERE email LIKE '%${search}%';`;
  db.query(sql, (error, data, fields) => {
    if(error) throw error;
    if(data[0] == null) {
      res.sendFile(__dirname + "/payPage.html");
    }
    else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(`<script charset="utf-8">alert('이미 구독을 하셨습니다.');</script>`);
      res.write(`<script charset="utf-8">window.close();</script>`);
    }
  });
});










server.listen(8080, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 3000");
});





server.post("/", (req, res) => {
  const id = req.body['postID'];

  sql = `UPDATE postInfo SET hit = hit + 1 WHERE postNum = ${id}`;
  db.query(sql, (error, data, fields) => {
    if(error) throw error;
  });
  res.redirect("/cnftPostInfo");
});


server.post("/main", (req, res) => {
  const id = req.body['postID'];

  sql = `UPDATE postInfo SET hit = hit + 1 WHERE postNum = ${id}`;
  db.query(sql, (error, data, fields) => {
    if(error) throw error;
  });
  res.redirect("/cnftPostInfo_Login");
});



server.post("/cnftPosting", upload.single("files"), (req, res) => {
  const title = req.body['postTitle'];
  const content = req.body['postContent'];
  const nickname = req.body['nickname'];
  const icon = req.body['icon'];
  const email = req.body['email'];
  const image = req.file;
  var btn = req.body['posting'];


  if(btn == '포스팅' && image == null) {
    sql = `INSERT INTO postInfo (author, authorIcon, email, title, content, img, DATE, hit) VALUES('${nickname}', '${icon}', '${email}', '${title}', '${content}', '', now(), 1)`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
    });
    res.redirect("/cnftPost_Login");
  }
  else {
    sql = `INSERT INTO postInfo (author, authorIcon, email, title, content, img, DATE, hit) VALUES('${nickname}', '${icon}', '${email}', '${title}', '${content}', '${image.filename}', now(), 1)`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
    });
    res.redirect("/cnftPost_Login");
  }
});


server.post("/cnftPostInfo_Login", (req, res) => {
  var urlPath = url.parse(req.url);
  var search = urlencode.decode(urlPath.query.replace(/postID=/, ""));
  var nickname = req.body['nickname'];
  var email = req.body['email'];
  var icon = req.body['icon'];
  var content = req.body['comContent'];
  var private = req.body['comPrivate'];
  var comNum = req.body['comNum'];

  if(private == null) {
    private = 0;
  }
  else if (private == 'on') {
    private = 1;
  }


  var btnName = req.body['delete'];
  if (btnName == '삭제') {
    sql = `SELECT * FROM postInfo WHERE postNum = ${search};`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
      if(data[0].img != '') {
        try {
            fs.unlinkSync(`postImg/${data[0].img}`);
        } catch (error) {
            if(err.code == 'ENOENT'){
                console.log("파일 삭제 Error 발생");
            }
        }
      }
    });

    sql = `DELETE FROM postInfo WHERE postNum = ${search};`;
    sql2 = `DELETE FROM comments WHERE postNum = ${search};`;
    db.query(sql, (error, data, fields) =>{
      if(error) throw error;
    });
    res.redirect("/cnftPost_Login");
  }

  btnName = req.body['comPostBtn'];
  if(btnName == '입력') {
    sql = `INSERT INTO comments (postNum, user, userIcon, email, content, liked, DATE, private) VALUES('${search}', '${nickname}', '${icon}', '${email}', '${content}', 0, now(), '${private}');`
    db.query(sql, (error, data, fields) => {
      if (error) throw error;
    });
    res.redirect(`/cnftPostInfo_Login?postID=${search}`);
  }


  btnName = req.body['comDelete'];
  if(btnName == '삭제') {
    sql = `DELETE FROM comments WHERE comNum = ${comNum};`;
    db.query(sql, (error, data, fields) => {
      if (error) throw error;
    });
    res.redirect(`/cnftPostInfo_Login?postID=${search}`);
  }
});

server.post("/payPage", (req, res)=> {
  var btnName = req.body['paySuccessBtn'];
  var nickname = req.body['nickname'];
  var email = req.body['email'];
  var phone = req.body['comPhone'];
  var age = req.body['comAge'];

  if(btnName == '결제 완료'){
    sql = `INSERT INTO payUser (user, email, phone, age, DATE) VALUES ('${nickname}', '${email}', '${phone}', '${age}', now())`;
    db.query(sql, (error, data, fields) => {
      if(error) throw error;
    });
  }
 
  res.write(`<script>window.close();</script>`);
});