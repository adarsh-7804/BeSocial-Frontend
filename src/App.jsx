  import { Routes, Route } from "react-router-dom";
  import { ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

  import RegisterForm from "./components/auth/RegisterForm";
  import LoginForm from "./components/auth/LoginForm";
  import Feed from "./components/layout/Feed/Feed";
  import MainScreen from "./components/layout/MainScreen";
  import ForgotPassword from "./components/auth/ForgotPassword";
  import ResetPassword from "./components/auth/ResetPassword";
  import Profile from "./components/layout/Profile";
  import PublicRoute from "./Routes/PublicRoutes";
  import { useDispatch } from "react-redux";
  import { useEffect } from "react";
  import { getProfile } from "./features/userSlice";
  import ProtectedRoutes from "./Routes/ProtectedRoutes";
  import UserDatalist from "./components/layout/UserDatalist";
  import Setting from "./components/layout/Setting";
  import Refer from './components/layout/buttons/Refer';
  import CreatePost from "./components/layout/Feed/CreatePost";
  import Draft from "./components/layout/Draft";
  import ScheduledPostsList from "./components/layout/buttons/ScheduledPostsList";
  import SinglePost from "./components/layout/Feed/SinglePost";
  import ImageCropperModal from "./components/layout/ImageCropperModal";
  import Gallary from "./components/layout/Feed/Sidebar/Gallary";
  import HighlightDetail from "./components/layout/Highlights/HighlightDetail";
import TestChat from "./components/layout/buttons/TestChat";


  function App() {
    const dispatch = useDispatch();

    // useEffect(() => {
    //   dispatch(getProfile());
    // }, [dispatch]);

    useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

    return (
      <>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
          </Route>

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-pass" element={<ResetPassword />} />

          <Route element={<ProtectedRoutes />}>
            {/* <Route path="/home" element={<Feed />} /> */}
            <Route path="/main" element={<MainScreen />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/user-data" element={<UserDatalist />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/refer" element={<Refer /> } />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/draft" element={<Draft />} />
            <Route path="/media" element={<Gallary />} />
            <Route path="/highlight/:id" element={<HighlightDetail />} />
            <Route path="/scheduled-posts" element={<ScheduledPostsList />} />
            <Route path="/post/:id" element={<SinglePost />} />
            <Route path="/test-chat" element={<TestChat/>} />
          </Route>
        </Routes>
         
         

        <ToastContainer
          position="top-right"
          autoClose={3000}
          // theme="#A27457"
        />
      </>
    );
  }

  export default App;
