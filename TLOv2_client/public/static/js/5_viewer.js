/*
* @Author: RejiKai
* @Date:   2018-11-17 17:49:00
* @Last Modified by:   ReJiKai
* @Last Modified time: 2019-03-02 21:38:14
*/
const socket = io.connect("http://"+domain+":"+port);

var contestants=[];
var questions=[];
var boku
var sfx = {	'15s': new Audio('/static/audio/VD_15s.wav'),
			'fu': new Audio('/static/audio/VD_giành.wav'),
			'correct': new Audio('/static/audio/VCNV_tl_đúng.wav')}

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

const checksound = () => {
	var ok = 0;
	Object.keys(sfx).map(s => ok = ok && (sfx[s].readyState === 4))
	if(ok){
		send_mess("viewer", "controller", "sound_ok")
	}
	else{
		setTimeout(() => {checksound()}, 2000)
	}
}

checksound()

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
	sfx['15s'].pause()
	sfx['15s'].currentTime = 0
	sfx['15s'].play().catch(err => this.play())
	$('#timer_slider').animate({opacity:'1'},0);
	$('#timer_slider').animate({width:'0px'},0,);
	$('#timer_slider').animate({width:'900px'},15000,"linear");
	$('#timer_slider').animate({opacity:'0'},1000);
}

const fu = (contestant) => {
	document.getElementById("name"	 + parseInt(parseInt(contestant) + 1)).style.background = "#ff8000";
	sfx['fu'].pause()
	sfx['fu'].currentTime = 0
	sfx['fu'].play().catch(err => this.play())
}

socket.on('message', (msg) => {
	msg = JSON.parse(b64DecodeUnicode(msg));
	let sender = msg[0].sender, content = msg[0].content, receiver = msg[0].receiver;
	if(receiver == "viewer"){
		switch(content){
			case 'correct': {
				sfx['correct'].pause();
				sfx['correct'].currentTime = 0
				sfx['correct'].play().catch(err => this.play());
			}
			break;
			case 'wrong': {
				sfx['wrong'].pause();
				sfx['wrong'].currentTime = 0
				sfx['wrong'].play().catch(err => this.play());
			}
			break;
			case 'start': start();
			break;
			case 'fu': fu(sender);
			break;
			case 'update': update();
			break;
			case 'next': update();
			break;
			case 'test': send_mess("viewer", "controller", "ok");
			break;
		}
	}
})

$(document).ready(() => {
	update();
})