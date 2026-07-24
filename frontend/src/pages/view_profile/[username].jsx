import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL, clientServer } from "../../config/config.js";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { getAllPosts } from "../../config/redux/action/postAction";
import {
  sendConnectionRequest,
  getMyConnectionsRequests,
  whatAreMyConnectionRequests,
} from "../../config/redux/action/authAction";
import styles from "./index.module.css";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  const postState = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    if (mounted) {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Fetching connections with token:", token);
        await dispatch(getMyConnectionsRequests({ token }));
        await dispatch(whatAreMyConnectionRequests({ token }));
      }
    }
  };

  useEffect(() => {
    if (mounted) {
      getUsersPost();
    }
  }, [mounted]);

  useEffect(() => {
    if (postState?.posts && userProfile?.userId?.username) {
      const posts = postState.posts.filter(
        (post) => post.userId?.username === userProfile.userId.username,
      );
      setUserPosts(posts);
    }
  }, [postState?.posts, userProfile]);

  useEffect(() => {
    console.log("From View: View Profile");
    console.log("Received userProfile:", userProfile);
    console.log("Auth state connectionRequest:", authState.connectionRequest);
    console.log("Auth state pendingRequests:", authState.pendingRequests);
    console.log(
      "Auth state connectionRequest length:",
      authState.connectionRequest?.length,
    );

    if (userProfile?.userId?._id) {
      console.log("Checking connections for user:", userProfile.userId._id);

      // Check both connectionRequest and pendingRequests for existing connections
      const allConnections = [
        ...(authState.connectionRequest || []),
        ...(authState.pendingRequests || []),
      ];

      // Check if connection is already connected (accepted)
      const isConnected = allConnections.some((conn) => {
        const checkId = conn.connectionId?._id || conn.userId?._id;
        return (
          checkId &&
          String(checkId) === String(userProfile.userId._id) &&
          conn.status_accepted === true
        );
      });

      // Check if connection is pending
      const isPending = allConnections.some((conn) => {
        const checkId = conn.connectionId?._id || conn.userId?._id;
        return (
          checkId &&
          String(checkId) === String(userProfile.userId._id) &&
          conn.status_accepted === null
        );
      });

      console.log("isConnected:", isConnected);
      console.log("isPending:", isPending);
      setIsCurrentUserInConnection(isConnected);
      setIsConnectionNull(isPending);
    }
  }, [authState.connectionRequest, authState.pendingRequests, userProfile]);

  const handleSendConnection = async () => {
    console.log("handleSendConnection CALLED!");
    if (mounted) {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);
      console.log("userProfile.userId._id:", userProfile?.userId?._id);
      console.log("userProfile.userId:", userProfile?.userId);
      if (token && userProfile?.userId?._id) {
        console.log("Dispatching sendConnectionRequest!");
        const result = await dispatch(
          sendConnectionRequest({
            token: token,
            targetUserId: userProfile.userId._id,
          }),
        );
        console.log("sendConnectionRequest result:", result);
        await dispatch(getMyConnectionsRequests({ token: token }));
      } else {
        console.log("Missing token or userProfile.userId._id!");
      }
    }
  };

  if (!mounted || !userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <p>Loading...</p>
            </div>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={
                userProfile?.userId?.profilePicture
                  ? `${BASE_URL}/uploads/${userProfile.userId.profilePicture}`
                  : "/profile.png"
              }
              alt="backdrop"
            />
          </div>

          <div className={styles.profileContainer__details}>
            <div
              className={styles.profileContainer__flex}
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
                  <h2>{userProfile?.userId?.name || "User"}</h2>
                  <p style={{ color: "grey" }}>
                    @{userProfile?.userId?.username || "user"}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  {isCurrentUserInConnection || isConnectionNull ? (
                    <button
                      className={
                        isConnectionNull
                          ? styles.pendingButton
                          : styles.connectedButton
                      }
                    >
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={handleSendConnection}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={async () => {
                      if (mounted) {
                        try {
                          console.log(
                            "Download button clicked, user ID:",
                            userProfile.userId._id,
                          );
                          const response = await clientServer.get(
                            `/user/download_resume?id=${userProfile.userId._id}`,
                          );
                          console.log("Download response:", response.data);
                          const pdfUrl = `${BASE_URL}/uploads/${response.data.message}`;
                          console.log("Opening PDF URL:", pdfUrl);
                          window.open(pdfUrl, "_blank");
                        } catch (error) {
                          console.error("Download error:", error);
                          alert(
                            "Error downloading PDF: " +
                              (error.response?.data?.message || error.message),
                          );
                        }
                      }
                    }}
                    className={styles.downloadButton}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <p>{userProfile?.bio || ""}</p>
              </div>

              <div style={{ flex: "0.2" }}>
                <h3>Recent Activity</h3>

                {(userPosts?.length || 0) === 0 ? (
                  <p>No posts yet</p>
                ) : (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post?.media ? (
                            <img
                              src={`${BASE_URL}/uploads/${post.media}`}
                              alt="post"
                            />
                          ) : null}
                          <p>{post?.body || ""}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className={styles.workHistory}>
            <h4>Work History </h4>
            <div className={styles.workHistoryContainer}>
              {(userProfile?.pastWork || []).map((work, index) => {
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
                      {work?.company || "Company"} -{" "}
                      {work?.position || "Position"}
                    </p>
                    <p>{work?.years || "Years"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const request = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: {
          username: context.query.username,
        },
      },
    );

    return {
      props: {
        userProfile: request.data.profile,
      },
    };
  } catch (err) {
    return {
      props: {
        userProfile: null,
      },
    };
  }
}
