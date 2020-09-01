
const Users = require("../services/users/model")
const md5 = require("md5")
const toBase64  = (data) => {
    let buff = new Buffer(data);
    return buff.toString('base64');
}
const base64ToString = (data) => {
    let buff = new Buffer(data, 'base64');
    return buff.toString('ascii');
}
const getUser = async (req,res,next) => {
    try{

        if(req.headers.authorization){
            const [method,token] =req.headers.authorization.split(" ");
            if(method&&token){
                if(method!=="Basic"){
                    res.status(400).send({message:"Please send authorization as Basic format"})
                }
                else{
                    const [email,password] = base64ToString(token).split(":");
                    console.log({email,password})
                    let user = await Users.findOne({email});
                    if(user&&user.email===email&&user.password===md5(password)){
                        req.user=user;
                        next();
                    }
                    else{

                        res.status(403).send({message:"Unauthorized"})
                    }
                }

            }
        }
        else{
            res.status(403).send({message:"Unauthorized"})
        }
    }
    catch (e) {
        res.status(500).send(e)
    }
}
const authRequired = async (req,res,next) => {
    try{

        if(req.headers.authorization){
            const [method,token] =req.headers.authorization.split(" ");
            if(method&&token){
                if(method!=="Basic"){
                    res.status(400).send({message:"Please send authorization as Basic format"})
                }
                else{
                    const [email,password] = base64ToString(token).split(":");
                    let user = await Users.findOne({email});
                    if(user&&user.email===email&&user.password===md5(password)&&user._id.equals(req.params.id)){
                        next()
                    }
                    else{
                        res.status(403).send({message:"Unauthorized"})
                    }
                }

            }
        }
        else{
            res.status(403).send({message:"Unauthorized"})
        }
    }
    catch (e) {
        res.status(500).send(e)
    }
}
const generateAuthString = async (req,res,next) => {
    console.log("generate")
    const {email,password} = req.body;

    const user = await Users.findOne({email});

    if(!user){
        res.status(404).send({message:"User is not found"})
    }
    else{
        if(user.password===md5(password)){
            let authorization= toBase64(`${email}:${password}`)
            req.authorization=`Basic ${authorization}`;
            next()
        }
        else{
            res.status(403).send({message:"Email or password is not correct"})
        }
    }


}
module.exports={
    toBase64,
    base64ToString,
    getUser,
    generateAuthString,
    authRequired,
}