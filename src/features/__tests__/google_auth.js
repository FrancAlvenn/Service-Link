import { GoogleLogin } from 'react-google-login';



const clientId = '410507371066-qjt1mjmb30cled9d6cfp4619060f8g60.apps.googleusercontent.com';
const clientSecret = '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';


function GoogleAuthLogin (){

    const onSuccess = (res) => {
        console.log('Login Success: currentUser:', res.profileObj);
    };

    const onFailure = (res) => {
        console.log('Login failed: res:', res);
    };

    return (
        <div>
            <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
            />
        </div>
    )
}


export default GoogleAuthLogin;