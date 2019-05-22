var socket = io.connect('http://localhost:3000');


var header = document.getElementById("myHeader");
var message = document.getElementById("message");
var btn = document.getElementById("send");
var output = document.getElementById("output");

var fera = document.getElementById("fera");


var type = document.getElementById("type");




message.addEventListener('keypress', function(){

  socket.emit('typing',{user:fera.value}) ;

});

message.addEventListener('mouseleave', function(){

  type.text="hh" ;

});

socket.on('typing',function(data){
  console.log("hgt"+data.userph) ;
 const newMsgHTML = `
  <div class="">
   <img src="http://localhost:3000/${data.userph}" alt="sunil"> 
   <p> .....</p>
  </div>
`;

type.innerHTML = newMsgHTML;



}) ;



socket.on('chat',  function(data){
  console.log("rer"+ data) ;
  type.innerHTML="" ;

  message.value = "";

    const newMsgHTML = `
   <div class="">
   <div class="incoming_msg_img" > <img src="http://localhost:3000/${data.textowner}" alt="sunil"> </div>
              

   <div class="received_msg" >
     <div class="received_withd_msg">
       <p class="chp" >
       ${data.text}
        </p>
       <span class="time_date"> 11:01 AM    |    June 9</span></div>
   </div>
      </div>
`;



output.innerHTML += newMsgHTML;


}) ;


