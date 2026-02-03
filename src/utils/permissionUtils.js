// src/utils/permissionUtils.js
export const checkPermission = (permissionName) => {
    // First try Redux
    const reduxState = store.getState();
    const reduxPermission = reduxState?.auth?.user?.permissions?.[permissionName];
    
    if (reduxPermission !== undefined) {
        return reduxPermission === 'Enabled';
    }
    
    // Fallback to sessionStorage
    return sessionStorage.getItem(permissionName) === 'Enabled';
};

// Then you can use it like:
import { checkPermission } from '../utils/permissionUtils';

const canDelete = checkPermission('delete_doctors');