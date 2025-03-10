import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ToastNotification from '../../../utils/ToastNotification';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useEffect } from 'react';
import { JobRequestsContext } from '../../request_management/context/JobRequestsContext';
import { PurchasingRequestsContext } from '../../request_management/context/PurchasingRequestsContext';
import { VehicleRequestsContext } from '../../request_management/context/VehicleRequestsContext';
import { VenueRequestsContext } from '../../request_management/context/VenueRequestsContext';

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
            const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
            const email = decodedToken.email;

            if (email.endsWith('@dyci.edu.ph')) {
                const response = await axios.post('/auth/google_login', {
                    google_id: decodedToken.sub,
                    email: decodedToken.email,
                    first_name: decodedToken.given_name,
                    last_name: decodedToken.family_name
                });

                if (response.status === 200) {

                    // This is for user login later
                    if (response.data.response.dataValues.reference_number.includes('DYCI')) {
                        console.log("User Login")
                    }

                    ToastNotification.success('Welcome to Service Link!', 'You have been successfully logged in.');
                    setAuthData(response.data.response.dataValues);
                    localStorage.setItem('userPreference', JSON.stringify(response.data.userPreference));

                    //fetch all request data
                    fetchAllRequests();

                    navigate('/workspace/requests-management');
                } else if (response.status === 201) {
                    ToastNotification.info('Oops!', 'Account not activated. Please contact the GSO office for account activation.');
                } else {
                    ToastNotification.error('Oops!', 'Internal Server Error. Please try again.');
                }
            } else {
                ToastNotification.error('Unauthorized!', 'Please use your DYCI email to log in.');
            }
        } catch (error) {
            ToastNotification.error('Oh no!', 'Something went wrong. Please try again.');
        }
    };

    /**
     * Handles errors when logging in with Google.
     * @returns {void}
     */
    const onError = () => {
        ToastNotification.error('Login Failed', 'Unable to log in with Google. Please try again.');
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div>
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    prompt= 'select_account'
                    auto_select={false}
                    // login_hint='dyci.edu.ph'
                    width={"350"}
                    // type='standard'
                    // useOneTap  // not added cause it doesn't work need further research on this one tap login
                    ux_mode='popup'
                />
            </div>
        </GoogleOAuthProvider>
    );
}

export default GoogleAuthLogin;
