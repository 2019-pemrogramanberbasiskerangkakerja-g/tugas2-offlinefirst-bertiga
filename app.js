var express = require('express'),
    nano = require('nano')('http://localhost:5984'),
    users = nano.db.use('users'),
    qs = require('querystring'),
    bcrypt = require('bcrypt-nodejs'),
    session = require('express-session'),
    data = []

var app = express()
app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.get('/login', function(req, res){
    res.sendFile(__dirname + '/view/login.html')
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
                res.send('logged in')
            }
            else{
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
