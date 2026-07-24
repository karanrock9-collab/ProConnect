import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavBarComponent from "../../Components/Navbar";
import { getAboutUser } from "../../config/redux/action/authAction";

function UserLayout({ children }) {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("UserLayout useEffect ran");
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("UserLayout token:", token);
      console.log("UserLayout authState.profileFetched:", authState.profileFetched);
      if (token && !authState.profileFetched) {
        console.log("UserLayout dispatching getAboutUser");
        dispatch(getAboutUser({ token }));
      }
    }
  }, [dispatch, authState.profileFetched]);

  return (
    <div>
      <NavBarComponent />
      {children}
    </div>
  );
}

export default UserLayout;
