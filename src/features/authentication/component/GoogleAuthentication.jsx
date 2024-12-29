import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GoogleLogin } from 'react-google-login';
import ToastNotification from '../../../utils/ToastNotification';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;


function GoogleAuthLogin (){

    const { setAuthData } = useContext(AuthContext);

    const navigate = useNavigate();


    // useEffect(() => {
    //     const isGoogleLoggedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
    //     if (isGoogleLoggedIn) {
    //         navigate('/home'); // Redirect if already signed in
    //     }
    // }, [navigate]);

    const onSuccess = async (res) => {
        const email = res.profileObj.email;

        if(email.endsWith('@dyci.edu.ph')){
            await axios({
                method: 'post',
                url: '/auth/google_login',
                headers: { 'Access-Control-Allow-Origin': '*' },
                data: {
                    google_id: res.googleId,
                    email: res.profileObj.email,
                    first_name: res.profileObj.givenName,
                    last_name: res.profileObj.familyName
                }
            }).then((res) => {
                if(res.status === 200){
                    ToastNotification.success('Welcome to Service Link!', 'You have been successfully logged in.');

                    setAuthData(res.data.response.dataValues);
                    navigate('/home');
                }

                if(res.status === 201){
                    ToastNotification.info('Oops!', 'Account not activated, Please contact GSO office for account activation.');
                    navigate('/home');
                }

                if(res.status === 500){
                    ToastNotification.error('Oops!', 'Internal Server Error. Please try again.');
                }
            }).catch((error) => {
                ToastNotification.error('Oh no!', 'Something went wrong. Please try again.');
            });
            return;
        }
    };

    const onFailure = (res, error) => {
        console.log('Login failed: res:', res);
    };

    return (
        <div>
            <GoogleLogin
                render={renderProps => (
                    <button
                        className="w-full flex items-center justify-between px-5 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                        >
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" width="20" />
                        <p className='w-full text-center'>Sign in with Google</p>
                    </button>
                )}
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={false}
                hostedDomain='dyci.edu.ph'
                prompt='select_account'
            />
        </div>
    )
}


export default GoogleAuthLogin;