function getFormattedDate() {
    const now = new Date();

    const year = now.getFullYear(); 
    const month = String(now.getMonth() + 1).padStart(2, "0"); 
    const day = String(now.getDate()).padStart(2, "0"); 

    const hour = String(now.getHours()).padStart(2, "0"); 
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}_${month}_${day}_${hour}_${minute}_${second}`;

    return formattedDate;
}

export { getFormattedDate };
