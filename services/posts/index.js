const router = require("express").Router();
const Model = require("./model");
const {
  getUser,
  generateAuthString,
  authRequired,
} = require("../../utils/auth.utils");
const cloudinary = require("../../utils/photo.utils");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({ cloudinary });
const multer = require("multer");
const parser = multer({ storage: storage });
const Comments = require("../comments/model");
const q2m = require("query-to-mongo");
router.get("/", getUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    let all = await Model.find({})
      .populate("createdBy", { password: 0 })
      .populate("comments")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.send({ data: all });
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/:id", getUser, async (req, res) => {
  try {
    let all = await Model.findById(req.params.id)
      .populate("createdBy", { password: 0 })
      .populate("comments");
    res.send({ data: all });
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/", getUser, async (req, res) => {
  try {
    let newObj = await new Model({
      ...req.body,
      createdBy: req.user._id,
    }).save();
    res.send({ data: newObj });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.put("/:id", getUser, async (req, res) => {
  try {
    let update = await Model.findByIdAndUpdate(req.params.id, req.body);
    let updated = await Model.findById(req.params.id);
    res.send({ data: updated });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/:id/comment", getUser, async (req, res) => {
  try {
    const comment = {
      ...req.body,
      belongsTo: req.params.id,
      createdBy: req.user._id,
    };
    const newComment = await new Comments(comment).save();
    let update = await Model.findByIdAndUpdate(req.params.id, {
      $push: { comments: newComment._id },
    });
    let updated = await Model.findById(req.params.id);
    res.send({ data: updated });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.put("/:id/comment/:commentId", getUser, async (req, res) => {
  try {
    let updated = await Comments.findByIdAndUpdate(
      req.params.commentId,
      req.body
    );
    const existComment = await Comments.findById(req.params.commentId);
    res.send({ data: existComment });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/:id/comment/:commentId", getUser, async (req, res) => {
  try {
    let deleted = await Comments.findByIdAndDelete(req.params.commentId);
    res.send({ message: deleted ? "Deleted" : "Not Deleted" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.put("/:id/photo", getUser, parser.single("photo"), async (req, res) => {
  try {
    const { path } = req.file;
    let obj = await Model.findById(req.params.id);
    obj.image = path;
    let update = await Model.findByIdAndUpdate(req.params.id, obj);
    let updated = await Model.findById(req.params.id, { password: 0 });
    res.send({ data: updated.toJSON() });
  } catch (e) {
    res.send(e);
  }
});
router.delete("/:id", getUser, async (req, res) => {
  try {
    let isExists = await Model.findById(req.params.id);
    if (isExists.createdBy.equals(req.user._id)) {
      let deleted = await Model.findByIdAndDelete(req.params.id);
      res.send("Deleted");
    } else {
      res.status(403).send("Unauthorized");
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
