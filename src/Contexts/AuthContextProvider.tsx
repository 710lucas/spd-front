import { createContext } from "react";
import { User } from "./AuthContext";

interface AuthContextType {
    user : User | null;
    token : string | null;
    login : (token : string) => void;
    logout : () => void;
    isAuthenticated : () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export default AuthContext;