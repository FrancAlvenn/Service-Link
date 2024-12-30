import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ToastNotification from '../../../utils/ToastNotification';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useEffect } from 'react';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleAuthLogin() {
    const { setAuthData } = useContext(AuthContext);
    const navigate = useNavigate();

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
                    ToastNotification.success('Welcome to Service Link!', 'You have been successfully logged in.');
                    setAuthData(response.data.response.dataValues);
                    navigate('/home');
                } else if (response.status === 201) {
                    ToastNotification.info('Oops!', 'Account not activated. Please contact the GSO office for account activation.');
                    navigate('/home');
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

    const onError = () => {
        ToastNotification.error('Login Failed', 'Unable to log in with Google. Please try again.');
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div>
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    // useOneTap  // not added cause it doenst work need further research on this one tap login
                    render={(renderProps) => (
                        <button
                            className="w-full flex items-center justify-between px-5 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            onClick={renderProps.onClick}
                            disabled={renderProps.disabled}
                        >
                            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" width="20" />
                            <p className="w-full text-center">Sign in with Google</p>
                        </button>
                    )}
                />
            </div>
        </GoogleOAuthProvider>
    );
}

export default GoogleAuthLogin;
