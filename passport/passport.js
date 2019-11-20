var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../model/user');

module.exports = function(passport){
    // duoc goi khi co request can xac thuc 
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('regular_login', new LocalStrategy({
            // lay 2 thuoc tinh 'email' va 'password' trong request
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true 
        },function(req,email,password,done){
            // tim nguoi dung trong co so du lieu 
            
            User.findOne({'local.email' : email}, function(err, user){
                if(err){
                    return done(err);
                };
                    
                //check xem user co ton tai k. neu khong ton tai gui lai thong bao khong ton tai
                if(!user){
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                };
                    
                // check xem mat khau da dung voi user chua. neu chua dung gui lai thong bao sai mat khau
                if (!user.validPassword(password)){
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                };
                return done(null, user);
            })
        }
    ))

    //passport cho requet signup 
    passport.use('regular_signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    }, function(req, email, password,done){
        process.nextTick(function(){
            User.findOne({'local.email':email}, function(err, user){
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'Email  đã tồn tại .'));
                } else {
                    var newUser            = new User();
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            })
        })
    }))
}