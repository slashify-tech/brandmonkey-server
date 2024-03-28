import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { Link, useParams } from "react-router-dom";
import apiurl from "../../../util";


// ColorSelector component
const ColorSelector = ({ selectedColor, onColorChange, color }) => {
  const isSelected = selectedColor === color.value;
  return (
    <div className="flex items-center space-x-4 mb-2 mt-2 ">
      <div
       className={`w-9 h-9 rounded-full cursor-pointer overflow-hidden ${
        isSelected ? "momborder border-white" : ""
      }`}
      style={{
        background: color.value,
        transform: isSelected ? "scale(1.1)" : "scale(1)",
        transition: "transform 0.2s ease-in-out",
      }}
      onClick={() => onColorChange(color.value)}/>
    </div>
  );
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}
const Mom = () => {
  const [isPopupOpen, setPopupOpen] = useState(true);
  const [topics, setTopics] = useState("");
  const [complain, setComplain] = useState("");
  const [client, setClients] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff"); // Default selected color
  const { id } = useParams();
  const colors = [
    { value: "#ff0303", label: "Red" },
    { value: "#ff7f0e", label: "Orange" },
    { value: "#2ca02c", label: "Green" },
  ];

  console.log(topics, complain, feedback, selectedColor);

  const createMom = async () => {
    try {
      if (!topics || !complain || !feedback) {
        toast.error("Please provide all fields");
        return;
      }
      const response = await apiurl.post(`/addmom/${id}`, {
        topicDiscuss: topics,
        complain,
        feedback,
        color: selectedColor,
        attendees: attendees.join(', '),
      });

      // console.log(response.data);
      // console.log("submitted");
      toast.success("MOM added successfully");
    } catch (err) {
      // console.log(err);
      toast.error("Something went wrong");
    }
  };

  
  const getClientData = async () => {
    try {
      const response = await apiurl.get(`/getclientName`);
      setClients(response.data?.employee?.map((item => item.name)));
    } catch (err) {
      console.log(err);
    }
  };
 


  const closePopup = () => {
    setPopupOpen(false);
  };
  // Function to handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
  };
  const theme = useTheme();
  const [attendees, setAttendees] = useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setAttendees(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };
console.log(client);
  useEffect(() => {
    getClientData();
  }, []);
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#333333] z-50 shadow font-poppins overflow-y-scroll pt-32 px-6 ${
        isPopupOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-black p-4 mx-3 md:mt-36 mt-20 md:p-7 rounded-lg md:w-[50%] w-full relative shadow text-white">
        <Link
          to={`/admin/client-detail/${id}`}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 cursor-pointer"
          onClick={closePopup}
        >
          <IoClose size={30} color="white" />
        </Link>

        <div className="mt-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-center">Create MOM</h1>
        </div>

        {/* Color Selector */}
        <form className="mt-4 md:ml-10">
          <p className="font-normal">Client zone:</p>
          <div className="flex justify-first gap-3 items-center mb-4">
            {colors.map((color, index) => (
              <ColorSelector
                key={index}
                selectedColor={selectedColor}
                onColorChange={handleColorChange}
                color={color}
              />
            ))}
          </div>

          <p className="mt-3 font-normal">Topics Discuss * </p>
          <textarea
            className="md:w-[90%] w-[96%] h-[15vh] mt-2 p-2 rounded-lg text-black"
            type="textarea"
            value={topics}
            required={true}
            name="topics"
            onChange={(e) => setTopics(e.target.value)}
          />
<p className="mt-3 font-normal">Attendees* </p>
<div className="bg-white w-[96%] rounded-lg mt-2 py-2">
<FormControl sx={{ m: 1, width:570 }}>
        <Select
          multiple
          displayEmpty
          value={attendees}
          onChange={handleChange}
          input={<OutlinedInput />}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <em>Placeholder</em>;
            }

            return selected.join(', ');
          }}
          MenuProps={MenuProps}
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem disabled value="">
            <em>Placeholder</em>
          </MenuItem>
          {client?.map((item, index) => (
            <MenuItem
              key={index}
              value={item}
              style={getStyles(item, attendees, theme)}
            >
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

</div>
          <p className="mt-3 font-normal">Complain</p>
          <textarea
            className="md:w-[90%] w-[96%] h-[15vh] mt-2 p-2 rounded-lg text-black"
            type="text"
            required={true}
            value={complain}
            name="complain"
            onChange={(e) => setComplain(e.target.value)}
          />

          <p className="mt-3 font-normal">Feedback </p>
          <textarea
            className="md:w-[90%] w-[96%] h-[15vh] mt-2 p-2 rounded-lg text-black"
            type="text"
            value={feedback}
            required={true}
            name="feedback"
            onChange={(e) => setFeedback(e.target.value)}
          />

          <div className="flex justify-center items-center">
            <Link to={`/admin/client-detail/${id}`}>
              <div
                className="px-5 py-2 text-[#F5CD15] bg-black rounded-lg BR mt-5 cursor-pointer hover:bg-primary hover:text-black"
                onClick={() => {
                  createMom();
                  closePopup();
                }}
              >
                Submit
              </div>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mom;
