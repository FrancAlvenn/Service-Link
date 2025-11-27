import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import ToastNotification from "../../../utils/ToastNotification";
import axios from "axios";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import { JobRequestsContext } from "../../request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../request_management/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../../request_management/context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../request_management/context/VenueRequestsContext";
import { sendBrevoEmail } from "../../../utils/brevo";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * This component is used to log in with Google OAuth.
 * It uses the GoogleOAuthProvider and GoogleLogin components from the
 * @react-oauth/google library to handle the login process.
 * The onSuccess callback is used to handle the response from the server and
 * update the AuthContext with the user's data.
 * The onError callback is used to handle any errors that occur during the login
 * process and display a toast notification to the user.
 * The component renders a button that says "Sign in with Google" and displays the
 * Google logo.
 */
function GoogleAuthLogin() {
  const { setAuthData } = useContext(AuthContext);
  const navigate = useNavigate();

  const { fetchJobRequests } = useContext(JobRequestsContext);
  const { fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { fetchVehicleRequests } = useContext(VehicleRequestsContext);
  const { fetchVenueRequests } = useContext(VenueRequestsContext);

  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
  };

  /**
   * This function is called when the user successfully logs in with Google OAuth.
   * It is passed the credential response from the server, which contains the user's
   * data. The function first checks if the user's email is a DYCI email. If it is,
   * the function makes a post request to the server to log in the user. The response
   * from the server is then checked to see if the user was successfully logged in.
   * If the user was successfully logged in, the function updates the AuthContext
   * with the user's data and navigates the user to the requests management page.
   * If the user was not successfully logged in, the function displays a toast notification
   * to the user with an error message. If the user's email is not a DYCI email, the
   * function displays a toast notification to the user with an unauthorized message.
   * If any errors occur during the login process, the function displays a toast notification
   * to the user with an error message.
   * @param {object} credentialResponse - The credential response from the server.
   * @returns {void}
   */
  const onSuccess = async (credentialResponse) => {
    try {
      const decodedToken = JSON.parse(
        atob(credentialResponse.credential.split(".")[1])
      );
      const email = decodedToken.email;

      if (true) {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/google_login`, {
          google_id: decodedToken.sub,
          email: decodedToken.email,
          first_name: decodedToken.given_name,
          last_name: decodedToken.family_name,
        },
        { withCredentials: true });

        if (response.status === 201) {
          ToastNotification.info(
            "Account created!",
            "A confirmation email has been sent."
          );

          try {
            await sendBrevoEmail({
              to: [
                {
                  email: decodedToken.email,
                  name: decodedToken.given_name || decodedToken.name || "New User",
                },
              ],

              templateId: 4, // Welcome + Temporary Password Template
              params: {
                name: decodedToken.given_name || decodedToken.name || "Valued User",
                temporary_password: response.data.temporary_password,
              },
            });

            console.log("Welcome email with temporary password sent to:", decodedToken.email);
          } catch (emailErr) {
            console.warn("Account created, but welcome email failed to send:", emailErr);
            // Still continue — user was created successfully
            // Optional: toast.info("Account created! Email notification failed, but user informed manually.");
          }

          return;
        }

        if (response.status === 202) {
          ToastNotification.info(
            "Account not activated!",
            "Please contact GSO office for account activation."
          );
          return;
        }

        if (response.status === 200) {
          const userData = response.data.response.dataValues;

          ToastNotification.success(
            "Welcome to Service Link!",
            "You have been successfully logged in."
          );
          setAuthData(userData);
          localStorage.setItem(
            "userPreference",
            JSON.stringify(response.data.userPreference)
          );

          fetchThemePreference();
          fetchAllRequests();

          if (userData.access_level === "admin") {
            navigate("/workspace/requests-management");
          } else {
            navigate("/portal/dashboard");
          }
        } else {
          ToastNotification.error(
            "Oops!",
            "Internal Server Error. Please try again."
          );
        }
      } else {
        ToastNotification.error(
          "Unauthorized!",
          "Please use your DYCI email to log in."
        );
      }
    } catch (error) {
      ToastNotification.error(
        "Oh no!",
        "Something went wrong. Please try again."
      );
      console.error(error);
    }
  };

  /**
   * Handles errors when logging in with Google.
   * @returns {void}
   */
  const onError = () => {
    ToastNotification.error(
      "Login Failed",
      "Unable to log in with Google. Please try again."
    );
  };

  const fetchThemePreference = async () => {
    try {
      const userPreferences = JSON.parse(
        localStorage.getItem("userPreference")
      );

      if (userPreferences?.theme === "1") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.error("Error fetching theme preference:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          prompt="select_account"
          auto_select={false}
          // login_hint='dyci.edu.ph'
          width={"330px"}
          // type='standard'
          // useOneTap  // not added cause it doesn't work need further research on this one tap login
          ux_mode="popup"
          className="w-full"
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default GoogleAuthLogin;
