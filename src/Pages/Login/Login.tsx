import { useState } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { http } from "../../config/http";

import style from "./Login.module.css";

export function Login(){

    const AuthContext = useAuth();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [isRegistering, setIsRegistering] = useState<boolean>(false);

    const handleLogin = async () => {
        const loginResponse = await http.post('/user/login', {
            username,
            password
        })

        console.log(loginResponse.data);
        AuthContext.login(loginResponse.data.access_token);
        //redirect to home /
        window.location.href = "/";
    }

    const handleRegister = async () => {
        const registerResponse = await http.post('/user/register', {
            username,
            password
        })

        console.log(registerResponse.data);
    }

    return (
        <div className={style.loginContainer}>
            <h1>{isRegistering ? "Registrar" : "Login"}</h1>
            <input type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />

            {/* button */}
            <button onClick={isRegistering ? handleRegister : handleLogin}>
                {isRegistering ? "Registrar" : "Login"}
            </button>

            <p onClick={() => setIsRegistering(!isRegistering)} className={style.registerLink}>
                {isRegistering ? "Já tem uma conta? Faça Login" : "Ainda não tem uma conta? Criar conta"}
            </p>

        </div>
    )

    
}