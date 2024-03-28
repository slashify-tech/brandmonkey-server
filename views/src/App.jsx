import React from "react";
import MyClient from "./Admin/ClientPage/MyClient.jsx";
import "react-toastify/dist/ReactToastify.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminHome from "./Admin/DashBordPage/AdminHome.jsx";
import MyEmployee from "./Admin/MyEmployee/MyEmployee.jsx";
import AllEmployes from "./Admin/Backpannel/AllEmployes/AllEmploye.jsx";
import AllServices from "./Admin/Backpannel/AllServices/AllServices.jsx";
import CreateClient from "./Admin/Backpannel/ClientForm/CreateClient.jsx";
import AddEmployee from "./Admin/Backpannel/Employeeform/AddEmployee.jsx";
import RaisedComplain from "./employee/raised complain/RaisedComplain.jsx";
import Resolve from "./employee/Resolved/Resolve.jsx";
import ProgressClient from "./employee/ProgressClient/ProgressClient.jsx";
import ClientDetails from "./Admin/clientDetail/EmployeeDetails/ClientDetail.jsx";
import EmployeeDetails from "./Admin/EmployeeDetails/EmpDetail.jsx";
import ErrorPage from "./Error.jsx";
import ResolvedComplaint from "./Admin/AdminSolve/ResolvedComplaint.jsx";
import Sheet from "./Admin/EmployeeDetails/Sheet.jsx";
import AllClient from "./Admin/Backpannel/AllClient/AllClient.jsx";
import EmployeeHome from "./employee/empDashboard/EmployeeHome.jsx";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./context/loginContext.jsx";
import TicketRaiseForm from "./employee/TicketRaiseForm.jsx";
import Login from "./Login.jsx";
import TicketForm from "./Admin/clientDetail/EmployeeDetails/TicketForm.jsx";
import Mom from "./Admin/clientDetail/EmployeeDetails/Mom.jsx";
import EclientAllotForm from "./Admin/Backpannel/AllEmployes/EclinetAllotForm.jsx";
import ReviewForm from "./Admin/EmployeeDetails/ReviewForm.jsx";
import UpdateTask from "./employee/TaskUpdate/UpdateTask.jsx";
import ReviewData from "./Admin/EmployeeDetails/ReviewData.jsx";



const AdminRoutes = () => {
  
  return (
    <Routes>
  
      <Route path="/dashboard" element={<AdminHome />} />
      <Route path="/myclient" element={<MyClient />} />
      <Route path="/myemployee" element={<MyEmployee />} />
      <Route path="/reviewform/:id" element={<ReviewForm />} />
      <Route path="/view-review/:employeeId/:reviewParentId/:reviewId" element={<ReviewData />} />
      <Route path="/allclients" element={<AllClient />} />
      <Route path="/allemployee" element={<AllEmployes />} />
      <Route path="/allserve" element={<AllServices />} />
      <Route path="/employee-detail/:id" element={<EmployeeDetails />} />
      <Route path="/employee-sheet/:id" element={<Sheet />} />
      <Route path="/client-detail/:clientId" element={<ClientDetails />} />
      <Route path="/addclient" element={<CreateClient edit={false} />} />
      <Route path="/addemployee" element={<AddEmployee edit={false} />} />
      <Route path="/resolved-complaint" element={<ResolvedComplaint />} />
      <Route path="/uploadData" element={<TicketRaiseForm />} />
      <Route path="/create-mom/:id" element={<Mom />} />
      <Route path="/raise-ticket/:id" element={<TicketForm />} />
      <Route path="/client-allot/:id" element={<EclientAllotForm />} />
      <Route path="/reviewform/:id" element={<ReviewForm />} />
      <Route
        path="/edit-client-form/:id"
        element={<CreateClient edit={true} />}
      />
      <Route
        path="/edit-employee-form/:id"
        element={<AddEmployee edit={true} />}
      />
      <Route path="*" element={<ErrorPage />} />

      {/* employeee */}
    </Routes>
  );
};


// remeber if issue arises just uncomment the Comment part in the App function and comment the below part



function App() {
    const isAdmin = localStorage.getItem("isAdmin");
    return (
      <div className="w-full overflow-hidden ">
        <div className="w-[20%]">
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
          />
        </div>
        <Routes>
          <Route path="/" element={<Login />} />
        
          <Route path="admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<FrontendRoutes />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    );
  }
//   const isAdmin = localStorage.getItem("isAdmin");
//   return (
//     <div className="w-full overflow-hidden ">
   
//       <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
//       <Routes>
//       <Route path="/" element={<Login />} />
//         {isAdmin === "superadmin" ? (
//           <Route
//             path="admin/*"
//             element={
//               localStorage.getItem("isAuthenticated") ? (
//                 <AdminRoutes />
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />
//         ) : (
//           ""
//         )}

//         <Route path="/*" element={<FrontendRoutes />} />
//         <Route path="*" element={<ErrorPage />} />
//       </Routes>
//     </div>
//   );
// }




function FrontendRoutes() {
  const { employeeData } = useAuth();
  const isAdmin = localStorage.getItem("isAdmin");
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return (
    <>
      <div className="absolute">
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
        />
      </div>
      {!isAuthenticated && <Navigate to="/" />}

      <Routes>
        <>
          <Route
            path="/raised-complaint"
            element={<RaisedComplain work={false} />}
          />
          <Route path="/resolved" element={<Resolve />} />
          <Route path="/home" element={<EmployeeHome />} />
          <Route path="/updatetask" element={<UpdateTask />} />

          <Route
            path="/raised-complaint"
            element={<RaisedComplain work={true} />}
          />
        </>
        <Route path="/clients" element={<ProgressClient />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
