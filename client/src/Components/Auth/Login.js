import {Redirect} from "react-router-dom";
function useQuery() {
  return new URLSearchParams(window.location.search);
}

const Login = () => {
    const query = useQuery()
    localStorage.setItem("token", query.get("token"))

    return (
        <Redirect to={{
            pathname: '/'
        }}
        />
    )
}

export default Login;

