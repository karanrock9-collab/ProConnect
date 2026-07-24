import React, { useEffect } from "react";
import { getAllPosts } from "../../config/redux/action/postAction";
import { getAllUsers } from "../../config/redux/action/authAction";
import DashboardLayout from "../../layout/DashboardLayout";
import UserLayout from "../../layout/UserLayout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "../../config/config.js";

export default function Discoverpage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(
      "Discover page - authState.all_profiles_fetched:",
      authState.all_profiles_fetched,
    );
    console.log("Discover page - authState.all_users:", authState.all_users);
    if (!authState.all_profiles_fetched) dispatch(getAllUsers());
  }, [authState.all_profiles_fetched, authState.all_users]);

  const router = useRouter();

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.discoverContainer}>
          <h1 className={styles.title}>Discover</h1>
          {!authState.all_profiles_fetched ? (
            <div>Loading profiles...</div>
          ) : (
            <div className={styles.profilesGrid}>
              {(authState?.all_users?.length || 0) > 0 ? (
                (authState?.all_users || []).map((profile, index) => (
                  <div
                    onClick={() => {
                      console.log("Profile card clicked!", profile);
                      const username = profile?.userId?.username;
                      console.log("Username found:", username);
                      if (!username) {
                        console.error("Username not found in profile");
                        return;
                      }
                      const path = `/view_profile/${username}`;
                      console.log("Navigating to:", path);
                      router.push(path).catch((err) => {
                        console.error("Error navigating:", err);
                      });
                    }}
                    key={profile?._id || index}
                    className={styles.profileCard}
                  >
                    <img
                      src={`${BASE_URL}/uploads/${profile?.userId?.profilePicture || "default.jpg"}`}
                      alt={profile?.userId?.name || "User"}
                      className={styles.profileImage}
                    />
                    <h3 className={styles.profileName}>
                      {profile?.userId?.name || "Unknown User"}
                    </h3>
                    <p className={styles.profileUsername}>
                      @{profile?.userId?.username || "user"}
                    </p>
                  </div>
                ))
              ) : (
                <div>No profiles found</div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
