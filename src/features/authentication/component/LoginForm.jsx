import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDebounce } from '../../../utils/useDebounce';
import AuthHeader from './AuthHeader';
import AuthFooter from './AuthFooter';
import validateEmail from '../utils/validateInput';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../../utils/ToastNotification';

import { gapi } from 'gapi-script';

import  GoogleAuthLogin  from './GoogleAuthentication';

/**
 * LoginForm component
 *
 * This component is used to render the login form.
 *
 * @returns {ReactElement} The login form component.
 */
function LoginForm() {

    const [value, setValue] = useState({email: '', password: ''});

    const emailRef = useRef();
    const passwordRef = useRef();

    const userInputDebounce = useDebounce(value, 1000);
    const [isShowPassword, setIsShowPassword] = useState(false);

    const [debounceState, setDebounceState] = useState(false);
    const [isFieldsDirty, setIsFieldsDirty] = useState(false);
    const [formStatus, setFormStatus] = useState('idle');

    const [isEmailValid, setIsEmailValid] = useState();
    const [emailError, setEmailError] = useState('');

    const { setAuthData } = useContext(AuthContext);

    const navigate = useNavigate();

    /**
     * Handles the change event of the form inputs.
     *
     * Sets the debounce state to false and the form as dirty.
     * Updates the value state with the new input value.
     * Validates the email input and sets the `isEmailValid` state and `emailError` state accordingly.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event of the form input.
     */
    const handleOnChange = (event) => {
        setDebounceState(false);
        setIsFieldsDirty(true);

        // set the value in the state
        setValue({ ...value, [event.target.name]: event.target.value });

        //validate the email
        if (event.target.name === 'email') {
           if(event.target.value != '' && !validateEmail(event.target.value)){
               setEmailError('Please enter a valid email address');
               setIsEmailValid(false);
           }else{
               setEmailError('');
               setIsEmailValid(true);
           }
        }

    };

/**
 * Handles the form submission for logging in.
 *
 * Prevents the default form submission behavior and sets the form status to 'loading'.
 * Sends a POST request to the '/auth/login' endpoint with the current form values.
 * If the login is successful (status 200), it updates the AuthContext with the user's data,
 * navigates to the requests management page, and sets the form status to 'idle'.
 * If the response status is 404, it displays an info toast notification regarding account activation.
 * Handles various error responses, including unauthorized access (status 401)
 * and other network/server errors, displaying appropriate toast notifications.
 *
 * @param {Event} e - The form submission event.
 * @returns {void}
 */

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setFormStatus('loading');

        await axios({
            method: 'post',
            url: '/auth/login',
            data: value,
            headers: { 'Access-Control-Allow-Origin': '*' },
        }).then((res) => {
            if(res.status === 200){
                setAuthData(res.data);
                localStorage.setItem('userPreference', JSON.stringify(res.data.userPreference));

                if(res.data.reference_number.includes('DYCI')){
                    console.log("User Login")
                }

                navigate('/workspace/requests-management');
                setFormStatus('idle');
            }

            if(res.status === 404){
                ToastNotification.info('Oops!', 'Account not activated, Please contact GSO office for account activation.');
            }

        }).catch((error) =>{
            console.log(error);
            setTimeout(() => {
                setFormStatus('idle');
            }, 3000);

            if (error.response && error.response.status === 401) {
                // Handle Unauthorized status code (invalid login credentials)
                ToastNotification.info('Oops!', error.response.data);
                return;
            }

            if (error.response && error.response.status === 404) {
                // Handle Unauthorized status code (invalid login credentials)
                ToastNotification.error('Oh no!', error.response.data);
                return;
            }else{
                // Handle other errors (network, server errors, etc.)
                ToastNotification.error('Oops!', 'Something went wrong. Please try again.');
                console.error('Error logging in:', error);
            }
        })

    }

    const handleShowPassword = useCallback(() => {
        setIsShowPassword((value) => !value);
    }, [isShowPassword]);

    useEffect(() => {
    setDebounceState(true);
    }, [userInputDebounce]);


    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    /**
     * Initializes the Google API client with the client ID and an empty scope
     */
    useEffect(() => {
    function start() {
        gapi.client.init({
        clientId: clientId,
        scope: "",
        });
    }
    gapi.load("client:auth2", start);
    }, []);

    //get the access token from the user
    //var accessToken = gapi.auth.getToken().access_token;

    return (
        <div className='flex flex-col min-h-[94vh]'>
        <AuthHeader/>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md flex-grow">
            <div className="bg-white py-8 px-2  sm:rounded-lg sm:px-10" >

                <div>
                    <h1 className='text-3xl font-medium text-center mb-4'>Welcome to Service Link</h1>
                    <p className='text-sm text-center text-gray-500'>To get started, please sign in</p>
                </div>


                <div className="mt-5">
                    <GoogleAuthLogin/>
                </div>

                <div className="mt-5">

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="text-xs sm:text-sm px-4 bg-white text-gray-500">
                            Or
                        </span>
                    </div>
                </div>

                {/* Login Form */}

                <form className="space-y-4 mt-5" action="#" onSubmit={handleSubmit}>
                    <div>
                        <label for="email" className="block text-xs sm:text-sm text-gray-500">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input id="email" name="email" type="email" autoComplete="email" required
                                className="text-xs sm:text-sm appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                                placeholder="Enter your email address"
                                value={value.email}
                                onChange={handleOnChange}
                                ref={emailRef}>
                            </input>
                        </div>
                        {debounceState && isFieldsDirty && value.email == '' && (<div className='text-xs text-red-500'>This field is required</div>)}
                        {isEmailValid == false && (<span className='text-xs text-red-500'>{emailError}</span>)}
                    </div>

                    {value.email && (<>
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm text-gray-500">
                            Password
                        </label>
                        <div className="mt-1">
                            <input id="password" name="password" type={isShowPassword ? "text" : "password"} autoComplete="current-password" required
                            className="text-xs sm:text-sm appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 pr-10"
                            placeholder="Enter your password"
                            value={value.password}
                            onChange={handleOnChange}
                            ref={passwordRef}
                            />
                            <FontAwesomeIcon
                            icon={isShowPassword ? 'fa-eye-slash' : 'fa-eye'}
                            className="absolute right-3 top-9 text-gray-500 cursor-pointer"
                            onClick={handleShowPassword}
                            />
                        </div>
                        {debounceState && isFieldsDirty && value.password == '' && (<span className='text-xs text-red-500'>This field is required</span>)}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember_me" name="remember_me" type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"></input>
                            <label for="remember_me" className="ml-2 block text-xs sm:text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    </>)}
                    <div>
                        <button type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={formStatus === 'loading'}
                            onClick={
                                () => {
                                    if(formStatus !== 'loading'){
                                        return;
                                    }

                                    if(value.email && value.password){
                                        handleSubmit();
                                    }else{
                                        setIsFieldsDirty(true);
                                        if(value.email == ''){
                                            emailRef.current.focus();
                                        }else if(value.password == ''){
                                            passwordRef.current.focus();
                                        }
                                    }


                                    console.log("Form submitted!");
                                }
                            }
                            >
                            {formStatus === 'idle' ? 'Sign In' : 'Loading'}
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
        <AuthFooter/>
    </div>)
}

export default LoginForm