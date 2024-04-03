import React from "react";
import Card from "./Card";
import { BrandIcon, Notification, Setting } from "../../Icon";
import Navbar from "../empDashboard/Navbar";

import Header from "../empDashboard/Header";

const Resolve = () => {
  
  return (
    <>
      <span className=" flex bg-primary font-poppins  h-screen">
        <span className="child md:block hidden ">
          <span className="ml-3">
            <BrandIcon />
          </span>
          <Navbar />
        </span>
        <span className="bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] md:w-[95%] w-full h-screen overflow-scroll scrollbar-hide">
        <Header/>
          <span className="flex justify-start items-center">
            <span className="grid grid-cols-1 mt-[4rem] gap-4 md:mx-20 mx-6  ">
              <Card />
            </span>
          </span>
        </span>
      </span>
    </>
  );
};

export default Resolve;
