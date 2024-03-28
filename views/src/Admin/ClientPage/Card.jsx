import React from "react";
import { ViewMore2 } from "../../Icon";

import { Link } from "react-router-dom";
import { profile } from "../../assets";

const Card = ({ item,  }) => {
  const color = item.colorZone || "white";
  return (
    <div className="border-gradient rounded-3xl  m-2  md:w-full w-[40vh] sm:w-[30vh] ">
      <span className="text-white flex justify-start items-start    ">
        <span>
          {item  && item ?.clientLogo ? (
            <div className="">
              <img
                src={item ?.clientLogo}
                width={50}
                height={50}
                alt="img"
                className=" rounded-3xl m-3 mt-2 ml-1.5 "
              />
            </div>
          ) : (
            <img
              width={50}
              height={50}
              src= {profile}
              alt="img"
              className=" rounded-3xl m-3 mt-2 ml-1.5 "
            />
          )}
        </span>

        <span>
          <p className=" font-poppins text-lg mt-3 ">{item.name}</p>
        </span>

        <span
          className={`w-3 h-3 mt-5 rounded-full ml-3 `}
          style={{ backgroundColor: color }}
        ></span>
      </span>

      <div className=" flex items-center justify-between  text-white font-poppins px-3 py-3   gradient rounded-br-3xl rounded-bl-3xl">
        <span className="font-light text-[16px]  ">
          {" "}
          Ticket : {item.ticketsCount}
        </span>

        <Link
          to={`/admin/client-detail/${item._id}`}
          className="flex items-center"
        >
          <span className="text-[11px] cardglow mx-2 font-extralight ">
            View more
          </span>
          <span className="mt-2">
            <ViewMore2 />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Card;
