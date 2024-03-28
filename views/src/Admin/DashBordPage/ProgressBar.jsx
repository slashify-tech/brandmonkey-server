// ProgressBar.jsx
import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

export default function ProgressBar({total, valueCompleted, valuePending, work, title, totalCount}) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const data = {
      datasets: [
        {
          data: [valuePending, valueCompleted],
          backgroundColor: [
            "rgba(245, 205, 21, 1)",
            "rgba(0, 0, 0, 1)",
          ],
          borderWidth: 0,
        
        },
      ],
    };

    const options = {
      cutout: "60%",
    };

    setChartData(data);
    setChartOptions(options);
  }, [total, valueCompleted, valuePending, work]);

  return (
    <div className="mt-5 md:px-5  ">
      <div className="BR gradient rounded-3xl flex justify-between mrelative md:gap-12  md:w-[103%]  w-full  font-poppins md:h-[14rem] h-[16rem]">
        <span>
          <p className="ml-[7rem]  text-base font-medium p-4 text-white w-full">
         {title}
          </p>
    
          <span className="card md:w-[160px] w-[139px] top-16 md:top-12 absolute left-10 md:left-16  xl:left-[7rem]">
            <Chart type="doughnut" data={chartData} options={{
                  ...chartOptions,
                  borderRadius:  45,}}/>
                  <span className="text-white font-semibold md:text-[28px] text-[25px] absolute md:top-[65px] md:left-[68px] top-14 left-14 ">{totalCount}</span>
          </span>
        </span>

        <div className="text-white flex flex-col md:m-4 p-6 relative w-full md:left-[3rem] xl:left-[9rem] md:top-0 top-8 ">
          <div className="border-l-4 border-[#F5CD15] ">
          <span className=" w-1 bg-primary h-8 mt-2  rounded-lg absolute -translate-x-3"></span>
            <p className="text-sm font-light m-0">{work ? "Good" :"Total Tickets"}</p>
            <span className="text-base">{total}</span>
          </div>
          <div className="border-l-4 border-[#2e2e2e]">
          <span className=" w-1 bg-black h-8 mt-2  rounded-lg absolute -translate-x-3"></span>
            <p className="text-sm font-light m-0">{work ? "Bad" :"Pending"}</p>
            <span className="text-base">{valuePending}</span>
          </div>
          <div className="border-l-4 border-[#969696]">
          <span className=" w-1 bg-[#969696] h-8 mt-2  rounded-lg absolute -translate-x-3"></span>
            <p className="text-sm font-light m-0">{work ? "Total" :"Resolved"}</p>
            <span className="text-base">{valueCompleted}</span>
          </div>
        </div>
{/* 
        <div className="absolute bottom-1 md:left-[14rem] text-white flex gap-2 font-extralight text-[15px] py-2">
        <span className="px-3">
            <input type="radio" id="monthly" name="subscriptionType" checked  />
            <label htmlFor="monthly"> Monthly</label>
            </span>
        <span>
            <input type="radio" id="yearly" name="subscriptionType" />
            <label htmlFor="yearly"> Yearly</label>
            </span>
        </div> */}
      </div>
    </div>
  );
}
