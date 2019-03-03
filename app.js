var express = require('express'),
    nano = require('nano')('http://localhost:5984'),
    nanoweb = require('nano')('https://couchdb-2ac681.smileupps.com/'),
    users = nanoweb.db.use('users'),
    log = nano.db.use('log'),
    qs = require('querystring'),
    bcrypt = require('bcrypt-nodejs'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    data = []

var app = express()

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.get('/login', function(req, res){
    if(req.session.username) {
        res.send('logged in')
    }
    else res.sendFile(__dirname + '/view/login.html')
})

app.post('/login', function(req, res){
    var body = ''
    req.setEncoding('utf-8')
    req.on('data', function(chunk){
        body += chunk
    })
    req.on('end', function(){
        var data = qs.parse(body)
        users.get(data.username).then((body) => {
            if(bcrypt.compareSync(data.password, body.password)){
                // var sess = {
                //     secret: genuuid(),
                //     cookie: {}
                // }
                // app.set('truct proxy', 1)
                // sess.cookie.secure = true
                req.session.username = data.username
                console.log(req.session.username)
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date+' '+time;
                log.insert({ _id: dateTime, log: "login suksess" })
                res.send('logged in')
            }
            else{
                log.insert({ _id: dateTime, log: "login gagal (password salah)" })
                res.send('password wrong')
            }
        })
    })
})

app.get('/register', function(req, res){
    res.sendFile(__dirname + '/view/register.html')
})

app.post('/register', function(req, res){
    var body = ''
    req.setEncoding('utf-8')
    req.on('data', function(chunk){
        body += chunk
    })
    req.on('end', function(){
        var data = qs.parse(body)
        if(data.password == data.password_confirm){
            users.insert({ _id: data.username, username: data.username, password: bcrypt.hashSync(data.password) }, null, function (err, body) {
                if (err) console.log(err)
                else console.log(body)
            })
            res.send('Register sukses')
        }
        else res.send('Password gak bener nih')
    })
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
