var express = require('express');
var router = express.Router();

var app = express();



var io = require('../app.js') ;






var posts = require('../models/posts') ;
var conversation = require('../models/conversation') ;

var user = require('../models/user') ;



/*var csrf = require('csurf') ;
var csrfProtection = csrf({ cookie: true })
router.use(csrfProtection) ;*/

var path  = require("path") ;
var fs = require('fs');

const fileUpload = require('express-fileupload');

router.use(fileUpload());

 

router.get('/' , function(req, res, next) {

    posts.find().sort({ date: -1 }).
   populate("user").
   exec(function (err, posts) {

 if (err) return err;
 res.render('shop/index',{"posts": posts ,"cuser":req.user} );

});
    
});

router.get('/friends' , function(req, res, next) {

    user.find().
   exec(function (err, user) {

 if (err) return err;
 res.render('shop/friendspublic',{"friends": user } );

});
    
});

router.get('/addfriend/:id' , function(req, res, next) {

    var fr_id = req.params.id ;
     console.log("res"+fr_id) ;

    user.findByIdAndUpdate(              
        req.user._id,
        {$push: {"friends":fr_id }}, 
        {new: true},
        function(err,user){
            if(err){
                res.json({error :err}) ; 
            }
            res.redirect(req.get('referer'));

       }); 
    
});

router.get('/deletefriend/:id' , function(req, res, next) {

    var fr_id = req.params.id ;

    user.findByIdAndUpdate(              
        req.user._id,
        {$pull: {"friends":fr_id }}, 
        {new: true},
        function(err,user){
            if(err){
                res.json({error :err}) ; 
            }
            res.redirect(req.get('referer'));

       }); 
    
});


router.get('/like/:id' ,function(req, res, next) {
    
    const post_id = req.params.id ;
    const cuser_id = req.user.id ;

    posts.findByIdAndUpdate(
        post_id,
        {$push: {"likes":cuser_id }}, 
        {new: true},
        function(err,user){
            if(err){
                res.json({error :err}) ; 
            }
            res.redirect(req.get('referer'));

       }); 
});

router.post('/comment/:id' ,function(req, res, next) {
    
    const post_id = req.params.id ;
    const cuser_id = req.user.id ;
    const comment = req.body.comment ;
    var date = new Date() ;


    posts.findByIdAndUpdate(
        post_id,
        { "$push": { "comments": { "text":comment , "date": date , "user": cuser_id } }}, 
        {new: true},
        function(err,posts){
            if(err){
                res.json({error :err}) ; 
            }
            res.redirect(req.get('referer'));
            console.log("posts is"+posts.comments) ;

       }); 
});

router.get('/show/:id', function(req, res, next) {

    var arr = []  ;


    posts.findOne({_id: req.params.id}).
       populate("user").
       exec(async function (err, post) {


        for (var i=0; i < post.comments.length; i++) {

            var comm_user =await user.findOne({_id:post.comments[i].user}) ;
            arr.push([comm_user,post.comments[i].text]);
       }

        console.log("hhh"+ arr) ;
     if (err) return err;
      res.render('shop/show',{
         "post": post ,"comments":arr ,"user":req.user
});

});

    /* how i populate user object which inside comments objects 
     */
});




router.get('/profile/:id' ,function(req, res, next){
    var cuser= req.params.id ;
     posts.
     find({user:cuser}).
     populate("user").
    exec(async function (err, posts) {

       const suser = await user.find({_id:cuser}).populate("friends") ;
       const user_logged = await user.find({_id:req.user._id}) ;
       var friends_of_current= user_logged[0].friends;

       console.log("50505"+suser ) ;

       const your_prof=cuser.toString() === req.user._id.toString() ;
        
        const friends = suser[0].friends ;
         
     if (err) return err;
      res.render('user/profile' , {cuser:suser[0], posts:posts ,
        friends:friends ,is_logged:friends_of_current.toString().includes(cuser.toString())
        ,your_prof:your_prof
     }); 
              /*  المشكلة كانت في السطر 187 لان اليوزر الجديد بيبقي مالهوش بوست  */
});

});



router.get('/user/messages'  , isLoggedIn , function(req, res, next) {


    var cuser = req.user ;
    let fuser ;
     var arr = []  ;

      

  conversation.find( { $or: [ {'sender':cuser._id}, {'reciever':cuser._id} ] })
    .populate('sender')
    .populate('reciever')
    .exec(function (err, conversations) {
         for (var i=0; i < conversations.length; i++) {
            if (conversations[i].sender._id.toString() != cuser._id.toString()) {
                 fuser = conversations[i].sender ;
                 arr.push([conversations[i],fuser]);
               }
              else if (conversations[i].reciever._id.toString() != cuser._id.toString()){
                fuser = conversations[i].reciever ;
                arr.push([conversations[i],fuser]);

              }
            

        }
         res.render('shop/messages' ,{"conversations":arr  } );

    });

  

});




