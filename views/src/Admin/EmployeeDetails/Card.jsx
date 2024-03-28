import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { RiDeleteBin6Line } from "react-icons/ri";
import apiurl from "../../util";
import { Link } from "react-router-dom";
import { profile } from "../../assets/";


const Card = ({ item, id: employeeId, setClick }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const deleteClientAllot = async (id) => {
    if (id) {
      try {
        await apiurl.delete(`deleteClientAllot/${employeeId}?clientId=${id}`);
        setClick(true);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    const data = {
      labels: [
        `completed ${item.progressValue.split("-")[1]}%`,
        `work left  ${100 - item.progressValue.split("-")[1]}%`,
      ],
      datasets: [
        {
          data: [
            item.progressValue.split("-")[1],
            100 - item.progressValue.split("-")[1],
          ],
          backgroundColor: [
            // "rgba(217, 217, 217, 0.5)",
            "rgba(245, 205, 21, 1)",
            "rgba(0, 0, 0, 1)",
          ],
          borderWidth: 0, // To remove border
          borderRadius: 45,
          color: "white",
        },
      ],
    };

    const options = {
      cutout: "60%",
      
    };

    setChartData(data);
    setChartOptions(options);
  }, [item, employeeId, setClick]);

  return (
    <>
      <div className="border-gradient rounded-3xl  h-[230px]  m-2 flex flex-col-reverse mt-3 ">
        <div className=" h-[66%] gradient rounded-br-3xl rounded-bl-3xl  ">
          <div
            className="text-white flex  justify-between  mt-[-65px] px-2"
            id="card-profile"
          >
            <span className="flex ">
            {item && item?.clientLogo ? (
  <div className="">
    <img
      src={item?.clientLogo}
      alt="Client Logo"
      className="rounded-3xl m-3 mt-2 ml-1.5 w-11 h-11"
    />
  </div>
) : (
  <img
    src={profile} // Assuming `profile` is the URL for the default placeholder image
    alt="img"
    width={40}
    height={40}
    className="rounded-3xl m-3 mt-2 ml-1.5"
  />
)}
              <p className=" font-poppins text-md mt-3">
                {item.clientName.split("-")[0].trim()}
              </p>
            </span>

            <span className="bg-primary h-[30px]  text-[12px]  text-black px-2 rounded m-2 font-poppins flex justify-center items-center font-normal">
              {item.clientType}
            </span>
          </div>
          <div className="flex text-white font-poppins  px-3">
            <span className=" ml-[150px] mt-8 text-base font-light ">
              <Link
                to={`/admin/reviewform/${employeeId}`}
                className="flex items-center bg-black text-primary rounded-lg px-3  cursor-pointer"
              >
                <p className="m-0 ml-2 py-1.5 text-[12px] text-primary">
                  + Add Review
                </p>
              </Link>
              <span
                onClick={() => deleteClientAllot(item._id)}
                className="flex items-center bg-black text-primary rounded-lg px-7 py-1.5 mt-4 cursor-pointer"
              >
                <RiDeleteBin6Line />
                <p className="m-0 ml-2  text-[12px]">Delete</p>
              </span>
            </span>
            <span className="absolute ml-[-80px] mt-9 text-base font-light">
              <span className="card w-[120px] h-[60px] absolute left-[6rem] -top-6 my-0 ">
                <Chart
                  type="doughnut"
                  data={chartData}
                  options={chartOptions}
                />
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
