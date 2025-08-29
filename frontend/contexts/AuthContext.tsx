import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Verify token by making a request to a protected endpoint
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`
      );
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      // Token is invalid, remove it
      Cookies.remove("token");
      Cookies.remove("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        const { token, user: userData } = response.data.data;

        // Set token in axios defaults and cookie
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("user", JSON.stringify(userData), { expires: 7 });

        setUser(userData);
        toast.success("Login successful!");
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        userData
      );

      if (response.data.success) {
        const { token, user: newUser } = response.data.data;

        // Set token in axios defaults and cookie
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("user", JSON.stringify(newUser), { expires: 7 });

        setUser(newUser);
        toast.success("Registration successful!");
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    // Clear token and user data
    Cookies.remove("token");
    Cookies.remove("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);

    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
