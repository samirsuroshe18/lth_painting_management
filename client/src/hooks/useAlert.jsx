import { useState } from 'react';
import Alert from '../components/Alert';

export const useAlert = () => {
    const [alert, setAlert] = useState(null);

    const showAlert = (message, variant) => {
        setAlert({ message, variant });
        setTimeout(() => setAlert(null), 3000); 
    };

    const AlertComponent = () =>
        alert ? <Alert message={alert.message} variant={alert.variant} /> : null;

    return [AlertComponent, showAlert];
};


