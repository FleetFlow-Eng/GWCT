import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const ADMIN_EMAILS = ['anetowestfield@gmail.com', 'admin@fleetflow.services'];

export const logActivity = async (userEmail: string, category: string, target: string, action: string, details: string) => {
    if (!userEmail) return;
    try { await addDoc(collection(db, "activity_logs"), { user: userEmail, category, target, action, details, timestamp: serverTimestamp() }); } catch(e) { console.error(e); }
};

export const logHistory = async (busNumber: string, action: string, details: string, userEmail: string) => {
    if (!busNumber) return;
    try { 
        await addDoc(collection(db, "buses", busNumber, "history"), { action, details, user: userEmail, timestamp: serverTimestamp() }); 
        await logActivity(userEmail, 'BUS', `Bus #${busNumber}`, action, details);
    } catch (err) { console.error(err); }
};

export const formatTime = (ts: any) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleString() : 'Just now';

export const getBusSpecs = (num: string) => parseInt(num) > 1950 && parseInt(num) < 1960 ? { length: "30'" } : parseInt(num) < 1936 ? { length: "35'" } : { length: "40'" };

export const calculateDaysOOS = (start: string) => start ? Math.max(0, Math.ceil((new Date().getTime() - new Date(start).getTime()) / (1000 * 3600 * 24))) : 0;