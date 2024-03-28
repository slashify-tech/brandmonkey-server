import React, { useEffect, useState } from "react";
import TicketRaiseDetails from "./TicketRaiseDetails";

const TicketDetails = ({ ticketData, id, getTicketForEmployee }) => {
  const [isPopupOpen2, setPopupOpen2] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);


  const handleTicketClick = (index) => {
    if (ticketData && ticketData[index]) {
      setSelectedTicket(ticketData[index]);
      setPopupOpen2(true);
    }
  };



  useEffect(() => {
    if (isPopupOpen2) {
      getTicketForEmployee();
    }
  }, [isPopupOpen2]);


  return (
    <>
      {isPopupOpen2 && (
        <TicketRaiseDetails
          setPopupOpen2={setPopupOpen2}
          isPopupOpen2={isPopupOpen2}
          item={selectedTicket}
        />
      )}
      <p className="text-white   font-poppins font-medium text-xl ml-[8%] md:ml-2 md:mt-[4%] mb-[5px] sm:ml-11 mt-9">
        Ticket Raised :
      </p>
      <span className="  flex justify-center  mr-8 ml-3 md:ml-0 md:mr-0 sm:mx-8 sm:mr-11 text-white ">
        <span className=" mb-8  w-full ">
          <span className="w-full py-5 gradient border-gradient rounded-3xl pt-1 flex flex-col m-2 h-[36vh] overflow-y-scroll scrollbar-hide">
            {ticketData?.map((item, index) => (
              <span
                onClick={() => handleTicketClick(index)}
                className="text-white font-poppins font-normal ml-[2rem] m-0 pt-4"
              >
                {new Date(item.issueDate).toLocaleString()}
                <span className="text-[#504dec] underline cursor-pointer">
                  {" "}
                  click here
                </span>
              </span>
            ))}
          </span>
        </span>
      </span>
    </>
  );
};

export default TicketDetails;
