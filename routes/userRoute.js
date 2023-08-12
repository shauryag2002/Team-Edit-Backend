const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Document = require("../models/Document");
const Notification = require("../models/NotificationModel");
const { verifyToken, isOwner } = require("../utils/verify");
const io = require("../index");
// get a user
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// check if the user is collaborator
router.post("/iscol/:docId", async (req, res, next) => {
  try {
    console.log(req.body);
    const doc = await Document.findById(req.params.docId);
    console.log(doc);
    if (
      doc.owner == req.body.userId ||
      doc.collaborators.includes(req.body.userId)
    ) {
      return res.status(200).json({ message: true });
    }
    for (let i = 0; i < doc.collaborators.length; i++) {
      const elem = doc.collaborators[i];
      if (elem == req.body.userId) {
        return res.status(200).json({ message: true });
      }
    }
    // if (
    //   doc.collaborators.includes(req.body.userId) ||
    //   doc.owner == req.body.userId
    //   ) {
    //   return res.status(200).json({ message: true });
    // }
    return res.status(200).json({ message: false });
  } catch (err) {
    return res.status(500).json(err);
  }
});
// remove a collaborator
router.put("/col/:id", verifyToken, isOwner, async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.body.docId });
    // if (doc.owner == req.user._id) {
    //   return res
    //     .status(200)
    //     .json({ message: "you are owner of this document" });
    // }
    const updateDoc = doc.collaborators.filter((collaborator) => {
      if (collaborator == req.params.id) {
      } else {
        return true;
      }
    });
    doc.collaborators = updateDoc;
    await doc.save();
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// accept a collaborator
router.post("/col/:name", verifyToken, isOwner, async (req, res, next) => {
  try {
    const doc = await Document.findById(req.body.docId);
    const user = await User.findOne({ username: req.params.name });
    doc.collaborators.push(user._id);
    await doc.save();
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// get owner name
router.post("/getOwner", async (req, res, next) => {
  try {
    const doc = await Document.findById(req.body.docId);
    const user = await User.findById(doc.owner);
    return res.status(200).json({ name: user.username });
  } catch (err) {
    return res.status(500).json(err);
  }
});
// create a notification for a collaborator
router.post("/noti/", async (req, res, next) => {
  try {
    const notification = await Notification.find(req.body);
    console.log(notification);
    if (notification.length == 1) {
      return res.status(200).json({ message: "Notification has been sent" });
    }
    const not = await Notification.create(req.body);
    return res.status(200).json(not);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// get all notifications
router.post("/noti/all", async (req, res, next) => {
  try {
    const noti = await Notification.find({ reciever: req.body.reciever });
    return res.status(200).json(noti);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// delete a notification
router.delete("/noti/:id", async (req, res, next) => {
  try {
    const noti = await Notification.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    return res.status(500).json(err);
  }
});
module.exports = router;
