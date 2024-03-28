import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import apiurl from "../../../util";

const MomPreview = ({ setPopupOpen1, isPopupOpen1, item }) => {
  const closePopup = () => {
    setPopupOpen1(false);
  };

  const deleteMOM = async (id) => {
    if (id) {
      try {
        await apiurl.delete(`deleteMOM/${id}`);
        setPopupOpen1(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    deleteMOM();
  }, []);
  return (
    <>
      <div
        className={`fixed inset-0 flex bg-[#333333] items-center justify-center z-50 shadow overflow-y-scroll  ${
          isPopupOpen1 ? "block" : "hidden"
        }`}
      >
        <div className="bg-[#000000] p-4 mx-3 md:mt-52 mt-20 md:p-7 rounded-lg  md:w-[50%] w-full relative shadow">
          <button
            className="absolute top-5 right-6  bg-black text-gray-500 hover:text-gray-800 cursor-pointer"
            onClick={closePopup}
          >
            <IoClose size={30} color="white" />
          </button>

          <div className="mt-2">
            <h1 className="text-2xl md:text-3xl font-bold text-center">
              MOM Preview
            </h1>
          </div>
          <div className="flex justify-evenly items-center pt-2">
            <hr className=" border-[#000000] w-[97%] " />
          </div>

          <div>
            <form className="mt-7 md:ml-9">
              <p className="mt-3 text-white">Topics Discuss * </p>
              <p className="md:w-[90%] px-3 w-[93%] h-[15vh] mt-2 bg-white text-black overflow-y-auto rounded-lg pt-5 ">
                {item?.topicDiscuss}
              </p>
              <p className="mt-3 text-white">Attendees * </p>
              <p className="md:w-[90%] px-3 w-[93%] h-[15vh] mt-2 bg-white  text-blackoverflow-y-auto rounded-lg pt-5  ">
                {item?.attendees.split(",").join(', ')}
              </p>
              <p className="mt-3 text-white">Complain</p>
              <p className="md:w-[90%] px-3 w-[93%] h-[15vh] mt-2 bg-white text-black  overflow-y-auto rounded-lg pt-5">
                {item?.complain}
              </p>

              <p className="mt-3 text-white">Feedback </p>
              <p className="md:w-[90%] px-3 w-[93%] h-[15vh] bg-white text-black mt-2 overflow-y-auto rounded-lg pt-5 mb-9">
                {item?.feedback}
              </p>

              <span
                onClick={() => deleteMOM(item?._id)}
                className="absolute top-5 left-6 text-gray-500  hover:text-gray-800 cursor-pointer"
              >
                <RiDeleteBinLine
                  size={25}
                  color="yellow"
                  onClick={() => {
                    deleteMOM(item?._id);
                  }}
                />
              </span>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default MomPreview;
