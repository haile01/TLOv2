const takeb = $("#takeb");
const score=$("#score");
const question=$("#question");
const pack=$("#pack");

var socket = io.connect("http://"+document.domain+":"+location.port);
var contestants=[];
var questions=[];
var pks=[40,60,80];
var time=[[10,10,15],[10,15,20],[15,20,20]];
var curcon, curpack, curques
$("#star").hide();

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

if(window.outerWidth < 1200){
	$("#scoretab").hide()
}

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

socket.on("disconnect",function(){
	socket.connect();
})

var sfx = {	'wrong': new Audio('/static/audio/VD_sai.wav'),
			'correct': new Audio('/static/audio/VD_đúng.wav'),
			'showques': new Audio('/static/audio/TT_mở_câu_hỏi.wav'),
			'showans_pre': new Audio('/static/audio/TT_đáp_án.wav'),
			'showans': new Audio('/static/audio/TT_kết_quả_next.wav'),
			'showpack_pre': new Audio('/static/audio/VD_lên_bục.wav'),
			'showpack': new Audio('/static/audio/VD_chọn_gói.wav'),
			'start': new Audio('/static/audio/VD_vào_thi.wav'),
			'10': new Audio('/static/audio/VD_10s.wav'),
			'15': new Audio('/static/audio/VD_15s.wav'),
			'20': new Audio('/static/audio/VD_20s.wav'),
			'wait': new Audio('/static/audio/VD_chờ_giành.wav'),
			'star': new Audio('/static/audio/VD_NSHV.wav'),
			'fu': new Audio('/static/audio/VD_giành.wav'),
			'done': new Audio('/static/audio/VD_chúc_mừng.wav'),
		}

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

disabled(takeb);

const actived = (index) => {
	console.log(index);
	for(var i=1;i<=4;i++){
		$(`#contestant${parseInt(i)}`).parent().removeClass("active");
	}
	if (index > 4) {
		question.html("Hoàn thành vòng thi về đích :3");
		return;
	}
	else{
		if(index==0){
			question.html("Vòng thi về đích bắt đầu!");
		}
		else{
			question.html("Vòng thi về đích của "+contestants[index-1].name);
			$(`#contestant${parseInt(index)}`).parent().addClass("active");
			score.html(parseInt(contestants[index-1].score));
		}	
	}
};


async function update(){
	await _fetch("/apix/read_file",{file:"static/data/status.txt"}).then((res) => {
		res = b64DecodeUnicode(res);
		res = JSON.parse(res);
		curcon=res[0].curcon;
		curpack=res[0].curpack;
		curques=res[0].curques;
		console.log(curcon+" "+curpack+" "+curques);
	})
	await loadques()
	await _fetch("/apix/read_file",{file:"static/data/contestants.txt"}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants= JSON.parse(res);
		for(index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+")");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}	
		actived(parseInt(curcon)+1);
		try{
			question.html(questions[curcon][curpack][curques]);
			score.html(contestants[curcon].score);
			pack.html("Gói "+pks[curpack]);
		}
		catch(err){}
	})
}

function loadques(){
	_fetch("/apix/read_file",{file:"static/data/4_question.txt"}).then((res) => {
		res = b64DecodeUnicode(res);
		questions= JSON.parse(res);
	});
}

function next(){
	curques = -1
	curcon++;
	actived(parseInt(curcon)+1);
}

function showques(){
	question.html(questions[curcon][curpack][curques]);
}

function start(){
	var timetmp = time[curpack][curques]
	$("#timer_slider").animate({width:"900px"},timetmp*1000,"linear");
	$("#timer_slider").animate({opacity:"0"},1000,"linear");
	console.log(timetmp)
	sfx[timetmp].pause();
	sfx[timetmp].currentTime = 0
	sfx[timetmp].play().catch(err => this.play());
}

function wait(){
	sfx['wait'].pause();
	sfx['wait'].currentTime = 0;
	sfx['wait'].play().catch(err => this.play());
}

