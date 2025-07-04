import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import PrivateHome from "./pages/PrivateHome.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DescriptionSubcompactCar from "./pages/DescriptionSubcompactCar.jsx";
import DescriptionMediumCar from "./pages/DescriptionMediumCar.jsx";
import DescriptionPremiumCar from "./pages/DescriptionPremiumCar.jsx";
import MakeReservation from "./pages/MakeReservation.jsx"
import Booking from "./pages/Booking.jsx"
import MyReservations from './views/MyReservations.jsx';


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "PrivateHome",
        element: <PrivateHome />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "subcompact/:lp",
        element: <DescriptionSubcompactCar />,
      },
      {
        path: "medium/:lp",
        element: <DescriptionMediumCar />,
      },
      {
        path: "premium/:lp",
        element: <DescriptionPremiumCar />,
      },
      {
        path: "place-reservation",
        element: <MakeReservation />
      },
      {
        path: "bookinglist",
        element: <Booking />
      },
      {
        path: "my-reservations",
        element: <MyReservations />
      }
    ],
  },
]);