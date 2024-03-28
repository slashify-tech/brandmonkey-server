// import React, { useEffect, useState } from "react";
// import { NotesAdd, NotesIcon } from "../../Icon";
// import apiurl from "../../../util";

// const Notes = () => {
//   const [notes, setNotes] = useState("No notes Yet");
//   const getNotes = async () => {
//     try {
//       const response = await apiurl.get("/getNotes");
//       setNotes(response.data.notes);
//     } catch (err) {
//       if (err.response) {
//         console.log("Error fetching notes:", err.response.status);
//       } else {
//         console.error("Unexpected error:", err);
//       }
//     }
//   };
//   useEffect(() => {
//     getNotes();
//   }, []);

//   return (
  
//     <div className="gradient md:w-[43vh] w-[38vh]  rounded-3xl BR  mt-6 pt-2 pb-8  ">
//       <span className="px-3  ">
//         <NotesIcon />
//       </span>
//       <div className="background    rounded-2xl mx-3 mt-3 py-1 ">
//         <div className="text-sm   px-2 h-[21vh] overflow-y-scroll    scrollbar-hide">
//           <p className="text-white text-wrap ">{notes}</p>
//         </div>
//       </div>
//     </div>
 
//   );
// };

// export default Notes;
