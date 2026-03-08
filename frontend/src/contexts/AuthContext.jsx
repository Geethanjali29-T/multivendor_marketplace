import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { api } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Firebase Google Auth Listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const profileData = await api.getUserProfileByEmail(firebaseUser.email);
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        username: firebaseUser.displayName || profileData.username || 'User',
                        role: profileData.role || 'BUYER',
                        isGoogleAuth: true
                    });
                } catch (error) {
                    console.error("Error fetching google user profile:", error);
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        username: firebaseUser.displayName || 'User',
                        role: 'BUYER',
                        isGoogleAuth: true
                    });
                }
                setTimeout(() => setLoading(false), 2000); // Enforce minimum loading screen time
            } else {
                // 2. JWT Local Storage Check (for manual auth bypass)
                const storedToken = localStorage.getItem('token');
                if (storedToken) {
                    try {
                        const storedUser = JSON.parse(localStorage.getItem('user'));
                        if (storedUser) {
                            setUser(storedUser);
                        }
                    } catch (e) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
                setTimeout(() => setLoading(false), 2000); // Enforce minimum loading time even for JWT
            }
        });

        return () => unsubscribe();
    }, []);

    const register = async (userData) => {
        return await api.register(userData);
    };

    const login = async (email, password) => {
        const response = await api.login(email, password);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        setUser(response.user);
        return response.user;
    };

    const loginWithGoogle = async () => {
        let result;
        try {
            result = await signInWithPopup(auth, googleProvider);
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                return null; // Handle cancellation gracefully
            }
            throw error; // Re-throw other errors
        }
        const fbUser = result.user;

        let userRole = 'buyer';
        try {
            await api.register({
                uid: fbUser.uid,
                email: fbUser.email,
                username: fbUser.displayName || 'User',
                role: 'buyer',
            });
            const profileData = await api.getUserProfileByEmail(fbUser.email);
            if (profileData && profileData.role) {
                userRole = profileData.role;
            }
        } catch (e) {
            console.log("User might already exist, fetching profile...");
            try {
                const profileData = await api.getUserProfileByEmail(fbUser.email);
                if (profileData && profileData.role) {
                    userRole = profileData.role;
                }
            } catch (innerErr) {
                console.error("Failed to fetch existing profile status:", innerErr);
            }
        }

        const newUserState = {
            uid: fbUser.uid,
            email: fbUser.email,
            username: fbUser.displayName || 'User',
            role: userRole,
            isGoogleAuth: true
        };

        setUser(newUserState);
        return newUserState;
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const logout = async () => {
        // Clear Firebase if it exists
        await signOut(auth);

        // Clear Local Storage for JWT
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, register, resetPassword, logout, loading }}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
