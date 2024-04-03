import React, { useEffect, useState } from "react";
import apiurl from "../../util";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { FaCircleCheck, FaCirclePlus } from "react-icons/fa6";
import { useAuth } from "../../context/loginContext";
import { toast } from "react-toastify";
function getDateFormatted() {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate());
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
  console.log(`${dayOfMonth} ${month} ${year}`);
  return `${dayOfMonth} ${month} ${year}`;
}
const Card = () => {

  // Function to generate the static time slots
  const { employeeData } = useAuth();
  const [click, setClick] = useState(false);
  const [clients, setClients] = useState([]);
  const extraSlots = [
   
    "07:00 PM - 07:30 PM",
    "07:30 PM - 08:00 PM",
    "08:00 PM - 08:30 PM",
    "08:30 PM - 09:00 PM",
    "09:00 PM - 9:30 PM",
    "09:30 PM - 10:00 PM",
    "10:30 PM - 11:00 PM",
    "11:00 PM - 11:30 PM",
    "11:30 PM - 12:00 AM",
 
  ];
  const generateTimeSlots = () => {
    const timeSlots = [
      "10:00 AM - 10:30 AM",
      "10:30 AM - 11:00 AM",
      "11:00 AM - 11:30 AM",
      "11:30 AM - 12:00 PM",
      "12:00 PM - 12:30 PM",
      "12:30 PM - 01:00 PM",
      "01:00 PM - 01:30 PM",
      "01:30 PM - 02:00 PM",
      "02:00 PM - 02:30 PM",
      "02:30 PM - 03:00 PM",
      "03:00 PM - 03:30 PM",
      "03:30 PM - 04:00 PM",
      "04:00 PM - 04:30 PM",
      "04:30 PM - 05:00 PM",
      "05:00 PM - 05:30 PM",
      "05:30 PM - 06:00 PM",
      "06:00 PM - 06:30 PM",
      "06:30 PM - 07:00 PM",
    ];
    return timeSlots.map((timeSlot, index) => ({
      id: index,
      timeSlot,
      _id: "",
      clientName: "",
      activity: "",
    }));
  };
  const getClientData = async () => {
    try {
      const response = await apiurl.get(`/getclientName?clientOrNot=${true}`);
      setClients(response.data?.client?.map((item => item.name)));
    } catch (err) {
      console.log(err);
    }
  };
  const fetchActivities = async () => {
    if (employeeData?._id) {
      const currentDate = getDateFormatted();
      try {
        const response = await apiurl.get(
          `/getTaskForEmployee?employeeId=${employeeData?._id}&date=${currentDate}`
        );
        setRows((prevRows) => {
          const updatedRows = [...prevRows];
          response.data.forEach((updatedRow) => {
            const index = updatedRows.findIndex(
              (row) => row.timeSlot === updatedRow.timeSlot
            );
            if (index !== -1) {
              updatedRows[index] = { ...updatedRows[index], ...updatedRow };
            }
          });
          return updatedRows;
        });
        console.log(response.data);
        const extraResponse = await apiurl.get(
          `/getExtraTaskForEmployee?employeeId=${employeeData?._id}&date=${currentDate}`
        );
        setDynamicRows(extraResponse.data);
        console.log(extraResponse.data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    }
  };
 
  // Initial state with static time slots
  const [rows, setRows] = useState(generateTimeSlots());
  const [dynamicRows, setDynamicRows] = useState([]);
  const [successIcon, setSuccessIcon] = useState([]);
  const [successStatic, setSuccessStatic] = useState([]);
  // Function to handle dropdown option change
  const handleOptionChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // Function to handle input field change
  const handleInputChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].activity = value;
    setRows(updatedRows);
  };

  // Function to handle dropdown option change for dynamic rows
  const handleDynamicOptionChange = (index, field, value) => {
    const updatedDynamicRows = [...dynamicRows];
    updatedDynamicRows[index][field] = value;
    setDynamicRows(updatedDynamicRows);
  };

  // Function to handle input field change for dynamic rows
  const handleDynamicInputChange = (index, value) => {
    const updatedDynamicRows = [...dynamicRows];
    updatedDynamicRows[index].activity = value;
    setDynamicRows(updatedDynamicRows);
  };

  // Function to add a new row with two dropdowns and an input field
  const addRow = () => {
    
    if (dynamicRows.length < 5) {
      const newRow = {
        id: dynamicRows.length, // Change this to use dynamic IDs
        clientName: "",
        timeSlot: "",
        activity: "",
      };
      const updatedDynamicRows = [...dynamicRows, newRow];
      setDynamicRows(updatedDynamicRows);
    }
  };
  // Function to update row data if all fields are filled
  const updateRowData = async (index, rowData) => {
    try {
      const currentDate = getDateFormatted();
      const { clientName, timeSlot, activity, _id, id } = rowData;
      const employeeId = employeeData?._id;

      // Validate input data
      if (!employeeId || !timeSlot || !activity) {
        throw new Error("Invalid input data");
      }

      // Perform an action with the updated data for the row
      let response;
      response = await apiurl.post(`/createTask`, {
        clientName,
        activity,
        timeSlot,
        employeeId,
        _id,
        date : currentDate,
        countId: id
      });

    setSuccessStatic(prevState => ({
          ...prevState,
          [index]: true
        }));
      // Handle the response if needed
      setClick(true);
      toast.success("activity updated successfully");
    } catch (error) {
      // Handle errors
      console.error("Error creating or updating task:", error.message);
      toast.error("something went wrong");
      // Optionally, rethrow the error to propagate it further
      throw error;
    }
  };

  const createExtraTask = async (index, dynamicRows) => {
    try {
      const { clientName, timeSlot, activity, _id, id} = dynamicRows;
      const currentDate = getDateFormatted();
      const employeeId = employeeData?._id;
      let response;
      if (employeeId) {
        response = await apiurl.post(`/createExtraTask`, {
          clientName,
          timeSlot,
          activity,
          employeeId,
          _id,
          date : currentDate,
          countId: id
        });

        setSuccessIcon(prevState => ({
          ...prevState,
          [index]: true
        }));
      }
      setClick(true);
      toast.success("extra activity updated successfully");
    } catch (error) {
      console.error("Error creating extra task:", error);
      toast.error("something went wrong");
      throw error; // Rethrow error to handle it in the caller
    
    }
  };

  useEffect(() => {
    getClientData();
    fetchActivities();
    setClick(false);
  }, [employeeData, click]);


  return (
   <div className=" overflow-scroll scrollbar-hide sm:overflow-hidden">

    <div className="md:px-16 px-6  pt-9 mb-20 ">
      <span className="flex justify-start mb-9 items-center text-white font-poppins font-medium  md:w-full w-[225%] text-center text-[23px] ">
        <span className="md:w-1/4 w-full sm:w-1/5 text-start">Time</span>
        <span className="md:w-1/4 w-full sm:w-1/5 md:text-start md:ml-0  text-center">Client</span>
        <span className="md:w-1/4 w-full sm:w-1/4 ">Activity</span>
        <span className="md:w-1/3  md:text-center text-start w-full sm:w-full ml-9 md:ml-0">Save</span>
      </span>
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex md:justify-center justify-start  md:w-full w-[225%] sm:w-[120%] items-center  text-white mb-3"
        >
          <span className="md:w-1/4 w-full sm:w-full">
            <p className=" font-poppins font-extralight z-50">{row.timeSlot}</p>
          </span>
          {row.id < 18 ? (
            <span className="md:w-1/4 w-full ml-3 md:ml-0 sm:w-full">
      
              <Autocomplete
                value={row.clientName}
                
                onChange={(event, newValue) => {
                  handleOptionChange(row.id, "clientName", newValue);
                  
                }}
                options={clients}
                renderInput={(params) => (
                  
                  <TextField
                    {...params}
                    // Apply focused styles on input focus
        className="glassn rounded-2xl text-white focus:outline-none"
                       
                  />
                )}
              />
            
            </span>
          ) : (
            <>
              <span className="md:w-1/4 w-full sm:w-full">
              <Autocomplete
      value={row.clientName}
      onChange={(event, newValue) => handleOptionChange(row.id, "clientName", newValue)}
      options={clients}
      
      renderInput={(params) => (
        <TextField
          {...params}
          label="Client"
          fullWidth
        
          // Combine custom and MUI classes
          className="gradient rounded-2xl text-white focus:outline-none"
        />
      )}
    />
              </span>
            
            </>
          )}
          <span className="md:w-1/3 md:ml-20 ml-9 sm:ml-16 w-full sm:w-full ">
            <input
              type="text"
              value={row.activity}
              onChange={(e) => handleInputChange(row.id, e.target.value)}
          

              className="w-full py-4 rounded-xl px-2 bg-transparent border border-gray-300 focus:outline-none focus:border-primary text-white"
            />
          </span>
          <span onClick={() => updateRowData(row.id, row)} className="text-primary text-4xl cursor-pointer md:w-1/5 md:ml-36 ml-16  sm:ml-16 w-full">
  {successStatic[row.id] ? <FaCircleCheck /> : <FaCirclePlus />}
</span>
        </div>
      ))}
      {dynamicRows.map((row, index) => (
        <div
          key={index}
          className="flex justify-center items-center md:w-full sm:w-[120%]  w-[222%] text-white mb-3"
        >
          <span className="md:w-1/4 w-full mr-5 md:mr-0 sm:w-[35%]">
            <select
              value={row.timeSlot}
              onChange={(e) =>
                handleDynamicOptionChange(index, "timeSlot", e.target.value)
              }
              // onBlur={() => createExtraTask(row.id, row)}
              className="md:w-full   py-4 px-2  gradient rounded-xl text-white focus:outline-none focus:border-primary mb-4"
            >
              {extraSlots?.map((item, index) => (
                <option className="text-black" value={item}>
                  {item}
                </option>
              ))}
            </select>
          </span>
          <span className=" md:w-1/3 w-full sm:w-full sm:ml-5">
          <div className="  md:w-3/4    ">
            <Autocomplete
              value={row.clientName}
              onChange={(event, newValue) => {
                handleDynamicOptionChange(index, "clientName", newValue);
              }}
              options={clients}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Client"
                  className="glassn rounded-3xl text-white focus:outline-none "
              
                />
              )}
            />
            </div>
          </span>

          <span className="md:w-1/3 md:ml-0 ml-9 w-full sm:ml-12   ">
            <input
              type="text"
              value={row.activity}
              onChange={(e) => handleDynamicInputChange(index, e.target.value)}
            
              className="w-full md:w-full sm:w-full py-4 rounded-xl px-2 bg-transparent border border-gray-300 focus:outline-none focus:border-primary text-white"
            />
          </span>
          <span onClick={() => createExtraTask(row.id, row)} className="text-primary text-4xl cursor-pointer md:w-1/5 md:ml-36 ml-16  sm:ml-16 w-full">    {successIcon[row.id] ? <FaCircleCheck /> : <FaCirclePlus />}</span>
        </div>
      ))}
      {dynamicRows.length < 5 && (
        <span
          onClick={addRow}
          className="mt-4 text-[15px] px-6 py-3 z-50 cursor-pointer bg-black text-primary rounded-md hover:bg-primary border-gradient  focus:outline-none hover:text-black "
        >
          + Add Row
        </span>
      )}
    </div>
    </div>
  );
};

export default Card;