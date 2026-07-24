import React, { useEffect, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { getAboutUser } from "../../config/redux/action/authAction";
import { BASE_URL, clientServer } from "../../config/config.js";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "../../config/redux/action/postAction";
// import { profile } from "node:console";

export default function profilePage() {
  const authState = useSelector((state) => state.auth);

  const postState = useSelector((state) => state.posts);
  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);

  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getAllPosts());
    }
  }, []);

  useEffect(() => {
    if (authState.user) {
      setUserProfile(authState.user);
      const posts = (postState?.posts || []).filter((post) => {
        return post?.userId?.username === authState.user?.userId?.username;
      });
      setUserPosts(posts);
    }
  }, [authState.user, postState?.posts]);

  const updateProfilePicture = async (file) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("token", token);

      console.log("Updating profile picture...", file);
      const response = await clientServer.post(
        "/upload_profile_picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Profile picture updated!", response.data);

      dispatch(getAboutUser({ token }));
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  const updateProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("Updating user profile...");
      if (userProfile?.userId?.name) {
        await clientServer.post("/user_update", {
          token: token,
          name: userProfile.userId.name,
        });
      }

      console.log("Updating profile data...");
      await clientServer.post("/update_profile_data", {
        token: token,
        bio: userProfile?.bio || "",
        currentPost: userProfile?.currentPost || "",
        pastWork: userProfile?.pastWork || [],
        education: userProfile?.education || [],
      });

      console.log("Profile updated successfully!");
      dispatch(getAboutUser({ token: token }));
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState?.user?.userId && (
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <label
                htmlFor="profilePictureUpload"
                className={styles.backDrop_overlay}
              >
                <p>Edit</p>
              </label>
              <input
                onChange={(e) => {
                  updateProfilePicture(e.target.files[0]);
                }}
                hidden
                type="file"
                id="profilePictureUpload"
              />
              <img
                className={styles.userProfile}
                width={100}
                src={
                  authState?.user?.userId?.profilePicture
                    ? `${BASE_URL}/uploads/${authState.user.userId.profilePicture}`
                    : "/profile.png"
                }
                alt="profile"
              />
            </div>

            <div className={styles.profileContainer__details}>
              <div
                style={{
                  display: "flex",
                  gap: "0.7rem",
                }}
              >
                <div style={{ flex: "0.8" }}>
                  <div
                    style={{
                      display: "flex",
                      width: "fit-content",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {/* <h2>{authState?.user?.userId?.name}</h2> */}
                    <input
                      className={styles.nameEdit}
                      type="text"
                      value={userProfile?.userId?.name || ""}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile?.userId,
                            name: e.target.value,
                          },
                        });
                      }}
                    />
                    <p style={{ color: "grey" }}>
                      @{authState?.user?.userId?.username}
                    </p>
                  </div>

                  {/* <p>{authState?.user?.bio}</p> */}

                  <div>
                    <textarea
                      className={styles.bio}
                      value={userProfile?.bio || ""}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          bio: e.target.value,
                        });
                      }}
                      rows={Math.max(
                        3,
                        Math.ceil((userProfile?.bio?.length || 0) / 80),
                      )} // Adusted as needed
                      style={{ width: "100%" }}
                    ></textarea>
                  </div>
                </div>

                <div style={{ flex: "0.2" }}>
                  <h3>Recent Activity</h3>
                  {userPosts.length > 0 ? (
                    <div>
                      {userPosts.map((post, index) => (
                        <div key={index} style={{ marginBottom: "1rem" }}>
                          <p>{post?.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No posts yet</p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.workHistory}>
              <h4>Work History </h4>
              <div className={styles.workHistoryContainer}>
                {(authState?.user?.pastWork || []).map((work, index) => {
                  return (
                    <div key={index} className={styles.workHistoryCard}>
                      <p
                        style={{
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.8rem",
                        }}
                      >
                        {work?.company} - {work?.position}
                      </p>
                      <p>{work?.years}</p>
                    </div>
                  );
                })}

                <button
                  className={styles.addWorkButton}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                >
                  Add Work
                </button>
              </div>
            </div>
            {userProfile != authState.user && (
              <div
                onClick={() => {
                  updateProfileData();
                }}
                className={styles.updateBtn}
              >
                Update Profile
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <div
            onClick={() => {
              setIsModalOpen(false);
            }}
            className={styles.commentsContainer}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={styles.allCommentsContainer}
            >
              <input
                onChange={handleWorkInputChange}
                name="company"
                className={styles.inputField}
                type="text"
                placeholder="Enter Company"
                required
              />
              <input
                onChange={handleWorkInputChange}
                name="position"
                className={styles.inputField}
                type="text"
                placeholder="Enter Position"
                required
              />
              <input
                onChange={handleWorkInputChange}
                name="years"
                className={styles.inputField}
                type="number"
                placeholder="Years"
                required
              />
              <div
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    pastWork: [...userProfile.pastWork, inputData],
                  });
                  setIsModalOpen(false);
                }}
                className={styles.updateBtn}
              >
                Add Work
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
