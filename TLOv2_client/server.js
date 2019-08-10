'use scrict'
const express = require("express")
const app = express();
const http = require("http")
const fs = require("fs")
const request = require('request')
const bodyParser = require('body-parser')
const { root, ip } = require('./env')
const server = http.createServer(app).listen(3001, () => {
	console.log("Running")
})

console.log(root + " " + ip)

// const io = require("socket.io")("http://" + root + ":3000")

///middleware

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
	res.json = (obj) => {
 		res.setHeader('Content-Type', 'application/json')
 		res.end(JSON.stringify(obj))
	}
	next()
})

// io.on("connection", (socket) => {
// 	socket.on("message", (msg) => {
// 		io.emit("message", msg)
// 	})
// 	socket.on("disconnected", () => {
// 		io.emit("shit")
// 	})
// })

app.use(express.static("public"))

app.get('/', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/aboutMe.html')
})

app.get('/index', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/index.html')
})

app.get('/controller', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/control.html')
})

app.get('/viewer/:rnd', (req, res) => {
	try{
		return res.sendFile(__dirname + '/public/templates/rounds/' + req.params.rnd + '_viewer.html')
	}
	catch(e){
		return e
	}	
})

app.get('/mc/:rnd', (req, res) => {
	try{
		return res.sendFile(__dirname + '/public/templates/rounds/' + req.params.rnd + '_mc.html')
	}
	catch(e){
		return e
	}	
})

app.get('/contestant/:rnd/:id', (req, res) => {
	try{
		return res.sendFile(__dirname + '/public/templates/rounds/' + req.params.rnd + '_' + req.params.id + '_contestant.html')
	}
	catch(e){
		return e
	}
})

app.get('/summary', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/summary.html')
})

app.get('/apix/update_file', (req, res) => {
	var path = __dirname + '/public/' + req.query.file
	var data = req.query.data
	fs.writeFile(path, data, (err) => {if(err) console.log(err)})
	res.status(200).send('OK')
})

app.get('/apix/read_file', (req, res) => {
	let data = request.get({url: 'http://' + root + ':3000/apix/read_file', qs: {file: req.query.file}}, (err, _res, body) => {
		if(err) return console.log(err)
		// console.log(body)
		res.end(body)
	})
})

app.post('/apix/read_file', (req, res) => {
	console.log(req.body.file)
	try{
		let data = request.get({url: 'http://' + root + ':3000/apix/read_file', qs: {file: req.body.file}}, (err, _res, body) => {
			console.log(body)
			res.end(body)
		})	
	}
	catch(err) {console.log(err)}
})

// request.get({url: 'http://127.0.0.1:3000/apix/read_file', qs: {file: 'static/data/contestants.txt'}}, (err, res, body) => {
// 	if(err) {console.log(err); return}
// 	console.log(body)
// })