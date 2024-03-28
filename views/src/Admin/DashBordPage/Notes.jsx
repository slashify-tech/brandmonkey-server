
// import React from "react";
// import { NotesAdd, NotesIcon } from "../../Icon";
// import { useState } from "react";
// import apiurl from "../../../util";
// import { useEffect } from "react";
// import { toast } from "react-toastify";

// const Notes = () => {
//   const [notes, setNotes] = useState();

//   const postNotes = async () => {
//     try {
//       await apiurl.post("/setNotes", { notes });
//       // console.log("notes updated");
//       toast.success("Notes Updated successfully");
//     } catch (err) {
//       // console.log(err);
//       toast.error("Something went wrong")
//     }
//   };

//   const getNotes = async () => {
//     try {
//       const response = await apiurl.get("getNotes");
//       setNotes(response.data.notes);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleChange = (event) => {
//     setNotes(event.target.value);
//   };

//   console.log(notes);

//   useEffect(() => {
//     getNotes();
//   }, []);
//   return (
//     <div className="gradient   rounded-3xl BR  md:mt-9 mt-6 pt-2 md:py-0 md:pt-2 py-2 mx-3 px-5 pr-12 md:px-3  md:pr-0 md:mx-3 sm:mx-28">
    
//       <span className="px-3  ">
//         <NotesIcon />
//       </span>

//       <textarea
//         name="notes"
//         value={notes}
//         onChange={handleChange}
//         placeholder="Add Your Notes"
//         className="text-[15px] background   rounded-3xl  w-full  p-3  mb-1  mt-1 text-white scrollbar-hide"
//       ></textarea>

//       <span
//         onClick={() => postNotes()}
//         className="  border-gradient text-white rounded-3xl px-3 font-light text-[13px] cursor-pointer py-1 mx-3   "
//       >
//         {notes ? "Update Note" : "Add Note +"}
//       </span>
//     </div>
//   );
// };

// export default Notes;

