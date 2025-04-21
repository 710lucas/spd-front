import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContextProvider";

export interface User {
    id : string;
    username : string;
}

export const AuthProvider = ({ children } : { children : React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try{
            const storedToken = localStorage.getItem("token");
            if(storedToken) {
                setToken(storedToken);
                decodeAndSetUser(storedToken);
            }
        } catch(err){
            logout()
        }
    }, [])

    useEffect(() => {
        console.log('user UEF', user)
    }, [user])

    const decodeAndSetUser = (token : string) => {
        const decodedPayload = jwtDecode<User>(token)
        console.log('decodedPayload', decodedPayload)
        setUser(decodedPayload);
        return decodedPayload
    }

    const login = (token : string) => {
        console.log(token)
        localStorage.setItem("token", token);
        setToken(token);
        decodeAndSetUser(token);
    }

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }

    const isAuthenticated = () => {

        const localStorageToken = localStorage.getItem("token");
        const localUser = decodeAndSetUser(localStorageToken || "");


        return localStorageToken !== null && localUser !== null;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}