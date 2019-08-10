/*
* @Author: RejiKai
* @Date:   2018-11-17 17:49:00
* @Last Modified by:   ReJiKai
* @Last Modified time: 2019-03-02 21:38:10
*/
const socket = io.connect("http://"+domain+":"+port);

var contestants=[];
var questions=[];
var boku

const question = $("#question")

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

socket.on("disconnect",function(){
	socket.connect();
})

function send_mess(sender,receiver,content){
	var data=[];
	data.push({
		sender: sender,
		receiver: receiver,
		content: content
	});
	data=JSON.stringify(data);
	data=b64EncodeUnicode(data);
	socket.send(data);
};

const update = async () => {
	await _fetch("/apix/read_file", {file: 'static/data/status.txt'}).then((res) => {
		res = JSON.parse(b64DecodeUnicode(res));
		curques = res[0].curques;
	})
	_fetch("/apix/read_file",{file:"static/data/contestants.txt"}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants = JSON.parse(res);
		console.log(contestants);
		if(curques === "-1") question.html("Câu hỏi phụ");
		else{
			if(curques === "3") question.html("Kết thúc vòng câu hỏi phụ");
			else question.html(questions[curques]);
		}
		for(index in contestants){
			let element=$(`#contestant${parseInt(parseInt(index)+1)}`);
			//let element    = $(`#contestant_${parseInt(index) + 1}`);
			let contestant=contestants[index];
			element.html(`${contestant.name} (${contestant.score})`);
			$("#name" + parseInt(parseInt(index) + 1)).html(contestants[index].name);
			$("#score" + parseInt(parseInt(index) + 1)).html(contestants[index].score);
		};
	})
	loadques();
	for(var i = 0; i < 4; i++)
	document.getElementById("name" + parseInt(parseInt(i) + 1)).style.background = "#9900cc";
}

const loadques = () => {
	_fetch("/apix/read_file",{file:"static/data/5_question.txt"}).then((callback) => {
		questions=b64DecodeUnicode(callback);
		questions=JSON.parse(questions);
		console.log(questions);
	});
}

const start = () => {
	question.html(questions[curques]);
	$('#timer_slider').animate({opacity:'1'},0);
	$('#timer_slider').animate({width:'0px'},0,);
	$('#timer_slider').animate({width:'900px'},15000,"linear");
	$('#timer_slider').animate({opacity:'0'},1000);
}

const fu = (contestant) => {
	document.getElementById("name" + parseInt(parseInt(contestant) + 1)).style.background = "#ff8000";
}

socket.on('message', (msg) => {
	msg = JSON.parse(b64DecodeUnicode(msg));
	let sender = msg[0].sender, content = msg[0].content, receiver = msg[0].receiver;
	if(receiver == "viewer"){
		switch(content){
			case 'start': start();
			break;
			case 'fu': fu(sender);
			break;
			case 'update': update();
			break;
			case 'next': update();
			break;
			case 'test': send_mess("mc", "controller", "ok");
			break;	
		}
		if(content.slice(0,7) == "message"){
			let mess = content.slice(7);
			$("#message").html(mess);
			if($("#close").html() == "&lt;") sidenav();
			return;
		}
	}
})

function sidenav(){
	if($("#close").html() == "&gt;"){
		document.getElementById("sidenav-content").style.width = "0px";
		document.getElementById("sidenav").style.width = "40px";		
		$("#close").html("<")
	}
	else{
		document.getElementById("sidenav").style.width = "400px";		
		document.getElementById("sidenav-content").style.width = "360px";
		$("#close").html(">")
	}
}

const mcmessage = $("#mcmessage")

mcmessage.change(() => {
	send_mess('mc', 'controller', 'message' + mcmessage.val())
	mcmessage.val('');
	console.log(mcmessage.val());
})

$(document).ready(() => {
	update();
})