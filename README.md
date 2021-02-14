# Git/Github
* First of all make account on GitHub and create a repository on it.
* Then download git terminal from  [Githublink](https://git-scm.com/downloads) .
* 	Create a folder and open the terminal by right clicking and click on git bash here
 *	Write “git init” to initialize git in the folder
*	Then “git add <filename>” to add the files
*	“Git commit –m <message>” to commit the files
*	Then copy the http link from gethub web 
*	“Git remote add origin <link>” to add as remote repository
*	To push type  “git push –u origin master”
#


# MERN Basic Login Registration Application
## Introduction
This is a basic Web App which which is build with MERN stack registers the user,logs in and logs out the user.
### Software Used in this Project
* **Visual Studio Code**
## Installing Dependendencies
```BASH
npm init -y
npm install express
npm install mongoose
npm install cookie-parser
npm install nodemon -g 
npm install 
```
## React Enviornment
* Then type “create react-app client” it will create an environment to create a react app
* Then create a new file in my case I created It as app.js
* Now in it import the modules
```javascript
const express= require('express');
const app=express();
const cookieParser=require('cookie-parser');
const mongoose=require('mongoose');
```
* After that use the modules

```javascript
app.use(cookieParser());
app.use(express.json());
```
### Connecting DataBase

Now As its is a MERN app so for Database we are using mongoDB and to connect it download mongoDB locally and connect it through mongoose
```javascript
mongoose.connect('mongodb://localhost:27017/mernauth',{useNewUrlParser:true},()=>{  console.log('successfully connected to database');
```
* Now to check if the express server has started or not create a app listen function
```javascript
	app.listen(3000,()=>{
    console.log('express server started');
});
```
## Creating Models
A Model folder is going to be created which is going to have the structure of out App's component.
* Create a User.js file in Model Folder. It is going to contain the blueprint which has to be follwed in this App for User.
```javascript
const UserSchema=new mongoose.Schema({
  username:{
        type:String,
        required:true,
        min:6,
        max:15
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        required:true
    },
```
### Password Encryption
For password encryption security we are going to use bcrypt.
* First of all install a module.
```bash
npm install bcrypt
```
* Import this Module and use it.

```javascript
UserSchema.pre('save',function(next){
    if(!this.isModified('password'))
    return next();
    bcrypt.hash(this.password,10,(err,passwordHash)=>{
        if(err)
        return next(err);
        this.password = passwordHash;
        next();
    });
});
```
This function saves the password after encrypting it.
### Passport
Passport strategy for authenticating with a username and password.

This module lets you authenticate using a username and password in your Node.js applications. By plugging into Passport, local authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

* Install Module
```bash
npm install passport
npm install passport-local
```
* Create a file named as Passport.js
* Import the module
```javascript
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
const JwtStrategy=require('passport-jwt').Strategy;
const User=require('./models/User');
```
#### Configure Strategy
The local authentication strategy authenticates users using a username and password. The strategy requires a verify callback, which accepts these credentials and calls done providing a user.
```javascript
•	passport.use(new LocalStrategy((username,password,done)=>{
    User.findOne({username},(err,user)=>{
        //if something went wrong in db
        if(err)
        return done(err);
        //if no user exist
        if(!user)
        return done(null,false);
        //check if password is correct
       user.comparePassword(password,done);
    });
```
### Passport-JWT
A Passport strategy for authenticating with a JSON Web Token.

This module lets you authenticate endpoints using a JSON web token. It is intended to be used to secure RESTful endpoints without sessions.
* Install the module
```bash
npm install passport-jwt
```
### Usage
```javascript
passport.use(new JwtStrategy({
jwtFromRequest:cookieExtractor,
secretOrKey:"MuhammadMinhas"
},(payload,done)=>{
User.findById({_id:payload.sub},(err,user)=>{
if(err)
return done(err,false);
if(user)
return done(null,user);
else
return done(null,false);
});
}));
```
## Creating Routes
 Routing is the mechanism by which requests (as specified by a URL and HTTP method) are routed to the code that handles them.
 
* Go to app.js and require userrouter 
```javascript
•	const userRouter=require('./routes/User');
app.use('/user',userRouter);
```
* Create a Route folder
* Create a file named as User.js in it
* Require Some modules in it
```javascript
•	const express=require('express');
const userRouter=express.Router();
const passport=require('passport');
const passportConfig=require('../passport');
const User=require('../models/User');
```
### JSON Web Token
JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.
#### Usage 
Authorization: This is the most common scenario for using JWT. Once the user is logged in, each subsequent request will include the JWT, allowing the user to access routes, services, and resources that are permitted with that token. Single Sign On is a feature that widely uses JWT nowadays, because of its small overhead and its ability to be easily used across different domains.

* Install JSON Web token module
```bash
npm install jsonwebtoken
```
* Require it in user.js in routes folder
```javascript
const JWT=require('jsonwebtoken');
```
•	Now create routes for login,logout,admin,authenticate and register

#### Admin Route
```javascript
userRouter.get('/admin',passport.authenticate('jwt',{session : false}),(req,res)=>{
    if(req.user.role === 'admin'){
        res.status(200).json({message : {msgBody : 'You are an admin', msgError : false}});
    }
    else
        res.status(403).json({message : {msgBody : "You're not an admin,go away", msgError : true}});
});
```
#### Login Route
```javascript
userRouter.post('/login',passport.authenticate('local',{session : false}),(req,res)=>{
    if(req.isAuthenticated()){
       const {_id,username,role} = req.user;
       const token = signToken(_id);
       res.cookie('access_token',token,{httpOnly: true, sameSite:true}); 
       res.status(200).json({isAuthenticated : true,user : {username,role}});
    }
});
```
#### Logout Route
```javascript
userRouter.get('/logout',passport.authenticate('jwt',{session : false}),(req,res)=>{
    res.clearCookie('access_token');
    res.json({user:{username : "", role : ""},success : true});
});
```
#### Register Route
```javascript
userRouter.post('/register',(req,res)=>{
    const { username,password,role } = req.body;
    User.findOne({username},(err,user)=>{
        if(err)
            res.status(500).json({message : {msgBody : "Error has occured", msgError: true}});
        if(user)
            res.status(400).json({message : {msgBody : "Username is already taken", msgError: true}});
        else{
            const newUser = new User({username,password,role});
            newUser.save(err=>{
                if(err)
                    res.status(500).json({message : {msgBody : "Error has occured", msgError: true}});
                else
                    res.status(201).json({message : {msgBody : "Account successfully created", msgError: false}});
            });
        }
    });
});
```
#### Authenticate Route
```javascript
userRouter.get('/admin',passport.authenticate('jwt',{session : false}),(req,res)=>{
    if(req.user.role === 'admin'){
        res.status(200).json({message : {msgBody : 'You are an admin', msgError : false}});
    }
    else
        res.status(403).json({message : {msgBody : "You're not an admin,go away", msgError : true}});
});

userRouter.get('/authenticated',passport.authenticate('jwt',{session : false}),(req,res)=>{
    const {username,role} = req.user;
    res.status(200).json({isAuthenticated : true, user : {username,role}});
});
```
### React Portion
React is an open-source, front end, JavaScript library for building user interfaces or UI components

*First of all Add a proxy setting in package.json
```json
"proxy": "http://localhost:5000"
```
* Now create a folder in src named as services and in it a file named as AuthService.js it will provide authentication services to check the user and authenticate it

* Now we will use context api by creating a context folder in src named as AuthContext.js 
* And in it we are going to import few modules.
```javascript
import React, {createContext,useState,useEffect} from 'react';
import AuthService from '../Services/AuthService';
```
* And create function for Authentication
```javascript
export default ({ children })=>{
    const [user,setUser] = useState(null);
    const [isAuthenticated,setIsAuthenticated] = useState(false);
    const [isLoaded,setIsLoaded] = useState(false);

    useEffect(()=>{
        AuthService.isAuthenticated().then(data =>{
            setUser(data.user);
            setIsAuthenticated(data.isAuthenticated);
            setIsLoaded(true);
        });
    },[]);
```
### Components Building
*	Install bootstrap by taking the css only link from bootstrap site and pasting it in /public/index.html
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
```
* Then create component folder in src folder that is going to hold all the components.
* Now install react router in client
```bash
cd client
npm install react-router
```
#### Navbar Component
##### Importing Modules
```javascript
import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import AuthService from '../Services/AuthService';
import { AuthContext } from '../Context/AuthContext';
```
* We are going to create a logout handler
```javascript
const Navbar = props =>{
    const {isAuthenticated,user,setIsAuthenticated,setUser} = useContext(AuthContext);
    
    const onClickLogoutHandler = ()=>{
        AuthService.logout().then(data=>{
            if(data.success){
                setUser(data.user);
                setIsAuthenticated(false);
            }
        });
    }

```
* Then for the form go to bootstrap website search navbar and copy it.
```javascript
    const unauthenticatedNavBar = ()=>{
        return (
            <>
                <Link to="/">
                    <li className="nav-item nav-link">
                        Home
                    </li>
                </Link>  
                <Link to="/login">
                    <li className="nav-item nav-link">
                        Login
                    </li>
                </Link>  
                <Link to="/register">
                    <li className="nav-item nav-link">
                        Register
                    </li>
                </Link>  
            </>
        )
    }

    const authenticatedNavBar = ()=>{
        return(
            <>
                <Link to="/">
                    <li className="nav-item nav-link">
                        Home
                    </li>
                </Link> 
               
                {
                    user.role === "admin" ? 
                    <Link to="/admin">
                        <li className="nav-item nav-link">
                            Admin
                        </li>
                    </Link> : null
                }  
                <button type="button" 
                        className="btn btn-link nav-item nav-link" 
                        onClick={onClickLogoutHandler}>Logout</button>
            </>
        )
    }
    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/">
                <div className="navbar-brand">MuhammadMinhas</div>
            </Link>
            <div className="collapse navbar-collapse" id="navbarText">
                <ul className="navbar-nav mr-auto">
                    { !isAuthenticated ? unauthenticatedNavBar() : authenticatedNavBar()}
                </ul>
            </div>
        </nav>
    )
}
```
#### Home Component
```bash
import React from 'react';

