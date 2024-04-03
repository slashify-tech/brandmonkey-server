import React, { useEffect, useState } from "react";
import { BrandIcon } from "../../Icon";
import Navbar from "../DashBordPage/Navbar";
import { useParams } from "react-router-dom";
import apiurl from "../../util";
import Header from "../DashBordPage/Header";


const Sheet = () => {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [dynamicRows, setDynamicRows] = useState([]);
  const [daysOffset, setDaysOffset] = useState(0);
  const [date, setDate] = useState(getDateFormatted());
  const [hoveredActivity, setHoveredActivity] = useState(null);

  function getDateFormatted(offset) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - offset);
    const dayOfMonth = currentDate.getDate();
    const year = currentDate.getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[currentDate.getMonth()];
    return `${dayOfMonth} ${month} ${year}`;
  }

  const fetchActivities = async () => {
    if (id) {
      const currentDate = getDateFormatted(daysOffset);
      setDate(currentDate);
      try {
        const response = await apiurl.get(
          `/getTaskForEmployee?employeeId=${id}&date=${currentDate}`
        );
        setRows(response.data);
      } catch (error) {
        setRows([]);
        console.error("Error fetching tasks:", error);
      }

      try {
        const extraResponse = await apiurl.get(
          `/getExtraTaskForEmployee?employeeId=${id}&date=${currentDate}`
        );
        setDynamicRows(extraResponse.data);
      } catch (error) {
        setDynamicRows([]);
        console.error("Error fetching extra tasks:", error);
      }
    }
  };

  const dateString = (dateStr) => {
    const dateObject = new Date(dateStr);
    const timeOptions = { hour: 'numeric', minute: 'numeric' };
    const time = dateObject.toLocaleTimeString([], timeOptions);
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = dateObject.toLocaleDateString([], dateOptions);
    return ` ${time} ${date}`;
  };

  //particular download
  const downloadEmployeeSheet = async () => {
    try {
      const currentDate = getDateFormatted(daysOffset);
      const response = await apiurl.get(
        `/getEmployeesSheet/${id}`
      ); // Replace with your actual server URL and port
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exportedData.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };



  const handlePrevDate = () => {
    setDaysOffset((prevOffset) => prevOffset + 1);
  };

  const handleNextDate = () => {
    setDaysOffset((prevOffset) => prevOffset - 1);
  };

  useEffect(() => {
    fetchActivities();
  }, [daysOffset]);

  return (
    <span className="w-full   flex  bg-[#f5cd15] font-poppins">
      <span className="bg-[#f5cd15] md:block hidden">
        <span className="ml-4 mt-4 sm:mt-0">
          <BrandIcon />
        </span>
        <Navbar />
      </span>

      <span className="w-full bg-black rounded-lg overflow-scroll  scrollbar-hide h-screen md:rounded-tl-[2rem] md:rounded-bl-[2rem] ">
      <Header/>
        <div className="  w-full ">
          <div className=" border-5   md:mx-20 mt-20 font-poppins  ">
         
        
            <button
              onClick={() =>{  downloadEmployeeSheet()}}
              className="px-8 py-3 BR rounded-lg text-primary  bg-black  md:mb-5   cursor-pointer mx-6 md:mx-0 mt-2 mb-5"
            >
              Download Sheet
            </button>
           
            <span className="flex md:justify-start md:gap-5 md:items-center w-full mx-6 md:mx-0 ">
              <span className="gradient md:px-3 py-3 w-full md:w-36 text-center  text-primary  bg-black rounded-lg cursor-pointer">
                {date}
              </span>
              <span className="text-primary w-full md:w-28 cursor-pointer md:border md:px-3 py-2 rounded-lg hover:bg-primary hover:text-black ml-9 md:ml-0" onClick={handlePrevDate}>
                &#11160; Prev Date
              </span>
              <span className="text-primary w-full md:w-28 cursor-pointer md:border md:px-3 py-2 rounded-lg hover:bg-primary hover:text-black" onClick={handleNextDate}>
                Next Date &#11162;
              </span>
            </span>
           
            <span className="flex justify-between md:w-full w-[130%] sm:w-full md:gap-0 gap-9  md:text-center text-white font-medium text-[22px] mt-14  mx-6 md:mx-0">
              <p>Time</p>
              <p className="md:ml-0 ml-5">Client</p>
              <p>Activity</p>
              <p className="md:mr-9">Fill Time</p>
            </span>
          </div>

          {rows?.length > 0 ? (
  rows.map((item, index) => (
    <div key={index} className=" border-5 md:mx-20 mt-20 mx-6 w-[130%] md:w-[85%] sm:w-full">
      <span className="flex justify-between text-center text-white font-extralight text-[15px] mt-14 ">
        <p className="z-50">{item?.timeSlot}</p>
        <p>{item?.clientName}</p>
        <p 
          className="hover:underline cursor-pointer"
          onMouseMove={(e) => setHoveredActivity({ activity: item.activity, position: { x: e.clientX, y: e.clientY } })}
          onMouseLeave={() => setHoveredActivity(null)}
        >
          {item?.activity.split(' ').slice(0, 2).join(' ')}
        </p>
        <p>{dateString(item.createdAt)}</p>
      </span>
      {hoveredActivity && hoveredActivity.activity === item.activity && (
        <div
          className="absolute bg-white p-2 shadow-md  w-1/5 px-6 rounded-xl" 
          style={{ top: hoveredActivity.position.y -130, left: hoveredActivity.position.x - 360 }}
        >
          <p>{item.activity}</p>
        </div>
      )}
    </div>
  ))
) : (
  <p className="text-center text-white mt-9 font-thin">No slots yet filled</p>
)}

<p className="text-primary text-center mt-16">Extra Work Slot</p>
{dynamicRows?.length > 0 ? (
  dynamicRows.map((item, index) => (
    <div key={index} className=" border-5 md:mx-20  mx-6 w-[130%] md:w-[85%]  sm:w-full mb-9">
      <span className="flex justify-between  items-center text-white font-normal text-[15px] mt-14 ">
        <p className="z-50">{item?.timeSlot}</p>
        <p>{item?.clientName}</p>
        <p 
          className="hover:underline cursor-pointer"
          onMouseMove={(e) => setHoveredActivity({ activity: item.activity, position: { x: e.clientX, y: e.clientY } })}
          onMouseLeave={() => setHoveredActivity(null)}
        >
          {item?.activity.split(' ').slice(0, 2).join(' ')}
        </p>
        <p>{dateString(item.createdAt)}</p>
      </span>
      {hoveredActivity && hoveredActivity.activity === item.activity && (
        <div
          className="absolute bg-white p-2 shadow-md w-1/5 px-6 rounded-xl"
          style={{ top: hoveredActivity.position.y -130, left: hoveredActivity.position.x -300 }}
        >
          <p>{item.activity}</p>
        </div>
      )}
    </div>
  ))
) : (
  <p className="text-center mb-9 mt-12 text-white font-thin">No extra work</p>
)}

      </div>
      </span>
    </span>
    
  );
};

export default Sheet;