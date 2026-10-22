export async function onRequestPost(context) {
    try {
        const { name, email, phone, location, service, propertyType, budget, timeline, message } = await context.request.json();
        
        // Cloudflare automatically pulls these securely from your environment variables [0, 1]
        const GOOGLE_WEB_APP_URL = context.env.GOOGLE_WEB_APP_URL;
        const SECRET_PASSWORD = context.env.SECRET_PASSWORD; 

        const payload = {
            name: name,
            email: email,
            phone: phone || '',
            location: location || '',
            service: service || '',
            propertyType: propertyType || '',
            budget: budget || '',
            timeline: timeline || '',
            message: message || '',
            token: SECRET_PASSWORD
        };

        // Cloudflare securely forwards the data on the backend
        const googleResponse = await fetch(GOOGLE_WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });

        const result = await googleResponse.json();

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ result: "error", message: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
