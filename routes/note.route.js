const express = require("express");
const router = express.Router();

const notesController = require('../controllers/notes');
const { isAdmin } = require("../middleware/is_auth");
//related to notes
router.post('/setNotes',isAdmin, notesController.setNotes);
router.get('/getNotes', notesController.getnotes);

module.exports = router;