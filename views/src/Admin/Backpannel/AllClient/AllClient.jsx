import React, { useEffect, useState } from "react";
import { BrandIcon, Notification, Setting } from "../../../Icon";
import Navbar from "../AllServices/Navbar";

import { IoMdSearch } from "react-icons/io";
import Card from "./Card";
import { FaChevronDown } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useEmployee } from "../../../context/employeeContext";
import Button from "../../../Button";
import Loading from "../../../Loading";
import Header from "../AllServices/Header";


const AllClient = () => {
  const { getClients, allClients, handleExportCSVEntry } = useEmployee();
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [page, setPage] = useState(() => {
    const storedPage = Number(localStorage.getItem("currentPage"));
    return storedPage ? storedPage : 1;
  });
  const [allPageData, setAllPageData] = useState({
    currentPage: "",
    hasLastPage: "",
    hasPreviousPage: "",
    nextPage: "",
    previousPage: "",
    lastPage: "",
    totalCount: "",
  });
  const [client, setClient] = useState(false);

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
  }, [page, client, searchQuery]);

  return (
    <>
      <span className="w-full h-full flex flex-col sm:flex-row bg-[#f5cd15]">
        <span className="bg-[#f5cd15] md:block hidden">
          <span className="ml-4 mt-4 sm:mt-0">
            <BrandIcon />
          </span>

          <Navbar />
        </span>
        <span className="w-full bg-black   md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen scrollbar-hide">
        <Header/>
          <div className=" md:mx-16 font-poppins">
            <span className="flex items-center justify-start  mt-9 gradient rounded-3xl px-5 md:w-[39vh] w-[30vh] ml-6 md:ml-0 ">
              <IoMdSearch size={25} className="text-white" />
              <input
                type="text"
                placeholder="Search"
                className="h-12 rounded-2xl border-none px-5 ml-2 text-white bg-transparent focus:outline-none"
                onChange={handleSearch}
              />
            </span>
            <span className="flex md:justify-between flex-col sm:flex-row md:gap-9 gap-9 sm:gap-16   md:flex-row md:ml-2 ml-6  mr-8  mt-9    ">
              <span className="">
                <Link to="/admin/addclient">
                  <span className="text-primary border-gradient font-normal rounded-lg text-base  px-8 py-2 text-center me-2 mb-2  cursor-pointer">
                    + Add New Client
                  </span>
                </Link>
              </span>
              <span>
                <span className="text-white gradient font-normal rounded-lg text-base  px-10 py-3 text-center me-9 mb-2">
                  Total : {allPageData?.totalClientsCount || allClients?.length}
                </span>
              </span>
              <span>
                <span
                  id="btn2"
                  onClick={() => handleExportCSVEntry()}
                  className="text-primary border-gradient font-normal  cursor-pointer rounded-lg text-base  px-8 py-2 text-center  mb-2"
                >
                  Download
                </span>
              </span>
            </span>

            <span className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1  mt-10 gap-5 md:gap-7 sm:gap-3   ">
              {allClients?.map((item, index) => (
                <Card
                  currentPage={allPageData.currentPage}
                  index={index}
                  key={index}
                  setClient={setClient}
                  item={item}
                />
              ))}
            
            </span>
            {allClients?.length > 0 ? <Button setPage={setPage} allPageData={allPageData} /> : <Loading />}
          </div>
        </span>
      </span>
    </>
  );
};

export default AllClient;