const Home = ()=>(
    <h1>Home Page</h1>
)

export default Home;
```
#### Login Component
* In it we are going to create a login function which will set user state
```javascript
const Login = props=>{
    const [user,setUser] = useState({username: "", password : ""});
    const [message,setMessage] = useState(null);
    const authContext = useContext(AuthContext);

    const onChange = e =>{
        setUser({...user,[e.target.name] : e.target.value});
    }

```
* Create A Form
```html
<div>
            <form onSubmit={onSubmit}>
                <h3>Please sign in</h3>
                <label htmlFor="username" className="sr-only">Username: </label>
                <input type="text" 
                       name="username" 
                       onChange={onChange} 
                       className="form-control" 
                       placeholder="Enter Username"/>
                <label htmlFor="password" className="sr-only">Password: </label>
                <input type="password" 
                       name="password" 
                       onChange={onChange} 
                       className="form-control" 
                       placeholder="Enter Password"/>
                <button className="btn btn-lg btn-primary btn-block" 
                        type="submit">Log in </button>
            </form>
            {message ? <Message message={message}/> : null}
        </div>
        
```
#### Register Component
##### Register Function
```javascript
const Register = props=>{
    const [user,setUser] = useState({username: "", password : "", role : ""});
    const [message,setMessage] = useState(null);
    let timerID = useRef(null);

    useEffect(()=>{
        return ()=>{
            clearTimeout(timerID);
        }
    },[]);
```
##### Form
```html
      <div>
            <form onSubmit={onSubmit}>
                <h3>Please Register</h3>
                <label htmlFor="username" className="sr-only">Username: </label>
                <input type="text" 
                       name="username" 
                       value={user.username}
                       onChange={onChange} 
                       className="form-control" 
                       placeholder="Enter Username"/>
                <label htmlFor="password" className="sr-only">Password: </label>
                <input type="password" 
                       name="password"
                       value={user.password} 
                       onChange={onChange} 
                       className="form-control" 
                       placeholder="Enter Password"/>
                <label htmlFor="role" className="sr-only">Role: </label>
                <input type="text" 
                       name="role"
                       value={user.role}  
                       onChange={onChange} 
                       className="form-control" 
                       placeholder="Enter role (admin/user)"/>
                <button className="btn btn-lg btn-primary btn-block" 
                        type="submit">Register</button>
            </form>
            {message ? <Message message={message}/> : null}
        </div>
    )
```


### Then in App.js create the routes for home,login and register so it can be accessed

#

# Heroku Deployment
We can Deploy our Web App on Heroku so we can access it live from there.
## Steps
*	Sign up in heroku
*	After that Download cli from the website
*	Open VS code
*	Then in terminal type commands
```bash
heroku login
```
* Then authenticate yourself.
* Initialize git in the folder
```bash
git init
```
* Add all files in git
```bash
git add .
```
* Next step is to commit the added files
```bash
git commit -am "Commited"
```
* Now push it on heroku
```bash
git push heroku master
```
* Now to open the Web App on Heroku type
```bash
heroku open
```
