import React, { useEffect } from "react";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  AcceptConnection,
  getMyConnectionsRequests,
  whatAreMyConnectionRequests,
} from "../../config/redux/action/authAction";
import { BASE_URL } from "../../config/config.js";
import styles from "./index.module.css";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMyConnectionsRequests({ token }));
      dispatch(whatAreMyConnectionRequests({ token }));
    }
  }, [dispatch]);

  // Debug: log everything
  useEffect(() => {
    console.log("Pending requests (received):", authState.pendingRequests);
    console.log("Connections (sent/accepted):", authState.connectionRequest);
  }, [authState.pendingRequests, authState.connectionRequest]);

  const handleAcceptConnection = (connectionId, token) => {
    dispatch(
      AcceptConnection({
        connectionId,
        token,
        action: "accept",
      }),
    ).then(() => {
      // Refresh both lists after accepting
      dispatch(getMyConnectionsRequests({ token }));
      dispatch(whatAreMyConnectionRequests({ token }));
    });
  };

  // For pending requests (received by user), user data is in userId
  // For connections, check both userId and connectionId
  const pendingRequests = (authState?.pendingRequests || []).filter(
    (req) => req?.status_accepted === null,
  );

  // Get all accepted connections from both sent and received
  const acceptedConnections = [
    ...(authState?.connectionRequest || []).filter(
      (req) => req?.status_accepted === true,
    ),
    ...(authState?.pendingRequests || []).filter(
      (req) => req?.status_accepted === true,
    ),
  ];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>My Connections</h1>

          {/* Pending Requests Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Pending Requests</h2>
            {pendingRequests.length === 0 ? (
              <p className={styles.emptyState}>
                No pending connection requests
              </p>
            ) : (
              <div className={styles.cardsContainer}>
                {pendingRequests.map((request, index) => {
                  console.log("Pending request object:", request);
                  // For pending requests (received by us), the other user is request.userId
                  const user = request.userId || {};
                  const profilePic = user.profilePicture || "default.jpg";
                  const userName = user.name || "Unknown User";
                  const userUsername = user.username || "unknown";

                  return (
                    <div key={request._id || index} className={styles.userCard}>
                      <div className={styles.userInfoContainer}>
                        <div className={styles.profilePicture}>
                          <img
                            src={`${BASE_URL}/uploads/${profilePic}`}
                            alt={userName}
                          />
                        </div>
                        <div className={styles.userDetails}>
                          <h3 className={styles.userName}>{userName}</h3>
                          <p className={styles.userUsername}>@{userUsername}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(
                            "Accepting request with ID:",
                            request._id,
                          );
                          handleAcceptConnection(
                            request._id,
                            localStorage.getItem("token"),
                          );
                        }}
                        className={styles.acceptButton}
                      >
                        Accept
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* My Network Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>My Network</h2>
            {acceptedConnections.length === 0 ? (
              <p className={styles.emptyState}>No connections yet</p>
            ) : (
              <div className={styles.cardsContainer}>
                {acceptedConnections.map((request, index) => {
                  // Check where the user data is (userId if we sent, connectionId if we received)
                  // Let's check which one is not our own user
                  let user = null;
                  if (authState.user && authState.user.userId) {
                    if (
                      request.userId &&
                      String(request.userId._id) !==
                        String(authState.user.userId._id)
                    ) {
                      user = request.userId;
                    } else if (request.connectionId) {
                      user = request.connectionId;
                    }
                  } else {
                    // Fallback if we don't have our own user data
                    user = request.userId || request.connectionId || {};
                  }
                  const profilePic = user.profilePicture || "default.jpg";
                  const userName = user.name || "Unknown User";
                  const userUsername = user.username || "unknown";

                  return (
                    <div
                      key={request._id || index}
                      onClick={() => {
                        router.push(`/view_profile/${userUsername}`);
                      }}
                      className={styles.userCard}
                    >
                      <div className={styles.userInfoContainer}>
                        <div className={styles.profilePicture}>
                          <img
                            src={`${BASE_URL}/uploads/${profilePic}`}
                            alt={userName}
                          />
                        </div>
                        <div className={styles.userDetails}>
                          <h3 className={styles.userName}>{userName}</h3>
                          <p className={styles.userUsername}>@{userUsername}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
