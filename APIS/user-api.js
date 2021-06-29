// create mini express app
const exp = require("express")
const userApi = exp.Router();

const expressErrorHandler = require("express-async-handler")

const bcryptjs = require("bcryptjs")

const jwt = require("jsonwebtoken")

// add body parsing midddleware
userApi.use(exp.json())

// import mongoClient
const mc = require("mongodb").MongoClient;

// connect string
const databaseUrl = "mongodb+srv://saidesh2704:saidesh2704@saidesh2704.qks65.mongodb.net/vnrdb2021?retryWrites=true&w=majority"
let databaseObj, userCollectionObj;

// connect to db
mc.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.log("err in db connection", err.message);
    } else {
        // get database object
        databaseObj = client.db("vnrdb2021")
            // create user collection object
        userCollectionObj = databaseObj.collection("usercollection")
        console.log("connected to database")
    }
})

// sample route
// http://localhost:3000/user/getusers
// userApi.get("/getusers", (req, res, next) => {

//     // console.log(userCollectionObj.find().toArray())
//     // it returns a promises

//     // read docs from user collection
//     userCollectionObj.find().toArray((err, userList) => {
//         if (err) {
//             console.log("Users data: ", err)
//             res.send({ message: err.message })
//         } else {
//             res.send({ message: userList })
//         }
//     })
// })




// using promise
// userApi.get("/getusers", (req, res, next) => {
//     userCollectionObj.find().toArray()
//         .then(userList => { res.send({ message: userList }) })
//         .catch(err => {
//             console.log("err in reading users data", err)
//             res.send({ message: err.message })

//         }) 
// })




// using await
userApi.get("/getusers", expressErrorHandler(async(req, res, next) => {

    let userList = await userCollectionObj.find().toArray()
    res.send({ message: userList })

}))


// http://localhost:3000/user/getuser/<username>
// userApi.get("/getuser/:username", (req, res, next) => {
//     // get username from url
//     let un = req.params.username;
//     userCollectionObj.findOne({ username: un }, (err, userObj) => {
//         if (err) {
//             console.log("error in reading user Obj : ", err)
//             res.send({ message: err.message })
//         }
//         // if user not existed
//         if (userObj === null) {
//             res.send({ message: "user not found" })
//         } else {
//             res.send({ message: userObj })
//         }
//     })
// })




// using a promises
// userApi.get("/getuser/:username", (req, res, next) => {
//     // get username from url
//     let un = req.params.username;

//     // search
//     userCollectionObj.findOne({ username: un })
//         .then(userObj => {
//             if (userObj === null) {
//                 res.send({ message: "user not existed" })
//             } else {
//                 res.send({ message: userObj })
//             }
//         })
//         .catch(err => {
//             console.log("error in reading user Obj : ", err)
//             res.send({ message: err.message })
//         })
// })



// using a await
userApi.get("/getuser/:username", expressErrorHandler(async(req, res, next) => {
    // get username from url
    let un = req.params.username;

    // search
    let userObj = await userCollectionObj.findOne({ username: un })
    if (userObj === null) {
        res.send({ message: "user not existed" })
    } else {
        res.send({ message: userObj })
    }
}))




// // http://localhost:3000/user/createuser
// userApi.post("/createuser", (req, res, next) => {
//     // get user Obj
//     let newUser = req.body;

//     //checking for duplicate
//     userCollectionObj.findOne({ username: newUser.username }, (err, userObj) => {
//         if (err) {
//             console.log("error in reading user Obj : ", err)
//             res.send({ message: err.message })
//         }
//         // if user is not existed
//         if (userObj === null) {
//             // create new user
//             userCollectionObj.insertOne(newUser, (err, sucess) => {
//                 if (err) {
//                     console.log("error in creating user Obj : ", err)
//                     res.send({ message: err.message })
//                 } else {
//                     res.send({ message: "user created" })
//                 }
//             })
//         } else {
//             res.send({ message: "user already existed" })

//         }
//     })
// })




// using async
userApi.post("/createuser", expressErrorHandler(async(req, res, next) => {
    // get user Obj
    let newUser = req.body;

    //checking for duplicate
    let userObj = await userCollectionObj.findOne({ username: newUser.username })
    if (userObj === null) {
        // hash password
        let hashPassword = await bcryptjs.hash(newUser.password, 7)
            // replace password
        newUser.password = hashPassword;
        // create new user
        await userCollectionObj.insertOne(newUser)
        res.send({ message: "user created" })
    } else {
        res.send({ message: "user already existed" })
    }
}))



// http://localhost:3000/user/updateusr/<username>
// userApi.put("/updateuser/:username", (req, res, next) => {
//     // get Modifide user Obj
//     let modifiedUser = req.body,
//         username = req.params.username;

//     //checking for Object
//     userCollectionObj.updateOne({ username: username }, {
//         $set: {
//             // email: modifiedUser.email,
//             // city: modifiedUser.city,
//             // age: modifiedUser.age
//             ...modifiedUser
//         }
//     }, (err, success) => {
//         if (err) {
//             console.log("error in updating user Obj : ", err)
//             res.send({ message: err.message })
//         } else {
//             res.send({ message: "user Updated" })
//         }

//     })
// })


// using async
userApi.put("/updateuser/:username", expressErrorHandler(async(req, res, next) => {
    // get Modifide user Obj
    let modifiedUser = req.body,
        username = req.params.username;

    await userCollectionObj.updateOne({ username: username }, {
        $set: {
            // email: modifiedUser.email,
            // city: modifiedUser.city,
            // age: modifiedUser.age
            ...modifiedUser
        }
    })
    res.send({ message: "user Updated" })
}))


// delete a user
userApi.delete("/deleteuser/:username", expressErrorHandler(async(req, res) => {
    // get username from url
    let un = req.params.username;
    // to find a user
    let user = await userCollectionObj.findOne({ username: un })

    if (user === null) {
        res.send({ message: "No user to delete" })
    } else {
        await userCollectionObj.deleteOne({ username: un })
        res.send({ message: "user deleted" })
    }
}))


// user login
userApi.post('/login', expressErrorHandler(async(req, res) => {
    // get user credentials
    let credentails = req.body;
    // search for user by user name
    let user = await userCollectionObj.findOne({ username: credentails.username })
        // if user not found
    if (user === null) {
        res.send({ message: "invalid username" })
    } else {
        // compare passwords
        let result = await bcryptjs.compare(credentails.password, user.password)
            // if not matched
        if (result === false) {
            res.send({ message: "invalid password" })
        } else {
            // create a token
            let signedToken = jwt.sign({ username: credentails.username }, 'abcdef', { expiresIn: 120 })
                // send token to client
            res.send({ message: "login sucess", token: signedToken, username: credentails.username })

        }
    }
}))


// export
module.exports = userApi;