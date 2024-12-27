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
    
                navigate('/home');
                setFormStatus('idle');
            }

            

        }).catch((error) =>{
            console.log(error);

            if (error.response && error.response.status === 401) {
                // Handle Unauthorized status code (invalid login credentials)
                ToastNotification.error('Oh no!', error.response.data);
            } else {
                // Handle other errors (network, server errors, etc.)
                ToastNotification.error('Oops!', 'Something went wrong. Please try again.');
            }
            setTimeout(() => {
                setFormStatus('idle');
            }, 3000);
        })

    }

    const handleShowPassword = useCallback(() => {
        setIsShowPassword((value) => !value);
    }, [isShowPassword]);

    useEffect(() => {
    setDebounceState(true);
    }, [userInputDebounce]);

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
                    <div>
                        <a href="#"
                            className="w-full flex items-center justify-between px-5 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <FontAwesomeIcon icon={"fa-brands fa-google"} className='size-4'/>
                            <p className='w-full text-center'>Sign in with Google</p>
                        </a>
                    </div>
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