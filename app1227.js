const express = require("express") //require('express')를 통해 Express 모듈 불러옴 
const ejs = require("ejs");
const mysql = require("mysql") 
const bodyParser = require('body-parser')
var session = require('express-session')
const path =require('path')
const multer = require('multer');
var AWS = require('aws-sdk');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const app = express()
const port = 3000

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));

const pool = mysql.createPool(config);


app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static(__dirname +'public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
   secret: 'miraclecharm',
   cookie: { maxAge: 600000 },
   resave:true,
   saveUninitialized:true
  }))

app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store');
  next();
});

app.use(function (req, res, next) {
  res.locals.user = {}; // 객체를 초기화하여 에러 방지

  // 변수명 수정 및 객체 속성 설정
  res.locals.name = ""; // 기본값 또는 초기화
  res.locals.password = ""; // 기본값 또는 초기화
  res.locals.parent ="";
  res.locals.visitperson ="";

  if (req.session.member) {
    res.locals.name = req.session.member.name;
    res.locals.password = req.session.member.password;
    res.locals.parent = req.session.member.parent;
    res.locals.visitperson = req.session.member.설치담당;
  }
  next();
});

app.engine('ejs', require('ejs').__express)



//라우팅

app.get('/', (req,res) =>{
  res.render('test1') 
})


app.get('/upload', (req,res) =>{
  res.render('upload')
})

//로그인 라우팅

app.get('/yoonwoologin', (req,res) =>{
  res.render('yoonwoologin')
})


app.get('/saleslogin', (req,res) =>{
  res.render('saleslogin')
})

app.get('/buildlogin', (req,res) =>{
  res.render('buildlogin')
})


//입력하기
app.get('/aptinput', (req,res) =>{
  res.render('aptinput')
})

// 아파트 정보 입력
app.post('/addaptinput', (req, res) => {
  const paramCode = req.body.code;
  const paramAptname = req.body.aptname;
  const paramTelnumber = req.body.telnumber;
  const paramRegion = req.body.region;
  const paramAddress = req.body.address;
  const paramSalescompany = req.body.salescompany;
  const paramEvchager = req.body.evchager;
  const paramMinistry = req.body.Ministry;
  const paramVolume = req.body.volume;
  const paramPreinstallation_sales = req.body.preinstallation_sales;
  const paramPreinstallation_build = req.body.preinstallation_build;
  const paramParkingspace = req.body.parkingspace;
  const paramRequestdate = req.body.requestdate;
  const paramVisitperson = req.body.visitperson; 


  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error:', err);
      return res.status(500).send("<script>alert('데이터베이스 연결 오류'); location.href='/aptinput';</script>");
    }

    const query = 'INSERT INTO apt (관리코드, 아파트명, 연락처, 지역, 주소, 영업담당, 운영사, 환경부구분, 설치대수, 기설치_영업, 기설치_시공, 주차면수, 실사요청일, 실사담당) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';  
    connection.query(query, [paramCode, paramAptname, paramTelnumber, paramRegion, paramAddress, paramSalescompany, paramEvchager,paramMinistry,paramVolume,paramPreinstallation_sales, paramPreinstallation_build, paramParkingspace, paramRequestdate, paramVisitperson], (err, results) => {
      connection.release();

      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send("<script>alert('데이터베이스 쿼리 오류'); location.href='/aptinput';</script>");
      }

      console.log(results);
      return res.send("<script>alert('아파트 정보 및 실사 담당자가 등록되었습니다'); location.href='/aptinput';</script>");
    });
  });
});



//가입하기 라우팅

app.get('/signin', (req,res) => {
  res.sendFile(__dirname + '/views/signin.html')
})



app.get('/form', function (req, res) {
  res.render('form');
});





//mypage(조회) 라우팅

//운영사
app.get('/yoonwoomypage', function(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
        connection.query("SELECT * FROM apt where parent=?", [res.locals.parent], function(err, results) {
        if (err) {
          throw err;
        }
        res.render('yoonwooinfo', { lists: results }); // 'result'를 'results'로 수정
      });
    }
  });
});

//영업사 
app.get('/salesmypage', function(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
      connection.query("SELECT * FROM apt where 영업담당=?", [res.locals.name], function(err, results) {
        if (err) {
          throw err;
        }
        res.render('salesinfo', { lists: results }); 
      });
    }
  });
});

//설치사
app.get('/buildmypage', function(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
      connection.query("SELECT * FROM apt where 설치담당=?", [res.locals.name], function(err, results) {
        if (err) {
          throw err;
        }
        res.render('buildinfo', { lists: results }); 
      });
    }
  });
});



