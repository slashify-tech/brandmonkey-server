import React, { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { LuCheckSquare } from "react-icons/lu";
import apiurl from "../../util";
import { useEmployee } from "../../context/employeeContext";

const Card = ({ item, setClick }) => {
  const [clientName, setClientName] = useState("");
  const { getOneClient } = useEmployee();

  const updateOrResolveRequest = async (text) => {
    if (item) {
      const id = item._id;
      const progress = item.progressValue;
      try {
        let url;
        if(text){
          url = `/updateProgress/${id}?progress=${text}`
        }else {
          url = `/updateProgress/${id}?progress=${progress}`
        }
        await apiurl.put(url);
        setClick(false);
      } catch (err) {
        console.log(err);
      }
    }
  };
  useEffect(() => {
    getOneClient(item.forClients, setClientName);
  }, []);

  return (
    <>
      <span className="gradient-color rounded-2xl w-full flex md:flex-row  flex-col justify-center  items-center font-poppins  ">
        <p className=" text-[16px] text-white m-1 p-4 font-light">
          <span className="font-light">Admin</span> has {item.revertBack === "true" ? "reverted" : "raised"} a
          ticket from {clientName?.name} on the following issue : <br />{" "}
          {item.description}
        </p>
        <span className="flex items-center  justify-between gap-5 px-6 md:pl-36 sm:pl-36 text-xl   py-3 ">
          <span>
            <button onClick={() => {
              setClick(true);
              updateOrResolveRequest();
            }} className="flex items-center  bg-black text-[#f5cc15d4] rounded-lg px-4  py-2  cursor-pointer">
              <FaPlay />
              <p className="m-0 ml-2  text-base">{item.progressValue==="done" ? "Processing" : item.progressValue}{" "}</p>
            </button>
          </span>
          <span>
            <button onClick={() => {
              setClick(true);
              updateOrResolveRequest("done");
            }} className="flex   bg-transparent border border-white text-[#f5cc15d4] rounded-lg px-2 py-1 cursor-pointer">
              <LuCheckSquare className="text-white text-xl" />
              <p className="m-0 ml-2 text-base text-white">Done</p>
            </button>
          </span>
        </span>
      </span>
    </>
  );
};

export default Card;
