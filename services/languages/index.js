const router =require("express").Router();
const {join} = require("path");
const {promisify} = require("util");
const fs = require("fs");
const writeFile = promisify(fs.writeFile);
const multer = require("multer");
const upload = multer();
const Model = require("./model");
const Users = require("../users/model")
const photoDirectory =  join(__dirname,"../../files")
const {getUser, generateAuthString,authRequired} = require("../../utils/auth.utils")
router.get("/",getUser,async(req,res)=>{
    try{
        let all = await Model.find({});
        res.send({data:all})
    }
    catch (e) {
        res.status(500).send(e)
    }
})
router.get("/:id",getUser,async(req,res)=>{
    try{
        if(req.params.id==="me"){
            let  all = await Model.find({createdBy:req.user._id})
            res.send({data:all})
        }
        else{
            let single = await Model.findById(req.params.id);
            res.send({data:single})
        }
    }
    catch (e) {
        res.status(500).send(e)
    }
})
router.post("/",getUser,async(req,res)=>{
    try{
        let newObj = await new  Model({...req.body,createdBy:req.user._id}).save();
        let user = await Users.findById(req.user._id)
        user.languages=[...user.languages,newObj._id]
        let update =await Users.findByIdAndUpdate(req.user._id,user)
        let updated = await Users.findById(req.user._id)
        res.send({data:updated})
    }
    catch (e) {
        res.status(500).send(e)
    }
})

router.put("/:id",getUser,async(req,res)=>{
    try{
        let isExists = await  Model.findById(req.params.id);
        if(isExists){
            if(isExists.createdBy.equals(req.user._id)){
                let update = await Model.findByIdAndUpdate(req.params.id,req.body);
                let updated = await  Model.findById(req.params.id);
                res.send({data:updated})
            }
            else{
                res.status(403).send("Unauthorized")
            }

        }
        else{
            res.status(404).send("not found")
        }

    }
    catch (e) {
        res.status(500).send(e)
    }
})

router.put("/:id/photo",getUser,upload.single("photo"),async(req,res)=>{
    try{
        let isExists = await  Model.findById(req.params.id);
        if(isExists.createdBy.equals(req.user._id)){
            const {originalname,mimetype,buffer} = req.file;
            const [family,extension] = mimetype.split("/") // image/jpeg
            let writtenFile = await writeFile(join(photoDirectory,"/photos",`${req.params.id}.${extension}`),buffer);
            let url = `${req.protocol}://${req.host}${process.env.ENVIRONMENT==="dev"?":"+process.env.PORT:""}/${process.env.PHOTO_DIRECTORY}/${req.params.id}.${extension}`;
            let obj = await Model.findById(req.params.id);
            obj.image= url;
            let update = await Model.findByIdAndUpdate(req.params.id,obj);
            let updated= await Model.findById(req.params.id);
            res.send({data:updated})
        }
        else{
            res.status(403).send("Unauthorized")
        }

    }catch (e) {
        res.send(e)
    }

})
router.delete("/:id",getUser,async(req,res)=>{
    try{
        let isExists = await  Model.findById(req.params.id);
        if(req.user._id.equals(isExists.createdBy)){
            let deleted = await Model.findByIdAndDelete(req.params.id);
            res.send("Deleted")
        }
        else{
            res.status(403).send("Unauthorized")
        }

    }
    catch (e) {
        res.status(500).send(e)
    }
})

module.exports=router;