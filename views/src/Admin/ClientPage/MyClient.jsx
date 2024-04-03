import React, { useEffect, useState } from "react";
import Card from "./Card";
import { BrandIcon } from "../../Icon";

import Navbar from "../DashBordPage/Navbar";
import { useEmployee } from "../../context/employeeContext";
import Button from "../../Button";
import Loading from "../../Loading";
import Header from "../DashBordPage/Header";
import { IoMdSearch } from "react-icons/io";

const MyClient = () => {
  const { allClients, getClients } = useEmployee();
  const [clientType, setClientType] = useState("Regular");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [allPageData, setAllPageData] = useState({
    currentPage: "",
    hasLastPage: "",
    hasPreviousPage: "",
    nextPage: "",
    previousPage: "",
    lastPage: "",
    totalClientsCount: "",
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    if (searchQuery || searchQuery !== "") {
      getClients({ search: searchQuery }, setAllPageData, page);
    } else {
      getClients({}, setAllPageData, page);
    }
    localStorage.setItem("currentPage", page);
  }, [page,  searchQuery]);
  
  useEffect(() => {
    getClients({}, setAllPageData, page, clientType);
  }, [page, clientType]);

  return (
    <span className="w-full   flex flex-col sm:flex-row bg-[#f5cd15] font-poppins">
      <span className="bg-[#f5cd15] hidden md:block  h-screen">
        <span className="ml-4 mt-4 sm:mt-0">
          <BrandIcon />
        </span>
        <span className="mt-[-3rem]">
          <Navbar />
        </span>
      </span>
      <span className="w-full bg-black  md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen ">
      <Header />
         <span className = "flex md:flex-row flex-col justify-between items-center md:mx-20 ">
        <span className="flex justify-center items-center gap-5 mt-9 ">
          {["Regular", "Onetime"].map((item, index) => (
            <span
             
              key={index}
              onClick={() => setClientType(item)}
              className={` ${
                    clientType === item
                      ? "bg-primary hover:bg-transparent hover:text-primary text-black"
                      : "bg-transparent hover:bg-primary hover:text-black text-primary"
                  } cursor-pointer border-gradient font-medium rounded-lg text-base  px-8 py-2 text-center me-2 mb-2 `}
            >
              {item}
            </span>
          ))}
         
        </span>
        <span className="flex items-center justify-start  mt-9 gradient rounded-3xl px-5 md:w-[39vh] w-[30vh]  md:ml-20 ">
              <IoMdSearch size={25} className="text-white" />
              <input
                type="text"
                placeholder="Search"
                className="h-12 rounded-2xl border-none px-5 ml-2 text-white bg-transparent focus:outline-none"
                onChange={handleSearch}
              />
            </span>
            </span>
        <span className="  ">
          <span className="grid md:grid-cols-3 grid-cols-1 mt-9 sm:grid-cols-2  md:gap-9  gap-9 sm:gap-9 md:me-16 md:ml-9 sm:px-9  mx-3">
            {allClients?.length > 0 && (
              <>
                {allClients?.map((item, index) => (
                  <Card key={index} item={item} />
                ))}
              </>
            ) }
          </span>
          <span className="text-white ">
          {allClients?.length > 0 ? <Button setPage={setPage} allPageData={allPageData} /> : <>No data available to show here...</>}
          </span>
        </span>
      </span>
    </span>
  );
};

export default MyClient;