//회원가입 기능
app.post('/adduser', (req, res) => {
  const paramId = req.body.id;
  const paramName = req.body.name;
  const paramAge = req.body.age;
  const paramPassword = req.body.password;

  pool.getConnection(function(err, connection) {
    if (err) {
        throw err;
    } else {
      connection.query('INSERT INTO user (id, name, age, password) VALUES (?, ?, ?, ?)', [paramId, paramName, paramAge, paramPassword], function(err, results) {
            if (err)  
                throw err;
            else
                console.log(results);                        
        });
        connection.release();
        res.send("<script>alert('회원가입이 등록되었습니다'); location.href='/';</script>");
    }
  });

    
})





//로그인기능

//영업 로그인
app.post('/loginproc', (req, res) => {
  const paramName = req.body.name;
  const paramPassword = req.body.password;

  var sql = 'SELECT * FROM user WHERE name=? AND password=?'; // SQL 쿼리 수정: 'And'를 'AND'로 변경
  var values = [paramName, paramPassword];

  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    }

    connection.query(sql, values, function(err, results) {
      if (err) {
        connection.release(); // 에러 발생 시에도 연결 해제
        throw err;
      }
    
      if (results.length === 0) {
        res.send("<script>alert('존재하지 않는 회원이나 틀린 비번입니다.'); location.href='/login';</script>");
      } else {
        console.log(results[0]);
    
        // 세션에 사용자 정보 저장
        req.session.member = results[0]; // 사용자 정보를 세션에 저장
    
        res.send("<script>alert('로그인 되었습니다.'); location.href='/';</script>");        
      }
    });
  });
});


//로그아웃 기능
app.get('/logout', (req, res) => {
  
            // 세션에 사용자 정보 저장
        req.session.member = null; // 사용자 정보를 null을 저장
    
        res.send("<script>alert('로그아웃 되었습니다.'); location.href='/';</script>");        
      }
    );



//설치팀 로그인 기능
app.post('/buildloginproc', (req, res) => {
  const paramName = req.body.name;
  const paramPassword = req.body.password;

  var sql = 'SELECT * FROM builduser WHERE name=? AND password=?'; // SQL 쿼리 수정: 'And'를 'AND'로 변경
  var values = [paramName, paramPassword];

  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    }

    connection.query(sql, values, function(err, results) {
      if (err) {
        connection.release(); // 에러 발생 시에도 연결 해제
        throw err;
      }
    
      if (results.length === 0) {
        res.send("<script>alert('존재하지 않는 회원이나 틀린 비번입니다.'); location.href='/login';</script>");
      } else {
        console.log(results[0]);
    
        // 세션에 사용자 정보 저장
        req.session.member = results[0]; // 사용자 정보를 세션에 저장
    
        res.send("<script>alert('로그인 되었습니다.'); location.href='/';</script>");        
      }
    });
  });
});

//윤우본사 로그인 기능
app.post('/yoonwoologinproc', (req, res) => {
  const paramName = req.body.name;
  const paramPassword = req.body.password;

  var sql = 'SELECT * FROM parentuser WHERE name=? AND password=?'; // SQL 쿼리 수정: 'And'를 'AND'로 변경
  var values = [paramName, paramPassword];

  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    }

    connection.query(sql, values, function(err, results) {
      if (err) {
        connection.release(); // 에러 발생 시에도 연결 해제
        throw err;
      }
    
      if (results.length === 0) {
        res.send("<script>alert('존재하지 않는 회원이나 틀린 비번입니다.'); location.href='/login';</script>");
      } else {
        console.log(results[0]);
    
        // 세션에 사용자 정보 저장
        req.session.member = results[0]; // 사용자 정보를 세션에 저장
    
        res.send("<script>alert('로그인 되었습니다.'); location.href='/';</script>");        
      }
    });
  });
});


//실사담당자 입력 페이지 라우팅
app.get('/visitinput', function(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
      connection.query("SELECT * FROM apt where 설치업체=?", [res.locals.name], function(err, results) {
        if (err) {
          throw err;
        }
        res.render('visitinput', { lists: results }); // 'result'를 'results'로 수정
      });
    }
  });
});





//실사 업데이트 하는 기능
app.post('/visitinputproc', (req, res) => {
  const paramName = req.body.aptname2;   
  const paramVisitdate = req.body.visitdate;

  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
      console.log(paramName, paramVisitdate)
      connection.query(`UPDATE apt SET 실사완료일 = ? WHERE 아파트명 = ?`, [paramVisitdate, paramName], function(err, results) {
        if (err) {
          throw err;
        } else {
          console.log(results);
          connection.release();
          res.send("<script>alert('개통 정보 입력이 완료되었습니다.'); location.href='/visitinput';</script>");
        }
      });
    }
  });
});


