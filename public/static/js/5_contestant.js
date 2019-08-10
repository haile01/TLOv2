'use strict'
const question = $("#question")
const fu = $("#fu")
const socket = io.connect("http://"+document.domain+":"+location.port)
var curques = -1, boku, questions = [], contestants = [];
var outoftime = 1;

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

function disabled(obj){
	obj.prop("disabled",true);
}

function enabled(obj){
	obj.removeAttr("disabled");
}

function send_mess(sender,receiver,content){
	return new Promise((res) => {
		var data=[];
		data.push({
			sender: sender,
			receiver: receiver,
			content: content
		});
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		socket.send(data);
	});
};

socket.on("disconnect", () => {
	socket.connect()
})

function disabled(obj){
	obj.prop("disabled",true)
}

function enabled(obj){
	obj.removeAttr("disabled")
}

const update = async () => {
	let res = await _fetch("/apix/read_file", {file: "static/data/status.txt"});
	res = b64DecodeUnicode(res); res = JSON.parse(res);
	console.log(res)
	curques = res[0].curques;
	res = await _fetch("/apix/read_file", {file: "static/data/5_question.txt"});
	res = b64DecodeUnicode(res); 
	questions = JSON.parse(res);
	console.log(questions)
		if(curques === "-1") question.html("Câu hỏi phụ");
		else{
			if(curques === "3") question.html("Kết thúc vòng câu hỏi phụ");
			else question.html(questions[curques]);
		}
	res = await _fetch("/apix/read_file", {file: "static/data/contestants.txt"});
	contestants = JSON.parse(b64DecodeUnicode(res));
	console.log(contestants)
	for(let index in contestants){
		let element=$(`#contestant${parseInt(parseInt(index)+1)}`);
		//let element    = $(`#contestant_${parseInt(index) + 1}`);
		let contestant=contestants[index];
		element.html(`${contestant.name} (${contestant.score})`);
		$("#name" + parseInt(parseInt(index) + 1)).html(contestants[index].name);
		$("#score" + parseInt(parseInt(index) + 1)).html(contestants[index].score);
	};
}

const start = () => {
	enabled(fu);
	enabled($("#fu"));
	outoftime = 0;
	// question.html(questions[curques])
	$('#timer_slider').animate({opacity:'1'},0);
	$('#timer_slider').animate({width:'0px'},0,);
	$('#timer_slider').animate({width:'900px'},15000,"linear");
	$('#timer_slider').animate({opacity:'0'},1000);
	setTimeout(function() {disabled($("#fu")); outoftime = 1;}, 15000);
}

const fuck = () => {
	if(!outoftime){
		send_mess(boku, "controller", "fu");
		send_mess(boku, "viewer", "fu");
	}
}

socket.on('message', (msg) => {
	msg = b64DecodeUnicode(msg)
	msg = JSON.parse(msg)
	let sender = msg[0].sender, receiver = msg[0].receiver, content = msg[0].content
	if(receiver == 'contestants'){
		switch(content){
			case "update": update();
			break;
			case "start": start();
			break;
			case "next": update();
			break;
			case "test": send_mess(boku, "controller", "ok");
			break;
		}
	}
})

$(document).ready(() => {
	update();
})