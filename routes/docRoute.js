const router = require("express").Router();
const mongoose = require("mongoose");
const Document = require("../models/Document");
const { verifyToken } = require("../utils/verify");
const User = require("../models/UserModel");
// get all documents
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const allDocs = await Document.find();
    const collab = allDocs.filter((doc) => {
      if (doc.collaborators.includes(req.user.id)) {
        console.log(doc.collaborators.includes(req.user.id));
        return true;
      }
    });
    const ownerDoc = await Document.find({
      owner: req.user.id,
    });
    const docs = [...collab, ...ownerDoc];
    return res.status(200).json(docs);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// create a document
router.post("/create", async (req, res, next) => {
  try {
    const docAdded = await Document.create(req.body);
    return res.status(200).json(docAdded);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// get a document
router.get("/:id", async (req, res, next) => {
  try {
    const docAdded = await Document.findById(req.params.id);
    console.log(docAdded);
    let docUpdate = docAdded;
    for (let i = 0; i < docUpdate.collaborators.length; i++) {
      let elem = docUpdate.collaborators[i];
      const colUser = await User.findById(elem);
      elem = JSON.stringify({
        id: elem,
        name: colUser.username,
      });
      docUpdate.collaborators[i] = elem;
    }

    return res.status(200).json(docUpdate);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// update a document
router.put("/:id", async (req, res, next) => {
  try {
    const docAdded = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.status(200).json(docAdded);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// delete a document
router.delete("/:id", async (req, res, next) => {
  try {
    const docAdded = await Document.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
});
module.exports = router;