//실사 업데이트 하는 기능
app.post('/visitinputproc2', (req, res) => {
  const paramName = req.body.aptname2;   
  const paramVisitfact = req.body.visitfact;
  const paramAdditionalfare = req.body.additionalfare;

  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
      console.log(paramName, paramVisitfact)
      connection.query(`UPDATE apt SET 실사내용 = ?, 추가비용여부 = ? WHERE 아파트명 = ?`, [paramVisitfact, paramAdditionalfare, paramName], function(err, results) {
        if (err) {
          throw err;
        } else {
          console.log(results);
          connection.release();
          res.send("<script>alert('개통 정보 입력이 완료되었습니다.'); location.href='/visitinput';</script>");
        }
      });
    }
  });
});


//설치사 입력 페이지 라우팅
app.get('/buildinput', function(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
      connection.query("SELECT * FROM apt where 설치업체=?", [res.locals.name], function(err, results) {
        if (err) {
          throw err;
        }
        else{           
          res.render('buildinput', { lists: results });
        }
        
      });
    }
  });
});

//설치 업데이트 하는 기능
app.post('/buildinputproc', (req, res) => {
  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    } else {
      // 동적으로 컬럼명을 사용하여 쿼리 구성
      let query = `UPDATE apt SET ?? = ? WHERE 아파트명 = ?`;
      connection.query(query, [columnName, columnValue, paramName], function(err, results) {
        if (err) {
          throw err;
        } else {
          console.log(results);
          connection.release();
          res.send("<script>alert('정보 업데이트가 완료되었습니다.'); location.href='/visitinputproc';</script>");
        }
      });
    }
  });
});



// JSON 파일 읽기
const awsConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

//s3에 업로드 하는 것
const s3 = new AWS.S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region
});

app.post('/upload_receiver', upload.single('userfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: 'jysevcar',
    Key: req.file.originalname, // 저장할 경로
    Body: req.file.buffer, // 파일 내용을 스트림으로 설정합니다.
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'S3 upload failed' });
    } else {
      console.log('File uploaded to S3:', data.Location);

      const paramName = req.body.aptname3; // 어떤 행(row)에 추가할지를 지정하는 값
      const estimateValue = data.Location; // s3로부터 반환받은 URL을 '견적서' 컬럼에 저장
      console.log(paramName,estimateValue)

            pool.getConnection(function(err, connection) {
        if (err) {
          throw err;        }

        connection.query('UPDATE apt SET 설치견적서 = ? WHERE 아파트명 = ?', [estimateValue, paramName], function(err, result) {
          if (err) {
            connection.release(); // 에러 발생 시에도 연결 해제
            throw err;
          }

          console.log(result);          

          connection.release(); // 연결 해제

          return res.status(200).send(`<script>alert('파일 업로드가 완료되었습니다. 객체 URL: ${data.Location}'); location.href='/visitinput';</script>`);
        });
      });
    }
  });
});



//s3에 업로드 하는 것 2번째
app.post('/upload_receiver2', upload.single('userfile2'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: 'jysevcar',
    Key: req.file.originalname, // 저장할 경로
    Body: req.file.buffer, // 파일 내용을 스트림으로 설정합니다.
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'S3 upload failed' });
    } else {
      console.log('File uploaded to S3:', data.Location);

      const paramName = req.body.aptname4; // 어떤 행(row)에 추가할지를 지정하는 값
      const dateLocation = data.Location; // s3로부터 반환받은 URL을 '견적서' 컬럼에 저장

      // SQL 쿼리문 생성
      var sql = 'UPDATE apt SET 수수료내역서 = ? WHERE 아파트명 = ?';

      var values = [dateLocation, paramName];

      pool.getConnection(function(err, connection) {
        if (err) {
          throw err;
        }

        connection.query(sql, values, function(err, result) {
          if (err) {
            connection.release(); // 에러 발생 시에도 연결 해제
            throw err;
          }

          console.log('견적서가 성공적으로 추가되었습니다.');

          // 성공한 경우 처리 로직을 추가할 수 있습니다.

          connection.release(); // 연결 해제

          return res.status(200).send(`<script>alert('파일 업로드가 완료되었습니다. 객체 URL: ${data.Location}'); location.href='/visitinput';</script>`);
        });
      });
    }
  });
});


//서류 올릴 때 아파트 찾기
app.post('/findaptname', (req, res) => {
  const paramName = req.body.aptname; 

  var sql = 'SELECT * FROM apt WHERE aptname=?';  
  var values = [paramName];

  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    }

    connection.query(sql, values, function(err, results) {
      if (err) {
        connection.release(); // 에러 발생 시에도 연결 해제
        throw err;
      }
    
      if (results.length === 0) {
        res.send("<script>alert('존재하지 않는 아파트 입니다.'); location.href='/form';</script>");
      } else {
        console.log(results[0]);
    
        // 세션에 사용자 정보 저장
        req.session.aptname = results[0]; // 사용자 정보를 세션에 저장
    
        res.send("<script>alert('아파트 검색 성공.'); location.href='/form';</script>");        
      }
    });
  });
});





app.listen(port, () => {
  console.log(`서버가 ${port}포트에서 실행되었습니다.`)
})