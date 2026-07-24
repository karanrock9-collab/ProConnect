import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "../../config/redux/reducer/authReducer";

export default function NavBarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && localStorage.getItem("token");

  if (!mounted) {
    return (
      <div>
        <div className={styles.container}>
          <nav className={styles.navBar}>
            <h1>Pro Connect</h1>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.container}>
        <nav className={styles.navBar}>
          <h1
            onClick={() => {
              router.push("/");
            }}
          >
            Pro Connect
          </h1>

          <div className={styles.navBarOptionContainer}>
            {authState.profileFetched && authState.user ? (
              <div
                style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}
              >
                <p>Hey, {authState.user.userId?.name || "User"}</p>
                <p
                  style={{ fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => {
                    router.push("/profile");
                  }}
                >
                  Profile
                </p>
                <p
                  style={{ fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => {
                    localStorage.removeItem("token");
                    dispatch(reset());
                    router.push("/login");
                  }}
                >
                  Logout
                </p>
              </div>
            ) : isLoggedIn ? (
              <div>
                <p>Loading user...</p>
              </div>
            ) : (
              <div
                onClick={() => {
                  router.push("/login");
                }}
                className={styles.buttonJoin}
              >
                <p>Be a part</p>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
