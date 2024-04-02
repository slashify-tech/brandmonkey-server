import React, { useState, useEffect, useMemo } from "react";
import { Chart } from "primereact/chart";
import { AllEmp } from "../../Icon";

import apiurl from "../../util";
import { useAuth } from "../../context/loginContext";

const Card = ({ item, setClick, click, getClientData }) => {
  const { employeeData } = useAuth();
  const [clientWork, setClientWork] = useState("");

  const progressData = useMemo(
    () => ["0-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91-100", "completed"],
    []
  );

  useEffect(() => {
    const getWork = async () => {
      if (employeeData && employeeData._id) {
        try {
          const response = await apiurl.get(
            `/getClientWork/${employeeData._id}?clientName=${item.clientName.split("-")[0].trim()}&clientWork=${item.clientName.split("-")[1].trim()}`
          );
          const clientWorkValue = response.data.clientWork.split("-")[0].trim().toLowerCase() === "yes" ?
            item.clientName.split("-")[1].trim() : response.data.clientWork.split("-")[0].trim() || item.clientName.split("-")[1].trim();
          setClientWork(clientWorkValue);
        } catch (err) {
          console.error("Error fetching client work:", err);
        }
      }
    };

    getWork();
  }, [employeeData, item]);

  const updateProgress = async (progressValue) => {
    if (!employeeData || !employeeData._id) return;

    try {
      await apiurl.put(`/updateWork/${employeeData._id}?workId=${item._id}`, { progressValue });
      getClientData();
      setClick(!click);
    } catch (err) {
      console.error("Error updating work:", err);
    }
  };

  const normalDate = new Date(item.createdAt);
  const formattedDate = normalDate.toLocaleString();

  const chartData = {
    datasets: [
      {
        data: [
          item.progressValue.split("-")[1] || 100,
          100 - item.progressValue.split("-")[1],
        ],
        backgroundColor: [
          "rgba(245, 205, 21, 1)",
          "rgba(0, 0, 0, 1)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    cutout: "60%",
    borderRadius: item.progressValue === "completed" ? 0 : 45,
  };
console.log(item);
  return (
    <div className="border-gradient rounded-3xl md:w-[410px] m-2 flex flex-col mb-5 font-poppins">
      <div className="text-white mx-5 flex justify-between items-center mt-3">
        <div className="flex">
        {item  && item ?.clientLogo ? (
              <div className="">
                <img
                  src={item ?.clientLogo}
                  width={60}
                  height={60}
                  alt="img"
                  className="rounded-3xl m-3 mt-2 ml-1.5"
                />
              </div>
            ) : (
              <img src="./Profile.png" width={60} height={60} alt="img"   className="rounded-3xl m-3 mt-2 ml-1.5"/>
            )}
          <p className="font-poppins text-md mt-3">{item.clientName.split("-")[0]}</p>
        </div>
      </div>
      <div className="w-full gradient rounded-br-3xl rounded-bl-3xl mt-2">
        <div className="flex text-white font-poppins flex-col ml-[2rem]">
          <p className="m-2 mt-6">Client Name - <span className="ml-4 font-extralight">{item.clientName.split("-")[0]}</span></p>
          <p className="m-2">My Work - <span className="ml-[3rem] font-extralight">{clientWork} || {item.clientName.split("-")[1]}</span></p>
          <p className="m-2">My Service - <span className="ml-8 font-extralight">{employeeData?.services.slice(0, 16)}...</span></p>
          <p className="m-2">
            Update Work - {" "}
            <span className="ml-4">
              <select
                onChange={(e) => updateProgress(e.target.value)}
                className="bg-transparent rounded-[0.5rem] text-white w-[40%] py-2 p-[2px] border border-white font-poppins font-medium"
              >
                <option value={item.progressValue !== "completed" ? item.progressValue : "100"}>{item.progressValue !== "completed" ? `${item.progressValue}% done` : "Update Work"}</option>
                {progressData.map((progress, index) => (
                  <option key={index} value={progress} className="bg-black">
                    {progress !== "completed" ? `${progress}%` : "completed"}
                  </option>
                ))}
              </select>
            </span>
          </p>
          <p className="m-2">Work Progress - <span className="ml-2"><Chart type="doughnut" data={chartData} options={chartOptions} className="w-[140px] ml-[10rem] my-2 mt-[-2rem] mb-2" /></span></p>
        </div>
      </div>
    </div>
  );
};

export default Card;