io.on('connection',function(socket){
    socket.on('typing' , function(data){

        // how i access to authenticated user  here
       
        socket.broadcast.emit('typing' ,{userph:data.user})  ;
         

      
      });
})  ;


 router.get('/user/messages/:id'  , isLoggedIn , async function(req, res, next) {
    var    fuser_id = req.params.id ;
    var fuser = await user. findById(fuser_id) ;
    var arr = []  ;
    var cuser = req.user ;


    
     
     conversation.find( { $or:[{$and: [ {'sender':cuser._id}, {'reciever':fuser_id} ]},{$and: [ {'sender':fuser_id}, {'reciever':cuser._id} ]}]  }
     ,function (err, conv){
            
        conversation.find( { $or: [ {'sender':cuser._id}, {'reciever':cuser._id} ] })
    .populate('sender')
    .populate('reciever')
    .exec(function (err, conversations) {
         for (var i=0; i < conversations.length; i++) {
            if (conversations[i].sender._id.toString() != cuser._id.toString()) {
                 fruser = conversations[i].sender ;
                 arr.push([conversations[i],fruser]);
               }
              else if (conversations[i].reciever._id.toString() != cuser._id.toString()){
                fruser = conversations[i].reciever ;
                arr.push([conversations[i],fruser]);

              }
            

        }
    res.render('shop/spmessage', {"conv":conv[0] ,"fuser":fuser ,"cuser":cuser ,"conversations":arr } );

    });

   });
  
 });

router.post('/message/:id',isLoggedIn ,async function(req ,res ,next){

    var cuser = req.user ;

      var    fuser_id = req.params.id ;
  var fuser = await user. findById(fuser_id) ;
  var text = req.body.text ;
  var date = new Date() ;
 
 conversation.findOneAndUpdate({ $or:[{$and: [ {'sender':cuser._id}, {'reciever':fuser_id} ]},{$and: [ {'sender':fuser_id}, {'reciever':cuser._id} ]}]  },
 {$push: {messages: {msgvalue: text, msgsender: cuser.ph}}},  function(err , conv){
 

   if(conv){
        console.log("exist") ;
        io.sockets.emit('chat', {text:text,textowner:cuser.ph});

     }
    else{
        console.log("new..") ;

        conversation.create({
            "messages": [ {"msgvalue":text, "msgsender":cuser.ph}],
            "date": date,
            "sender": cuser._id ,
            "reciever": fuser._id ,
        }, function(err,conv){
        
            user.findByIdAndUpdate(
                cuser._id,
                {$push: {"messages":conv._id }}, 
                {new: true},
                function(){
                    
                    user.findByIdAndUpdate(
                        fuser_id,
                        {$push: {"messages":conv._id }}, 
                        {new: true},function(){
                            res.redirect(req.get('referer')); 

                        }
                        );
     }); 
         }) ;

    }
}) ;
  

 
    
 }) ;


 


 router.post('/addpost' ,function(req, res, next) {
    
    var body = req.body.content;
   var file = req.files.foo ;
    var date = new Date() ;
    var cuser = req.user ;

    
    

    
    file.mv(path.join(__dirname ,"/uploads/" + file.name ), err => { 
        if (err) throw err;
        console.log("file moved succ" );
        });

        posts.create({
            
            "body": body ,
            "date":date ,
            "file":file.name ,
            "user":req.user.id
          },  function(err, post){
            if(err){
                res.send('There was an issue submitting the post');
            } else {

                user.findByIdAndUpdate(req.user._id, {
                    $push: { posts: post._id }
                  }, { 'new': true},function(){
                    res.redirect('/') ; 

                });
            }
        });
    }); 
 

    
    router.get('/user/inf', isLoggedIn ,function(req, res, next){
        
    
        res.render('user/inf'  );
    });
    
      router.post('/inf/:id' , function(req, res, next){
        var patid = req.params.id ;
    
        var name = req.body.name ;
        var phone = req.body.phone ;
        var bday = req.body.bday ;
        var city = req.body.city ;
    
        var file = req.files.foo
    
    file.mv(path.join(__dirname ,"/uploads2/" + file.name ), err => { 
    if (err) throw err;
    console.log("file moved succ" );
    });
        console.log(req.files.foo);
    
            user.findByIdAndUpdate(
            patid,
            {$set: {"name": name,
            "phone": phone,
            "bday": bday,
            "city": city ,
            "ph" :file.name
            
          }}, 
            {new: true},
            function(err,user){
                if(err){
                    res.json({error :err}) ; 
                }
                console.log(user) ;
    
            });
            res.redirect('/') ;
    }) ;

  function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
         return next() ;
    }
    res.redirect('/user/signin') ;
}
function notLoggedIn(req, res, next){
   if(!req.isAuthenticated()){
        return next() ;
   }
   res.redirect('/') ;
}
module.exports = router;
