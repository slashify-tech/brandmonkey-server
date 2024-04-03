import React, { useEffect, useState } from "react";
import Card from "./Card";
import { BrandIcon } from "../../Icon";

import Navbar from "../DashBordPage/Navbar";
import Loading from "../../Loading";

import Button from "../../Button";
import Header from "../DashBordPage/Header";
import apiurl from "../../util";
import { useParams } from "react-router-dom";
import { useEmployee } from "../../context/employeeContext";
import { IoMdSearch } from "react-icons/io";
const MyEmployee = () => {
  const { getEmployee, allEmployees } = useEmployee();
  const [date, setDate] = useState(getDateFormatted());
  const [searchQuery, setSearchQuery] = useState(undefined);

  const [daysOffset, setDaysOffset] = useState(0);
  const [page, setPage] = useState(1);
  const { id } = useParams();
  const [allPageData, setAllPageData] = useState({
    currentPage: "",
    hasLastPage: "",
    hasPreviousPage: "",
    nextPage: "",
    previousPage: "",
    lastPage: "",
    totalEmployeesCount: "",
  });
  function getDateFormatted(offset = 0) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - offset);
    const dayOfMonth = currentDate.getDate();

    const year = currentDate.getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[currentDate.getMonth()];
    return `${dayOfMonth} ${month} ${year}`;
  }
  const downloadAllEmployeeHit = async () => {
  
      try {
        const response = await apiurl.get(`/getAllEmployeesHit`);
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "employeeSheet.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.log(err);
      }
    
  };

  const downloadAllEmployeeSheet = async () => {
    try {
      const currentDate = getDateFormatted(daysOffset);
      const response = await apiurl.get(
        `/getAllEmployeesSheet`
      ); // Replace with your actual server URL and port
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exportedData.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };
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
  }, [page, searchQuery]);

  


  return (
    <>
      <span className="w-full   flex flex-col sm:flex-row bg-[#f5cd15] font-poppins ">
        <span className="bg-[#f5cd15] hidden md:block  h-screen">
          <span className="ml-4 mt-4 sm:mt-0">
            <BrandIcon />
          </span>
          <span className="mt-[-3rem]">
            <Navbar />
          </span>
        </span>
        <span className="w-full bg-black  md:rounded-bl-[2rem] md:rounded-tl-[2rem] overflow-x-hidden h-screen ">
        <Header/>
        <span className="flex md:flex-row flex-col justify-between items-center pe-16">
        <span className="flex md:flex-row sm:flex-row flex-col  justify-start xl:ml-72 md:items-center sm:items-center md:gap-9 gap-3 md:ml-16 sm:ml-9 mt-14 ">
      <button
              onClick={() =>{  downloadAllEmployeeSheet()}}
              className="px-8 py-3 BR rounded-lg text-primary  bg-black mt-2 md:mb-5 mb  cursor-pointer mx-6 md:mx-0"
            >
              Bulk Sheet Download
            </button>
            <button
              onClick={() =>{  downloadAllEmployeeHit()}}
              className="px-8 py-3 BR rounded-lg text-primary  bg-black mt-2 md:mb-5 mb  cursor-pointer mx-6 md:mx-0"
            >
              Bulk Slot Download
            </button>
            
            </span>
            <span className="flex items-center justify-start  ml-6 mt-9 gradient rounded-3xl px-5 md:w-[39vh] w-[30vh]  ">
      <IoMdSearch size={25} className="text-white" />
      <input
        type="text"
        placeholder="Search"
        className="h-12  rounded-2xl border-none px-5 ml-2 text-white bg-transparent focus:outline-none"
        onChange={handleSearch}
      />
    </span></span>
          <span className="flex justify-center items-center mt-6">
            <span className="grid md:grid-cols-3 grid-cols-1 sm:grid-cols-2  gap-9 md:me-12 md:ml-5 ">

              {allEmployees?.length > 0 && (
                <>
                  {allEmployees?.map((item, index) => (
                    <Card
                      item={item}
                      key={index}
                      onetime={false}
                      currentPage={allPageData?.currentPage}
                    />
                  ))}
                </>
              ) }

            </span>
          </span> 
            {(allEmployees?.length > 0) ? <Button setPage={setPage} allPageData={allPageData} /> : <Loading message={"please wait..."} />}
        </span>
      </span>
    </>
  );
};

export default MyEmployee;
