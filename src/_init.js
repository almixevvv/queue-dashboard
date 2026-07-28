import Swal from "sweetalert2";

export function startLoader(curParams) {
    if (curParams == '') {
        Swal.fire({
            title: 'Invalid Url',
            text: 'URL tidak valid, silahkan coba lagi',
            icon: 'warning',
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.hideLoading()
            }
        })
    }
}

export async function fetchConfig() {
    try {
        const timestamp = new Date().getTime(); // Versi unik
        const response = await fetch('./config.json?version=' + timestamp);

        if (!response.ok) throw new Error('Failed to load config');

        const config = await response.json()

        return {
            statusCode: 200,
            data: config.EVENT_ID
        }
    } catch (error) {
        return {
            statusCode: 400,
            data: null
        }
    }
}