import { useEffect } from "react";
import { useNavigate } from "react-router";
import { storeUserData } from "~/appwrite/auth";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      await storeUserData();
      navigate("/"); // go to homepage
    };
    run();
  }, []);

  return <p>Finishing sign in...</p>;
};

export default AuthCallback;
