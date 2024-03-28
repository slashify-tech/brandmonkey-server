import React, { useState } from "react";
import { Link } from "react-router-dom";
import MomPreview from "./MomPreview";
import TicketRaiseDetails from "./TicketRaiseDetails";

const ReviewList = ({
  setPopupOpen2,
  isPopupOpen2,
  selectedTicket,
  handleTicketClick,
  selectedMOM,
  setPopupOpen1,
  isPopupOpen1,
  handleMOMClick,
  ticket,
  momData,
  clientData,
}) => {
  return (
    <>
      {isPopupOpen1 && (
        <MomPreview
          setPopupOpen1={setPopupOpen1}
          isPopupOpen1={isPopupOpen1}
          item={selectedMOM}
        />
      )}
      {isPopupOpen2 && (
        <TicketRaiseDetails
          setPopupOpen2={setPopupOpen2}
          isPopupOpen2={isPopupOpen2}
          item={selectedTicket}
        />
      )}
      <div className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 md:mx-9 mx-4 me-6 md:me-9 sm:me-0  md:gap-9 sm:ml-12 md:ml-14 text-white font-normal mb-5">
        <span>
          <p className="text-white   font-poppins font-medium text-xl md:ml-[3%] ml-[5%] mb-1 ">
            Tickets List
          </p>
          <span className=" w-full h-[30%] md:flex sm:flex justify-start">
            <span className=" mb-8 " id="card-item2">
              <span className="md:w-[65vh] w-full sm:w-[32vh] h-[50vh] md:h-[50vh] sm:h-[35vh] md:ml-0 gradient border-gradient rounded-3xl pt-1 flex flex-col md:m-2 overflow-y-scroll scrollbar-hide">
              {ticket && ticket?.length > 0 ? (
                <>
                {ticket?.map((item, index) => (
                 
                  <div
                    key={index}
                    className="text-white font-poppins font-extralight ml-[2rem] m-0 pt-4 "
                    onClick={() => handleTicketClick(index)}
                  >
                    <p>
                      {new Date(item.issueDate).toLocaleString()}{" "}
                      <span className="text-[#504dec] underline cursor-pointer">
                        {" "}
                        click here
                      </span>
                    </p>
                  </div>
                ))}
                </>
                ) : (
                  <p className="text-white font-poppins font-extralight ml-[2rem] m-0 pt-4">
                    No ticket is raised 
                  </p>
                )}
              </span>
            </span>
          </span>
        </span>

        <span>
          <p className="text-white   font-poppins font-medium text-xl ml-[5%] md:mt-0 sm:mt-9 mt-9  mb-1 ">
            MOM List
          </p>
          <span className=" w-full h-[30%] md:flex sm:flex justify-start  ">
            <span className=" mb-8 " id="card-item2">
              <span className="md:w-[65vh] w-full sm:w-[32vh] h-[50vh] md:h-[50vh] sm:h-[35vh] md:ml-0 gradient border-gradient rounded-3xl pt-1 flex flex-col md:m-2 overflow-y-scroll scrollbar-hide">
                {momData && momData?.length > 0 ? (
                  <>
                    {momData?.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleMOMClick(index)}
                        className="text-white font-poppins font-extralight ml-[2rem] m-0 pt-4 "
                      >
                        <p >
                          {new Date(item.createdAt).toLocaleDateString()}{" "}
                          <span className="text-[#504dec] underline cursor-pointer">
                            {" "}
                            click here
                          </span>
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-white font-poppins font-extralight ml-[2rem] m-0 pt-4">
                    No MOM is present for this client at the moment
                  </p>
                )}
              </span>
            </span>
          </span>
        </span>
      </div>{" "}
      <span className="flex justify-around mb-9 md:mt-2 mt-9">
        <Link to={`/admin/raise-ticket/${clientData?._id}`}>
          {" "}
          <span className="bg-black text-primary font-light border-gradient px-3 py-2 rounded-md  cursor-pointer hover:bg-primary hover:text-black">
            Ticket Raise
          </span>
        </Link>
        <Link to={`/admin/create-mom/${clientData?._id}`}>
          <span className="bg-black text-primary font-light border-gradient   px-3 py-2 rounded-md  cursor-pointer hover:bg-primary hover:text-black">
            Add MOM
          </span>
        </Link>
      </span>
    </>
  );
};

export default ReviewList;
