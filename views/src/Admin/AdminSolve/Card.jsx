import React from "react";

const Card = ({item, ticketResolveOrRevert}) => {

  return (
    <span className="gradient-color rounded-2xl w-full md:flex justify-between items-center font-poppins  ">
      <p className="  font-light text-white m-1 p-4">
      {item.toEmployee.name} has solved the issue from{" "}
                  {item?.forClients?.name} on : {item?.description}
      </p>
      <span className="flex text-xl  gap-2  items-center md:pl-[10rem] mr-2 mx-6 my-3 md:mx-3 md:my-0  ">
        <span onClick={() => ticketResolveOrRevert(item._id, "reject")}>
          <button className="flex   bg-transparent border border-white text-[#f5cc15d4] rounded-lg px-6 py-1 cursor-pointer">
            <p className="m-0 ml-2 text-base text-white">Decline</p>
          </button>
        </span>
        <span onClick={() => ticketResolveOrRevert(item._id, "accept")}>
          <span className="flex bg-black text-[#f5cc15d4] rounded-lg px-6  py-2 cursor-pointer  ">
            <p className="m-0 ml-2  text-base font-semibold">Accept</p>
          </span>
        </span>
      </span> 
    </span>
  );
};

export default Card;
