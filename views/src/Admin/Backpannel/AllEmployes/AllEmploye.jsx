import React, { useEffect, useState } from "react";
import { BrandIcon, Notification, Setting } from "../../../Icon";
import Navbar from "../AllServices/Navbar";

import { IoMdSearch } from "react-icons/io";
import Card from "./Card";
import { FaChevronDown } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useEmployee } from "../../../context/employeeContext";
import Button from "../../../Button";
import Header from "../AllServices/Header";


const TotalEmploye = () => {
  const { getEmployee, allEmployees, handleExportCSV } = useEmployee();
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [client, setClient] = useState(false);
  const [page, setPage] = useState(() => {
    const storedPage = localStorage.getItem("currentPage");
    return storedPage ? parseInt(storedPage) : 1;
  })
  const [allPageData, setAllPageData] = useState({
    currentPage: "",
    hasLastPage: "",
    hasPreviousPage: "",
    nextPage: "",
    previousPage: "",
    lastPage: "",
    totalEmployeesCount: "",
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);

    if (searchQuery) {
      getEmployee({ search: searchQuery }, setAllPageData, page);
    }
    setPage(1);
  };
  
  useEffect(() => {
    localStorage.setItem("currentPage", page.toString());
    if (searchQuery || searchQuery !== "") {
      getEmployee({ search: searchQuery }, setAllPageData, page);
    } else {
      getEmployee({}, setAllPageData, page);
    }
  }, [page, searchQuery, client]);

  return (
    <span className="w-full h-full flex flex-col sm:flex-row bg-[#f5cd15]">
      <span className="bg-[#f5cd15] md:block hidden">
        <span className="ml-4 mt-4 sm:mt-0">
          <BrandIcon />
        </span>

        <Navbar />
      </span>
      <span className="md:w-[95%] sm:w-full w-full bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen scrollbar-hide">
      <Header/>
     
        <div className=" md:mx-16 font-poppins ">
      
        <span className="flex items-center justify-start ml-6 mt-9 gradient rounded-3xl px-5 md:w-[39vh] w-[30vh]  ">
      <IoMdSearch size={25} className="text-white" />
      <input
        type="text"
        placeholder="Search"
        className="h-12  rounded-2xl border-none px-5 ml-2 text-white bg-transparent focus:outline-none"
        onChange={handleSearch}
      />
    </span>

          <span className="flex md:justify-between flex-col sm:flex-row md:gap-9 gap-9 sm:gap-20   md:flex-row ml-6  mr-8  mt-9   ">
       
              <Link to="/admin/addemployee">
                <span
                  id="btn2"
                  className="text-primary border-gradient hover:bg-primary hover:text-black  font-medium rounded-lg text-base  px-8 py-2 text-center me-2 mb-2 "
                >
                  + Add New Employee
                </span>
              </Link>
          
            <span>
              <span className="text-white gradient font-normal rounded-lg text-base  px-10 py-3 text-center me-9 mb-2 ">
                Total : {allPageData?.totalEmployeesCount}
              </span>
            </span>
            <span>
              <span
                id="btn2"
                className="text-primary font-medium rounded-lg text-base  px-8 py-2 text-center  mb-2  border-gradient cursor-pointer hover:bg-primary hover:text-black"
                onClick={() => handleExportCSV()}
              >
                Download
              </span>
            </span>
          </span>

          <span className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1  mt-10 gap-5 md:gap-2 sm:gap-3  ">
            {allEmployees?.map((item, index) => (
              <Card
                currentPage={allPageData.currentPage}
                item={item}
                setClient={setClient}
                key={index}
                index={index}
              />
            ))}
          </span>
            <Button setPage={setPage} allPageData={allPageData} />
        </div>
      </span>
    </span>
  );
};

export default TotalEmploye;
