var express = require('express'),
    nano = require('nano')('http://localhost:5984'),
    nanoweb = require('nano')('https://couchdb-2ac681.smileupps.com/'),
    usersweb = nanoweb.db.use('users'),
    users = nano.db.use('users'),
    log = nano.db.use('log'),
    qs = require('querystring'),
    bcrypt = require('bcrypt-nodejs'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    internetAvailable = require("internet-available"),
    data = []

var app = express()

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

app.get('/', function (req, res) {
    if(req.session.username) loggedIn(req, res)
    else res.redirect('/login')

    internetAvailable().then(function(){
        console.log("Internet available")
    }).catch(function(){
        console.log("No internet")
    })
})

app.get('/login', function(req, res){
    res.sendFile(__dirname + '/view/login.html')
})

app.post('/login', function(req, res){

    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    //internetAvailable().then(function(){
        var body = ''
        req.setEncoding('utf-8')
        req.on('data', function(chunk){
            body += chunk
        })
        req.on('end', function(){
            var data = qs.parse(body)
            users.get(data.username, function(err, body){
                if(err){
                    usersweb.get(data.username, function(err, body){
                        if(err) res.send('user not found')
                        else if(bcrypt.compareSync(data.password, body.password)){
                            req.session.username = data.username
                            console.log('online db: '+req.session.username)
                            log.insert({ _id: dateTime, log: "login suksess" })
                            loggedIn(req, res)
                        }
                        else{
                            log.insert({ _id: dateTime, log: "login gagal (password salah)" })
                            res.send('password wrong')
                        }
                    })
                }
                else{
                    if(bcrypt.compareSync(data.password, body.password)){
                        req.session.username = data.username
                        console.log('offline db: '+req.session.username)
                        log.insert({ _id: dateTime, log: "login suksess" })
                        loggedIn(req, res)
                    }
                    else{
                        log.insert({ _id: dateTime, log: "login gagal (password salah)" })
                        res.send('password wrong')
                    }
                }
            })
        })
    /*}).catch(function(){
        if()
        log.insert({ _id: dateTime, log: "login gagal (no connection)" })
        res.send('tidak terhubung ke internet')
    })*/
})

app.get('/register', function(req, res){
    res.sendFile(__dirname + '/view/register.html')
})

app.post('/register', function(req, res){

    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    internetAvailable().then(function(){
        var body = ''
        req.setEncoding('utf-8')
        req.on('data', function(chunk){
            body += chunk
        })
        req.on('end', function(){
            var data = qs.parse(body)
            if(data.password == data.password_confirm){
                usersweb.insert({ _id: data.username, username: data.username, password: bcrypt.hashSync(data.password) }, null, function (err, body) {
                    if (err) console.log(err)
                    else console.log(body)
                })
                res.send('Register sukses')
            }
            else res.send('Password gak bener nih')
        })
    }).catch(function(){
        log.insert({ _id: dateTime, log: "register gagal (no connection)" })
        res.send('tidak terhubung ke internet')
    })
})

app.get('/logout', function(req, res){
    req.session.username = null
    res.redirect('/login');
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})

function loggedIn(req, res){
    res.send('Hello, '+req.session.username+'<br> <a href='+'/logout'+'>Logout</a>')
}
