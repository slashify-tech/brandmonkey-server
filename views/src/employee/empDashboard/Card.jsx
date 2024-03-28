import React, { useEffect, useState } from "react";
import {
  ViewMore,
  CardIcon,
  TicketRaiseIcon,
  ArchiveBook,
  Tick,
} from "../../Icon.jsx";
import { NotesAdd, NotesIcon } from "../../Icon.jsx";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import apiurl from "../../util";


const Card = ({ dashboardEmployeeData }) => {
  const [notes, setNotes] = useState("No notes Yet");
  const getNotes = async () => {
    try {
      const response = await apiurl.get("/getNotes");
      
      const sanitizedNotes = response.data.notes.replace(/<\/?p>/g, '');
      setNotes(sanitizedNotes);
    
    } catch (err) {
      if (err.response) {
        console.log("Error fetching notes:", err.response.status);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };
console.log(notes);
  useEffect(() => {
    getNotes();
  }, []);

  return (
    <>
      <div className=" md:grid md:grid-cols-3 sm:grid sm:grid-cols-2  gap-5  justify-center md:mx-12 md:mr-20 mx-3 mr-9 sm:mx-16 ">
        <div className="  md:w-full rg:w-[35vh] w-full sm:w-[25vh] mx-3">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15]  md:mt-9 mt-6  ">
            <div className="flex justify-center items-center  flex-col mt-8">
              <p className=" text-white font-semibold text-lg ">
                My Clients({dashboardEmployeeData.totalClients})
              </p>
              <span id="card-icon" className="pt-10 ">
                <CardIcon />
              </span>
            </div>

            <span className="flex items-center justify-end mb-10 "></span>
          </div>
        </div>

        <div className="  md:w-full  w-full sm:w-[25vh] mx-3 ">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15]  md:mt-9 mt-6 ">
            <div className="flex justify-center items-center  flex-col mt-9">
              <p className=" text-white font-semibold text-lg ">
                Raised Complaints ({dashboardEmployeeData.totalTickets})
              </p>
              <span id="card-icon" className=" pt-9">
                <TicketRaiseIcon />
              </span>
            </div>

            <span className="flex items-center justify-end mb-10 "></span>
          </div>
        </div>

        <div className="  md:w-full  w-full sm:w-[25vh]   mx-3 ">
          <div className="BR gradient flex flex-col justify-start   py-3 rounded-3xl  md:mt-9 mt-6 ">
            <span className="px-3  ">
              <NotesIcon />
            </span>
            <div className="   rounded-2xl mx-3  py-1 ">
              <div className="text-sm text-[15px] background   rounded-3xl  p-3 mx-2  md:h-36 h-[17vh] sm:h-[13vh] mb-1  mt-1 overflow-scroll scrollbar-hide">
            
               <div  className=" text-white  text-wrap  " dangerouslySetInnerHTML={{ __html: notes }} />
              </div >
            </div>
          </div>
        </div>

        <div className="  md:w-full  w-full sm:w-[25vh] mx-3">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15] md:mt-1 mt-6">
            <div className="flex justify-center items-center  flex-col mt-8">
              <p className=" text-white font-semibold text-lg ">
                Work Completed ({dashboardEmployeeData.totalWorkProgress}%)
              </p>
              <span id="card-icon" className="pt-10 ">
                <ArchiveBook />
              </span>
            </div>

            <span className="flex items-center justify-end mb-10 "></span>
          </div>
        </div>

        <div className=" md:w-full rg:w-[35vh] w-full sm:w-[25vh] mx-3">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15]  md:mt-1 mt-6 ">
            <div className="flex justify-center items-center  flex-col mt-8">
              <p className=" text-white font-semibold text-lg ">
                Work Pending ({100 - dashboardEmployeeData.totalWorkProgress}%)
              </p>
              <span id="card-icon" className="pt-11 ">
                <Tick />
              </span>
            </div>

            <span className="flex items-center justify-end mb-12 "></span>
          </div>
        </div>

        <span className=" gradient rounded-3xl md:w-full md:py-3 w-[44vh] BR mx-3 sm:mt-5 md:mt-1 px-5  md:px-0  md:block sm:block  sm:w-[22vh] hidden">
          <Calendar />
        </span>
      </div>
    </>
  );
};

export default Card;
