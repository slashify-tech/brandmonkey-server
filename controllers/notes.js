const Notes = require("../models/notes");

exports.getnotes = async (req, res) => {
  try {
    const note = await Notes.findOne({});
    if (!note) {
      return res.status(404).json({ message: "No notes found" });
    }
    return res.status(200).json({ notes: note.notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.setNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    // Validate the incoming notes data
    if (!notes || typeof notes !== "string") {
      return res.status(400).json({ error: "Invalid notes data" });
    }
    let note = await Notes.findOne({});
    if (!note) {
      note = new Notes({
        notes: notes,
        author: "",
      });
    } else {
      note.notes = notes;
    }
    await note.save();
    return res.status(201).json({ message: "Notes updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};