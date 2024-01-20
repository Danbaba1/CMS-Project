import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDir = path.join(__dirname, '../public/uploads/');
export function isEmpty(obj) {
    for(let key in obj){
        if(Object.hasOwnProperty.bind(obj)(key)){
            return false;
        }
    }
    return true;   
};