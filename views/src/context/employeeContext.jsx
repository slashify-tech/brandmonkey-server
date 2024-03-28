import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiurl from "../util";
import { toast } from "react-toastify";
import setupInterceptors from "../Interceptors";
import { useAuth } from "./loginContext";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const navigate = useNavigate();
  const { tokenId } = useAuth();
  const isAdmin = localStorage.getItem("isAdmin");
  const [allClients, setAllClients] = useState();
  const [allEmployees, setAllEmployees] = useState();
  const [services, setServices] = useState([]);
  const [oneTimeData, setOneTimeData] = useState([]);
  const [regularData, setRegularData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const limit = 12;
  const [dashboardAdminData, setDashboardAdminData] = useState({
    totalClients: 0,
    totaltickets: 0,
    totalEmployees: 0,
  });
  const [dashboardEmployeeData, setDashboardEmployeeData] = useState({
    totalClients: 0,
    totalTickets: 0,
    totalWorkProgress: 0,
    totalTicketsResolved : 0
  });

  const addEmployee = async (empFormData, edit, id) => {
    if (tokenId) {
      const {
        employeeId,
        team,
        name,
        designation,
        phoneNumber,
        service,
        email,
        password,
        ImageFile,
        image
      } = empFormData;
      const services = service.join(",");
      const config = {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: Bearer `${tokenId}`,
        },
      };
      try {
        if (edit) {
          await apiurl.put(`/editEmployee/${id}`, {
            employeeId,
            team,
            image,
            name,
            designation,
            phoneNumber,
            services,
            email,
            password,
            ImageFile
          }, config);
        } else {
          await apiurl.post(`/addEmployee`, {
            employeeId,
            team,
            image,
            name,
            designation,
            phoneNumber,
            services,
            email,
            password,
            ImageFile
          }, config);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const getEmployee = async (options = {}, setAllPageData, page) => {
    if (tokenId) {
      setupInterceptors(tokenId);
      try {
        let url = `/getEmployees?page=${page}&limit=${limit}`;
        if (options.search) {
          url += `&search=${options.search}`;
        }
        const response = await apiurl.get(url);
        setAllEmployees(response.data.result.data);
        if (page) {
          setAllPageData({
            currentPage: response.data.currentPage,
            hasLastPage: response.data.hasLastPage,
            hasPreviousPage: response.data.hasPreviousPage,
            nextPage: response.data.nextPage,
            previousPage: response.data.previousPage,
            lastPage: response.data.lastPage,
            totalEmployeesCount: response.data.totalEmployeesCount,
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getOneEmployee = async () => {};

  const getClientEmployeeDist = async (id) => {
    try {
      const response = await apiurl.get(`/getclientemployeedistribution/${id}`);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getAllResolvedRequest = async (id) => {
    try {
      let response;
      if (id) {
        response = await apiurl.get(`/getResolvedEmployeeTickets?id=${id}`);
      } else {
        response = await apiurl.get(`/getResolvedEmployeeTickets`);
      }
      setResolvedTickets(response.data.tickets);
    } catch (err) {
      console.log(err);
    }
  };

  const addClient = async (clientForm) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        const response = await apiurl.post(`/addClient`, { ...clientForm });
        console.log(response.data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const editClient = async (id, clientForm) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        const response = await apiurl.post(`/editClient/${id}`, {
          ...clientForm,
        });
        console.log(response.data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const fetchReviews = async (id) => {
    try {
      const response = await apiurl.get(`/employeeReviews/${id}`);
      setReviews(response.data?.data);
      console.log(response.data?.data);
    } catch (error) {
      console.error("Error fetching employee reviews:", error);
    }
  };

  const addCLientAssign = async (id, serviceClient) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        const response = await apiurl.put(`/clientAllocation/${id}`, {
          ...serviceClient,
        });
        console.log(response.data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getClients = async (options = {}, setAllPageData, page, clientType) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        let url = `/getClients?page=${page}&limit=${limit}`;
        if (options.search) {
          url += `&search=${options.search}`;
        }
        if (clientType) {
          url += `&clientType=${clientType}`;
        }
        const response = await apiurl.get(url);
        setServices(
          response.data.result.data?.map((item) =>
            Object.keys(item).filter(
              (key) =>
                key !== "_id" &&
                key !== "name" &&
                key !== "clientType" &&
                key !== "address" &&
                key !== "gst" &&
                key !== "phone" &&
                key !== "email" &&
                key !== "Country" &&
                key !== "State" &&
                key !== "Address" &&
                key !== "GST" &&
                key !== "__v" &&
                key !== "ticketsCount"&&
                key !== "colorZone"&&
                key !== "clientLogo" &&
                key !== "logo"
            )
          )[0]
        );

        if (setAllPageData) {
          setAllPageData({
            currentPage: response.data.currentPage,
            hasLastPage: response.data.hasLastPage,
            hasPreviousPage: response.data.hasPreviousPage,
            nextPage: response.data.nextPage,
            previousPage: response.data.previousPage,
            lastPage: response.data.lastPage,
            totalClientsCount: response.data.totalClientsCount,
          });
        }

        setAllClients(response.data.result.data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const addServiceField = async (feildName) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        await apiurl.put("/addservicefield", { fieldName: feildName });
        toast.success("service added");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const deleteServiceField = async (feildName) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        await apiurl.put("/deleteservicefield", { fieldName: feildName });
        toast.success("service deleted");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const editServiceField = async (oldName, newName) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        await apiurl.put("/editservicefield", {
          oldFieldName: oldName,
          newFieldName: newName,
        });
        toast.success("service edited");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getOneClient = async (id, setClientName) => {
    try {
      const response = await apiurl.get(`/getOneClient/${id}`);
      setClientName(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const ticketRaiseDataWithClientsForAdmin = async (id) => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        await apiurl.put(`/clienttype/${id}`);
        getClients();
        toast.success("Client type changed successfully");
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
      }
    }
  };

  const getAdminDashBoard = async () => {
    try {
      const response = await apiurl.get(`/getDashboardAdmin`);
      setDashboardAdminData({
        totalClients: response.data.totalClients,
        totalReviews: response.data.totalReviews,
        TotalTickets: response.data.TotalTickets,
        totalEmployees: response.data.totalEmployees,
        TotalTicketSolved: response.data.TotalTicketSolved,
        totalGoodReviewsCount: response.data.totalGoodReviewsCount,
        totalBadReviewsCount: response.data.totalBadReviewsCount,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const getEmployeeDashBoard = async (id) => {
    try {
      const response = await apiurl.get(`/getDashboardEmployee/${id}`);
      setDashboardEmployeeData({
        totalClients: response.data.totalClients,
        totalTickets: response.data.totalTickets,
        totalWorkProgress: response.data.totalWorkProgress,
        totalTicketsResolved : response.data.totalTicketsResolved
      });
    } catch (err) {
      console.log(err);
    }
  };
  const handleExportCSV = async () => {
    try {
      const response = await apiurl.get(`/getEmployeesCSV`); // Replace with your actual server URL and port
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

  const handleExportCSVEntry = async () => {
    try {
      const response = await apiurl.get(`/getClientCSV`); // Replace with your actual server URL and port
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

  const getTicketAdmin = async () => {};

  const getOneTicket = async () => {};

  useEffect(() => {
    if (isAdmin === "admin" || isAdmin === "superadmin") {
      // employeeDataRegularForAdmin();
      getClients({});
      getEmployee({});
    }
  }, [tokenId]);
  return (
    <EmployeeContext.Provider
      value={{
        addEmployee,
        getEmployee,
        getOneEmployee,
        getClientEmployeeDist,
        addClient,
        editClient,
        addCLientAssign,
        getClients,
        getOneClient,
        getTicketAdmin,
        getOneTicket,
        allClients,
        addServiceField,
        deleteServiceField,
        editServiceField,
        services,
        getAdminDashBoard,
        getEmployeeDashBoard,
        allEmployees,
        dashboardAdminData,
        fetchReviews,
        reviews,
        setReviews,
        setAllEmployees,
        ticketRaiseDataWithClientsForAdmin,
        oneTimeData,
        regularData,
        dashboardEmployeeData,
        getAllResolvedRequest,
        resolvedTickets,
        handleExportCSV,
        handleExportCSVEntry,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  return useContext(EmployeeContext);
};
