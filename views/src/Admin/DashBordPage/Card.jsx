import React, { useEffect, useState } from "react";
import { ViewMore, CardIcon, AllEmp, Adminemp, Reviewsicon, TicketRaiseIcon } from "../../Icon.jsx";
import { NotesAdd, NotesIcon } from "../../Icon";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify"
import apiurl from "../../util.jsx";
import { useEmployee } from "../../context/employeeContext.jsx";

const Card = () => {
  const {getAdminDashBoard, dashboardAdminData} = useEmployee();

  const [notes, setNotes] = useState();
 
  const [getnotes, setGetNotes] = useState();

  const postNotes = async () => {
    try {
      await apiurl.post("/setNotes", { notes });
      // console.log("notes updated");
      toast.success("Notes Updated successfully");
    } catch (err) {
      // console.log(err);
      toast.error("Something went wrong")
    }
  };

  const getNotes = async () => {
    try {
      const response = await apiurl.get("getNotes");
      setGetNotes(response.data.notes);
    } catch (err) {
      console.log(err);
    }
  };
console.log(notes)
  const handleChange = (event) => {
    setNotes(event.target.value);
  };
  const clearNotes = () => {
    setNotes(''); // Clear the notes state
  };
  useEffect(() =>{
    getNotes();
    
    getAdminDashBoard();
  },[getNotes])
  return (
    <>



      <div className=" md:grid md:grid-cols-3 sm:grid sm:grid-cols-2  gap-5  justify-center md:mx-12 md:mr-20 mx-6 mr-12 sm:mx-16 ">
        <div className="  md:w-full rg:w-[35vh] w-full sm:w-[25vh] mx-3">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15]  md:mt-9 mt-6 ">
            <div className="flex justify-center items-center  flex-col mt-8">
              <p className=" text-white font-semibold text-lg ">
                Total Clients({dashboardAdminData.totalClients})
              </p>
              <span id="card-icon" className="pt-10 ">
                <CardIcon />
              </span>
            </div>

            <span className="flex items-center justify-end mb-10 ">
             
            </span>
          </div>
        </div>

        <div className="  md:w-full  w-full sm:w-[25vh] mx-3 ">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15]  md:mt-9 mt-6 ">
            <div className="flex justify-center items-center  flex-col mt-9">
              <p className=" text-white font-semibold text-lg ">
                Total Employees({dashboardAdminData.totalEmployees})
              </p>
              <span id="card-icon" className=" pt-12 ">
                <Adminemp/>
              </span>
            </div>

              <span className="flex items-center justify-end mb-12 ">
              
                
              </span>
          </div>
        </div>
        

      {/* notes */}

      {/* <div className="gradient md:w-[43vh] w-full  rounded-3xl BR  md:mt-12 mt-6 pt-2 md:py-0 md:pt-2 py-2 mx-3 px-5 pr-12 md:px-3  md:pr-0 md:mx-3 sm:mx-28  ">
      <div className="px-3  ">
        <NotesIcon />
      </div>
     
    
         <textarea name="notes" value={notes} onChange={handleChange} placeholder="Add Your Notes" className="text-[15px] background   rounded-3xl w-full md:w-[37vh]  md:h-[22vh] h-[20vh] p-3 mt-1 mb-3 text-white scrollbar-hide"></textarea> */}
      {/* </div> */}
      <div className="  md:w-full  w-full sm:w-4/5   mx-3 ">
          <div className="BR gradient flex flex-col justify-start   py-3 rounded-3xl  md:mt-9 mt-6 ">
    
      <span className="px-3  ">
        <NotesIcon />
      </span>

      <textarea
        name="notes"
        value={notes}
        onChange={handleChange}
        placeholder="Add Your Notes here..."
        className="text-[15px] background placeholder:text-slate-300  rounded-3xl  p-3 mx-5  md:h-[3.5vh] xl:h-[4vh] h-[6vh] sm:h-[3vh] mb-1  mt-1 text-white scrollbar-hide"
      />
      <div className=" background rounded-3xl mx-5 h-[10vh] md:h-[10vh] sm:h-[6vh] xl:h-[7vh] pt-3 mt-2 text-wrap overflow-scroll scrollbar-hide">
   <div  className=" text-white  px-3  text-[14px]"  dangerouslySetInnerHTML={{ __html: getnotes }} /></div>
      <span
        onClick={() => {postNotes(); clearNotes()}}
        className="  border-gradient text-white rounded-3xl  px-3 w-[90px] font-light text-[13px] cursor-pointer py-1 mx-6  md:mt-2  mt-1 sm:mt-2  "
      >
        {notes ? "Update Note" : "Add Note +"}
      </span>
    </div>
</div>
        <div className="  md:w-full  w-full sm:w-[25vh] mx-3">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15] md:mt-1 mt-6">
            <div className="flex justify-center items-center  flex-col mt-8">
              <p className=" text-white font-semibold text-lg ">
                Total Tickets({dashboardAdminData.TotalTickets})
              </p>
              <div id="card-icon" className="pt-10 ">
                <TicketRaiseIcon />
              </div>
            </div>

            <span className="flex items-center justify-end mb-11 ">
              
            </span>
          </div>
        </div>

        <div className=" md:w-full rg:w-[35vh] w-full sm:w-[25vh] mx-3">
          <div className="BR gradient    rounded-3xl  border border-[#F5CD15]  md:mt-1 mt-6 ">
            <div className="flex justify-center items-center  flex-col mt-8">
              <p className=" text-white font-semibold text-lg ">
              Total Reviews ({dashboardAdminData.totalReviews})
              </p>
              <span id="card-icon" className="pt-10 ">
                <Reviewsicon />
              </span>
            </div>

            <span className="flex items-center justify-end mb-11 ">
            
            </span>
          </div>
        </div>
        <span className="gradient rounded-3xl md:w-full md:py-3 w-[44vh] BR mx-3 sm:mt-5 md:mt-1 px-5  md:px-0  md:block sm:block  sm:w-2/3 hidden ">
          <Calendar />
        </span>
      </div>
    </>
  );
};

export default Card;
