import UserLayout from "../../layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import {
  registerUser,
  loginUser,
  getAboutUser,
} from "../../config/redux/action/authAction";
import { emptyMessage } from "../../config/redux/reducer/authReducer";

export default function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      if (typeof window !== "undefined" && localStorage.getItem("token")) {
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      }
      router.push("/dashboard");
    }
  }, [authState.loggedIn, dispatch]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, []);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [isLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log("logging in...");
      dispatch(loginUser({ email, password }));
    } else {
      console.log("registering...");
      dispatch(registerUser({ username, password, email, name }));
    }
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer__left}>
            <h1 className={styles.cardleft__heading}>
              {isLogin ? "Sign In" : "Sign Up"}
            </h1>
            <p className={`${styles.messageText} ${authState.isError ? styles.error : styles.success}`}>
              {typeof authState.message === "string"
                ? authState.message
                : authState.message?.message || ""}
            </p>
            <form onSubmit={handleSubmit} className={styles.inputContainer}>
              {!isLogin && (
                <div className={styles.inputRow}>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.inputField}
                    type="text"
                    placeholder="Username"
                    required
                  />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputField}
                    type="text"
                    placeholder="Full Name"
                    required
                  />
                </div>
              )}
              <input
                value={email}
                onChange={(e) => setEmailAddress(e.target.value)}
                className={styles.inputField}
                type="email"
                placeholder="Email Address"
                required
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                type="password"
                placeholder="Password"
                required
              />
              <button type="submit" className={styles.buttonPrimary}>
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>

          <div className={styles.cardContainer__right}>
            <h2 className={styles.rightHeading}>
              {isLogin ? "New Here?" : "Welcome Back!"}
            </h2>
            <p className={styles.rightDescription}>
              {isLogin
                ? "Create an account to start connecting with professionals"
                : "Sign in to continue your professional journey"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={styles.buttonSecondary}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
