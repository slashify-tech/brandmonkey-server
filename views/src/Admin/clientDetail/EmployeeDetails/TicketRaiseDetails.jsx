import React from "react";
import { IoClose } from "react-icons/io5";

const TicketRaiseDetails = ({ setPopupOpen2, isPopupOpen2, item }) => {
  console.log(item);
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#333333] z-50 shadow font-poppins overflow-y-scroll ${
        isPopupOpen2 ? "block" : "hidden"
      }`}
    >
      <div className="bg-black p-4 mx-3 md:mt-0 mt-20 md:p-7 rounded-lg  md:w-[50%] w-full relative shadow text-white font-poppins ">
        <button
          className="absolute top-2 right-2 text-white bg-black  cursor-pointer hover:text-gray-800 z-50"
          onClick={() => setPopupOpen2(false)}
        >
          <IoClose size={30} color="white" />
        </button>

        <div className="mt-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-center">
            Ticket Raise Page
          </h1>
        </div>

        <form className="mt-7 md:ml-20">
          <p className="mt-3 font-normal">Services </p>
          <p className="md:w-[90%] px-3 w-full h-[9vh] mt-2  bg-white p-2 rounded-lg text-black">
            {item.services}
          </p>

          <p className="mt-3 font-normal">Assigned Employee </p>
          <p className="md:w-[90%] px-3 w-full h-[9vh] mt-2  bg-white p-2 rounded-lg text-black">
            {item?.toEmployee?.name}
          </p>

          <p className=" mb-2 font-normal">Description </p>
          <p className="md:w-[90%] px-3 w-full h-[25vh]  overflow-y-auto mb-5 bg-white p-2 rounded-lg text-black">
            {item.description}
          </p>
        </form>
      </div>
    </div>
  );
};

export default TicketRaiseDetails;
