//
var ws = null;

var localName;

var remoteName;

var command;

var type = "pc";

var logined = false;


//initWebSocket();

function initWebSocket(){
	
	ws = new WebSocket('ws://120.78.219.209:3001');
	ws.onopen = function (event) {
		console.log('open');
		var obj = {
			"type":"init_pc",
			"localName":localName
		};
		ws.send(JSON.stringify(obj));
		
	};
	ws.onmessage=function (event) {
		var receivedMessage = event.data;
		var obj = JSON.parse(receivedMessage);
		console.log(receivedMessage);
		document.getElementById("list").value = obj.type  ;
		switch (obj.type){
			case "status":
				document.getElementById("list").value= obj.status;
				break;
			case "usrlist":
				var usr = obj.usrlist;
				var str = "用户列表："
				console.log(usr.length.toString()+"?");
				for(i=0;i<usr.length;i++)
				{
					str = str + usr[i]+","
				}
				document.getElementById("list").value= str;
				break;
			case "request":
				document.getElementById("list").value= obj.localName+"请求视频";
				break;
			default:
				break;
		}
		
	};
	ws.onclose = function () {
		logined=false ;
		//setTimeout(initWebSocket,10000);
	};
}

function usrList(){
	if (logined){
		localName = document.getElementById("localname").value.trim();
		document.getElementById("list").value ="";
		command = "listReq"
		var obj ={
			"type":type,
			"localName":localName,
			"command":command
		};
		ws.send(JSON.stringify(obj));
		
	}
}

function chatEnd(){
	
	var iframe = document.getElementById('chat');
	var targetOrigin = 'https://120.78.219.209/index.html';
	iframe.contentWindow.postMessage('closeMe',targetOrigin);
	
	//document.getElementById('chat').src=src;
	//document.getElementById('chat').contentWindow.location.reload(true);
	
	remoteName = document.getElementById("remotename").value.trim();
	document.getElementById("list").value ="";
	if(remoteName == null)
	{
		alert("请输入对方名称！");
	}
	else
	{
		if (logined ){
			command = "chatEnd";
			var obj ={
				"type":type,
				"localName":localName,
				"remoteName":remoteName,
				"command":command
			};
			ws.send(JSON.stringify(obj));
		}
		else
		{
			alert("请登录！")
		}
	}
}

function chatCommand(){
	document.getElementById("list").value ="";
    remoteName = document.getElementById("remotename").value.trim();
	if(remoteName == null)
	{
		alert("请输入对方名称！");
	}
	else
	{
		if (logined ){
			
			if (remoteName != null)
			{
				document.getElementById("chat").src = "https://120.78.219.209/index.html?"+localName;//+"@"+remoteName;
			}
			
			command = "chatCommand";
			var obj ={
				"type":type,
				"localName":localName,
				"remoteName":remoteName,
				"command":command
			};
			ws.send(JSON.stringify(obj));
		}
		else
		{
			alert("请登录！")
		}
	}
	
	
}

function avCommand(){
	document.getElementById("list").value ="";
	remoteName = document.getElementById("remotename").value;
	if(remoteName == null )
	{
		alert("请输入对方名称！");
	}
	else
	{
		command = "avCommand";
		if (logined){
			var obj ={
				"type":type,
				"localName":localName,
				"remoteName":remoteName,
				"command":command
			};
			ws.send(JSON.stringify(obj));
		}
		else
		{
			alert("请先登录！");
		}
	}
	
	
}

function adCommand(){
	//localNameName = document.getElementById("localname").value;
	document.getElementById("list").value ="";
	remoteName = document.getElementById("remotename").value;
	if(remoteName == null )
	{
		alert("请输入对方名称！");
	}
	else{
		if (logined ){
			command = "adCommand";
			var obj ={
				"type":type,
				"localName":localName,
				"remoteName":remoteName,
				"command":command
			};
			ws.send(JSON.stringify(obj));
		}
		else
		{
			alert("请先登录！");
		}
	}
	
}

function login(){
	localName = document.getElementById("localname").value.trim();
	document.getElementById("list").value ="";
	if(localName != null)
	{
		initWebSocket();//初始化weibsocket
		document.getElementById("chat").src = "https://120.78.219.209/index.html?"+localName;
		logined = true;
	}
	else
	{
		alert("请输入本机名称！");
	}
	
}

function onloaded(){
	//alert("welcome!");
}

/*
function postMessage(){
	var obj = {
		msg:"closeMe"
	};
	var iframe = document.getElementById('chat');
	var win = iframe.contentWindow;
	win.postMessage(obj,'https://120.78.219.209/index.html');
	console.log(obj);
}*/