function wrong(){
	sfx['wrong'].pause();
	sfx['wrong'].currentTime = 0;
	sfx['wrong'].play().catch(err => this.play());
	_fetch("/apix/read_file",{file:"static/data/contestants.txt"}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants= JSON.parse(res);
		for(index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+")");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
		score.html(contestants[curcon].score);
	})
}

function correct(){
	sfx['correct'].pause()
	sfx['correct'].currentTime = 0
	sfx['correct'].play().catch(err => this.play())
	_fetch("/apix/read_file",{file:"static/data/contestants.txt"}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants= JSON.parse(res);
		for(index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+")");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
		score.html(contestants[curcon].score);
	});
}

function nextques(){
	curques++;
	fuck = 0;
	if(curques<3){
		question.html("Câu hỏi thứ "+parseInt(parseInt(curques)+1));
	}
	else{
		question.html(contestants[curcon].name + " đã hoàn thành phần thi về đích")
		sfx['done'].pause()
		sfx['done'].currentTime = 0
		sfx['done'].play().catch(err => this.play())
	}
	$("#timer_slider").animate({width:"0px",opacity:"1"},0,);
	$("#star").hide();
	for(var i = 1; i <= 4; i++){
		document.getElementById("contestant"+i).style.background="white";
	}
}

function fu(index){
	if(fuck) return;
	sfx['fu'].pause()
	sfx['fu'].currentTime = 0
	sfx['fu'].play().catch(err => this.play())
	document.getElementById("contestant"+parseInt(parseInt(index)+1)).style.background="#ff8000"
	fuck = 1
}

function hope(){
	sfx['star'].pause()
	sfx['star'].currentTime = 0
	sfx['star'].play().catch(err => this.play())
	$("#star").show();
}

function showpack(){
	sfx['showpack_pre'].pause()
	sfx['showpack_pre'].currentTime = 0
	sfx['showpack_pre'].play().catch(err => this.play())
	$("#pack40").animate({width:"100px"},10);
	$("#pack60").animate({width:"100px"},10);
	$("#pack80").animate({width:"100px"},10);
	$("#pack40").html("40");
	$("#pack60").html("60");
	$("#pack80").html("80");
	setTimeout(function(){
	$("#packs").animate({marginLeft:"-=250px"},3000);
	sfx['showpack'].pause()
	sfx['showpack'].currentTime = 0
	sfx['showpack'].play().catch(err => this.play())
	},5000);
}

socket.on("message",(msg) => {
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let sender=msg[0].sender;
	let receiver=msg[0].receiver;
	if(receiver=="viewer"){
		switch(content){
			case "update":update();
			break;
			case "loadques":loadques();
			break;
			case "next":next();
			break;
			case "showques":showques();
			break;
			case "start": start();
			break;
			case "wait": wait();
			break;
			case "wrong": wrong();
			break;
			case "correct": correct();
			break;
			case "nextques": nextques();
			break;
			case "hope":hope();
			break;
			case "fu":fu(sender);
			break;
			case "test":send_mess("viewer","controller","ok");
			break;
			case "showpack":showpack()
			break;
		};
		if(content.slice(0,4)=="pack"){
			curpack=parseInt(content.slice(4,content.length));
			switch(curpack){
				case '40':{
					$("#pack60").html("0");
					$("#pack80").html("0");
				}
				break;
				case '60':{
					$("#pack40").html("0");
					$("#pack80").html("0");
				}
				break;
				case '80':{
					$("#pack60").html("0");
					$("#pack40").html("0");
				}
				break;
			}
			$("#packs").animate({marginLeft:"+=250px"},3000);
			pack.html("Gói "+pks[curpack]);
			sfx['start'].pause();
			sfx['start'].currentTime = 0;
			sfx['start'].play().catch(err => this.play());
		}
	}
})

$(document).ready(() => {
	update();
})