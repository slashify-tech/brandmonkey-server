import React, { useState } from "react";
import { ViewMore2 } from "../../Icon";
import { Link } from "react-router-dom";

const Card = ({ item }) => {


  return (
    <span className="border-gradient  rounded-3xl m-2 md:w-full w-[40vh] sm:w-[30vh] hover:shadow-lg transition duration-300">
      <span className="text-white flex justify-start">
        <span>
        {item && item?.imageUrl ? (
              <div className="">
                <img
                  src={item?.imageUrl}
                  width={50}
                  height={50}
                  alt=""
                  className="rounded-3xl m-3 mt-2 ml-1.5"
                />
              </div>
            ) : (
              <img src="./Profile.png" width={50} height={50} alt="img"   className="rounded-3xl m-3 mt-2 ml-1.5"/>
            )}
        </span>
        <p className="font-poppins text-lg mt-3">{item.name}</p>
        <span className="flex mt-[10px] text-lg font-medium px-3">
          <p className="text-[#f5cd15] text-[13px]">
            {item.totalTicketsResolved}
          </p>{" "}
          <p className="text-white text-[13px]">/{item.totalTicketsIssued}</p>
        </span>
      </span>
      <div className="flex items-center justify-between text-white font-poppins px-3 py-3 gradient rounded-br-3xl rounded-bl-3xl">
        <span
          className="font-light text-[16px] "
         
        >
          {item?.designation.split(' ').slice(0, 2).join(' ')}...
        </span>
        <Link
          to={`/admin/employee-detail/${item._id}`}
          className="flex items-center"
        >
          <span className="text-[11px] cardglow mx-2 font-extralight hover:underline">
            View more
          </span>
          <span className="mt-2">
            <ViewMore2 />
          </span>
        </Link>
      </div>
   
    </span>
  );
};

export default Card;
