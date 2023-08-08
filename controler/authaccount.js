const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = mysql.createConnection({
    database: process.env.DATABASE,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});

exports.register = (req,res) =>{
    // console.log(req.body);
    // const firstname = req.body.firstname;
    // const lastname = req.body.lastname;
    // const email = req.body.email;
    // const password = req.body.password;
    // const cpassword = req.body.cpassword;
    const {
        firstname, 
        lastname,
        email,
        password,
        cpassword
    } = req.body;
    db.query("SELECT email FROM accounts WHERE email = ?",
    email,
    async(err,result) => {
        // console.log(result)
        if(err){
            consul.log(err)
        }
        if(result.length > 0){
            return res.render("register.hbs", {error: "Email already in use."})
        }else if(cpassword !== password){
            return res.render("register.hbs", {error: "Password does not match."})
        }
        const hashPassword = await bcrypt.hash(password, 8);
        console.log(hashPassword);
        
        db.query("INSERT INTO accounts SET ?",
        {
            first_name: firstname,
            last_name: lastname,
            email: email,
            password: hashPassword
        },
        (err,results) => {
            if(err){
                console.log("error");
            }else{
                console.log(results);
                return res.render("register.hbs", {message: "You are now registered."})
            }
        })
    })
}

exports.login = (req, res) => {
    try{
        const {email, password} = req.body;
        

        if(email === "" || password === ""){
            res.render("index.hbs", {error: "Email or password should not be empty."})
        }else{
            db.query("SELECT * FROM accounts WHERE email = ?",email,
            async(err, results) => {
                // console.log(result);
                if(err){

                }
                if(!results.length > 0){
                    res.render("index.hbs", {error: "The email does not exist"})
                } 
                else if(!(await bcrypt.compare(password, results[0].password))){
                    res.render("index.hbs", {error: "Password Incorrect"})
                }
                else{
                    const account_id = results[0].accounts_id
                    // console.log(account_id);
                    const token = jwt.sign({account_id},process.env.JWTSECRET,{expiresIn: process.env.JWTEXPIRES});
                    // console.log(token);
                    // const decoded = jwt.decode(token, {complete: true});
                    // console.log(decoded);
                    const cookieoptions = {expires: new Date(Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000),
                    httpOnly: true}
                    res.cookie("JWT", token, cookieoptions);
                    // console.log(cookieoptions);

                    db.query("SELECT * FROM accounts",
                    (err,result) => {
                        // console.log(result);
                        res.render("listaccounts.hbs", {title: "List of Users", users: result, user: results[0].first_name + " " + results[0].last_name})
                    })
                    
                }
            }
            ) 
        }
    }catch(err){
        console.log(`Catched error: ${err}`)
    }
    

}


exports.updateform = (req, res) => {
    const email = req.params.email;
    console.log(email);
    db.query("SELECT * FROM accounts WHERE email = ?",
    email,
    async(err,result)=> {
        console.log(result);
        res.render("updateform.hbs", {user: result[0]})
    })
}

exports.updateuser = (req, res) => {
    const {efirstname, elastname, eemail} = req.body

    if(efirstname === "" || elastname === ""){
        res.render("updateform.hbs", {message: "First Name and Last Name is required."})
    }else{
        db.query(`UPDATE accounts SET first_name = "${efirstname}", last_name = "${elastname}" WHERE email = "${eemail}"`,
        (err,result) => {
            if(err){
                console.log(err);
            }else{
                db.query("SELECT * FROM accounts",
                (err,result) => {
                    // console.log(result);
                    res.render("listaccounts.hbs", {title: "List of Users", users: result})
                })
                
            }
        })
    }
}

exports.delete = (req, res) => {
    const accounts_id = req.params.accounts_id

    console.log(accounts_id);
    db.query("DELETE FROM accounts WHERE accounts_id = ?",
    accounts_id,
    (err,result)=> {
        if(err){
            console.log(err);
        }else{
            db.query("SELECT * FROM accounts",
            (err,result) => {
                // console.log(result);
                res.render("listaccounts.hbs", {title: "List of Users", users: result})
            })
            
        }
    })
}

exports.back = (req,res) => {
    db.query("SELECT * FROM accounts",
        (err,result) => {
            // console.log(result);
            res.render("listaccounts.hbs", {title: "List of Users", users: result})
        }
    )
            
}

exports.logout = (req,res) => {
    // if(req.session){
    //     req.session.destroy((err)=>{
    //         if(err){
    //             res.status(400).send("unable to logout")
    //         }else{
    //             res.clear.cookie("JWT").status(200).json({message: "successfully logout"})
    //             res.render("index")
    //         }
    //     })
    // }else{
    //     console.log("no session");
    //     res.end();
    // }
    res.clearCookie("JWT").status(200);
    res.render("index.hbs", {message: "Successfully logout"})
}

exports.skillset = (req,res) => {
    const accounts_id = req.params.accounts_id;
    db.query("SELECT a.accounts_id as accounts_id,s.title as title, s.level as level, a.first_name as first_name, a.last_name as last_name FROM skillset as s INNER JOIN accounts as a ON s.accounts_id = a.accounts_id WHERE a.accounts_id = ?",
    accounts_id,
    (err,results) =>{
        if(err){
            console.log(err)
        }else{
            res.render("skillset.hbs", {title: "Skillsets of " + results[0].first_name + " " + results[0].last_name, users: results});
        }
    }) 

}

