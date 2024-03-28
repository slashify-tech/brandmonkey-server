import React from "react";
import { BrandIcon } from "../../Icon";
import Navbar from "../empDashboard/Navbar";
import Card from "./Card";
import { FaChevronDown } from "react-icons/fa6";
import Header from "../empDashboard/Header";

const UpdateTask = () => {
  return (
    <>
      <span className=" flex bg-primary font-poppins">
        <span className="child md:block hidden">
          <span className="ml-3">
            <BrandIcon />
          </span>
          <Navbar />
        </span>
        <span className="bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] md:w-[95%] w-full h-screen overflow-scroll scrollbar-hide">
             <Header/>
          <Card />
        </span>
      </span>
    </>
  );
};

export default UpdateTask;
